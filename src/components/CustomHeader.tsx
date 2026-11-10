import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { theme } from "../theme";
import { config } from "../config";

interface CustomHeaderProps {
  title?: string;
  canGoBack: boolean;
  onBack: () => void;
}

export function CustomHeader({ title, canGoBack, onBack }: CustomHeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 12) }]}>
      <View style={styles.row}>
        {canGoBack ? (
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Go back"
            onPress={() => {
              Haptics.selectionAsync().catch(() => {});
              onBack();
            }}
            style={styles.backBtn}
          >
            <Ionicons
              name="chevron-back"
              size={22}
              color={theme.colors.textPrimary}
            />
          </TouchableOpacity>
        ) : (
          <View style={styles.spacer} />
        )}

        <View style={styles.center}>
          <View style={styles.accentDot} />
          <Text style={styles.brand}>{title || config.appName}</Text>
        </View>

        <View style={styles.spacer} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    paddingBottom: 12,
    paddingHorizontal: theme.spacing.md,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: theme.colors.surfaceSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  spacer: {
    width: 38,
  },
  center: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  accentDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.colors.accent,
  },
  brand: {
    fontFamily: theme.fonts.bold,
    fontSize: 17,
    color: theme.colors.textPrimary,
  },
});
