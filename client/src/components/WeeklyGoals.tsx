import { useState, useEffect } from "react";
import api, { WeeklyGoal, UserSettings } from "../lib/api";

function getMonday(): string {
  const now = new Date(
    new Date().toLocaleString("en-US", { timeZone: "America/New_York" })
  );
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  now.setDate(diff);
  return now.toLocaleDateString("en-CA");
}

export default function WeeklyGoals() {
  const [goals, setGoals] = useState<WeeklyGoal[]>([]);
  const [activeGoal, setActiveGoal] = useState<WeeklyGoal | null>(null);
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);

  const [weekStartDate, setWeekStartDate] = useState(getMonday());
  const [goalType, setGoalType] = useState<"maintenance" | "deficit">(
    "maintenance"
  );
  const [targetDeficit, setTargetDeficit] = useState("");

  async function loadGoals() {
    try {
      const [g, active, s] = await Promise.all([
        api.getGoals(),
        api.getActiveGoal(),
        api.getSettings(),
      ]);
      setGoals(g);
      setActiveGoal(active);
      setSettings(s);

      if (active) {
        setGoalType(active.goalType as "maintenance" | "deficit");
        if (active.targetDeficit)
          setTargetDeficit(String(active.targetDeficit));
      }
    } catch (error) {
      console.error("Failed to load goals:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadGoals();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!settings) return;

    // Store daily targets as snapshot in the goal record
    await api.createGoal({
      weekStartDate,
      calorieTarget: settings.dailyCalorieTarget,
      proteinTarget: settings.dailyProteinTarget,
      fiberTarget: settings.dailyFiberTarget,
      goalType,
      targetDeficit:
        goalType === "deficit" ? parseFloat(targetDeficit) : undefined,
    });
    loadGoals();
  }

  async function handleDelete(id: number) {
    await api.deleteGoal(id);
    loadGoals();
  }

  if (loading) {
    return <div className="text-center text-gray-400 py-8">Loading...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Current daily targets reference */}
      {settings && (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
            Daily Targets (from Settings)
          </h3>
          <div className="grid grid-cols-3 gap-2 text-sm text-gray-700">
            <div>Calories: {settings.dailyCalorieTarget}</div>
            <div>Protein: {settings.dailyProteinTarget}g</div>
            <div>Fiber: {settings.dailyFiberTarget}g</div>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            These are your baseline. Weekly deltas are calculated against these.
          </p>
        </div>
      )}

      {/* Active Goal */}
      {activeGoal && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-green-800 mb-1">
            Active Goal (since {activeGoal.weekStartDate})
          </h3>
          <p className="text-sm text-green-700">
            {activeGoal.goalType === "deficit"
              ? `Deficit: ${activeGoal.targetDeficit} cal/week`
              : "Maintenance (target weekly delta: 0)"}
          </p>
        </div>
      )}

      {/* Goal Form */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Set Weekly Goal
        </h3>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-xs text-gray-500 block mb-1">
              Effective From
            </label>
            <input
              type="date"
              value={weekStartDate}
              onChange={(e) => setWeekStartDate(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">
              Goal Type
            </label>
            <select
              value={goalType}
              onChange={(e) =>
                setGoalType(e.target.value as "maintenance" | "deficit")
              }
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              <option value="maintenance">Maintenance</option>
              <option value="deficit">Deficit</option>
            </select>
          </div>
          {goalType === "deficit" && (
            <div>
              <label className="text-xs text-gray-500 block mb-1">
                Weekly Calorie Deficit Target
              </label>
              <input
                type="number"
                placeholder="e.g. -2625 (for ~0.75 lb/week)"
                value={targetDeficit}
                onChange={(e) => setTargetDeficit(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                required
              />
              <p className="text-xs text-gray-400 mt-1">
                -1750 = ~0.5 lb/week &middot; -2625 = ~0.75 lb/week &middot;
                -3500 = ~1 lb/week
              </p>
            </div>
          )}
          <button
            type="submit"
            className="w-full bg-gray-900 text-white py-2 rounded-lg text-sm font-medium"
          >
            Save Goal
          </button>
        </form>
      </div>

      {/* Goal History */}
      {goals.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide px-4 pt-4 pb-2">
            Goal History
          </h3>
          <ul className="divide-y divide-gray-100">
            {goals.map((goal) => (
              <li
                key={goal.id}
                className="px-4 py-3 flex items-center gap-3"
              >
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    From {goal.weekStartDate}
                  </p>
                  <p className="text-xs text-gray-500">
                    {goal.goalType === "deficit"
                      ? `Deficit: ${goal.targetDeficit} cal/week`
                      : "Maintenance"}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(goal.id)}
                  className="text-gray-300 hover:text-red-500 text-sm"
                >
                  &times;
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
