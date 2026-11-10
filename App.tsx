import React, { useEffect, useState } from "react";
import { AppState, type AppStateStatus } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_700Bold,
} from "@expo-google-fonts/inter";

import { flushPendingQueue, type HabitRecord, type MoodRecord } from "./src/api";
import { getOrCreatePseudoUserId } from "./src/storage/userStorage";
import { CustomHeader } from "./src/components/CustomHeader";
import { LoadingSpinner } from "./src/components/LoadingSpinner";
import { theme } from "./src/theme";

import { SplashScreen } from "./src/screens/SplashScreen";
import { OnboardingScreen } from "./src/screens/OnboardingScreen";
import { HomeScreen } from "./src/screens/HomeScreen";
import { AddMoodScreen } from "./src/screens/AddMoodScreen";
import { MoodDetailScreen } from "./src/screens/MoodDetailScreen";
import { HabitListScreen } from "./src/screens/HabitListScreen";
import { AddHabitScreen } from "./src/screens/AddHabitScreen";
import { HabitDetailScreen } from "./src/screens/HabitDetailScreen";

export type RootStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  Home: { userId?: string };
  AddMood: { userId?: string };
  MoodDetail: { mood: MoodRecord };
  HabitList: { userId?: string };
  AddHabit: { userId?: string };
  HabitDetail: { habit: HabitRecord; userId?: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 15_000,
    },
  },
});

export default function App() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_700Bold,
  });
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    getOrCreatePseudoUserId().then(setUserId);
  }, []);

  // Flush offline queue whenever the app becomes active
  useEffect(() => {
    if (!userId) return;
    const handleStateChange = async (nextState: AppStateStatus) => {
      if (nextState === "active") {
        const flushed = await flushPendingQueue();
        if (flushed > 0) {
          queryClient.invalidateQueries({ queryKey: ["moods", userId] });
          queryClient.invalidateQueries({ queryKey: ["habits", userId] });
        }
      }
    };
    const sub = AppState.addEventListener("change", handleStateChange);
    return () => sub.remove();
  }, [userId]);

  if (!fontsLoaded || !userId) {
    return (
      <SafeAreaProvider>
        <LoadingSpinner message="Preparing Solace AI..." />
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <StatusBar style="dark" backgroundColor={theme.colors.surface} />
        <NavigationContainer>
          <Stack.Navigator
            initialRouteName="Splash"
            screenOptions={({ navigation }) => ({
              animation: "slide_from_right",
              contentStyle: { backgroundColor: theme.colors.background },
              header: () => (
                <CustomHeader
                  canGoBack={navigation.canGoBack()}
                  onBack={() => navigation.goBack()}
                />
              ),
            })}
          >
            <Stack.Screen
              name="Splash"
              component={SplashScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Onboarding"
              component={OnboardingScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Home"
              component={HomeScreen}
              initialParams={{ userId }}
            />
            <Stack.Screen
              name="AddMood"
              component={AddMoodScreen}
              initialParams={{ userId }}
            />
            <Stack.Screen name="MoodDetail" component={MoodDetailScreen} />
            <Stack.Screen
              name="HabitList"
              component={HabitListScreen}
              initialParams={{ userId }}
            />
            <Stack.Screen
              name="AddHabit"
              component={AddHabitScreen}
              initialParams={{ userId }}
            />
            <Stack.Screen
              name="HabitDetail"
              component={HabitDetailScreen}
              initialParams={{ userId } as Partial<RootStackParamList["HabitDetail"]>}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
