import { useState, useEffect, useCallback } from "react";
import api, {
  NutritionEntry,
  PresetFood,
  UserSettings,
} from "./lib/api";
import EntryForm from "./components/EntryForm";
import TodayTotals from "./components/TodayTotals";
import EntryList from "./components/EntryList";
import Settings from "./components/Settings";

export default function App() {
  const [entries, setEntries] = useState<NutritionEntry[]>([]);
  const [presets, setPresets] = useState<PresetFood[]>([]);
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  const refresh = useCallback(async () => {
    const [e, p, s] = await Promise.all([
      api.getEntries(),
      api.getPresets(),
      api.getSettings(),
    ]);
    setEntries(e);
    setPresets(p);
    setSettings(s);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const totals = entries.reduce(
    (acc, e) => ({
      calories: acc.calories + e.calories,
      protein: acc.protein + e.protein,
      fiber: acc.fiber + e.fiber,
    }),
    { calories: 0, protein: 0, fiber: 0 }
  );

  if (showSettings) {
    return (
      <div className="max-w-lg mx-auto px-4 py-6">
        <Settings
          settings={settings}
          presets={presets}
          onBack={() => {
            setShowSettings(false);
            refresh();
          }}
        />
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Shredsville</h1>
        <button
          onClick={() => setShowSettings(true)}
          className="text-sm text-gray-500 hover:text-gray-800 transition-colors"
        >
          Settings
        </button>
      </div>

      {settings && <TodayTotals totals={totals} settings={settings} />}

      <EntryForm presets={presets} onAdded={refresh} />

      <EntryList entries={entries} onDeleted={refresh} />
    </div>
  );
}
