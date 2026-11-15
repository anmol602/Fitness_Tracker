import { motion } from "framer-motion";
import { Activity, Mail, ArrowRight, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const response = await api.post("/auth/forgot-password", { email });

      setMessage(
        response.data.message ||
          "If that email is registered, reset instructions have been sent."
      );
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-dark min-h-screen bg-[#080B08] text-white flex items-center justify-center p-5">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md rounded-2xl border border-[#354D26] bg-[#080D08] p-8 shadow-[0_0_35px_rgba(183,255,74,0.08)]"
      >
        <div className="text-center mb-8">
          <Activity className="mx-auto text-[#B7FF4A] mb-4" size={42} />

          <h2 className="text-3xl font-bold">
            Forgot <span className="text-[#B7FF4A]">Password?</span>
          </h2>

          <p className="text-gray-400 mt-2">
            No worries! Enter your email and we'll send you reset instructions.
          </p>
        </div>

        <form onSubmit={handleReset} autoComplete="off" className="space-y-5">
          {/* Email */}
          <div>
            <label htmlFor="email" className="text-sm text-gray-400">
              Email Address
            </label>

            <div className="flex items-center gap-3 mt-2 rounded-xl border border-[#26391C] bg-[#111811] px-4 focus-within:border-[#B7FF4A] transition">
              <Mail className="text-[#B7FF4A]" size={20} />

              <input
                id="email"
                name="resetEmail"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="off"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                data-lpignore="true"
                data-1p-ignore="true"
                className="w-full bg-transparent py-4 outline-none text-white placeholder:text-gray-500"
              />
            </div>
          </div>

          {message && (
            <p className="text-center text-sm text-[#B7FF4A]" role="status">
              {message}
            </p>
          )}

          {error && (
            <p className="text-center text-sm text-red-400" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 rounded-xl bg-[#B7FF4A] py-4 font-bold text-black hover:bg-[#C8FF78] transition disabled:opacity-50"
          >
            {loading ? "Sending..." : "Send Reset Link"}
            <ArrowRight size={20} />
          </button>
        </form>

        <p className="text-center text-gray-400 mt-7 text-sm">
          <Link
            to="/login"
            className="text-[#B7FF4A] font-semibold inline-flex items-center gap-1 hover:underline"
          >
            <ArrowLeft size={16} /> Back to Login
          </Link>
        </p>
      </motion.div>
    </div>
  );
}

export default ForgotPassword;
