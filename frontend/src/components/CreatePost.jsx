import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import Sidebar from "./Sidebar";

const CreatePost = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [mediaFile, setMediaFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setMediaFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !description || !mediaFile) {
      alert("Please fill all fields and select a media file.");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      alert("User not authenticated. Please login.");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("media", mediaFile);

      const res = await fetch("http://localhost:8080/api/posts/create", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to upload post");
      }

      setSuccessMessage("Post uploaded successfully!");
      setTitle("");
      setDescription("");
      setMediaFile(null);
      setPreviewUrl(null);

      setTimeout(() => {
        navigate("/homepage");
      }, 2000);

    } catch (error) {
      alert(error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-black px-4">
      <Sidebar/>
      <Card className="w-full max-w-2xl bg-black text-white border border-white/20 shadow-[0_0_10px_rgba(255,255,255,0.2)] rounded-lg">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-semibold">
            Create a Post
          </CardTitle>
          <p className="text-sm text-gray-400 text-center">
            Share your gaming moment with the community!
          </p>
        </CardHeader>
        <Separator className="bg-white/20" />
        <CardContent className="pt-6 space-y-5">
          {successMessage && (
            <div className="p-3 bg-green-900/50 border border-green-500 rounded-md text-green-300 text-center">
              {successMessage} Redirecting...
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm text-gray-300">
                Caption
              </Label>
              <Input
                id="title"
                type="text"
                placeholder="Write a short caption..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="bg-black border border-white/30 text-white placeholder-gray-400 focus:ring-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm text-gray-300">
                Description
              </Label>
              <Textarea
                id="description"
                rows={4}
                placeholder="Write more about this post..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                className="bg-black border border-white/30 text-white placeholder-gray-400 resize-none focus:ring-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="media" className="text-sm text-gray-300">
                Upload Image or Video
              </Label>
              <Input
                id="media"
                type="file"
                accept="image/*,video/*"
                onChange={handleFileChange}
                required
                className="bg-black border border-white/30 text-white file:bg-zinc-700 file:text-white file:border-none"
              />
            </div>

            {previewUrl && (
              <div className="rounded-lg overflow-hidden border border-white/20 mt-4">
                {mediaFile?.type?.startsWith("video") ? (
                  <video src={previewUrl} controls className="w-full max-h-96 object-cover" />
                ) : (
                  <img src={previewUrl} alt="Preview" className="w-full max-h-96 object-cover" />
                )}
              </div>
            )}

            <Button
              type="submit"
              disabled={uploading || successMessage}
              className="w-full mt-4 bg-white text-black hover:bg-gray-200"
            >
              {uploading ? "Uploading..." : "Post"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreatePost;