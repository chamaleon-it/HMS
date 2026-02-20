import { useAuth } from "@/auth/context/auth-context";
import { fAge, fDateandTime, fTime } from "@/lib/fDateAndTime";
import React from "react";
import ViewResultModal from "./ViewResultModal";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import api from "@/lib/axios";
import { Bell, Clock } from "lucide-react";
import ResultUpdate from "./ResultUpdate";

interface PropsTypes {
  status: "Pending" | "In Progress" | "Completed" | "Flagged";
  mutate: () => void;
  REPORT: {
    _id: string;
    patient: {
      _id: string;
      name: string;
      phoneNumber: string;
      email: string;
      gender: string;
      dateOfBirth: Date;
      conditions: string[];
      blood: string;
      allergies: string;
      address: string;
      notes: string;
      createdBy: string;
      status: string;
      mrn: string;
      createdAt: Date;
      updatedAt: Date;
    };
    doctor: {
      _id: string;
      name: string;
      specialization: string | null;
    };
    lab: {
      _id: string;
      name: string;
      specialization: string | null;
    };
    date: Date;
    priority: string;
    test: {
      name: {
        code: string;
        name: string;
        type: string;
        unit?: string;
        estimatedTime?: number;
        min?: number;
        max?: number;
        womenMin?: number;
        womenMax?: number;
        childMin?: number;
        childMax?: number;
        nbMin?: number;
        nbMax?: number;
        _id: string;
        panels: {
          _id: string;
          name: string;
          status: string;
          user: string;
        }[];
      };
      value?: string | number;
      _id: string;
    }[];
    sampleType: string;
    panels: string[];
    sampleCollectedAt: Date | null;
    status: string;
    createdAt: Date;
    updatedAt: Date;
  }[];
}

