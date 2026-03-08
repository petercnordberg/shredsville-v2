import { Router } from "express";
import { getDb } from "../db";
import { nutritionEntries } from "../db/schema";
import { eq, and, gte, lt, desc } from "drizzle-orm";

const router = Router();

function getDayRange(dateStr?: string) {
  // Get current time in America/New_York
  const nowET = new Date(
    new Date().toLocaleString("en-US", { timeZone: "America/New_York" })
  );

  let startET: Date;
  if (dateStr) {
    // dateStr is "YYYY-MM-DD" — parse as Eastern date
    const [y, m, d] = dateStr.split("-").map(Number);
    startET = new Date(y, m - 1, d);
  } else {
    startET = new Date(nowET.getFullYear(), nowET.getMonth(), nowET.getDate());
  }

  const endET = new Date(startET);
  endET.setDate(endET.getDate() + 1);

  // Convert back to UTC for database comparison
  const offsetMs = nowET.getTime() - new Date().getTime();
  const start = new Date(startET.getTime() - offsetMs);
  const end = new Date(endET.getTime() - offsetMs);
  return { start, end };
}

// Get entries for a given day (defaults to today ET)
router.get("/", async (req, res) => {
  try {
    const dateStr = req.query.date as string | undefined;
    const { start, end } = getDayRange(dateStr);
    const entries = await getDb()
      .select()
      .from(nutritionEntries)
      .where(
        and(
          gte(nutritionEntries.createdAt, start),
          lt(nutritionEntries.createdAt, end)
        )
      )
      .orderBy(desc(nutritionEntries.createdAt));
    res.json(entries);
  } catch (error) {
    console.error("Error fetching entries:", error);
    res.status(500).json({ error: "Failed to fetch entries" });
  }
});

// Add entry
router.post("/", async (req, res) => {
  try {
    const { description, calories, protein, fiber, type } = req.body;
    const [entry] = await getDb()
      .insert(nutritionEntries)
      .values({ description, calories, protein, fiber, type: type || "manual" })
      .returning();
    res.json(entry);
  } catch (error) {
    console.error("Error creating entry:", error);
    res.status(500).json({ error: "Failed to create entry" });
  }
});

// Update entry
router.put("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const updates: Record<string, unknown> = {};
    if (req.body.description !== undefined)
      updates.description = req.body.description;
    if (req.body.calories !== undefined) updates.calories = req.body.calories;
    if (req.body.protein !== undefined) updates.protein = req.body.protein;
    if (req.body.fiber !== undefined) updates.fiber = req.body.fiber;
    if (req.body.date !== undefined) {
      // Reassign to a different date - set createdAt to noon of that date in ET
      const [y, m, d] = req.body.date.split("-").map(Number);
      const noonET = new Date(y, m - 1, d, 12, 0, 0);
      const nowET = new Date(
        new Date().toLocaleString("en-US", { timeZone: "America/New_York" })
      );
      const offsetMs = nowET.getTime() - new Date().getTime();
      updates.createdAt = new Date(noonET.getTime() - offsetMs);
    }

    const [entry] = await getDb()
      .update(nutritionEntries)
      .set(updates)
      .where(eq(nutritionEntries.id, id))
      .returning();
    res.json(entry);
  } catch (error) {
    console.error("Error updating entry:", error);
    res.status(500).json({ error: "Failed to update entry" });
  }
});

// Delete entry
router.delete("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await getDb().delete(nutritionEntries).where(eq(nutritionEntries.id, id));
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting entry:", error);
    res.status(500).json({ error: "Failed to delete entry" });
  }
});

export default router;
