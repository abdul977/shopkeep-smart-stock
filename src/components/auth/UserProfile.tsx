import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/use-profile";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { UserProfile as UserProfileType } from "@/types/auth";
import { Upload } from "lucide-react";

const profileSchema = z.object({
  email: z.string().email("Please enter a valid email address").optional(),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  password: z.union([
    z.string().min(6, "Password must be at least 6 characters"),
    z.string().length(0)
  ]),
  confirmPassword: z.string().optional(),
}).refine((data) => {
  // Only validate password match if a password is actually provided
  if (data.password && data.password.trim() !== '') {
    return data.password === data.confirmPassword;
  }
  return true;
}, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type ProfileFormValues = z.infer<typeof profileSchema>;

const UserProfile = () => {
  const { user, signOut } = useAuth();
  const { profile, loading: profileLoading, updateProfile, uploadAvatar } = useProfile();
  const [isLoading, setIsLoading] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      email: user?.email || "",
      first_name: "",
      last_name: "",
      password: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    if (profile) {
      form.reset({
        email: profile.email || "",
        first_name: profile.first_name || "",
        last_name: profile.last_name || "",
        password: "",
        confirmPassword: "",
      });
    }
  }, [profile, form]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setAvatarFile(file);

      // Create a preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: ProfileFormValues) => {
    try {
      setIsLoading(true);

      // Handle avatar upload first if there's a new avatar
      if (avatarFile) {
        const avatarUrl = await uploadAvatar(avatarFile);
        if (!avatarUrl) {
          throw new Error("Failed to upload avatar");
        }
      }

      // Handle profile data updates
      const profileUpdates: Partial<UserProfileType> = {};
      let profileUpdated = false;

      if (data.first_name !== profile?.first_name) {
        profileUpdates.first_name = data.first_name || null;
        profileUpdated = true;
      }

      if (data.last_name !== profile?.last_name) {
        profileUpdates.last_name = data.last_name || null;
        profileUpdated = true;
      }

      if (Object.keys(profileUpdates).length > 0) {
        await updateProfile(profileUpdates);
      }

      // Handle auth data updates (email, password)
      const authUpdates: { email?: string; password?: string } = {};
      let authUpdated = false;

      if (data.email && data.email !== user?.email) {
        authUpdates.email = data.email;
        authUpdated = true;
      }

      // Only update password if it's actually provided
      if (data.password && data.password.trim() !== '') {
        authUpdates.password = data.password;
        authUpdated = true;
      }

      if (Object.keys(authUpdates).length > 0) {
        const { error } = await supabase.auth.updateUser(authUpdates);
        if (error) throw error;
      }

      // Show success message if anything was updated
      if (profileUpdated || authUpdated || avatarFile) {
        toast.success("Profile updated successfully");
      }

      // Always reset password fields
      form.reset({
        ...data,
        password: "",
        confirmPassword: "",
      });

      // Reset avatar state
      setAvatarFile(null);
      setAvatarPreview(null);

    } catch (error: any) {
      toast.error(error.message || "Error updating profile");
      console.error("Profile update error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getInitials = () => {
    if (profile?.first_name && profile?.last_name) {
      return `${profile.first_name[0]}${profile.last_name[0]}`.toUpperCase();
    } else if (profile?.email) {
      return profile.email[0].toUpperCase();
    }
    return "U";
  };

  if (profileLoading) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center h-40">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            <p className="ml-3 text-lg text-gray-600">Loading profile...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl">Your Profile</CardTitle>
        <CardDescription>
          Update your account settings and profile information
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center mb-6 sm:flex-row sm:items-start">
          <div className="relative mb-4 sm:mb-0 sm:mr-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src={avatarPreview || profile?.avatar_url || undefined} />
              <AvatarFallback className="text-lg">{getInitials()}</AvatarFallback>
            </Avatar>
            <label
              htmlFor="avatar-upload"
              className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-1 cursor-pointer shadow-md hover:bg-primary/90 transition-colors"
            >
              <Upload size={16} />
              <span className="sr-only">Upload avatar</span>
            </label>
            <input
              id="avatar-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 w-full">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="first_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John" {...field} value={field.value || ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="last_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Doe" {...field} value={field.value || ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="email@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New Password (Optional)</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Leave blank to keep current password" {...field} />
                      </FormControl>
                      <FormMessage />
                      <p className="text-xs text-muted-foreground">
                        Only fill this if you want to change your password
                      </p>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm New Password (Optional)</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Leave blank to keep current password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex space-x-2 pt-2">
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-b-transparent"></span>
                      Updating...
                    </>
                  ) : (
                    "Update Profile"
                  )}
                </Button>
                <Button type="button" variant="outline" onClick={() => signOut()}>
                  Sign Out
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserProfile;
