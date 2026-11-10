import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../App";
import { FawnCharacter } from "../components/FawnCharacter";
import { getOnboardingAgreed } from "../storage/userStorage";
import { theme } from "../theme";

type Props = NativeStackScreenProps<RootStackParamList, "Splash">;

export function SplashScreen({ navigation }: Props) {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let cancelled = false;

    Animated.sequence([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300, // 300ms fade-in
        useNativeDriver: true,
      }),
      Animated.delay(500),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(async () => {
      if (cancelled) return;
      const agreed = await getOnboardingAgreed();
      navigation.replace(agreed ? "Home" : "Onboarding");
    });

    return () => {
      cancelled = true;
    };
  }, [navigation, opacity]);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.center, { opacity }]}>
        <FawnCharacter size={132} />
        <Text style={styles.title}>Solace AI</Text>
        <Text style={styles.subtitle}>Calm reflections & gentle rituals</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing.lg,
  },
  center: {
    alignItems: "center",
  },
  title: {
    marginTop: theme.spacing.md,
    fontFamily: theme.fonts.bold,
    fontSize: 32,
    color: theme.colors.textPrimary,
  },
  subtitle: {
    marginTop: theme.spacing.xs,
    fontFamily: theme.fonts.regular,
    fontSize: 15,
    color: theme.colors.textSecondary,
  },
});
