import { useAuth } from "@/auth/context/auth-context";
import { fAge, fDateandTime } from "@/lib/fDateAndTime";
import React from "react";
import ViewResultModal from "./ViewResultModal";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import api from "@/lib/axios";
import { Clock, Flag, FlagOff, Play, Printer, RotateCcw, Trash2, X } from "lucide-react";
import ResultUpdate from "./ResultUpdate";
import ReportCard from "./ReportCard";
import SampleCollectionModal from "./SampleCollectionModal";
import ResetTimerModal from "./ResetTimerModal";
import EditTest from "./EditTest";
import RepeatTest from "./RepeatTest";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import useGetPanels from "@/data/useGetPanels";
import ReportCardModern from "./ReportCardModern";

const CountdownToast = ({ t, onUndo }: { t: any; onUndo: () => void }) => {
  const [timeLeft, setTimeLeft] = React.useState(5);

  React.useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  return (
    <div className="flex items-center justify-between w-full gap-4">
      <span className="text-sm font-medium text-slate-700">Deleting report in {timeLeft}s...</span>
      <button
        onClick={onUndo}
        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-md text-xs font-semibold transition-colors"
      >
        Undo
      </button>
    </div>
  );
};

interface PropsTypes {
  status: "Upcoming" | "Sample Collected" | "Waiting For Result" | "Completed" | "Flagged" | "Deleted";
  mutate: () => void;
  autoGenerateSampleId?: boolean;
  REPORT: {
    _id: string;
    mrn: number;
    sampleId: string;
    extraTime: number;
    testStartedAt: Date | null;
    isFlagged: boolean;
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
        range: {
          name: string;
          min: number | null | undefined;
          max: number | null | undefined;
          fromAge: number | null | undefined;
          toAge: number | null | undefined;
          gender: "Both" | "Male" | "Female";
          dateType: "Year" | "Month" | "Day";

        }[],
        note: string
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
    technician?: string;
    createdAt: Date;
    updatedAt: Date;
  }[];
}

