import React from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  type ViewStyle,
} from "react-native";
import * as Haptics from "expo-haptics";
import { theme } from "../theme";

export type ButtonVariant = "primary" | "secondary" | "accent" | "danger";

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  accessibilityLabel?: string;
  style?: ViewStyle;
}

export function Button({
  label,
  onPress,
  variant = "primary",
  disabled = false,
  loading = false,
  fullWidth = false,
  accessibilityLabel,
  style,
}: ButtonProps) {
  const palette = VARIANT_STYLES[variant];
  const isDisabled = disabled || loading;

  const handlePress = () => {
    if (isDisabled) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    onPress();
  };

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      disabled={isDisabled}
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || label}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      style={[
        styles.base,
        {
          backgroundColor: palette.bg,
          borderColor: palette.border,
          width: fullWidth ? "100%" : undefined,
          opacity: isDisabled ? 0.52 : 1,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={palette.text} />
      ) : (
        <Text style={[styles.label, { color: palette.text }]}>{label}</Text>
      )}
    </TouchableOpacity>
  );
}

const VARIANT_STYLES: Record<
  ButtonVariant,
  { bg: string; border: string; text: string }
> = {
  primary: {
    bg: theme.colors.primary,
    border: theme.colors.primary,
    text: theme.colors.textInverse,
  },
  secondary: {
    bg: theme.colors.secondaryLight,
    border: theme.colors.secondary,
    text: theme.colors.textPrimary,
  },
  accent: {
    bg: theme.colors.accentLight,
    border: theme.colors.accent,
    text: theme.colors.textPrimary,
  },
  danger: {
    bg: "#FCECEE",
    border: theme.colors.danger,
    text: theme.colors.danger,
  },
};

const styles = StyleSheet.create({
  base: {
    paddingVertical: 14,
    paddingHorizontal: 22,
    borderRadius: theme.radii.md,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontFamily: theme.fonts.bold,
    fontSize: 15,
    letterSpacing: 0.2,
  },
});
