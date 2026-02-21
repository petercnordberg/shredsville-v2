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
