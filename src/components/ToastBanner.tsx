import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { theme } from "../theme";

interface ToastBannerProps {
  message: string;
  onRetry?: () => void;
  variant?: "error" | "queued";
}

export function ToastBanner({
  message,
  onRetry,
  variant = "error",
}: ToastBannerProps) {
  const isError = variant === "error";

  return (
    <View
      accessible
      accessibilityRole="alert"
      style={[
        styles.banner,
        {
          backgroundColor: isError ? "#FCECEE" : theme.colors.warningLight,
          borderColor: isError ? theme.colors.danger : theme.colors.warning,
        },
      ]}
    >
      <Text
        style={[
          styles.message,
          { color: isError ? theme.colors.danger : "#8A5630" },
        ]}
      >
        {message}
      </Text>
      {onRetry ? (
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Retry request"
          onPress={onRetry}
          style={styles.retryBtn}
        >
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    borderWidth: 1,
    borderRadius: theme.radii.md,
    paddingHorizontal: 14,
    paddingVertical: 11,
    marginBottom: theme.spacing.md,
  },
  message: {
    flex: 1,
    fontFamily: theme.fonts.medium,
    fontSize: 13,
  },
  retryBtn: {
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: theme.radii.pill,
  },
  retryText: {
    fontFamily: theme.fonts.bold,
    fontSize: 12,
    color: theme.colors.textPrimary,
  },
});
