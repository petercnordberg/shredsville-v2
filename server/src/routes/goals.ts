import { Router } from "express";
import { getDb } from "../db";
import { weeklyGoals } from "../db/schema";
import { eq, desc, lte } from "drizzle-orm";

const router = Router();

function getMonday(): string {
  const now = new Date(
    new Date().toLocaleString("en-US", { timeZone: "America/New_York" })
  );
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  now.setDate(diff);
  return now.toLocaleDateString("en-CA");
}

// Get all goals
router.get("/", async (_req, res) => {
  try {
    const goals = await getDb()
      .select()
      .from(weeklyGoals)
      .orderBy(desc(weeklyGoals.weekStartDate));
    res.json(goals);
  } catch (error) {
    console.error("Error fetching goals:", error);
    res.status(500).json({ error: "Failed to fetch goals" });
  }
});

// Get active goal for a given week
router.get("/active", async (req, res) => {
  try {
    const weekStart = req.query.week_start as string | undefined;
    const dateToCheck = weekStart || getMonday();

    const [goal] = await getDb()
      .select()
      .from(weeklyGoals)
      .where(lte(weeklyGoals.weekStartDate, dateToCheck))
      .orderBy(desc(weeklyGoals.weekStartDate))
      .limit(1);

    res.json(goal || null);
  } catch (error) {
    console.error("Error fetching active goal:", error);
    res.status(500).json({ error: "Failed to fetch active goal" });
  }
});

// Create goal
router.post("/", async (req, res) => {
  try {
    const {
      weekStartDate,
      calorieTarget,
      proteinTarget,
      fiberTarget,
      goalType,
      targetDeficit,
    } = req.body;
    const [goal] = await getDb()
      .insert(weeklyGoals)
      .values({
        weekStartDate,
        calorieTarget,
        proteinTarget,
        fiberTarget,
        goalType,
        targetDeficit: targetDeficit ?? null,
      })
      .returning();
    res.json(goal);
  } catch (error) {
    console.error("Error creating goal:", error);
    res.status(500).json({ error: "Failed to create goal" });
  }
});

// Update goal
router.put("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const {
      weekStartDate,
      calorieTarget,
      proteinTarget,
      fiberTarget,
      goalType,
      targetDeficit,
    } = req.body;
    const [goal] = await getDb()
      .update(weeklyGoals)
      .set({
        weekStartDate,
        calorieTarget,
        proteinTarget,
        fiberTarget,
        goalType,
        targetDeficit: targetDeficit ?? null,
      })
      .where(eq(weeklyGoals.id, id))
      .returning();
    res.json(goal);
  } catch (error) {
    console.error("Error updating goal:", error);
    res.status(500).json({ error: "Failed to update goal" });
  }
});

// Delete goal
router.delete("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await getDb().delete(weeklyGoals).where(eq(weeklyGoals.id, id));
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting goal:", error);
    res.status(500).json({ error: "Failed to delete goal" });
  }
});

export default router;
