
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Dumbbell,
  Clock,
  Flame,
  Plus,
  Play,
  Trash2
} from "lucide-react";
import api from "../api";

export default function Workouts() {
  const [workouts, setWorkouts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState("Strength");
  const [duration, setDuration] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Load saved workouts from the backend on page open
  useEffect(() => {
    const fetchWorkouts = async () => {
      try {
        const response = await api.get("/workouts");
        setWorkouts(response.data);
      } catch {
        setError("Could not load workouts. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchWorkouts();
  }, []);

  const addWorkout = async (e) => {
    e.preventDefault();

    if (!name.trim() || !duration || Number(duration) <= 0) return;

    try {
      const response = await api.post("/workouts", {
        title: name,
        category: type,
        duration: Number(duration),
        calories: Number(duration) * 6
      });

      setWorkouts([response.data.workout, ...workouts]);
      setName("");
      setDuration("");
      setType("Strength");
      setShowForm(false);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add workout.");
    }
  };

  const deleteWorkout = async (id) => {
    try {
      await api.delete(`/workouts/${id}`);
      setWorkouts(workouts.filter((workout) => workout._id !== id));
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete workout.");
    }
  };

  const totalMinutes = workouts.reduce((sum, item) => sum + item.duration, 0);
  const totalCalories = workouts.reduce((sum, item) => sum + item.calories, 0);

  return (
    <div className="bg-[#080B08] text-white p-5 md:p-8 lg:p-10">

      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <p className="text-[#B7FF4A] text-xs tracking-[3px] font-bold">
            FITNESS ACTIVITY
          </p>
          <h1 className="text-3xl md:text-4xl font-bold mt-3">
            My <span className="text-[#B7FF4A]">Workouts</span>
          </h1>
          <p className="text-gray-400 mt-2">
            Track your training and stay consistent.
          </p>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-[#B7FF4A] text-black font-bold px-5 py-3 rounded-xl hover:bg-[#C8FF78] transition"
        >
          <Plus size={20} />
          Add Workout
        </button>
      </div>

      {error && <p className="text-red-400 text-sm mt-4">{error}</p>}

      {/* Summary Cards */}
      <div className="grid sm:grid-cols-3 gap-5 mt-9">
        {[
          { title: "Total Workouts", value: workouts.length, icon: Dumbbell },
          { title: "Active Minutes", value: totalMinutes, icon: Clock },
          { title: "Calories Burned", value: totalCalories, icon: Flame }
        ].map((item, index) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-[#101710] border border-[#26391C] rounded-2xl p-6"
            >
              <div className="p-3 rounded-xl bg-[#B7FF4A]/10 w-fit">
                <Icon className="text-[#B7FF4A]" size={24} />
              </div>
              <p className="text-gray-400 mt-5 text-sm">{item.title}</p>
              <h2 className="text-3xl font-bold mt-2">{item.value}</h2>
            </motion.div>
          );
        })}
      </div>

      {/* Add Workout Form */}
      {showForm && (
        <motion.form
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={addWorkout}
          className="mt-8 bg-[#101710] border border-[#354D26] rounded-2xl p-6"
        >
          <h2 className="text-xl font-bold mb-5">Add New Workout</h2>

          <div className="grid md:grid-cols-3 gap-4">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Workout name"
              required
              className="bg-[#080B08] border border-[#354D26] rounded-xl p-4 outline-none focus:border-[#B7FF4A]"
            />

            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="bg-[#080B08] border border-[#354D26] rounded-xl p-4 outline-none"
            >
              <option>Strength</option>
              <option>Cardio</option>
              <option>Flexibility</option>
              <option>Yoga</option>
            </select>

            <input
              type="number"
              min="1"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="Duration (minutes)"
              required
              className="bg-[#080B08] border border-[#354D26] rounded-xl p-4 outline-none focus:border-[#B7FF4A]"
            />
          </div>

          <div className="flex gap-3 mt-5">
            <button className="bg-[#B7FF4A] text-black font-bold px-6 py-3 rounded-xl">
              Save Workout
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

      {/* Workout List */}
      <div className="mt-10">
        <h2 className="text-xl font-bold mb-5">Recent Workouts</h2>

        {loading ? (
          <p className="text-gray-400 text-center py-12">Loading workouts...</p>
        ) : (
          <>
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
              {workouts.map((workout, index) => (
                <motion.div
                  key={workout._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-[#101710] border border-[#26391C] rounded-2xl p-6 hover:border-[#B7FF4A]/60 transition"
                >
                  <div className="flex justify-between items-start">
                    <div className="p-3 rounded-xl bg-[#B7FF4A]/10">
                      <Dumbbell className="text-[#B7FF4A]" size={25} />
                    </div>

                    <button
                      onClick={() => deleteWorkout(workout._id)}
                      aria-label="Delete workout"
                      className="text-gray-500 hover:text-red-400 transition"
                    >
                      <Trash2 size={19} />
                    </button>
                  </div>

                  <h3 className="text-lg font-bold mt-5">{workout.title}</h3>
                  <span className="inline-block mt-2 text-xs text-[#B7FF4A] bg-[#B7FF4A]/10 px-3 py-1 rounded-full">
                    {workout.category}
                  </span>

                  <div className="flex gap-5 mt-6 text-sm text-gray-400">
                    <span className="flex items-center gap-2">
                      <Clock size={16} className="text-[#B7FF4A]" />
                      {workout.duration} min
                    </span>
                    <span className="flex items-center gap-2">
                      <Flame size={16} className="text-[#B7FF4A]" />
                      {workout.calories} kcal
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>

            {workouts.length === 0 && (
              <div className="text-center py-12 bg-[#101710] rounded-2xl border border-[#26391C]">
                <Dumbbell className="mx-auto text-[#B7FF4A]" size={35} />
                <p className="mt-4 text-gray-400">No workouts added yet.</p>
              </div>
            )}
          </>
        )}
      </div>

    </div>
  );
}
