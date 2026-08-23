import type { AvatarBodyProfile, AvatarType } from "../components/AvatarSelector";

export type TryOnRequest = {
  avatarType: AvatarType;
  bodyProfile: AvatarBodyProfile;
  selfieFile: File;
  outfitFile: File;
  garmentCategory?: "upper_body" | "lower_body" | "dresses";
};

export type TryOnResponse = {
  resultImageUrl: string;
  message: string;
};

export type FetchGarmentResponse = {
  garmentImageUrl: string;
};

/**
 * Sends the selfie + outfit images to the Next.js API route /api/tryon,
 * which calls Replicate's IDM-VTON model with a high-quality realism prompt.
 */
export async function generateOutfitTryOn({
  avatarType,
  bodyProfile,
  selfieFile,
  outfitFile,
  garmentCategory = "upper_body",
}: TryOnRequest): Promise<TryOnResponse> {
  const { age, heightCm, weightKg } = bodyProfile;

  const form = new FormData();
  form.append("selfie", selfieFile);
  form.append("outfit", outfitFile);
  form.append("avatarType", avatarType);
  form.append("age", String(age));
  form.append("heightCm", String(heightCm));
  form.append("weightKg", String(weightKg));
  form.append("garmentCategory", garmentCategory);

  const res = await fetch("/api/tryon", {
    method: "POST",
    body: form,
  });

  if (!res.ok) {
    let errorMessage = `Server error ${res.status}`;
    try {
      const json = (await res.json()) as { error?: string };
      if (json.error) errorMessage = json.error;
    } catch {
      // ignore JSON parse failure
    }
    throw new Error(errorMessage);
  }

  const data = (await res.json()) as TryOnResponse;
  return data;
}

/**
 * Calls /api/fetch-garment to scrape a garment image URL from a product page.
 */
export async function fetchGarmentFromUrl(url: string): Promise<FetchGarmentResponse> {
  const res = await fetch("/api/fetch-garment", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
  });

  if (!res.ok) {
    let errorMessage = `Server error ${res.status}`;
    try {
      const json = (await res.json()) as { error?: string };
      if (json.error) errorMessage = json.error;
    } catch {
      // ignore
    }
    throw new Error(errorMessage);
  }

  return (await res.json()) as FetchGarmentResponse;
}

/**
 * Try on an outfit from a garment image URL on the user's selfie photo.
 * Passes garmentUrl to the server which downloads it server-side.
 */
export async function tryOnFromUrl({
  selfieFile,
  garmentUrl,
  garmentCategory = "upper_body",
}: {
  selfieFile: File;
  garmentUrl: string;
  garmentCategory?: "upper_body" | "lower_body" | "dresses";
}): Promise<TryOnResponse> {
  const form = new FormData();
  form.append("selfie", selfieFile);
  form.append("garmentUrl", garmentUrl);
  form.append("avatarType", "person");
  form.append("age", "25");
  form.append("heightCm", "170");
  form.append("weightKg", "65");
  form.append("garmentCategory", garmentCategory);

  const res = await fetch("/api/tryon", {
    method: "POST",
    body: form,
  });

  if (!res.ok) {
    let errorMessage = `Server error ${res.status}`;
    try {
      const json = (await res.json()) as { error?: string };
      if (json.error) errorMessage = json.error;
    } catch {
      // ignore
    }
    throw new Error(errorMessage);
  }

  return (await res.json()) as TryOnResponse;
}
