import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, required: true },
    userType: { type: String, enum: ["restaurant", "ngo"], required: true },
    gstNumber: {
      type: String,
      required: function () {
        return this.userType === "restaurant";
      },
    }, // Required for restaurants
    darpanId: {
      type: String,
      required: function () {
        return this.userType === "ngo";
      },
    }, // Required for NGOs
  },
  { timestamps: true }
);

const User = mongoose.model("User", UserSchema);
export default User; // Export as default
