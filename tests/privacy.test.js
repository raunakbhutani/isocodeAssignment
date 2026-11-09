import { describe, expect, it } from "vitest";
import { translateBuyerText } from "../lib/buyer-language.js";
import { maskRegistrationNumber } from "../lib/privacy.js";

describe("registration privacy", () => {
  it("reveals only the final four alphanumeric characters", () => {
    expect(maskRegistrationNumber("UP 32 AB 1234")).toBe("******1234");
    expect(maskRegistrationNumber("AB12")).toBe("AB12");
    expect(maskRegistrationNumber("")).toBe("");
    expect(maskRegistrationNumber(null)).toBe("");
  });
});

describe("buyer language", () => {
  it("translates supported buyer navigation and form labels to Hindi", () => {
    expect(translateBuyerText("New cars", "hi")).toBe("नई कारें");
    expect(translateBuyerText("Full name", "hi")).toBe("पूरा नाम");
    expect(translateBuyerText("New cars", "en")).toBe("New cars");
  });
});
