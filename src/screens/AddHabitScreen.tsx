import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../App";
import { createHabit } from "../api";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { ToastBanner } from "../components/ToastBanner";
import { theme } from "../theme";

type Props = NativeStackScreenProps<RootStackParamList, "AddHabit">;

export function AddHabitScreen({ navigation, route }: Props) {
  const userId = route.params?.userId ?? "local";
  const queryClient = useQueryClient();

  const [name, setName] = useState("");
  const [frequencyText, setFrequencyText] = useState("5");
  const [validationError, setValidationError] = useState<string | null>(null);

  const frequencyNum = Number(frequencyText);
  const isValid =
    name.trim().length > 0 &&
    Number.isInteger(frequencyNum) &&
    frequencyNum >= 1 &&
    frequencyNum <= 7;

  const mutation = useMutation({
    mutationFn: () =>
      createHabit({
        title: name.trim(),
        frequency: frequencyNum,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["habits", userId] });
      navigation.goBack();
    },
    onError: () => {
      setValidationError("Could not save habit. Please try again.");
    },
  });

  const handleSave = () => {
    if (!name.trim()) {
      setValidationError("Please enter a habit name.");
      return;
    }
    if (!Number.isInteger(frequencyNum) || frequencyNum < 1 || frequencyNum > 7) {
      setValidationError("Frequency must be a whole number from 1 to 7 days.");
      return;
    }
    setValidationError(null);
    mutation.mutate();
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      {validationError ? <ToastBanner message={validationError} /> : null}

      <Card title="New Gentle Habit">
        <View style={styles.field}>
          <Text style={styles.label}>Habit Name</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="e.g., 5-minute morning breathwork"
            placeholderTextColor={theme.colors.textMuted}
            accessibilityLabel="Habit name"
            style={styles.input}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Weekly Frequency (1–7 days)</Text>
          <TextInput
            value={frequencyText}
            onChangeText={setFrequencyText}
            keyboardType="number-pad"
            maxLength={1}
            placeholder="1 to 7"
            placeholderTextColor={theme.colors.textMuted}
            accessibilityLabel="Habit frequency per week between 1 and 7"
            style={styles.input}
          />
        </View>

        <Button
          label="Save Habit"
          variant="primary"
          fullWidth
          disabled={!isValid}
          loading={mutation.isPending}
          onPress={handleSave}
          accessibilityLabel="Save new habit"
        />
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.colors.background },
  container: { padding: theme.spacing.md },
  field: { marginBottom: theme.spacing.md },
  label: {
    fontFamily: theme.fonts.bold,
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginBottom: 6,
  },
  input: {
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: theme.fonts.regular,
    fontSize: 15,
    color: theme.colors.textPrimary,
  },
});
