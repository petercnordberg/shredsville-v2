import { useState, useEffect } from "react";
import api, { WeeklySummary } from "../lib/api";

export default function WeeklyProgress() {
  const [summary, setSummary] = useState<WeeklySummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const summaries = await api.getWeeklySummaries(1);
        setSummary(summaries[0] || null);
      } catch (error) {
        console.error("Failed to load weekly summary:", error);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return <div className="text-center text-gray-400 py-8">Loading...</div>;
  }

  if (!summary) {
    return (
      <div className="text-center text-gray-400 py-8">No data available.</div>
    );
  }

  const goal = summary.goal;
  const days = summary.daysElapsed;

  // Expected baseline = daily target * days elapsed
  const expectedCal = summary.dailyCalorieTarget * days;
  const expectedPro = summary.dailyProteinTarget * days;
  const expectedFib = summary.dailyFiberTarget * days;

  // Delta = consumed - expected (negative = under baseline)
  const calDelta = Math.round(summary.calories - expectedCal);
  const proDelta = Math.round(summary.protein - expectedPro);
  const fibDelta = Math.round(summary.fiber - expectedFib);

  const targetDeficit =
    goal?.goalType === "deficit" && goal.targetDeficit
      ? goal.targetDeficit
      : null;

  return (
    <div className="space-y-4">
      {/* Active Goal Card */}
      {goal ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
              Active Goal
            </h3>
            <span
              className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                goal.goalType === "deficit"
                  ? "bg-red-100 text-red-700"
                  : "bg-green-100 text-green-700"
              }`}
            >
              {goal.goalType === "deficit" ? "Deficit" : "Maintenance"}
            </span>
          </div>
          {targetDeficit && (
            <p className="text-sm text-gray-600 mt-1">
              Target: {targetDeficit} cal/week
            </p>
          )}
        </div>
      ) : (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-sm text-yellow-800">
          No weekly goal set. Go to the Goals tab to create one.
        </div>
      )}

      {/* Weekly Delta Progress */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">
          This Week
        </h3>
        <p className="text-xs text-gray-400 mb-4">
          {summary.weekStart} to {summary.weekEnd} &middot; Day {days} of 7
          &middot; {summary.entryCount} entries
        </p>

        <div className="space-y-4">
          {/* Calories */}
          <DeltaRow
            label="Calories"
            consumed={Math.round(summary.calories)}
            expected={Math.round(expectedCal)}
            delta={calDelta}
            unit="cal"
            color="orange"
            goalTarget={targetDeficit}
            daysElapsed={days}
          />

          {/* Protein */}
          <DeltaRow
            label="Protein"
            consumed={Math.round(summary.protein)}
            expected={Math.round(expectedPro)}
            delta={proDelta}
            unit="g"
            color="blue"
            goalTarget={null}
            daysElapsed={days}
          />

          {/* Fiber */}
          <DeltaRow
            label="Fiber"
            consumed={Math.round(summary.fiber)}
            expected={Math.round(expectedFib)}
            delta={fibDelta}
            unit="g"
            color="green"
            goalTarget={null}
            daysElapsed={days}
          />
        </div>
      </div>
    </div>
  );
}

function DeltaRow({
  label,
  consumed,
  expected,
  delta,
  unit,
  color,
  goalTarget,
  daysElapsed,
}: {
  label: string;
  consumed: number;
  expected: number;
  delta: number;
  unit: string;
  color: "orange" | "blue" | "green";
  goalTarget: number | null; // weekly deficit target for calories
  daysElapsed: number;
}) {
  const colorMap = {
    orange: { bar: "bg-orange-500", text: "text-orange-600" },
    blue: { bar: "bg-blue-500", text: "text-blue-600" },
    green: { bar: "bg-green-500", text: "text-green-600" },
  };

  // For calories with a deficit goal: progress toward deficit target
  // For protein/fiber: progress toward hitting daily targets (want delta >= 0)
  let progressPct = 0;
  let progressLabel = "";

  if (goalTarget !== null && goalTarget < 0) {
    // Deficit goal: delta should approach goalTarget
    // Pro-rate the target by days elapsed
    const proratedTarget = (goalTarget / 7) * daysElapsed;
    progressPct = Math.min(
      Math.max((delta / proratedTarget) * 100, 0),
      150
    );
    progressLabel = `${delta >= 0 ? "+" : ""}${delta} / ${Math.round(proratedTarget)} ${unit} target`;
  } else {
    // Maintenance or protein/fiber: delta should be ~0 or positive
    progressPct = expected > 0 ? Math.min((consumed / expected) * 100, 100) : 0;
    progressLabel =
      delta >= 0
        ? `+${delta} ${unit} over baseline`
        : `${delta} ${unit} under baseline`;
  }

  return (
    <div>
      <div className="flex justify-between text-sm mb-0.5">
        <span className={`font-medium ${colorMap[color].text}`}>{label}</span>
        <span className="text-gray-500">
          {consumed} / {expected} {unit} expected
        </span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-2 mb-1">
        <div
          className={`${colorMap[color].bar} h-2 rounded-full transition-all duration-300`}
          style={{ width: `${Math.min(progressPct, 100)}%` }}
        />
      </div>
      <p
        className={`text-xs ${
          goalTarget !== null
            ? delta <= (goalTarget / 7) * daysElapsed
              ? "text-green-600"
              : "text-gray-500"
            : delta >= 0
              ? "text-green-600"
              : "text-red-500"
        }`}
      >
        {progressLabel}
      </p>
    </div>
  );
}
