import Groq from "groq-sdk";
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

const DEFAULT_USER_ID = "00000000-0000-0000-0000-000000000001";

const client = new Groq({
  apiKey: process.env.GROQ_API_KEY as string,
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const userMessages: { role: "user" | "assistant"; content: string }[] =
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
          const currentMessages: Groq.Chat.ChatCompletionMessageParam[] =
            userMessages.map((m) => ({ role: m.role, content: m.content }));

          // Agentic loop
          while (true) {
            const response = await client.chat.completions.create({
              model: "llama-3.3-70b-versatile",
              max_tokens: 1024,
              messages: [
                { role: "system", content: SYSTEM_PROMPT },
                ...currentMessages,
              ],
              tools: LIFE_ASSISTANT_TOOLS,
              tool_choice: "auto",
            });

            const message = response.choices[0].message;
            const toolCalls = message.tool_calls;

            if (!toolCalls || toolCalls.length === 0) {
              send(message.content ?? "");
              break;
            }

            // Push assistant message with tool calls
            currentMessages.push({
              role: "assistant",
              content: message.content ?? "",
              tool_calls: toolCalls,
            } as Groq.Chat.ChatCompletionAssistantMessageParam);

            // Execute each tool and collect results
            for (const toolCall of toolCalls) {
              let result: unknown;
              try {
                result = await executeTool(
                  toolCall.function.name,
                  JSON.parse(toolCall.function.arguments)
                );
              } catch (err) {
                result = { error: String(err) };
              }

              currentMessages.push({
                role: "tool",
                tool_call_id: toolCall.id,
                content: JSON.stringify(result),
              } as Groq.Chat.ChatCompletionToolMessageParam);
            }
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
        recurring: (input.recurring === "none" ? undefined : input.recurring) as "daily" | "weekly" | undefined,
      });
    case "list_reminders":
      return getReminders(userId);
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}
