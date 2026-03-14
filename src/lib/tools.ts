import Anthropic from "@anthropic-ai/sdk";

/**
 * Claude tool definitions for Life Assistant AI.
 * The API route executes these tools against Supabase.
 */
export const LIFE_ASSISTANT_TOOLS: Anthropic.Tool[] = [
  {
    name: "add_task",
    description: "Add a new task to the user's task list.",
    input_schema: {
      type: "object",
      properties: {
        title: { type: "string", description: "Short task title" },
        description: { type: "string", description: "Optional details" },
        priority: {
          type: "string",
          enum: ["low", "medium", "high"],
          description: "Task priority",
        },
        due_date: {
          type: "string",
          description: "Optional due date in YYYY-MM-DD format",
        },
      },
      required: ["title", "priority"],
    },
  },
  {
    name: "list_tasks",
    description: "Retrieve all pending and in-progress tasks for the user.",
    input_schema: {
      type: "object",
      properties: {
        status_filter: {
          type: "string",
          enum: ["pending", "in_progress", "done", "all"],
          description: "Filter by status (default: all active)",
        },
      },
      required: [],
    },
  },
  {
    name: "update_task",
    description: "Update the status or details of an existing task.",
    input_schema: {
      type: "object",
      properties: {
        task_id: { type: "string", description: "UUID of the task to update" },
        status: {
          type: "string",
          enum: ["pending", "in_progress", "done"],
        },
        priority: {
          type: "string",
          enum: ["low", "medium", "high"],
        },
        title: { type: "string" },
        due_date: { type: "string" },
      },
      required: ["task_id"],
    },
  },
  {
    name: "delete_task",
    description: "Delete a task by ID.",
    input_schema: {
      type: "object",
      properties: {
        task_id: { type: "string", description: "UUID of the task to delete" },
      },
      required: ["task_id"],
    },
  },
  {
    name: "add_reminder",
    description: "Set a reminder for a specific date and time.",
    input_schema: {
      type: "object",
      properties: {
        title: { type: "string", description: "What to remind the user about" },
        remind_at: {
          type: "string",
          description: "ISO 8601 datetime, e.g. 2026-03-15T09:00:00",
        },
        recurring: {
          type: "string",
          enum: ["daily", "weekly"],
          description: "Optional recurrence",
        },
      },
      required: ["title", "remind_at"],
    },
  },
  {
    name: "list_reminders",
    description: "List all upcoming reminders for the user.",
    input_schema: {
      type: "object",
      properties: {},
      required: [],
    },
  },
];

export const SYSTEM_PROMPT = `You are Life Assistant AI — a warm, practical personal assistant that helps users with:
- Daily planning and morning briefings
- Task management (create, update, complete, delete tasks)
- Reminders (set and list upcoming reminders)
- Life advice and productivity tips

Guidelines:
- Be concise and actionable. Avoid padding.
- When the user wants to manage tasks or set reminders, USE the available tools — don't just describe what you could do.
- After calling a tool, summarise the result naturally (e.g. "Done! I've added 'Buy groceries' as a high-priority task for tomorrow.").
- For daily planning requests, ask for current tasks first (list_tasks), then offer a prioritised plan.
- Today's date: ${new Date().toISOString().split("T")[0]}.`;
