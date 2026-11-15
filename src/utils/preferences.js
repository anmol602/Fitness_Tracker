export const defaultPreferences = {
  theme: "dark",
  units: "metric",
  notifications: {
    workout: true,
    goal: true,
    follower: true,
    forum: true,
    reminder: true
  }
};

const typeToPreference = {
  workout: "workout",
  goal: "goal",
  follower: "follower",
  forum: "forum",
  reminder: "reminder"
};

export const isNotificationEnabled = (notification, preferences) => {
  const prefKey = typeToPreference[notification.type];

  if (!prefKey) return true;
  if (!preferences?.notifications) return true;

  return preferences.notifications[prefKey] !== false;
};

export const mergePreferences = (saved) => ({
  ...defaultPreferences,
  ...(saved || {}),
  notifications: {
    ...defaultPreferences.notifications,
    ...(saved?.notifications || {})
  }
});
