import axios from "axios";
import { config } from "./config";
import { getOrCreatePseudoUserId } from "./storage/userStorage";
import {
  enqueuePendingAction,
  getPendingQueue,
  replacePendingQueue,
  type QueuedAction,
} from "./storage/offlineQueue";

export const apiClient = axios.create({
  baseURL: config.apiUrl,
  timeout: config.apiTimeoutMs,
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.request.use(async (req) => {
  const userId = await getOrCreatePseudoUserId();
  req.headers.set("x-solace-user-id", userId);
  return req;
});

export interface MoodRecord {
  id: number;
  score: number;
  emotion: string;
  note: string;
  aiReply: string;
  createdAt: string;
  queued?: boolean;
}

export interface HabitRecord {
  id: number;
  title: string;
  description: string;
  frequency: number; // 1-7 days per week
  category: string;
  streak: number;
  completedToday: boolean;
  queued?: boolean;
}

export function isNetworkError(error: unknown): boolean {
  return axios.isAxiosError(error) && (!error.response || error.code === "ECONNABORTED");
}

export async function submitMood(payload: {
  score?: number;
  emotion?: string;
  note: string;
}): Promise<{ mood: MoodRecord; queued: boolean }> {
  const body = {
    score: payload.score ?? 3,
    emotion: payload.emotion ?? "Calm",
    note: payload.note,
  };
  try {
    const res = await apiClient.post<{ mood: MoodRecord }>("/api/mood", body);
    return { mood: res.data.mood, queued: false };
  } catch (err) {
    if (isNetworkError(err)) {
      await enqueuePendingAction({ type: "CREATE_MOOD", payload: body });
      return {
        queued: true,
        mood: {
          id: -Date.now(),
          ...body,
          aiReply:
            "Your reflection is saved safely on this device and queued – will sync later when connection returns.",
          createdAt: new Date().toISOString(),
          queued: true,
        },
      };
    }
    throw err;
  }
}

export async function fetchMoods(): Promise<MoodRecord[]> {
  const res = await apiClient.get<{ moods: MoodRecord[] }>("/api/mood");
  return res.data.moods;
}

export async function fetchHabits(): Promise<HabitRecord[]> {
  const res = await apiClient.get<{ habits: HabitRecord[] }>("/api/habits");
  return res.data.habits;
}

export async function createHabit(payload: {
  title: string;
  frequency: number;
  description?: string;
}): Promise<{ habit: HabitRecord; queued: boolean }> {
  try {
    const res = await apiClient.post<{ habit: HabitRecord }>(
      "/api/habits",
      payload
    );
    return { habit: res.data.habit, queued: false };
  } catch (err) {
    if (isNetworkError(err)) {
      await enqueuePendingAction({ type: "CREATE_HABIT", payload });
      return {
        queued: true,
        habit: {
          id: -Date.now(),
          title: payload.title,
          description: payload.description || "",
          frequency: payload.frequency,
          category: "Mindfulness",
          streak: 0,
          completedToday: false,
          queued: true,
        },
      };
    }
    throw err;
  }
}

export async function updateHabit(
  id: number,
  payload: { completedToday?: boolean; title?: string; frequency?: number }
): Promise<{ habit: HabitRecord; queued: boolean }> {
  try {
    const res = await apiClient.patch<{ habit: HabitRecord }>(
      `/api/habits/${id}`,
      payload
    );
    return { habit: res.data.habit, queued: false };
  } catch (err) {
    if (isNetworkError(err)) {
      await enqueuePendingAction({
        type: "UPDATE_HABIT",
        payload: { id, ...payload },
      });
      return {
        queued: true,
        habit: {
          id,
          title: payload.title || "Habit",
          description: "",
          frequency: payload.frequency || 5,
          category: "Mindfulness",
          streak: 0,
          completedToday: Boolean(payload.completedToday),
          queued: true,
        },
      };
    }
    throw err;
  }
}

export async function deleteHabit(id: number): Promise<void> {
  await apiClient.delete(`/api/habits/${id}`);
}

export async function flushPendingQueue(): Promise<number> {
  const queue = await getPendingQueue();
  if (queue.length === 0) return 0;

  const remaining: QueuedAction[] = [];
  let flushedCount = 0;

  for (const item of queue) {
    try {
      if (item.type === "CREATE_MOOD") {
        await apiClient.post("/api/mood", item.payload);
      } else if (item.type === "CREATE_HABIT") {
        await apiClient.post("/api/habits", item.payload);
      } else if (item.type === "UPDATE_HABIT") {
        const { id, ...rest } = item.payload;
        await apiClient.patch(`/api/habits/${id}`, rest);
      }
      flushedCount += 1;
    } catch {
      remaining.push(item);
    }
  }

  await replacePendingQueue(remaining);
  return flushedCount;
}
