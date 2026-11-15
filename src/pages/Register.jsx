
import { useState } from "react";
import { motion } from "framer-motion";
import { User, Mail, Lock, ArrowRight, Activity } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";
import bgImage from "../assets/image/bg.1.jpg";

export default function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setLoading(true);

      await api.post("/auth/register", {
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });

      alert("Account created successfully! Please login.");

      navigate("/login");
    } catch (err) {
      setError(
        err.response?.data?.message || "Registration failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="auth-dark min-h-screen bg-[#050805] bg-cover bg-center bg-no-repeat flex items-center justify-center px-4 py-10 relative"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      {/* Dark overlay so the form stays readable */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#050805]/85 via-[#050805]/65 to-[#050805]/90" />

      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md rounded-3xl border border-[#b7ff4a]/20 bg-[#0c120d] p-8 shadow-2xl"
      >

        <div className="flex justify-center mb-6">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#b7ff4a]">
            <Activity size={30} className="text-black" />
          </div>
        </div>

        <h1 className="text-center text-3xl font-bold text-white">
          Create Account
        </h1>

        <p className="mt-2 text-center text-gray-400">
          Join Fitness Tracker and start your fitness journey
        </p>

        {error && (
          <div className="mt-5 rounded-xl bg-red-500/10 p-3 text-sm text-red-400">
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          autoComplete="off"
          className="mt-8 space-y-5"
        >

          <div>
            <label className="mb-2 block text-sm text-gray-300">
              Full Name
            </label>

            <div className="flex items-center rounded-xl border border-white/10 bg-black/30 px-4">
              <User size={18} className="text-[#b7ff4a]" />

              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your name"
                required
                autoComplete="off"
                data-lpignore="true"
                data-1p-ignore="true"
                className="w-full bg-transparent px-3 py-3 text-white outline-none placeholder:text-gray-500"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm text-gray-300">
              Email Address
            </label>

            <div className="flex items-center rounded-xl border border-white/10 bg-black/30 px-4">
              <Mail size={18} className="text-[#b7ff4a]" />

              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                required
                autoComplete="off"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                data-lpignore="true"
                data-1p-ignore="true"
                className="w-full bg-transparent px-3 py-3 text-white outline-none placeholder:text-gray-500"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm text-gray-300">
              Password
            </label>

            <div className="flex items-center rounded-xl border border-white/10 bg-black/30 px-4">
              <Lock size={18} className="text-[#b7ff4a]" />

              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Create password"
                required
                autoComplete="new-password"
                spellCheck={false}
                data-lpignore="true"
                data-1p-ignore="true"
                className="w-full bg-transparent px-3 py-3 text-white outline-none placeholder:text-gray-500"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm text-gray-300">
              Confirm Password
            </label>

            <div className="flex items-center rounded-xl border border-white/10 bg-black/30 px-4">
              <Lock size={18} className="text-[#b7ff4a]" />

              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm password"
                required
                autoComplete="new-password"
                spellCheck={false}
                data-lpignore="true"
                data-1p-ignore="true"
                className="w-full bg-transparent px-3 py-3 text-white outline-none placeholder:text-gray-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#b7ff4a] py-3.5 font-bold text-black transition hover:bg-[#caff70] disabled:opacity-50"
          >
            {loading ? "Creating Account..." : "Create Account"}
            {!loading && <ArrowRight size={18} />}
          </button>

        </form>

        <p className="mt-6 text-center text-sm text-gray-400">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-semibold text-[#b7ff4a] hover:underline"
          >
            Login
          </Link>
        </p>

      </motion.div>
    </div>
  );
}
