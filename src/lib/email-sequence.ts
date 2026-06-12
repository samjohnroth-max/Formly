import type { TriggerType } from "@prisma/client";

export const SEQUENCE_DEFAULTS: {
  stepNumber: number;
  triggerType: TriggerType;
  triggerDelay: number;
  label: string;
}[] = [
  { stepNumber: 1, triggerType: "IMMEDIATE",         triggerDelay: 0,   label: "Immediately on lead" },
  { stepNumber: 2, triggerType: "HOURS_AFTER",       triggerDelay: 2,   label: "2 hours if not booked" },
  { stepNumber: 3, triggerType: "HOURS_AFTER",       triggerDelay: 24,  label: "24 hours if not booked" },
  { stepNumber: 4, triggerType: "BOOKING_CONFIRMED", triggerDelay: 0,   label: "On booking confirmed" },
  { stepNumber: 5, triggerType: "JOB_COMPLETE",      triggerDelay: 168, label: "7 days after job complete" },
];
