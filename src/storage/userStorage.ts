import AsyncStorage from "@react-native-async-storage/async-storage";

const PSEUDO_USER_ID_KEY = "@solace/pseudo_user_id";
const ONBOARDING_AGREED_KEY = "@solace/onboarding_agreed";

function generatePseudoId(): string {
  const random = Math.random().toString(36).slice(2, 10);
  const stamp = Date.now().toString(36);
  return `solace_${stamp}_${random}`;
}

export async function getOrCreatePseudoUserId(): Promise<string> {
  const existing = await AsyncStorage.getItem(PSEUDO_USER_ID_KEY);
  if (existing) return existing;
  const fresh = generatePseudoId();
  await AsyncStorage.setItem(PSEUDO_USER_ID_KEY, fresh);
  return fresh;
}

export async function getOnboardingAgreed(): Promise<boolean> {
  const val = await AsyncStorage.getItem(ONBOARDING_AGREED_KEY);
  return val === "true";
}

export async function setOnboardingAgreed(agreed: boolean): Promise<void> {
  await AsyncStorage.setItem(ONBOARDING_AGREED_KEY, agreed ? "true" : "false");
}
