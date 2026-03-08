export interface NutritionEntry {
  id: number;
  createdAt: string;
  description: string;
  calories: number;
  protein: number;
  fiber: number;
  type: string;
}

export interface PresetFood {
  id: number;
  name: string;
  calories: number;
  protein: number;
  fiber: number;
}

export interface UserSettings {
  id: number;
  dailyCalorieTarget: number;
  dailyProteinTarget: number;
  dailyFiberTarget: number;
}

export interface ParsedFood {
  calories: number;
  protein: number;
  fiber: number;
}

export interface WeightEntry {
  id: number;
  date: string;
  weight: number;
  createdAt: string;
}

export interface WeeklyGoal {
  id: number;
  weekStartDate: string;
  calorieTarget: number;
  proteinTarget: number;
  fiberTarget: number;
  goalType: string;
  targetDeficit: number | null;
  createdAt: string;
}

export interface WeeklySummary {
  weekStart: string;
  weekEnd: string;
  calories: number;
  protein: number;
  fiber: number;
  entryCount: number;
  daysElapsed: number;
  dailyCalorieTarget: number;
  dailyProteinTarget: number;
  dailyFiberTarget: number;
  goal: WeeklyGoal | null;
}

const api = {
  async getEntries(date?: string): Promise<NutritionEntry[]> {
    const url = date ? `/api/entries?date=${date}` : "/api/entries";
    const res = await fetch(url);
    return res.json();
  },

  async addEntry(entry: {
    description: string;
    calories: number;
    protein: number;
    fiber: number;
    type: string;
  }): Promise<NutritionEntry> {
    const res = await fetch("/api/entries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(entry),
    });
    return res.json();
  },

  async deleteEntry(id: number): Promise<void> {
    await fetch(`/api/entries/${id}`, { method: "DELETE" });
  },

  async updateEntry(
    id: number,
    updates: {
      description?: string;
      calories?: number;
      protein?: number;
      fiber?: number;
      date?: string;
    }
  ): Promise<NutritionEntry> {
    const res = await fetch(`/api/entries/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    return res.json();
  },

  async getPresets(): Promise<PresetFood[]> {
    const res = await fetch("/api/presets");
    return res.json();
  },

  async addPreset(preset: {
    name: string;
    calories: number;
    protein: number;
    fiber: number;
  }): Promise<PresetFood> {
    const res = await fetch("/api/presets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(preset),
    });
    return res.json();
  },

  async deletePreset(id: number): Promise<void> {
    await fetch(`/api/presets/${id}`, { method: "DELETE" });
  },

  async getSettings(): Promise<UserSettings> {
    const res = await fetch("/api/settings");
    return res.json();
  },

  async updateSettings(settings: {
    dailyCalorieTarget: number;
    dailyProteinTarget: number;
    dailyFiberTarget: number;
  }): Promise<UserSettings> {
    const res = await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });
    return res.json();
  },

  // Weight entries
  async getWeightEntries(): Promise<WeightEntry[]> {
    const res = await fetch("/api/weight");
    return res.json();
  },

  async addWeightEntry(entry: {
    date: string;
    weight: number;
  }): Promise<WeightEntry> {
    const res = await fetch("/api/weight", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(entry),
    });
    return res.json();
  },

  async updateWeightEntry(
    id: number,
    entry: { date?: string; weight?: number }
  ): Promise<WeightEntry> {
    const res = await fetch(`/api/weight/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(entry),
    });
    return res.json();
  },

  async deleteWeightEntry(id: number): Promise<void> {
    await fetch(`/api/weight/${id}`, { method: "DELETE" });
  },

  // Weekly goals
  async getGoals(): Promise<WeeklyGoal[]> {
    const res = await fetch("/api/goals");
    return res.json();
  },

  async getActiveGoal(weekStart?: string): Promise<WeeklyGoal | null> {
    const url = weekStart
      ? `/api/goals/active?week_start=${weekStart}`
      : "/api/goals/active";
    const res = await fetch(url);
    return res.json();
  },

  async createGoal(goal: {
    weekStartDate: string;
    calorieTarget: number;
    proteinTarget: number;
    fiberTarget: number;
    goalType: string;
    targetDeficit?: number;
  }): Promise<WeeklyGoal> {
    const res = await fetch("/api/goals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(goal),
    });
    return res.json();
  },

  async deleteGoal(id: number): Promise<void> {
    await fetch(`/api/goals/${id}`, { method: "DELETE" });
  },

  // Weekly summaries
  async getWeeklySummaries(weeks?: number): Promise<WeeklySummary[]> {
    const url = weeks
      ? `/api/weekly-summaries?weeks=${weeks}`
      : "/api/weekly-summaries";
    const res = await fetch(url);
    return res.json();
  },

  async parseFood(description: string): Promise<ParsedFood> {
    const res = await fetch("/api/parse", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ description }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to parse food");
    }
    return res.json();
  },
};

export default api;
