"use client";

import { useEffect, useRef, useState } from "react";
import {
  isThemeMode,
  resolveThemeMode,
  THEME_STORAGE_KEY,
  themeOptions,
  type ThemeMode,
} from "../lib/theme";

const getSystemPrefersDark = () => window.matchMedia("(prefers-color-scheme: dark)").matches;

const applyTheme = (mode: ThemeMode) => {
  document.documentElement.dataset.theme = resolveThemeMode(mode, getSystemPrefersDark());
};

export function ThemeSwitcher() {
  const [themeMode, setThemeMode] = useState<ThemeMode>("system");
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);
  const [hasThemeHydrated, setHasThemeHydrated] = useState(false);
  const themeMenuRef = useRef<HTMLDivElement>(null);

  const currentThemeLabel = themeOptions.find((option) => option.mode === themeMode)?.label ?? "系统";

  useEffect(() => {
    const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
    const nextMode = isThemeMode(storedTheme) ? storedTheme : "system";
    setThemeMode(nextMode);
    setHasThemeHydrated(true);
    applyTheme(nextMode);

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const syncSystemTheme = () => {
      const savedMode = window.localStorage.getItem(THEME_STORAGE_KEY);
      if (!savedMode || savedMode === "system") {
        applyTheme("system");
      }
    };

    mediaQuery.addEventListener("change", syncSystemTheme);

    return () => mediaQuery.removeEventListener("change", syncSystemTheme);
  }, []);

  useEffect(() => {
    if (!hasThemeHydrated) {
      return;
    }

    window.localStorage.setItem(THEME_STORAGE_KEY, themeMode);
    applyTheme(themeMode);
  }, [hasThemeHydrated, themeMode]);

  useEffect(() => {
    if (!isThemeMenuOpen) {
      return;
    }

    const closeThemeMenu = (event: MouseEvent) => {
      if (!themeMenuRef.current?.contains(event.target as Node)) {
        setIsThemeMenuOpen(false);
      }
    };

    window.addEventListener("mousedown", closeThemeMenu);

    return () => window.removeEventListener("mousedown", closeThemeMenu);
  }, [isThemeMenuOpen]);

  return (
    <div className="theme-switcher" ref={themeMenuRef}>
      <button
        className="theme-trigger"
        type="button"
        aria-haspopup="menu"
        aria-expanded={isThemeMenuOpen}
        onClick={() => setIsThemeMenuOpen((isOpen) => !isOpen)}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            setIsThemeMenuOpen(false);
          }
        }}
      >
        <span aria-hidden="true">◐</span>
        <span>{currentThemeLabel}</span>
      </button>
      {isThemeMenuOpen ? (
        <div className="theme-menu" role="menu" aria-label="选择主题模式">
          {themeOptions.map((option) => (
            <button
              className={option.mode === themeMode ? "is-active" : undefined}
              type="button"
              role="menuitemradio"
              aria-checked={option.mode === themeMode}
              key={option.mode}
              onClick={() => {
                setThemeMode(option.mode);
                setIsThemeMenuOpen(false);
              }}
              onKeyDown={(event) => {
                if (event.key === "Escape") {
                  setIsThemeMenuOpen(false);
                }
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
