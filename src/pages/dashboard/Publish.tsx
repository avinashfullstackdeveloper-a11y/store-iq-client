"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import useYouTubeConnect from "@/hooks/useYouTubeConnect";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";

const IG_OAUTH_URL = `${import.meta.env.VITE_API_BASE_URL}/api/auth/instagram`;

// Videos state
interface Video {
  id?: string;
  url: string;
  title?: string;
  thumbnail?: string;
  duration?: number;
  s3Key?: string;
  publishCount?: number;
  publishedToYouTube?: boolean;
}

const Publish = () => {
  const navigate = useNavigate();
  const {
    ytConnected,
    loading: ytLoading,
    handleYouTubeOAuth,
    fetchConnectionStatus,
  } = useYouTubeConnect();
  const [igConnected, setIgConnected] = useState(false);

  // Define tabs for the scheduling section
  const tabs = ["Scheduled", "Past Publications"];

  const [videos, setVideos] = useState<Video[]>([]);
  const [images, setImages] = useState<{ id?: string; url: string; s3Key?: string; title?: string }[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [imagesLoading, setImagesLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [imagesError, setImagesError] = useState<string | null>(null);
  const [postingId, setPostingId] = useState<string | null>(null);

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
    const selection = platformSelections[video.id || video.s3Key || ""] || {
      yt: false,
      ig: false,
    };
    if ((!selection.yt && !selection.ig) || (!ytConnected && !igConnected)) {
      toast.error("Please connect platforms and select at least one.");
      return;
    }
    setPostingId(video.id || video.s3Key || "");

    try {
      // Prepare payload
      const payload = {
        s3Key: video.s3Key,
      };

      // Track results for each platform
      let ytSuccess = false;
      const igSuccess = false;
      let errorMsg = "";

      // Post to YouTube if selected
      if (selection.yt && ytConnected) {
        const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
        const res = await fetch(`${API_BASE_URL}/api/publish/youtube`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          errorMsg += `YouTube: ${err?.message || "Failed to post"} `;
        } else {
          ytSuccess = true;
        }
      }

      setPostingId(null);

      if (ytSuccess) {
        toast.success("Video published successfully!");
        setPlatformSelections((prev) => ({
          ...prev,
          [video.id || video.s3Key || ""]: { yt: false, ig: false },
        }));
        await fetchVideos();
      } else {
        toast.error(errorMsg.trim() || "Failed to post video.");
      }
    } catch (err) {
      setPostingId(null);
      toast.error((err as Error)?.message || "Failed to post video.");
    }
  };

  const ytConnectedRef = React.useRef(ytConnected);
  React.useEffect(() => {
    if (!ytConnectedRef.current && ytConnected) {
      if (sessionStorage.getItem("ytConnectInitiated")) {
        toast.success("Successfully connected to YouTube!");
        sessionStorage.removeItem("ytConnectInitiated");
      }
    }
    ytConnectedRef.current = ytConnected;
  }, [ytConnected]);

  // Fetch connection statuses
  const fetchInstagramConnectionStatus = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/auth/status`,
        { credentials: "include" }
      );
      if (res.ok) {
        const status = await res.json();
        setIgConnected(!!status.instagram);
      }
    } catch {
      setIgConnected(false);
    }
  };

  React.useEffect(() => {
    fetchVideos();
    fetchConnectionStatus();
    fetchInstagramConnectionStatus();
  }, []);

  // Fetch videos from backend
  const fetchVideos = async () => {
    setLoading(true);
    setError(null);
    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
      const res = await fetch(`${API_BASE_URL}/api/videos`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch videos");
      const data = await res.json();
      setVideos(Array.isArray(data) ? data : []);
    } catch (err) {
      setError((err as Error)?.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Your Posting Queue
          </h1>
          <p className="text-white/60">
            Your content published while you sleep
          </p>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-8">
          {tabs.map((tab, index) => (
            <button
              key={index}
              className={`px-6 py-3 rounded-lg text-sm font-medium transition-colors ${
                index === 0
                  ? "bg-storiq-purple text-white"
                  : "text-white/60 hover:text-white hover:bg-storiq-card-bg"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Social Connect Banner */}
        <div className="bg-storiq-card-bg border border-storiq-border rounded-2xl p-6 mb-8 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="text-2xl">🔗</div>
            <div>
              <h3 className="text-white font-medium">
                Connect Social Accounts to enable scheduling (TikTok, YouTube,
                Instagram)
              </h3>
              <p className="text-white/60 text-sm">
                To use scheduling feature, connect social accounts
              </p>
            </div>
          </div>
          <Button
            className="bg-storiq-purple hover:bg-storiq-purple-light text-white rounded-lg"
            onClick={() => (!ytConnected ? handleYouTubeOAuth() : null)}
          >
            Connect Now
          </Button>
        </div>

        <Tabs defaultValue="scheduled" className="w-full">
          <TabsContent value="scheduled" className="mt-6">
            {/* Split videos and images by file extension */}
            {(() => {
              function isVideoFile(url) {
                return /\.(mp4|mov|webm|avi|mkv)$/i.test(url);
              }
              const videoItems = videos.filter((v) => isVideoFile(v.url));
              return (
                <>
                  <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-3xl p-8 mb-12 shadow-2xl">
                    <div className="flex items-center justify-between mb-8">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center shadow-lg">
                          <svg
                            className="w-5 h-5 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                            />
                          </svg>
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold text-white">
                            Your Videos
                          </h2>
                          <p className="text-slate-400 text-base mt-1">
                            Select and customize videos to publish across platforms
                          </p>
                        </div>
                      </div>
                      <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-slate-800/50 rounded-xl border border-slate-600/50">
                        <span className="text-sm text-slate-400">Total:</span>
                        <span className="text-lg font-bold text-white">
                          {videoItems.length}
                        </span>
                      </div>
                    </div>

                    {loading ? (
                      <div className="flex flex-col items-center justify-center py-20">
                        <div className="relative">
                          <div className="w-16 h-16 border-4 border-slate-700 border-t-purple-500 rounded-full animate-spin"></div>
                          <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-pink-500 rounded-full animate-spin animation-delay-150"></div>
                        </div>
                        <p className="text-slate-400 mt-4 font-medium">
                          Loading your videos...
                        </p>
                      </div>
                    ) : error ? (
                      <div className="bg-red-500/10 border border-red-500/20 text-red-300 px-6 py-4 rounded-2xl flex items-center gap-3">
                        <svg
                          className="w-5 h-5 text-red-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <span>{error}</span>
                      </div>
                    ) : videoItems.length === 0 ? (
                      <div className="flex flex-col items-center justify-center text-center py-20 border-2 border-dashed border-slate-600/50 rounded-2xl bg-slate-800/20">
                        <div className="w-20 h-20 mb-6 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center mx-auto">
                          <svg
                            className="w-10 h-10 text-slate-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                            />
                          </svg>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">
                          No videos yet
                        </h3>
                        <p className="text-slate-400 mb-6 max-w-md mx-auto">
                          Create your first video to start publishing across
                          social platforms
                        </p>
                        <Button
                          className="bg-storiq-purple hover:bg-storiq-purple/80 text-white font-medium px-8 py-3 shadow-lg hover:shadow-xl transition-all duration-300"
                          onClick={() => navigate("/dashboard/create-video")}
                        >
                          <span className="flex items-center gap-2">
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M12 4v16m8-8H4"
                              />
                            </svg>
                            Create Your First Video
                          </span>
                        </Button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                        {videoItems.map((video) => (
                          <VideoPublishCard
                            key={video.id || video.s3Key}
                            video={video}
                            ytConnected={ytConnected}
                            igConnected={igConnected}
                            platformSelections={platformSelections}
                            handlePlatformChange={handlePlatformChange}
                            handlePost={handlePost}
                            postingId={postingId}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </>
              );
            })()}
          </TabsContent>

          <TabsContent value="past" className="mt-6">
            <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-3xl p-8 shadow-2xl">
              <div className="flex flex-col items-center justify-center text-center py-20">
                <div className="w-20 h-20 mb-6 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center mx-auto">
                  <svg
                    className="w-10 h-10 text-slate-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">
                  Past Publications
                </h3>
                <p className="text-slate-400 max-w-md mx-auto">
                  Your published content history will appear here. This feature
                  is coming soon!
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

interface VideoPublishCardProps {
  video: Video;
  ytConnected: boolean;
  igConnected: boolean;
  platformSelections: { [videoId: string]: { yt: boolean; ig: boolean } };
  handlePlatformChange: (videoId: string, platform: "youtube" | "instagram") => void;
  handlePost: (video: Video) => void;
  postingId: string | null;
}

const VideoPublishCard: React.FC<VideoPublishCardProps> = ({
  video,
  ytConnected,
  igConnected,
  platformSelections,
  handlePlatformChange,
  handlePost,
  postingId,
}) => {
  const [open, setOpen] = useState(false);
  const videoId = video.id || video.s3Key || "";
  const selection = platformSelections[videoId] || { yt: false, ig: false };

  return (
    <div className="group bg-gradient-to-br from-slate-800/60 to-slate-900/60 rounded-2xl overflow-hidden border border-slate-600/50 transition-all duration-300 hover:border-purple-500/50 hover:shadow-xl hover:shadow-purple-500/10 hover:-translate-y-1 backdrop-blur-sm">
      <Dialog open={open} onOpenChange={setOpen}>
        <div className="relative aspect-video bg-slate-900 overflow-hidden">
          <video
            src={video.url}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            tabIndex={-1}
            muted
            playsInline
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300" />
          <DialogTrigger asChild>
            <Button
              size="sm"
              className="absolute inset-0 w-full h-full opacity-0 group-hover:opacity-100"
              onClick={() => setOpen(true)}
            >
              Preview
            </Button>
          </DialogTrigger>
        </div>

        <DialogContent className="max-w-4xl w-full bg-slate-900 border-slate-700">
          <DialogTitle className="text-white text-xl font-bold">Video Preview</DialogTitle>
          <div className="aspect-video w-full bg-black rounded-xl overflow-hidden">
            <video src={video.url} className="w-full h-full" controls autoPlay />
          </div>
        </DialogContent>
      </Dialog>

      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-bold text-lg mb-2 truncate group-hover:text-purple-200 transition-colors">
              {video.title || "Untitled Video"}
            </h3>
            <div className="flex items-center gap-3 text-sm">
              <span className="text-slate-400">
                Published {video.publishCount ?? 0} time
                {(video.publishCount ?? 0) === 1 ? "" : "s"}
              </span>
            </div>
          </div>
        </div>

        <Button
          className={`w-full font-medium transition-all duration-300 ${
            !selection.yt
              ? "bg-slate-700/50 hover:bg-slate-600/50 text-slate-400 border border-slate-600/50"
              : "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl hover:scale-[1.02]"
          }`}
          onClick={() => handlePost(video)}
          disabled={postingId === videoId || (!selection.yt)}
        >
          {postingId === videoId ? (
            <span className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Publishing...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
              {!selection.yt ? "Select platform to publish" : "Publish"}
            </span>
          )}
        </Button>
      </div>
    </div>
  );
};

export default Publish;
