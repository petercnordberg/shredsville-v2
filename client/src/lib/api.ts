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

const api = {
  async getEntries(): Promise<NutritionEntry[]> {
    const res = await fetch("/api/entries");
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
