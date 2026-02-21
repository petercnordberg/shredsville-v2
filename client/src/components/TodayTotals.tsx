import { UserSettings } from "../lib/api";

interface Props {
  totals: { calories: number; protein: number; fiber: number };
  settings: UserSettings;
  label: string;
}

export default function TodayTotals({ totals, settings, label }: Props) {
  const remaining = {
    calories: settings.dailyCalorieTarget - totals.calories,
    protein: settings.dailyProteinTarget - totals.protein,
    fiber: settings.dailyFiberTarget - totals.fiber,
  };

  const pct = (consumed: number, target: number) =>
    target > 0 ? Math.min((consumed / target) * 100, 100) : 0;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
        {label}
      </h2>
      <div className="space-y-3">
        <MacroRow
          label="Calories"
          consumed={Math.round(totals.calories)}
          target={settings.dailyCalorieTarget}
          remaining={Math.round(remaining.calories)}
          unit="kcal"
          pct={pct(totals.calories, settings.dailyCalorieTarget)}
          color="bg-orange-500"
        />
        <MacroRow
          label="Protein"
          consumed={Math.round(totals.protein)}
          target={settings.dailyProteinTarget}
          remaining={Math.round(remaining.protein)}
          unit="g"
          pct={pct(totals.protein, settings.dailyProteinTarget)}
          color="bg-blue-500"
        />
        <MacroRow
          label="Fiber"
          consumed={Math.round(totals.fiber)}
          target={settings.dailyFiberTarget}
          remaining={Math.round(remaining.fiber)}
          unit="g"
          pct={pct(totals.fiber, settings.dailyFiberTarget)}
          color="bg-green-500"
        />
      </div>
    </div>
  );
}

function MacroRow({
  label,
  consumed,
  target,
  remaining,
  unit,
  pct,
  color,
}: {
  label: string;
  consumed: number;
  target: number;
  remaining: number;
  unit: string;
  pct: number;
  color: string;
}) {
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="font-medium text-gray-700">
          {label}: {consumed} / {target} {unit}
        </span>
        <span className={remaining >= 0 ? "text-gray-500" : "text-red-500"}>
          {remaining >= 0 ? `${remaining} ${unit} left` : `${Math.abs(remaining)} ${unit} over`}
        </span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-2">
        <div
          className={`${color} h-2 rounded-full transition-all duration-300`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
