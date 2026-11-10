import React, { type ReactNode } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  type ViewStyle,
} from "react-native";
import * as Haptics from "expo-haptics";
import { theme } from "../theme";

interface CardProps {
  title?: string;
  children: ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  accessibilityLabel?: string;
}

export function Card({
  title,
  children,
  onPress,
  style,
  accessibilityLabel,
}: CardProps) {
  const content = (
    <View style={[styles.card, style]}>
      {title ? <Text style={styles.title}>{title}</Text> : null}
      {children}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        activeOpacity={0.86}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel || title || "Card"}
        onPress={() => {
          Haptics.selectionAsync().catch(() => {});
          onPress();
        }}
      >
        {content}
      </TouchableOpacity>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.md,
    ...theme.shadows.card,
  },
  title: {
    fontFamily: theme.fonts.bold,
    fontSize: theme.typography.h2.fontSize,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
  },
});
