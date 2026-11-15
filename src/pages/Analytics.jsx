
import { motion } from "framer-motion";
import {
  Activity,
  Dumbbell,
  Flame,
  Clock,
  TrendingUp,
  Target,
} from "lucide-react";

const stats = [
  {
    title: "Total Workouts",
    value: "24",
    subtitle: "This month",
    icon: Dumbbell,
  },
  {
    title: "Calories Burned",
    value: "8,450",
    subtitle: "This month",
    icon: Flame,
  },
  {
    title: "Workout Time",
    value: "18.5 hrs",
    subtitle: "Total duration",
    icon: Clock,
  },
  {
    title: "Activity Score",
    value: "85%",
    subtitle: "Great progress",
    icon: Target,
  },
];

const weeklyActivity = [
  { day: "Mon", workouts: 2 },
  { day: "Tue", workouts: 1 },
  { day: "Wed", workouts: 3 },
  { day: "Thu", workouts: 2 },
  { day: "Fri", workouts: 4 },
  { day: "Sat", workouts: 3 },
  { day: "Sun", workouts: 1 },
];

export default function Analytics() {
  const maxWorkouts = Math.max(
    ...weeklyActivity.map((item) => item.workouts),
    1
  );

  return (
    <div className="bg-[#080B08] text-white p-6 md:p-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-3 mb-2">
          <Activity className="text-[#B7FF4A]" size={30} />
          <h1 className="text-3xl font-bold">
            Fitness <span className="text-[#B7FF4A]">Analytics</span>
          </h1>
        </div>

        <p className="text-gray-400 mb-8">
          Track your fitness activity and monitor your progress.
        </p>

        {/* Statistics */}
        <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-5">
          {stats.map((stat, index) => {
            const Icon = stat.icon;

            return (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="rounded-2xl border border-[#26391C] bg-[#101710] p-6"
              >
                <div className="flex justify-between items-center">
                  <p className="text-gray-400 text-sm">{stat.title}</p>
                  <Icon className="text-[#B7FF4A]" size={22} />
                </div>

                <h2 className="text-3xl font-bold mt-5">
                  {stat.value}
                </h2>

                <p className="text-gray-500 text-sm mt-2">
                  {stat.subtitle}
                </p>
              </motion.div>
            );
          })}
        </div>

        {/* Weekly Activity */}
        <div className="mt-8 rounded-2xl border border-[#26391C] bg-[#101710] p-6 md:p-8">
          <div className="flex items-center gap-3 mb-8">
            <TrendingUp className="text-[#B7FF4A]" />
            <div>
              <h2 className="text-xl font-bold">Weekly Activity</h2>
              <p className="text-gray-400 text-sm">
                Workout sessions per day
              </p>
            </div>
          </div>

          <div className="flex items-end justify-between gap-3 h-56">
            {weeklyActivity.map((item, index) => (
              <div
                key={item.day}
                className="flex flex-col items-center justify-end flex-1 h-full"
              >
                <span className="text-xs text-gray-400 mb-2">
                  {item.workouts}
                </span>

                <motion.div
                  initial={{ height: 0 }}
                  animate={{
                    height: `${(item.workouts / maxWorkouts) * 100}%`,
                  }}
                  transition={{ duration: 0.6, delay: index * 0.08 }}
                  className="w-full max-w-12 rounded-t-lg bg-[#B7FF4A]"
                />

                <span className="text-xs text-gray-400 mt-3">
                  {item.day}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div className="mt-8 rounded-2xl border border-[#26391C] bg-[#101710] p-6">
          <div className="flex items-center gap-3 mb-4">
            <Activity className="text-[#B7FF4A]" />
            <h2 className="text-xl font-bold">Fitness Summary</h2>
          </div>

          <p className="text-gray-400 leading-7">
            You are building a consistent fitness routine. Keep
            tracking your workouts, nutrition, and weight to
            understand your progress over time.
          </p>

          <div className="mt-5 rounded-xl bg-[#172215] border border-[#26391C] p-4">
            <p className="text-[#B7FF4A] font-semibold">
              Keep going!
            </p>
            <p className="text-sm text-gray-400 mt-1">
              These are sample analytics. Real workout data
              will be connected in the backend phase.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
