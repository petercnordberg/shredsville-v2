import { Router } from "express";
import { getDb } from "../db";
import { weightEntries } from "../db/schema";
import { eq, desc } from "drizzle-orm";

const router = Router();

// Get all weight entries
router.get("/", async (_req, res) => {
  try {
    const entries = await getDb()
      .select()
      .from(weightEntries)
      .orderBy(desc(weightEntries.date));
    res.json(entries);
  } catch (error) {
    console.error("Error fetching weight entries:", error);
    res.status(500).json({ error: "Failed to fetch weight entries" });
  }
});

// Add weight entry
router.post("/", async (req, res) => {
  try {
    const { date, weight } = req.body;
    const [entry] = await getDb()
      .insert(weightEntries)
      .values({ date, weight })
      .returning();
    res.json(entry);
  } catch (error) {
    console.error("Error creating weight entry:", error);
    res.status(500).json({ error: "Failed to create weight entry" });
  }
});

// Update weight entry
router.put("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { date, weight } = req.body;
    const updates: Partial<{ date: string; weight: number }> = {};
    if (date !== undefined) updates.date = date;
    if (weight !== undefined) updates.weight = weight;

    const [entry] = await getDb()
      .update(weightEntries)
      .set(updates)
      .where(eq(weightEntries.id, id))
      .returning();
    res.json(entry);
  } catch (error) {
    console.error("Error updating weight entry:", error);
    res.status(500).json({ error: "Failed to update weight entry" });
  }
});

// Delete weight entry
router.delete("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await getDb().delete(weightEntries).where(eq(weightEntries.id, id));
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting weight entry:", error);
    res.status(500).json({ error: "Failed to delete weight entry" });
  }
});

export default router;
