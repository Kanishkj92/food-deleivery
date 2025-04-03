import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { logout } from "../redux/user/userSlice";
import { useNavigate } from "react-router-dom";

const NgoDashboard = () => {
  const [foodItems, setFoodItems] = useState([]);
  const [bookedOrders, setBookedOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate=useNavigate()
  
  const user = useSelector((state) => state.user.user); // Get logged-in user
  const token = user?.token;
  console.log("hii",user.user._id)
  const handleLogout = () => {
 //   dispatch(logout()); // Clear user state
  //  localStorage.removeItem("user"); // Remove from local storage
    navigate("/signin"); // Redirect to Sign In
  };
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
      const response = await fetch("/backend/food/all",{ method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`, // 🔹 Include token
        },});
      const data = await response.json();
      setFoodItems(data);
    } catch (error) {
      setError("Error fetching food items.");
    }
  };

  // Fetch booked orders for this NGO

 
  const bookFood = async (foodId) => {
    if (!user || !user.token) {
      setError("User not authenticated. Please log in.");
      return;
    }
  
    setLoading(true);
    setError(null);
    console.log("hoo",user.user._id)
    try {
      const response = await fetch("/backend/food/book/${foodId}", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`, // ✅ Include Auth Token
        },
        body: JSON.stringify({
          foodId,
          ngoId: user.user._id, // ✅ Send NGO ID
        }),
      });
  
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Booking failed");
  
      alert("Food booked successfully!");
      fetchFoodItems(); // ✅ Refresh available food list
     fetchBookedOrders(); // ✅ Refresh booked orders
    } catch (error) {
      setError(error.message || "Error booking food.");
    } finally {
      setLoading(false);
    }
  };
  const fetchBookedOrders = async () => {
    try {
      const response = await fetch(`/backend/food/orders/${user.user._id}`,{method:"GET",headers:{
        "Content-Type": "application/json",
        "Authorization":`Bearer ${token}`,
      },});
      const data = await response.json();
      setBookedOrders(Array.isArray(data.orders) ? data.orders : []);
      console.log("Fetched Orders:", data.orders); // Debugging

    //  alert("running")
    } catch (error) {
      setError("Error fetching booked orders.");
    }
  };

//console.log("hi ",bookedOrders.length)
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold text-center text-green-600 mb-6">NGO Dashboard</h1>
      <div className="flex justify-between mt-5">
      
        <span onClick={handleLogout} className='text-red-700 cursor-pointer '>Sign Out</span>
      </div>

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
{error && <p className="text-red-500">{error}</p>}

<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {Array.isArray(bookedOrders) && bookedOrders.length > 0 ? (
    bookedOrders.map((orders, index) => (
      <div key={index} className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold text-gray-800">{orders?.name || "No Name Available"}</h2>
        <p className="text-gray-600"><b>Type:</b> {orders?.restaurant.name || "N/A"}</p>
        <p className="text-gray-600"><b>Ingredients:</b> {orders?.ingredients || "N/A"}</p>
        <p className="text-gray-600"><b>Type:</b> {orders?.type || "N/A"}</p>
        <p className="text-gray-600"><b>Quantity:</b> {orders?.quantity || "N/A"}</p>
        <p className="text-gray-600"><b>Status:</b> {orders?.status || "N/A"}</p>
      </div>
    ))
  ) : (
    <p className="text-center text-gray-500 col-span-3">No booked orders found.</p>
  )}
</div>
    </div>
  );
};

export default NgoDashboard;
