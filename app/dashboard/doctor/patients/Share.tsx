import { useState } from "react";
import { Data, FilterSelect, Segmented } from "./PatientTable";

const Share = ({
  setShare,
  share,
}: {
  setShare: (v: null | Data) => void;
  share: Data | null;
}) => {
  const [shareTarget, setShareTarget] = useState("");
  const [shareVia, setShareVia] = useState("");
  const [shareDoctor, setShareDoctor] = useState<string>("");
  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-4">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={() => setShare(null)}
      />
      <div className="relative w-full max-w-md bg-white rounded-2xl p-5 shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold">Share patient</h3>
          <button
            onClick={() => setShare(null)}
            className="text-gray-500 hover:text-gray-900"
          >
            ✕
          </button>
        </div>
        <div className="text-sm text-gray-500">{share?.name}</div>

        <div className="mt-4 space-y-4">
          <div>
            <div className="text-sm font-medium mb-2">Share to</div>
            <Segmented
              options={[
                { label: "Doctor", value: "Doctor" as const },
                { label: "Pharmacy", value: "Pharmacy" as const },
                { label: "Lab", value: "Lab" as const },
              ]}
              value={shareTarget}
              onChange={(v) => setShareTarget(v)}
            />
          </div>

          {shareTarget === "Doctor" && (
            <div>
              <div className="text-sm font-medium mb-2">Select doctor</div>

              <div className="w-full">
                <FilterSelect
                  className="w-full"
                  value={shareDoctor}
                  onChange={(v) => setShareDoctor(v)}
                  placeholder="Select doctor"
                  searchable
                  options={[{ label: "All doctors", value: "All" }]}
                />
              </div>
            </div>
          )}

          <div>
            <div className="text-sm font-medium mb-2">Via</div>
            <Segmented
              options={[
                { label: "Copy link", value: "Copy link" as const },
                { label: "Email", value: "Email" as const },
                { label: "WhatsApp", value: "WhatsApp" as const },
              ]}
              value={shareVia}
              onChange={(v) => setShareVia(v)}
            />
          </div>

          <div className="grid gap-2">
            {shareVia === "Email" && (
              <input
                placeholder="Enter email"
                className="h-11 px-3 rounded-xl ring-1 ring-gray-200"
              />
            )}
            {shareVia === "WhatsApp" && (
              <input
                placeholder="Enter WhatsApp number"
                className="h-11 px-3 rounded-xl ring-1 ring-gray-200"
              />
            )}
          </div>

          <button
            onClick={() => {}}
            className="w-full h-11 rounded-xl bg-black text-white"
          >
            Share
          </button>
        </div>
      </div>
    </div>
  );
};

export default Share;
