import { Router } from "express";
import { db } from "../db";
import { presetFoods } from "../db/schema";
import { eq } from "drizzle-orm";

const router = Router();

// Get all presets
router.get("/", async (_req, res) => {
  try {
    const presets = await db
      .select()
      .from(presetFoods)
      .orderBy(presetFoods.name);
    res.json(presets);
  } catch (error) {
    console.error("Error fetching presets:", error);
    res.status(500).json({ error: "Failed to fetch presets" });
  }
});

// Create preset
router.post("/", async (req, res) => {
  try {
    const { name, calories, protein, fiber } = req.body;
    const [preset] = await db
      .insert(presetFoods)
      .values({ name, calories, protein, fiber })
      .returning();
    res.json(preset);
  } catch (error) {
    console.error("Error creating preset:", error);
    res.status(500).json({ error: "Failed to create preset" });
  }
});

// Delete preset
router.delete("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(presetFoods).where(eq(presetFoods.id, id));
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting preset:", error);
    res.status(500).json({ error: "Failed to delete preset" });
  }
});

export default router;
