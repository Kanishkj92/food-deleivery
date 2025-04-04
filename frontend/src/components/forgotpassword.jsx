import { useState } from "react";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [step, setStep] = useState(1); // Track step: 1 = Send OTP, 2 = Verify OTP & Reset Password
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // 🔹 Step 1: Send OTP
  const sendOtp = async () => {
    setLoading(true);
    setMessage("");
    try {
      const response = await fetch("/backend/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to send OTP");

      setStep(2);
      setMessage("OTP sent to your email. Check your inbox.");
    } catch (error) {
      setMessage(error.message);
    }
    setLoading(false);
  };

  // 🔹 Step 2: Verify OTP & Reset Password
  const resetPassword = async () => {
    setLoading(true);
    setMessage("");
    try {
      const response = await fetch("/backend/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, newPassword }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to reset password");

      setMessage("Password reset successful! You can now login.");
      setStep(1);
      setEmail("");
      setOtp("");
      setNewPassword("");
    } catch (error) {
      setMessage(error.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">
          {step === 1 ? "Forgot Password" : "Enter OTP & New Password"}
        </h2>

        {message && <p className="text-red-500 mb-3">{message}</p>}

        {step === 1 ? (
          <>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border p-2 w-full rounded mb-3"
              required
            />
            <button
              onClick={sendOtp}
              className="bg-blue-500 text-white py-2 w-full rounded"
              disabled={loading}
            >
              {loading ? "Sending..." : "Send OTP"}
            </button>
          </>
        ) : (
          <>
            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="border p-2 w-full rounded mb-3"
              required
            />
            <input
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="border p-2 w-full rounded mb-3"
              required
            />
            <button
              onClick={resetPassword}
              className="bg-green-500 text-white py-2 w-full rounded"
              disabled={loading}
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
