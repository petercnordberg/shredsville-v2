import { useState, useEffect, useCallback } from "react";
import api, { NutritionEntry } from "../lib/api";

function getTodayET(): string {
  return new Date().toLocaleDateString("en-CA", {
    timeZone: "America/New_York",
  });
}

export default function NutritionHistory() {
  const [selectedDate, setSelectedDate] = useState(getTodayET());
  const [entries, setEntries] = useState<NutritionEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({
    description: "",
    calories: "",
    protein: "",
    fiber: "",
    date: "",
  });

  const loadEntries = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getEntries(selectedDate);
      setEntries(data);
    } catch (error) {
      console.error("Failed to load entries:", error);
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  function startEdit(entry: NutritionEntry) {
    setEditingId(entry.id);
    setEditForm({
      description: entry.description,
      calories: String(entry.calories),
      protein: String(entry.protein),
      fiber: String(entry.fiber),
      date: selectedDate,
    });
  }

  async function handleSave() {
    if (editingId === null) return;

    const updates: {
      description: string;
      calories: number;
      protein: number;
      fiber: number;
      date?: string;
    } = {
      description: editForm.description,
      calories: parseFloat(editForm.calories),
      protein: parseFloat(editForm.protein),
      fiber: parseFloat(editForm.fiber),
    };

    if (editForm.date !== selectedDate) {
      updates.date = editForm.date;
    }

    await api.updateEntry(editingId, updates);
    setEditingId(null);
    loadEntries();
  }

  async function handleDelete(id: number) {
    await api.deleteEntry(id);
    loadEntries();
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Select Date
        </h3>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide px-4 pt-4 pb-2">
          Entries for {selectedDate}
        </h3>
        {loading ? (
          <p className="text-sm text-gray-400 text-center py-4">Loading...</p>
        ) : entries.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">
            No entries for this day.
          </p>
        ) : (
          <>
            <div className="px-4 pb-2">
              <p className="text-xs text-gray-400">
                {entries.length} entries &middot;{" "}
                {Math.round(
                  entries.reduce((sum, e) => sum + e.calories, 0)
                )}{" "}
                cal total
              </p>
            </div>
            <ul className="divide-y divide-gray-100">
              {entries.map((entry) => (
                <li key={entry.id} className="px-4 py-3">
                  {editingId === entry.id ? (
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={editForm.description}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            description: e.target.value,
                          })
                        }
                        className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                        placeholder="Description"
                      />
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="text-xs text-gray-400">Cal</label>
                          <input
                            type="number"
                            value={editForm.calories}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                calories: e.target.value,
                              })
                            }
                            className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-400">
                            Protein
                          </label>
                          <input
                            type="number"
                            value={editForm.protein}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                protein: e.target.value,
                              })
                            }
                            className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-400">Fiber</label>
                          <input
                            type="number"
                            value={editForm.fiber}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                fiber: e.target.value,
                              })
                            }
                            className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-xs text-gray-400">
                          Move to date:
                        </label>
                        <input
                          type="date"
                          value={editForm.date}
                          onChange={(e) =>
                            setEditForm({ ...editForm, date: e.target.value })
                          }
                          className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={handleSave}
                          className="bg-gray-900 text-white px-3 py-1 rounded text-sm"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="text-gray-500 text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {entry.description}
                          </p>
                          <span className="text-xs text-gray-400 shrink-0">
                            {new Date(entry.createdAt).toLocaleTimeString(
                              "en-US",
                              {
                                hour: "numeric",
                                minute: "2-digit",
                                timeZone: "America/New_York",
                              }
                            )}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {Math.round(entry.calories)} cal &middot;{" "}
                          {Math.round(entry.protein)}g protein &middot;{" "}
                          {Math.round(entry.fiber)}g fiber
                        </p>
                      </div>
                      <button
                        onClick={() => startEdit(entry)}
                        className="text-gray-400 hover:text-blue-500 text-sm shrink-0"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(entry.id)}
                        className="text-gray-300 hover:text-red-500 text-sm shrink-0"
                      >
                        &times;
                      </button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}
