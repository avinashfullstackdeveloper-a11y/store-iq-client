import React, { useState, useEffect, memo } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";

import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import AdvancedVideoPlayer from "@/components/AdvancedVideoPlayer";
import { useAuth } from "@/context/AuthContext";

function isErrorWithMessage(err: unknown): err is { message: string } {
  return (
    typeof err === "object" &&
    err !== null &&
    "message" in err &&
    typeof (err as { message?: unknown }).message === "string"
  );
}

const CreateVideo = () => {
  const { user } = useAuth();
  console.log("Current user in CreateVideo:", user);
  // --- STATE MANAGEMENT ---
  // --- STATUS MANAGEMENT ---
  type Status = "idle" | "loading" | "success" | "error";
  const [prompt, setPrompt] = useState(
    `Create a video about sustainable living tips.

Feature a young female character.

Each scene should have a different background. Use a modern sans-serif font and vibrant nature visuals.`
  );
  const [duration, setDuration] = useState([30]);
  const [selectedPreset, setSelectedPreset] = useState("Default");
  const [selectedVoice, setSelectedVoice] = useState("Voice Library");
  const [generatedScript, setGeneratedScript] = useState<string | null>(null);

  // Status for script generation
  const [scriptStatus, setScriptStatus] = useState<Status>("idle");
  const [scriptError, setScriptError] = useState<string | null>(null);

  // Status for video generation
  const [videoStatus, setVideoStatus] = useState<Status>("idle");
  const [videoError, setVideoError] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoS3Key, setVideoS3Key] = useState<string | null>(null);
  const [deleteStatus, setDeleteStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // --- UPLOAD VIDEO STATE ---
  const [uploadStatus, setUploadStatus] = useState<Status>("idle");
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Form validation error
  const [formError, setFormError] = useState<string | null>(null);

  // --- SCRIPT HISTORY ---
  type ScriptHistoryItem = {
    prompt: string;
    script: string;
    createdAt: string;
  };
  const [scriptHistory, setScriptHistory] = useState<ScriptHistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState<boolean>(true);
  const [historyError, setHistoryError] = useState<string | null>(null);
  
  // --- Per-card state for script history section ---
  const [expandedCards, setExpandedCards] = useState<boolean[]>([]);
  const [copiedCards, setCopiedCards] = useState<boolean[]>([]);
  
  // Keep per-card state arrays in sync with scriptHistory length
  useEffect(() => {
    setExpandedCards((prev) =>
      scriptHistory.map((_, idx) => prev[idx] ?? false)
    );
    setCopiedCards((prev) =>
      scriptHistory.map((_, idx) => false)
    );
  }, [scriptHistory]);

  useEffect(() => {
    if (!user) {
      setHistoryLoading(false);
      return;
    }
    setHistoryLoading(true);
    setHistoryError(null);
    const userId = user.id || user.userId || user.email;
    fetch(`/api/scripts/history?userId=${encodeURIComponent(userId)}`)
      .then(async (res) => {
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err?.error || "Failed to fetch script history.");
        }
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) {
          setScriptHistory(data);
        } else {
          setScriptHistory([]);
        }
        setHistoryLoading(false);
      })
      .catch((err) => {
        setHistoryError(
          err && typeof err.message === "string"
            ? err.message
            : "Failed to fetch script history."
        );
        setHistoryLoading(false);
      });
  }, [user]);

  // --- HANDLERS ---

  // Generate Script: Calls backend API
  const handleGenerateScript = async () => {
    console.log("handleGenerateScript called");
    if (!prompt.trim()) {
      setFormError("Prompt cannot be empty.");
      return;
    }
    setFormError(null);
    setScriptStatus("loading");
    setScriptError(null);
    setGeneratedScript(null);
    setVideoUrl(null);
    setVideoStatus("idle");
    setVideoError(null);
    try {
      const res = await fetch("/api/generate-script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || "Failed to generate script.");
      }
      const data = await res.json();
      if (!data?.script) throw new Error("No script returned from API.");
      setGeneratedScript(data.script);
      setScriptStatus("success");
      // Save script to backend history
      if (user) {
        console.log("Current user object:", user);
        const userId =
          (user && user.userId) ||
          (user && user.id) ||
          (user && user.email);
        fetch("/api/scripts/history", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId,
            prompt,
            script: data.script,
          }),
        }).catch(() => {
          // Silently ignore errors for history saving
        });
      }
    } catch (err: unknown) {
      let message = "Unknown error";
      if (isErrorWithMessage(err)) {
        message = err.message;
      }
      setScriptError(message);
      setScriptStatus("error");
    }
  };

  // Generate Video: Calls backend API
  const handleGenerateVideo = async () => {
    if (!generatedScript) {
      setFormError("Please generate a script first.");
      return;
    }
    setFormError(null);
    setVideoStatus("loading");
    setVideoError(null);
    setVideoUrl(null);
    setVideoS3Key(null);
    try {
      const res = await fetch("/api/generate-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          script: generatedScript,
          config: {
            duration: duration[0],
            preset: selectedPreset,
            voice: selectedVoice,
          },
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || "Failed to generate video.");
      }
      const data = await res.json();
      if (!data?.videoUrl) throw new Error("No video URL returned from API.");
      setVideoUrl(data.videoUrl);
      setVideoS3Key(data.s3Key || null); // Expect backend to return s3Key
      setVideoStatus("success");
    } catch (err: unknown) {
      let message = "Unknown error";
      if (isErrorWithMessage(err)) {
        message = err.message;
      }
      setVideoError(message);
      setVideoStatus("error");
    }
  };

  // --- DATA ---
  const presets = [
    "Default",
    "Ghibli Studio",
    "Educational",
    "Anime",
    "Realist",
  ];
  const voiceOptions = ["Voice Library", "Record", "No voice"];

  // --- UPLOAD VIDEO HANDLER ---
  const handleUploadVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploadStatus("idle");
    setUploadError(null);
    if (!selectedFile) {
      setUploadError("Please select a video file to upload.");
      return;
    }
    setUploading(true);
    setUploadStatus("loading");
    try {
      const formData = new FormData();
      formData.append("video", selectedFile);

      // Log FormData keys and values before sending
      for (const pair of formData.entries()) {
        console.log(`[FormData] ${pair[0]}:`, pair[1]);
      }

      // Read jwt_token from localStorage
      // const jwtToken = localStorage.getItem("jwt_token");

      const res = await fetch("/api/upload-video", {
        method: "POST",
        body: formData,
        credentials: "include"
        
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || "Failed to upload video.");
      }
      const data = await res.json();
      if (!data?.videoUrl) throw new Error("No video URL returned from API.");
      setVideoUrl(data.videoUrl);
      setVideoS3Key(data.s3Key || null);
      setVideoStatus("success");
      setUploadStatus("success");
      setSelectedFile(null);
    } catch (err: unknown) {
      let message = "Unknown error";
      if (isErrorWithMessage(err)) {
        message = err.message;
      }
      setUploadError(message);
      setUploadStatus("error");
    } finally {
      setUploading(false);
    }
  };

  // --- DELETE VIDEO HANDLER ---
  const handleDeleteVideo = async () => {
    if (!videoS3Key) return;
    setDeleteStatus("loading");
    setDeleteError(null);
    try {
      const res = await fetch("/api/delete-video", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ s3Key: videoS3Key }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || "Failed to delete video.");
      }
      setDeleteStatus("success");
      setVideoUrl(null);
      setVideoS3Key(null);
      setVideoStatus("idle");
      setVideoError(null);
    } catch (err: unknown) {
      let message = "Unknown error";
      if (isErrorWithMessage(err)) {
        message = err.message;
      }
      setDeleteError(message);
      setDeleteStatus("error");
    }
  };

  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Create a new video
          </h1>
          <p className="text-white/60">
            Select a tool and pick your options to create your video.
          </p>
        </div>

        <div className="flex flex-col gap-8">
          {/* Left Side - Video Preview */}
          {/* Removed default image preview as requested */}
          {/* Video Result */}
          <div className="w-full mt-8 flex flex-col">
            {videoStatus === "loading" && (
              <Card className="p-4 flex flex-col items-center justify-center border-2 border-storiq-purple/60 shadow-lg shadow-storiq-purple/20">
                <Skeleton className="w-full aspect-video mb-4" />
                <span className="text-storiq-purple font-semibold animate-pulse">
                  Generating video...
                </span>
              </Card>
            )}
            {videoStatus === "error" && videoError && (
              <Alert
                variant="destructive"
                className="mb-4 border-2 border-red-500/60"
              >
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{videoError}</AlertDescription>
              </Alert>
            )}
            {videoStatus === "success" && videoUrl && (
              <div className="p-2 border-2 border-green-500/60 shadow-lg shadow-green-500/10 rounded-lg bg-storiq-card-bg">
                <AdvancedVideoPlayer
                  src={videoUrl}
                  onDelete={handleDeleteVideo}
                  className="w-full max-w-full"
                  style={{ borderRadius: 12 }}
                />
                <div
                  className="mt-2 text-green-400 text-center text-sm font-semibold"
                  role="status"
                >
                  ✅ Video generated successfully!
                </div>
                <div className="text-white/80 text-center text-xs">
                  Video generated by S3
                </div>
                {deleteStatus === "error" && deleteError && (
                  <Alert
                    variant="destructive"
                    className="mt-2 mb-2 border-2 border-red-500/60"
                  >
                    <AlertTitle>Delete Error</AlertTitle>
                    <AlertDescription>{deleteError}</AlertDescription>
                  </Alert>
                )}
                {deleteStatus === "success" && (
                  <div
                    className="mt-2 text-green-400 text-center text-sm font-semibold"
                    role="status"
                  >
                    ✅ Video deleted successfully.
                  </div>
                )}
              </div>
            )}
            {videoStatus === "idle" && (
              <Card className="p-4 flex flex-col items-center justify-center border border-storiq-border bg-storiq-card-bg">
                <span className="text-white/40">No video generated yet.</span>
              </Card>
            )}
          </div>


          {/* Right Side - Controls */}
          <div className="flex-1 space-y-8">
            {/* Video Prompt */}
            <div>
              <h3 className="text-white text-xl font-bold mb-4">
                Your video prompt
              </h3>
              <p className="text-white/60 text-sm mb-4">
                Use natural language to describe what you want to see in the
                video. AI will generate a script based on your prompt.
              </p>
              <label htmlFor="video-prompt" className="sr-only">
                Video prompt
              </label>
              <Textarea
                id="video-prompt"
                aria-label="Video prompt"
                value={prompt}
                onChange={(e) => {
                  setPrompt(e.target.value);
                  if (formError) setFormError(null);
                }}
                placeholder="Describe your video here..."
                className="bg-storiq-card-bg border-storiq-border text-white placeholder:text-white/40 min-h-[200px] resize-none focus:border-storiq-purple focus:ring-storiq-purple"
                aria-invalid={!!formError}
                aria-describedby={formError ? "prompt-error" : undefined}
              />
              {formError && (
                <Alert
                  variant="destructive"
                  className="mt-2 mb-2"
                  id="prompt-error"
                  tabIndex={-1}
                  role="alert"
                  aria-live="assertive"
                >
                  <AlertTitle>Validation Error</AlertTitle>
                  <AlertDescription>{formError}</AlertDescription>
                </Alert>
              )}
              <div className="flex justify-end mt-4">
                <Button
                  size="sm"
                  className="bg-storiq-purple hover:bg-storiq-purple/80 text-white font-semibold"
                  onClick={handleGenerateScript}
                  aria-label="Generate script from prompt"
                  disabled={scriptStatus === "loading" || !prompt.trim()}
                  tabIndex={0}
                >
                  {scriptStatus === "loading" ? (
                    <span className="flex items-center gap-2">
                      <span
                        className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                        aria-hidden="true"
                      ></span>
                      Generating...
                    </span>
                  ) : (
                    <>🔍 Generate Script</>
                  )}
                </Button>
              </div>
              {/* Script error feedback */}
              {scriptStatus === "error" && scriptError && (
                <Alert
                  variant="destructive"
                  className="mt-2 mb-2"
                  id="script-error"
                  tabIndex={-1}
                  role="alert"
                  aria-live="assertive"
                  ref={(el) => el && el.focus && el.focus()}
                >
                  <AlertTitle>Script Generation Error</AlertTitle>
                  <AlertDescription>{scriptError}</AlertDescription>
                </Alert>
              )}
              {/* Script success feedback */}
              {scriptStatus === "success" && generatedScript && (
                <div
                  className="mt-2 text-green-400 text-sm font-semibold"
                  role="status"
                  tabIndex={-1}
                  aria-live="polite"
                >
                  ✅ Script generated successfully!
                </div>
              )}
            </div>
            {/* Generate Video Button */}
            <div className="flex justify-end mt-4 gap-4 items-center">
              <Button
                size="lg"
                className="bg-storiq-purple hover:bg-storiq-purple/80 text-white font-semibold"
                onClick={handleGenerateVideo}
                aria-label="Generate video"
                disabled={
                  scriptStatus !== "success" ||
                  videoStatus === "loading" ||
                  !generatedScript
                }
                tabIndex={0}
              >
                {videoStatus === "loading" ? (
                  <span className="flex items-center gap-2">
                    <span
                      className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                      aria-hidden="true"
                    ></span>
                    Generating...
                  </span>
                ) : (
                  <>🎬 Generate Video</>
                )}
              </Button>
              <form onSubmit={handleUploadVideo} className="flex gap-2 items-center">
                <input
                  type="file"
                  accept="video/*"
                  onChange={(e) => {
                    setSelectedFile(e.target.files?.[0] || null);
                    setUploadError(null);
                  }}
                  className="block text-sm text-white file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-storiq-purple/80 file:text-white hover:file:bg-storiq-purple/90"
                  aria-label="Upload video file"
                  disabled={uploading}
                  style={{ maxWidth: 180 }}
                />
                <Button
                  type="submit"
                  size="lg"
                  className="bg-green-600 hover:bg-green-700 text-white font-semibold"
                  disabled={uploading || !selectedFile}
                  aria-label="Upload video"
                >
                  {uploading ? (
                    <span className="flex items-center gap-2">
                      <span
                        className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                        aria-hidden="true"
                      ></span>
                      Uploading...
                    </span>
                  ) : (
                    <>⬆️ Upload</>
                  )}
                </Button>
              </form>
            </div>
            {uploadStatus === "error" && uploadError && (
              <Alert
                variant="destructive"
                className="mt-2 mb-2"
                id="upload-error"
                tabIndex={-1}
                role="alert"
                aria-live="assertive"
              >
                <AlertTitle>Upload Error</AlertTitle>
                <AlertDescription>{uploadError}</AlertDescription>
              </Alert>
            )}
            {uploadStatus === "success" && (
              <div
                className="mt-2 text-green-400 text-sm font-semibold"
                role="status"
                tabIndex={-1}
                aria-live="polite"
              >
                ✅ Video uploaded successfully!
              </div>
            )}

            {/* Generated Script Display */}
            {generatedScript && (
              <div className="mt-8" tabIndex={-1} aria-live="polite">
                <h3 className="text-white text-xl font-bold mb-4">
                  Generated Script
                </h3>
                <div className="bg-storiq-card-bg border border-storiq-border rounded-lg p-4 text-white/80 whitespace-pre-wrap">
                  {generatedScript}
                </div>
              </div>
            )}

            {/* Target Duration */}
            <div>
              <label
                htmlFor="duration-slider"
                className="block text-white text-lg font-medium mb-4"
              >
                Target Duration: {duration[0]}s
              </label>
              <Slider
                id="duration-slider"
                aria-label="Target duration"
                value={duration}
                onValueChange={setDuration}
                max={60}
                min={5}
                step={1}
                className="w-full"
              />
            </div>

            {/* Generation Preset */}
            <div>
              <h3 className="text-white text-xl font-bold mb-4">
                Choose a generation preset
              </h3>
              <div className="flex flex-wrap gap-4 mb-4">
                {presets.map((preset) => (
                  <div key={preset} className="text-center">
                    <button
                      onClick={() => setSelectedPreset(preset)}
                      className={`block w-28 h-20 rounded-lg overflow-hidden mb-2 border-2 transition-colors duration-200 ${
                        selectedPreset === preset
                          ? "border-storiq-purple shadow-md shadow-storiq-purple/20"
                          : "border-storiq-border hover:border-storiq-purple/50"
                      }`}
                      aria-pressed={selectedPreset === preset}
                      aria-label={`Select preset: ${preset}`}
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ")
                          setSelectedPreset(preset);
                      }}
                    >
                      <img
                        src={`https://placehold.co/120x80/1a1a1a/ffffff?text=${preset.replace(
                          / /g,
                          "+"
                        )}`}
                        alt={preset}
                        className="w-full h-full object-cover"
                      />
                    </button>
                    <span
                      className={`text-sm transition-colors ${
                        selectedPreset === preset
                          ? "text-white font-medium"
                          : "text-white/60"
                      }`}
                    >
                      {preset}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Voice Selection */}
            <div>
              <h3 className="text-white text-xl font-bold mb-4">
                Select Voice or Record Yourself
              </h3>
              <div className="flex flex-wrap gap-4 mb-6">
                {voiceOptions.map((option) => (
                  <Button
                    key={option}
                    onClick={() => setSelectedVoice(option)}
                    variant={selectedVoice === option ? "default" : "outline"}
                    className={
                      selectedVoice === option
                        ? "bg-storiq-purple text-white border-storiq-purple"
                        : "bg-storiq-card-bg border-storiq-border text-white/80 hover:bg-storiq-card-bg/80 hover:text-white"
                    }
                    aria-pressed={selectedVoice === option}
                    aria-label={`Select voice: ${option}`}
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ")
                        setSelectedVoice(option);
                    }}
                  >
                    {option}
                  </Button>
                ))}
              </div>

              {/* Search and Filters */}
              {/* Voice search/filter UI removed for clarity and polish */}
            </div>
          </div>
        </div>
        {/* Script History Section */}
        <div className="w-full mt-8">
          <h2 className="text-2xl font-bold text-white mb-4">History</h2>
          {historyLoading ? (
            <div className="text-white/60">Loading history...</div>
          ) : historyError ? (
            <div className="text-red-400">{historyError}</div>
          ) : scriptHistory.length === 0 ? (
            <div className="text-white/40">No script history found.</div>
          ) : (
            <div className="flex flex-col gap-4">
              {scriptHistory.map((item, idx) => {
                const isExpanded = expandedCards[idx] || false;
                const copied = copiedCards[idx] || false;

                const handleCopy = () => {
                  navigator.clipboard.writeText(item.script);
                  setCopiedCards((prev) => {
                    const updated = [...prev];
                    updated[idx] = true;
                    return updated;
                  });
                  setTimeout(() => {
                    setCopiedCards((prev) => {
                      const updated = [...prev];
                      updated[idx] = false;
                      return updated;
                    });
                  }, 1200);
                };

                const handleToggleExpand = () => {
                  setExpandedCards((prev) => {
                    const updated = [...prev];
                    updated[idx] = !updated[idx];
                    return updated;
                  });
                };

                return (
                  <Card
                    key={idx}
                    className="bg-storiq-card-bg border-storiq-border text-white/80 w-full p-4 flex flex-col relative"
                    style={{ minHeight: "80px" }}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-semibold text-white">Prompt:</div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="!text-white !border-storiq-purple hover:!bg-storiq-purple/80"
                          onClick={handleCopy}
                          aria-label="Copy script to clipboard"
                          tabIndex={0}
                        >
                          {copied ? "✅ Copied" : "📋 Copy"}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="!text-white !border-storiq-purple hover:!bg-storiq-purple/80"
                          onClick={handleToggleExpand}
                          aria-label={isExpanded ? "Shrink script" : "Expand script"}
                          tabIndex={0}
                        >
                          {isExpanded ? "▲ Shrink" : "▼ Expand"}
                        </Button>
                      </div>
                    </div>
                    <div className="ml-0 mb-1 break-words">{item.prompt}</div>
                    <div className="mb-1">
                      <span className="font-semibold text-white">Script:</span>
                      <span
                        className={`ml-2 whitespace-pre-wrap break-words flex-1 block transition-all duration-200`}
                        style={{
                          maxHeight: isExpanded ? "none" : "4.5em",
                          overflow: isExpanded ? "visible" : "hidden",
                          display: "block",
                        }}
                      >
                        {item.script}
                      </span>
                    </div>
                    <div className="text-xs text-white/50 mt-1">
                      {new Date(item.createdAt).toLocaleString()}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CreateVideo;
