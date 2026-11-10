// Solace AI Design System — Calming Aesthetic Theme
// Soft blues, muted greens, light gray background, light pink accents, Inter typography.

export const theme = {
  colors: {
    // Backgrounds
    background: "#F4F6F8", // Light gray canvas
    surface: "#FFFFFF",
    surfaceSoft: "#EEF3F7", // Soft blue-tinted surface
    surfaceGreen: "#EAF2EE", // Muted green tint
    surfacePink: "#FDF2F5", // Soft light pink tint

    // Brand & Calming Accents
    primary: "#5B8A72", // Muted sage green
    primaryDark: "#456E59",
    primaryLight: "#D9EAE1",

    secondary: "#7BA4C4", // Soft calming blue
    secondaryLight: "#E4EFF7",

    accent: "#E8A8B8", // Light soothing pink
    accentLight: "#FBE9EE",
    accentDark: "#B86E82",

    lavender: "#9B8BB4", // Lavender sprig behind fawn's ear
    lavenderLight: "#EEEAF5",

    // Text (WCAG AA+ contrast on light gray / white)
    textPrimary: "#1E2B33",
    textSecondary: "#52636E",
    textMuted: "#768792",
    textInverse: "#FFFFFF",

    // Borders & States
    border: "#DFE6EC",
    borderFocus: "#7BA4C4",
    success: "#4E8568",
    warning: "#C98A5B",
    warningLight: "#FDF3EA",
    danger: "#C4636E",
    dangerLight: "#FCEEFO".replace("O", "0"),
  },
  fonts: {
    regular: "Inter_400Regular",
    medium: "Inter_500Medium",
    bold: "Inter_700Bold",
  },
  typography: {
    hero: { fontSize: 30, lineHeight: 38 },
    h1: { fontSize: 24, lineHeight: 32 },
    h2: { fontSize: 19, lineHeight: 26 },
    body: { fontSize: 15, lineHeight: 23 },
    caption: { fontSize: 13, lineHeight: 18 },
    label: { fontSize: 12, lineHeight: 16 },
  },
  spacing: {
    xs: 6,
    sm: 10,
    md: 16,
    lg: 22,
    xl: 30,
  },
  radii: {
    sm: 10,
    md: 16,
    lg: 22,
    pill: 999,
  },
  shadows: {
    card: {
      shadowColor: "#1E2B33",
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.06,
      shadowRadius: 14,
      elevation: 3,
    },
    fab: {
      shadowColor: "#456E59",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.24,
      shadowRadius: 16,
      elevation: 6,
    },
  },
} as const;

export type AppTheme = typeof theme;
