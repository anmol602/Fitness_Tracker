import {
  Settings2,
  Moon,
  Sun,
  Scale,
  Ruler,
  BellRing,
  Dumbbell,
  Target,
  UserPlus,
  MessageSquare,
  Clock3,
  RotateCcw,
  Check
} from "lucide-react";
import Modal from "./Modal";
import {
  defaultPreferences,
  mergePreferences
} from "../utils/preferences";

const THEME_OPTIONS = [
  {
    value: "dark",
    label: "Dark",
    description: "Original FitNova look",
    icon: Moon
  },
  {
    value: "light",
    label: "Light",
    description: "Bright, daylight theme",
    icon: Sun
  }
];

const UNIT_OPTIONS = [
  {
    value: "metric",
    label: "Metric",
    description: "kg · cm · km",
    icon: Scale
  },
  {
    value: "imperial",
    label: "Imperial",
    description: "lb · in · mi",
    icon: Ruler
  }
];

const NOTIFICATION_OPTIONS = [
  {
    key: "workout",
    label: "Workout completion",
    description: "When a workout is logged",
    icon: Dumbbell
  },
  {
    key: "goal",
    label: "Goal achievement",
    description: "When you reach a daily goal",
    icon: Target
  },
  {
    key: "follower",
    label: "New followers",
    description: "When someone follows you",
    icon: UserPlus
  },
  {
    key: "forum",
    label: "Forum responses",
    description: "Replies on your community posts",
    icon: MessageSquare
  },
  {
    key: "reminder",
    label: "Reminders & alerts",
    description: "Workout, meal and goal reminders",
    icon: Clock3
  }
];

function OptionCard({ selected, onClick, icon: Icon, label, description }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`relative text-left rounded-xl border p-3 transition ${
        selected
          ? "border-[#B7FF4A] bg-[#B7FF4A]/10"
          : "border-[#26391C] bg-[#0D120D] hover:border-[#B7FF4A]/50"
      }`}
    >
      {selected && (
        <span className="absolute top-2 right-2 w-4 h-4 rounded-full bg-[#B7FF4A] text-black grid place-items-center">
          <Check size={11} strokeWidth={3} />
        </span>
      )}

      <Icon
        className={selected ? "text-[#B7FF4A]" : "text-gray-400"}
        size={19}
      />
      <p className="text-sm font-semibold mt-2">{label}</p>
      <p className="text-[10px] text-gray-500 mt-0.5">{description}</p>
    </button>
  );
}

function ToggleRow({ icon: Icon, label, description, checked, onToggle }) {
  return (
    <div className="flex items-center gap-3 py-3">
      <div className="p-2 rounded-lg bg-[#B7FF4A]/10 shrink-0">
        <Icon className="text-[#B7FF4A]" size={16} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold">{label}</p>
        <p className="text-[11px] text-gray-500">{description}</p>
      </div>

      <button
        type="button"
        onClick={onToggle}
        role="switch"
        aria-checked={checked}
        aria-label={`Toggle ${label}`}
        className={`relative w-10 h-6 rounded-full transition shrink-0 ${
          checked ? "bg-[#B7FF4A]" : "bg-[#26391C]"
        }`}
      >
        <span
          className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${
            checked ? "left-[18px]" : "left-0.5"
          }`}
        />
      </button>
    </div>
  );
}

export default function SettingsModal({
  open,
  onClose,
  preferences,
  onChange
}) {
  const prefs = mergePreferences(preferences);

  const updateNotification = (key) => {
    onChange({
      ...prefs,
      notifications: {
        ...prefs.notifications,
        [key]: !prefs.notifications[key]
      }
    });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Settings & Preferences"
      description="Personalize your FitNova experience."
      icon={Settings2}
    >
      <section>
        <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500">
          Theme
        </h3>

        <div className="grid grid-cols-2 gap-3 mt-3">
          {THEME_OPTIONS.map((theme) => (
            <OptionCard
              key={theme.value}
              selected={prefs.theme === theme.value}
              onClick={() => onChange({ ...prefs, theme: theme.value })}
              icon={theme.icon}
              label={theme.label}
              description={theme.description}
            />
          ))}
        </div>
      </section>

      <section className="mt-6">
        <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500">
          Units of measurement
        </h3>

        <div className="grid grid-cols-2 gap-3 mt-3">
          {UNIT_OPTIONS.map((unit) => (
            <OptionCard
              key={unit.value}
              selected={prefs.units === unit.value}
              onClick={() => onChange({ ...prefs, units: unit.value })}
              icon={unit.icon}
              label={unit.label}
              description={unit.description}
            />
          ))}
        </div>

        <p className="text-[11px] text-gray-500 mt-2">
          Used in exported reports and weight progress data.
        </p>
      </section>

      <section className="mt-6">
        <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 flex items-center gap-2">
          <BellRing size={14} />
          Notification preferences
        </h3>

        <div className="mt-2 divide-y divide-[#26391C]">
          {NOTIFICATION_OPTIONS.map((option) => (
            <ToggleRow
              key={option.key}
              icon={option.icon}
              label={option.label}
              description={option.description}
              checked={prefs.notifications[option.key] !== false}
              onToggle={() => updateNotification(option.key)}
            />
          ))}
        </div>
      </section>

      <div className="flex flex-wrap items-center justify-between gap-3 mt-6 pt-4 border-t border-[#26391C]">
        <p className="text-[11px] text-gray-500">
          Preferences save automatically on this device.
        </p>

        <button
          type="button"
          onClick={() => onChange(defaultPreferences)}
          className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 hover:text-[#B7FF4A] border border-[#26391C] rounded-lg px-3 py-2 hover:border-[#B7FF4A]/50 transition"
        >
          <RotateCcw size={14} />
          Reset defaults
        </button>
      </div>
    </Modal>
  );
}
