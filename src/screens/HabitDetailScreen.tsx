import React, { useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../App";
import { deleteHabit, updateHabit } from "../api";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { ProgressBar } from "../components/ProgressBar";
import { ToastBanner } from "../components/ToastBanner";
import { theme } from "../theme";

type Props = NativeStackScreenProps<RootStackParamList, "HabitDetail">;

export function HabitDetailScreen({ route, navigation }: Props) {
  const { habit: initialHabit, userId = "local" } = route.params;
  const queryClient = useQueryClient();
  const [habit, setHabit] = useState(initialHabit);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const toggleMutation = useMutation({
    mutationFn: () =>
      updateHabit(habit.id, { completedToday: !habit.completedToday }),
    onSuccess: (res) => {
      setHabit((prev) => ({
        ...prev,
        completedToday: !prev.completedToday,
        streak: res.habit.streak ?? prev.streak,
        queued: res.queued,
      }));
      queryClient.invalidateQueries({ queryKey: ["habits", userId] });
    },
    onError: () => setErrorMsg("Failed to update habit completion."),
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteHabit(habit.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["habits", userId] });
      navigation.goBack();
    },
    onError: () => setErrorMsg("Unable to delete habit right now."),
  });

  const confirmDelete = () => {
    Alert.alert(
      "Delete Habit",
      `Remove "${habit.title}" from your rituals?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteMutation.mutate(),
        },
      ]
    );
  };

  const progress = Math.min(1, habit.streak / Math.max(1, habit.frequency));

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
      {errorMsg ? (
        <ToastBanner
          message={errorMsg}
          onRetry={() => toggleMutation.mutate()}
        />
      ) : null}

      <Card style={styles.card}>
        <Text style={styles.title}>{habit.title}</Text>
        <Text style={styles.meta}>
          Target: {habit.frequency} days / week · Current streak: {habit.streak}
        </Text>

        {habit.queued ? (
          <Text style={styles.queuedNote}>queued – will sync later</Text>
        ) : null}

        <View style={styles.progressSection}>
          <ProgressBar progress={progress} />
        </View>

        <Text style={styles.desc}>
          {habit.description ||
            "A steady, low-pressure ritual to support calm daily rhythm."}
        </Text>

        <View style={styles.actions}>
          <Button
            label={
              habit.completedToday ? "Completed Today (Undo)" : "Mark Completed"
            }
            variant={habit.completedToday ? "secondary" : "primary"}
            fullWidth
            loading={toggleMutation.isPending}
            onPress={() => {
              setErrorMsg(null);
              toggleMutation.mutate();
            }}
          />

          <Button
            label="Delete Habit"
            variant="danger"
            fullWidth
            loading={deleteMutation.isPending}
            onPress={confirmDelete}
          />
        </View>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.colors.background },
  container: { padding: theme.spacing.md },
  card: { gap: 12 },
  title: {
    fontFamily: theme.fonts.bold,
    fontSize: 24,
    color: theme.colors.textPrimary,
  },
  meta: {
    fontFamily: theme.fonts.medium,
    fontSize: 13,
    color: theme.colors.primaryDark,
  },
  queuedNote: {
    fontFamily: theme.fonts.medium,
    fontSize: 12,
    color: theme.colors.warning,
  },
  progressSection: { marginVertical: 4 },
  desc: {
    fontFamily: theme.fonts.regular,
    fontSize: 15,
    lineHeight: 22,
    color: theme.colors.textSecondary,
  },
  actions: {
    marginTop: 8,
    gap: 10,
  },
});
