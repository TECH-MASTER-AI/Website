import { useState, useEffect } from "react";
import { useDsaAuth } from "@/features/dsa/auth/DsaAuthContext";
import { getProfilePhoto, getProfileGender } from "@/features/dsa/profile/dsaProfileStore";

const MAIN_USER_KEY = "techmasterai_user";

export type DuelUserGender = "male" | "female";

export interface DuelUser {
  id: string;
  username: string;
  email: string;
  photo?: string | null;
  gender?: DuelUserGender | null;
}

/**
 * Returns the current user for 1v1 duels: DSA login if present, otherwise main site login (techmasterai_user).
 * So if the user is already logged in on the main website, they are treated as logged in for duels too.
 */
export function useDuelUser(): DuelUser | null {
  const { user: dsaUser, firebaseUser } = useDsaAuth();
  const [mainUser, setMainUser] = useState<{ name: string; email: string } | null>(null);

  const readMainUser = () => {
    const raw = localStorage.getItem(MAIN_USER_KEY);
    if (!raw) {
      setMainUser(null);
      return;
    }
    try {
      const parsed = JSON.parse(raw) as { name?: string; email?: string };
      if (parsed?.email)
        setMainUser({ name: parsed.name ?? parsed.email ?? "Player", email: parsed.email });
      else setMainUser(null);
    } catch {
      setMainUser(null);
    }
  };

  useEffect(() => {
    readMainUser();
    window.addEventListener("storage", readMainUser);
    return () => window.removeEventListener("storage", readMainUser);
  }, []);

  const photo =
    (dsaUser && "profile_photo_url" in dsaUser && dsaUser.profile_photo_url) ||
    getProfilePhoto() ||
    firebaseUser?.photoURL ||
    undefined;
  const gender = getProfileGender();
  if (dsaUser) return { id: dsaUser.id, username: dsaUser.username, email: dsaUser.email, photo, gender };
  if (mainUser) return { id: mainUser.email, username: mainUser.name, email: mainUser.email, photo, gender };
  return null;
}
