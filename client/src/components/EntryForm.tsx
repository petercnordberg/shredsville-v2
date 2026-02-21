import { useState } from "react";
import api, { PresetFood } from "../lib/api";

interface Props {
  presets: PresetFood[];
  onAdded: () => void;
}

type Mode = "ai" | "manual";

export default function EntryForm({ presets, onAdded }: Props) {
  const [mode, setMode] = useState<Mode>("ai");
  const [description, setDescription] = useState("");
  const [calories, setCalories] = useState("");
  const [protein, setProtein] = useState("");
  const [fiber, setFiber] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const reset = () => {
    setDescription("");
    setCalories("");
    setProtein("");
    setFiber("");
    setError("");
  };

  const handlePresetSelect = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = parseInt(e.target.value);
    if (!id) return;
    const preset = presets.find((p) => p.id === id);
    if (!preset) return;

    try {
      await api.addEntry({
        description: preset.name,
        calories: preset.calories,
        protein: preset.protein,
        fiber: preset.fiber,
        type: "preset",
      });
      onAdded();
    } catch {
      setError("Failed to add preset");
    }
    e.target.value = "";
  };

  const handleAiSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    setLoading(true);
    setError("");
    try {
      const parsed = await api.parseFood(description);
      await api.addEntry({
        description: description.trim(),
        calories: parsed.calories,
        protein: parsed.protein,
        fiber: parsed.fiber,
        type: "ai",
      });
      reset();
      onAdded();
    } catch (err: any) {
      setError(err.message || "Failed to parse food");
    } finally {
      setLoading(false);
    }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    try {
      await api.addEntry({
        description: description.trim(),
        calories: parseFloat(calories) || 0,
        protein: parseFloat(protein) || 0,
        fiber: parseFloat(fiber) || 0,
        type: "manual",
      });
      reset();
      onAdded();
    } catch {
      setError("Failed to add entry");
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
      <div className="flex items-center gap-3 mb-3">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
          Add Food
        </h2>
        {presets.length > 0 && (
          <select
            onChange={handlePresetSelect}
            defaultValue=""
            className="ml-auto text-sm border border-gray-300 rounded-lg px-2 py-1 text-gray-600 bg-white"
          >
            <option value="" disabled>
              Quick add preset...
            </option>
            {presets.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.calories} cal)
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="flex gap-2 mb-3">
        <button
          onClick={() => setMode("ai")}
          className={`text-sm px-3 py-1 rounded-full transition-colors ${
            mode === "ai"
              ? "bg-gray-900 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          AI Parse
        </button>
        <button
          onClick={() => setMode("manual")}
          className={`text-sm px-3 py-1 rounded-full transition-colors ${
            mode === "manual"
              ? "bg-gray-900 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          Manual
        </button>
      </div>

      {mode === "ai" ? (
        <form onSubmit={handleAiSubmit}>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder='e.g. "2 eggs with toast and butter"'
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
          />
          <button
            type="submit"
            disabled={loading || !description.trim()}
            className="w-full bg-gray-900 text-white rounded-lg px-4 py-2 text-sm font-medium disabled:opacity-50 hover:bg-gray-800 transition-colors"
          >
            {loading ? "Parsing..." : "Add with AI"}
          </button>
        </form>
      ) : (
        <form onSubmit={handleManualSubmit}>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
          />
          <div className="grid grid-cols-3 gap-2 mb-2">
            <input
              type="number"
              value={calories}
              onChange={(e) => setCalories(e.target.value)}
              placeholder="Calories"
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            />
            <input
              type="number"
              value={protein}
              onChange={(e) => setProtein(e.target.value)}
              placeholder="Protein (g)"
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            />
            <input
              type="number"
              value={fiber}
              onChange={(e) => setFiber(e.target.value)}
              placeholder="Fiber (g)"
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            />
          </div>
          <button
            type="submit"
            disabled={!description.trim()}
            className="w-full bg-gray-900 text-white rounded-lg px-4 py-2 text-sm font-medium disabled:opacity-50 hover:bg-gray-800 transition-colors"
          >
            Add Entry
          </button>
        </form>
      )}

      {error && (
        <p className="text-red-500 text-sm mt-2">{error}</p>
      )}
    </div>
  );
}
