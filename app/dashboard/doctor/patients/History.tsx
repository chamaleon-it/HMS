import { fDateandTime } from "@/lib/fDateAndTime";
import useSWR from "swr";
import { Data } from "./PatientTable";
import { useRouter } from "next/navigation";

const History = ({
  setHistory,
  history,
}: {
  setHistory: (v: null | Data) => void;
  history?: Data;
}) => {
  const router = useRouter();
  const { data } = useSWR<{
    message: string;
    data: {
      _id: string;
      patient: Data;
      doctor: {
        _id: string;
        name: string;
        specialization: string;
      };
      method: string;
      date: Date;
    }[];
  }>(history?._id ? `/appointments/patient/${history._id}` : null);
  return (
    <div className="fixed inset-0 z-40">
      <div
        className="absolute inset-0 bg-black/30"
        onClick={() => setHistory(null)}
      />
      <div className="absolute right-0 top-0 h-full w-full max-w-lg bg-white shadow-2xl p-6 overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">History — {history?.name}</h2>
          <button
            onClick={() => setHistory(null)}
            className="text-gray-500 hover:text-gray-900"
          >
            ✕
          </button>
        </div>
        <ol className="relative border-s border-gray-200 ps-5 space-y-6">
          <li>
            <div className="absolute -start-1.5 mt-1.5 w-3 h-3 rounded-full bg-gray-300" />
            <div className="text-sm">
              <span className="font-medium">{data?.data?.length} visit(s)</span>
            </div>
          </li>

          {data?.data?.map((e) => {
            return (
              <li key={e?._id} className="">
                <div className="absolute -start-1.5 mt-1.5 w-3 h-3 rounded-full bg-gray-300" />

                <div className=" grid gap-1">
                  <div className="flex items-start gap-2 text-sm">
                    <div className="min-w-0">
                      <div className="font-medium text-gray-900">
                        {fDateandTime(e?.date)}
                      </div>
                      <div className="text-gray-600">
                        <span className="truncate">
                          {e?.doctor?.name}
                          {e?.doctor?.specialization
                            ? ` — ${e?.doctor?.specialization}`
                            : ""}
                        </span>
                      </div>
                    </div>
                  </div>
                  {e?.method ? (
                    <div className="">
                      <span className="rounded-full border px-2 py-0.5 text-xs text-gray-700">
                        {e?.method}
                      </span>
                    </div>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ol>
        <button
          onClick={() => {
            router.push(`/dashboard/doctor/patients/${history?._id}`);
          }}
          className="mt-6 w-full h-11 rounded-xl bg-black text-white"
        >
          Open full history
        </button>
      </div>
    </div>
  );
};

export default History;
