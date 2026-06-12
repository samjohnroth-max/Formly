import { Check, Clock, X, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

type StepStatus = "done" | "failed" | "skipped" | "pending";

interface TimelineStep {
  label: string;
  status: StepStatus;
  detail?: string;
}

interface Props {
  lead: {
    createdAt: Date | string;
    routingStatus: string;
    routingError: string | null;
    firstName: string | null;
    email: string | null;
    lat: number | null;
    lng?: number | null;
    stMatchedCustomer: boolean;
    stCustomerId: string | null;
    stJobId: string | null;
    stLeadId: string | null;
    stTaskId: string | null;
    emailStatus: string;
    capiStatus: string;
  };
}

function deriveSteps(lead: Props["lead"]): TimelineStep[] {
  const success = lead.routingStatus === "SUCCESS";
  const failed = lead.routingStatus === "FAILED";

  return [
    {
      label: "Webhook received",
      status: "done",
      detail: formatDistanceToNow(new Date(lead.createdAt), { addSuffix: true }),
    },
    {
      label: "Lead data fetched from Meta",
      status: lead.firstName !== null || lead.email !== null ? "done" : failed ? "failed" : "pending",
    },
    {
      label: "Campaign identified",
      status: lead.stCustomerId || lead.stJobId || lead.stLeadId ? "done" : failed ? "failed" : "pending",
    },
    {
      label: "Fields parsed",
      status: lead.firstName !== null ? "done" : failed ? "failed" : "pending",
      detail: lead.firstName ? `${lead.firstName} ${lead.email ?? ""}`.trim() : undefined,
    },
    {
      label: "Geocoded from zip",
      status: lead.lat !== null ? "done" : "skipped",
      detail: lead.lat ? `${lead.lat.toFixed(4)}, ${lead.lng ?? ""}` : undefined,
    },
    {
      label: lead.stMatchedCustomer ? "Existing ST customer matched" : "New ST customer created",
      status: lead.stCustomerId ? "done" : failed ? "failed" : "pending",
      detail: lead.stCustomerId ? `Customer ID: ${lead.stCustomerId}` : undefined,
    },
    {
      label: "ST record created",
      status: (lead.stJobId || lead.stLeadId || lead.stTaskId) ? "done" : failed ? "failed" : "pending",
      detail: lead.stJobId
        ? `Job ${lead.stJobId}`
        : lead.stLeadId
        ? `Lead ${lead.stLeadId}`
        : lead.stTaskId
        ? `Task ${lead.stTaskId}`
        : undefined,
    },
    {
      label: "Confirmation email",
      status: (lead.emailStatus === "SENT" ? "done"
        : lead.emailStatus === "FAILED" ? "failed"
        : lead.emailStatus === "SKIPPED" ? "skipped"
        : "pending") as StepStatus,
    },
    {
      label: "Meta CAPI event fired",
      status: (lead.capiStatus === "SENT" ? "done"
        : lead.capiStatus === "FAILED" ? "failed"
        : lead.capiStatus === "SKIPPED" ? "skipped"
        : "pending") as StepStatus,
    },
    {
      label: "Routing complete",
      status: success ? "done" : failed ? "failed" : "pending",
    },
  ];
}

export function LeadTimeline({ lead }: Props) {
  const steps = deriveSteps(lead);

  return (
    <ol className="space-y-0">
      {steps.map((step, i) => {
        const isLast = i === steps.length - 1;
        return (
          <li key={i} className="flex gap-3">
            {/* Icon + connector line */}
            <div className="flex flex-col items-center">
              <StepIcon status={step.status} />
              {!isLast && <div className={cn("w-px flex-1 my-1", step.status === "done" ? "bg-green-300" : "bg-gray-200")} />}
            </div>
            {/* Content */}
            <div className={cn("pb-4 min-w-0", isLast && "pb-0")}>
              <p className={cn(
                "text-sm font-medium",
                step.status === "done" ? "text-gray-900" :
                step.status === "failed" ? "text-red-600" :
                step.status === "skipped" ? "text-gray-400" :
                "text-gray-400"
              )}>
                {step.label}
              </p>
              {step.detail && (
                <p className="mt-0.5 text-xs text-gray-500">{step.detail}</p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

function StepIcon({ status }: { status: StepStatus }) {
  const base = "flex size-6 shrink-0 items-center justify-center rounded-full";
  if (status === "done") return <span className={cn(base, "bg-green-500")}><Check className="size-3.5 text-white" /></span>;
  if (status === "failed") return <span className={cn(base, "bg-red-500")}><X className="size-3.5 text-white" /></span>;
  if (status === "skipped") return <span className={cn(base, "bg-gray-200")}><Minus className="size-3 text-gray-400" /></span>;
  return <span className={cn(base, "bg-gray-100 border-2 border-gray-200")}><Clock className="size-3 text-gray-400" /></span>;
}
