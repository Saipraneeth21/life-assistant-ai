import Anthropic from "@anthropic-ai/sdk";
import { NextRequest } from "next/server";
import { LIFE_ASSISTANT_TOOLS, SYSTEM_PROMPT } from "@/lib/tools";
import {
  addTask,
  getTasks,
  updateTask,
  deleteTask,
  addReminder,
  getReminders,
} from "@/lib/supabase";

// Placeholder user ID until auth is added
const DEFAULT_USER_ID = "00000000-0000-0000-0000-000000000001";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY as string,
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const messages: { role: "user" | "assistant"; content: string }[] =
      body.messages || [];

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const send = (text: string) => {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ text })}\n\n`)
          );
        };

        try {
          let currentMessages: Anthropic.MessageParam[] = messages.map(
            (m) => ({ role: m.role, content: m.content })
          );

          // Agentic loop: keep going until no more tool calls
          while (true) {
            const response = await client.messages.create({
              model: "claude-3-5-sonnet-latest",
              max_tokens: 1024,
              system: SYSTEM_PROMPT,
              tools: LIFE_ASSISTANT_TOOLS,
              messages: currentMessages,
            });

            let hasToolUse = false;
            const toolResults: Anthropic.ToolResultBlockParam[] = [];

            for (const block of response.content) {
              if (block.type === "text") {
                send(block.text);
              } else if (block.type === "tool_use") {
                hasToolUse = true;
                let result: unknown;
                try {
                  result = await executeTool(
                    block.name,
                    block.input as Record<string, unknown>
                  );
                } catch (err) {
                  result = { error: String(err) };
                }
                toolResults.push({
                  type: "tool_result",
                  tool_use_id: block.id,
                  content: JSON.stringify(result),
                });
              }
            }

            if (!hasToolUse) break;

            // Feed tool results back and continue
            currentMessages = [
              ...currentMessages,
              { role: "assistant", content: response.content },
              { role: "user", content: toolResults },
            ];
          }
        } catch (err) {
          send(`Error: ${String(err)}`);
        } finally {
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
    });
  }
}

async function executeTool(
  name: string,
  input: Record<string, unknown>
): Promise<unknown> {
  const userId = DEFAULT_USER_ID;

  switch (name) {
    case "add_task":
      return addTask(userId, {
        title: input.title as string,
        description: input.description as string | undefined,
        priority: input.priority as "low" | "medium" | "high",
        status: "pending",
        due_date: input.due_date as string | undefined,
      });
    case "list_tasks":
      return getTasks(userId);
    case "update_task":
      return updateTask(input.task_id as string, userId, {
        status: input.status as "pending" | "in_progress" | "done" | undefined,
        priority: input.priority as "low" | "medium" | "high" | undefined,
        title: input.title as string | undefined,
        due_date: input.due_date as string | undefined,
      });
    case "delete_task":
      return deleteTask(input.task_id as string, userId);
    case "add_reminder":
      return addReminder(userId, {
        title: input.title as string,
        remind_at: input.remind_at as string,
        recurring: input.recurring as "daily" | "weekly" | undefined,
      });
    case "list_reminders":
      return getReminders(userId);
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}
