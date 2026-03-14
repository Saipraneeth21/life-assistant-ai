export const LIFE_ASSISTANT_TOOLS = [
  {
    type: "function" as const,
    function: {
      name: "add_task",
      description: "Add a new task to the user's task list.",
      parameters: {
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
  },
  {
    type: "function" as const,
    function: {
      name: "list_tasks",
      description: "Retrieve all pending and in-progress tasks for the user.",
      parameters: {
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
  },
  {
    type: "function" as const,
    function: {
      name: "update_task",
      description: "Update the status or details of an existing task.",
      parameters: {
        type: "object",
        properties: {
          task_id: { type: "string", description: "UUID of the task to update" },
          status: { type: "string", enum: ["pending", "in_progress", "done"] },
          priority: { type: "string", enum: ["low", "medium", "high"] },
          title: { type: "string" },
          due_date: { type: "string" },
        },
        required: ["task_id"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "delete_task",
      description: "Delete a task by ID.",
      parameters: {
        type: "object",
        properties: {
          task_id: { type: "string", description: "UUID of the task to delete" },
        },
        required: ["task_id"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "add_reminder",
      description: "Set a reminder for a specific date and time.",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string", description: "What to remind the user about" },
          remind_at: {
            type: "string",
            description: "ISO 8601 datetime, e.g. 2026-03-15T09:00:00",
          },
          recurring: {
            type: "string",
            enum: ["daily", "weekly", "none"],
            description: "Recurrence interval. Use 'none' if this is a one-time reminder.",
          },
        },
        required: ["title", "remind_at"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "list_reminders",
      description: "List all upcoming reminders for the user.",
      parameters: {
        type: "object",
        properties: {},
        required: [],
      },
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
