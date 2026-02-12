import { Button } from "@/components/ui/button";
import React, { useCallback, useState } from "react";
import { FilterType, ItemType } from "./interface";
import toast from "react-hot-toast";
import api from "@/lib/axios";
import PharmacyHeader from "../components/PharmacyHeader";

interface Props {
  handleAdd: () => void;
  items?: ItemType[];
  lowStockCount?: number;
  setFilter: React.Dispatch<React.SetStateAction<FilterType>>;
  lowStockItemsView: boolean;
}

export default function Header({ handleAdd, items, lowStockCount, setFilter, lowStockItemsView }: Props) {
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
                setDownloadProgress(
                  Math.round((ev.loaded * 100) / (ev.total || 1))
                );
              }
            },
          });

          // Build a downloadable file from the blob
          const blob = new Blob([resp.data], {
            type: resp.headers["content-type"] || "text/csv",
          });

          const filename =
            resp.data.filename ||
            `inventory_${new Date().toISOString().slice(0, 10)}.csv`;

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
    <PharmacyHeader
      title="Inventory Management"
      subtitle="Manage your pharmacy stock and inventory"
    >
      <Button className="bg-linear-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-md transition-all hover:shadow-lg active:scale-95 gap-2" onClick={handleAdd}>
        + Add New Item
      </Button>
      <Button variant="outline" onClick={exportCsv} disabled={downloadingCsv}>
        {downloadingCsv ? `Exporting (${downloadProgress}%)` : "Export CSV"}
      </Button>
      <LowStockButton lowStockThreshold={lowStockCount} setFilter={setFilter} lowStockItemsView={lowStockItemsView} />
    </PharmacyHeader>
  );
}

function LowStockButton({ lowStockThreshold, setFilter, lowStockItemsView }: { lowStockThreshold?: number, setFilter: React.Dispatch<React.SetStateAction<FilterType>>, lowStockItemsView: boolean }) {
  return (
    <Button className={`relative cursor-pointer outline-none ${lowStockItemsView ? "bg-red-700 hover:bg-red-700 text-white" : "bg-red-600 hover:bg-red-600 text-white"}`} onClick={() => setFilter((prev) => ({ ...prev, lowStockItemsView: !prev.lowStockItemsView }))}>
      Low Stock Alert
      <span className="ml-2 inline-flex items-center justify-center text-[10px] leading-none font-semibold bg-white text-red-600 rounded-full h-5 min-w-[20px] px-1 border border-red-300">
        {lowStockThreshold}
      </span>
    </Button>
  );
}
