import { createClient } from "@supabase/supabase-js";
import type { Task, Reminder } from "@/types";

// Browser client (uses anon key)
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Server client (uses service role key — server-side only)
export function createServerClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// ─── Task helpers ────────────────────────────────────────────────────────────

export async function getTasks(userId: string): Promise<Task[]> {
  const db = createServerClient();
  const { data, error } = await db
    .from("tasks")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data as Task[];
}

export async function addTask(
  userId: string,
  payload: Omit<Task, "id" | "user_id" | "created_at">
): Promise<Task> {
  const db = createServerClient();
  const { data, error } = await db
    .from("tasks")
    .insert({ ...payload, user_id: userId })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as Task;
}

export async function updateTask(
  id: string,
  userId: string,
  patch: Partial<Omit<Task, "id" | "user_id" | "created_at">>
): Promise<Task> {
  const db = createServerClient();
  const { data, error } = await db
    .from("tasks")
    .update(patch)
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as Task;
}

export async function deleteTask(id: string, userId: string): Promise<void> {
  const db = createServerClient();
  const { error } = await db
    .from("tasks")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);
  if (error) throw new Error(error.message);
}

// ─── Reminder helpers ────────────────────────────────────────────────────────

export async function getReminders(userId: string): Promise<Reminder[]> {
  const db = createServerClient();
  const { data, error } = await db
    .from("reminders")
    .select("*")
    .eq("user_id", userId)
    .eq("done", false)
    .order("remind_at", { ascending: true });
  if (error) throw new Error(error.message);
  return data as Reminder[];
}

export async function addReminder(
  userId: string,
  payload: Omit<Reminder, "id" | "user_id" | "created_at" | "done">
): Promise<Reminder> {
  const db = createServerClient();
  const { data, error } = await db
    .from("reminders")
    .insert({ ...payload, user_id: userId, done: false })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as Reminder;
}
