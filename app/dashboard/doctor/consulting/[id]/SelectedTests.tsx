import { cn } from '@/lib/utils'
import { ImageIcon, TestTubeDiagonal, X } from 'lucide-react'
import React from 'react'

interface Test {
    code: string;
    max?: number;
    min?: number;
    name: string;
    type: "Lab" | "Imaging";
    unit: string;
    _id: string;
    panel: string;
}


export default function SelectedTests({ test, toggleTest }: { test: Test, toggleTest: (test: Test) => void }) {
    return (
        <div

            className="group flex items-center justify-between p-3 rounded-xl bg-white border border-zinc-100 shadow-sm hover:border-emerald-200 hover:shadow-md transition-all"
        >
            <div className="flex items-center gap-3 overflow-hidden">
                <div className={cn(
                    "h-10 w-10 rounded-lg grid place-items-center shrink-0",
                    test.type === 'Lab' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'
                )}>
                    {test.type === 'Lab' ? <TestTubeDiagonal className="w-5 h-5" /> : <ImageIcon className="w-5 h-5" />}
                </div>
                <div className="flex flex-col min-w-0">
                    <span className="text-sm font-medium text-zinc-900 truncate">{test.name}</span>
                    <div className="flex items-center gap-2 text-xs text-zinc-500">
                        <span className="bg-zinc-100 px-1.5 py-0.5 rounded text-[10px] uppercase tracking-wide">{test.code}</span>
                        <span>•</span>
                        <span>{test.type}</span>
                    </div>
                </div>
            </div>
            <button
                onClick={() => toggleTest(test)}
                className="h-8 w-8 grid place-items-center rounded-lg text-zinc-300 hover:text-red-500 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                title="Remove test"
            >
                <X className="w-4 h-4" />
            </button>
        </div>
    )
}
