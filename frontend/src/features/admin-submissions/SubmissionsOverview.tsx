import { useId, useMemo, useState } from "react";
import { EmptyState } from "./EmptyState";
import { MOCK_SUBMISSIONS } from "./mockData";
import type { Filters, SortKey, SortState } from "./sortAndFilter";
import {
  DEFAULT_FILTERS,
  DEFAULT_SORT,
  filterSubmissions,
  sortSubmissions,
} from "./sortAndFilter";
import { SubmissionsTable } from "./SubmissionsTable";
import { SubmissionsToolbar } from "./SubmissionsToolbar";
import { toRow } from "./types";

const ALL_ROWS = MOCK_SUBMISSIONS.map(toRow);

export default function SubmissionsOverview() {
  const headingId = useId();
  const [sort, setSort] = useState<SortState>(DEFAULT_SORT);
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);

  const visibleRows = useMemo(
    () => sortSubmissions(filterSubmissions(ALL_ROWS, filters), sort),
    [filters, sort],
  );

  function handleSort(key: SortKey) {
    setSort((current) =>
      current.key === key
        ? { key, direction: current.direction === "asc" ? "desc" : "asc" }
        : { key, direction: "asc" },
    );
  }

  function handleClearFilters() {
    setFilters(DEFAULT_FILTERS);
  }

  return (
    <section aria-labelledby={headingId} className="py-10">
      <header className="mb-5">
        <h1
          id={headingId}
          className="max-w-none! text-3xl! font-semibold tracking-tight!"
        >
          Submissions
        </h1>
        <p className="text-muted mt-1 text-sm">
          AI-graded submissions and which ones need a human decision.
        </p>
      </header>

      <div className="border-line overflow-hidden rounded-lg border bg-white shadow-xs">
        <SubmissionsToolbar
          filters={filters}
          onChange={setFilters}
          onClear={handleClearFilters}
          visibleCount={visibleRows.length}
          totalCount={ALL_ROWS.length}
        />
        <SubmissionsTable
          rows={visibleRows}
          sort={sort}
          onSort={handleSort}
          emptyState={
            <EmptyState filters={filters} onClearFilters={handleClearFilters} />
          }
        />
      </div>
    </section>
  );
}
