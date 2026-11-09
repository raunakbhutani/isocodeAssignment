import { describe, expect, it } from "vitest";
import { canReassignLead, selectRoundRobinConsultant } from "../lib/lead-assignment.js";

const consultants = [
  { id: "consultant-c" },
  { id: "consultant-a" },
  { id: "consultant-b" },
];

const lead = {
  assignedConsultantId: "consultant-a",
  requestedShowroomId: "showroom-1",
  modelId: "model-h",
};

const target = {
  id: "consultant-b",
  isActive: true,
  showroomId: "showroom-1",
  modelIds: ["model-h"],
};

describe("lead assignment", () => {
  it("rotates deterministically through eligible consultants", () => {
    expect(selectRoundRobinConsultant(consultants, 1).id).toBe("consultant-a");
    expect(selectRoundRobinConsultant(consultants, 2).id).toBe("consultant-b");
    expect(selectRoundRobinConsultant(consultants, 3).id).toBe("consultant-c");
    expect(selectRoundRobinConsultant(consultants, 4).id).toBe("consultant-a");
  });

  it("returns no assignee when the eligibility query has no matches", () => {
    expect(selectRoundRobinConsultant([], 1)).toBeNull();
  });

  it("allows admins to reassign only to an active consultant eligible for the lead", () => {
    expect(canReassignLead({ role: "ADMIN" }, lead, target)).toBe(true);
    expect(canReassignLead(
      { role: "ADMIN" },
      lead,
      { ...target, showroomId: "showroom-2" },
    )).toBe(false);
    expect(canReassignLead(
      { role: "ADMIN" },
      lead,
      { ...target, modelIds: ["model-c"] },
    )).toBe(false);
    expect(canReassignLead({ role: "ADMIN" }, lead, { ...target, isActive: false })).toBe(false);
  });

  it("allows consultants to reassign only their own lead within the showroom", () => {
    expect(canReassignLead({
      role: "CONSULTANT",
      consultantId: "consultant-a",
      showroomId: "showroom-1",
    }, lead, target)).toBe(true);
    expect(canReassignLead({
      role: "CONSULTANT",
      consultantId: "consultant-c",
      showroomId: "showroom-1",
    }, lead, target)).toBe(false);
    expect(canReassignLead({
      role: "CONSULTANT",
      consultantId: "consultant-a",
      showroomId: "showroom-2",
    }, lead, target)).toBe(false);
  });
});
