import Category from "../models/Category.js";

export const getCategories = async (req, res) => {
  try {
    const categories = await Category.findAll({ order: [["name", "ASC"]] });
    res.json({ success: true, categories });
  } catch (err) {
    console.error("GET CATEGORIES ERROR:", err);
    res.status(500).json({ success: false, error: "Server error fetching categories" });
  }
};
