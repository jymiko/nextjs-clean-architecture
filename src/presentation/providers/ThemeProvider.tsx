"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";

interface BrandingSettings {
  systemName: string;
  systemDescription: string;
  primaryColor: string;
  secondaryColor: string;
  logoUrl: string | null;
}

interface ThemeContextType {
  branding: BrandingSettings | null;
  isLoading: boolean;
  refetch: () => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

/**
 * Convert HEX color to HSL format
 * @param hex - HEX color string (e.g., "#2563eb")
 * @returns HSL string without hsl() wrapper (e.g., "217 91% 60%")
 */
function hexToHSL(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return "0 0% 0%";

  const r = parseInt(result[1], 16) / 255;
  const g = parseInt(result[2], 16) / 255;
  const b = parseInt(result[3], 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

/**
 * Calculate appropriate foreground color based on background luminance
 * @param hex - Background HEX color
 * @returns HSL string for foreground (white or dark)
 */
function getForegroundColor(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return "0 0% 100%";

  const r = parseInt(result[1], 16);
  const g = parseInt(result[2], 16);
  const b = parseInt(result[3], 16);

  // Calculate relative luminance using WCAG formula
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  // Return dark text for light backgrounds, white text for dark backgrounds
  return luminance > 0.5 ? "240 10% 3.9%" : "0 0% 98%";
}

/**
 * Validate HEX color format
 */
function isValidHexColor(color: string): boolean {
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
}

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [branding, setBranding] = useState<BrandingSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const applyTheme = useCallback((data: BrandingSettings) => {
    const root = document.documentElement;

    // Validate and apply primary color
    if (data.primaryColor && isValidHexColor(data.primaryColor)) {
      const primaryHSL = hexToHSL(data.primaryColor);
      const primaryForeground = getForegroundColor(data.primaryColor);

      // Tailwind v4 @theme variables
      root.style.setProperty("--color-primary", `hsl(${primaryHSL})`);
      root.style.setProperty(
        "--color-primary-foreground",
        `hsl(${primaryForeground})`
      );

      // Legacy shadcn/ui CSS variables
      root.style.setProperty("--primary", primaryHSL);
      root.style.setProperty("--primary-foreground", primaryForeground);
    }

    // Validate and apply secondary color
    if (data.secondaryColor && isValidHexColor(data.secondaryColor)) {
      const secondaryHSL = hexToHSL(data.secondaryColor);
      const secondaryForeground = getForegroundColor(data.secondaryColor);

      // Tailwind v4 @theme variables
      root.style.setProperty("--color-secondary", `hsl(${secondaryHSL})`);
      root.style.setProperty(
        "--color-secondary-foreground",
        `hsl(${secondaryForeground})`
      );

      // Legacy shadcn/ui CSS variables
      root.style.setProperty("--secondary", secondaryHSL);
      root.style.setProperty("--secondary-foreground", secondaryForeground);
    }
  }, []);

  const fetchBranding = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/system/settings/branding");
      const result = await response.json();

      if (result.success && result.data) {
        setBranding(result.data);
        applyTheme(result.data);
      }
    } catch (error) {
      console.error("Failed to fetch branding settings:", error);
    } finally {
      setIsLoading(false);
    }
  }, [applyTheme]);

  useEffect(() => {
    fetchBranding();
  }, [fetchBranding]);

  return (
    <ThemeContext.Provider value={{ branding, isLoading, refetch: fetchBranding }}>
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * Hook to access theme context
 * @returns ThemeContextType with branding data and refetch function
 */
export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
