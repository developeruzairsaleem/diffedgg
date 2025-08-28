"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UploadButton } from "@/utils/uploadthing";
import { Label } from "@/components/ui/label";

import { Bell, User, Loader2 } from "lucide-react";
import { message } from "antd";
import { SettingsSkeleton } from "@/components/ui/SettingsSkeleton"; // Adjust path
import { toast } from "sonner";
import {
  ProfileSchema,
  type ProfileFormData,
} from "@/validations/profile.validator";

export function SettingsTab({ type }: { type: string }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    bio: "",
    profileImage: "",
  });
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});

  // Fetch initial data
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/profile-settings");
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);
        setFormData({
          username: data.username,
          email: data.email,
          bio: data.bio || "",
          profileImage: data.profileImage || "",
        });
      } catch (error) {
        message.error(
          (error as any)?.message || "Failed to load your settings."
        );
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear validation error for this field when user starts typing
    if (validationErrors[name]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Clear previous validation errors
    setValidationErrors({});

    // Validate form data with Zod
    const validation = ProfileSchema.safeParse(formData);

    if (!validation.success) {
      const errors: Record<string, string> = {};
      validation.error.errors.forEach((error) => {
        if (error.path[0]) {
          errors[error.path[0] as string] = error.message;
        }
      });
      setValidationErrors(errors);
      message.error("Please fix the validation errors before submitting.");
      return;
    }

    setSaving(true);
    try {
      // Only send username, email, bio as expected by the API
      const { username, email, bio, profileImage } = formData;
      const response = await fetch("/api/profile-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, bio, profileImage }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      // Optionally update local state with returned user data
      if (data.user) {
        setFormData((prev) => ({ ...prev, ...data.user }));
      }
      if (type === "isVerification") {
        localStorage.setItem("provider_verification_applied", "1");
        window.location.reload();
      }
      message.success("Profile updated successfully!");
    } catch (error) {
      message.error((error as any)?.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <SettingsSkeleton />;
  }

  return (
    <div className="space-y-8">
      {/* Profile Information Card */}
      <Card
        style={{ backgroundColor: "#3A0F2A" }}
        className="bg-opacity-30 backdrop-blur-sm border-white/10 shadow-2xl"
      >
        <form onSubmit={handleFormSubmit}>
          <CardHeader>
            <CardTitle className="flex items-center text-white">
              <User className="w-5 h-5 mr-3" />
              Profile Information
            </CardTitle>
            <CardDescription className="text-white/70">
              Update your account details here.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 mt-12">
            <div className="space-y-2">
              <Label htmlFor="profileImage" className="text-white/80">
                Profile Photo
              </Label>
              <div className="flex items-center gap-3">
                {formData.profileImage ? (
                  <img
                    src={formData.profileImage}
                    alt="avatar"
                    className="w-14 h-14 rounded-full object-cover border border-white/20"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-full border border-dashed border-white/30 flex items-center justify-center text-white/60 text-xs">
                    No photo
                  </div>
                )}

                {/* checking the upload of the profile image */}
                <div className="flex flex-col gap-4 pt-2 items-center ">
                  <UploadButton
                    className=" hover:scale-105 transition-all p-2 rounded-xl"
                    endpoint="profileImage"
                    onClientUploadComplete={(res) => {
                      toast.success("Upload Complete!", {
                        description: "Your profile photo is being processed",
                      });
                      const url = res?.[0]?.url;
                      if (url) {
                        setFormData((prev) => ({ ...prev, profileImage: url }));
                        // Clear profile image validation error when image is uploaded
                        if (validationErrors.profileImage) {
                          setValidationErrors((prev) => {
                            const newErrors = { ...prev };
                            delete newErrors.profileImage;
                            return newErrors;
                          });
                        }
                        message.success("Profile photo uploaded");
                      }
                    }}
                    onUploadError={(error: Error) => {
                      toast.error("Upload Failed!", {
                        description: error.message || "Something went wrong.",
                      });
                    }}
                  />
                </div>
              </div>
              {validationErrors.profileImage && (
                <p className="text-red-400 text-sm">
                  {validationErrors.profileImage}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="username" className="text-white/80">
                Username
              </Label>
              <Input
                id="username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                className={`bg-black/30 border-white/20 text-white ${
                  validationErrors.username ? "border-red-500" : ""
                }`}
              />
              {validationErrors.username && (
                <p className="text-red-400 text-sm">
                  {validationErrors.username}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio" className="text-white/80">
                Bio
              </Label>
              <Input
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                className={`bg-black/30 border-white/20 text-white ${
                  validationErrors.bio ? "border-red-500" : ""
                }`}
              />
              {validationErrors.bio && (
                <p className="text-red-400 text-sm">{validationErrors.bio}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white/80">
                Email Address
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`bg-black/30 border-white/20 text-white ${
                  validationErrors.email ? "border-red-500" : ""
                }`}
              />
              {validationErrors.email && (
                <p className="text-red-400 text-sm">{validationErrors.email}</p>
              )}
            </div>
            <Button
              type="submit"
              disabled={saving}
              className="bg-[linear-gradient(90deg,_#EE2C81_0%,_#FE0FD0_60%)] hover:opacity-90 text-white font-semibold"
            >
              {saving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </CardContent>
        </form>
      </Card>
    </div>
  );
}
