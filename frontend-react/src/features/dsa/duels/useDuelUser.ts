import { useState, useEffect } from "react";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
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
 * Returns the current user for 1v1 duels using unified Supabase auth.
 */
export function useDuelUser(): DuelUser | null {
  const { user } = useSupabaseAuth();

  const photo = getProfilePhoto();
  const gender = getProfileGender();
  
  if (user) {
    const username = user.user_metadata?.username || user.email?.split('@')[0] || 'Player';
    return { 
      id: user.id, 
      username, 
      email: user.email || '', 
      photo, 
      gender 
    };
  }
  
  return null;
}
