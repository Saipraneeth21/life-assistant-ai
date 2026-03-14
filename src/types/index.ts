export type Priority = "low" | "medium" | "high";
export type TaskStatus = "pending" | "in_progress" | "done";

export interface Task {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  priority: Priority;
  status: TaskStatus;
  due_date?: string; // ISO date string
  created_at: string;
}

export interface Reminder {
  id: string;
  user_id: string;
  title: string;
  remind_at: string; // ISO datetime
  recurring?: "daily" | "weekly" | null;
  done: boolean;
  created_at: string;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

// Tool action types returned by the AI layer
export type ToolName =
  | "add_task"
  | "list_tasks"
  | "update_task"
  | "delete_task"
  | "add_reminder"
  | "list_reminders";
