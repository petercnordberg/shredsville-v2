import { Router } from "express";
import { getDb } from "../db";
import { nutritionEntries } from "../db/schema";
import { eq, and, gte, lt } from "drizzle-orm";

const router = Router();

function getTodayRange() {
  // Get current time in America/New_York, then compute midnight-to-midnight range
  const eastern = new Date(
    new Date().toLocaleString("en-US", { timeZone: "America/New_York" })
  );
  const startET = new Date(eastern.getFullYear(), eastern.getMonth(), eastern.getDate());
  const endET = new Date(startET);
  endET.setDate(endET.getDate() + 1);

  // Convert back to UTC for database comparison
  const offsetMs = eastern.getTime() - new Date().getTime();
  const start = new Date(startET.getTime() - offsetMs);
  const end = new Date(endET.getTime() - offsetMs);
  return { start, end };
}

// Get today's entries
router.get("/", async (_req, res) => {
  try {
    const { start, end } = getTodayRange();
    const entries = await getDb()
      .select()
      .from(nutritionEntries)
      .where(
        and(
          gte(nutritionEntries.createdAt, start),
          lt(nutritionEntries.createdAt, end)
        )
      )
      .orderBy(nutritionEntries.createdAt);
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
