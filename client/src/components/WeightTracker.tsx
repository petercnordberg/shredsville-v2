import { useState, useEffect } from "react";
import api, { WeightEntry } from "../lib/api";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type ChartRange = "6w" | "6m" | "1y" | "all";

function getTodayET(): string {
  return new Date().toLocaleDateString("en-CA", {
    timeZone: "America/New_York",
  });
}

export default function WeightTracker() {
  const [entries, setEntries] = useState<WeightEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState(getTodayET());
  const [weight, setWeight] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editWeight, setEditWeight] = useState("");
  const [chartRange, setChartRange] = useState<ChartRange>("6w");

  async function loadEntries() {
    try {
      const data = await api.getWeightEntries();
      setEntries(data);
    } catch (error) {
      console.error("Failed to load weight entries:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadEntries();
  }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!weight) return;
    await api.addWeightEntry({ date, weight: parseFloat(weight) });
    setWeight("");
    loadEntries();
  }

  async function handleEdit(id: number) {
    if (!editWeight) return;
    await api.updateWeightEntry(id, { weight: parseFloat(editWeight) });
    setEditingId(null);
    setEditWeight("");
    loadEntries();
  }

  async function handleDelete(id: number) {
    await api.deleteWeightEntry(id);
    loadEntries();
  }

  const getChartData = () => {
    const now = new Date();
    let cutoff: Date;
    switch (chartRange) {
      case "6w":
        cutoff = new Date(now);
        cutoff.setDate(cutoff.getDate() - 42);
        break;
      case "6m":
        cutoff = new Date(now);
        cutoff.setMonth(cutoff.getMonth() - 6);
        break;
      case "1y":
        cutoff = new Date(now);
        cutoff.setFullYear(cutoff.getFullYear() - 1);
        break;
      case "all":
        cutoff = new Date(0);
        break;
    }
    const cutoffStr = cutoff.toLocaleDateString("en-CA");
    return [...entries]
      .filter((e) => e.date >= cutoffStr)
      .reverse()
      .map((e) => ({
        date: e.date.slice(5), // MM-DD
        weight: e.weight,
      }));
  };

  const chartData = getChartData();

  if (loading) {
    return <div className="text-center text-gray-400 py-8">Loading...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Add Weight Form */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Log Weight
        </h3>
        <form onSubmit={handleAdd} className="flex gap-2">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm"
          />
          <input
            type="number"
            step="0.1"
            placeholder="lbs"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            className="w-24 border border-gray-300 rounded-lg px-3 py-2 text-sm"
          />
          <button
            type="submit"
            className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium"
          >
            Add
          </button>
        </form>
      </div>

      {/* Weight Chart */}
      {chartData.length > 1 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
              Weight Trend
            </h3>
            <div className="flex gap-1">
              {(["6w", "6m", "1y", "all"] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => setChartRange(range)}
                  className={`px-2 py-0.5 text-xs rounded ${
                    chartRange === range
                      ? "bg-gray-900 text-white"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {range === "all" ? "All" : range}
                </button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis domain={["auto", "auto"]} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="weight"
                stroke="#4B5563"
                strokeWidth={2}
                dot={{ r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Recent Entries */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide px-4 pt-4 pb-2">
          Recent Entries
        </h3>
        {entries.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">
            No weight entries yet.
          </p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {entries.slice(0, 20).map((entry) => (
              <li key={entry.id} className="px-4 py-3 flex items-center gap-3">
                {editingId === entry.id ? (
                  <>
                    <span className="text-sm text-gray-600">{entry.date}</span>
                    <input
                      type="number"
                      step="0.1"
                      value={editWeight}
                      onChange={(e) => setEditWeight(e.target.value)}
                      className="w-20 border border-gray-300 rounded px-2 py-1 text-sm"
                      autoFocus
                    />
                    <button
                      onClick={() => handleEdit(entry.id)}
                      className="text-green-600 text-sm"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="text-gray-400 text-sm"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <span className="text-sm text-gray-600 flex-1">
                      {entry.date}
                    </span>
                    <span className="text-sm font-semibold">
                      {entry.weight} lbs
                    </span>
                    <button
                      onClick={() => {
                        setEditingId(entry.id);
                        setEditWeight(String(entry.weight));
                      }}
                      className="text-gray-400 hover:text-blue-500 text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(entry.id)}
                      className="text-gray-300 hover:text-red-500 text-sm"
                    >
                      &times;
                    </button>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
