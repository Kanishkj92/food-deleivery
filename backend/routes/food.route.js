import express from "express";
import { addFood, getAllFood, bookFood,getBookedOrdersForNgo, getRestaurantOrders,cancelFoodOrder } from "../controllers/foodContollers.js";
import { authenticateUser, authorizeRole } from "../middlewares/authMiddleware.js";


const router = express.Router();
router.post("/add", authenticateUser, authorizeRole("restaurant"), addFood);
router.get("/all", authenticateUser, authorizeRole("ngo"), getAllFood);
router.post("/book/:foodId", authenticateUser, authorizeRole("ngo"), bookFood);
router.get("/orders/:ngoId", authenticateUser, authorizeRole("ngo"), getBookedOrdersForNgo);
router.get("/history/:restauarntId",authenticateUser, authorizeRole("restaurant"),getRestaurantOrders )
router.patch("/cancel/:id", authenticateUser, authorizeRole("ngo"), cancelFoodOrder)

export default router;
