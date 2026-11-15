import { motion } from "framer-motion";
import { Activity, Mail, Lock, ArrowRight, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";
import bgImage from "../assets/image/bg2.jpg";

const features = ["Track Progress", "Plan Nutrition", "Stay Active"];

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await api.post("/auth/login", { email, password });

      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));

      navigate("/dashboard");
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Login failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-dark relative flex min-h-screen w-full items-center justify-center bg-[#070A07] p-4 text-white sm:p-6 lg:p-10">
      <div className="w-full max-w-5xl overflow-hidden rounded-3xl border border-white/15 bg-[#0A0E0A] shadow-[0_25px_80px_-20px_rgba(0,0,0,0.9)]">
        <div className="grid md:grid-cols-2">
          {/* LEFT — image panel (bg2.jpg fits inside this column) */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="relative flex min-h-[340px] flex-col justify-end overflow-hidden p-8 md:min-h-[600px] md:justify-center md:p-12"
          >
            {/* Image — mobile: focus the upper part so faces are not cropped */}
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-cover bg-no-repeat md:hidden"
              style={{
                backgroundImage: `url(${bgImage})`,
                backgroundSize: "cover",
                backgroundPosition: "center 20%",
                backgroundRepeat: "no-repeat",
              }}
            />

            {/* Image — desktop */}
            <div
              aria-hidden="true"
              className="absolute inset-0 hidden bg-cover bg-center bg-no-repeat md:block"
              style={{
                backgroundImage: `url(${bgImage})`,
                backgroundSize: "cover",
                backgroundPosition: "center center",
                backgroundRepeat: "no-repeat",
              }}
            />

            {/* Readability scrim */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#050805]/95 via-[#050805]/70 to-[#050805]/25" />

            {/* Content over the image */}
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-8 md:mb-12">
                <Activity className="text-[#B6FF3B]" size={34} />
                <h1 className="text-2xl font-bold md:text-3xl">
                  Fitness <span className="text-[#B6FF3B]">Tracker</span>
                </h1>
              </div>

              <h2 className="text-3xl font-bold leading-tight md:text-4xl">
                Your Fitness Journey Starts{" "}
                <span className="text-[#B6FF3B]">Here.</span>
              </h2>

              <p className="mt-4 max-w-sm text-sm text-gray-200 md:text-base">
                Track your workouts, monitor nutrition, and achieve your
                fitness goals.
              </p>

              <div className="mt-8 hidden grid-cols-1 gap-3 sm:grid sm:grid-cols-3">
                {features.map((feature) => (
                  <div
                    key={feature}
                    className="rounded-xl border border-white/10 bg-white/[0.06] p-3 text-center text-xs text-gray-200 backdrop-blur-sm"
                  >
                    <Activity
                      className="mx-auto mb-1.5 text-[#B6FF3B]"
                      size={20}
                    />
                    {feature}
                  </div>
                ))}
              </div>

              <p className="mt-8 text-sm italic text-[#B6FF3B] md:text-base">
                Be Fit. Be Happy.
              </p>
            </div>
          </motion.div>

          {/* RIGHT — login form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center justify-center p-6 sm:p-10"
          >
            <div className="w-full max-w-md rounded-2xl border border-white/15 bg-gradient-to-br from-white/[0.09] to-white/[0.03] p-7 shadow-[0_8px_32px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.18)] backdrop-blur-xl sm:p-8">
              <div className="mb-7 text-center">
                <Activity className="mx-auto mb-3 text-[#B6FF3B]" size={40} />

                <h2 className="text-2xl font-bold sm:text-3xl">
                  Welcome <span className="text-[#B6FF3B]">Back!</span>
                </h2>

                <p className="mt-2 text-sm text-gray-300">
                  Login to continue your fitness journey
                </p>
              </div>

              <form
                onSubmit={handleLogin}
                autoComplete="off"
                className="space-y-5"
              >
                {/* Email */}
                <div>
                  <label
                    htmlFor="email"
                    className="text-sm font-medium text-gray-200"
                  >
                    Email Address
                  </label>

                  <div className="mt-2 flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.07] px-4 backdrop-blur-sm transition focus-within:border-[#B6FF3B] focus-within:bg-white/[0.10]">
                    <Mail className="text-[#B6FF3B]" size={20} />

                    <input
                      id="email"
                      name="loginEmail"
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
                      data-form-type="other"
                      className="w-full bg-transparent py-3.5 text-white outline-none placeholder:text-gray-400"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label
                    htmlFor="password"
                    className="text-sm font-medium text-gray-200"
                  >
                    Password
                  </label>

                  <div className="mt-2 flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.07] px-4 backdrop-blur-sm transition focus-within:border-[#B6FF3B] focus-within:bg-white/[0.10]">
                    <Lock className="text-[#B6FF3B]" size={20} />

                    <input
                      id="password"
                      name="loginPassword"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      autoComplete="new-password"
                      spellCheck={false}
                      data-lpignore="true"
                      data-1p-ignore="true"
                      data-form-type="other"
                      className="w-full bg-transparent py-3.5 text-white outline-none placeholder:text-gray-400"
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                      className="text-gray-400 transition hover:text-[#B6FF3B]"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                {/* Forgot Password */}
                <div className="flex justify-end">
                  <Link
                    to="/forgot-password"
                    className="text-sm font-semibold text-[#B6FF3B] hover:underline"
                  >
                    Forgot Password?
                  </Link>
                </div>

                {/* Error message */}
                {message && (
                  <p className="text-center text-sm text-red-400" role="alert">
                    {message}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-3 rounded-xl bg-[#B6FF3B] py-4 font-bold text-black shadow-[0_10px_30px_-10px_rgba(182,255,59,0.6)] transition hover:bg-[#C8FF78] disabled:opacity-50"
                >
                  {loading ? "Logging in..." : "Login"}
                  <ArrowRight size={20} />
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-gray-300">
                Don't have an account?{" "}
                <Link to="/register" className="font-semibold text-[#B6FF3B]">
                  Register
                </Link>
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default Login;
