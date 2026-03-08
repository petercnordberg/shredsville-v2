import { useState, useEffect } from "react";
import api, { WeeklySummary } from "../lib/api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
} from "recharts";

type ChartRange = "6w" | "6m" | "1y" | "all";

const RANGE_WEEKS: Record<ChartRange, number> = {
  "6w": 6,
  "6m": 26,
  "1y": 52,
  "all": 520,
};

export default function InsightsCharts() {
  const [summaries, setSummaries] = useState<WeeklySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState<ChartRange>("6w");

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await api.getWeeklySummaries(RANGE_WEEKS[range]);
        setSummaries(data);
      } catch (error) {
        console.error("Failed to load summaries:", error);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [range]);

  if (loading) {
    return <div className="text-center text-gray-400 py-8">Loading...</div>;
  }

  // Only show weeks with entries, compute deltas
  const chartData = summaries
    .filter((s) => s.entryCount > 0)
    .map((s) => {
      const expectedCal = s.dailyCalorieTarget * s.daysElapsed;
      const expectedPro = s.dailyProteinTarget * s.daysElapsed;
      const expectedFib = s.dailyFiberTarget * s.daysElapsed;

      return {
        week: s.weekStart.slice(5), // MM-DD
        calDelta: Math.round(s.calories - expectedCal),
        proDelta: Math.round(s.protein - expectedPro),
        fibDelta: Math.round(s.fiber - expectedFib),
        goalType: s.goal?.goalType || null,
        targetDeficit: s.goal?.targetDeficit || null,
      };
    });

  if (chartData.length === 0) {
    return (
      <div className="text-center text-gray-400 py-8">
        No data to display. Start logging entries to see trends.
      </div>
    );
  }

  const rangeButtons = (
    <div className="flex gap-1">
      {(["6w", "6m", "1y", "all"] as const).map((r) => (
        <button
          key={r}
          onClick={() => setRange(r)}
          className={`px-2 py-0.5 text-xs rounded ${
            range === r
              ? "bg-gray-900 text-white"
              : "bg-gray-100 text-gray-600"
          }`}
        >
          {r === "all" ? "All" : r}
        </button>
      ))}
    </div>
  );

  // Get the most recent deficit target for reference line
  const latestDeficit = chartData
    .slice()
    .reverse()
    .find((d) => d.targetDeficit)?.targetDeficit;

  return (
    <div className="space-y-4">
      {/* Range Controls */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
          Weekly Deltas from Baseline
        </h3>
        {rangeButtons}
      </div>

      {/* Calorie Delta */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <h3 className="text-sm font-semibold text-orange-600 mb-3">
          Calorie Delta
        </h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="week" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} />
            <Tooltip
              formatter={(value: number) => [
                `${value >= 0 ? "+" : ""}${value} cal`,
                "Delta",
              ]}
            />
            <ReferenceLine y={0} stroke="#9CA3AF" />
            {latestDeficit && (
              <ReferenceLine
                y={latestDeficit}
                stroke="#EF4444"
                strokeDasharray="3 3"
                label={{
                  value: `Goal: ${latestDeficit}`,
                  fontSize: 10,
                  fill: "#EF4444",
                  position: "right",
                }}
              />
            )}
            <Bar dataKey="calDelta" radius={[2, 2, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell
                  key={index}
                  fill={entry.calDelta <= 0 ? "#22C55E" : "#F97316"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <p className="text-xs text-gray-400 mt-1">
          Green = under baseline, Orange = over baseline
        </p>
      </div>

      {/* Protein Delta */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <h3 className="text-sm font-semibold text-blue-600 mb-3">
          Protein Delta
        </h3>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="week" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} />
            <Tooltip
              formatter={(value: number) => [
                `${value >= 0 ? "+" : ""}${value}g`,
                "Delta",
              ]}
            />
            <ReferenceLine y={0} stroke="#9CA3AF" />
            <Bar dataKey="proDelta" radius={[2, 2, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell
                  key={index}
                  fill={entry.proDelta >= 0 ? "#3B82F6" : "#EF4444"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <p className="text-xs text-gray-400 mt-1">
          Blue = hitting target, Red = under target
        </p>
      </div>

      {/* Fiber Delta */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <h3 className="text-sm font-semibold text-green-600 mb-3">
          Fiber Delta
        </h3>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="week" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} />
            <Tooltip
              formatter={(value: number) => [
                `${value >= 0 ? "+" : ""}${value}g`,
                "Delta",
              ]}
            />
            <ReferenceLine y={0} stroke="#9CA3AF" />
            <Bar dataKey="fibDelta" radius={[2, 2, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell
                  key={index}
                  fill={entry.fibDelta >= 0 ? "#22C55E" : "#EF4444"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <p className="text-xs text-gray-400 mt-1">
          Green = hitting target, Red = under target
        </p>
      </div>
    </div>
  );
}
