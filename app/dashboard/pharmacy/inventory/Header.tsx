import { Button } from "@/components/ui/button";
import React, { useCallback, useState } from "react";
import { ItemType } from "./interface";
import toast from "react-hot-toast";
import api from "@/lib/axios";

interface Props {
  handleAdd: () => void;
  items?: ItemType[];
}

export default function Header({ handleAdd, items }: Props) {
const [downloadingCsv, setDownloadingCsv] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0); // optional

  const exportCsv = useCallback(async () => {
    const controller = new AbortController(); // optional: let you cancel later if needed

    try {
      setDownloadingCsv(true);

      // Wrap the whole download + save process in the promise passed to toast.promise
      await toast.promise(
        (async () => {
          // ask axios for a blob so we can create a file
          const resp = await api.get("/pharmacy/items/export-csv", {
            responseType: "blob",
            signal: controller.signal,
            onDownloadProgress: (ev) => {
              if (ev.lengthComputable) {
                setDownloadProgress(Math.round((ev.loaded * 100) / (ev.total || 1)));
              }
            },
          });

          // Build a downloadable file from the blob
          const blob = new Blob([resp.data], {
            type: resp.headers["content-type"] || "text/csv",
          });

          const filename = resp.data.filename ||`inventory_${new Date().toISOString().slice(0, 10)}.csv`;

          // Create object URL + simulate anchor click
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = filename;
          document.body.appendChild(a);
          a.click();
          a.remove();
          window.URL.revokeObjectURL(url);

          return resp; // resolves the toast.promise
        })(),
        {
          loading: "Downloading inventory CSV file...!",
          success: () => "Download completed",
          error: (err) => {
            const msg =
              err?.response?.data?.message || err?.message || "Download failed";
            return msg;
          },
        }
      );
    } catch (err) {
      // distinguish abort vs other errors if desired
    
        console.error("CSV export error:", err);
      
    } finally {
      setDownloadingCsv(false);
      setDownloadProgress(0);
    }
  }, []);
  

  return (
    <div className="flex justify-between items-center">
      <h1 className="text-2xl font-bold text-purple-700">
        Inventory Management
      </h1>
      <div className="flex gap-2">
        <Button className="bg-purple-600 text-white" onClick={handleAdd}>
          + Add New Item
        </Button>
        <Button variant="outline" onClick={exportCsv} disabled={downloadingCsv}>{downloadingCsv ? `Exporting (${downloadProgress}%)` : "Export CSV"}</Button>
        <LowStockButton items={items} />
      </div>
    </div>
  );
}

function LowStockButton({ items }: { items?: ItemType[] }) {
  const lowCount = items?.filter(
    (it) => it.quantity === 0 || it.quantity < 20
  ).length;
  return (
    <Button variant="destructive" className="relative">
      Low Stock Alert
      <span className="ml-2 inline-flex items-center justify-center text-[10px] leading-none font-semibold bg-white text-red-600 rounded-full h-5 min-w-[20px] px-1 border border-red-300">
        {lowCount}
      </span>
    </Button>
  );
}
