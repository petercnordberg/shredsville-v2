import { Router } from "express";
import { db } from "../db";
import { userSettings } from "../db/schema";
import { eq } from "drizzle-orm";

const router = Router();

// Get settings (create defaults if none exist)
router.get("/", async (_req, res) => {
  try {
    const rows = await db.select().from(userSettings);
    if (rows.length === 0) {
      const [settings] = await db
        .insert(userSettings)
        .values({})
        .returning();
      return res.json(settings);
    }
    res.json(rows[0]);
  } catch (error) {
    console.error("Error fetching settings:", error);
    res.status(500).json({ error: "Failed to fetch settings" });
  }
});

// Update settings
router.put("/", async (req, res) => {
  try {
    const { dailyCalorieTarget, dailyProteinTarget, dailyFiberTarget } =
      req.body;
    const rows = await db.select().from(userSettings);
    if (rows.length === 0) {
      const [settings] = await db
        .insert(userSettings)
        .values({ dailyCalorieTarget, dailyProteinTarget, dailyFiberTarget })
        .returning();
      return res.json(settings);
    }
    const [settings] = await db
      .update(userSettings)
      .set({ dailyCalorieTarget, dailyProteinTarget, dailyFiberTarget })
      .where(eq(userSettings.id, rows[0].id))
      .returning();
    res.json(settings);
  } catch (error) {
    console.error("Error updating settings:", error);
    res.status(500).json({ error: "Failed to update settings" });
  }
});

export default router;
