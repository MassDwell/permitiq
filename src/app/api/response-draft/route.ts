import Anthropic from "@anthropic-ai/sdk";
import { auth } from "@clerk/nextjs/server";
import { checkRateLimit } from "@/lib/rate-limit";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: Request) {
  // AUDIT-FIX: Added authentication — endpoint was previously unauthenticated, allowing anyone to burn Anthropic API credits
  const { userId } = await auth();
  if (!userId) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Rate limit: 10 requests per user per hour
  const rl = checkRateLimit(`response-draft:${userId}`, 10, 60 * 60 * 1000);
  if (!rl.allowed) {
    return new Response(JSON.stringify({ error: "Rate limit exceeded. Try again later." }), {
      status: 429,
      headers: { "Content-Type": "application/json", "X-RateLimit-Reset": String(rl.resetAt) },
    });
  }

  try {
    const body = await req.json() as {
      objectionText: string;
      projectAddress: string;
      permitType: string;
    };

    const { objectionText, projectAddress, permitType } = body;

    if (!objectionText?.trim()) {
      return new Response(JSON.stringify({ error: "objectionText is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const stream = await client.messages.stream({
      model: "claude-3-5-sonnet-latest",
      max_tokens: 1500,
      system:
        "You are a construction permit consultant specializing in Massachusetts building regulations (780 CMR). Draft a professional, concise response to the following permit objection. Cite specific code sections (IBC, 780 CMR, or local ordinances). Be persuasive but professional. Format as a formal letter.",
      messages: [
        {
          role: "user",
          content: `Project Address: ${projectAddress || "Unknown"}\nPermit Type: ${permitType || "Building Permit"}\n\nObjection/Comment:\n${objectionText}`,
        },
      ],
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            if (
              chunk.type === "content_block_delta" &&
              chunk.delta.type === "text_delta"
            ) {
              controller.enqueue(encoder.encode(chunk.delta.text));
            }
          }
          controller.close();
        } catch (err) {
          controller.error(err);
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
        "Cache-Control": "no-cache",
      },
    });
  } catch (err) {
    console.error("[response-draft]", err);
    return new Response(JSON.stringify({ error: "Failed to generate response" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
