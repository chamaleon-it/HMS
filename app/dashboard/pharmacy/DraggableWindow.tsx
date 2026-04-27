import { motion, useDragControls } from 'framer-motion';
import { X, Minus, Maximize2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface Props {
  id: string;
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  onMinimize: () => void;
  onFocus: () => void;
  zIndex: number;
  position: { x: number; y: number };
  onPositionChange: (pos: { x: number; y: number }) => void;
  isActive?: boolean;
  minimized?: boolean;
  className?: string;
}

export const DraggableWindow: React.FC<Props> = ({
  id, title, children, onClose, onMinimize, onFocus, zIndex, position, onPositionChange, isActive, minimized, className
}) => {
  const dragControls = useDragControls();

  return (
    <motion.div
      drag
      dragControls={dragControls}
      dragListener={false}
      dragMomentum={false}
      initial={false}
      style={{ 
        zIndex, 
        position: 'fixed', 
        top: 0, 
        left: 0,
        x: position.x,
        y: position.y
      }}
      onPointerDown={() => {
        if (!isActive) onFocus();
      }}
      onDragEnd={(e, info) => {
        onPositionChange({ x: position.x + info.offset.x, y: position.y + info.offset.y });
      }}
      className={cn(
        "bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col pointer-events-auto",
        isActive ? "ring-2 ring-indigo-500/20 border-indigo-200" : "",
        minimized ? "h-12 w-64" : "w-[90vw] max-w-5xl",
        className
      )}
    >
      {/* Header / Drag Handle */}
      <div 
        className="bg-slate-50 border-b border-slate-200 px-4 py-2 flex items-center justify-between cursor-move select-none shrink-0"
        onPointerDown={(e) => dragControls.start(e)}
      >
        <div className="flex items-center gap-2 overflow-hidden">
          <div className={cn("w-2 h-2 rounded-full shrink-0", isActive ? "bg-indigo-500" : "bg-slate-300")} />
          <span className="text-sm font-semibold text-slate-700 truncate">{title}</span>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-slate-200" onClick={(e) => { e.stopPropagation(); onMinimize(); }}>
            {minimized ? <Maximize2 className="h-3.5 w-3.5" /> : <Minus className="h-3.5 w-3.5" />}
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-rose-50 hover:text-rose-600" onClick={(e) => { e.stopPropagation(); onClose(); }}>
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Content */}
      {!minimized && (
        <div className="overflow-auto max-h-[85vh] p-4 bg-white">
          {children}
        </div>
      )}
    </motion.div>
  );
};
