import { useNavigate } from "react-router-dom";

const FrontPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-200 via-white to-blue-200 px-4">
      <div className="w-full max-w-3xl bg-white rounded-3xl shadow-lg p-10 text-center border border-gray-200">
        {/* Banner Image */}
        <img
          src="https://images.unsplash.com/photo-1600891964599-f61ba0e24092?auto=format&fit=crop&w=1350&q=80"
          alt="Food donation"
          className="w-full h-64 object-cover rounded-xl mb-8"
        />

        {/* Headline */}
        <h1 className="text-4xl md:text-5xl font-extrabold text-pink-500 mb-4">
          Welcome to FoodShare
        </h1>
        <p className="text-gray-600 text-lg md:text-xl max-w-xl mx-auto mb-6">
          A platform connecting <strong>restaurants</strong> and <strong>NGOs</strong> to reduce food waste and feed the hungry.
        </p>

        {/* Info Icons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
          <div className="flex items-center gap-4 bg-pink-100 p-4 rounded-xl shadow">
            <img
              src="https://cdn-icons-png.flaticon.com/512/1046/1046784.png"
              alt="restaurant"
              className="w-10 h-10"
            />
            <p className="text-gray-700 font-medium text-base sm:text-lg">
              Restaurants donate surplus food
            </p>
          </div>
          <div className="flex items-center gap-4 bg-pink-100 p-4 rounded-xl shadow">
            <img
              src="https://cdn-icons-png.flaticon.com/512/2345/2345337.png"
              alt="ngo"
              className="w-10 h-10"
            />
            <p className="text-gray-700 font-medium text-base sm:text-lg">
              NGOs book and distribute food
            </p>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate("/signup")}
            className="w-full sm:w-auto bg-pink-400 hover:bg-pink-500 text-white font-semibold py-3 px-6 rounded-xl transition duration-300"
          >
            Sign Up
          </button>
          <button
            onClick={() => navigate("/signin")}
            className="w-full sm:w-auto bg-gray-800 hover:bg-gray-900 text-white font-semibold py-3 px-6 rounded-xl transition duration-300"
          >
            Sign In
          </button>
        </div>
      </div>
    </div>
  );
};

export default FrontPage;
