import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";
import * as Speech from "expo-speech";
import * as Haptics from "expo-haptics";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../App";
import { submitMood } from "../api";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { FawnCharacter } from "../components/FawnCharacter";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { ToastBanner } from "../components/ToastBanner";
import { TypingIndicator } from "../components/TypingIndicator";
import { theme } from "../theme";

type Props = NativeStackScreenProps<RootStackParamList, "AddMood">;

const EMOTIONS = ["Calm", "Anxious", "Overwhelmed", "Tired", "Grateful", "Hopeful"];

export function AddMoodScreen({ navigation, route }: Props) {
  const userId = route.params?.userId ?? "local";
  const queryClient = useQueryClient();

  const [emotion, setEmotion] = useState("Calm");
  const [note, setNote] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [voicePromptActive, setVoicePromptActive] = useState(false);

  const trimmedLength = note.trim().length;
  const canSubmit = trimmedLength >= 3;

  const mutation = useMutation({
    mutationFn: () => submitMood({ emotion, note: note.trim(), score: 3 }),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["moods", userId] });
      if (res.queued) {
        setErrorMsg("Saved offline: queued – will sync later.");
        setTimeout(() => navigation.goBack(), 900);
      } else {
        navigation.goBack();
      }
    },
    onError: () => {
      setErrorMsg("Unable to send mood reflection right now.");
    },
  });

  const handleVoicePrompt = () => {
    Haptics.selectionAsync().catch(() => {});
    setVoicePromptActive(true);
    Speech.speak("Take a slow breath. How are you feeling right now?", {
      rate: 0.9,
      onDone: () => setVoicePromptActive(false),
      onStopped: () => setVoicePromptActive(false),
    });
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.fawnHeader}>
          {/* Fawn softly blinks its empathetic eyes as the user logs a mood */}
          <FawnCharacter
            size={104}
            isLoggingMood={trimmedLength > 0 || mutation.isPending}
          />
          <Text style={styles.fawnCaption}>
            Solace is here with you. Share what is on your mind.
          </Text>
        </View>

        {errorMsg ? (
          <ToastBanner
            variant={errorMsg.includes("queued") ? "queued" : "error"}
            message={errorMsg}
            onRetry={() => mutation.mutate()}
          />
        ) : null}

        {mutation.isPending ? (
          <Card style={styles.waitingCard}>
            <LoadingSpinner />
            <TypingIndicator />
          </Card>
        ) : (
          <Card>
            <Text style={styles.label}>Closest feeling</Text>
            <View style={styles.chipRow}>
              {EMOTIONS.map((item) => {
                const active = emotion === item;
                return (
                  <TouchableOpacity
                    key={item}
                    accessibilityRole="button"
                    accessibilityState={{ selected: active }}
                    onPress={() => {
                      Haptics.selectionAsync().catch(() => {});
                      setEmotion(item);
                    }}
                    style={[styles.chip, active && styles.chipActive]}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        active && styles.chipTextActive,
                      ]}
                    >
                      {item}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.inputHeader}>
              <Text style={styles.label}>Your reflection</Text>
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel="Play gentle voice prompt"
                onPress={handleVoicePrompt}
                style={[
                  styles.micBtn,
                  voicePromptActive && { backgroundColor: theme.colors.accentLight },
                ]}
              >
                <Ionicons
                  name={voicePromptActive ? "volume-high" : "mic-outline"}
                  size={18}
                  color={theme.colors.primaryDark}
                />
              </TouchableOpacity>
            </View>

            <TextInput
              multiline
              value={note}
              onChangeText={setNote}
              placeholder="How are you feeling?"
              placeholderTextColor={theme.colors.textMuted}
              accessibilityLabel="Mood reflection input"
              style={styles.textArea}
            />

            <Text style={styles.helper}>
              {canSubmit
                ? `${trimmedLength} characters`
                : `Enter at least 3 characters (${trimmedLength}/3)`}
            </Text>

            <Button
              label="Submit Reflection"
              variant="primary"
              fullWidth
              disabled={!canSubmit}
              onPress={() => {
                setErrorMsg(null);
                mutation.mutate();
              }}
              accessibilityLabel="Submit mood reflection to Solace AI"
            />
          </Card>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: theme.colors.background },
  container: { padding: theme.spacing.md, paddingBottom: 40 },
  fawnHeader: { alignItems: "center", marginBottom: theme.spacing.md },
  fawnCaption: {
    marginTop: 6,
    fontFamily: theme.fonts.medium,
    fontSize: 13,
    color: theme.colors.textSecondary,
    textAlign: "center",
  },
  label: {
    fontFamily: theme.fonts.bold,
    fontSize: 14,
    color: theme.colors.textPrimary,
    marginBottom: 8,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: theme.spacing.md,
  },
  chip: {
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderRadius: theme.radii.pill,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surfaceSoft,
  },
  chipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  chipText: {
    fontFamily: theme.fonts.medium,
    fontSize: 13,
    color: theme.colors.textSecondary,
  },
  chipTextActive: {
    color: theme.colors.textInverse,
  },
  inputHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  micBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: theme.colors.surfaceSoft,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  textArea: {
    minHeight: 130,
    backgroundColor: theme.colors.background,
    borderRadius: theme.radii.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 14,
    fontFamily: theme.fonts.regular,
    fontSize: 15,
    color: theme.colors.textPrimary,
    textAlignVertical: "top",
  },
  helper: {
    marginTop: 6,
    marginBottom: theme.spacing.md,
    fontFamily: theme.fonts.regular,
    fontSize: 12,
    color: theme.colors.textMuted,
  },
  waitingCard: {
    paddingVertical: theme.spacing.xl,
    alignItems: "center",
  },
});
