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

export type LookRequest = {
  name: string;
  occasion: string;
  image: string;
  pieces: string[];
  gradient?: string;
};

export type LookResponse = {
  id: string;
  name: string;
  occasion: string;
  image: string;
  pieces: string[];
  gradient?: string;
  liked: boolean;
  createdAt: string;
};

const API_BASE = "http://127.0.0.1:3003/api";

export async function fetchLooks(token: string): Promise<LookResponse[]> {
  const res = await fetch(`${API_BASE}/looks`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error("Failed to fetch looks");
  const json = await res.json();
  return json.data;
}

export async function saveLook(token: string, lookData: LookRequest): Promise<LookResponse> {
  const res = await fetch(`${API_BASE}/looks`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(lookData),
  });
  if (!res.ok) throw new Error("Failed to save look");
  const json = await res.json();
  return json.data;
}

export async function toggleLikeLook(token: string, lookId: string): Promise<LookResponse> {
  const res = await fetch(`${API_BASE}/looks/${lookId}/like`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error("Failed to like look");
  const json = await res.json();
  return json.data;
}

export async function deleteLook(token: string, lookId: string): Promise<void> {
  const res = await fetch(`${API_BASE}/looks/${lookId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error("Failed to delete look");
}

export async function uploadAvatar(token: string, file: File): Promise<string> {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(`${API_BASE}/uploads`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: form,
  });
  if (!res.ok) throw new Error("Failed to upload avatar");
  const json = await res.json();
  return json.data.url; // e.g. /public/uploads/general/filename.png
}

// ─── Friend System APIs ──────────────────────────────────────────────────

export interface FriendUser {
  id: string;
  username: string | null;
  email: string;
  avatar: string | null;
  bio?: string | null;
  isOnline?: boolean;
  lastSeen?: string;
  friendshipId?: string;
  friendsSince?: string;
}

export interface FriendRequestItem {
  id: string; // friendship id
  senderId: string;
  receiverId: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED";
  createdAt: string;
  sender?: FriendUser;
  receiver?: FriendUser;
}

export async function fetchFriendsList(token: string): Promise<FriendUser[]> {
  const res = await fetch(`${API_BASE}/users/friends/list`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to fetch friends");
  const json = await res.json();
  return json.data || [];
}

export async function fetchFriendRequests(token: string, type: "received" | "sent" | "all" = "all"): Promise<FriendRequestItem[]> {
  const res = await fetch(`${API_BASE}/users/friends/requests?type=${type}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to fetch friend requests");
  const json = await res.json();
  return json.data || [];
}

export async function sendFriendRequest(token: string, identifier: string): Promise<{ friendship: any; friend: FriendUser; accepted: boolean }> {
  const res = await fetch(`${API_BASE}/users/friends/request`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ identifier }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to send friend request");
  return json.data;
}

export async function respondToFriendRequest(token: string, friendshipId: string, status: "ACCEPTED" | "REJECTED"): Promise<any> {
  const res = await fetch(`${API_BASE}/users/friends/requests/${friendshipId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ status }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to respond to friend request");
  return json.data;
}

export async function removeFriend(token: string, friendId: string): Promise<void> {
  const res = await fetch(`${API_BASE}/users/friends/${friendId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to remove friend");
}

export async function fetchFriendSuggestions(token: string): Promise<FriendUser[]> {
  const res = await fetch(`${API_BASE}/users/friends/suggestions`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return [];
  const json = await res.json();
  return json.data || [];
}

