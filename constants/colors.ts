const tintColorLight = "#6366f1"; // Indigo primary
const secondaryColorLight = "#f97316"; // Orange secondary
const backgroundLight = "#f8fafc";
const textLight = "#0f172a";

const tintColorDark = "#818cf8"; // Indigo primary (lighter for dark mode)
const secondaryColorDark = "#fb923c"; // Orange secondary (lighter for dark mode)
const backgroundDark = "#0f172a";
const textDark = "#f8fafc";

export default {
  light: {
    primary: tintColorLight,
    secondary: secondaryColorLight,
    background: backgroundLight,
    card: "#ffffff",
    text: textLight,
    border: "#e2e8f0",
    notification: secondaryColorLight,
    tabIconDefault: "#94a3b8",
    tabIconSelected: tintColorLight,
    success: "#10b981",
    warning: "#f59e0b",
    error: "#ef4444",
  },
  dark: {
    primary: tintColorDark,
    secondary: secondaryColorDark,
    background: backgroundDark,
    card: "#1e293b",
    text: textDark,
    border: "#334155",
    notification: secondaryColorDark,
    tabIconDefault: "#64748b",
    tabIconSelected: tintColorDark,
    success: "#34d399",
    warning: "#fbbf24",
    error: "#f87171",
  },
};