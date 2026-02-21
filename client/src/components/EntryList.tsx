import api, { NutritionEntry } from "../lib/api";

interface Props {
  entries: NutritionEntry[];
  onDeleted?: () => void;
}

export default function EntryList({ entries, onDeleted }: Props) {
  if (entries.length === 0) {
    return (
      <div className="text-center text-gray-400 text-sm py-8">
        No entries for this day.
      </div>
    );
  }

  const handleDelete = async (id: number) => {
    await api.deleteEntry(id);
    onDeleted?.();
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide px-4 pt-4 pb-2">
        Entries
      </h2>
      <ul className="divide-y divide-gray-100">
        {entries.map((entry) => (
          <li key={entry.id} className="px-4 py-3 flex items-start gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {entry.description}
                </p>
                <span className="text-xs text-gray-400 shrink-0">
                  {new Date(entry.createdAt).toLocaleTimeString("en-US", {
                    hour: "numeric",
                    minute: "2-digit",
                    timeZone: "America/New_York",
                  })}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                {Math.round(entry.calories)} cal &middot;{" "}
                {Math.round(entry.protein)}g protein &middot;{" "}
                {Math.round(entry.fiber)}g fiber
              </p>
            </div>
            {onDeleted && (
              <button
                onClick={() => handleDelete(entry.id)}
                className="text-gray-300 hover:text-red-500 transition-colors text-sm shrink-0"
                title="Delete"
              >
                &times;
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
