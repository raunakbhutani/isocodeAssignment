export function selectRoundRobinConsultant(consultants, rotationCount) {
  if (!consultants.length) return null;
  const sorted = [...consultants].sort((first, second) => first.id.localeCompare(second.id));
  const count = Number.isSafeInteger(rotationCount) && rotationCount > 0 ? rotationCount : 1;
  return sorted[(count - 1) % sorted.length];
}

export function canReassignLead(actor, lead, target) {
  if (!actor || !lead || !target || !target.isActive) return false;
  if (lead.requestedShowroomId && lead.requestedShowroomId !== target.showroomId) return false;
  if (lead.modelId && !target.modelIds.includes(lead.modelId)) return false;

  if (actor.role === "ADMIN") return true;
  return actor.role === "CONSULTANT" &&
    actor.consultantId === lead.assignedConsultantId &&
    actor.showroomId === target.showroomId;
}
