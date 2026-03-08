import { Router } from "express";
import { getDb } from "../db";
import { nutritionEntries, weeklyGoals, userSettings } from "../db/schema";
import { gte, lt, desc, and, eq } from "drizzle-orm";

const router = Router();

function getETOffset(): number {
  const nowET = new Date(
    new Date().toLocaleString("en-US", { timeZone: "America/New_York" })
  );
  return nowET.getTime() - new Date().getTime();
}

function getMonday(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function formatDate(d: Date): string {
  return d.toLocaleDateString("en-CA"); // YYYY-MM-DD
}

// Get weekly nutrition summaries
router.get("/", async (req, res) => {
  try {
    const weeks = parseInt(req.query.weeks as string) || 6;

    // Get current time in Eastern
    const nowET = new Date(
      new Date().toLocaleString("en-US", { timeZone: "America/New_York" })
    );
    const currentMonday = getMonday(nowET);

    // Calculate start date (weeks ago)
    const startMonday = new Date(currentMonday);
    startMonday.setDate(startMonday.getDate() - (weeks - 1) * 7);

    // End date is end of current week (Sunday night)
    const endDate = new Date(currentMonday);
    endDate.setDate(endDate.getDate() + 7);

    // Convert to UTC for DB query
    const offsetMs = getETOffset();
    const startUTC = new Date(startMonday.getTime() - offsetMs);
    const endUTC = new Date(endDate.getTime() - offsetMs);

    // Fetch all entries in range, goals, and settings
    const [entries, goals, settingsRows] = await Promise.all([
      getDb()
        .select()
        .from(nutritionEntries)
        .where(
          and(
            gte(nutritionEntries.createdAt, startUTC),
            lt(nutritionEntries.createdAt, endUTC)
          )
        ),
      getDb()
        .select()
        .from(weeklyGoals)
        .orderBy(desc(weeklyGoals.weekStartDate)),
      getDb().select().from(userSettings).where(eq(userSettings.id, 1)),
    ]);

    const settings = settingsRows[0] || {
      dailyCalorieTarget: 2000,
      dailyProteinTarget: 150,
      dailyFiberTarget: 30,
    };

    // Days elapsed in current week (Mon=1, Tue=2, ..., Sun=7)
    const currentDayOfWeek = nowET.getDay();
    const currentDaysElapsed = currentDayOfWeek === 0 ? 7 : currentDayOfWeek;

    // Group entries by week
    const weekSummaries = [];
    for (let i = 0; i < weeks; i++) {
      const weekStart = new Date(startMonday);
      weekStart.setDate(weekStart.getDate() + i * 7);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 7);

      const weekStartUTC = new Date(weekStart.getTime() - offsetMs);
      const weekEndUTC = new Date(weekEnd.getTime() - offsetMs);

      const weekEntries = entries.filter((e) => {
        const t = new Date(e.createdAt).getTime();
        return t >= weekStartUTC.getTime() && t < weekEndUTC.getTime();
      });

      const totals = weekEntries.reduce(
        (acc, e) => ({
          calories: acc.calories + e.calories,
          protein: acc.protein + e.protein,
          fiber: acc.fiber + e.fiber,
        }),
        { calories: 0, protein: 0, fiber: 0 }
      );

      const weekStartStr = formatDate(weekStart);
      const weekEndSunday = new Date(weekEnd.getTime() - 86400000);

      // Current week vs past weeks
      const isCurrentWeek =
        formatDate(currentMonday) === formatDate(weekStart);
      const daysElapsed = isCurrentWeek ? currentDaysElapsed : 7;

      // Find active goal for this week
      const activeGoal =
        goals.find((g) => g.weekStartDate <= weekStartStr) || null;

      weekSummaries.push({
        weekStart: weekStartStr,
        weekEnd: formatDate(weekEndSunday),
        ...totals,
        entryCount: weekEntries.length,
        daysElapsed,
        dailyCalorieTarget: settings.dailyCalorieTarget,
        dailyProteinTarget: settings.dailyProteinTarget,
        dailyFiberTarget: settings.dailyFiberTarget,
        goal: activeGoal,
      });
    }

    res.json(weekSummaries);
  } catch (error) {
    console.error("Error fetching weekly summaries:", error);
    res.status(500).json({ error: "Failed to fetch weekly summaries" });
  }
});

export default router;
