import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";

import React, { useState } from "react";
import Loader from "@/components/ui/Loader";
import { ToastProvider, Toast, ToastTitle, ToastDescription, ToastViewport } from "@/components/ui/toast";

const YT_OAUTH_URL = "/api/auth/youtube"; // Placeholder, replace with actual
const IG_OAUTH_URL = "/api/auth/instagram"; // Placeholder, replace with actual

const Publish = () => {
  // Connection status
  const [ytConnected, setYtConnected] = useState(false);
  const [igConnected, setIgConnected] = useState(false);

  // Videos state
  interface Video {
    id?: string;
    url: string;
    title?: string;
    thumbnail?: string;
    duration?: number;
    s3Key?: string;
  }

  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [postingId, setPostingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Platform connection
  // Real OAuth connect: redirect to backend OAuth endpoint
  const handleConnect = (platform: "youtube" | "instagram") => {
    if (platform === "youtube") {
      window.location.href = YT_OAUTH_URL;
    } else if (platform === "instagram") {
      window.location.href = IG_OAUTH_URL;
    }
  };

  // Fetch user videos on mount
  // On mount: check connection status for YouTube/Instagram
  React.useEffect(() => {
    const fetchVideos = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/videos", { credentials: "include" });
        if (!res.ok) throw new Error("Failed to fetch videos");
        const data = await res.json();
        setVideos(Array.isArray(data) ? data : []);
      } catch (err) {
        setError((err as Error)?.message || "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    // Check OAuth connection status from backend
    const fetchConnectionStatus = async () => {
      try {
        const res = await fetch("/api/auth/status", { credentials: "include" });
        if (res.ok) {
          const status = await res.json();
          setYtConnected(!!status.youtube);
          setIgConnected(!!status.instagram);
        }
      } catch {
        // Ignore errors, keep as not connected
      }
    };

    fetchVideos();
    fetchConnectionStatus();
  }, []);

  // Platform selection per video
  type PlatformSelections = { [videoId: string]: { yt: boolean; ig: boolean } };
  const [platformSelections, setPlatformSelections] = useState<PlatformSelections>({});

  const handlePlatformChange = (videoId: string, platform: "youtube" | "instagram") => {
    setPlatformSelections((prev) => ({
      ...prev,
      [videoId]: {
        yt: platform === "youtube" ? !prev[videoId]?.yt : !!prev[videoId]?.yt,
        ig: platform === "instagram" ? !prev[videoId]?.ig : !!prev[videoId]?.ig,
      },
    }));
  };

  // Handle posting per video
  const handlePost = async (video: Video) => {
    const selection = platformSelections[video.id || video.s3Key || ""] || { yt: false, ig: false };
    if ((!selection.yt && !selection.ig) || (!ytConnected && !igConnected)) {
      setToast({ type: "error", message: "Please connect platforms and select at least one." });
      return;
    }
    setPostingId(video.id || video.s3Key || "");
    setToast(null);

    try {
      // Prepare payload
      const payload = {
        videoId: video.id || video.s3Key,
        // Add more metadata here if needed
      };

      // Track results for each platform
      let success = false;
      let errorMsg = "";

      // Post to YouTube if selected
      if (selection.yt && ytConnected) {
        const res = await fetch("/api/publish/youtube", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          errorMsg += `YouTube: ${err?.message || "Failed to post"} `;
        } else {
          success = true;
        }
      }

      // Post to Instagram if selected
      if (selection.ig && igConnected) {
        const res = await fetch("/api/publish/instagram", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          errorMsg += `Instagram: ${err?.message || "Failed to post"} `;
        } else {
          success = true;
        }
      }

      setPostingId(null);

      if (success) {
        setToast({ type: "success", message: "Video posted successfully!" });
        setPlatformSelections((prev) => ({ ...prev, [video.id || video.s3Key || ""]: { yt: false, ig: false } }));
      } else {
        setToast({ type: "error", message: errorMsg.trim() || "Failed to post video." });
      }
    } catch (err) {
      setPostingId(null);
      setToast({ type: "error", message: (err as Error)?.message || "Failed to post video." });
    }
  };

  return (
    <ToastProvider>
      <DashboardLayout>
        <div className="p-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">Publish to YouTube & Instagram</h1>
            <p className="text-white/60">Connect, generate/select a video, choose platforms, and post!</p>
          </div>

          {/* Social Connect Section */}
          <div className="bg-storiq-card-bg border border-storiq-border rounded-2xl p-6 mb-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex flex-col md:flex-row gap-4 w-full">
              {/* YouTube */}
              <div className="flex items-center gap-3">
                <span className="text-2xl">📺</span>
                <span className="text-white font-medium">YouTube</span>
                {ytConnected ? (
                  <span className="ml-2 px-2 py-1 bg-green-600 text-white rounded text-xs">Connected</span>
                ) : (
                  <Button
                    size="sm"
                    className="bg-red-600 hover:bg-red-700 text-white rounded"
                    onClick={() => handleConnect("youtube")}
                  >
                    Connect
                  </Button>
                )}
              </div>
              {/* Instagram */}
              <div className="flex items-center gap-3">
                <span className="text-2xl">📸</span>
                <span className="text-white font-medium">Instagram</span>
                {igConnected ? (
                  <span className="ml-2 px-2 py-1 bg-green-600 text-white rounded text-xs">Connected</span>
                ) : (
                  <Button
                    size="sm"
                    className="bg-gradient-to-r from-pink-500 to-yellow-400 text-white rounded"
                    onClick={() => handleConnect("instagram")}
                  >
                    Connect
                  </Button>
                )}
              </div>
            </div>
            <div className="text-white/60 text-xs mt-2 md:mt-0">Connect your accounts to enable posting</div>
          </div>

          {/* User Videos Section */}
          <div className="bg-storiq-card-bg border border-storiq-border rounded-2xl p-6 mb-8">
            <h2 className="text-xl font-bold text-white mb-4">Your Videos</h2>
            {loading ? (
              <div className="text-white/60">Loading videos...</div>
            ) : error ? (
              <div className="text-destructive">{error}</div>
            ) : videos.length === 0 ? (
              <div className="text-white/40">No videos found. Create or upload videos to see them here.</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {videos.map((video) => (
                  <div key={video.id || video.s3Key} className="bg-storiq-dark-lighter rounded-xl p-4 flex flex-col gap-2 border border-storiq-border">
                    <div className="aspect-w-16 aspect-h-9 mb-2">
                      <video src={video.url} controls className="w-full rounded" />
                    </div>
                    <div className="text-white font-semibold">{video.title || "Untitled Video"}</div>
                    <div className="flex gap-4 items-center mt-2">
                      <label className="flex items-center gap-2 text-white">
                        <input
                          type="checkbox"
                          checked={!!platformSelections[video.id || video.s3Key]?.yt}
                          onChange={() => handlePlatformChange(video.id || video.s3Key, "youtube")}
                          disabled={!ytConnected}
                          className="accent-red-600"
                        />
                        YouTube
                      </label>
                      <label className="flex items-center gap-2 text-white">
                        <input
                          type="checkbox"
                          checked={!!platformSelections[video.id || video.s3Key]?.ig}
                          onChange={() => handlePlatformChange(video.id || video.s3Key, "instagram")}
                          disabled={!igConnected}
                          className="accent-pink-500"
                        />
                        Instagram
                      </label>
                      <Button
                        size="sm"
                        className="ml-auto"
                        onClick={() => handlePost(video)}
                        disabled={
                          postingId === (video.id || video.s3Key) ||
                          (!platformSelections[video.id || video.s3Key]?.yt && !platformSelections[video.id || video.s3Key]?.ig)
                        }
                      >
                        {postingId === (video.id || video.s3Key) ? "Posting..." : "Post"}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Feedback Toast */}
          <ToastViewport />
          {toast && (
            <Toast
              open
              variant={toast.type === "error" ? "destructive" : "default"}
              onOpenChange={() => setToast(null)}
              className="mt-4"
            >
              <ToastTitle>{toast.type === "success" ? "Success" : "Error"}</ToastTitle>
              <ToastDescription>{toast.message}</ToastDescription>
            </Toast>
          )}

          {/* Loader Overlay */}
          {postingId && (
            <Loader
              message="Posting video..."
              size="medium"
              variant="spinner"
              overlayColor="rgba(30, 41, 59, 0.85)"
              primaryColor="#a78bfa"
            />
          )}
        </div>
        </DashboardLayout>
      </ToastProvider>
    );
  };


export default Publish;