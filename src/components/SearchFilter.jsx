import { useEffect, useMemo, useState } from "react";
import {
  Search,
  ArrowUpDown,
  X,
  Dumbbell,
  Apple,
  User,
  SlidersHorizontal
} from "lucide-react";
import api from "../api";
import { formatDate } from "../utils/format";

const TYPE_FILTERS = [
  { value: "all", label: "All" },
  { value: "workouts", label: "Workouts" },
  { value: "nutrition", label: "Nutrition" },
  { value: "users", label: "People" }
];

const SORT_OPTIONS = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "name", label: "Name A–Z" },
  { value: "calories", label: "Calories (high → low)" }
];

const KIND_STYLES = {
  workout: {
    icon: Dumbbell,
    className: "text-[#B7FF4A] bg-[#B7FF4A]/10"
  },
  nutrition: {
    icon: Apple,
    className: "text-emerald-300 bg-emerald-400/10"
  },
  user: {
    icon: User,
    className: "text-sky-300 bg-sky-400/10"
  }
};

export default function SearchFilter({ workouts = [], nutrition = [] }) {
  const [query, setQuery] = useState("");
  const [type, setType] = useState("all");
  const [sort, setSort] = useState("newest");
  const [users, setUsers] = useState([]);
  const [searchingUsers, setSearchingUsers] = useState(false);
  const [userError, setUserError] = useState("");

  // People search sirf "People" tab me chalti hai, taake baaki results mix na hon
  useEffect(() => {
    if (type !== "users") return;

    const term = query.trim();

    if (term.length < 2) return;

    let cancelled = false;

    const timer = setTimeout(async () => {
      setSearchingUsers(true);

      try {
        const response = await api.get("/auth/users", {
          params: { search: term }
        });

        if (!cancelled) {
          setUsers(Array.isArray(response.data) ? response.data : []);
          setUserError("");
        }
      } catch {
        if (!cancelled) {
          setUsers([]);
          setUserError("People search is unavailable right now.");
        }
      } finally {
        if (!cancelled) setSearchingUsers(false);
      }
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query, type]);

  const results = useMemo(() => {
    const term = query.trim().toLowerCase();
    const matches = (value) => String(value || "").toLowerCase().includes(term);

    const includeWorkouts = type === "all" || type === "workouts";
    const includeNutrition = type === "all" || type === "nutrition";
    const includeUsers = type === "users";

    const workoutResults = includeWorkouts
      ? workouts
          .filter(
            (workout) =>
              !term || matches(workout.title) || matches(workout.category)
          )
          .map((workout) => ({
            key: `workout-${workout._id}`,
            kind: "workout",
            title: workout.title,
            subtitle: `${workout.category || "General"} · ${workout.duration || 0} min`,
            meta: `${workout.calories || 0} kcal`,
            calories: Number(workout.calories) || 0,
            date: new Date(workout.date || workout.createdAt).getTime() || 0,
            dateLabel: formatDate(workout.date || workout.createdAt)
          }))
      : [];

    const nutritionResults = includeNutrition
      ? nutrition
          .filter(
            (meal) =>
              !term || matches(meal.foodName) || matches(meal.category)
          )
          .map((meal) => ({
            key: `meal-${meal._id}`,
            kind: "nutrition",
            title: meal.foodName,
            subtitle: `${meal.category || "Other"} · ${meal.protein || 0}g protein`,
            meta: `${meal.calories || 0} kcal`,
            calories: Number(meal.calories) || 0,
            date: new Date(meal.date || meal.createdAt).getTime() || 0,
            dateLabel: formatDate(meal.date || meal.createdAt)
          }))
      : [];

    const userResults =
      includeUsers && term.length >= 2
        ? users.map((member) => ({
            key: `user-${member.id || member._id}`,
            kind: "user",
            title: member.name,
            subtitle: member.email,
            meta: "Member",
            calories: 0,
            date: 0,
            dateLabel: "Profile"
          }))
        : [];

    const combined = [
      ...workoutResults,
      ...nutritionResults,
      ...userResults
    ];

    combined.sort((a, b) => {
      if (sort === "oldest") return a.date - b.date;
      if (sort === "name") return a.title.localeCompare(b.title);
      if (sort === "calories") return b.calories - a.calories;
      return b.date - a.date;
    });

    return combined;
  }, [workouts, nutrition, users, query, type, sort]);

  const visibleResults = results.slice(0, 6);
  const hasFilter = query.trim() !== "" || type !== "all";
  const isUserQuery = query.trim().length >= 2;

  const clearFilters = () => {
    setQuery("");
    setType("all");
    setSort("newest");
  };

  return (
    <div className="mt-8 rounded-2xl border border-[#26391C] bg-[#101710] p-5 md:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Search className="text-[#B7FF4A]" size={19} />
            Search &amp; Filter
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            Search workouts and nutrition entries. Switch to{" "}
            <span className="text-gray-300 font-semibold">People</span> to find
            other members.
          </p>
        </div>

        {hasFilter && (
          <button
            type="button"
            onClick={clearFilters}
            className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 hover:text-[#B7FF4A] border border-[#26391C] rounded-lg px-3 py-2 hover:border-[#B7FF4A]/50 transition"
          >
            <X size={14} />
            Clear filters
          </button>
        )}
      </div>

      <div className="mt-5 grid lg:grid-cols-[1fr_auto] gap-3">
        <div className="relative">
          <Search
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500"
            size={18}
          />

          <input
            id="dashboard-search"
            name="fitnova-dashboard-search"
            type="search"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={
              type === "users"
                ? "Search members by name or email..."
                : "Search workouts or meals..."
            }
            aria-label={
              type === "users"
                ? "Search other members"
                : "Search workouts and nutrition entries"
            }
            className="w-full bg-[#0D120D] border border-[#26391C] rounded-xl pl-11 pr-11 py-3 text-sm text-gray-200 placeholder:text-gray-600 focus:outline-none focus:border-[#B7FF4A]/60 transition"
          />

          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Clear search"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#B7FF4A]"
            >
              <X size={16} />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 bg-[#0D120D] border border-[#26391C] rounded-xl px-3">
          <ArrowUpDown className="text-gray-500 shrink-0" size={16} />

          <select
            value={sort}
            onChange={(event) => setSort(event.target.value)}
            aria-label="Sort search results"
            className="bg-transparent text-sm text-gray-300 py-3 pr-1 focus:outline-none w-full lg:w-auto"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value} className="bg-[#101710] text-gray-200">
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 mt-3">
        <SlidersHorizontal className="text-gray-500" size={15} />

        {TYPE_FILTERS.map((filter) => (
          <button
            key={filter.value}
            type="button"
            onClick={() => setType(filter.value)}
            aria-pressed={type === filter.value}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              type === filter.value
                ? "bg-[#B7FF4A] text-black"
                : "text-gray-400 bg-[#0D120D] border border-[#26391C] hover:text-[#B7FF4A] hover:border-[#B7FF4A]/50"
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      <div className="mt-4 space-y-2">
        {searchingUsers && type === "users" && query.trim().length >= 2 ? (
          <p className="text-xs text-gray-500 py-4 text-center">
            Searching members...
          </p>
        ) : visibleResults.length > 0 ? (
          visibleResults.map((item) => {
            const kindStyle = KIND_STYLES[item.kind];
            const Icon = kindStyle.icon;

            return (
              <div
                key={item.key}
                className="flex items-center justify-between gap-3 rounded-xl border border-[#26391C] bg-[#0D120D] px-3 py-3 hover:border-[#B7FF4A]/40 transition"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`p-2 rounded-lg shrink-0 ${kindStyle.className}`}>
                    <Icon size={17} />
                  </div>

                  <div className="min-w-0">
                    <p className="text-sm font-semibold truncate">
                      {item.title}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {item.subtitle}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <p className="text-xs font-semibold text-gray-300">
                    {item.meta}
                  </p>
                  <p className="text-[10px] text-gray-600 mt-0.5">
                    {item.dateLabel}
                  </p>
                </div>
              </div>
            );
          })
        ) : (
          <div className="border border-dashed border-[#354D26] rounded-xl py-8 px-4 text-center">
            <Search className="mx-auto text-[#B7FF4A]" size={28} />
            <p className="text-sm font-semibold mt-3">No results found</p>
            <p className="text-xs text-gray-500 mt-1">
              {(isUserQuery && userError) ||
                (type === "users"
                  ? "Type at least 2 characters to search members."
                  : "Try a different keyword or filter.")}
            </p>
          </div>
        )}
      </div>

      {results.length > 0 && (
        <p className="text-[11px] text-gray-600 mt-3">
          Showing {visibleResults.length} of {results.length} result
          {results.length === 1 ? "" : "s"}
        </p>
      )}
    </div>
  );
}
