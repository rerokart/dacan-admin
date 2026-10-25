export default function Pager({
  page,
  totalPages,
  onPage,
}: {
  page: number;
  totalPages: number;
  onPage: (p: number) => void;
}) {
  if (totalPages <= 1) return null;
  const btn =
    "rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800";
  return (
    <div className="flex items-center justify-between border-t border-gray-200 px-6 py-4 dark:border-gray-800">
      <p className="text-sm text-gray-500">
        Page {page} of {totalPages}
      </p>
      <div className="flex gap-2">
        <button onClick={() => onPage(page - 1)} disabled={page <= 1} className={btn}>
          Previous
        </button>
        <button onClick={() => onPage(page + 1)} disabled={page >= totalPages} className={btn}>
          Next
        </button>
      </div>
    </div>
  );
}
