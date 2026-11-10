import React from "react";
import { StyleSheet, View } from "react-native";
import { theme } from "../theme";

interface ProgressBarProps {
  /** Progress value clamped between 0 and 1 */
  progress: number;
  accessibilityLabel?: string;
}

export function ProgressBar({
  progress,
  accessibilityLabel = "Habit progress",
}: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(1, progress));

  return (
    <View
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel}
      accessibilityValue={{ min: 0, max: 100, now: Math.round(clamped * 100) }}
      style={styles.track}
    >
      <View style={[styles.fill, { width: `${clamped * 100}%` }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 7,
    width: "100%",
    borderRadius: theme.radii.pill,
    backgroundColor: theme.colors.secondaryLight,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    borderRadius: theme.radii.pill,
    backgroundColor: theme.colors.primary,
  },
});
