import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, type UIMessage } from "ai";

const json = (status: number, error: string) =>
  new Response(JSON.stringify({ error }), { status, headers: { "Content-Type": "application/json" } });

export const Route = createFileRoute("/api/assistant")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const apiKey = process.env["LOVABLE_API_KEY"];
        if (!apiKey) return json(500, "The assistant is not configured yet.");
        let messages: UIMessage[];
        try {
          const body = (await request.json()) as { messages?: unknown };
          if (!Array.isArray(body.messages) || body.messages.length === 0 || body.messages.length > 60) throw new Error();
          messages = body.messages as UIMessage[];
          const chars = JSON.stringify(messages).length;
          if (chars > 60_000) return json(400, "This conversation is too long. Please start a new one.");
        } catch {
          return json(400, "Invalid request.");
        }
        const [{ createResponsesCall }, { ASSISTANT_INSTRUCTIONS }] = await Promise.all([
          import("@/lib/assistant/responses.server"),
          import("@/lib/assistant/instructions.server"),
        ]);
        try {
          const call = createResponsesCall(
            request,
            { baseURL: "https://ai.gateway.lovable.dev/v1", apiKey, model: "openai/gpt-6-astra" },
            await convertToModelMessages(messages),
            ASSISTANT_INSTRUCTIONS,
            messages,
          );
          return await call.response();
        } catch (e) {
          if (request.signal.aborted) return new Response(null, { status: 499 });
          console.error("assistant error", e);
          return json(500, "The assistant could not answer right now.");
        }
      },
    },
  },
});
