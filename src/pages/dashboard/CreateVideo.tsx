import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";

import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

// const mockGeminiVeo3Api = async ({
//   prompt,
//   duration,
//   preset,
//   voice,
// }: {
//   prompt: string;
//   duration: number;
//   preset: string;
//   voice: string;
// }): Promise<{ videoUrl: string }> => {
//   // Simulate network latency and random error
//   await new Promise((res) => setTimeout(res, 2000));
//   if (Math.random() < 0.15) {
//     throw new Error("Failed to generate video. Please try again.");
//   }
//   // Return a sample video URL (public domain sample)
//   return {
//     videoUrl:
//       "https://www.w3schools.com/html/mov_bbb.mp4",
//   };
// };

function isErrorWithMessage(err: unknown): err is { message: string } {
  return (
    typeof err === "object" &&
    err !== null &&
    "message" in err &&
    typeof (err as { message?: unknown }).message === "string"
  );
}

const CreateVideo = () => {
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

  useEffect(() => {
    setHistoryLoading(true);
    setHistoryError(null);
    fetch("/api/scripts/history?userId=demo-user")
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
  }, []);

  // --- HANDLERS ---

  // Generate Script: Calls backend API
  const handleGenerateScript = async () => {
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
      fetch("/api/scripts/history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: "demo-user",
          prompt,
          script: data.script,
        }),
      }).catch(() => {
        // Silently ignore errors for history saving
      });
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
          <div className="w-full lg:w-96 mt-8">
            {videoStatus === "loading" && (
              <Card className="p-4 flex flex-col items-center justify-center border-2 border-storiq-purple/60 shadow-lg shadow-storiq-purple/20">
                <Skeleton className="w-64 h-96 mb-4" />
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
              <Card
                className="p-2 border-2 border-green-500/60 shadow-lg shadow-green-500/10"
                tabIndex={-1}
                aria-live="polite"
              >
                <video
                  src={videoUrl}
                  controls
                  className="rounded-lg w-full aspect-[9/16] bg-black outline-none focus:ring-2 focus:ring-storiq-purple"
                  poster="/src/assets/images/sea.png"
                  tabIndex={0}
                  aria-label="Generated video"
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
                <div className="flex justify-center mt-2">
                  <Button
                    size="sm"
                    variant="destructive"
                    className="bg-red-600 hover:bg-red-700 text-white font-semibold"
                    onClick={handleDeleteVideo}
                    disabled={deleteStatus === "loading"}
                    aria-label="Delete video"
                  >
                    {deleteStatus === "loading" ? (
                      <span className="flex items-center gap-2">
                        <span
                          className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                          aria-hidden="true"
                        ></span>
                        Deleting...
                      </span>
                    ) : (
                      <>🗑️ Delete</>
                    )}
                  </Button>
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
              </Card>
            )}
            {videoStatus === "idle" && (
              <Card className="p-4 flex flex-col items-center justify-center border border-storiq-border bg-storiq-card-bg">
                <span className="text-white/40">No video generated yet.</span>
              </Card>
            )}
          </div>

          {/* Script History Section */}
          <div className="w-full lg:w-96 mt-8">
            <h2 className="text-2xl font-bold text-white mb-4">History</h2>
            {historyLoading ? (
              <div className="text-white/60">Loading history...</div>
            ) : historyError ? (
              <div className="text-red-400">{historyError}</div>
            ) : scriptHistory.length === 0 ? (
              <div className="text-white/40">No script history found.</div>
            ) : (
              <div className="flex flex-col gap-4 max-h-96 overflow-y-auto">
                {scriptHistory.map((item, idx) => (
                  <div
                    key={idx}
                    className="bg-storiq-card-bg border border-storiq-border rounded-lg p-4 text-white/80"
                  >
                    <div className="mb-2">
                      <span className="font-semibold text-white">Prompt:</span>
                      <span className="ml-2">{item.prompt}</span>
                    </div>
                    <div className="mb-2">
                      <span className="font-semibold text-white">Script:</span>
                      <span className="ml-2 whitespace-pre-wrap break-words">
                        {item.script}
                      </span>
                    </div>
                    <div className="text-xs text-white/50">
                      {new Date(item.createdAt).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
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
            <div className="flex justify-end mt-4">
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
            </div>

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
      </div>
    </DashboardLayout>
  );
};

export default CreateVideo;
