import { NextRequest, NextResponse } from "next/server";

// Allow this API route up to 180 seconds (Replicate cold-starts can be ~60–90s)
export const maxDuration = 180;

const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN ?? "";
const REPLICATE_API = "https://api.replicate.com/v1";

const POLL_TIMEOUT_MS = 180_000;
const POLL_INTERVAL_MS = 2_000;

async function pollPrediction(predictionId: string): Promise<string> {
  const deadline = Date.now() + POLL_TIMEOUT_MS;
  const headers = { Authorization: `Bearer ${REPLICATE_API_TOKEN}` };

  while (Date.now() < deadline) {
    await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));

    const res = await fetch(`${REPLICATE_API}/predictions/${predictionId}`, { headers });
    if (!res.ok) throw new Error(`Replicate poll failed: ${res.status}`);

    const data = (await res.json()) as {
      id: string;
      status: "starting" | "processing" | "succeeded" | "failed" | "canceled";
      output?: string | string[];
      error?: string;
    };

    if (data.status === "succeeded") {
      const output = Array.isArray(data.output) ? data.output[0] : data.output;
      if (!output) throw new Error("Replicate returned empty output.");
      return output;
    }

    if (data.status === "failed" || data.status === "canceled") {
      throw new Error(`Replicate prediction ${data.status}: ${data.error ?? "unknown error"}`);
    }
  }

  throw new Error("Replicate prediction timed out after 3 minutes.");
}

export async function POST(req: NextRequest) {
  if (!REPLICATE_API_TOKEN) {
    return NextResponse.json(
      { error: "REPLICATE_API_TOKEN is not configured on the server." },
      { status: 500 }
    );
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { gender, age, style, background, ethnicity, customPrompt } = body;

  const genderWord = gender === "male" ? "male" : gender === "female" ? "female" : "non-binary";
  const ageWord = age ? `${age}-year-old` : "25-year-old";
  const ethnicityWord = ethnicity ? `${ethnicity} ` : "";
  const clothingStyle = style || "casual clothing";
  const bgStyle = background || "plain studio background";

  let prompt = `Full body fashion portrait of a beautiful ${ageWord} ${ethnicityWord}${genderWord} model, wearing ${clothingStyle}, standing pose, looking at camera, ${bgStyle}, photorealistic, studio lighting, clean composition, high-fashion photography, shot on 85mm lens, highly detailed, sharp focus.`;

  if (customPrompt && customPrompt.trim()) {
    prompt = customPrompt.trim();
  }

  try {
    const createRes = await fetch(`${REPLICATE_API}/models/black-forest-labs/flux-schnell/predictions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${REPLICATE_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        input: {
          prompt: prompt,
          go_fast: true,
          num_outputs: 1,
          aspect_ratio: "3:4",
          output_format: "webp"
        },
      }),
    });

    if (!createRes.ok) {
      const errBody = await createRes.text();
      console.error("Replicate image gen prediction error:", errBody);
      return NextResponse.json(
        { error: `Replicate error: ${createRes.status} — ${errBody}` },
        { status: 502 }
      );
    }

    const prediction = (await createRes.json()) as { id: string };
    const resultImageUrl = await pollPrediction(prediction.id);

    return NextResponse.json({
      resultImageUrl,
      message: "AI Model generated successfully.",
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Image generation error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
