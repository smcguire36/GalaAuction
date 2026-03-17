import Header from "./Header";

export type SortState = {
  name: string;
  direction: "asc" | "desc" | undefined;
};

type SortableHeaderProps = {
  name: string;
  label: string;
  changeSort: (next: SortState) => void;
  sortDirection?: "asc" | "desc" | undefined;
};

const SortableHeader = ({
  name,
  label,
  changeSort,
  sortDirection,
}: SortableHeaderProps) => {
  const handleSortClick = () => {
    switch (sortDirection) {
      case "asc":
        changeSort({ name, direction: "desc" });
        break;
      case "desc":
        changeSort({ name, direction: undefined });
        break;
      default:
        changeSort({ name, direction: "asc" });
    }
  };

  return (
    <Header label={label}>
      <button type="button" onClick={handleSortClick}>
        {sortDirection === "asc" ? (
          <span className="text-black">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="size-5"
            >
              <path
                fillRule="evenodd"
                d="M9.47 6.47a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 1 1-1.06 1.06L10 8.06l-3.72 3.72a.75.75 0 0 1-1.06-1.06l4.25-4.25Z"
                clipRule="evenodd"
              />
            </svg>
          </span>
        ) : sortDirection === "desc" ? (
          <span className="text-black">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="size-5"
            >
              <path
                fillRule="evenodd"
                d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z"
                clipRule="evenodd"
              />
            </svg>
          </span>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="size-5"
          >
            <path
              fillRule="evenodd"
              d="M10.53 3.47a.75.75 0 0 0-1.06 0L6.22 6.72a.75.75 0 0 0 1.06 1.06L10 5.06l2.72 2.72a.75.75 0 1 0 1.06-1.06l-3.25-3.25Zm-4.31 9.81 3.25 3.25a.75.75 0 0 0 1.06 0l3.25-3.25a.75.75 0 1 0-1.06-1.06L10 14.94l-2.72-2.72a.75.75 0 0 0-1.06 1.06Z"
              clipRule="evenodd"
            />
          </svg>
        )}
      </button>
    </Header>
  );
};

export default SortableHeader;
