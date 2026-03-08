import { useState } from "react";
import WeeklyProgress from "./WeeklyProgress";
import WeightTracker from "./WeightTracker";
import WeeklyGoals from "./WeeklyGoals";
import NutritionHistory from "./NutritionHistory";
import InsightsCharts from "./InsightsCharts";

interface Props {
  onBack: () => void;
}

type Tab = "progress" | "weight" | "goals" | "history" | "trends";

export default function InsightsPage({ onBack }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("progress");

  const tabs: { id: Tab; label: string }[] = [
    { id: "progress", label: "Progress" },
    { id: "weight", label: "Weight" },
    { id: "goals", label: "Goals" },
    { id: "history", label: "History" },
    { id: "trends", label: "Trends" },
  ];

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="text-sm text-gray-500 hover:text-gray-800 transition-colors"
        >
          &larr; Back
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Insights</h1>
        <div className="w-12" />
      </div>

      <div className="flex gap-1 mb-6 overflow-x-auto pb-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${
              activeTab === tab.id
                ? "bg-gray-900 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "progress" && <WeeklyProgress />}
      {activeTab === "weight" && <WeightTracker />}
      {activeTab === "goals" && <WeeklyGoals />}
      {activeTab === "history" && <NutritionHistory />}
      {activeTab === "trends" && <InsightsCharts />}
    </div>
  );
}
