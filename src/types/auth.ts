import { Database } from "./supabase";

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];

export interface UserProfile extends Profile {
  email?: string;
}
