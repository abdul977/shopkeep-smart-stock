import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { UserProfile } from "@/types/auth";
import { toast } from "sonner";

export function useProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      try {
        if (!user) {
          setProfile(null);
          setLoading(false);
          return;
        }

        setLoading(true);
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (error) {
          console.error("Error loading profile:", error);
          throw error;
        }

        setProfile({
          ...data,
          email: user.email,
        });
      } catch (error) {
        console.error("Error in loadProfile:", error);
        toast.error("Failed to load user profile");
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [user]);

  const updateProfile = async (updates: Partial<UserProfile>) => {
    try {
      if (!user) throw new Error("User not authenticated");

      setLoading(true);
      const { error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", user.id);

      if (error) throw error;

      setProfile((prev) => (prev ? { ...prev, ...updates } : null));
      toast.success("Profile updated successfully");
      return true;
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast.error(error.message || "Failed to update profile");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const uploadAvatar = async (file: File): Promise<string | null> => {
    try {
      if (!user) throw new Error("User not authenticated");

      // Validate file type
      const validImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!validImageTypes.includes(file.type)) {
        throw new Error('Invalid file type. Please upload a JPEG, PNG, GIF, or WebP image.');
      }

      // Validate file size (max 2MB)
      const maxSize = 2 * 1024 * 1024; // 2MB in bytes
      if (file.size > maxSize) {
        throw new Error('File size exceeds 2MB limit. Please upload a smaller image.');
      }

      // Create a unique file name with UUID to avoid conflicts
      const fileExt = file.name.split(".").pop();
      const uniqueId = crypto.randomUUID();
      const fileName = `${uniqueId}.${fileExt}`;
      // Store in a subfolder with the user's ID to avoid conflicts
      const filePath = `avatars/${fileName}`;

      // Show loading toast
      const toastId = `upload-avatar-${uniqueId}`;
      toast.loading('Uploading avatar...', { id: toastId });

      setLoading(true);

      // Upload the file to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) throw uploadError;

      // Get the public URL
      const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
      const avatarUrl = data.publicUrl;

      // Update profile with new avatar URL
      await updateProfile({ avatar_url: avatarUrl });

      // Show success toast
      toast.success('Avatar uploaded successfully', { id: toastId });

      return avatarUrl;
    } catch (error: any) {
      console.error("Error uploading avatar:", error);
      toast.error(error.message || "Failed to upload avatar");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    profile,
    loading,
    updateProfile,
    uploadAvatar,
  };
}
