import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  RefreshControl,
  ScrollView,
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
import {
  fetchHabits,
  fetchMoods,
  updateHabit,
  type HabitRecord,
} from "../api";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { FawnCharacter } from "../components/FawnCharacter";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { ProgressBar } from "../components/ProgressBar";
import { ToastBanner } from "../components/ToastBanner";
import { getPendingQueue } from "../storage/offlineQueue";
import { theme } from "../theme";

type Props = NativeStackScreenProps<RootStackParamList, "Home">;

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function HabitCarouselCard({
  habit,
  onToggle,
  onOpenDetail,
}: {
  habit: HabitRecord;
  onToggle: () => void;
  onOpenDetail: () => void;
}) {
  const pulse = useRef(new Animated.Value(1)).current;

  const handleToggle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    Animated.sequence([
      Animated.timing(pulse, { toValue: 1.24, duration: 120, useNativeDriver: true }),
      Animated.timing(pulse, { toValue: 1, duration: 140, useNativeDriver: true }),
    ]).start();
    onToggle();
  };

  const progress = Math.min(1, habit.streak / Math.max(1, habit.frequency));

  return (
    <Card
      style={styles.carouselCard}
      onPress={onOpenDetail}
      accessibilityLabel={`Habit ${habit.title}, streak ${habit.streak} of ${habit.frequency}`}
    >
      <View style={styles.carouselTop}>
        <Text numberOfLines={1} style={styles.habitTitle}>
          {habit.title}
        </Text>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel={`Mark ${habit.title} completed`}
          onPress={handleToggle}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Animated.View style={{ transform: [{ scale: pulse }] }}>
            <Ionicons
              name={habit.completedToday ? "checkmark-circle" : "ellipse-outline"}
              size={26}
              color={
                habit.completedToday
                  ? theme.colors.primary
                  : theme.colors.secondary
              }
            />
          </Animated.View>
        </TouchableOpacity>
      </View>

      <Text style={styles.habitMeta}>
        {habit.streak}/{habit.frequency} days this week
      </Text>
      <ProgressBar progress={progress} />

      <TouchableOpacity
        accessibilityRole="button"
        onPress={handleToggle}
        style={styles.quickBtn}
      >
        <Text style={styles.quickBtnText}>
          {habit.completedToday ? "Completed today" : "Mark completed"}
        </Text>
      </TouchableOpacity>
    </Card>
  );
}

