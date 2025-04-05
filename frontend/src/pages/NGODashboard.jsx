import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout } from '../redux/user/userslice.js';

const NgoDashboard = () => {
  const [foodItems, setFoodItems] = useState([]);
  const [bookedOrders, setBookedOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const user = useSelector((state) => state.user.user);
  const token = user?.token;
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate("/signin");
  };

  useEffect(() => {
    fetchFoodItems();
    fetchBookedOrders();

    const interval = setInterval(() => {
      fetchFoodItems();
      fetchBookedOrders();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const fetchFoodItems = async () => {
    try {
      const res = await fetch("/backend/food/all", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      setFoodItems(data);
    } catch (err) {
      setError("Error fetching food items.");
    }
  };

  const fetchBookedOrders = async () => {
    try {
      const res = await fetch(`/backend/food/orders/${user.user._id}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      setBookedOrders(Array.isArray(data.orders) ? data.orders : []);
    } catch (err) {
      setError("Error fetching booked orders.");
    }
  };

  const bookFood = async (foodId) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/backend/food/book/${foodId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          foodId,
          ngoId: user.user._id,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Booking failed");

      alert("Food booked successfully!");
      fetchFoodItems();
      fetchBookedOrders();
    } catch (err) {
      setError(err.message || "Error booking food.");
    } finally {
      setLoading(false);
    }
  };

  const cancelBooking = async (foodId) => {
    try {
      const res = await fetch(`/backend/food/cancel/${foodId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Cancel failed");

      alert("Order cancelled successfully");
      fetchFoodItems();
      fetchBookedOrders();
    } catch (err) {
      setError(err.message || "Error cancelling order.");
    }
  };

  const canCancel = (orderTime) => {
    const now = new Date();
    const createdAt = new Date(orderTime);
    return (now - createdAt) / 1000 <= 60;
  };

  const getPickupTime = (createdAt) => {
    const pickup = new Date(new Date(createdAt).getTime() + 60 * 60 * 1000);
    return pickup.toLocaleString();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-extrabold text-green-600">NGO Dashboard</h1>
          <button onClick={handleLogout} className="text-red-600 font-semibold hover:underline">
            Sign Out
          </button>
        </div>

        {error && <p className="text-red-500 text-center">{error}</p>}

        {/* Available Food Section */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Available Food</h2>
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {foodItems.length > 0 ? (
              foodItems.map((food) => (
                <div key={food._id} className="bg-white rounded-xl shadow p-5 transition hover:shadow-lg">
                  <h3 className="text-xl font-bold text-gray-700">{food.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">Ingredients: {food.ingredients}</p>
                  <p className="text-sm text-gray-600">Type: {food.type}</p>
                  <p className="text-sm text-gray-600 mb-4">Quantity: {food.quantity}</p>
                  <button
                    onClick={() => bookFood(food._id)}
                    disabled={loading}
                    className="bg-green-500 hover:bg-green-600 text-white w-full py-2 rounded transition"
                  >
                    {loading ? "Booking..." : "Book Now"}
                  </button>
                </div>
              ))
            ) : (
              <p className="text-gray-500 col-span-3 text-center">No available food items.</p>
            )}
          </div>
        </section>

        {/* Booked Orders Section */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Your Booked Orders</h2>
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {bookedOrders.length > 0 ? (
              bookedOrders.map((order) => (
                <div key={order._id} className="bg-white rounded-xl shadow p-5 transition hover:shadow-lg">
                  <h3 className="text-xl font-bold text-gray-700">{order.name}</h3>
                  <p className="text-sm text-gray-600">Restaurant: {order?.restaurant?.name || "N/A"}</p>
                  <p className="text-sm text-gray-600">Ingredients: {order.ingredients}</p>
                  <p className="text-sm text-gray-600">Type: {order.type}</p>
                  <p className="text-sm text-gray-600">Quantity: {order.quantity}</p>
                  <p className="text-sm text-gray-600">Status: {order.status}</p>
                  <p className="text-sm text-gray-600 mb-4">Pickup By: {getPickupTime(order.updatedAt)}</p>

                  {canCancel(order.updatedAt) && (
                    <button
                      onClick={() => cancelBooking(order._id)}
                      className="bg-red-500 hover:bg-red-600 text-white w-full py-2 rounded transition"
                    >
                      Cancel Order
                    </button>
                  )}
                </div>
              ))
            ) : (
              <p className="text-gray-500 col-span-3 text-center">No booked orders found.</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default NgoDashboard;
