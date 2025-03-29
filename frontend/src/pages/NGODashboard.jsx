import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

const NgoDashboard = () => {
  const [foodItems, setFoodItems] = useState([]);
  const [bookedOrders, setBookedOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const user = useSelector((state) => state.user.user); // Get logged-in user

  useEffect(() => {
    fetchFoodItems();
    fetchBookedOrders();
    const interval = setInterval(() => {
      fetchFoodItems();
      fetchBookedOrders();
    }, 5000); // Refresh every 5 seconds

    return () => clearInterval(interval);
  }, []);

  // Fetch available food
  const fetchFoodItems = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/food/all");
      const data = await response.json();
      setFoodItems(data);
    } catch (error) {
      setError("Error fetching food items.");
    }
  };

  // Fetch booked orders for this NGO
  const fetchBookedOrders = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/orders/ngo/${user._id}`);
      const data = await response.json();
      setBookedOrders(data);
    } catch (error) {
      setError("Error fetching booked orders.");
    }
  };

  // Book food function
  const bookFood = async (foodId) => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/food/book/${foodId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ngoId: user._id }),
      });

      if (!response.ok) throw new Error("Booking failed");

      setFoodItems(foodItems.filter((item) => item._id !== foodId)); // Remove booked food
      fetchBookedOrders(); // Refresh booked orders list
    } catch (error) {
      setError("Error booking food.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold text-center text-green-600 mb-6">NGO Dashboard</h1>

      {error && <p className="text-red-500 text-center">{error}</p>}

      {/* Available Food Section */}
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Available Food</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {foodItems.length > 0 ? (
          foodItems.map((food) => (
            <div key={food._id} className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-bold text-gray-800">{food.name}</h2>
              <p className="text-gray-600"><b>Ingredients:</b> {food.ingredients}</p>
              <p className="text-gray-600"><b>Type:</b> {food.type}</p>
              <p className="text-gray-600"><b>Quantity:</b> {food.quantity}</p>

              <button 
                onClick={() => bookFood(food._id)}
                disabled={loading}
                className="mt-4 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 w-full"
              >
                {loading ? "Booking..." : "Book Now"}
              </button>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500 col-span-3">No available food items.</p>
        )}
      </div>

      {/* Booked Orders Section */}
      <h2 className="text-2xl font-bold text-gray-800 mt-10 mb-4">Your Booked Orders</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {bookedOrders.length > 0 ? (
          bookedOrders.map((order) => (
            <div key={order._id} className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-bold text-gray-800">{order.food.name}</h2>
              <p className="text-gray-600"><b>Quantity:</b> {order.food.quantity}</p>
              <p className="text-gray-600"><b>Restaurant:</b> {order.restaurant.name}</p>
              <p className="text-gray-600"><b>Status:</b> {order.status}</p>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500 col-span-3">No booked orders.</p>
        )}
      </div>
    </div>
  );
};

export default NgoDashboard;
