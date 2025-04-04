import Food from "../models/food.model.js";
import User from "../models/user.model.js";
import mongoose from "mongoose";

export const addFood = async (req, res) => {
    try {
      const { name, ingredients, type, quantity } = req.body;
  
      // Ensure the authenticated user is a restaurant
      const restaurant = await User.findById(req.user._id);
      if (!restaurant || restaurant.userType !== "restaurant") {
        return res.status(403).json({ message: "Only restaurants can add food." });
      }
  
      const newFood = new Food({
        name,
        ingredients,
        type,
        quantity,
        restaurant: req.user._id, // Directly from authenticated user
      });
  
      await newFood.save();
      res.status(201).json({ message: "Food added successfully", food: newFood });
    } catch (error) {
      res.status(500).json({ message: "Error adding food", error: error.message });
    }
  };
  

export const getAllFood = async (req, res) => {
  try {
    const foodItems = await Food.find({ status: "available" }).populate("restaurant", "name");
    res.json(foodItems);
  } catch (error) {
    res.status(500).json({ message: "Error fetching food items", error: error.message });
  }
};

export const bookFood = async (req, res) => {
  try {
    const { foodId, ngoId } = req.body;

    const ngo = await User.findById(ngoId);
    if (!ngo || ngo.userType !== "ngo") {
      return res.status(404).json({ message: "NGO not found" });
    }

    const foodItem = await Food.findById(foodId);
    if (!foodItem || foodItem.status !== "available") {
      return res.status(400).json({ message: "Food item is not available" });
    }

    foodItem.status = "booked";
    foodItem.ngo = ngoId;

    await foodItem.save();
    res.json({ message: "Food booked successfully", food: foodItem });
  } catch (error) {
    res.status(500).json({ message: "Error booking food", error: error.message });
  }
};

export const getRestaurantOrders = async (req, res) => {
  try {
    const { restauarntId } = req.params;
    console.log("Full Request URL:", req.originalUrl);
    console.log("Request Params:", req.params);
    console.log("ido",restauarntId);
    const restaurant = await User.findById(restauarntId);
    if (!restaurant || restaurant.userType !== "restaurant") {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    const orders = await Food.find({ restaurant: restauarntId, status: "booked" }).populate("ngo", "name phone");
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Error fetching restaurant orders", error: error.message });
  }
};

export const getBookedOrdersForNgo = async (req, res) => {
  try {
    const { ngoId } = req.params;
    //console.log("Fetching booked orders for NGO ID:", ngoId); // Debug log

    // Validate if the NGO exists
    const ngo = await User.findById(ngoId);
    if (!ngo || ngo.userType !== "ngo") {
      return res.status(404).json({ message: "NGO not found" });
    }

    // Find booked food items for the NGO
    const bookedOrders = await Food.find({ngo: ngoId, status: "booked" })
      .populate("restaurant", "name") .populate("ngo", "name phone"); // Include restaurant name
      // Include NGO name
    //  console.log(ngo)
    if (bookedOrders.length === 0) {
      return res.status(200).json({ message: "No booked orders found", orders: [] });
    }

    res.status(200).json({ message: "Booked orders retrieved", orders: bookedOrders });
  } catch (error) {
    console.error("Error fetching booked orders:", error);
    res.status(500).json({ message: "Error fetching booked orders", error: error.message });
  }
};



// Cancel Order
export const cancelFoodOrder = async (req, res) => {
  const foodId = req.params.id;

  try {
    const foodItem = await Food.findById(foodId);
    if (!foodItem) return res.status(404).json({ message: "Food item not found" });

    // Reset status and remove NGO booking
    foodItem.status = "available";
    foodItem.ngo = null;

    await foodItem.save();

    res.json({ message: "Order cancelled and made available again." });
  } catch (error) {
    console.error("Error cancelling food order:", error);
    res.status(500).json({ message: "Server error" });
  }
};