export default function LabTable({ REPORT, status, mutate }: PropsTypes) {
  const { user } = useAuth();
  return (
    <div className="rounded-2xl   bg-white ring-1 ring-gray-200 shadow-sm overflow-hidden">
      <table className="w-full whitespace-nowrap  overflow-scroll">
        <thead className="bg-slate-700 hover:bg-slate-700">
          <tr className="bg-slate-700 hover:bg-slate-700 border-b border-gray-200 text-xs uppercase tracking-wider text-white font-medium ">
            <th className="w-10 text-left px-3 py-2">
              <Checkbox />
            </th>
            {headerCell("No.")}
            {headerCell("Patient")}
            {headerCell("Test")}
            {headerCell("Created At")}
            {status !== "Pending" && headerCell("Sample Collected")}
            {headerCell("Doctor")}
            {headerCell("Status")}
            {status === "In Progress" && headerCell("Estimated Time")}
            {headerCell("Actions", "right")}
          </tr>
        </thead>
        <tbody>
          {REPORT.filter((r) => r.status === status)
            .sort((a, b) => {
              if (status !== "In Progress") return 0;
              const getTargetTime = (item: typeof a) => {
                if (!item.sampleCollectedAt) return Infinity;
                const times = item.test
                  .map((t) => t.name?.estimatedTime)
                  .filter((time): time is number => typeof time === "number");
                const maxTime = times.length > 0 ? Math.max(...times) : 0;
                return (
                  new Date(item.sampleCollectedAt).getTime() + maxTime * 60000
                );
              };
              return getTargetTime(a) - getTargetTime(b);
            })
            .map((r, idx) => {
              const maxEstimatedTime = Math.max(
                ...r.test
                  .map((t) => t.name?.estimatedTime as number)
                  .filter((time) => typeof time === "number"), 0
              );

              const expired = status === "In Progress" ? (r.sampleCollectedAt
                ? Date.now() >=
                new Date(r.sampleCollectedAt).getTime() +
                maxEstimatedTime * 60_000
                : false) : false;



              return (
                <tr
                  key={r._id}
                  className={`group border-b border-gray-100 transition-colors duration-200 last:border-0 ${!expired ?
                    idx % 2 === 0
                      ? "bg-white hover:bg-white/60"
                      : "bg-slate-100 hover:bg-slate-100/60" : "bg-orange-200/70 hover:bg-orange-200/70"
                    } 

                     `}
                >
                  <td className="px-3 py-2">
                    <Checkbox />
                  </td>
                  <td className="px-3 py-2 text-sm text-gray-500">
                    {String(idx + 1).padStart(2, "0")}
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex flex-col">
                      <span className="font-semibold text-gray-900 text-sm">
                        {r?.patient?.name}
                      </span>
                      <span className="text-xs text-gray-500 mt-0.5">
                        <span className="font-medium text-gray-600">
                          {r?.patient?.mrn}
                        </span>{" "}
                        • {fAge(r?.patient?.dateOfBirth)} yrs • {r?.patient?.gender}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-2 text-sm text-gray-700">
                    <div className="flex flex-col gap-2">
                      {r?.panels?.map((p) => (
                        <div
                          key={p}
                          className="flex items-center gap-1 h-5 font-medium text-sm"
                        >
                          {p}
                        </div>
                      ))}
                      {r?.test
                        ?.filter(
                          (t) =>
                            !t.name.panels
                              .map((p) => r.panels.includes(p.name))
                              .includes(true)
                        )
                        .map((e) => (
                          <div
                            key={e._id}
                            className="flex items-center gap-1 h-5 font-medium text-sm"
                          >
                            {e.name.name}
                          </div>
                        ))}
                    </div>
                  </td>

                  <td className="px-3 py-2 text-sm text-gray-500">
                    {fDateandTime(r.createdAt)}
                  </td>

                  {status !== "Pending" && (
                    <td className="px-3 py-2 text-sm text-gray-500">
                      {r.sampleCollectedAt
                        ? fDateandTime(r.sampleCollectedAt)
                        : "-"}
                    </td>
                  )}

                  <td className="px-3 py-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      {r.doctor._id !== user?._id ? (
                        <span
                          className="truncate max-w-[100px]"
                          title={r.doctor.name}
                        >
                          Dr. {r.doctor.name}
                        </span>
                      ) : (
                        <span>Direct</span>
                      )}
                    </div>
                  </td>

                  <td className="px-3 py-2">
                    <Chip label={r.status} tone={statusTone(r.status)} />
                  </td>
                  {status === "In Progress" && (
                    <td>
                      {r.sampleCollectedAt ? (
                        <Countdown
                          targetDate={
                            maxEstimatedTime ?
                              new Date(
                                new Date(r.sampleCollectedAt).getTime() +
                                maxEstimatedTime * 60000
                              ) : undefined
                          }
                        />
                      ) : (
                        "-"
                      )}
                    </td>
                  )}
                  <td className="px-3 py-2 text-right">
                    <div className="flex items-center justify-end gap-2  transition-opacity duration-200">
                      {r.status === "In Progress" && expired && <ResultUpdate mutate={mutate} r={r} />}
                      {r.status === "Pending" && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="bg-white text-gray-600 hover:bg-gray-100"
                          onClick={async () => {
                            try {
                              await toast.promise(
                                api.post(
                                  `lab/report/sample_collected/${r._id}`
                                ),
                                {
                                  loading: "Processing...",
                                  success: "Sample Collected",
                                  error: "Failed to collect sample",
                                }
                              );
                              mutate();
                            } catch (error) {
                              toast.error(
                                `Failed to collect sample : ${error}`
                              );
                            }
                          }}
                        >
                          Sample Collected
                        </Button>
                      )}

                      {r.status !== "Pending" && <ViewResultModal r={r} />}
                      <Button
                        variant={"outline"}
                        size="sm"
                        className="bg-white text-gray-600 hover:bg-gray-100"
                        onClick={async () => {
                          try {
                            await toast.promise(
                              api.delete(`lab/report/${r._id}`),
                              {
                                loading: "Processing...",
                                success: "Deleted",
                                error: "Failed to delete",
                              }
                            );
                            mutate();
                          } catch (error) {
                            toast.error(`Failed to delete : ${error}`);
                          }
                        }}
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
        </tbody>
      </table>
    </div>
  );
}

function headerCell(
  label: string,
  align: "left" | "center" | "right" = "left"
) {
  return <th className={`text-${align} px-3 py-2`}>{label}</th>;
}

const statusTone = (s: string): "green" | "gray" | "red" | "blue" | "amber" =>
  s === "Completed"
    ? "green"
    : s === "Pending"
      ? "gray"
      : s === "In Progress"
        ? "amber"
        : "red";

// ----- Small UI helpers -----
const Chip: React.FC<{
  label: string;
  tone?: "green" | "gray" | "red" | "blue" | "amber";
}> = ({ label, tone = "gray" }) => {
  const tones: Record<string, string> = {
    green: "bg-emerald-50 text-emerald-700 ring-emerald-200/50",
    gray: "bg-slate-50 text-slate-600 ring-slate-200/50",
    red: "bg-rose-50 text-rose-700 ring-rose-200/50",
    blue: "bg-sky-50 text-sky-700 ring-sky-200/50",
    amber: "bg-amber-50 text-amber-700 ring-amber-200/50",
  };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ring-1 ring-inset ${tones[tone]}`}
    >
      <span
        className={`mr-1.5 h-1.5 w-1.5 rounded-full ${tone === "gray"
          ? "bg-slate-400"
          : tone === "green"
            ? "bg-emerald-500"
            : tone === "amber"
              ? "bg-amber-500"
              : tone === "blue"
                ? "bg-sky-500"
                : "bg-rose-500"
          }`}
      ></span>
      {label}
    </span>
  );
};

const Countdown = ({ targetDate }: { targetDate?: Date }) => {


  const [timeLeft, setTimeLeft] = React.useState<string>("-");
  const [statusColor, setStatusColor] = React.useState<
    "red" | "amber" | "slate"
  >("slate");

  React.useEffect(() => {
    if (targetDate) {
      const updateTimer = () => {
        const now = new Date().getTime();
        const distance = new Date(targetDate).getTime() - now;

        if (distance < 0) {
          setTimeLeft("00:00:00");
          setStatusColor("red");
          return;
        }

        const fiveMinutes = 5 * 60 * 1000;
        const tenMinutes = 10 * 60 * 1000;

        if (distance < fiveMinutes) {
          setStatusColor("red");
        } else if (distance < tenMinutes) {
          setStatusColor("amber");
        } else {
          setStatusColor("slate");
        }

        const hours = Math.floor(
          (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        );
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        setTimeLeft(
          `${hours.toString().padStart(2, "0")}:${minutes
            .toString()
            .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
        );

      };

      updateTimer();
      const interval = setInterval(updateTimer, 1000);

      return () => clearInterval(interval);
    }
  }, [targetDate]);

  const colors = {
    red: "bg-rose-50 text-rose-700 ring-rose-200 shadow-sm",
    amber: "bg-amber-50 text-amber-700 ring-amber-200 shadow-sm",
    slate: "bg-slate-50 text-slate-600 ring-slate-200 shadow-sm",
  };

  if (!targetDate || timeLeft === "00:00:00") {
    return (
      <div className="flex items-center justify-center w-full text-sm  text-gray-600">
        Ready
      </div>
    );
  }

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ring-1 ring-inset ${colors[statusColor]} transition-all duration-300 font-mono tabular-nums min-w-[90px] justify-center`}
    >
      <Clock
        className={`h-3.5 w-3.5 ${statusColor === "red" ? "animate-pulse" : ""
          }`}
      />
      <span className="tracking-tight">{timeLeft}</span>
    </div>
  );
};
