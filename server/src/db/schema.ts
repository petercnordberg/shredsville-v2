import {
  pgTable,
  serial,
  text,
  integer,
  real,
  timestamp,
} from "drizzle-orm/pg-core";

export const nutritionEntries = pgTable("nutrition_entries", {
  id: serial("id").primaryKey(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  description: text("description").notNull(),
  calories: real("calories").notNull(),
  protein: real("protein").notNull(),
  fiber: real("fiber").notNull(),
  type: text("type").notNull().default("manual"), // 'ai' | 'manual' | 'preset'
});

export const presetFoods = pgTable("preset_foods", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  calories: real("calories").notNull(),
  protein: real("protein").notNull(),
  fiber: real("fiber").notNull(),
});

export const userSettings = pgTable("user_settings", {
  id: serial("id").primaryKey(),
  dailyCalorieTarget: integer("daily_calorie_target").notNull().default(2000),
  dailyProteinTarget: integer("daily_protein_target").notNull().default(150),
  dailyFiberTarget: integer("daily_fiber_target").notNull().default(30),
});

export const weightEntries = pgTable("weight_entries", {
  id: serial("id").primaryKey(),
  date: text("date").notNull(), // YYYY-MM-DD
  weight: real("weight").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const weeklyGoals = pgTable("weekly_goals", {
  id: serial("id").primaryKey(),
  weekStartDate: text("week_start_date").notNull(), // YYYY-MM-DD (Monday)
  calorieTarget: real("calorie_target").notNull(),
  proteinTarget: real("protein_target").notNull(),
  fiberTarget: real("fiber_target").notNull(),
  goalType: text("goal_type").notNull().default("maintenance"), // 'maintenance' | 'deficit'
  targetDeficit: real("target_deficit"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
