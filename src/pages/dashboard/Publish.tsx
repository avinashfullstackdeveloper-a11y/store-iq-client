"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { DateTime } from "luxon";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
import { ScheduleDialog } from "@/components/schedule-dialog";

const IG_OAUTH_URL = `${import.meta.env.VITE_API_BASE_URL}/api/auth/instagram`;

// Videos state
interface Video {
  id?: string;
  url: string;
  title?: string;
  description?: string;
  thumbnail?: string;
  duration?: number;
  s3Key?: string;
  publishCount?: number;
  publishedToYouTube?: boolean;
  scheduledTime?: string;
  scheduledStatus?: 'pending' | 'completed' | 'failed';
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

  const [activeTab, setActiveTab] = useState<'scheduled' | 'past'>('scheduled');
  const [videos, setVideos] = useState<Video[]>([]);

  // Filter videos based on active tab and file type
  const filteredVideos = React.useMemo(() => {
    const isVideoFile = (url: string) => /\.(mp4|mov|webm|avi|mkv)$/i.test(url);
    const videoItems = videos.filter(v => isVideoFile(v.url));
    
    return videoItems.filter(v => {
      if (activeTab === 'scheduled') {
        // Show videos that are:
        // 1. Not yet published AND
        // 2. Either unscheduled OR scheduled but not completed
        return !v.publishedToYouTube && (!v.scheduledTime || (v.scheduledTime && v.scheduledStatus !== 'completed'));
      } else {
        // Show videos that are:
        // 1. Published to YouTube OR
        // 2. Have completed scheduled publishing
        return v.publishedToYouTube || (v.scheduledTime && v.scheduledStatus === 'completed');
      }
    });
  }, [videos, activeTab]);
  const [images, setImages] = useState<{ id?: string; url: string; s3Key?: string; title?: string }[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [imagesLoading, setImagesLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [imagesError, setImagesError] = useState<string | null>(null);
  const [postingId, setPostingId] = useState<string | null>(null);
  const [schedulingLoading, setSchedulingLoading] = useState<boolean>(false);

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
  const handlePost = async (video: Video, scheduledTime?: DateTime) => {
    setSchedulingLoading(true);
    try {
      const selection = platformSelections[video.id || video.s3Key || ""] || {
        yt: false,
        ig: false,
      };

      // Validation checks
      if (!selection.yt && !selection.ig) {
        toast.error("Please select at least one platform for publishing");
        return;
      }
      if (!ytConnected && selection.yt) {
        toast.error("YouTube connection required to publish. Please connect your account.");
        return;
      }

      setPostingId(video.id || video.s3Key || "");

      // Prepare payload
      const payload = {
        s3Key: video.s3Key,
        scheduledTime: scheduledTime ? scheduledTime.toISO() : undefined
      };

      // Track results for each platform
      let ytSuccess = false;
      const igSuccess = false;
      let errorMsg = "";

      // Post to YouTube if selected
      if (selection.yt && ytConnected) {
        const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
        const endpoint = scheduledTime ?
          `${API_BASE_URL}/api/schedule/video` :
          `${API_BASE_URL}/api/publish/youtube`;

        // Prepare the payload based on whether it's a scheduled post or immediate publish
        const requestPayload = scheduledTime ? {
          videoS3Key: video.s3Key,
          scheduledTime: scheduledTime.toISO(),
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          metadata: {
            title: video.title || 'Untitled Video',
            description: video.description || ''
          }
        } : payload;

        console.log('Scheduling video with metadata:', requestPayload); // Debug log
        
        try {
          const res = await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify(requestPayload),
          });
          
          const data = await res.json();
          
          if (!res.ok) {
            if (res.status === 404) {
              toast.error("Video not found. Please try again.");
            } else if (res.status === 400) {
              // Handle validation errors
              const errorMessage = data.error || "Invalid request";
              toast.error(`Scheduling failed: ${errorMessage}`);
            } else {
              // Handle other errors
              const errorMessage = data.error || "Failed to post";
              errorMsg += `YouTube Error: ${errorMessage}. Please try again or check your connection.`;
              toast.error(errorMsg);
            }
            setSchedulingLoading(false);
            return;
          }
          
          ytSuccess = true;
          if (scheduledTime) {
            toast.success(`Video "${video.title || 'Untitled Video'}" scheduled successfully!`);
            await fetchVideos(); // Refresh videos to show scheduled status
            setActiveTab('scheduled'); // Switch to scheduled tab
            setSchedulingLoading(false);
            return;
          }
        } catch (err) {
          console.error('API Error:', err);
          toast.error("Failed to connect to server. Please try again.");
          setSchedulingLoading(false);
          return;
        }
      }

      setPostingId(null);

      if (ytSuccess) {
        toast.success(`"${video.title || 'Untitled Video'}" published successfully!`);
        setPlatformSelections((prev) => ({
          ...prev,
          [video.id || video.s3Key || ""]: { yt: false, ig: false },
        }));
        await fetchVideos();
        setActiveTab('past'); // Switch to past publications tab after successful publish
      } else if (!scheduledTime) {
        // Only show generic error for immediate publishing
        toast.error(errorMsg.trim() || "Failed to post video.");
      }
    } catch (err) {
      setPostingId(null);
      setSchedulingLoading(false);
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

  // Fetch images from backend
  const fetchImages = async () => {
    setImagesLoading(true);
    setImagesError(null);
    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
      const res = await fetch(`${API_BASE_URL}/api/images`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch images");
      const data = await res.json();
      console.log('Fetched images:', data); // Debug log
      setImages(Array.isArray(data) ? data.map(img => ({
        id: img.key,
        url: img.s3Url,
        s3Key: img.key,
        title: img.title
      })) : []);
    } catch (err) {
      setImagesError((err as Error)?.message || "Unknown error");
    } finally {
      setImagesLoading(false);
    }
  };

  React.useEffect(() => {
    fetchVideos();
    fetchImages();
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
          <h1 className="text-4xl font-bold text-white mb-2">Your Posting Queue</h1>
          <p className="text-white/60">Your content published while you sleep</p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(value: 'scheduled' | 'past') => setActiveTab(value)} className="w-full">
          <TabsList className="mb-8 bg-transparent gap-2">
            <TabsTrigger
              value="scheduled"
              className={`px-6 py-3 rounded-lg text-sm font-medium transition-colors data-[state=active]:bg-storiq-purple data-[state=active]:text-white text-white/60 hover:text-white hover:bg-storiq-card-bg`}
            >
              Scheduled
            </TabsTrigger>
            <TabsTrigger
              value="past"
              className={`px-6 py-3 rounded-lg text-sm font-medium transition-colors data-[state=active]:bg-storiq-purple data-[state=active]:text-white text-white/60 hover:text-white hover:bg-storiq-card-bg`}
            >
              Past Publications
            </TabsTrigger>
          </TabsList>

        {/* Social Connect Banner */}
        <div className="bg-storiq-card-bg border border-storiq-border rounded-2xl p-6 mb-8 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="text-2xl">🔗</div>
            <div>
              <h3 className="text-white font-medium">
                {ytConnected ? "Connected to YouTube" : "Connect Social Accounts to enable scheduling"}
              </h3>
              <p className="text-white/60 text-sm">
                {ytConnected ? "Ready to publish and schedule videos" : "To use scheduling feature, connect social accounts"}
              </p>
            </div>
          </div>
          <Button
            className={`${
              ytConnected
                ? "bg-green-600 hover:bg-green-700"
                : "bg-storiq-purple hover:bg-storiq-purple-light"
            } text-white rounded-lg`}
            disabled={ytLoading}
            onClick={() => (!ytConnected ? handleYouTubeOAuth() : null)}
          >
            {ytLoading ? "Connecting..." : ytConnected ? "✓ Connected" : "Connect Now"}
          </Button>
        </div>

        {/* Queue Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">Your Posting Queue</h2>
            <p className="text-white/60">Your content published while you sleep</p>
          </div>
        </div>

        {/* Content based on active tab */}
          <TabsContent value="scheduled" className="mt-6">
            {/* Split videos and images by file extension */}
            {(() => {
              function isVideoFile(url: string) {
                return /\.(mp4|mov|webm|avi|mkv)$/i.test(url);
              }
              function isImageFile(url: string) {
                return /\.(jpg|jpeg|png|gif|webp)$/i.test(url);
              }

              // Filter videos for current view
              const allVideoItems = videos.filter((v) => isVideoFile(v.url));
              const currentVideoItems = allVideoItems.filter(v => {
                if (activeTab === 'scheduled') {
                  // Show videos that are:
                  // 1. Not yet published AND
                  // 2. Either unscheduled OR scheduled but not completed
                  return !v.publishedToYouTube && (!v.scheduledTime || (v.scheduledTime && v.scheduledStatus !== 'completed'));
                } else {
                  // Show videos that are:
                  // 1. Published to YouTube OR
                  // 2. Have completed scheduled publishing
                  return v.publishedToYouTube || (v.scheduledTime && v.scheduledStatus === 'completed');
                }
              });
              
              const imageItems = images;
              return (
                <>
                  {/* Videos Section */}
                  <div className="bg-storiq-card-bg border border-storiq-border rounded-xl p-8 mb-12">
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
                          {filteredVideos.length}
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
                    ) : filteredVideos.length === 0 ? (
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
                        {filteredVideos.map((video) => (
                          <VideoPublishCard
                            key={video.id || video.s3Key}
                            video={video}
                            ytConnected={ytConnected}
                            igConnected={igConnected}
                            platformSelections={platformSelections}
                            handlePlatformChange={handlePlatformChange}
                            handlePost={handlePost}
                            postingId={postingId}
                            schedulingLoading={schedulingLoading}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                  {/* Images Section */}
                  <div className="bg-storiq-card-bg border border-storiq-border rounded-xl p-8">
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
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold text-white">Your Images</h2>
                          <p className="text-slate-400 text-base mt-1">
                            Select and customize images to publish across platforms
                          </p>
                        </div>
                      </div>
                      <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-slate-800/50 rounded-xl border border-slate-600/50">
                        <span className="text-sm text-slate-400">Total:</span>
                        <span className="text-lg font-bold text-white">{imageItems.length}</span>
                      </div>
                    </div>

                    {imagesLoading ? (
                      <div className="flex flex-col items-center justify-center py-20">
                        <div className="relative">
                          <div className="w-16 h-16 border-4 border-slate-700 border-t-purple-500 rounded-full animate-spin"></div>
                          <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-pink-500 rounded-full animate-spin animation-delay-150"></div>
                        </div>
                        <p className="text-slate-400 mt-4 font-medium">Loading your images...</p>
                      </div>
                    ) : imagesError ? (
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
                        <span>{imagesError}</span>
                      </div>
                    ) : imageItems.length === 0 ? (
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
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">No images yet</h3>
                        <p className="text-slate-400 mb-6 max-w-md mx-auto">
                          Create your first image to start publishing across social platforms
                        </p>
                        <Button
                          className="bg-storiq-purple hover:bg-storiq-purple/80 text-white font-medium px-8 py-3 shadow-lg hover:shadow-xl transition-all duration-300"
                          onClick={() => navigate("/dashboard/create-image")}
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
                            Create Your First Image
                          </span>
                        </Button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                        {imageItems.map((image) => (
                          <div
                            key={image.id || image.s3Key}
                            className="group bg-gradient-to-br from-slate-800/60 to-slate-900/60 rounded-2xl overflow-hidden border border-slate-600/50 transition-all duration-300 hover:border-purple-500/50 hover:shadow-xl hover:shadow-purple-500/10 hover:-translate-y-1 backdrop-blur-sm"
                          >
                            <Dialog>
                              <div className="relative aspect-video bg-slate-900 overflow-hidden">
                                <img
                                  src={image.url}
                                  alt={image.title || "Untitled Image"}
                                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300" />
                                <DialogTrigger asChild>
                                  <Button
                                    size="sm"
                                    className="absolute inset-0 w-full h-full opacity-0 group-hover:opacity-100"
                                  >
                                    Preview
                                  </Button>
                                </DialogTrigger>
                              </div>
                              <DialogContent className="max-w-4xl w-full bg-slate-900 border-slate-700">
                                <DialogTitle className="text-white text-xl font-bold">Image Preview</DialogTitle>
                                <div className="w-full bg-black rounded-xl overflow-hidden">
                                  <img
                                    src={image.url}
                                    alt={image.title || "Full size image"}
                                    className="w-full h-auto"
                                  />
                                </div>
                              </DialogContent>
                            </Dialog>
                            <div className="p-6">
                              <div className="flex items-start justify-between mb-4">
                                <div className="flex-1 min-w-0">
                                  <h3 className="text-white font-bold text-lg mb-2 truncate group-hover:text-purple-200 transition-colors">
                                    {image.title || "Untitled Image"}
                                  </h3>
                                </div>
                              </div>
                              <Button
                                className="w-full font-medium bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300"
                                onClick={() => handlePost(image)}
                              >
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
                                  Publish
                                </span>
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              );
            })()}
          </TabsContent>

          <TabsContent value="past" className="mt-6">
            {/* Past Publications Section */}
            <div className="bg-storiq-card-bg border border-storiq-border rounded-xl p-8">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-lg">
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
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Published Content</h2>
                    <p className="text-slate-400 text-base mt-1">
                      Your successfully published videos and scheduling history
                    </p>
                  </div>
                </div>
              </div>

              {loading ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <div className="relative">
                    <div className="w-16 h-16 border-4 border-slate-700 border-t-green-500 rounded-full animate-spin"></div>
                    <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-emerald-500 rounded-full animate-spin animation-delay-150"></div>
                  </div>
                  <p className="text-slate-400 mt-4 font-medium">Loading published content...</p>
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
              ) : filteredVideos.length === 0 ? (
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
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">No Published Content</h3>
                  <p className="text-slate-400 mb-6 max-w-md mx-auto">
                    Your published content will appear here after successful publication.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                  {filteredVideos.map((video) => (
                    <VideoPublishCard
                      key={video.id || video.s3Key}
                      video={video}
                      ytConnected={ytConnected}
                      igConnected={igConnected}
                      platformSelections={platformSelections}
                      handlePlatformChange={handlePlatformChange}
                      handlePost={handlePost}
                      postingId={postingId}
                      schedulingLoading={schedulingLoading}
                    />
                  ))}
                </div>
              )}
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
  handlePost: (video: Video, scheduledTime?: DateTime) => void;
  postingId: string | null;
  schedulingLoading: boolean;
}

const VideoPublishCard: React.FC<VideoPublishCardProps> = ({
  video,
  ytConnected,
  igConnected,
  platformSelections,
  handlePlatformChange,
  handlePost,
  postingId,
  schedulingLoading,
}) => {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const videoId = video.id || video.s3Key || "";
  const selection = platformSelections[videoId] || { yt: false, ig: false };

  return (
    <div className="group bg-gradient-to-br from-slate-800/60 to-slate-900/60 rounded-2xl overflow-hidden border border-slate-600/50 transition-all duration-300 hover:border-purple-500/50 hover:shadow-xl hover:shadow-purple-500/10 hover:-translate-y-1 backdrop-blur-sm">
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <div className="relative aspect-video bg-slate-900 overflow-hidden">
          {video.thumbnail ? (
            <img
              src={video.thumbnail}
              alt={video.title || "Video thumbnail"}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <video
              src={video.url}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              tabIndex={-1}
              muted
              playsInline
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300" />
          <DialogTrigger asChild>
            <Button
              size="sm"
              className="absolute inset-0 w-full h-full opacity-0 group-hover:opacity-100"
              onClick={() => setPreviewOpen(true)}
            >
              Preview
            </Button>
          </DialogTrigger>
          <ScheduleDialog
            open={scheduleOpen}
            onOpenChange={setScheduleOpen}
            onSchedule={(scheduledTime) => handlePost(video, scheduledTime)}
          />
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
              {video.scheduledTime && (
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium
                  ${video.scheduledStatus === 'completed' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                    video.scheduledStatus === 'failed' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                    'bg-purple-500/20 text-purple-400 border border-purple-500/30'}`}>
                  <svg
                    className={`w-3.5 h-3.5 ${
                      video.scheduledStatus === 'completed' ? 'text-green-400' :
                      video.scheduledStatus === 'failed' ? 'text-red-400' :
                      'text-purple-400'
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    {video.scheduledStatus === 'completed' ? (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 13l4 4L19 7"
                      />
                    ) : video.scheduledStatus === 'failed' ? (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    ) : (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    )}
                  </svg>
                  <div>
                    <span className="font-semibold">
                      {video.scheduledStatus === 'completed' ? 'Published successfully' :
                       video.scheduledStatus === 'failed' ? 'Publishing failed' :
                       'Scheduled for ' + DateTime.fromISO(video.scheduledTime).toLocaleString(DateTime.DATETIME_SHORT)}
                    </span>
                    {video.scheduledStatus === 'completed' && (
                      <span className="block text-green-400/60 mt-0.5">
                        Published to YouTube
                      </span>
                    )}
                    {video.scheduledStatus === 'failed' && (
                      <span className="block text-red-400/60 mt-0.5">
                        Check connection and try again
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Platform Selection */}
        <div className="mb-4 flex gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  className={`flex-1 p-2 rounded-lg transition-all ${
                    selection.yt
                      ? "bg-purple-500/20 text-purple-400 border-2 border-purple-500"
                      : "bg-slate-700/50 text-slate-400 border border-slate-600/50"
                  }`}
                  onClick={() => handlePlatformChange(videoId, "youtube")}
                  disabled={!ytConnected}
                >
                  <div className="flex items-center justify-center gap-2">
                    <span>YouTube</span>
                    {ytConnected ? (
                      <span className={`w-2 h-2 rounded-full ${selection.yt ? "bg-purple-500" : "bg-green-500"}`} />
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-red-500" />
                    )}
                  </div>
                  {!ytConnected && (
                    <span className="text-xs block text-red-400">Not Connected</span>
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{ytConnected
                  ? selection.yt
                    ? "Selected for publishing"
                    : "Click to select YouTube for publishing"
                  : "Connect YouTube account to publish"}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            className={`flex-1 font-medium transition-all duration-300 ${
              !selection.yt || !ytConnected
                ? "bg-slate-700/50 hover:bg-slate-600/50 text-slate-400 border border-slate-600/50"
                : "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl hover:scale-[1.02]"
            }`}
            onClick={() => handlePost(video)}
            disabled={postingId === videoId || !selection.yt || !ytConnected}
            title={!ytConnected ? "Connect to YouTube to publish videos" : !selection.yt ? "Select a platform to publish" : ""}
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
                {!ytConnected ? "Connect YouTube" : !selection.yt ? "Select Platform" : "Publish Now"}
              </span>
            )}
          </Button>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  className={`bg-slate-700 hover:bg-slate-600 text-white ${(!ytConnected || !selection.yt || schedulingLoading) ? 'opacity-50 cursor-not-allowed' : ''}`}
                  onClick={() => setScheduleOpen(true)}
                  disabled={postingId === videoId || !selection.yt || !ytConnected || schedulingLoading}
                >
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
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  {!ytConnected
                    ? "Connect YouTube account to schedule videos"
                    : !selection.yt
                      ? "Select YouTube to enable scheduling"
                      : "Schedule this video for later"}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </div>
  );
};

export default Publish;
