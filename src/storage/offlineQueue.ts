import AsyncStorage from "@react-native-async-storage/async-storage";

const PENDING_QUEUE_KEY = "@solace/pending_queue";

export type QueuedAction =
  | {
      id: string;
      type: "CREATE_MOOD";
      payload: { score: number; emotion: string; note: string };
      createdAt: string;
    }
  | {
      id: string;
      type: "CREATE_HABIT";
      payload: { title: string; frequency: number; description?: string };
      createdAt: string;
    }
  | {
      id: string;
      type: "UPDATE_HABIT";
      payload: { id: number; completedToday?: boolean; title?: string; frequency?: number };
      createdAt: string;
    };

export async function getPendingQueue(): Promise<QueuedAction[]> {
  const raw = await AsyncStorage.getItem(PENDING_QUEUE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as QueuedAction[];
  } catch {
    return [];
  }
}

export async function enqueuePendingAction(
  action: Omit<QueuedAction, "id" | "createdAt">
): Promise<QueuedAction> {
  const current = await getPendingQueue();
  const nextItem = {
    ...action,
    id: `q_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    createdAt: new Date().toISOString(),
  } as QueuedAction;
  await AsyncStorage.setItem(
    PENDING_QUEUE_KEY,
    JSON.stringify([...current, nextItem])
  );
  return nextItem;
}

export async function replacePendingQueue(
  items: QueuedAction[]
): Promise<void> {
  await AsyncStorage.setItem(PENDING_QUEUE_KEY, JSON.stringify(items));
}