export function HomeScreen({ navigation, route }: Props) {
  const userId = route.params?.userId ?? "local";
  const queryClient = useQueryClient();
  const [queuedCount, setQueuedCount] = useState(0);

  // Upward slide + opacity transition for latest mood card
  const moodAnim = useRef(new Animated.Value(0)).current;

  const moodsQuery = useQuery({
    queryKey: ["moods", userId],
    queryFn: fetchMoods,
  });

  const habitsQuery = useQuery({
    queryKey: ["habits", userId],
    queryFn: fetchHabits,
  });

  const toggleHabitMutation = useMutation({
    mutationFn: ({ id, completedToday }: { id: number; completedToday: boolean }) =>
      updateHabit(id, { completedToday }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["habits", userId] });
    },
  });

  const refreshQueueBadge = async () => {
    const q = await getPendingQueue();
    setQueuedCount(q.length);
  };

  useEffect(() => {
    refreshQueueBadge();
  }, [moodsQuery.dataUpdatedAt, habitsQuery.dataUpdatedAt]);

  useEffect(() => {
    moodAnim.setValue(0);
    Animated.timing(moodAnim, {
      toValue: 1,
      duration: 380,
      useNativeDriver: true,
    }).start();
  }, [moodsQuery.data, moodAnim]);

  const onRefresh = async () => {
    await Promise.all([
      moodsQuery.refetch(),
      habitsQuery.refetch(),
      refreshQueueBadge(),
    ]);
  };

  const latestMood = moodsQuery.data?.[0];
  const habits = habitsQuery.data ?? [];
  const hasError = moodsQuery.isError || habitsQuery.isError;

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={moodsQuery.isRefetching || habitsQuery.isRefetching}
          onRefresh={onRefresh}
          tintColor={theme.colors.primary}
        />
      }
    >
      {hasError ? (
        <ToastBanner
          message="Could not reach Solace server. Check your connection."
          onRetry={onRefresh}
        />
      ) : null}

      {queuedCount > 0 ? (
        <ToastBanner
          variant="queued"
          message={`${queuedCount} item(s) queued – will sync later when online.`}
          onRetry={onRefresh}
        />
      ) : null}

      {/* Greeting Header with Fawn & + Mood CTA */}
      <Card style={styles.greetingCard}>
        <View style={styles.greetingRow}>
          <View style={styles.greetingTextCol}>
            <Text style={styles.greeting}>{getGreeting()}</Text>
            <Text style={styles.subGreeting}>
              Take one gentle breath. How is your heart feeling today?
            </Text>
          </View>
          <FawnCharacter size={84} />
        </View>

        <View style={styles.greetingActions}>
          <Button
            label="+ Mood"
            variant="primary"
            onPress={() => navigation.navigate("AddMood")}
            accessibilityLabel="Log a new mood entry"
            style={styles.moodCta}
          />
          <Button
            label="All Habits"
            variant="secondary"
            onPress={() => navigation.navigate("HabitList")}
            accessibilityLabel="View all mindful habits"
          />
        </View>
      </Card>

      {/* Latest Mood Card */}
      <Text style={styles.sectionTitle}>Latest Reflection</Text>
      {moodsQuery.isLoading ? (
        <LoadingSpinner message="Gathering your recent mood..." />
      ) : latestMood ? (
        <Animated.View
          style={{
            opacity: moodAnim,
            transform: [
              {
                translateY: moodAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [14, 0],
                }),
              },
            ],
          }}
        >
          <Card
            style={styles.moodCard}
            onPress={() =>
              navigation.navigate("MoodDetail", { mood: latestMood })
            }
            accessibilityLabel="Open latest mood reflection detail"
          >
            <View style={styles.moodHeader}>
              <View style={styles.emotionPill}>
                <Text style={styles.emotionText}>{latestMood.emotion}</Text>
              </View>
              <Text style={styles.timestamp}>
                {new Date(latestMood.createdAt).toLocaleString(undefined, {
                  month: "short",
                  day: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </Text>
            </View>

            <Text numberOfLines={2} style={styles.moodNote}>
              {latestMood.note}
            </Text>

            <View style={styles.aiReplyBox}>
              <Text style={styles.aiLabel}>Solace AI</Text>
              <Text numberOfLines={3} style={styles.aiReply}>
                “{latestMood.aiReply}”
              </Text>
            </View>
          </Card>
        </Animated.View>
      ) : (
        <Card style={styles.emptyCard}>
          <Text style={styles.emptyText}>
            No mood reflections yet. Tap + Mood to check in with Solace.
          </Text>
        </Card>
      )}

      {/* Habit Summary Carousel */}
      <View style={styles.sectionRow}>
        <Text style={styles.sectionTitle}>Habit Summary</Text>
        <TouchableOpacity
          accessibilityRole="button"
          onPress={() => navigation.navigate("HabitList")}
        >
          <Text style={styles.linkText}>See all</Text>
        </TouchableOpacity>
      </View>

      {habitsQuery.isLoading ? (
        <LoadingSpinner />
      ) : habits.length === 0 ? (
        <Card style={styles.emptyCard}>
          <Text style={styles.emptyText}>
            Start your first gentle habit to build calm momentum.
          </Text>
          <Button
            label="Create Habit"
            variant="accent"
            onPress={() => navigation.navigate("AddHabit")}
            style={{ marginTop: 12 }}
          />
        </Card>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.carousel}
        >
          {habits.map((habit) => (
            <HabitCarouselCard
              key={habit.id}
              habit={habit}
              onToggle={() =>
                toggleHabitMutation.mutate({
                  id: habit.id,
                  completedToday: !habit.completedToday,
                })
              }
              onOpenDetail={() =>
                navigation.navigate("HabitDetail", { habit })
              }
            />
          ))}
        </ScrollView>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.colors.background },
  content: { padding: theme.spacing.md, paddingBottom: 40 },
  greetingCard: {
    backgroundColor: theme.colors.surfaceSoft,
    marginBottom: theme.spacing.lg,
  },
  greetingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  greetingTextCol: { flex: 1 },
  greeting: {
    fontFamily: theme.fonts.bold,
    fontSize: 24,
    color: theme.colors.textPrimary,
  },
  subGreeting: {
    marginTop: 4,
    fontFamily: theme.fonts.regular,
    fontSize: 14,
    lineHeight: 20,
    color: theme.colors.textSecondary,
  },
  greetingActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: theme.spacing.md,
  },
  moodCta: { flex: 1 },
  sectionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
  },
  sectionTitle: {
    fontFamily: theme.fonts.bold,
    fontSize: 18,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
  },
  linkText: {
    fontFamily: theme.fonts.bold,
    fontSize: 14,
    color: theme.colors.primary,
  },
  moodCard: {
    backgroundColor: theme.colors.surface,
  },
  moodHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  emotionPill: {
    backgroundColor: theme.colors.accentLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: theme.radii.pill,
  },
  emotionText: {
    fontFamily: theme.fonts.bold,
    fontSize: 12,
    color: theme.colors.accentDark,
  },
  timestamp: {
    fontFamily: theme.fonts.regular,
    fontSize: 12,
    color: theme.colors.textMuted,
  },
  moodNote: {
    fontFamily: theme.fonts.medium,
    fontSize: 15,
    color: theme.colors.textPrimary,
    marginBottom: 10,
  },
  aiReplyBox: {
    backgroundColor: theme.colors.surfaceGreen,
    borderRadius: theme.radii.md,
    padding: 12,
  },
  aiLabel: {
    fontFamily: theme.fonts.bold,
    fontSize: 11,
    color: theme.colors.primaryDark,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  aiReply: {
    fontFamily: theme.fonts.regular,
    fontSize: 14,
    lineHeight: 21,
    color: theme.colors.textPrimary,
  },
  emptyCard: {
    alignItems: "center",
    paddingVertical: theme.spacing.lg,
  },
  emptyText: {
    fontFamily: theme.fonts.regular,
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: "center",
  },
  carousel: {
    gap: 12,
    paddingRight: 16,
  },
  carouselCard: {
    width: 230,
    gap: 10,
  },
  carouselTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  habitTitle: {
    flex: 1,
    fontFamily: theme.fonts.bold,
    fontSize: 15,
    color: theme.colors.textPrimary,
  },
  habitMeta: {
    fontFamily: theme.fonts.regular,
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  quickBtn: {
    marginTop: 4,
    backgroundColor: theme.colors.surfaceSoft,
    borderRadius: theme.radii.sm,
    paddingVertical: 8,
    alignItems: "center",
  },
  quickBtnText: {
    fontFamily: theme.fonts.medium,
    fontSize: 12,
    color: theme.colors.primaryDark,
  },
});
