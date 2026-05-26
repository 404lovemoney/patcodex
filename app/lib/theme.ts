export type ThemeMode = "light" | "dark" | "system";

export const THEME_STORAGE_KEY = "murong-theme-mode";

export const themeOptions: Array<{ label: string; mode: ThemeMode }> = [
  { label: "亮色", mode: "light" },
  { label: "暗色", mode: "dark" },
  { label: "系统", mode: "system" },
];

export const isThemeMode = (value: string | null): value is ThemeMode =>
  value === "light" || value === "dark" || value === "system";

export const resolveThemeMode = (mode: ThemeMode, prefersDark: boolean) => {
  if (mode === "system") {
    return prefersDark ? "dark" : "light";
  }

  return mode;
};
