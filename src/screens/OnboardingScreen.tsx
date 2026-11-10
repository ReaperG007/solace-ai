import React, { useState } from "react";
import { BackHandler, Platform, StyleSheet, Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../App";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { FawnCharacter } from "../components/FawnCharacter";
import { setOnboardingAgreed } from "../storage/userStorage";
import { theme } from "../theme";

type Props = NativeStackScreenProps<RootStackParamList, "Onboarding">;

export function OnboardingScreen({ navigation }: Props) {
  const [declinedNote, setDeclinedNote] = useState(false);

  const handleAgree = async () => {
    await setOnboardingAgreed(true);
    navigation.replace("Home");
  };

  const handleDecline = () => {
    if (Platform.OS === "android") {
      BackHandler.exitApp();
    } else {
      setDeclinedNote(true);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.hero}>
        <FawnCharacter size={120} />
        <Text style={styles.eyebrow}>PRIVATE WELLNESS SANCTUARY</Text>
        <Text style={styles.title}>Welcome to Solace AI</Text>
      </View>

      <Card style={styles.card}>
        <Text style={styles.noticeTitle}>Your Privacy Comes First</Text>
        <Text style={styles.noticeBody}>
          Your entries are anonymous, stored only under a random install ID,
          and AI reflections run safely without personal tracking or IP logs.
        </Text>
      </Card>

      {declinedNote ? (
        <Text style={styles.declinedText}>
          No problem at all — you can close Solace AI anytime, or tap Agree
          whenever you feel ready.
        </Text>
      ) : null}

      <View style={styles.actions}>
        <Button
          label="Agree & Enter Sanctuary"
          variant="primary"
          fullWidth
          onPress={handleAgree}
          accessibilityLabel="Agree to privacy notice and enter home screen"
        />
        <Button
          label="Decline"
          variant="accent"
          fullWidth
          onPress={handleDecline}
          accessibilityLabel="Decline and exit Solace AI"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    justifyContent: "center",
    padding: theme.spacing.lg,
  },
  hero: {
    alignItems: "center",
    marginBottom: theme.spacing.lg,
  },
  eyebrow: {
    marginTop: theme.spacing.md,
    fontFamily: theme.fonts.bold,
    fontSize: 11,
    letterSpacing: 1.4,
    color: theme.colors.primary,
  },
  title: {
    marginTop: 6,
    fontFamily: theme.fonts.bold,
    fontSize: 28,
    color: theme.colors.textPrimary,
    textAlign: "center",
  },
  card: {
    backgroundColor: theme.colors.surfaceSoft,
    marginBottom: theme.spacing.lg,
  },
  noticeTitle: {
    fontFamily: theme.fonts.bold,
    fontSize: 16,
    color: theme.colors.textPrimary,
    marginBottom: 6,
  },
  noticeBody: {
    fontFamily: theme.fonts.regular,
    fontSize: 14,
    lineHeight: 22,
    color: theme.colors.textSecondary,
  },
  declinedText: {
    fontFamily: theme.fonts.medium,
    fontSize: 13,
    color: theme.colors.accentDark,
    textAlign: "center",
    marginBottom: theme.spacing.md,
  },
  actions: {
    gap: 12,
  },
});
