import React from "react";
import { ScrollView, Share, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../App";
import { Card } from "../components/Card";
import { FawnCharacter } from "../components/FawnCharacter";
import { theme } from "../theme";

type Props = NativeStackScreenProps<RootStackParamList, "MoodDetail">;

export function MoodDetailScreen({ route }: Props) {
  const { mood } = route.params;

  const handleShare = async () => {
    Haptics.selectionAsync().catch(() => {});
    await Share.share({
      message: `Solace AI Reflection (${mood.emotion}):\n"${mood.note}"\n\nSolace Reply:\n"${mood.aiReply}"`,
    });
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
      <View style={styles.fawnWrap}>
        <FawnCharacter size={92} />
      </View>

      <Card style={styles.card}>
        <View style={styles.topRow}>
          <View style={styles.pill}>
            <Text style={styles.pillText}>{mood.emotion}</Text>
          </View>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Share mood reflection"
            onPress={handleShare}
            style={styles.shareBtn}
          >
            <Ionicons
              name="share-outline"
              size={20}
              color={theme.colors.primaryDark}
            />
          </TouchableOpacity>
        </View>

        <Text style={styles.date}>
          {new Date(mood.createdAt).toLocaleString()}
        </Text>

        <Text style={styles.sectionLabel}>Your Reflection</Text>
        <Text style={styles.note}>{mood.note}</Text>

        <View style={styles.replyBox}>
          <Text style={styles.replyLabel}>Solace AI Reply</Text>
          <Text style={styles.replyText}>“{mood.aiReply}”</Text>
        </View>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.colors.background },
  container: { padding: theme.spacing.md, paddingBottom: 40 },
  fawnWrap: { alignItems: "center", marginBottom: theme.spacing.sm },
  card: { gap: 10 },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  pill: {
    backgroundColor: theme.colors.accentLight,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: theme.radii.pill,
  },
  pillText: {
    fontFamily: theme.fonts.bold,
    fontSize: 12,
    color: theme.colors.accentDark,
  },
  shareBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: theme.colors.surfaceSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  date: {
    fontFamily: theme.fonts.regular,
    fontSize: 12,
    color: theme.colors.textMuted,
  },
  sectionLabel: {
    marginTop: 6,
    fontFamily: theme.fonts.bold,
    fontSize: 13,
    color: theme.colors.textSecondary,
  },
  note: {
    fontFamily: theme.fonts.regular,
    fontSize: 16,
    lineHeight: 24,
    color: theme.colors.textPrimary,
  },
  replyBox: {
    marginTop: 8,
    backgroundColor: theme.colors.surfaceGreen,
    borderRadius: theme.radii.md,
    padding: 16,
  },
  replyLabel: {
    fontFamily: theme.fonts.bold,
    fontSize: 11,
    color: theme.colors.primaryDark,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  replyText: {
    fontFamily: theme.fonts.medium,
    fontSize: 16,
    lineHeight: 25,
    color: theme.colors.textPrimary,
  },
});
