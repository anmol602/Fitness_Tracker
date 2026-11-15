import { useEffect, useState } from "react";
import {
  BellRing,
  Plus,
  Trash2,
  Clock3,
  CalendarDays,
  CheckCircle2,
  Dumbbell,
  Utensils,
  Target,
  Repeat,
  X
} from "lucide-react";
import Modal from "./Modal";
import useLocalStorage from "../hooks/useLocalStorage";
import { getUserKey } from "../utils/userStorage";
import { addNotification } from "../utils/notifications";
import { formatDate, localDateString } from "../utils/format";

const REMINDER_TYPES = [
  { value: "workout", label: "Workout", icon: Dumbbell },
  { value: "meal", label: "Meal", icon: Utensils },
  { value: "goal", label: "Fitness goal", icon: Target }
];

const typeStyleFor = (value) =>
  REMINDER_TYPES.find((item) => item.value === value) || REMINDER_TYPES[0];

export default function RemindersModal({ open, onClose, preferences }) {
  const [reminders, setReminders] = useLocalStorage(
    getUserKey("fitnova_reminders"),
    []
  );

  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [type, setType] = useState("workout");
  const [date, setDate] = useState(() => localDateString());
  const [time, setTime] = useState("07:00");
  const [repeat, setRepeat] = useState(false);
  const [notice, setNotice] = useState("");
  const [permission, setPermission] = useState(() =>
    typeof window !== "undefined" && "Notification" in window
      ? Notification.permission
      : "unsupported"
  );

  const safeReminders = Array.isArray(reminders) ? reminders : [];

  const sortedReminders = [...safeReminders].sort((a, b) => {
    const first = new Date(`${a.date}T${a.time}`).getTime() || 0;
    const second = new Date(`${b.date}T${b.time}`).getTime() || 0;
    return first - second;
  });

  const activeCount = safeReminders.filter((item) => item.active).length;

  useEffect(() => {
    const checkReminders = () => {
      if (!Array.isArray(reminders)) return;

      const now = new Date();
      const today = localDateString(now);

      reminders.forEach((reminder) => {
        if (!reminder.active) return;
        if (reminder.repeat && reminder.date > today) return;

        const scheduledDate = reminder.repeat ? today : reminder.date;
        const due = new Date(`${scheduledDate}T${reminder.time}:00`);
        const diff = now.getTime() - due.getTime();

        if (Number.isNaN(diff) || diff < 0 || diff > 60000) return;

        const firedKey = `fitnova_reminder_fired_${reminder.id}_${scheduledDate}`;

        if (localStorage.getItem(firedKey)) return;
        localStorage.setItem(firedKey, "true");

        addNotification({
          id: `reminder-due-${reminder.id}-${scheduledDate}`,
          type: "reminder",
          title: `Reminder: ${reminder.title}`,
          message: `${typeStyleFor(reminder.type).label} reminder is due now.`,
          createdAt: now.toISOString()
        });

        if (
          preferences?.notifications?.reminder !== false &&
          "Notification" in window &&
          Notification.permission === "granted"
        ) {
          new Notification("FitNova Reminder", { body: reminder.title });
        }
      });
    };

    checkReminders();
    const timer = setInterval(checkReminders, 30000);

    return () => clearInterval(timer);
  }, [reminders, preferences]);

  const requestPermission = async () => {
    if (!("Notification" in window)) {
      setNotice("This browser does not support desktop alerts.");
      return;
    }

    const result = await Notification.requestPermission();
    setPermission(result);

    if (result === "granted") {
      setNotice("Browser alerts enabled for this device.");
      new Notification("FitNova alerts enabled", {
        body: "You will now receive reminders for workouts, meals and goals."
      });
    } else if (result === "denied") {
      setNotice("Alerts are blocked. You can enable them in browser settings.");
    }
  };

  const addReminder = (event) => {
    event.preventDefault();

    if (!title.trim() || !date || !time) return;

    const reminder = {
      id: `r_${Date.now().toString(36)}`,
      title: title.trim(),
      type,
      date,
      time,
      repeat,
      active: true,
      createdAt: new Date().toISOString()
    };

    setReminders((previous) => [
      ...(Array.isArray(previous) ? previous : []),
      reminder
    ]);

    setTitle("");
    setType("workout");
    setRepeat(false);
    setShowForm(false);
    setNotice(
      `Reminder set for ${new Date(`${date}T${time}`).toLocaleString()}.`
    );

    addNotification({
      id: `reminder-created-${reminder.id}`,
      type: "system",
      title: "Reminder set",
      message: `${reminder.title} · ${formatDate(date)} at ${time}`,
      createdAt: new Date().toISOString()
    });
  };

  const toggleReminder = (id) => {
    setReminders((previous) =>
      (Array.isArray(previous) ? previous : []).map((reminder) =>
        reminder.id === id
          ? { ...reminder, active: !reminder.active }
          : reminder
      )
    );
  };

  const deleteReminder = (id) => {
    setReminders((previous) =>
      (Array.isArray(previous) ? previous : []).filter(
        (reminder) => reminder.id !== id
      )
    );
    setNotice("Reminder deleted.");
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Alerts & Reminders"
      description="Set reminders for workouts, meals and fitness goals."
      icon={BellRing}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs font-semibold text-gray-400 bg-[#0D120D] border border-[#26391C] rounded-full px-3 py-1.5">
          {activeCount} active reminder{activeCount === 1 ? "" : "s"}
        </span>

        <button
          type="button"
          onClick={requestPermission}
          disabled={permission === "granted" || permission === "unsupported"}
          className={`flex items-center gap-1.5 text-xs font-semibold rounded-lg px-3 py-2 border transition ${
            permission === "granted"
              ? "text-[#B7FF4A] border-[#B7FF4A]/40 bg-[#B7FF4A]/10"
              : "text-gray-300 border-[#26391C] hover:text-[#B7FF4A] hover:border-[#B7FF4A]/50"
          }`}
        >
          <BellRing size={14} />
          {permission === "granted"
            ? "Browser alerts on"
            : permission === "denied"
              ? "Alerts blocked"
              : permission === "unsupported"
                ? "Alerts unsupported"
                : "Enable browser alerts"}
        </button>
      </div>

      <button
        type="button"
        onClick={() => setShowForm((previous) => !previous)}
        className="mt-4 w-full flex items-center justify-center gap-2 bg-[#B7FF4A] text-black font-bold px-4 py-3 rounded-xl hover:bg-[#C8FF78] transition"
      >
        {showForm ? <X size={18} /> : <Plus size={18} />}
        {showForm ? "Cancel" : "New reminder"}
      </button>

      {showForm && (
        <form
          onSubmit={addReminder}
          className="mt-4 rounded-xl border border-[#26391C] bg-[#0D120D] p-4 space-y-4"
        >
          <div>
            <label
              htmlFor="reminder-title"
              className="block text-xs font-semibold text-gray-400 mb-1.5"
            >
              Reminder title
            </label>

            <input
              id="reminder-title"
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="e.g. Morning strength workout"
              className="w-full bg-[#101710] border border-[#26391C] rounded-lg px-3 py-2.5 text-sm text-gray-200 placeholder:text-gray-600 focus:outline-none focus:border-[#B7FF4A]/60"
            />
          </div>

          <div>
            <p className="text-xs font-semibold text-gray-400 mb-1.5">Type</p>

            <div className="flex flex-wrap gap-2">
              {REMINDER_TYPES.map((reminderType) => {
                const Icon = reminderType.icon;

                return (
                  <button
                    key={reminderType.value}
                    type="button"
                    onClick={() => setType(reminderType.value)}
                    aria-pressed={type === reminderType.value}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition ${
                      type === reminderType.value
                        ? "bg-[#B7FF4A] text-black"
                        : "text-gray-400 bg-[#101710] border border-[#26391C] hover:text-[#B7FF4A]"
                    }`}
                  >
                    <Icon size={14} />
                    {reminderType.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="reminder-date"
                className="block text-xs font-semibold text-gray-400 mb-1.5"
              >
                Date
              </label>

              <input
                id="reminder-date"
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
                className="w-full bg-[#101710] border border-[#26391C] rounded-lg px-3 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-[#B7FF4A]/60 [color-scheme:dark]"
              />
            </div>

            <div>
              <label
                htmlFor="reminder-time"
                className="block text-xs font-semibold text-gray-400 mb-1.5"
              >
                Time
              </label>

              <input
                id="reminder-time"
                type="time"
                value={time}
                onChange={(event) => setTime(event.target.value)}
                className="w-full bg-[#101710] border border-[#26391C] rounded-lg px-3 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-[#B7FF4A]/60 [color-scheme:dark]"
              />
            </div>
          </div>

          <label className="flex items-center gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={repeat}
              onChange={(event) => setRepeat(event.target.checked)}
              className="w-4 h-4 accent-[#B7FF4A]"
            />
            <span className="text-xs text-gray-400 flex items-center gap-1.5">
              <Repeat size={13} />
              Repeat daily
            </span>
          </label>

          <button
            type="submit"
            disabled={!title.trim()}
            className="w-full flex items-center justify-center gap-2 bg-[#B7FF4A] text-black font-bold px-4 py-2.5 rounded-lg hover:bg-[#C8FF78] disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            <CheckCircle2 size={17} />
            Save reminder
          </button>
        </form>
      )}

      {notice && (
        <p className="mt-3 text-xs text-[#B7FF4A] bg-[#B7FF4A]/10 border border-[#B7FF4A]/20 rounded-lg px-3 py-2">
          {notice}
        </p>
      )}

      <div className="mt-5">
        <h3 className="text-sm font-bold mb-3">Upcoming reminders</h3>

        {sortedReminders.length === 0 ? (
          <div className="border border-dashed border-[#354D26] rounded-xl py-9 px-4 text-center">
            <Clock3 className="mx-auto text-[#B7FF4A]" size={28} />
            <p className="text-sm font-semibold mt-3">No reminders yet</p>
            <p className="text-xs text-gray-500 mt-1">
              Create a reminder for your next workout or meal.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {sortedReminders.map((reminder) => {
              const reminderType = typeStyleFor(reminder.type);
              const Icon = reminderType.icon;

              return (
                <div
                  key={reminder.id}
                  className={`flex items-start gap-3 rounded-xl border border-[#26391C] bg-[#0D120D] p-3 transition ${
                    reminder.active ? "" : "opacity-55"
                  }`}
                >
                  <div className="p-2 rounded-lg bg-[#B7FF4A]/10 shrink-0">
                    <Icon className="text-[#B7FF4A]" size={16} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold truncate">
                      {reminder.title}
                    </p>
                    <p className="text-[11px] text-gray-500 mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
                      <span className="inline-flex items-center gap-1">
                        <CalendarDays size={11} />
                        {formatDate(reminder.date)}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Clock3 size={11} />
                        {reminder.time}
                      </span>
                      {reminder.repeat && (
                        <span className="inline-flex items-center gap-1 text-[#B7FF4A]">
                          <Repeat size={11} />
                          Daily
                        </span>
                      )}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => toggleReminder(reminder.id)}
                      aria-label={
                        reminder.active ? "Disable reminder" : "Enable reminder"
                      }
                      className={`relative w-9 h-5 rounded-full transition ${
                        reminder.active ? "bg-[#B7FF4A]" : "bg-[#26391C]"
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${
                          reminder.active ? "left-[18px]" : "left-0.5"
                        }`}
                      />
                    </button>

                    <button
                      type="button"
                      onClick={() => deleteReminder(reminder.id)}
                      aria-label="Delete reminder"
                      className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-400/10 transition"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <p className="text-[11px] text-gray-500 mt-4">
        Reminders are checked while the dashboard is open. Enable browser alerts
        to receive a notification at the scheduled time.
      </p>
    </Modal>
  );
}
