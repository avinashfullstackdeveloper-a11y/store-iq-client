import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";

import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import AdvancedVideoPlayer from "@/components/AdvancedVideoPlayer";

const Videos = () => {
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal state
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);
  const [previewTitle, setPreviewTitle] = useState<string>("");

  useEffect(() => {
    const fetchVideos = async () => {
      setLoading(true);
      setError(null);
      try {
        // Read JWT from localStorage
        const token = localStorage.getItem("jwt_token");
        if (!token) throw new Error("User not authenticated (no token found)");

        // Decode JWT payload (no signature verification)
        const payload = token.split(".")[1];
        if (!payload) throw new Error("Invalid JWT format");
        const decodedPayload = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
        const userId = decodedPayload.id;
        if (!userId) throw new Error("User ID not found in token");

        const res = await fetch(`/api/videos?userId=${encodeURIComponent(userId)}`);
        if (!res.ok) throw new Error("Failed to fetch videos");
        const data = await res.json();
        setVideos(Array.isArray(data) ? data : []);
      } catch (err: any) {
        setError(err.message || "Unknown error");
      } finally {
        setLoading(false);
      }
    };
    fetchVideos();
  }, []);

  // Handler for opening preview modal
  const handlePreview = (video: any) => {
    setPreviewSrc(video.url || "");
    setPreviewTitle(video.title || "Untitled Video");
    setIsPreviewOpen(true);
  };

  // Handler for closing preview modal
  const handleClose = () => {
    setIsPreviewOpen(false);
    setPreviewSrc(null);
    setPreviewTitle("");
  };

  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Your Videos</h1>
          <p className="text-white/60">Here are all the videos that you created.</p>
        </div>

        {/* Preview Modal */}
        <Dialog open={isPreviewOpen} onOpenChange={(open) => { if (!open) handleClose(); }}>
          <DialogContent>
            <DialogTitle>{previewTitle}</DialogTitle>
            <DialogDescription>Preview of your video</DialogDescription>
            {previewSrc && (
              <div className="w-full">
                <AdvancedVideoPlayer src={previewSrc} />
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Videos Grid */}
        {loading ? (
          <div className="text-white/70 text-lg py-12 text-center">Loading videos...</div>
        ) : error ? (
          <div className="text-red-400 text-lg py-12 text-center">{error}</div>
        ) : videos.length === 0 ? (
          <div className="text-white/70 text-lg py-12 text-center">No videos found.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map((video, index) => (
              <div
                key={video.id || index}
                className="bg-storiq-card-bg border border-storiq-border rounded-2xl overflow-hidden hover:border-storiq-purple/50 transition-colors"
              >
                {/* --- START: Updated Image Section --- */}
                <div className="h-48 relative">
                  <img
                    src={video.thumbnail || "/placeholder.svg"}
                    alt={video.title || "Untitled Video"}
                    className="w-full h-full object-cover"
                    onError={e => {
                      (e.target as HTMLImageElement).src = "/placeholder.svg";
                    }}
                  />
                  <div className="absolute inset-0 bg-black/20"></div>
                </div>
                {/* --- END: Updated Image Section --- */}

                <div className="p-6">
                  <h3 className="text-white text-xl font-bold mb-1">{video.title || "Untitled Video"}</h3>
                  <p className="text-white/60 text-sm mb-2">{video.subtitle || video.description || ""}</p>
                  <div className="text-white/40 text-xs mb-4">
                    {video.createdAt && (
                      <span>
                        Created: {new Date(video.createdAt).toLocaleDateString()}
                      </span>
                    )}
                    {video.duration && (
                      <span className="ml-2">Duration: {video.duration} sec</span>
                    )}
                  </div>
                  <div className="flex space-x-3">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-storiq-border text-white hover:bg-storiq-purple hover:border-storiq-purple"
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-storiq-border text-white hover:bg-storiq-purple hover:border-storiq-purple"
                      onClick={() => handlePreview(video)}
                      aria-label={`Preview ${video.title || "video"}`}
                    >
                      Preview
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Videos;