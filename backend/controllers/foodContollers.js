import Food from "../models/food.model.js";
import User from "../models/user.model.js";
import nodemailer from 'nodemailer';

import mongoose from "mongoose";

export const addFood = async (req, res) => {
    try {
      const { name, ingredients, type, quantity } = req.body;
  
     
      const restaurant = await User.findById(req.user._id);
      if (!restaurant || restaurant.userType !== "restaurant") {
        return res.status(403).json({ message: "Only restaurants can add food." });
      }
  
      const newFood = new Food({
        name,
        ingredients,
        type,
        quantity,
        restaurant: req.user._id, 
      });
  
      await newFood.save();
    
  
      res.status(201).json({ message: "Food added successfully", food: newFood });
    } catch (error) {
      res.status(500).json({ message: "Error adding food", error: error.message });
    }
  };
  


  export const getListingsByRestaurant = async (req, res) => {
    try {
      const {restaurantId} = req.params;

      console.log("hellos",restaurantId)
      const listings = await Food.find({ restaurant: restaurantId }).populate("restaurant");
  
      res.status(200).json(listings);
    } catch (error) {
      console.error("Error fetching listings:", error);
      res.status(500).json({ message: "Server error while fetching listings." });
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

    const foodItem = await Food.findById(foodId).populate("restaurant");
    if (!foodItem || foodItem.status !== "available") {
      return res.status(400).json({ message: "Food item is not available" });
    }

    foodItem.status = "booked";
    foodItem.ngo = ngoId;
    console.log("HI",ngo.email);
    await foodItem.save();
    res.json({ message: "Food booked successfully", food: foodItem });
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: ngo.email,
      subject: "Food Booking Confirmation",
      text: `Hello ${ngo.name},

      Your booking for the food item "${foodItem.name}" has been successfully confirmed by ${foodItem.restaurant?.name || "the restaurant"}.
      
      📞 Please reach out at: ${foodItem.restaurant?.phone || "N/A"} to coordinate pickup. Ensure pickup within 1 hour.
      
      Let's fight food waste together!
      
      ❤️ The FoodShare Team`,
      
    };
    const mailOption = {
      from: process.env.EMAIL_USER,
      to: foodItem.restaurant.email,
      subject: "Food Booking Confirmation",
      text: `Hello ${foodItem.restaurant.name },

      Your booking for the food item "${foodItem.name}" has been successfully confirmed by ${ngo.name || "the restaurant"}.
      
      📞 Please reach out at: ${foodItem.restaurant?.phone || "N/A"} to coordinate pickup. Ensure pickup within 1 hour.
      
      Let's fight food waste together!
      
      ❤️ The FoodShare Team`,
      
    };


    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending confirmation email:", error);
      } else {
        console.log("Confirmation email sent:", info.response);
      }
    });
    transporter.sendMail(mailOption, (error, info) => {
      if (error) {
        console.error("Error sending confirmation email:", error);
      } else {
        console.log("Confirmation email sent:", info.response);
      }
    });
    

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

    const ngo = await User.findById(ngoId);
    if (!ngo || ngo.userType !== "ngo") {
      return res.status(404).json({ message: "NGO not found" });
    }

    const bookedOrders = await Food.find({ngo: ngoId, status: "booked" })
      .populate("restaurant", "name") .populate("ngo", "name phone"); // Include restaurant name
  
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

export const cancelFoodOrder = async (req, res) => {
  const foodId = req.params.id;

  try {
    const foodItem = await Food.findById(foodId);
    if (!foodItem) return res.status(404).json({ message: "Food item not found" });

    foodItem.status = "available";
    foodItem.ngo = null;

    await foodItem.save();

    res.json({ message: "Order cancelled and made available again." });
  } catch (error) {
    console.error("Error cancelling food order:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteExpiredListings = async () => {
  const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000);

  try {
    const result = await Food.deleteMany({
      status: "available",
      createdAt: { $lt: twelveHoursAgo },
    });

    console.log(`${result.deletedCount} expired listings deleted.`);
  } catch (error) {
    console.error("Error deleting expired listings:", error.message);
  }
};
// controllers/foodController.js



export const deleteFood = async (req, res) => {
  try {
    const foodId = req.params.id;
    const food = await Food.findById(foodId);

    if (!food) {
      return res.status(404).json({ message: "Food item not found" });
    }

    await food.deleteOne();
    res.status(200).json({ message: "Food item deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error while deleting food", error: error.message });
  }
};
