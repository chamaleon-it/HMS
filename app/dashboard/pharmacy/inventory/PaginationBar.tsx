// PaginationBar.tsx
"use client";

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Dispatch, SetStateAction, useMemo } from "react";
import { FilterType } from "./interface";
import { cn } from "@/lib/utils";

export function PaginationBar({
  page,
  limit,
  total,
  setFilter,
  disabled,
  pageWindow = 5,
}: {
  page: number;
  limit: number;
  total: number;
  setFilter: Dispatch<SetStateAction<FilterType>>;
  disabled?: boolean;
  pageWindow?: number;
}) {
  const totalPages = Math.max(1, Math.ceil((total || 0) / (limit || 10)));

  const pages = useMemo(() => {
    const half = Math.floor(pageWindow / 2);
    let start = Math.max(1, page - half);
    const end = Math.min(totalPages, start + pageWindow - 1);
    start = Math.max(1, Math.min(start, Math.max(1, end - pageWindow + 1)));
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }, [page, totalPages, pageWindow]);

  const goTo = (p: number) =>
    setFilter((f) => ({ ...f, page: Math.min(Math.max(1, p), totalPages) }));

  //   const changeLimit = (newLimit: number) =>
  //     setFilter((f) => ({ ...f, limit: newLimit, page: 1 }));

  return (
    <div className="flex items-center justify-between gap-4 py-3">
      {/* Left: page-size select + results summary */}
      {/* <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Rows per page:</span>
          <Select
            value={String(limit)}
            onValueChange={(v) => changeLimit(Number(v))}
            disabled={disabled}
          >
            <SelectTrigger className="h-8 w-[84px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {pageSizeOptions?.map((opt) => (
                <SelectItem key={opt} value={String(opt)}>
                  {opt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <span className="text-sm text-muted-foreground">
          {total ? `${(page - 1) * limit + 1}–${Math.min(page * limit, total)} of ${total}` : "0 of 0"}
        </span>
      </div> */}

      {/* Right: numbered pagination */}
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              aria-disabled={page <= 1 || disabled}
              className={cn(
                (page <= 1 || disabled) && "pointer-events-none opacity-50"
              )}
              onClick={() => goTo(page - 1)}
            />
          </PaginationItem>

          {pages[0] > 1 && (
            <>
              <PaginationItem>
                <PaginationLink onClick={() => goTo(1)}>1</PaginationLink>
              </PaginationItem>
              {pages[0] > 2 && (
                <span className="px-1 text-sm text-muted-foreground">…</span>
              )}
            </>
          )}

          {pages?.map((p) => (
            <PaginationItem key={p}>
              <PaginationLink isActive={p === page} onClick={() => goTo(p)}>
                {p}
              </PaginationLink>
            </PaginationItem>
          ))}

          {pages[pages.length - 1] < totalPages && (
            <>
              {pages[pages.length - 1] < totalPages - 1 && (
                <span className="px-1 text-sm text-muted-foreground">…</span>
              )}
              <PaginationItem>
                <PaginationLink onClick={() => goTo(totalPages)}>
                  {totalPages}
                </PaginationLink>
              </PaginationItem>
            </>
          )}

          <PaginationItem>
            <PaginationNext
              aria-disabled={page >= totalPages || disabled}
              className={cn(
                (page >= totalPages || disabled) &&
                "pointer-events-none opacity-50"
              )}
              onClick={() => goTo(page + 1)}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
