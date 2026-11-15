import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  BellRing,
  CheckCheck,
  Trash2,
  Dumbbell,
  Target,
  UserPlus,
  MessageSquare,
  Clock3,
  Info
} from "lucide-react";
import DropdownPanel from "./DropdownPanel";
import { useNotifications } from "../utils/notifications";
import { isNotificationEnabled } from "../utils/preferences";
import { timeAgo } from "../utils/format";

const TYPE_STYLES = {
  workout: {
    icon: Dumbbell,
    label: "Workout",
    className: "text-[#B7FF4A] bg-[#B7FF4A]/10"
  },
  goal: {
    icon: Target,
    label: "Goal",
    className: "text-amber-300 bg-amber-400/10"
  },
  follower: {
    icon: UserPlus,
    label: "Follower",
    className: "text-sky-300 bg-sky-400/10"
  },
  forum: {
    icon: MessageSquare,
    label: "Forum",
    className: "text-violet-300 bg-violet-400/10"
  },
  reminder: {
    icon: Clock3,
    label: "Reminder",
    className: "text-orange-300 bg-orange-400/10"
  },
  system: {
    icon: Info,
    label: "Update",
    className: "text-gray-300 bg-white/5"
  }
};

const styleFor = (type) => TYPE_STYLES[type] || TYPE_STYLES.system;

export default function NotificationBell({ preferences }) {
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState("all");
  const wrapperRef = useRef(null);
  const navigate = useNavigate();

  const {
    notifications,
    markRead,
    markAllRead,
    removeNotification,
    clearNotifications
  } = useNotifications();

  const enabledNotifications = notifications
    .filter((item) => isNotificationEnabled(item, preferences))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const unreadCount = enabledNotifications.filter((item) => !item.read).length;

  const visibleNotifications = enabledNotifications.filter(
    (item) => filter === "all" || !item.read
  );

  const openNotification = (notification) => {
    markRead(notification.id);
    setOpen(false);

    if (notification.link) navigate(notification.link);
  };

  return (
    <div ref={wrapperRef} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((previous) => !previous)}
        aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ""}`}
        aria-expanded={open}
        className="relative w-11 h-11 grid place-items-center rounded-xl border border-[#26391C] bg-[#121A11] text-gray-300 hover:text-[#B7FF4A] hover:border-[#B7FF4A]/60 transition"
      >
        {unreadCount > 0 ? <BellRing size={20} /> : <Bell size={20} />}

        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 min-w-5 h-5 px-1 grid place-items-center rounded-full bg-[#B7FF4A] text-black text-[10px] font-bold">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      <DropdownPanel
        open={open}
        anchorRef={wrapperRef}
        onClose={() => setOpen(false)}
        maxWidth={384}
        theme={preferences?.theme}
        className="flex flex-col overflow-hidden rounded-2xl border border-[#26391C] bg-[#101710] shadow-2xl shadow-black/50"
      >
        <div className="flex items-start justify-between gap-3 px-4 pt-4 shrink-0">
          <div>
            <h3 className="text-sm font-bold">Activity Notifications</h3>
            <p className="text-[11px] text-gray-500 mt-0.5">
              {unreadCount > 0
                ? `${unreadCount} unread update${unreadCount === 1 ? "" : "s"}`
                : "You're all caught up"}
            </p>
          </div>

          <span className="text-[10px] font-bold uppercase tracking-wider text-[#B7FF4A] bg-[#B7FF4A]/10 px-2 py-1 rounded-full">
            Live
          </span>
        </div>

        <div className="flex gap-1 px-4 mt-3 shrink-0">
          {[
            { value: "all", label: "All" },
            { value: "unread", label: "Unread" }
          ].map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setFilter(tab.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                filter === tab.value
                  ? "bg-[#B7FF4A] text-black"
                  : "text-gray-400 hover:bg-[#182016] hover:text-[#B7FF4A]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto mt-3 divide-y divide-[#26391C]">
          {visibleNotifications.length === 0 ? (
            <div className="px-4 py-10 text-center">
              <Bell className="mx-auto text-gray-600" size={30} />
              <p className="text-sm font-semibold mt-3">No notifications</p>
              <p className="text-xs text-gray-500 mt-1">
                {filter === "unread"
                  ? "You have read all your notifications."
                  : "Workout and goal updates will appear here."}
              </p>
            </div>
          ) : (
            visibleNotifications.map((notification) => {
              const typeStyle = styleFor(notification.type);
              const Icon = typeStyle.icon;

              return (
                <div
                  key={notification.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => openNotification(notification)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      openNotification(notification);
                    }
                  }}
                  className={`flex items-start gap-3 px-4 py-3.5 cursor-pointer transition hover:bg-[#182016] focus:outline-none focus-visible:bg-[#182016] ${
                    notification.read ? "opacity-70" : ""
                  }`}
                >
                  <div className={`p-2 rounded-lg shrink-0 ${typeStyle.className}`}>
                    <Icon size={16} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold truncate">
                        {notification.title}
                      </p>

                      {!notification.read && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#B7FF4A] shrink-0" />
                      )}
                    </div>

                    <p className="text-xs text-gray-400 mt-0.5 leading-5">
                      {notification.message}
                    </p>

                    <p className="text-[10px] text-gray-600 mt-1.5">
                      {typeStyle.label} · {timeAgo(notification.createdAt)}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      removeNotification(notification.id);
                    }}
                    aria-label="Delete notification"
                    className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-400/10 transition shrink-0"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              );
            })
          )}
        </div>

        <div className="flex items-center justify-between gap-2 px-4 py-3 border-t border-[#26391C] shrink-0">
          <button
            type="button"
            onClick={markAllRead}
            disabled={unreadCount === 0}
            className="flex items-center gap-1.5 text-xs font-semibold text-[#B7FF4A] hover:underline disabled:text-gray-600 disabled:no-underline"
          >
            <CheckCheck size={15} />
            Mark all read
          </button>

          <button
            type="button"
            onClick={clearNotifications}
            disabled={enabledNotifications.length === 0}
            className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 hover:text-red-400 disabled:text-gray-600 transition"
          >
            <Trash2 size={14} />
            Clear all
          </button>
        </div>
      </DropdownPanel>
    </div>
  );
}
