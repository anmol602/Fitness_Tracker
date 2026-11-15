
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Activity,
  Dumbbell,
  Flame,
  Clock,
  Target,
  ArrowUpRight,
  Play,
  Zap,
  Search,
  FileDown,
  BellRing,
  Settings2,
  LifeBuoy
} from "lucide-react";
import api from "../api";
import CalendarButton from "../components/CalendarButton";
import NotificationBell from "../components/NotificationBell";
import SearchFilter from "../components/SearchFilter";
import ReportExportModal from "../components/ReportExportModal";
import RemindersModal from "../components/RemindersModal";
import SettingsModal from "../components/SettingsModal";
import SupportModal from "../components/SupportModal";
import useLocalStorage from "../hooks/useLocalStorage";
import { getCurrentUser, getUserKey } from "../utils/userStorage";
import { defaultPreferences, mergePreferences } from "../utils/preferences";
import {
  addNotification,
  seedCommunityNotifications
} from "../utils/notifications";

// Count workouts per day for the last 7 days
const lastSevenDays = (workouts) => {
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const days = [];

  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push({ key: d.toDateString(), day: dayNames[d.getDay()], value: 0 });
  }

  const byKey = Object.fromEntries(days.map((d) => [d.key, d]));

  workouts.forEach((workout) => {
    const key = new Date(workout.date || workout.createdAt).toDateString();
    if (byKey[key]) byKey[key].value += 1;
  });

  return days.map(({ day, value }) => ({ day, value }));
};

const DAILY_GOAL_MINUTES = 30;

const minutesForToday = (workouts) => {
  const today = new Date().toDateString();

  return workouts
    .filter(
      (workout) => new Date(workout.date || workout.createdAt).toDateString() === today
    )
    .reduce((total, workout) => total + (workout.duration || 0), 0);
};

// Kitne din daily goal (30 min) complete hua
const completedGoalDays = (workouts) => {
  const byDay = {};

  workouts.forEach((workout) => {
    const key = new Date(workout.date || workout.createdAt).toDateString();
    byDay[key] = (byDay[key] || 0) + (workout.duration || 0);
  });

  return Object.values(byDay).filter(
    (minutes) => minutes >= DAILY_GOAL_MINUTES
  ).length;
};

const focusSearch = () => {
  const input = document.getElementById("dashboard-search");

  if (!input) return;

  input.scrollIntoView({ behavior: "smooth", block: "center" });
  input.focus();
};

