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

function getEasternToday(): string {
  return new Date().toLocaleDateString("en-CA", {
    timeZone: "America/New_York",
  }); // "YYYY-MM-DD"
}

function formatDateLabel(dateStr: string): string {
  const today = getEasternToday();
  const yesterday = new Date(
    new Date().toLocaleString("en-US", { timeZone: "America/New_York" })
  );
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toLocaleDateString("en-CA");

  if (dateStr === today) return "Today";
  if (dateStr === yesterdayStr) return "Yesterday";

  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function shiftDate(dateStr: string, days: number): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + days);
  return date.toLocaleDateString("en-CA");
}

export default function App() {
  const [entries, setEntries] = useState<NutritionEntry[]>([]);
  const [presets, setPresets] = useState<PresetFood[]>([]);
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedDate, setSelectedDate] = useState(getEasternToday);

  const isToday = selectedDate === getEasternToday();

  const refresh = useCallback(async () => {
    const [e, p, s] = await Promise.all([
      api.getEntries(selectedDate),
      api.getPresets(),
      api.getSettings(),
    ]);
    setEntries(e);
    setPresets(p);
    setSettings(s);
  }, [selectedDate]);

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

      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setSelectedDate((d) => shiftDate(d, -1))}
          className="text-gray-400 hover:text-gray-800 transition-colors px-2 py-1 text-lg"
        >
          &larr;
        </button>
        <button
          onClick={() => setSelectedDate(getEasternToday())}
          className="text-sm font-semibold text-gray-700 hover:text-gray-900 transition-colors"
        >
          {formatDateLabel(selectedDate)}
        </button>
        <button
          onClick={() => setSelectedDate((d) => shiftDate(d, 1))}
          disabled={isToday}
          className="text-gray-400 hover:text-gray-800 transition-colors px-2 py-1 text-lg disabled:opacity-20 disabled:cursor-not-allowed"
        >
          &rarr;
        </button>
      </div>

      {settings && (
        <TodayTotals
          totals={totals}
          settings={settings}
          label={formatDateLabel(selectedDate)}
        />
      )}

      {isToday && <EntryForm presets={presets} onAdded={refresh} />}

      <EntryList entries={entries} onDeleted={isToday ? refresh : undefined} />
    </div>
  );
}
