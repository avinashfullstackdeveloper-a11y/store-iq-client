// VideoEditor.tsx
import React, { useEffect, useRef, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { useAuth } from "@/context/AuthContext";

interface Video {
  id?: string;
  url: string;
  title?: string;
  duration?: number;
}

const MOCK_VIDEOS: Video[] = [
  {
    id: "1",
    url: "/videos/sample1.mp4",
    title: "Sample Video 1",
    duration: 120,
  },
  {
    id: "2",
    url: "/videos/sample2.mp4",
    title: "Sample Video 2",
    duration: 95,
  },
];

function fetchVideoById(id: string | undefined): Promise<Video | null> {
  // Mock fetch: Replace with real API if needed
  return new Promise((resolve) => {
    setTimeout(() => {
      const found = MOCK_VIDEOS.find((v) => v.id === id);
      resolve(found || null);
    }, 300);
  });
}

const VideoEditor: React.FC = () => {
  const params = useParams();
  const location = useLocation();
  const { user } = useAuth();
  const userId = user && user.id ? user.id : null;
  const wildcard = params['*']; // full path after /dashboard/video-editor/
  const [video, setVideo] = useState<Video | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cropping state
  const [start, setStart] = useState(0);
  const [end, setEnd] = useState(0);
  const [duration, setDuration] = useState(0);
  const [previewing, setPreviewing] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // If url is passed via navigation state, use it directly
    if (location.state && location.state.url) {
      setVideo({
        url: location.state.url,
        title: decodeURIComponent(wildcard?.split('/').pop() || "Untitled"),
        duration: undefined,
      });
      setStart(0);
      setEnd(0);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);
    // If the wildcard is a simple id, use fetchVideoById, else treat as URL
    if (wildcard && !wildcard.includes('/')) {
      fetchVideoById(wildcard)
        .then((v) => {
          if (v) {
            setVideo(v);
            setStart(0);
            setEnd(v.duration ?? 0);
            setDuration(v.duration ?? 0);
          } else {
            setError("Video not found");
          }
        })
        .catch(() => setError("Failed to fetch video"))
        .finally(() => setLoading(false));
    } else if (wildcard) {
      // treat as a path or URL
      let videoUrl = wildcard;
      if (!/^https?:\/\//i.test(videoUrl)) {
        // If not absolute, ensure it starts with a single /
        videoUrl = videoUrl.startsWith("/") ? videoUrl : "/" + videoUrl;
      }
      setVideo({
        url: videoUrl,
        title: decodeURIComponent(wildcard.split('/').pop() || "Untitled"),
        duration: undefined,
      });
      setStart(0);
      setEnd(0);
      setDuration(0);
      setLoading(false);
    } else {
      setError("No video identifier provided");
      setLoading(false);
    }
  }, [wildcard, location.state]);

  // Set duration from video metadata
  useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;
    const handleLoadedMetadata = () => {
      setDuration(vid.duration);
      // If end is 0 or greater than duration, set end to duration
      setEnd((prevEnd) => (prevEnd === 0 || prevEnd > vid.duration ? vid.duration : prevEnd));
    };
    vid.addEventListener("loadedmetadata", handleLoadedMetadata);
    return () => {
      vid.removeEventListener("loadedmetadata", handleLoadedMetadata);
    };
  }, [video]);

  // Handle preview of cropped segment
  useEffect(() => {
    if (!previewing || !videoRef.current) return;
    const vid = videoRef.current;
    vid.currentTime = start;
    vid.play();

    const onTimeUpdate = () => {
      if (vid.currentTime >= end) {
        vid.pause();
        setPreviewing(false);
      }
    };
    vid.addEventListener("timeupdate", onTimeUpdate);
    return () => {
      vid.removeEventListener("timeupdate", onTimeUpdate);
    };
  }, [previewing, start, end]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-8 text-white">Loading video...</div>
      </DashboardLayout>
    );
  }

  if (error || !video) {
    return (
      <DashboardLayout>
        <div className="p-8 text-red-500">{error || "Video not found"}</div>
      </DashboardLayout>
    );
  }

  // duration is now from state

  return (
    <DashboardLayout>
      <div className="p-6 md:p-8 max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-4">
          Video Editor: {video.title || "Untitled"}
        </h1>
        <AspectRatio ratio={16 / 9} className="bg-black rounded-lg overflow-hidden mb-6">
          <video
            ref={videoRef}
            src={video.url}
            controls
            className="w-full h-full"
            preload="metadata"
            style={{ outline: previewing ? "2px solid #a855f7" : undefined }}
          />
        </AspectRatio>
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white">Crop Segment</span>
            <span className="text-white/60 text-sm">
              {formatTime(start)} - {formatTime(end)} / {formatTime(duration)}
            </span>
          </div>
          <Slider
            min={0}
            max={duration}
            step={0.1}
            value={[start, end]}
            onValueChange={([newStart, newEnd]) => {
              // Clamp values to [0, duration]
              const s = Math.max(0, Math.min(newStart, newEnd, duration));
              const e = Math.max(0, Math.max(newStart, newEnd, 0));
              setStart(Math.min(s, e));
              setEnd(Math.max(s, e));
            }}
            minStepsBetweenThumbs={1}
            className="mb-2"
          />
          <div className="flex gap-4">
            <div>
              <label className="text-white/70 text-xs">Start</label>
              <input
                type="number"
                min={0}
                max={end}
                step={0.1}
                value={start}
                onChange={(e) => {
                  let val = Number(e.target.value);
                  if (isNaN(val)) val = 0;
                  val = Math.max(0, Math.min(val, end, duration));
                  setStart(val);
                  if (val > end) setEnd(val);
                }}
                className="ml-2 w-20 rounded px-2 py-1 bg-storiq-card-bg text-white border border-storiq-border"
              />
            </div>
            <div>
              <label className="text-white/70 text-xs">End</label>
              <input
                type="number"
                min={start}
                max={duration}
                step={0.1}
                value={end}
                onChange={(e) => {
                  let val = Number(e.target.value);
                  if (isNaN(val)) val = start;
                  val = Math.max(start, Math.min(val, duration));
                  setEnd(val);
                  if (val < start) setStart(val);
                }}
                className="ml-2 w-20 rounded px-2 py-1 bg-storiq-card-bg text-white border border-storiq-border"
              />
            </div>
            <Button
              onClick={() => setPreviewing(true)}
              disabled={previewing || start >= end}
              className="ml-4"
            >
              Preview Crop
            </Button>
          </div>
        </div>
        <div className="text-white/40 text-xs">
          Cropping logic is implemented for preview only. No saving or exporting.
        </div>
        <Button
          className="mt-6"
          disabled={start >= end || !userId}
          onClick={async () => {
            // Ensure all values are present and valid
            if (
              !video?.url ||
              typeof start !== "number" ||
              typeof end !== "number" ||
              start < 0 ||
              end <= start ||
              isNaN(start) ||
              isNaN(end)
            ) {
              alert("Invalid crop parameters. Please check start/end times and video URL.");
              return;
            }
            if (!userId) {
              alert("User not authenticated. Please log in again.");
              return;
            }
            try {
              // Send POST request to crop API with correct keys
              const token = localStorage.getItem("jwt_token");
              const response = await fetch("/api/video/crop", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  ...(token ? { Authorization: `Bearer ${token}` } : {})
                },
                body: JSON.stringify({
                  videoUrl: video.url,
                  start: Number(start),
                  end: Number(end),
                  userId: userId, // Always include userId for export creation
                }),
              });
              if (!response.ok) throw new Error("Failed to export video");
              const data = await response.json();
              // Prepare export entry with job_id and status
              // Use backend job_id or jobId for polling and as the job_id in export entry
              const jobId = data.job_id || data.jobId;
              const exportEntry = {
                filename: video.title || "Untitled",
                date: new Date().toISOString(),
                crop: { start, end },
                url: video.url,
                job_id: jobId, // always save as job_id
                status: data.status,
                export_id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, // unique id for UI actions
                userId: userId
              };
              // Get existing exports from localStorage
              const existing = JSON.parse(localStorage.getItem("exports") || "[]");
              // Add new entry
              existing.push(exportEntry);
              // Save back to localStorage
              localStorage.setItem("exports", JSON.stringify(existing));
              // Navigate to /dashboard/exports
              window.location.href = "/dashboard/exports";
            } catch (err) {
              alert("Export failed. Please try again.");
            }
          }}
        >
          {userId ? "Export" : "Sign in to Export"}
        </Button>
      </div>
    </DashboardLayout>
  );
};

function formatTime(sec: number) {
  const mins = Math.floor(sec / 60);
  const secs = Math.floor(sec % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export default VideoEditor;