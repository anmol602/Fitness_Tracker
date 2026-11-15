import { useRef, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import DropdownPanel from "./DropdownPanel";

const WEEK_DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December"
];

const startOfDay = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

const isSameDay = (a, b) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

export default function CalendarButton({ theme = "dark" }) {
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [viewDate, setViewDate] = useState(() => new Date());
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let day = 1; day <= daysInMonth; day++) {
    cells.push(new Date(year, month, day));
  }

  const today = startOfDay(new Date());
  const label = selectedDate.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric"
  });

  const changeMonth = (offset) => {
    setViewDate(new Date(year, month + offset, 1));
  };

  const selectDate = (date) => {
    setSelectedDate(date);
    setViewDate(new Date(date.getFullYear(), date.getMonth(), 1));
    setOpen(false);
  };

  return (
    <div ref={wrapperRef} className="relative shrink-0">
      <button
        type="button"
        onClick={() => {
          setViewDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1));
          setOpen((prev) => !prev);
        }}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={`Calendar, selected date ${label}`}
        className="flex items-center gap-2 bg-[#121A11] border border-[#26391C] rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-left hover:border-[#B7FF4A]/60 focus:outline-none focus-visible:border-[#B7FF4A] transition"
      >
        <CalendarDays className="text-[#B7FF4A] shrink-0" size={19} />

        <span className="min-w-0">
          <span className="hidden sm:block text-xs text-gray-400 leading-tight">Calendar</span>
          <span className="block text-sm font-semibold text-gray-200 leading-tight whitespace-nowrap">{label}</span>
        </span>
      </button>

      <DropdownPanel
        open={open}
        anchorRef={wrapperRef}
        onClose={() => setOpen(false)}
        maxWidth={288}
        theme={theme}
        className="overflow-y-auto rounded-2xl border border-[#26391C] bg-[#101710] p-4 shadow-xl shadow-black/40"
      >
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => changeMonth(-1)}
            aria-label="Previous month"
            className="w-8 h-8 grid place-items-center rounded-lg text-gray-400 hover:text-[#B7FF4A] hover:bg-[#182016] transition"
          >
            <ChevronLeft size={18} />
          </button>

          <p className="text-sm font-semibold">
            {MONTHS[month]} {year}
          </p>

          <button
            type="button"
            onClick={() => changeMonth(1)}
            aria-label="Next month"
            className="w-8 h-8 grid place-items-center rounded-lg text-gray-400 hover:text-[#B7FF4A] hover:bg-[#182016] transition"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        <div className="grid grid-cols-7 mt-4 mb-1">
          {WEEK_DAYS.map((day) => (
            <span
              key={day}
              className="text-center text-[10px] font-bold uppercase tracking-wide text-gray-500"
            >
              {day}
            </span>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-y-1">
          {cells.map((date, index) => {
            if (!date) return <span key={`empty-${index}`} />;

            const isSelected = isSameDay(date, selectedDate);
            const isToday = isSameDay(date, today);

            return (
              <button
                type="button"
                key={date.toISOString()}
                onClick={() => selectDate(date)}
                aria-pressed={isSelected}
                className={`h-8 w-8 mx-auto grid place-items-center rounded-lg text-xs transition ${
                  isSelected
                    ? "bg-[#B7FF4A] text-black font-bold"
                    : isToday
                      ? "text-[#B7FF4A] font-bold ring-1 ring-[#B7FF4A]/60 hover:bg-[#182016]"
                      : "text-gray-300 hover:bg-[#182016] hover:text-[#B7FF4A]"
                }`}
              >
                {date.getDate()}
              </button>
            );
          })}
        </div>

        <div className="flex items-center justify-between mt-4 pt-3 border-t border-[#26391C]">
          <button
            type="button"
            onClick={() => selectDate(new Date())}
            className="text-xs font-semibold text-[#B7FF4A] hover:underline"
          >
            Today
          </button>

          <button
            type="button"
            onClick={() => setOpen(false)}
            className="text-xs font-semibold text-gray-400 hover:text-gray-200"
          >
            Close
          </button>
        </div>
      </DropdownPanel>
    </div>
  );
}
