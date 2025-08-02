import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout } from '../redux/user/userslice.js';

const NgoDashboard = () => {
  const [foodItems, setFoodItems] = useState([]);
  const [bookedOrders, setBookedOrders] = useState([]);
  const [report, setReport] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const user = useSelector((state) => state.user.user);
  const token = user?.token;
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Logout handler
  const handleLogout = () => {
    dispatch(logout());
    navigate("/signin");
  };

  // Fetch food items and booked orders on mount + every 5 seconds
  useEffect(() => {
    const fetchData = () => {
      fetchFoodItems();
      fetchBookedOrders();
    };

    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  // Fetch available food items
  const fetchFoodItems = async () => {
    try {
      const res = await fetch("/backend/food/all", {
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch food items.");
      const data = await res.json();
      setFoodItems(data);
      setError(null);
    } catch {
      setError("Error fetching food items.");
    }
  };

  // Fetch booked orders for the NGO
  const fetchBookedOrders = async () => {
    try {
      const res = await fetch(`/backend/food/orders/${user.user._id}`, {
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch booked orders.");
      const data = await res.json();
      setBookedOrders(Array.isArray(data.orders) ? data.orders : []);
      setError(null);
    } catch {
      setError("Error fetching booked orders.");
    }
  };

  // Book a food item
  const bookFood = async (foodId) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/backend/food/book/${foodId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ foodId, ngoId: user.user._id }),
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

  // Cancel a booking
  const cancelBooking = async (foodId) => {
    try {
      const res = await fetch(`/backend/food/cancel/${foodId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
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

  // Determine if cancellation is allowed (within 60 seconds)
  const canCancel = (orderTime) => {
    const now = new Date();
    const createdAt = new Date(orderTime);
    return (now - createdAt) / 1000 <= 60;
  };

  // Get pickup time (1 hour after update)
  const getPickupTime = (createdAt) => {
    const pickup = new Date(new Date(createdAt).getTime() + 60 * 60 * 1000);
    return pickup.toLocaleString();
  };

  // Generate report from backend
  const generateReport = async () => {
    setLoading(true);
    setError(null);
    setReport("");

    try {
      const res = await fetch("/backend/food/report", {
        method: "GET",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Report generation failed");
      setReport(data.report);
    } catch (err) {
      setError(err.message || "Error generating report.");
    } finally {
      setLoading(false);
    }
  };
  const downloadReport = () => {
  if (!report) return;

  const blob = new Blob([report], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = "ngo_report.txt";
  document.body.appendChild(link);
  link.click();

  // Clean up
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-extrabold text-green-600">NGO Dashboard</h1>
          <div className="flex items-center space-x-4">
            <button
              onClick={generateReport}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded disabled:opacity-50 transition"
            >
              {loading ? "Generating..." : "Generate Report"}
            </button>
            <button
              onClick={handleLogout}
              className="text-red-600 font-semibold hover:underline"
            >
              Sign Out
            </button>
          </div>
        </header>

        {/* Error Message */}
        {error && (
          <p className="text-red-500 text-center mb-4">{error}</p>
        )}

        {/* Available Food Section */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Available Food</h2>
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {foodItems.length ? (
              foodItems.map((food) => (
                <div
                  key={food._id}
                  className="bg-white rounded-xl shadow p-5 transition hover:shadow-lg"
                >
                  <h3 className="text-xl font-bold text-gray-700">{food.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">Ingredients: {food.ingredients}</p>
                  <p className="text-sm text-gray-600">Type: {food.type}</p>
                  <p className="text-sm text-gray-600 mb-4">Quantity: {food.quantity}</p>
                  <button
                    onClick={() => bookFood(food._id)}
                    disabled={loading}
                    className="bg-green-500 hover:bg-green-600 text-white w-full py-2 rounded transition disabled:opacity-50"
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
        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Your Booked Orders</h2>
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {bookedOrders.length ? (
              bookedOrders.map((order) => (
                <div
                  key={order._id}
                  className="bg-white rounded-xl shadow p-5 transition hover:shadow-lg"
                >
                  <h3 className="text-xl font-bold text-gray-700">{order.name}</h3>
                  <p className="text-sm text-gray-600">
                    Restaurant: {order?.restaurant?.name || "N/A"}
                  </p>
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

        {/* Report Section */}
        {loading && !report && (
          <div className="bg-white p-4 rounded-lg shadow mb-4">
            <p className="text-blue-600 font-semibold animate-pulse">
              📄 Generating report, please wait...
            </p>
          </div>
        )}

        {report && (
  <section className="mt-10">
    <h2 className="text-2xl font-semibold text-gray-800 mb-4">📊 Generated Report</h2>
    <div className="bg-white shadow p-6 rounded-lg overflow-auto max-h-[600px] border border-gray-200 whitespace-pre-wrap text-gray-800 text-sm font-mono">
      {report}
    </div>
    <button
      onClick={downloadReport}
      className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded transition"
    >
      Download Report
    </button>
  </section>
)}

       
      </div>
    </div>
  );
};

export default NgoDashboard;