export default function LabTable({ REPORT, status, mutate, autoGenerateSampleId }: PropsTypes) {
  const { user } = useAuth();
  const { panels } = useGetPanels();
  const [printReport, setPrintReport] = React.useState<any | null>(null);

  const handlePrint = (report: any) => {
    setPrintReport(report);
    setTimeout(() => {
      window.print();
      setPrintReport(null);
    }, 100);
  };

  return (
    <div className="rounded-2xl   bg-white ring-1 ring-gray-200 shadow-sm overflow-x-scroll">
      <table className="w-full whitespace-nowrap  overflow-scroll">
        <thead className="bg-slate-700 hover:bg-slate-700">
          <tr className="bg-slate-700 hover:bg-slate-700 border-b border-gray-200 text-xs uppercase tracking-wider text-white font-medium ">
            {headerCell("SL No.")}
            {headerCell("Report No.")}
            {headerCell("Patient")}
            {headerCell("Test")}
            {status === "Upcoming" && headerCell("Scheduled Date")}
            {status !== "Upcoming" && headerCell("Sample Id")}
            {headerCell("Created At")}
            {status === "Completed" && headerCell("Collected At")}
            {status === "Completed" && headerCell("Started At")}
            {status === "Sample Collected" && headerCell("Sample Collected")}
            {status === "Completed" && headerCell("Test Reported At")}
            {headerCell("Doctor")}
            {/* {headerCell("Status")} */}
            {/* {status === "Completed" && headerCell("Collected Time")} */}
            {status === "Waiting For Result" && headerCell("Estimated Time")}
            {headerCell("Actions", "right")}
          </tr>
        </thead>
        <tbody>
          {REPORT
            .sort((a, b) => {
              const isAUrgent = a.priority === "Urgent";
              const isBUrgent = b.priority === "Urgent";

              if (isAUrgent && !isBUrgent) return -1;
              if (!isAUrgent && isBUrgent) return 1;

              // Existing sort logic by target time for Waiting For Result
              if (status === "Waiting For Result") {
                const getTargetTime = (item: typeof a) => {
                  if (!item.testStartedAt) return Infinity;
                  const times = item.test
                    .map((t) => t.name?.estimatedTime)
                    .filter((time): time is number => typeof time === "number");
                  const maxTime = times.length > 0 ? Math.max(...times) : 0;
                  return (
                    new Date(item.testStartedAt).getTime() + maxTime * 60000 + (item.extraTime || 0) * 60000
                  );
                };
                return getTargetTime(a) - getTargetTime(b);
              }

              // Chronological order for others (oldest first as per 'chronological order')
              const dateA = status === "Upcoming" ? new Date(a.date).getTime() : new Date(a.createdAt).getTime();
              const dateB = status === "Upcoming" ? new Date(b.date).getTime() : new Date(b.createdAt).getTime();
              return dateA - dateB;
            })
            .map((r, idx) => {
              const maxEstimatedTime = Math.max(
                ...r.test
                  .map((t) => t.name?.estimatedTime as number)
                  .filter((time) => typeof time === "number"), 0
              );

              const expired = status === "Waiting For Result" ? (r.testStartedAt
                ? Date.now() >=
                new Date(r.testStartedAt).getTime() +
                maxEstimatedTime * 60_000 + (r.extraTime || 0) * 60_000
                : false) : false;


              return (
                <tr
                  key={r._id}
                  className={`group transition-colors duration-200 last:border-0 relative ${expired && r.priority === "Urgent"
                    ? "bg-orange-100 hover:bg-orange-200/70 border-b-2 border-emerald-500"
                    : expired
                      ? "bg-green-100/80 hover:bg-green-200/60 border-b border-gray-100"
                      : r.priority === "Urgent"
                        ? "bg-orange-100 hover:bg-orange-200/70 border-b-2 border-emerald-500"
                        : idx % 2 === 0
                          ? "bg-white hover:bg-white/60 border-b border-gray-100"
                          : "bg-slate-100 hover:bg-slate-100/60 border-b border-gray-100"
                    }`}
                >
                  <td className="px-3 py-2 text-sm text-gray-500">
                    {String(idx + 1).padStart(2, "0")}
                  </td>
                  <td className="px-3 py-2 text-sm text-gray-500">
                    {String(r.mrn).padStart(4, "0")}
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
                          (t) => {
                            const selectedPanels = panels.filter(p => r.panels?.includes(p.name))
                            const panelTests = selectedPanels.flatMap(e => e.tests || []).map((e: any) => e._id)
                            return !panelTests.includes(t.name?._id)
                          }
                        )

                        .map((e) => (
                          <div
                            key={e._id}
                            className="flex items-center gap-1 h-5 font-medium text-sm"
                          >
                            {e.name?.name}
                          </div>
                        ))}
                    </div>
                  </td>

                  {status === "Upcoming" && <td className="px-3 py-2 text-sm text-gray-500">
                    {fDateandTime(r.date)}
                  </td>}

                  {status !== "Upcoming" && (
                    <td className="px-3 py-2 text-sm text-gray-500">
                      {r.sampleId}
                    </td>
                  )}

                  <td className="px-3 py-2 text-sm text-gray-500">
                    {fDateandTime(r.createdAt)}
                  </td>

                  {status === "Completed" && (
                    <td className="px-3 py-2 text-sm text-gray-500">
                      {r.sampleCollectedAt ? fDateandTime(r.sampleCollectedAt) : "-"}
                    </td>
                  )}

                  {status === "Completed" && <td className="px-3 py-2 text-sm text-gray-500">
                    {r.testStartedAt
                      ? fDateandTime(r.testStartedAt)
                      : "-"}
                  </td>}

                  {status === "Sample Collected" && (
                    <td className="px-3 py-2 text-sm text-gray-500">
                      {r.sampleCollectedAt
                        ? fDateandTime(r.sampleCollectedAt)
                        : "-"}
                    </td>
                  )}


                  {status === "Completed" && (
                    <td className="px-3 py-2 text-sm text-gray-500">
                      {r.sampleCollectedAt
                        ? fDateandTime(r.sampleCollectedAt)
                        : "-"}
                    </td>
                  )}

                  <td className="px-3 py-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      {r?.doctor?._id ? (
                        <span
                          className="truncate max-w-25"
                          title={r.doctor.name}
                        >
                          Dr. {r.doctor.name}
                        </span>
                      ) : (
                        <span>Self</span>
                      )}
                    </div>
                  </td>

                  {/* <td className="px-3 py-2">
                    <Chip label={r.status} tone={statusTone(r.status)} />
                  </td> */}
                  {status === "Waiting For Result" && (
                    <td>
                      {r.testStartedAt ? (
                        <Countdown
                          targetDate={
                            maxEstimatedTime ?
                              new Date(
                                new Date(r.testStartedAt).getTime() +
                                (maxEstimatedTime + (r.extraTime || 0)) * 60000
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
                      {status === "Upcoming" && (
                        <SampleCollectionModal
                          reportId={r._id}
                          patientName={r.patient?.name}
                          mutate={mutate}
                          autoGenerateSampleId={autoGenerateSampleId}
                        />
                      )}

                      {
                        status === "Sample Collected" && <Button
                          size="sm"
                          className="h-8 bg-linear-to-br from-indigo-500 to-fuchsia-500 hover:from-indigo-600 hover:to-fuchsia-600 text-white shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-1.5 px-4 font-semibold rounded-lg"
                          onClick={async () => {
                            try {
                              await toast.promise(
                                api.post(
                                  `lab/report/start_test/${r._id}`
                                ),
                                {
                                  loading: "Processing...",
                                  success: "Test Started",
                                  error: "Failed to start test",
                                }
                              );
                              mutate();
                            } catch (error) {
                              toast.error(
                                `Failed to start test : ${error}`
                              );
                            }
                          }}
                        >
                          <Play className="h-3.5 w-3.5 fill-current" />
                          Start Test
                        </Button>
                      }

                      {
                        status === "Waiting For Result" && (
                          <ResetTimerModal
                            reportId={r._id}
                            patientName={r.patient?.name}
                            mutate={mutate}
                          />
                        )
                      }

                      {status === "Waiting For Result" && <ResultUpdate mutate={mutate} r={r} buttonText={"Ready"} handlePrint={handlePrint} />}
                      {status === "Waiting For Result" && <ResultUpdate mutate={mutate} r={r} buttonText={"Completed"} handlePrint={handlePrint} />}
                      {status === "Completed" && <ResultUpdate mutate={mutate} r={r} buttonText={"Update"} handlePrint={handlePrint} />}

                      {
                        (status === "Completed" || status === "Sample Collected" || status === "Waiting For Result") && r.isFlagged === false && <Button
                          variant={"outline"}
                          size="sm"
                          className="h-8 bg-white text-rose-600 border-rose-200 hover:bg-rose-50 hover:text-rose-700 gap-1.5 text-xs font-medium"
                          onClick={async () => {
                            try {
                              await toast.promise(
                                api.post(`lab/report/mark_as_flagged/${r._id}`),
                                {
                                  loading: "Processing...",
                                  success: "Marked As Flagged",
                                  error: "Failed to mark as flagged",
                                }
                              );
                              mutate();
                            } catch (error) {
                              toast.error(`Failed to mark as flagged : ${error}`);
                            }
                          }}
                        >
                          Flag <Flag className="h-3.5 w-3.5" />
                        </Button>
                      }

                      {
                        r.isFlagged && <Button
                          variant={"outline"}
                          size="sm"
                          className="bg-white text-emerald-600 border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 gap-1.5 h-8 text-xs font-medium"
                          onClick={async () => {
                            try {
                              await toast.promise(
                                api.post(`lab/report/mark_as_unflagged/${r._id}`),
                                {
                                  loading: "Processing...",
                                  success: "Marked As Unflagged",
                                  error: "Failed to mark as unflagged",
                                }
                              );
                              mutate();
                            } catch (error) {
                              toast.error(`Failed to mark as unflagged : ${error}`);
                            }
                          }}
                        >
                          Unflag <FlagOff className="h-3.5 w-3.5" />
                        </Button>
                      }



                      {status === "Completed" && <Button
                        variant={"outline"}
                        size="sm"
                        className="gap-2 h-8 text-xs text-indigo-700 border-indigo-200 hover:bg-indigo-50 hover:text-indigo-800 bg-white"
                        onClick={() => handlePrint(r)}
                      >
                        <Printer className="h-3.5 w-3.5" />
                        Report
                      </Button>}

                      {(status === "Completed" || status === "Flagged") && <ViewResultModal r={r} />}

                      {status === "Flagged" && <ResultUpdate mutate={mutate} r={r} buttonText={"Update"} handlePrint={handlePrint} />}
                      {status === "Flagged" && <RepeatTest report={r} mutate={mutate} />}
                      {status === "Flagged" && <Button
                        variant={"outline"}
                        size="sm"
                        className="gap-2 h-8 text-xs text-indigo-700 border-indigo-200 hover:bg-indigo-50 hover:text-indigo-800 bg-white"
                        onClick={() => {

                        }}
                      >
                        <X className="h-3.5 w-3.5" />
                        Cancel
                      </Button>}

                      {status === "Upcoming" && <EditTest report={r} mutate={mutate} />}

                      {status !== "Deleted" && <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant={"outline"}
                            size="sm"
                            className="h-8 bg-white text-rose-600 hover:bg-rose-50 hover:text-rose-700 border-rose-100"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete the lab report for{" "}
                              <span className="font-bold text-slate-900">{r.patient?.name}</span>.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-rose-600 hover:bg-rose-700 text-white"
                              onClick={() => {
                                const toastId = toast(
                                  (t) => (
                                    <CountdownToast
                                      t={t}
                                      onUndo={() => {
                                        toast.dismiss(t.id);
                                        clearTimeout(timeoutId);
                                        toast.success("Deletion cancelled");
                                      }}
                                    />
                                  ),
                                  { duration: 5000 }
                                );

                                const timeoutId = setTimeout(async () => {
                                  try {
                                    toast.dismiss(toastId);
                                    await api.delete(`lab/report/${r._id}`);
                                    mutate();
                                    toast.success("Deleted successfully");
                                  } catch (error) {
                                    toast.dismiss(toastId);
                                    toast.error(`Failed to delete : ${error}`);
                                  }
                                }, 5000);
                              }}
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>}
                      {status === "Deleted" && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant={"outline"} size={"icon"}>
                              <RotateCcw className="h-3.5 w-3.5" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Recover Lab Report?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to recover the lab report for{" "}
                                <span className="font-bold text-slate-900">
                                  {r.patient?.name}
                                </span>
                                ? This will move it back to its previous status.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-indigo-600 hover:bg-indigo-700 text-white"
                                onClick={async () => {
                                  try {
                                    await toast.promise(
                                      api.post(`lab/report/recover/${r._id}`),
                                      {
                                        loading: "Processing...",
                                        success: "Recovered",
                                        error: "Failed to recover",
                                      }
                                    );
                                    mutate();
                                  } catch (error) {
                                    toast.error(`Failed to recover : ${error}`);
                                  }
                                }}
                              >
                                Recover
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}

                    </div>
                  </td>
                </tr>
              );
            })}
        </tbody>
      </table>
      {printReport && <ReportCardModern report={printReport} panels={panels} />}
    </div>
  );
}

function headerCell(
  label: string,
  align: "left" | "center" | "right" = "left"
) {
  return <th className={`text-${align} px-3 py-2`}>{label}</th>;
}




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
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ring-1 ring-inset ${colors[statusColor]} transition-all duration-300 font-mono tabular-nums min-w-22.5 justify-center`}
    >
      <Clock
        className={`h-3.5 w-3.5 ${statusColor === "red" ? "animate-pulse" : ""
          }`}
      />
      <span className="tracking-tight">{timeLeft}</span>
    </div>
  );
};
