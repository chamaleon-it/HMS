import React from "react";
import { AppointmentType } from "./interface";
import { fTime } from "@/lib/fDateAndTime";
import toast from "react-hot-toast";
import api from "@/lib/axios";
import { useRouter } from "next/navigation";
import { DoorOpen, Trash2 } from "lucide-react";

// Utility to format visit number into readable label
function ordinal(n: number) {
  const s = ["th", "st", "nd", "rd"],
    v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

function VisitBadge({ count }: { count: number }) {
  let label = "";
  let colorClass = "";
  let dotColor = "";

  if (count === 1) {
    label = "First Visit";
    colorClass = "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200";
    dotColor = "bg-emerald-500";
  } else if (count === 2) {
    label = "Second Visit";
    colorClass = "bg-sky-50 text-sky-700 ring-1 ring-sky-200";
    dotColor = "bg-sky-500";
  } else if (count === 3) {
    label = "Third Visit";
    colorClass = "bg-amber-50 text-amber-700 ring-1 ring-amber-200";
    dotColor = "bg-amber-500";
  } else if (count === 4) {
    label = "Fourth Visit";
    colorClass = "bg-purple-50 text-purple-700 ring-1 ring-purple-200";
    dotColor = "bg-purple-500";
  } else {
    label = `${ordinal(count)} Visit`;
    colorClass = "bg-gray-50 text-gray-700 ring-1 ring-gray-200";
    dotColor = "bg-gray-400";
  }

  return (
    <span
      className={`px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap inline-flex items-center gap-1 shadow-sm ${colorClass}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
      {label}
    </span>
  );
}

function ActionButton({
  children,
  variant = "default",
  onClick,
  ring = false,
}: {
  children: React.ReactElement;
  variant?: "default" | "outline" | "danger";
  onClick?: () => void;
  ring?: boolean;
}) {
  const base =
    "px-4 py-2 rounded-xl text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2";
  const variants = {
    default: "bg-black text-white hover:opacity-90 focus:ring-black",
    outline:
      "border border-gray-300 text-gray-800 bg-white hover:bg-gray-50 focus:ring-gray-300",
    danger:
      "border border-rose-300 text-rose-600 bg-white hover:bg-rose-50 focus:ring-rose-300",
  };
  return (
    <button
      className={`${base} ${
        variants[variant]
      } flex gap-0.5 items-center justify-center cursor-pointer ${
        ring &&
        "!bg-green-600 !text-white !ring-2 !ring-green-400 shadow-lg animate-pulse"
      }`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

export function PatientCard({
  a,
  mutate,
}: {
  a: AppointmentType;
  mutate: () => void;
}) {
  const updateStatus = async (id: string, status: string) => {
    try {
      await toast.promise(
        api.patch(`/appointments/update_status/${id}`, { status }),
        {
          loading: "Please wait we are updating status",
          error: ({ response }) => response.data.message,
          success: ({ data }) => data.message,
        }
      );
      mutate();
    } catch (error) {
      console.log(error);
    }
  };

  // const [ring, setRing] = useState(false);
  const router = useRouter();

  return (
    <div className="w-full rounded-2xl border border-gray-200 bg-white shadow-sm p-4 md:p-5">
      {new Date(a.date) > new Date() ? (
        <div className="absolute z-10 -left-[100px] top-0 bottom-0 w-px bg-gray-300" />
      ) : (
        <div className="absolute z-10 -left-[100px] top-0 bottom-0 w-px bg-blue-700" />
      )}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-5 h-5"
            >
              <path d="M12 12c2.761 0 5-2.239 5-5s-2.239-5-5-5-5 2.239-5 5 2.239 5 5 5zm0 2c-4.418 0-8 2.239-8 5v1h16v-1c0-2.761-3.582-5-8-5z" />
            </svg>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-gray-900 font-semibold leading-tight">
                {a.patient.name}
              </h4>
              <VisitBadge count={a.visitCount} />
            </div>
            <div className="text-sm text-gray-500">{a.status}</div>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap justify-end">
          {
            <>
              {/* <ActionButton onClick={() => setRing(true)}>
                <>
                  <Megaphone className="h-4 w-4 mr-2" />
                  Call In
                </>
              </ActionButton> */}
              <ActionButton
                // ring={ring}
                variant="outline"
                onClick={() => {
                  router.push(`/dashboard/doctor/consulting/${a._id}`);
                }}
              >
                <>
                  <DoorOpen className="h-4 w-4 mr-2" />
                  Start Consult
                </>
              </ActionButton>
              <ActionButton
                variant="danger"
                onClick={() => {
                  updateStatus(a._id, "Not show");
                }}
              >
                <>
                  <Trash2 className="h-4 w-4" />
                  Remove
                </>
              </ActionButton>
            </>
          }
          <div className="text-sm text-gray-500 ml-2 w-20 text-right">
            {fTime(a.date)}
          </div>
        </div>
      </div>
    </div>
  );
}
