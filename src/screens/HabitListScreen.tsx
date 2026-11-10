import React, { useRef } from "react";
import {
  Animated,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../App";
import { fetchHabits, updateHabit, type HabitRecord } from "../api";
import { Card } from "../components/Card";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { ProgressBar } from "../components/ProgressBar";
import { ToastBanner } from "../components/ToastBanner";
import { theme } from "../theme";

type Props = NativeStackScreenProps<RootStackParamList, "HabitList">;

function HabitRowCard({
  habit,
  onToggle,
  onPress,
}: {
  habit: HabitRecord;
  onToggle: () => void;
  onPress: () => void;
}) {
  const pulse = useRef(new Animated.Value(1)).current;

  const handleToggle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    Animated.sequence([
      Animated.timing(pulse, { toValue: 1.25, duration: 120, useNativeDriver: true }),
      Animated.timing(pulse, { toValue: 1, duration: 140, useNativeDriver: true }),
    ]).start();
    onToggle();
  };

  const progress = Math.min(1, habit.streak / Math.max(1, habit.frequency));

  return (
    <Card
      style={styles.card}
      onPress={onPress}
      accessibilityLabel={`Habit ${habit.title}, ${habit.frequency} days per week`}
    >
      <View style={styles.row}>
        <View style={styles.info}>
          <Text style={styles.title}>{habit.title}</Text>
          <Text style={styles.meta}>
            Goal: {habit.frequency}× / week · Streak: {habit.streak}
            {habit.queued ? " · queued – will sync later" : ""}
          </Text>
        </View>

        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel={`Mark ${habit.title} completed`}
          onPress={handleToggle}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Animated.View style={{ transform: [{ scale: pulse }] }}>
            <Ionicons
              name={habit.completedToday ? "checkmark-circle" : "ellipse-outline"}
              size={30}
              color={
                habit.completedToday
                  ? theme.colors.primary
                  : theme.colors.secondary
              }
            />
          </Animated.View>
        </TouchableOpacity>
      </View>

      <View style={styles.progressWrap}>
        <ProgressBar progress={progress} />
      </View>
    </Card>
  );
}

export function HabitListScreen({ navigation, route }: Props) {
  const userId = route.params?.userId ?? "local";
  const queryClient = useQueryClient();

  const habitsQuery = useQuery({
    queryKey: ["habits", userId],
    queryFn: fetchHabits,
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, completedToday }: { id: number; completedToday: boolean }) =>
      updateHabit(id, { completedToday }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["habits", userId] });
    },
  });

  return (
    <View style={styles.screen}>
      <FlatList
        data={habitsQuery.data ?? []}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.listContent}
        onRefresh={() => habitsQuery.refetch()}
        refreshing={habitsQuery.isRefetching}
        ListHeaderComponent={
          habitsQuery.isError ? (
            <ToastBanner
              message="Could not refresh habits. Check network connection."
              onRetry={() => habitsQuery.refetch()}
            />
          ) : null
        }
        ListEmptyComponent={
          habitsQuery.isLoading ? (
            <LoadingSpinner message="Loading mindful habits..." />
          ) : (
            <Card style={styles.empty}>
              <Text style={styles.emptyText}>
                No habits yet. Tap the + button below to create your first
                gentle ritual.
              </Text>
            </Card>
          )
        }
        renderItem={({ item }) => (
          <HabitRowCard
            habit={item}
            onPress={() => navigation.navigate("HabitDetail", { habit: item })}
            onToggle={() =>
              toggleMutation.mutate({
                id: item.id,
                completedToday: !item.completedToday,
              })
            }
          />
        )}
      />

      <TouchableOpacity
        activeOpacity={0.9}
        accessibilityRole="button"
        accessibilityLabel="Add new habit"
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
          navigation.navigate("AddHabit");
        }}
        style={styles.fab}
      >
        <Ionicons name="add" size={28} color={theme.colors.textInverse} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.colors.background },
  listContent: { padding: theme.spacing.md, paddingBottom: 100, gap: 12 },
  card: { gap: 10 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  info: { flex: 1 },
  title: {
    fontFamily: theme.fonts.bold,
    fontSize: 16,
    color: theme.colors.textPrimary,
  },
  meta: {
    marginTop: 4,
    fontFamily: theme.fonts.regular,
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  progressWrap: { marginTop: 4 },
  empty: { paddingVertical: theme.spacing.xl, alignItems: "center" },
  emptyText: {
    fontFamily: theme.fonts.regular,
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: "center",
  },
  fab: {
    position: "absolute",
    right: 22,
    bottom: 26,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
    ...theme.shadows.fab,
  },
});
