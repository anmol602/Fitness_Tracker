
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Apple,
  Flame,
  Beef,
  Wheat,
  Plus,
  Trash2,
  Coffee,
  Utensils,
  Moon
} from "lucide-react";
import api from "../api";

export default function Nutrition() {
  const [meals, setMeals] = useState([]);

  const [showForm, setShowForm] = useState(false);
  const [mealName, setMealName] = useState("");
  const [category, setCategory] = useState("Breakfast");
  const [calories, setCalories] = useState("");
  const [protein, setProtein] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Load saved meals from the backend on page open
  useEffect(() => {
    const fetchMeals = async () => {
      try {
        const response = await api.get("/nutrition");
        setMeals(response.data);
      } catch {
        setError("Could not load meals. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchMeals();
  }, []);

  const totalCalories = meals.reduce((sum, meal) => sum + meal.calories, 0);
  const totalProtein = meals.reduce((sum, meal) => sum + meal.protein, 0);
  const calorieGoal = 2000;
  const progress = Math.min((totalCalories / calorieGoal) * 100, 100);

  const addMeal = async (e) => {
    e.preventDefault();

    if (!mealName.trim() || !calories || !protein ||
        Number(calories) <= 0 || Number(protein) < 0) return;

    try {
      const response = await api.post("/nutrition", {
        foodName: mealName,
        category,
        calories: Number(calories),
        protein: Number(protein),
        carbs: 0,
        fats: 0
      });

      setMeals([response.data.food, ...meals]);

      setMealName("");
      setCalories("");
      setProtein("");
      setCategory("Breakfast");
      setShowForm(false);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add meal.");
    }
  };

  const deleteMeal = async (id) => {
    try {
      await api.delete(`/nutrition/${id}`);
      setMeals(meals.filter((meal) => meal._id !== id));
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete meal.");
    }
  };

  const categories = [
    { name: "Breakfast", icon: Coffee },
    { name: "Lunch", icon: Utensils },
    { name: "Dinner", icon: Moon },
    { name: "Snack", icon: Apple }
  ];

  return (
    <div className="bg-[#080B08] text-white p-5 md:p-8 lg:p-10">

      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <p className="text-[#B7FF4A] text-xs tracking-[3px] font-bold">
            HEALTHY LIFESTYLE
          </p>

          <h1 className="text-3xl md:text-4xl font-bold mt-3">
            Nutrition <span className="text-[#B7FF4A]">Tracker</span>
          </h1>

          <p className="text-gray-400 mt-2">
            Eat healthy, track calories and fuel your body.
          </p>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-[#B7FF4A] text-black font-bold px-5 py-3 rounded-xl hover:bg-[#C8FF78] transition"
        >
          <Plus size={20} />
          Add Meal
        </button>
      </div>

      {error && <p className="text-red-400 text-sm mt-4">{error}</p>}

      {/* Calorie Overview */}
      <div className="grid lg:grid-cols-3 gap-5 mt-9">

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-1 bg-gradient-to-br from-[#203718] to-[#101710] border border-[#354D26] rounded-2xl p-7"
        >
          <div className="flex justify-between items-center">
            <p className="text-gray-300">Daily Calories</p>
            <Flame className="text-[#B7FF4A]" size={25} />
          </div>

          <h2 className="text-4xl font-bold mt-5">{totalCalories}</h2>
          <p className="text-gray-400 text-sm mt-1">
            of {calorieGoal} kcal goal
          </p>

          <div className="w-full h-3 bg-[#26391C] rounded-full mt-7 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className="h-full bg-[#B7FF4A] rounded-full"
            />
          </div>

          <p className="text-[#B7FF4A] text-sm mt-3">
            {Math.max(calorieGoal - totalCalories, 0)} kcal remaining
          </p>
        </motion.div>

        {/* Nutrition Cards */}
        {[
          { title: "Protein", value: totalProtein, unit: "g", icon: Beef },
          { title: "Meals Logged", value: meals.length, unit: "meals", icon: Apple }
        ].map((item, index) => {
          const Icon = item.icon;

          return (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-[#101710] border border-[#26391C] rounded-2xl p-7"
            >
              <div className="p-3 bg-[#B7FF4A]/10 rounded-xl w-fit">
                <Icon className="text-[#B7FF4A]" size={25} />
              </div>

              <p className="text-gray-400 mt-5">{item.title}</p>
              <h2 className="text-4xl font-bold mt-2">{item.value}</h2>
              <p className="text-gray-500 text-sm mt-1">{item.unit}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Add Meal Form */}
      {showForm && (
        <motion.form
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={addMeal}
          className="mt-8 bg-[#101710] border border-[#354D26] rounded-2xl p-6"
        >
          <h2 className="text-xl font-bold mb-5">Add New Meal</h2>

          <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4">
            <input
              value={mealName}
              onChange={(e) => setMealName(e.target.value)}
              placeholder="Meal name"
              required
              className="bg-[#080B08] border border-[#354D26] rounded-xl p-4 outline-none focus:border-[#B7FF4A]"
            />

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="bg-[#080B08] border border-[#354D26] rounded-xl p-4 outline-none"
            >
              <option>Breakfast</option>
              <option>Lunch</option>
              <option>Dinner</option>
              <option>Snack</option>
            </select>

            <input
              type="number"
              min="1"
              value={calories}
              onChange={(e) => setCalories(e.target.value)}
              placeholder="Calories (kcal)"
              required
              className="bg-[#080B08] border border-[#354D26] rounded-xl p-4 outline-none focus:border-[#B7FF4A]"
            />

            <input
              type="number"
              min="0"
              value={protein}
              onChange={(e) => setProtein(e.target.value)}
              placeholder="Protein (g)"
              required
              className="bg-[#080B08] border border-[#354D26] rounded-xl p-4 outline-none focus:border-[#B7FF4A]"
            />
          </div>

          <div className="flex gap-3 mt-5">
            <button className="bg-[#B7FF4A] text-black font-bold px-6 py-3 rounded-xl">
              Save Meal
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

      {/* Meal Categories */}
      <h2 className="text-xl font-bold mt-10 mb-5">Meal Categories</h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {categories.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.name}
              className="bg-[#101710] border border-[#26391C] rounded-xl p-5 flex items-center gap-3"
            >
              <Icon className="text-[#B7FF4A]" size={22} />
              <span className="font-medium">{item.name}</span>
            </div>
          );
        })}
      </div>

      {/* Meals List */}
      <h2 className="text-xl font-bold mt-10 mb-5">Today's Meals</h2>

      <div className="space-y-4">
        {loading ? (
          <p className="text-gray-400 text-center py-12">Loading meals...</p>
        ) : (
          <>
            {meals.map((meal, index) => (
              <motion.div
                key={meal._id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08 }}
                className="flex flex-wrap justify-between items-center gap-4 bg-[#101710] border border-[#26391C] rounded-2xl p-5 hover:border-[#B7FF4A]/50 transition"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-[#B7FF4A]/10 rounded-xl">
                    <Apple className="text-[#B7FF4A]" size={24} />
                  </div>

                  <div>
                    <h3 className="font-bold">{meal.foodName}</h3>
                    <p className="text-gray-500 text-sm mt-1">{meal.category}</p>
                  </div>
                </div>

                <div className="flex items-center gap-5">
                  <div className="text-right">
                    <p className="font-bold">{meal.calories} kcal</p>
                    <p className="text-gray-500 text-xs mt-1">
                      Protein: {meal.protein}g
                    </p>
                  </div>

                  <button
                    onClick={() => deleteMeal(meal._id)}
                    aria-label="Delete meal"
                    className="text-gray-500 hover:text-red-400 transition"
                  >
                    <Trash2 size={19} />
                  </button>
                </div>
              </motion.div>
            ))}

            {meals.length === 0 && (
              <div className="text-center py-12 bg-[#101710] rounded-2xl border border-[#26391C]">
                <Apple className="mx-auto text-[#B7FF4A]" size={35} />
                <p className="text-gray-400 mt-3">No meals added yet.</p>
              </div>
            )}
          </>
        )}
      </div>

      <p className="text-center text-gray-600 mt-10 text-xs">
        © 2026 Fitness Tracker. Be Fit. Be Happy.
      </p>

    </div>
  );
}
