import { useState } from "react";
import api, { PresetFood } from "../lib/api";

interface Props {
  presets: PresetFood[];
  onAdded: () => void;
}

function AiEntryForm({ onAdded }: { onAdded: () => void }) {
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
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
      setDescription("");
      onAdded();
    } catch (err: any) {
      setError(err.message || "Failed to parse food");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4">
      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
        AI Parse
      </h2>
      <form onSubmit={handleSubmit}>
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
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
    </div>
  );
}

function ManualEntryForm({ onAdded }: { onAdded: () => void }) {
  const [description, setDescription] = useState("");
  const [calories, setCalories] = useState("");
  const [protein, setProtein] = useState("");
  const [fiber, setFiber] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
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
      setDescription("");
      setCalories("");
      setProtein("");
      setFiber("");
      setError("");
      onAdded();
    } catch {
      setError("Failed to add entry");
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4">
      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
        Manual Entry
      </h2>
      <form onSubmit={handleSubmit}>
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
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
    </div>
  );
}

export default function EntryForm({ presets, onAdded }: Props) {
  const [error, setError] = useState("");

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

  return (
    <>
      {presets.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Quick Add Preset
          </h2>
          <select
            onChange={handlePresetSelect}
            defaultValue=""
            className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 text-gray-600 bg-white"
          >
            <option value="" disabled>
              Select a preset...
            </option>
            {presets.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.calories} cal)
              </option>
            ))}
          </select>
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        </div>
      )}
      <ManualEntryForm onAdded={onAdded} />
      <QuickButtons onAdded={onAdded} />
      <BerryBowl onAdded={onAdded} />
      <AiEntryForm onAdded={onAdded} />
    </>
  );
}

const BERRY_PER_100G = { calories: 46, protein: 1, fiber: 4 };

function BerryBowl({ onAdded }: { onAdded: () => void }) {
  const [grams, setGrams] = useState("");
  const [error, setError] = useState("");

  const g = parseFloat(grams) || 0;
  const cal = Math.round((g / 100) * BERRY_PER_100G.calories);
  const pro = Math.round((g / 100) * BERRY_PER_100G.protein);
  const fib = Math.round((g / 100) * BERRY_PER_100G.fiber);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (g <= 0) return;

    try {
      await api.addEntry({
        description: `Mixed berries - ${g}g`,
        calories: cal,
        protein: pro,
        fiber: fib,
        type: "preset",
      });
      setGrams("");
      setError("");
      onAdded();
    } catch {
      setError("Failed to add berry bowl");
    }
  };

  return (
    <div className="bg-purple-50 rounded-xl shadow-sm border border-purple-200 p-4 mb-4">
      <h2 className="text-sm font-semibold text-purple-600 uppercase tracking-wide mb-3">
        Berry Bowl
      </h2>
      <form onSubmit={handleSubmit} className="flex gap-2 items-end">
        <div className="flex-1">
          <input
            type="number"
            value={grams}
            onChange={(e) => setGrams(e.target.value)}
            placeholder="Grams of mixed berries"
            className="w-full border border-purple-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
          />
        </div>
        <button
          type="submit"
          disabled={g <= 0}
          className="bg-purple-600 text-white rounded-lg px-4 py-2 text-sm font-medium disabled:opacity-50 hover:bg-purple-700 transition-colors shrink-0"
        >
          Add
        </button>
      </form>
      {g > 0 && (
        <p className="text-xs text-purple-500 mt-2">
          {cal} cal &middot; {pro}g protein &middot; {fib}g fiber
        </p>
      )}
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
    </div>
  );
}

const QUICK_ITEMS = [
  { name: "Protein Powder", calories: 165, protein: 30, fiber: 0 },
  { name: "Cottage Cheese", calories: 175, protein: 30, fiber: 0 },
  { name: "Fiber Supplement", calories: 0, protein: 0, fiber: 7 },
  { name: "Bone Broth", calories: 100, protein: 20, fiber: 0 },
];

function QuickButtons({ onAdded }: { onAdded: () => void }) {
  const handleClick = async (item: (typeof QUICK_ITEMS)[number]) => {
    await api.addEntry({
      description: item.name,
      calories: item.calories,
      protein: item.protein,
      fiber: item.fiber,
      type: "preset",
    });
    onAdded();
  };

  return (
    <div className="grid grid-cols-4 gap-2 mb-4">
      {QUICK_ITEMS.map((item) => (
        <button
          key={item.name}
          onClick={() => handleClick(item)}
          className="bg-white border border-gray-200 rounded-lg px-2 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-colors shadow-sm"
        >
          {item.name}
        </button>
      ))}
    </div>
  );
}
