import React, { useState, useMemo } from 'react';
import useGetLabReport, { TestItem, RangeItem, LabsDataTypes } from './useGetLabReport';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { fDate } from '@/lib/fDateAndTime';
import {
  ExternalLink,
  FlaskConical,
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

function formatReferenceRange(t: TestItem): React.ReactNode {
  const testDoc = t.name;
  if (!testDoc) return <span className="text-gray-400">—</span>;

  const unit = testDoc.unit ? ` ${testDoc.unit}` : '';

  // Check modern range array
  if (testDoc.range && Array.isArray(testDoc.range) && testDoc.range.length > 0) {
    const validRanges = testDoc.range.filter((r: RangeItem) => {
      return (
        (r.min !== undefined && r.min !== null && String(r.min) !== '') ||
        (r.max !== undefined && r.max !== null && String(r.max) !== '') ||
        (r.upto !== undefined && r.upto !== null && String(r.upto) !== '')
      );
    });

    if (validRanges.length > 0) {
      return (
        <div className="flex flex-col gap-0.5">
          {validRanges.map((r: RangeItem, idx: number) => {
            const hasMin = r.min !== undefined && r.min !== null && String(r.min) !== '';
            const hasMax = r.max !== undefined && r.max !== null && String(r.max) !== '';
            const hasUpto = r.upto !== undefined && r.upto !== null && String(r.upto) !== '';

            let rangeStr = '';
            if (hasUpto) {
              rangeStr = `Upto ${r.upto}`;
            } else if (hasMin && hasMax) {
              rangeStr = `${r.min} - ${r.max}`;
            } else if (hasMin) {
              rangeStr = `>${r.min}`;
            } else if (hasMax) {
              rangeStr = `<${r.max}`;
            }

            const label = r.name && r.name.toLowerCase() !== 'normal' ? `${r.name}: ` : '';

            return (
              <span key={idx} className="text-slate-700 font-mono text-xs">
                {label}
                {rangeStr}
                {unit && <span className="text-slate-500 font-normal ml-0.5" dangerouslySetInnerHTML={{ __html: unit }} />}
              </span>
            );
          })}
        </div>
      );
    }
  }

  // Fallback for legacy min/max directly on test
  const hasMin = testDoc.min !== undefined && testDoc.min !== null && String(testDoc.min) !== '';
  const hasMax = testDoc.max !== undefined && testDoc.max !== null && String(testDoc.max) !== '';

  if (hasMin && hasMax) {
    return (
      <span className="text-slate-700 font-mono text-xs">
        {testDoc.min} - {testDoc.max}
        {unit && <span className="text-slate-500 font-normal ml-0.5" dangerouslySetInnerHTML={{ __html: unit }} />}
      </span>
    );
  } else if (hasMin) {
    return <span className="text-slate-700 font-mono text-xs">&gt;{testDoc.min}{unit}</span>;
  } else if (hasMax) {
    return <span className="text-slate-700 font-mono text-xs">&lt;{testDoc.max}{unit}</span>;
  }

  return <span className="text-gray-400">—</span>;
}

function checkIsAbnormal(t: TestItem): boolean {
  if (t.value === undefined || t.value === null || String(t.value).trim() === '') return false;
  const numVal = parseFloat(String(t.value));
  if (isNaN(numVal)) return false;

  const testDoc = t.name;
  if (!testDoc) return false;

  if (testDoc.range && Array.isArray(testDoc.range) && testDoc.range.length > 0) {
    const first = testDoc.range[0];
    if (first.upto != null && numVal > first.upto) return true;
    if (first.min != null && numVal < first.min) return true;
    if (first.max != null && numVal > first.max) return true;
  }

  if (testDoc.min != null && numVal < testDoc.min) return true;
  if (testDoc.max != null && numVal > testDoc.max) return true;

  return false;
}

function getReportTests(lab: LabsDataTypes): TestItem[] {
  if (Array.isArray(lab.test) && lab.test.length > 0) {
    return lab.test;
  }
  if (Array.isArray((lab as any).name)) {
    return (lab as any).name.map((n: any) => ({ _id: n._id, name: n, value: n.value }));
  }
  return [];
}

export default function Report({ patientId }: { patientId: string }) {
  const { data, isLoading } = useGetLabReport({ patientId });

  // Manage expanded state per report ID (default is collapsed = false)
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});

  const allIds = useMemo(() => (data || []).map((l) => l._id), [data]);
  const isAllExpanded = useMemo(() => {
    if (!data || data.length === 0) return false;
    return data.every((l) => Boolean(expandedIds[l._id]));
  }, [data, expandedIds]);

  const toggleAll = () => {
    if (isAllExpanded) {
      // Collapse all
      setExpandedIds({});
    } else {
      // Expand all
      const expandedState: Record<string, boolean> = {};
      allIds.forEach((id) => {
        expandedState[id] = true;
      });
      setExpandedIds(expandedState);
    }
  };

  const toggleReport = (id: string) => {
    setExpandedIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-2xl border border-slate-200">
        <FlaskConical className="w-8 h-8 text-slate-400 animate-pulse mb-2" />
        <p className="text-sm font-medium text-slate-600">Loading lab reports...</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {!data || data.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-sm">
          <FlaskConical className="w-10 h-10 text-slate-300 mb-2" />
          <h2 className="text-base font-bold text-slate-700 mb-0.5">No Lab Reports Found</h2>
          <p className="text-xs text-slate-500">There are no laboratory test results recorded for this patient.</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {/* Top Toolbar */}
          <div className="flex items-center justify-between bg-white px-4 py-2.5 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center gap-2.5">
              <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-(--color-synapse-dark) text-white">
                <FlaskConical className="w-4 h-4" />
              </div>
              <div>
                <span className="font-extrabold text-sm text-slate-900">Laboratory Reports</span>
                <span className="ml-2 text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                  {data.length} {data.length === 1 ? 'Report' : 'Reports'}
                </span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={toggleAll}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-slate-900 border-slate-300 hover:bg-slate-100 shadow-xs transition-all cursor-pointer"
            >
              {isAllExpanded ? (
                <>
                  <ChevronUp className="w-3.5 h-3.5 text-slate-500" />
                  Collapse All
                </>
              ) : (
                <>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                  Expand All
                </>
              )}
            </Button>
          </div>

          {/* Reports Table */}
          <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs">
            <Table>
              <TableHeader>
                <TableRow className="bg-(--color-synapse-dark) hover:bg-(--color-synapse-dark) border-none">
                  <TableHead className="text-white font-bold w-12 text-center">SL</TableHead>
                  <TableHead className="text-white font-bold w-36">Date / Status</TableHead>
                  <TableHead className="text-white font-bold w-[32%]">Test Name</TableHead>
                  <TableHead className="text-white font-bold w-[24%]">Result / Value</TableHead>
                  <TableHead className="text-white font-bold w-[26%]">Reference Range</TableHead>
                  <TableHead className="text-white font-bold w-20 text-center">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-slate-100">
                {data.map((lab, index) => {
                  const testsList = getReportTests(lab);
                  const isExpanded = Boolean(expandedIds[lab._id]);
                  const reportDate = lab.createdAt || lab.date;

                  const abnormalCount = testsList.filter((t) => checkIsAbnormal(t)).length;

                  return (
                    <React.Fragment key={lab._id}>
                      {/* Summary / Header Row for the Report */}
                      <TableRow
                        onClick={() => toggleReport(lab._id)}
                        className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                      >
                        {/* SL */}
                        <TableCell className="text-center font-bold text-slate-600 text-xs align-top pt-3.5">
                          {String(index + 1).padStart(2, '0')}
                        </TableCell>

                        {/* Date & Status */}
                        <TableCell className="align-top pt-3.5">
                          <div className="flex flex-col gap-1">
                            <span className="font-bold text-slate-900 text-xs">
                              {fDate(reportDate)}
                            </span>
                            {lab.status && (
                              <span
                                className={`inline-flex items-center self-start text-[10px] font-bold px-2 py-0.5 rounded-md ${
                                  lab.status === 'Completed'
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                                }`}
                              >
                                {lab.status}
                              </span>
                            )}
                          </div>
                        </TableCell>

                        {/* Test Name Column */}
                        <TableCell className="align-top pt-3.5">
                          {testsList.length === 0 ? (
                            <span className="text-slate-400 text-xs italic">No tests listed</span>
                          ) : isExpanded ? (
                            <div className="flex flex-col gap-2.5">
                              {testsList.map((t, tIdx) => {
                                const testName =
                                  t.name?.name ||
                                  (typeof t.name === 'string' ? t.name : (t.name?.code || 'Test'));
                                return (
                                  <div
                                    key={t._id || tIdx}
                                    className="min-h-5 flex items-center font-bold text-xs text-slate-900"
                                  >
                                    {testName}
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-xs text-slate-900">
                                  {testsList[0]?.name?.name || (typeof testsList[0]?.name === 'string' ? testsList[0]?.name : 'Test')}
                                  {testsList.length > 1 && (
                                    <span className="text-slate-500 font-normal ml-1">
                                      + {testsList.length - 1} more
                                    </span>
                                  )}
                                </span>
                              </div>
                              <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md self-start border border-slate-200">
                                {testsList.length} {testsList.length === 1 ? 'parameter' : 'parameters'}
                              </span>
                            </div>
                          )}
                        </TableCell>

                        {/* Value Column */}
                        <TableCell className="align-top pt-3.5">
                          {testsList.length === 0 ? (
                            <span className="text-slate-400 text-xs">—</span>
                          ) : isExpanded ? (
                            <div className="flex flex-col gap-2.5">
                              {testsList.map((t, tIdx) => {
                                const isAbnormal = checkIsAbnormal(t);
                                const hasVal =
                                  t.value !== undefined && t.value !== null && String(t.value).trim() !== '';
                                const unit = t.name?.unit ? ` ${t.name.unit}` : '';
                                const isImaging =
                                  t.name?.type === 'Imaging' ||
                                  (hasVal && String(t.value).startsWith('http'));

                                return (
                                  <div key={t._id || tIdx} className="min-h-5 flex items-center">
                                    {isImaging && hasVal ? (
                                      <a
                                        href={String(t.value)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold rounded-md text-emerald-800 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 transition-colors"
                                      >
                                        View Image <ExternalLink className="w-3 h-3" />
                                      </a>
                                    ) : (
                                      <span
                                        className={`font-mono text-xs ${
                                          isAbnormal
                                            ? 'font-black text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200'
                                            : hasVal
                                              ? 'font-bold text-slate-900'
                                              : 'text-slate-400'
                                        }`}
                                      >
                                        {hasVal ? (
                                          <>
                                            {String(t.value)}
                                            {unit && (
                                              <span
                                                className="text-slate-600 font-normal ml-0.5"
                                                dangerouslySetInnerHTML={{ __html: unit }}
                                              />
                                            )}
                                          </>
                                        ) : (
                                          'Pending'
                                        )}
                                      </span>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <div className="flex flex-col gap-1">
                              {abnormalCount > 0 ? (
                                <span className="inline-flex items-center gap-1 text-[11px] font-black text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200 self-start">
                                  <AlertCircle className="w-3 h-3 text-rose-600" />
                                  {abnormalCount} Abnormal
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 self-start">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                  All Normal
                                </span>
                              )}
                            </div>
                          )}
                        </TableCell>

                        {/* Reference Range Column */}
                        <TableCell className="align-top pt-3.5">
                          {testsList.length === 0 ? (
                            <span className="text-slate-400 text-xs">—</span>
                          ) : isExpanded ? (
                            <div className="flex flex-col gap-2.5">
                              {testsList.map((t, tIdx) => (
                                <div key={t._id || tIdx} className="min-h-5 flex items-center">
                                  {formatReferenceRange(t)}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <span className="text-xs text-slate-500 font-mono">
                              {formatReferenceRange(testsList[0])}
                            </span>
                          )}
                        </TableCell>

                        {/* Expand / Collapse Action Button */}
                        <TableCell className="text-center align-top pt-3">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleReport(lab._id)}
                            className="h-8 px-2 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
                            title={isExpanded ? 'Collapse report' : 'Expand report'}
                          >
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4 text-slate-600" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-slate-600" />
                            )}
                          </Button>
                        </TableCell>
                      </TableRow>
                    </React.Fragment>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
}
