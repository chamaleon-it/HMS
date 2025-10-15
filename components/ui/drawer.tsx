import { cn } from "@/lib/utils";
import { Button } from "./button";

function Drawer({
  open,
  onClose,
  children,
  title,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children?: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "fixed inset-y-0 right-0 z-50 w-full max-w-xl bg-white shadow-xl transform transition-transform",
        open ? "translate-x-0" : "translate-x-full"
      )}
    >
      <div className="p-4 border-b border-zinc-200 flex items-center justify-between">
        <div className="text-base font-semibold">{title}</div>
        <Button variant="ghost" onClick={onClose}>
          Close
        </Button>
      </div>
      <div className="p-4 overflow-y-auto h-[calc(100vh-64px)] bg-white">
        {children}
      </div>
    </div>
  );
}
export default Drawer;
