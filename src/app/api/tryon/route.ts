import { NextRequest, NextResponse } from "next/server";

// Allow this API route up to 180 seconds (Replicate cold-starts can be ~60–90s)
export const maxDuration = 180;

// ─── Config ──────────────────────────────────────────────────────────────────
const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN ?? "";
const REPLICATE_API = "https://api.replicate.com/v1";
// IDM-VTON model — state-of-the-art virtual try-on (non-commercial license)
const MODEL_VERSION =
  "cuuupid/idm-vton:0513734a452173b8173e907e3a59d19a36266e55b48528559432bd21c7d7e985";

// Maximum ms to wait for the prediction to complete (Replicate cold-starts can be ~60s)
const POLL_TIMEOUT_MS = 180_000;
const POLL_INTERVAL_MS = 2_500;

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Convert a File (from multipart form) to a base64 data URI that Replicate accepts */
async function fileToDataUri(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const base64 = Buffer.from(buffer).toString("base64");
  return `data:${file.type};base64,${base64}`;
}

/** Download an image from a URL and convert it to a base64 data URI server-side */
async function downloadToDataUri(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    },
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) throw new Error(`Could not download image from ${url} (HTTP ${res.status})`);
  const contentType = res.headers.get("content-type") ?? "image/jpeg";
  const buffer = await res.arrayBuffer();
  const base64 = Buffer.from(buffer).toString("base64");
  return `data:${contentType};base64,${base64}`;
}

/** Derive a plain-language garment description from the avatar / body context  */
function buildGarmentDescription(
  avatarType: string,
  age: string,
  heightCm: string,
  weightKg: string
): string {
  return (
    `A high-quality realistic virtual try-on image. ` +
    `The person should wear the provided garment naturally and accurately. ` +
    `Preserve the identity, face, body shape, and pose of the original person exactly. ` +
    `Fit the clothing correctly to the body with proper alignment on shoulders, arms, and torso. ` +
    `Maintain realistic fabric behavior including folds, wrinkles, and stretching. ` +
    `Match lighting, shadows, and perspective between the person and the garment. ` +
    `Ensure the clothing texture, color, and design remain unchanged and clearly visible. ` +
    `Keep the background unchanged from the original image. ` +
    `Output should look like a real photograph, not AI-generated. ` +
    `Ultra-realistic, high resolution, sharp details, natural skin tones. ` +
    `Character: ${avatarType}, age ${age}, height ${heightCm} cm, weight ${weightKg} kg.`
  );
}

/** Poll a Replicate prediction until complete or timed out */
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
    // otherwise still starting / processing — keep polling
  }

  throw new Error("Replicate prediction timed out after 3 minutes.");
}

// ─── Route Handler ────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  // 1. Guard: API key must be set
  if (!REPLICATE_API_TOKEN) {
    return NextResponse.json(
      { error: "REPLICATE_API_TOKEN is not configured on the server." },
      { status: 500 }
    );
  }

  // 2. Parse multipart form data
  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid multipart form data." }, { status: 400 });
  }

  const selfieFile = formData.get("selfie") as File | null;
  const outfitFile = formData.get("outfit") as File | null;
  const garmentUrl = (formData.get("garmentUrl") as string) ?? "";
  const selfieUrl = (formData.get("selfieUrl") as string) ?? "";
  const avatarType = (formData.get("avatarType") as string) ?? "person";
  const age = (formData.get("age") as string) ?? "25";
  const heightCm = (formData.get("heightCm") as string) ?? "170";
  const weightKg = (formData.get("weightKg") as string) ?? "70";
  const garmentCategory = ((formData.get("garmentCategory") as string) ?? "upper_body") as
    | "upper_body"
    | "lower_body"
    | "dresses";

  if ((!selfieFile || selfieFile.size === 0) && !selfieUrl) {
    return NextResponse.json({ error: "selfie image or selfieUrl is required." }, { status: 400 });
  }
  // Require either an uploaded outfit file OR a garmentUrl
  if ((!outfitFile || outfitFile.size === 0) && !garmentUrl) {
    return NextResponse.json({ error: "outfit image or garmentUrl is required." }, { status: 400 });
  }

  // 3. Convert files / URL to data URIs
  let humanDataUri: string;
  let garmDataUri: string;
  try {
    // Convert garment image
    if (garmentUrl && (!outfitFile || outfitFile.size === 0)) {
      garmDataUri = await downloadToDataUri(garmentUrl);
    } else {
      garmDataUri = await fileToDataUri(outfitFile!);
    }

    // Convert selfie/base image
    if (selfieUrl && (!selfieFile || selfieFile.size === 0)) {
      humanDataUri = await downloadToDataUri(selfieUrl);
    } else {
      humanDataUri = await fileToDataUri(selfieFile!);
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to read or download input images.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }

  // 4. Create Replicate prediction
  const garmentDescription = buildGarmentDescription(avatarType, age, heightCm, weightKg);

  let predictionId: string;
  try {
    const createRes = await fetch(`${REPLICATE_API}/predictions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${REPLICATE_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        version: MODEL_VERSION,
        input: {
          human_img: humanDataUri,
          garm_img: garmDataUri,
          garment_des: garmentDescription,
          category: garmentCategory, // upper_body | lower_body | dresses
          crop: false,
          force_dc: false,
          mask_only: false,
        },
      }),
    });

    if (!createRes.ok) {
      const errBody = await createRes.text();
      console.error("Replicate create prediction error:", errBody);
      return NextResponse.json(
        { error: `Replicate error: ${createRes.status} — ${errBody}` },
        { status: 502 }
      );
    }

    const prediction = (await createRes.json()) as { id: string };
    predictionId = prediction.id;
  } catch (err) {
    console.error("Failed to create Replicate prediction:", err);
    return NextResponse.json(
      { error: "Failed to contact Replicate API. Check your network or API key." },
      { status: 502 }
    );
  }

  // 5. Poll for result
  try {
    const resultImageUrl = await pollPrediction(predictionId);
    return NextResponse.json({
      resultImageUrl,
      message: `${avatarType} try-on complete — ${age}y, ${heightCm}cm, ${weightKg}kg.`,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Polling error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
