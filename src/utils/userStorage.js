export const getCurrentUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user") || "{}");
  } catch {
    return {};
  }
};

// Har user ki apni alag storage key, taake notifications/settings mix na hon
export const getUserKey = (base) => {
  const user = getCurrentUser();
  return `${base}_${user.id || "guest"}`;
};
