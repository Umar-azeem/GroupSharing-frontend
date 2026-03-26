"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import Navbar from "@/components/layout/Navbar";
import { groupsAPI } from "@/lib/api";
import {
  Upload,
  Link2,
  FileText,
  Tag,
  Loader2,
  ImageIcon,
  X,
} from "lucide-react";

const CATEGORIES = [
  "WhatsApp",
  "Instagram",
  "LinkedIn",
  "Facebook",
  "Discord",
  "Slack",
  "Telegram",
  "Twitter",
  "Other",
];

export default function CreatePostPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    groupName: "",
    groupLink: "",
    description: "",
    category: "",
  });
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  // Handle Edit Mode
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const id = searchParams.get("edit");
    if (id) {
      setIsEdit(true);
      setEditId(id);
      fetchEditData(id);
    }
  }, []);

  const fetchEditData = async (id: string) => {
    setLoading(true);
    try {
      const data = await groupsAPI.getOne(id);
      // ✅ Fix - backend returns "imageUrl"
      const { groupName, groupLink, description, category, imageUrl } =
        data.group;
      setForm({ groupName, groupLink, description, category });
      if (imageUrl) {
        setPreview(imageUrl); // Cloudinary URLs are already full https:// links
      }
    } catch (err: any) {
      setError("Failed to fetch group data for editing");
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (
      !form.groupName ||
      !form.groupLink ||
      !form.description ||
      !form.category
    ) {
      return setError("All fields are required");
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("groupName", form.groupName);
      formData.append("groupLink", form.groupLink);
      formData.append("description", form.description);
      formData.append("category", form.category);
      if (image) formData.append("groupImage", image);

      if (isEdit && editId) {
        await groupsAPI.update(editId, formData);
        router.push(`/group/${editId}`);
      } else {
        const data = await groupsAPI.create(formData);
        router.push(`/group/${data.group._id}`);
      }
    } catch (err: any) {
      setError(err.message || "Failed to save group post");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h1
            className="text-3xl font-bold mb-2"
            style={{ fontFamily: "Syne, sans-serif" }}
          >
            {isEdit ? "Edit Group" : "Share a Group"}
          </h1>
          <p className="text-muted-foreground">
            {isEdit
              ? "Update your community details"
              : "Post an Instagram community link for others to discover"}
          </p>
        </div>

        <div className="glass-card p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-destructive/10 border border-destructive/30 text-destructive text-sm px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                <ImageIcon className="w-4 h-4" /> Group Image
              </label>
              <div
                onClick={() => fileRef.current?.click()}
                className={`relative border-2 border-dashed rounded-xl overflow-hidden cursor-pointer transition-colors ${
                  preview
                    ? "border-primary/30"
                    : "border-border hover:border-primary/30"
                }`}
              >
                {preview ? (
                  <div className="relative">
                    <img
                      src={preview}
                      alt="Preview"
                      className="w-full h-48 object-cover"
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setImage(null);
                        setPreview("");
                      }}
                      className="absolute top-2 right-2 w-7 h-7 bg-background/80 rounded-full flex items-center justify-center hover:bg-background"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
                    <Upload className="w-8 h-8 mb-2" />
                    <p className="text-sm">Click to upload group image</p>
                    <p className="text-xs mt-1">PNG, JPG, GIF up to 5MB</p>
                  </div>
                )}
              </div>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
            </div>

            {/* Group Name */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Group Name *
              </label>
              <input
                type="text"
                className="input-field"
                placeholder="e.g., Tech Developers Pakistan"
                value={form.groupName}
                onChange={(e) =>
                  setForm({ ...form, groupName: e.target.value })
                }
                required
                maxLength={100}
              />
            </div>

            {/* Group Link */}
            <div>
              <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                <Link2 className="w-4 h-4" /> Group Link *
              </label>
              <input
                type="url"
                className="input-field"
                placeholder="https://instagram.com/xyz"
                value={form.groupLink}
                onChange={(e) =>
                  setForm({ ...form, groupLink: e.target.value })
                }
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                <FileText className="w-4 h-4" /> Description *
              </label>
              <textarea
                className="input-field resize-none"
                rows={4}
                placeholder="Tell people what this group is about..."
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                required
                maxLength={500}
              />
              <p className="text-xs text-muted-foreground text-right mt-1">
                {form.description.length}/500
              </p>
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                <Tag className="w-4 h-4" /> Category *
              </label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    type="button"
                    key={cat}
                    onClick={() => setForm({ ...form, category: cat })}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      form.category === cat
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:text-foreground hover:bg-secondary"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 btn-ghost border border-border py-3 rounded-lg text-sm font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 btn-primary flex items-center justify-center gap-2 py-3"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {loading
                  ? isEdit
                    ? "Updating..."
                    : "Posting..."
                  : isEdit
                    ? "Update Group"
                    : "Share Group"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
