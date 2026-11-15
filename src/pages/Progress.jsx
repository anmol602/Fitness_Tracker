
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  Scale,
  Target,
  Activity,
  Plus,
  Trash2,
  CalendarDays
} from "lucide-react";
import api from "../api";

// ISO date string -> "YYYY-MM-DD"
const dayString = (date) => String(date || "").slice(0, 10);

// Target weight is stored per user in the browser
const goalKey = () => {
  let id = "";
  try {
    id = JSON.parse(localStorage.getItem("user") || "{}").id || "";
  } catch {
    // ignore invalid saved user data
  }
  return `targetWeight_${id}`;
};

const sortByDate = (list) =>
  [...list].sort((a, b) => new Date(a.date) - new Date(b.date));

export default function Progress() {
  const [entries, setEntries] = useState([]);

  const [showForm, setShowForm] = useState(false);
  const [weight, setWeight] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [goal, setGoal] = useState(() => {
    const saved = localStorage.getItem(goalKey());
    return saved ? Number(saved) : 65;
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Load weight history from the backend on page open
  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const response = await api.get("/progress");
        setEntries(sortByDate(response.data));
      } catch {
        setError("Could not load progress. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchProgress();
  }, []);

  const latestWeight = entries.length
    ? entries[entries.length - 1].weight
    : 0;

  const startingWeight = entries.length
    ? entries[0].weight
    : 0;

  const weightChange = startingWeight - latestWeight;

  const addProgress = async (e) => {
    e.preventDefault();

    if (!weight || Number(weight) <= 0 || !date) return;

    try {
      const response = await api.post("/progress", {
        weight: Number(weight),
        date
      });

      setEntries(sortByDate([...entries, response.data.progress]));

      setWeight("");
      setShowForm(false);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add progress.");
    }
  };

  const deleteEntry = async (id) => {
    try {
      await api.delete(`/progress/${id}`);
      setEntries(entries.filter((entry) => entry._id !== id));
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete entry.");
    }
  };

  const changeGoal = (value) => {
    setGoal(value);
    localStorage.setItem(goalKey(), String(value));
  };

  const chartEntries = entries.slice(-7);
  const minWeight = Math.min(...chartEntries.map((item) => item.weight), 0);
  const maxWeight = Math.max(...chartEntries.map((item) => item.weight), 1);
  const range = Math.max(maxWeight - minWeight, 1);

  return (
    <div className="bg-[#080B08] text-white p-5 md:p-8 lg:p-10">

      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <p className="text-[#B7FF4A] text-xs tracking-[3px] font-bold">
            YOUR FITNESS JOURNEY
          </p>

          <h1 className="text-3xl md:text-4xl font-bold mt-3">
            My <span className="text-[#B7FF4A]">Progress</span>
          </h1>

          <p className="text-gray-400 mt-2">
            Monitor your body changes and celebrate every achievement.
          </p>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-[#B7FF4A] text-black font-bold px-5 py-3 rounded-xl hover:bg-[#C8FF78] transition"
        >
          <Plus size={20} />
          Add Progress
        </button>
      </div>

      {error && <p className="text-red-400 text-sm mt-4">{error}</p>}

      {/* Summary Cards */}
      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-5 mt-9">
        {[
          { title: "Current Weight", value: `${latestWeight} kg`, icon: Scale },
          { title: "Starting Weight", value: `${startingWeight} kg`, icon: Activity },
          { title: "Weight Change", value: `${weightChange.toFixed(1)} kg`, icon: TrendingUp },
          { title: "Target Weight", value: `${goal} kg`, icon: Target }
        ].map((item, index) => {
          const Icon = item.icon;

          return (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-[#101710] border border-[#26391C] rounded-2xl p-6 hover:border-[#B7FF4A]/60 transition"
            >
              <div className="p-3 bg-[#B7FF4A]/10 rounded-xl w-fit">
                <Icon className="text-[#B7FF4A]" size={24} />
              </div>

              <p className="text-gray-400 mt-5 text-sm">{item.title}</p>
              <h2 className="text-3xl font-bold mt-2">{item.value}</h2>
            </motion.div>
          );
        })}
      </div>

      {/* Goal Settings */}
      <div className="mt-8 bg-[#101710] border border-[#26391C] rounded-2xl p-6">
        <div className="flex flex-wrap justify-between gap-4 items-center">
          <div>
            <h2 className="text-xl font-bold">Your Weight Goal</h2>
            <p className="text-gray-400 text-sm mt-2">
              Set your personal target weight.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="number"
              min="1"
              max="500"
              value={goal}
              onChange={(e) => changeGoal(Number(e.target.value))}
              className="w-24 bg-[#080B08] border border-[#354D26] rounded-xl p-3 outline-none focus:border-[#B7FF4A]"
            />
            <span className="text-gray-400">kg</span>
          </div>
        </div>
      </div>

      {/* Add Progress Form */}
      {showForm && (
        <motion.form
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={addProgress}
          className="mt-8 bg-[#101710] border border-[#354D26] rounded-2xl p-6"
        >
          <h2 className="text-xl font-bold mb-5">Record Your Progress</h2>

          <div className="grid md:grid-cols-2 gap-4">
            <input
              type="number"
              min="1"
              step="0.1"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="Weight in kg"
              required
              className="bg-[#080B08] border border-[#354D26] rounded-xl p-4 outline-none focus:border-[#B7FF4A]"
            />

            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="bg-[#080B08] text-white border border-[#354D26] rounded-xl p-4 outline-none focus:border-[#B7FF4A]"
            />
          </div>

          <div className="flex gap-3 mt-5">
            <button className="bg-[#B7FF4A] text-black font-bold px-6 py-3 rounded-xl">
              Save Progress
            </button>

            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="border border-gray-600 px-6 py-3 rounded-xl"
            >
              Cancel
            </button>
          </div>
        </motion.form>
      )}

      {/* Weight Chart */}
      <div className="mt-8 bg-[#101710] border border-[#26391C] rounded-2xl p-6">
        <div className="flex justify-between items-center gap-3">
          <div>
            <h2 className="text-xl font-bold">Weight History</h2>
            <p className="text-gray-500 text-sm mt-1">Recent progress records</p>
          </div>
          <TrendingUp className="text-[#B7FF4A]" size={25} />
        </div>

        {loading ? (
          <p className="text-gray-500 text-center py-12">Loading progress...</p>
        ) : chartEntries.length > 0 ? (
          <div className="flex items-end justify-between gap-3 h-48 mt-8">
            {chartEntries.map((item) => {
              const height = 30 + ((item.weight - minWeight) / range) * 65;

              return (
                <div key={item._id} className="flex-1 h-full flex flex-col items-center justify-end gap-3">
                  <span className="text-xs text-[#B7FF4A]">{item.weight}kg</span>
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${height}%` }}
                    transition={{ duration: 0.7 }}
                    className="w-full max-w-12 rounded-t-lg bg-gradient-to-t from-[#719D2B] to-[#B7FF4A]"
                  />
                  <span className="text-[10px] text-gray-500">
                    {dayString(item.date).slice(5)}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-12">
            Add your first weight record to see your chart.
          </p>
        )}
      </div>

      {/* History */}
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-5">Progress History</h2>

        <div className="space-y-3">
          {loading ? (
            <p className="text-gray-400 text-center py-8">Loading history...</p>
          ) : entries.length === 0 ? (
            <p className="text-gray-400 text-center py-8">
              No progress records yet.
            </p>
          ) : (
            entries.map((entry) => (
              <div
                key={entry._id}
                className="flex justify-between items-center gap-4 bg-[#101710] border border-[#26391C] rounded-xl p-5"
              >
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-[#B7FF4A]/10 rounded-xl">
                    <Scale className="text-[#B7FF4A]" size={22} />
                  </div>

                  <div>
                    <p className="font-bold">{entry.weight} kg</p>
                    <p className="text-gray-500 text-xs mt-1 flex items-center gap-1">
                      <CalendarDays size={13} />
                      {dayString(entry.date)}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => deleteEntry(entry._id)}
                  aria-label="Delete progress entry"
                  className="text-gray-500 hover:text-red-400 transition"
                >
                  <Trash2 size={19} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      <p className="text-center text-gray-600 mt-10 text-xs">
        © 2026 Fitness Tracker. Be Fit. Be Happy.
      </p>
    </div>
  );
}
