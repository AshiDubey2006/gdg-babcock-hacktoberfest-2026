import type { SortDirection, SortKey, SortState } from "./sortAndFilter";
type SortIconProps = {
  direction: SortDirection | null;
};

function SortIcon({ direction }: SortIconProps) {
  const path =
    direction === "asc"
      ? "M8 13V3M4 7l4-4 4 4"
      : direction === "desc"
        ? "M8 3v10M4 9l4 4 4-4"
        : "M5 6l3-3 3 3M5 10l3 3 3-3";

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      className={`size-4 ${direction ? "" : "opacity-50"}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={path} />
    </svg>
  );
}

type SortableHeaderProps = {
  label: string;
  columnKey: SortKey;
  sort: SortState;
  onSort: (key: SortKey) => void;
};

export function SortableHeader({
  label,
  columnKey,
  sort,
  onSort,
}: SortableHeaderProps) {
  const isActive = sort.key === columnKey;
  const ariaSort = isActive
    ? sort.direction === "asc"
      ? "ascending"
      : "descending"
    : "none";

  return (
    <th
      scope="col"
      aria-sort={ariaSort}
      className="text-muted px-5 py-3 text-xs font-semibold"
    >
      <button
        type="button"
        onClick={() => onSort(columnKey)}
        className="hover:text-ink focus-visible:ring-brand inline-flex items-center gap-1.5 rounded-sm focus-visible:ring-2 focus-visible:outline-hidden"
      >
        <span className="tracking-wider uppercase">{label}</span>
        <SortIcon direction={isActive ? sort.direction : null} />
      </button>
    </th>
  );
}
