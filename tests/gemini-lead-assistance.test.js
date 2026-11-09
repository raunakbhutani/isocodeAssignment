import { describe, expect, it, vi } from "vitest";
import {
  generateLeadAssistance,
  validateGeminiLeadResponse,
} from "../lib/gemini-lead-assistance.js";

const validModelOutput = {
  customerRequirements: "Needs an automatic vehicle for city use.",
  importantQuestionsOrConcerns: ["Would like a test drive."],
  conciseSummary: "Buyer is interested in an automatic vehicle and wants to test drive.",
  firstReplyDraft: "Hello, thank you for sharing your requirements for Model H ZX Automatic. We can arrange a test drive. What day works best?",
};

const leadContext = {
  interestedModelAndVariant: "Model H ZX Automatic",
  budget: "₹15,00,000",
  purchaseTimeline: "Within one month",
  preferredShowroom: "Assumed Showroom One",
  buyerMessage: "I would like to try the automatic version.",
};

function providerResponse(output) {
  return new Response(JSON.stringify({
    candidates: [{
      content: { parts: [{ text: JSON.stringify(output) }] },
    }],
  }), { status: 200 });
}

describe("Gemini lead assistance response validation", () => {
  it("accepts a complete, safe structured summary and first reply", () => {
    expect(validateGeminiLeadResponse(validModelOutput, {
      vehicleOfInterest: "Model H ZX Automatic",
    })).toEqual({
      success: true,
      data: validModelOutput,
    });
  });

  it("rejects missing fields, oversized content, and malformed concerns", () => {
    expect(validateGeminiLeadResponse({ ...validModelOutput, conciseSummary: "" }).success).toBe(false);
    expect(validateGeminiLeadResponse({
      ...validModelOutput,
      firstReplyDraft: "A".repeat(1801),
    }).success).toBe(false);
    expect(validateGeminiLeadResponse({
      ...validModelOutput,
      importantQuestionsOrConcerns: ["x".repeat(241)],
    }).success).toBe(false);
  });

  it("rejects AI replies that mention discounts or quote prices", () => {
    for (const firstReplyDraft of [
      "I can offer you a discount.",
      "The price is ₹12,45,000.",
      "The quote is 12 lakh.",
      "We can save you 10 percent.",
      "The amount is 12,45,000.",
    ]) {
      expect(validateGeminiLeadResponse({ ...validModelOutput, firstReplyDraft }).success).toBe(false);
    }
    expect(validateGeminiLeadResponse({
      ...validModelOutput,
      firstReplyDraft: "Hello, thanks for sharing. Let us discuss the vehicle soon.",
    }, { vehicleOfInterest: "Model H ZX Automatic" }).success).toBe(false);
  });
});

describe("Gemini request failure handling", () => {
  it("uses only relevant lead details and validates a successful provider response", async () => {
    const fetchImpl = vi.fn(async () => providerResponse(validModelOutput));
    const result = await generateLeadAssistance({
      ...leadContext,
      customerName: "Buyer Name",
      email: "buyer@example.invalid",
      phone: "0000000000",
      buyerMessage: "Please reply to buyer@example.invalid or call +91 98765 43210.",
    }, { apiKey: "test-key", fetchImpl });

    expect(result).toMatchObject({ ok: true, status: "GENERATED", model: "gemini-2.5-flash" });
    const requestBody = JSON.parse(fetchImpl.mock.calls[0][1].body);
    const sentPrompt = requestBody.contents[0].parts[0].text;
    expect(sentPrompt).toContain(leadContext.interestedModelAndVariant);
    expect(sentPrompt).not.toContain("buyer@example.invalid");
    expect(sentPrompt).not.toContain("Buyer Name");
    expect(sentPrompt).not.toContain("0000000000");
    expect(sentPrompt).not.toContain("buyer@example.invalid");
    expect(sentPrompt).not.toContain("98765 43210");
    expect(fetchImpl.mock.calls[0][1].headers["x-goog-api-key"]).toBe("test-key");
  });

  it("returns an unavailable status when the API key is missing without calling Gemini", async () => {
    const fetchImpl = vi.fn();
    const result = await generateLeadAssistance(leadContext, { apiKey: "", fetchImpl });

    expect(result).toMatchObject({ ok: false, status: "UNAVAILABLE", reason: "MISSING_API_KEY" });
    expect(result.message).toMatch(/manually/i);
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("handles invalid JSON and empty provider content", async () => {
    const invalidJsonFetch = vi.fn(async () => new Response(JSON.stringify({
      candidates: [{ content: { parts: [{ text: "{not json}" }] } }],
    }), { status: 200 }));
    const emptyFetch = vi.fn(async () => new Response(JSON.stringify({
      candidates: [{ content: { parts: [] } }],
    }), { status: 200 }));

    await expect(generateLeadAssistance(leadContext, {
      apiKey: "test-key",
      fetchImpl: invalidJsonFetch,
    })).resolves.toMatchObject({ ok: false, reason: "INVALID_RESPONSE" });
    await expect(generateLeadAssistance(leadContext, {
      apiKey: "test-key",
      fetchImpl: emptyFetch,
    })).resolves.toMatchObject({ ok: false, reason: "EMPTY_RESPONSE" });
  });

  it("handles API limits and timeouts without throwing", async () => {
    const limitedFetch = vi.fn(async () => new Response("", { status: 429 }));
    const unavailableFetch = vi.fn(async () => new Response("", { status: 503 }));
    const timeoutFetch = vi.fn((_url, { signal }) => new Promise((_resolve, reject) => {
      signal.addEventListener("abort", () => {
        reject(Object.assign(new Error("aborted"), { name: "AbortError" }));
      }, { once: true });
    }));

    await expect(generateLeadAssistance(leadContext, {
      apiKey: "test-key",
      fetchImpl: limitedFetch,
    })).resolves.toMatchObject({ ok: false, reason: "RATE_LIMITED" });
    await expect(generateLeadAssistance(leadContext, {
      apiKey: "test-key",
      fetchImpl: unavailableFetch,
    })).resolves.toMatchObject({ ok: false, reason: "UNAVAILABLE" });
    await expect(generateLeadAssistance(leadContext, {
      apiKey: "test-key",
      fetchImpl: timeoutFetch,
      timeoutMs: 1,
    })).resolves.toMatchObject({ ok: false, reason: "TIMEOUT" });
  });
});
