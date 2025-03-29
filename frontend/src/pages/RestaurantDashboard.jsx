import { useState, useEffect } from "react";
import { useSelector } from "react-redux";

const RestaurantDashboard = () => {
  const { currentUser } = useSelector((state) => state.user);
  const [formData, setFormData] = useState({
    foodName: "",
    ingredients: "",
    type: "Vegetarian",
    quantity: 1,
  });

  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/orders/${currentUser._id}`);
        const data = await response.json();
        setOrders(data);
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
    };
    fetchOrders();
  }, [currentUser._id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleQuantityChange = (amount) => {
    setFormData((prev) => ({
      ...prev,
      quantity: Math.max(1, prev.quantity + amount),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:5000/api/food/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, restaurantId: currentUser._id }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to add food");
      
      alert("Food item added successfully!");
    } catch (err) {
      console.error("Error:", err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="bg-white shadow-lg p-6 rounded-lg">
        <h1 className="text-3xl font-bold text-pink-600 text-center">{currentUser?.name} Dashboard</h1>
      </div>

      {/* Add Food Form */}
      <div className="mt-6 bg-white shadow-lg p-6 rounded-lg max-w-lg mx-auto">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Add Food Item</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="foodName"
            placeholder="Food Name"
            value={formData.foodName}
            onChange={handleChange}
            className="border p-2 w-full rounded mb-4"
            required
          />
          <input
            type="text"
            name="ingredients"
            placeholder="Ingredients"
            value={formData.ingredients}
            onChange={handleChange}
            className="border p-2 w-full rounded mb-4"
            required
          />
          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            className="border p-2 w-full rounded mb-4"
          >
            <option value="Vegetarian">Vegetarian</option>
            <option value="Non-Vegetarian">Non-Vegetarian</option>
          </select>
          <div className="flex items-center mb-4">
            <span className="mr-2">Quantity:</span>
            <button
              type="button"
              onClick={() => handleQuantityChange(-1)}
              className="bg-gray-300 px-3 py-1 rounded-l"
            >
              -
            </button>
            <span className="bg-gray-100 px-4 py-1">{formData.quantity}</span>
            <button
              type="button"
              onClick={() => handleQuantityChange(1)}
              className="bg-gray-300 px-3 py-1 rounded-r"
            >
              +
            </button>
          </div>
          <button type="submit" className="bg-pink-500 text-white py-2 w-full rounded">
            Add Food
          </button>
        </form>
      </div>

      {/* Current Orders */}
      <div className="mt-6 bg-white shadow-lg p-6 rounded-lg max-w-3xl mx-auto">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Current Orders</h2>
        {orders.length > 0 ? (
          <ul>
            {orders.map((order) => (
              <li key={order._id} className="border p-4 rounded-lg mb-3">
                <h3 className="text-lg font-bold">{order.foodName}</h3>
                <p>Quantity: {order.quantity}</p>
                <p>Ordered by: {order.ngoName}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No current orders.</p>
        )}
      </div>
    </div>
  );
};

export default RestaurantDashboard;
