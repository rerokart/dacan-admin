export default function Notice({ tone, title, items }: { tone: "error" | "warning"; title: string; items: string[] }) {
  const styles =
    tone === "error"
      ? "border-red-200 bg-red-50 text-red-800 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-300"
      : "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900/40 dark:bg-amber-900/20 dark:text-amber-300";
  return (
    <div className={`rounded-lg border px-4 py-3 text-sm ${styles}`} role={tone === "error" ? "alert" : "status"}>
      <p className="font-medium">{title}</p>
      <ul className="mt-1 list-disc pl-5">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