export default function Dashboard() {
  const user = getCurrentUser();
  const name = user.name || "Fitness Champion";

  const [preferences, setPreferences] = useLocalStorage(
    getUserKey("fitnova_preferences"),
    defaultPreferences
  );
  const prefs = useMemo(() => mergePreferences(preferences), [preferences]);

  const [statistics, setStatistics] = useState(null);
  const [weeklyActivity, setWeeklyActivity] = useState([]);
  const [workouts, setWorkouts] = useState([]);
  const [nutrition, setNutrition] = useState([]);
  const [progress, setProgress] = useState([]);
  const [activeModal, setActiveModal] = useState(null);

  // Load dashboard data from the backend
  useEffect(() => {
    const fetchDashboard = async () => {
      const [statsRes, workoutsRes, nutritionRes, progressRes] =
        await Promise.allSettled([
          api.get("/dashboard/stats"),
          api.get("/workouts"),
          api.get("/nutrition"),
          api.get("/progress")
        ]);

      if (statsRes.status === "fulfilled") {
        setStatistics(statsRes.value.data.statistics);
      }

      if (workoutsRes.status === "fulfilled") {
        const workoutList = Array.isArray(workoutsRes.value.data)
          ? workoutsRes.value.data
          : [];

        setWorkouts(workoutList);
        setWeeklyActivity(lastSevenDays(workoutList));
      }

      if (nutritionRes.status === "fulfilled") {
        setNutrition(
          Array.isArray(nutritionRes.value.data) ? nutritionRes.value.data : []
        );
      }

      if (progressRes.status === "fulfilled") {
        setProgress(
          Array.isArray(progressRes.value.data) ? progressRes.value.data : []
        );
      }
    };

    fetchDashboard();
  }, []);

  // First visit par community notifications seed karna
  useEffect(() => {
    seedCommunityNotifications();
  }, []);

  // Workout completion aur daily goal notifications generate karna
  useEffect(() => {
    if (!workouts.length) return;

    workouts.slice(0, 3).forEach((workout) => {
      addNotification({
        id: `workout-${workout._id}`,
        type: "workout",
        title: "Workout completed",
        message: `${workout.title} · ${workout.duration || 0} min · ${
          workout.calories || 0
        } kcal`,
        link: "/workouts",
        createdAt: workout.date || workout.createdAt
      });
    });

    const todayMinutes = minutesForToday(workouts);

    if (todayMinutes >= DAILY_GOAL_MINUTES) {
      addNotification({
        id: `goal-${new Date().toDateString()}`,
        type: "goal",
        title: "Daily goal achieved!",
        message: `You completed ${todayMinutes} active minutes today. Great work!`,
        link: "/progress",
        createdAt: new Date().toISOString()
      });
    }
  }, [workouts]);

  const todayMinutes = minutesForToday(workouts);
  const dailyProgress = Math.min(
    Math.round((todayMinutes / DAILY_GOAL_MINUTES) * 100),
    100
  );

  const stats = [
    {
      title: "Total Workouts",
      value: statistics?.totalWorkouts ?? 0,
      unit: "sessions",
      icon: Dumbbell
    },
    {
      title: "Calories Burned",
      value: statistics?.totalCaloriesBurned ?? 0,
      unit: "kcal",
      icon: Flame
    },
    {
      title: "Active Minutes",
      value: statistics?.totalDuration ?? 0,
      unit: "minutes",
      icon: Clock
    },
    {
      title: "Fitness Goals",
      value: completedGoalDays(workouts),
      unit: "completed",
      icon: Target
    }
  ];

  const tools = [
    {
      title: "Search Everything",
      description:
        "Find workouts, nutrition entries and other FitNova members.",
      action: "Start searching",
      icon: Search,
      onClick: focusSearch
    },
    {
      title: "Reports & Export",
      description:
        "Download your fitness and nutrition report as CSV or PDF.",
      action: "Export report",
      icon: FileDown,
      onClick: () => setActiveModal("export")
    },
    {
      title: "Alerts & Reminders",
      description:
        "Set reminders for workouts, meal times and fitness goals.",
      action: "Manage reminders",
      icon: BellRing,
      onClick: () => setActiveModal("reminders")
    },
    {
      title: "Settings & Preferences",
      description:
        "Control notifications, units of measurement and theme.",
      action: "Open settings",
      icon: Settings2,
      onClick: () => setActiveModal("settings")
    },
    {
      title: "Feedback & Support",
      description:
        "Report an issue, request a feature or share your feedback.",
      action: "Contact support",
      icon: LifeBuoy,
      onClick: () => setActiveModal("support")
    }
  ];

  const maxDailyWorkouts = Math.max(...weeklyActivity.map((d) => d.value), 1);

  return (
    <div
      data-theme={prefs.theme === "light" ? "light" : "dark"}
      className="dashboard bg-[#080B08] text-white p-5 md:p-8 lg:p-10"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between"
      >
        <div>
          <p className="text-[#B7FF4A] text-xs font-bold tracking-[3px]">
            FITNESS DASHBOARD
          </p>

          <h1 className="text-3xl md:text-4xl font-bold mt-3">
            Welcome back, <span className="text-[#B7FF4A]">{name}!</span>
          </h1>

          <p className="text-gray-400 mt-2">
            Let's make today count. Your fitness journey continues!
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <CalendarButton theme={prefs.theme} />

          <NotificationBell preferences={prefs} />

          <button
            type="button"
            onClick={() => setActiveModal("settings")}
            title="Settings & preferences"
            aria-label="Open settings and preferences"
            className="w-11 h-11 grid place-items-center rounded-xl border border-[#26391C] bg-[#121A11] text-gray-300 hover:text-[#B7FF4A] hover:border-[#B7FF4A]/60 transition"
          >
            <Settings2 size={20} />
          </button>

          <button
            type="button"
            onClick={() => setActiveModal("support")}
            title="Feedback & support"
            aria-label="Open feedback and support"
            className="w-11 h-11 grid place-items-center rounded-xl border border-[#26391C] bg-[#121A11] text-gray-300 hover:text-[#B7FF4A] hover:border-[#B7FF4A]/60 transition"
          >
            <LifeBuoy size={20} />
          </button>
        </div>
      </motion.div>

      {/* Search and filtering */}
      <SearchFilter workouts={workouts} nutrition={nutrition} />

      {/* Feature shortcuts */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mt-6">
        {tools.map((tool, index) => {
          const Icon = tool.icon;

          return (
            <motion.button
              key={tool.title}
              type="button"
              onClick={tool.onClick}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.06 }}
              whileHover={{ y: -4 }}
              className="group text-left rounded-2xl border border-[#26391C] bg-[#101710] p-5 hover:border-[#B7FF4A]/60 transition"
            >
              <div className="flex items-center justify-between">
                <div className="p-2.5 rounded-xl bg-[#B7FF4A]/10">
                  <Icon className="text-[#B7FF4A]" size={20} />
                </div>

                <ArrowUpRight
                  className="text-gray-600 group-hover:text-[#B7FF4A] transition"
                  size={17}
                />
              </div>

              <h3 className="text-sm font-bold mt-4">{tool.title}</h3>
              <p className="text-xs text-gray-500 mt-1 leading-5">
                {tool.description}
              </p>

              <span className="inline-flex items-center gap-1 text-xs font-bold text-[#B7FF4A] mt-3">
                {tool.action}
              </span>
            </motion.button>
          );
        })}
      </div>

      {/* Hero Banner */}
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="hero-banner relative overflow-hidden mt-9 rounded-3xl border border-[#354D26] bg-gradient-to-br from-[#203718] via-[#132211] to-[#0D120D] p-7 md:p-10"
      >
        <div className="absolute -right-16 -top-20 w-72 h-72 bg-[#B7FF4A]/10 blur-3xl rounded-full" />

        <div className="relative z-10 max-w-xl">
          <div className="inline-flex items-center gap-2 bg-[#B7FF4A]/10 text-[#B7FF4A] px-4 py-2 rounded-full text-xs font-semibold">
            <Zap size={15} />
            YOUR FITNESS JOURNEY
          </div>

          <h2 className="text-3xl md:text-4xl font-bold mt-6 leading-tight">
            Build Your <span className="text-[#B7FF4A]">Best Self.</span>
          </h2>

          <p className="text-gray-300 mt-4 leading-7">
            Stay consistent, track your workouts and become stronger every day.
            Small steps create big results.
          </p>

          <div className="mt-7 inline-flex items-center gap-2 bg-[#B7FF4A] text-black font-bold px-5 py-3 rounded-xl">
            <Activity size={19} />
            Stay Active
          </div>
        </div>

        <Activity
          size={170}
          className="absolute right-10 bottom-5 text-[#B7FF4A]/10 hidden md:block"
        />
      </motion.div>

      {/* Statistics */}
      <div className="flex justify-between items-center mt-10 mb-5">
        <h2 className="text-xl font-bold">Activity Overview</h2>
        <span className="text-xs text-gray-500">Your statistics</span>
      </div>

      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {stats.map((stat, index) => {
          const Icon = stat.icon;

          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className="rounded-2xl border border-[#26391C] bg-[#101710] p-6 hover:border-[#B7FF4A]/60 transition"
            >
              <div className="flex justify-between items-center">
                <div className="p-3 rounded-xl bg-[#B7FF4A]/10">
                  <Icon className="text-[#B7FF4A]" size={23} />
                </div>
                <ArrowUpRight className="text-gray-600" size={19} />
              </div>

              <p className="text-gray-400 text-sm mt-5">{stat.title}</p>

              <h3 className="text-3xl font-bold mt-2">{stat.value}</h3>

              <p className="text-xs text-gray-500 mt-2">{stat.unit}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Activity and Goal */}
      <div className="grid lg:grid-cols-3 gap-5 mt-8">
        {/* Weekly Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 rounded-2xl border border-[#26391C] bg-[#101710] p-6"
        >
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold">Weekly Activity</h2>
              <p className="text-gray-500 text-sm mt-1">
                Your workouts, last 7 days
              </p>
            </div>
            <Activity className="text-[#B7FF4A]" />
          </div>

          <div className="flex items-end justify-between gap-3 h-44 mt-8">
            {weeklyActivity.map((item) => (
              <div
                key={item.day}
                className="flex-1 flex flex-col items-center gap-3"
              >
                <div className="w-full h-36 flex items-end justify-center">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${(item.value / maxDailyWorkouts) * 100}%` }}
                    transition={{ duration: 0.8 }}
                    className="w-full max-w-10 rounded-t-lg bg-gradient-to-t from-[#719D2B] to-[#B7FF4A]"
                  />
                </div>
                <span className="text-xs text-gray-500">{item.day}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Daily Goal */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl border border-[#26391C] bg-[#101710] p-6"
        >
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold">Daily Goal</h2>
            <Target className="text-[#B7FF4A]" />
          </div>

          <div className="flex justify-center mt-8">
            <div className="w-36 h-36 rounded-full border-[10px] border-[#26391C] flex items-center justify-center relative">
              <div className="text-center">
                <p className="text-3xl font-bold">{dailyProgress}%</p>
                <p className="text-xs text-gray-500">Completed</p>
              </div>
            </div>
          </div>

          <div className="mt-6 h-2 rounded-full bg-[#26391C] overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#719D2B] to-[#B7FF4A] transition-all duration-700"
              style={{ width: `${dailyProgress}%` }}
            />
          </div>

          <p className="text-gray-400 text-sm text-center mt-5">
            {dailyProgress >= 100
              ? "Daily goal achieved! Keep the momentum going."
              : todayMinutes > 0
                ? `${DAILY_GOAL_MINUTES - todayMinutes} more minutes to reach today's goal.`
                : "Start your first workout to reach your daily goal."}
          </p>
        </motion.div>
      </div>

      {/* Quick Start */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-8 rounded-2xl border border-[#26391C] bg-[#101710] p-6 md:p-8"
      >
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-[#B7FF4A]/10">
            <Play className="text-[#B7FF4A]" size={22} />
          </div>

          <div>
            <h2 className="text-xl font-bold">Ready to Get Started?</h2>
            <p className="text-gray-400 text-sm mt-1">
              Your workout activity will appear here.
            </p>
          </div>
        </div>

        <div className="mt-6 border border-dashed border-[#354D26] rounded-xl p-6 text-center">
          <Dumbbell className="mx-auto text-[#B7FF4A]" size={35} />
          <p className="font-semibold mt-3">
            {workouts.length
              ? `${workouts.length} workout${workouts.length === 1 ? "" : "s"} recorded`
              : "No workouts recorded yet"}
          </p>
          <p className="text-gray-500 text-sm mt-2">
            {workouts.length
              ? "Open the Workouts page to add or manage your sessions."
              : "Start tracking your fitness journey!"}
          </p>
        </div>
      </motion.div>

      <p className="text-center text-gray-600 mt-10 text-xs">
        © 2026 Fitness Tracker. Be Fit. Be Happy.
      </p>

      <ReportExportModal
        open={activeModal === "export"}
        onClose={() => setActiveModal(null)}
        workouts={workouts}
        nutrition={nutrition}
        progress={progress}
        preferences={prefs}
      />

      <RemindersModal
        open={activeModal === "reminders"}
        onClose={() => setActiveModal(null)}
        preferences={prefs}
      />

      <SettingsModal
        open={activeModal === "settings"}
        onClose={() => setActiveModal(null)}
        preferences={prefs}
        onChange={setPreferences}
      />

      <SupportModal
        open={activeModal === "support"}
        onClose={() => setActiveModal(null)}
      />
    </div>
  );
}
