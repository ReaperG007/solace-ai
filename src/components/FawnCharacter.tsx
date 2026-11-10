import React, { useEffect, useRef, useState } from "react";
import { Animated, Easing, View, StyleSheet } from "react-native";
import Svg, { Circle, Ellipse, Path, G } from "react-native-svg";
import { theme } from "../theme";

interface FawnCharacterProps {
  size?: number;
  /** Triggers empathetic soft blinking when the user is logging or submitting a mood */
  isLoggingMood?: boolean;
  accessibilityLabel?: string;
}

export function FawnCharacter({
  size = 110,
  isLoggingMood = false,
  accessibilityLabel = "Solace gentle fawn companion with lavender behind its ear",
}: FawnCharacterProps) {
  const [eyesClosed, setEyesClosed] = useState(false);
  const floatAnim = useRef(new Animated.Value(0)).current;

  // Soft breathing float animation
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -4,
          duration: 2400,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 2400,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [floatAnim]);

  // Empathetic soft blinking (faster & gentler when logging mood)
  useEffect(() => {
    const intervalMs = isLoggingMood ? 1700 : 4200;
    const blinkTimer = setInterval(() => {
      setEyesClosed(true);
      setTimeout(() => setEyesClosed(false), isLoggingMood ? 260 : 180);
    }, intervalMs);

    return () => clearInterval(blinkTimer);
  }, [isLoggingMood]);

  return (
    <Animated.View
      accessible
      accessibilityRole="image"
      accessibilityLabel={accessibilityLabel}
      style={[
        styles.wrapper,
        {
          width: size,
          height: size,
          transform: [{ translateY: floatAnim }],
        },
      ]}
    >
      <View
        style={[
          styles.halo,
          {
            width: size * 0.94,
            height: size * 0.94,
            borderRadius: (size * 0.94) / 2,
          },
        ]}
      />
      <Svg width={size} height={size} viewBox="0 0 120 120">
        {/* Left & Right Ears */}
        <Path
          d="M36 42 C20 28, 16 14, 28 16 C38 18, 44 30, 46 40 Z"
          fill="#DFBFA4"
        />
        <Path
          d="M35 39 C24 29, 22 20, 29 21 C35 22, 39 30, 41 37 Z"
          fill={theme.colors.accentLight}
        />

        <Path
          d="M84 42 C100 28, 104 14, 92 16 C82 18, 76 30, 74 40 Z"
          fill="#DFBFA4"
        />
        <Path
          d="M85 39 C96 29, 98 20, 91 21 C85 22, 81 30, 79 37 Z"
          fill={theme.colors.accentLight}
        />

        {/* Small sprig of lavender tucked behind right ear */}
        <G transform="translate(81, 20) rotate(22)">
          <Path
            d="M4 20 Q6 10 8 2"
            stroke={theme.colors.primary}
            strokeWidth={2}
            fill="none"
            strokeLinecap="round"
          />
          <Ellipse cx="7.5" cy="3.5" rx="2.6" ry="3.4" fill={theme.colors.lavender} />
          <Ellipse cx="4.5" cy="7.5" rx="2.4" ry="3.1" fill="#B5A4CE" />
          <Ellipse cx="9.2" cy="8.5" rx="2.4" ry="3.1" fill={theme.colors.lavender} />
          <Ellipse cx="5.2" cy="12.5" rx="2.2" ry="2.8" fill="#B5A4CE" />
          <Ellipse cx="8.5" cy="13.5" rx="2.1" ry="2.7" fill={theme.colors.lavender} />
        </G>

        {/* Fawn Head */}
        <Ellipse cx="60" cy="64" rx="31" ry="28" fill="#E8CCB2" />
        {/* Soft forehead cream blaze & fawn spots */}
        <Ellipse cx="60" cy="74" rx="18" ry="15" fill="#F9EFE5" />
        <Circle cx="46" cy="46" r="2.2" fill="#F9EFE5" opacity={0.85} />
        <Circle cx="52" cy="42" r="1.7" fill="#F9EFE5" opacity={0.85} />
        <Circle cx="73" cy="46" r="2.1" fill="#F9EFE5" opacity={0.85} />

        {/* Soft light pink rosy cheeks */}
        <Ellipse cx="39" cy="69" rx="5.5" ry="3.4" fill={theme.colors.accent} opacity={0.55} />
        <Ellipse cx="81" cy="69" rx="5.5" ry="3.4" fill={theme.colors.accent} opacity={0.55} />

        {/* Large Empathetic Eyes */}
        {eyesClosed ? (
          <>
            <Path
              d="M40 59 Q46 64 52 59"
              stroke={theme.colors.textPrimary}
              strokeWidth={2.5}
              fill="none"
              strokeLinecap="round"
            />
            <Path
              d="M68 59 Q74 64 80 59"
              stroke={theme.colors.textPrimary}
              strokeWidth={2.5}
              fill="none"
              strokeLinecap="round"
            />
          </>
        ) : (
          <>
            <Circle cx="46" cy="59" r="5.6" fill="#2A343B" />
            <Circle cx="44.2" cy="57" r="2.1" fill="#FFFFFF" />
            <Circle cx="47.8" cy="61.2" r="1" fill="#FFFFFF" opacity={0.7} />

            <Circle cx="74" cy="59" r="5.6" fill="#2A343B" />
            <Circle cx="72.2" cy="57" r="2.1" fill="#FFFFFF" />
            <Circle cx="75.8" cy="61.2" r="1" fill="#FFFFFF" opacity={0.7} />
          </>
        )}

        {/* Cute nose & serene smile */}
        <Ellipse cx="60" cy="71" rx="4.2" ry="3" fill="#6F574A" />
        <Path
          d="M55 76.5 Q60 80.5 65 76.5"
          stroke="#6F574A"
          strokeWidth={1.9}
          fill="none"
          strokeLinecap="round"
        />
      </Svg>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: "center",
    justifyContent: "center",
  },
  halo: {
    position: "absolute",
    backgroundColor: theme.colors.secondaryLight,
  },
});
