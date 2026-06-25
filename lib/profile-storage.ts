import type { UserProfile } from "@/types/profile";

const USER_PROFILE_STORAGE_KEY = "gradeflow:user-profile";

export function saveUserProfile(profile: UserProfile): void {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(USER_PROFILE_STORAGE_KEY, JSON.stringify(profile));
}

export function getUserProfile(): UserProfile | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const storedProfile = localStorage.getItem(USER_PROFILE_STORAGE_KEY);

    if (!storedProfile) {
      return null;
    }

    return JSON.parse(storedProfile) as UserProfile;
  } catch {
    return null;
  }
}

export function clearUserProfile(): void {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.removeItem(USER_PROFILE_STORAGE_KEY);
}