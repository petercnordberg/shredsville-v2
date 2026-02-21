import { useState } from "react";
import api, { PresetFood, UserSettings } from "../lib/api";

interface Props {
  settings: UserSettings | null;
  presets: PresetFood[];
  onBack: () => void;
}

export default function Settings({ settings, presets, onBack }: Props) {
  const [calorieTarget, setCalorieTarget] = useState(
    settings?.dailyCalorieTarget?.toString() || "2000"
  );
  const [proteinTarget, setProteinTarget] = useState(
    settings?.dailyProteinTarget?.toString() || "150"
  );
  const [fiberTarget, setFiberTarget] = useState(
    settings?.dailyFiberTarget?.toString() || "30"
  );
  const [saved, setSaved] = useState(false);

  // Preset form
  const [presetName, setPresetName] = useState("");
  const [presetCal, setPresetCal] = useState("");
  const [presetPro, setPresetPro] = useState("");
  const [presetFib, setPresetFib] = useState("");
  const [localPresets, setLocalPresets] = useState<PresetFood[]>(presets);

  const handleSaveTargets = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.updateSettings({
      dailyCalorieTarget: parseInt(calorieTarget) || 2000,
      dailyProteinTarget: parseInt(proteinTarget) || 150,
      dailyFiberTarget: parseInt(fiberTarget) || 30,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleAddPreset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!presetName.trim()) return;
    const preset = await api.addPreset({
      name: presetName.trim(),
      calories: parseFloat(presetCal) || 0,
      protein: parseFloat(presetPro) || 0,
      fiber: parseFloat(presetFib) || 0,
    });
    setLocalPresets([...localPresets, preset]);
    setPresetName("");
    setPresetCal("");
    setPresetPro("");
    setPresetFib("");
  };

  const handleDeletePreset = async (id: number) => {
    await api.deletePreset(id);
    setLocalPresets(localPresets.filter((p) => p.id !== id));
  };

  return (
    <div>
      <button
        onClick={onBack}
        className="text-sm text-gray-500 hover:text-gray-800 mb-4 transition-colors"
      >
        &larr; Back
      </button>

      <h1 className="text-2xl font-bold text-gray-900 mb-6">Settings</h1>

      {/* Daily targets */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Daily Targets
        </h2>
        <form onSubmit={handleSaveTargets} className="space-y-3">
          <label className="block">
            <span className="text-sm text-gray-600">Calories (kcal)</span>
            <input
              type="number"
              value={calorieTarget}
              onChange={(e) => setCalorieTarget(e.target.value)}
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            />
          </label>
          <label className="block">
            <span className="text-sm text-gray-600">Protein (g)</span>
            <input
              type="number"
              value={proteinTarget}
              onChange={(e) => setProteinTarget(e.target.value)}
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            />
          </label>
          <label className="block">
            <span className="text-sm text-gray-600">Fiber (g)</span>
            <input
              type="number"
              value={fiberTarget}
              onChange={(e) => setFiberTarget(e.target.value)}
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            />
          </label>
          <button
            type="submit"
            className="w-full bg-gray-900 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            {saved ? "Saved!" : "Save Targets"}
          </button>
        </form>
      </div>

      {/* Preset foods */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Preset Foods
        </h2>

        {localPresets.length > 0 && (
          <ul className="divide-y divide-gray-100 mb-4">
            {localPresets.map((p) => (
              <li key={p.id} className="py-2 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">{p.name}</p>
                  <p className="text-xs text-gray-500">
                    {p.calories} cal &middot; {p.protein}g pro &middot;{" "}
                    {p.fiber}g fib
                  </p>
                </div>
                <button
                  onClick={() => handleDeletePreset(p.id)}
                  className="text-gray-300 hover:text-red-500 transition-colors text-sm"
                >
                  &times;
                </button>
              </li>
            ))}
          </ul>
        )}

        <form onSubmit={handleAddPreset} className="space-y-2">
          <input
            type="text"
            value={presetName}
            onChange={(e) => setPresetName(e.target.value)}
            placeholder="Preset name"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
          />
          <div className="grid grid-cols-3 gap-2">
            <input
              type="number"
              value={presetCal}
              onChange={(e) => setPresetCal(e.target.value)}
              placeholder="Calories"
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            />
            <input
              type="number"
              value={presetPro}
              onChange={(e) => setPresetPro(e.target.value)}
              placeholder="Protein"
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            />
            <input
              type="number"
              value={presetFib}
              onChange={(e) => setPresetFib(e.target.value)}
              placeholder="Fiber"
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            />
          </div>
          <button
            type="submit"
            disabled={!presetName.trim()}
            className="w-full bg-gray-100 text-gray-700 rounded-lg px-4 py-2 text-sm font-medium hover:bg-gray-200 disabled:opacity-50 transition-colors"
          >
            Add Preset
          </button>
        </form>
      </div>
    </div>
  );
}
