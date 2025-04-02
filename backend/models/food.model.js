import mongoose from "mongoose";

const FoodSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    ingredients: { type: String, required: true },
    type: { type: String, enum: ["Vegetarian", "Non-Vegetarian", "Vegan"], required: true },
    quantity: { type: Number, required: true, min: 1 },
    status: { type: String, enum: ["available", "booked"], default: "available" },
    restaurant: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    ngo: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // 🆕 Added NGO reference
  },
  { timestamps: true }
);

const Food = mongoose.model("Food", FoodSchema);
export default Food;
