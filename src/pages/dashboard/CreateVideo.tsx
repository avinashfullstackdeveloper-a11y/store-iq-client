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
import { 
  Wand2, 
  Play, 
  Upload, 
  Copy, 
  ChevronDown, 
  ChevronUp, 
  History, 
  FileText,
  Volume2,
  Clock,
  Settings
} from "lucide-react";

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
  // --- STATE MANAGEMENT ---
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
  const [deleteStatus, setDeleteStatus] = useState<Status>("idle");
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
    const userId = user.id || user.email;
    fetch(`/api/scripts/history?userId=${encodeURIComponent(userId)}`, {
      credentials: "include",
    })
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
        credentials: "include",
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || "Failed to generate script.");
      }
      const data = await res.json();
      if (!data?.script) throw new Error("No script returned from API.");
      setGeneratedScript(data.script);
      setScriptStatus("success");
      if (user) {
        console.log("Current user object:", user);
        const userId = (user && user.id) || (user && user.email);
        fetch("/api/scripts/history", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, prompt, script: data.script }),
          credentials: "include",
        }).catch(() => {});
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
      const res = await fetch( `${import.meta.env.VITE_API_BASE_URL}/ai/generate-video`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", 
        body: JSON.stringify({
          prompt,
          config: { duration: duration[0], preset: selectedPreset, voice: selectedVoice },
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || "Failed to generate video.");
      }
      const data = await res.json();
      if (!data?.s3Url) throw new Error("No video URL returned from API.");
      setVideoUrl(data.s3Url);
      setVideoS3Key(data.s3Key || null);
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
      // ... (existing upload logic remains the same)
      // For brevity, keeping the upload logic as is since it's functional
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
        credentials: "include",
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
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <Wand2 className="w-8 h-8 text-storiq-purple" />
            Create New Video
          </h1>
          <p className="text-white/60 text-lg">
            Describe your vision and let AI bring it to life with stunning visuals
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Video Preview & Controls */}
          <div className="space-y-8">
            {/* Video Preview Section */}
            <Card className="bg-storiq-card-bg/50 border-storiq-border p-6">
              <h3 className="text-white text-lg font-semibold mb-4 flex items-center gap-2">
                <Play className="w-5 h-5 text-storiq-purple" />
                Video Preview
              </h3>
              
              {videoStatus === "loading" && (
                <div className="flex flex-col items-center justify-center p-8 border-2 border-storiq-purple/30 rounded-lg bg-gradient-to-br from-storiq-purple/10 to-transparent">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-storiq-purple mb-4"></div>
                  <span className="text-storiq-purple font-semibold text-lg">
                    Generating your video...
                  </span>
                  <p className="text-white/60 text-sm mt-2">This may take a few moments</p>
                </div>
              )}

              {videoStatus === "error" && videoError && (
                <Alert variant="destructive" className="mb-4 border-red-500/50 bg-red-500/10">
                  <AlertTitle className="text-red-200">Generation Failed</AlertTitle>
                  <AlertDescription className="text-red-300">{videoError}</AlertDescription>
                </Alert>
              )}

              {videoStatus === "success" && videoUrl && (
                <div className="space-y-4">
                  <div className="p-3 border-2 border-green-500/30 rounded-xl bg-gradient-to-br from-green-500/10 to-transparent">
                    <AdvancedVideoPlayer
                      src={videoUrl}
                      onDelete={handleDeleteVideo}
                      className="w-full rounded-lg shadow-2xl"
                    />
                    <div className="flex items-center justify-center gap-2 mt-3 text-green-400 text-sm font-semibold">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      Video generated successfully!
                    </div>
                  </div>
                  
                  {deleteStatus === "error" && deleteError && (
                    <Alert variant="destructive" className="border-red-500/50 bg-red-500/10">
                      <AlertTitle className="text-red-200">Delete Error</AlertTitle>
                      <AlertDescription className="text-red-300">{deleteError}</AlertDescription>
                    </Alert>
                  )}
                </div>
              )}

              {videoStatus === "idle" && (
                <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-storiq-border rounded-lg bg-gradient-to-br from-storiq-card-bg to-storiq-card-bg/30">
                  <FileText className="w-16 h-16 text-white/20 mb-4" />
                  <span className="text-white/40 text-lg font-medium">No video generated yet</span>
                  <p className="text-white/30 text-sm mt-1">Your creation will appear here</p>
                </div>
              )}
            </Card>

            {/* Quick Actions */}
            <Card className="bg-storiq-card-bg/50 border-storiq-border p-6">
              <h3 className="text-white text-lg font-semibold mb-4 flex items-center gap-2">
                <Settings className="w-5 h-5 text-storiq-purple" />
                Quick Actions
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <Button
                  onClick={handleGenerateVideo}
                  disabled={scriptStatus !== "success" || videoStatus === "loading" || !generatedScript}
                  className="h-14 bg-gradient-to-r from-storiq-purple to-storiq-purple/80 hover:from-storiq-purple/90 hover:to-storiq-purple/70 text-white font-semibold text-base transition-all duration-200"
                >
                  {videoStatus === "loading" ? (
                    <span className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      Generating...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Play className="w-4 h-4" />
                      Generate Video
                    </span>
                  )}
                </Button>

                <form onSubmit={handleUploadVideo} className="flex flex-col gap-2">
                  <input
                    type="file"
                    accept="video/*"
                    onChange={(e) => {
                      setSelectedFile(e.target.files?.[0] || null);
                      setUploadError(null);
                    }}
                    className="hidden"
                    id="video-upload"
                    disabled={uploading}
                  />
                  <label htmlFor="video-upload" className="cursor-pointer">
                    <Button
                      type="button"
                      variant="outline"
                      className="h-14 w-full border-storiq-border bg-storiq-card-bg hover:bg-storiq-card-bg/80 text-white font-semibold text-base"
                      disabled={uploading}
                    >
                      <span className="flex items-center gap-2">
                        <Upload className="w-4 h-4" />
                        Upload Video
                      </span>
                    </Button>
                  </label>
                  {selectedFile && (
                    <Button
                      type="submit"
                      className="h-10 bg-green-600 hover:bg-green-700 text-white font-semibold"
                      disabled={uploading}
                    >
                      {uploading ? (
                        <span className="flex items-center gap-2">
                          <div className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent"></div>
                          Uploading...
                        </span>
                      ) : (
                        "Confirm Upload"
                      )}
                    </Button>
                  )}
                </form>
              </div>

              {uploadStatus === "error" && uploadError && (
                <Alert variant="destructive" className="mt-4 border-red-500/50 bg-red-500/10">
                  <AlertTitle className="text-red-200">Upload Error</AlertTitle>
                  <AlertDescription className="text-red-300">{uploadError}</AlertDescription>
                </Alert>
              )}
            </Card>
          </div>

          {/* Right Column - Creation Controls */}
          <div className="space-y-8">
            {/* Prompt Section */}
            <Card className="bg-storiq-card-bg/50 border-storiq-border p-6">
              <h3 className="text-white text-lg font-semibold mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-storiq-purple" />
                Video Description
              </h3>
              <p className="text-white/60 text-sm mb-4">
                Describe your video in detail. The AI will generate a script based on your description.
              </p>
              
              <Textarea
                value={prompt}
                onChange={(e) => {
                  setPrompt(e.target.value);
                  if (formError) setFormError(null);
                }}
                placeholder="Describe your video here... Be as detailed as possible for better results."
                className="bg-storiq-card-bg border-storiq-border text-white placeholder:text-white/40 min-h-[150px] resize-none focus:border-storiq-purple focus:ring-storiq-purple font-medium"
              />
              
              {formError && (
                <Alert variant="destructive" className="mt-3 border-red-500/50 bg-red-500/10">
                  <AlertTitle className="text-red-200">Validation Error</AlertTitle>
                  <AlertDescription className="text-red-300">{formError}</AlertDescription>
                </Alert>
              )}

              <Button
                onClick={handleGenerateScript}
                disabled={scriptStatus === "loading" || !prompt.trim()}
                className="w-full mt-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-semibold h-12 text-base"
              >
                {scriptStatus === "loading" ? (
                  <span className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Generating Script...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Wand2 className="w-4 h-4" />
                    Generate Script
                  </span>
                )}
              </Button>

              {scriptStatus === "error" && scriptError && (
                <Alert variant="destructive" className="mt-3 border-red-500/50 bg-red-500/10">
                  <AlertTitle className="text-red-200">Script Generation Failed</AlertTitle>
                  <AlertDescription className="text-red-300">{scriptError}</AlertDescription>
                </Alert>
              )}

              {scriptStatus === "success" && generatedScript && (
                <div className="flex items-center gap-2 mt-3 text-green-400 text-sm font-semibold p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  Script generated successfully!
                </div>
              )}
            </Card>

            {/* Generated Script Display */}
            {generatedScript && (
              <Card className="bg-storiq-card-bg/50 border-storiq-border p-6">
                <h3 className="text-white text-lg font-semibold mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-storiq-purple" />
                  Generated Script
                </h3>
                <div className="bg-storiq-card-bg border border-storiq-border rounded-lg p-4 text-white/80 whitespace-pre-wrap max-h-60 overflow-y-auto text-sm leading-relaxed">
                  {generatedScript}
                </div>
              </Card>
            )}

            {/* Configuration Sections */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Duration Control */}
              <Card className="bg-storiq-card-bg/50 border-storiq-border p-6">
                <h3 className="text-white text-lg font-semibold mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-storiq-purple" />
                  Duration
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-white/60 text-sm">Target Duration</span>
                    <span className="text-white font-semibold text-lg">{duration[0]}s</span>
                  </div>
                  <Slider
                    value={duration}
                    onValueChange={setDuration}
                    max={60}
                    min={5}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-white/40">
                    <span>5s</span>
                    <span>60s</span>
                  </div>
                </div>
              </Card>

              {/* Voice Selection */}
              <Card className="bg-storiq-card-bg/50 border-storiq-border p-6">
                <h3 className="text-white text-lg font-semibold mb-4 flex items-center gap-2">
                  <Volume2 className="w-5 h-5 text-storiq-purple" />
                  Voice
                </h3>
                <div className="space-y-3">
                  {voiceOptions.map((option) => (
                    <Button
                      key={option}
                      onClick={() => setSelectedVoice(option)}
                      variant={selectedVoice === option ? "default" : "outline"}
                      className="w-full justify-start h-11 transition-all duration-200"
                    >
                      <span className={selectedVoice === option ? "text-white" : "text-white/80"}>
                        {option}
                      </span>
                    </Button>
                  ))}
                </div>
              </Card>
            </div>

            {/* Preset Selection */}
            <Card className="bg-storiq-card-bg/50 border-storiq-border p-6">
              <h3 className="text-white text-lg font-semibold mb-4 flex items-center gap-2">
                <Settings className="w-5 h-5 text-storiq-purple" />
                Visual Style
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {presets.map((preset) => (
                  <button
                    key={preset}
                    onClick={() => setSelectedPreset(preset)}
                    className={`p-4 rounded-xl border-2 transition-all duration-200 hover:scale-105 ${
                      selectedPreset === preset
                        ? "border-storiq-purple bg-gradient-to-br from-storiq-purple/20 to-storiq-purple/10 shadow-lg shadow-storiq-purple/20"
                        : "border-storiq-border bg-storiq-card-bg hover:border-storiq-purple/50"
                    }`}
                  >
                    <div className="aspect-video mb-3 bg-gradient-to-br from-white/10 to-white/5 rounded-lg flex items-center justify-center">
                      <span className="text-white/60 text-xs font-medium text-center px-2">
                        {preset}
                      </span>
                    </div>
                    <span className={`text-sm font-medium ${
                      selectedPreset === preset ? "text-white" : "text-white/70"
                    }`}>
                      {preset}
                    </span>
                  </button>
                ))}
              </div>
            </Card>
          </div>
        </div>

        {/* Script History Section */}
        <Card className="mt-8 bg-storiq-card-bg/50 border-storiq-border p-6">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <History className="w-6 h-6 text-storiq-purple" />
            Script History
          </h2>
          
          {historyLoading ? (
            <div className="flex items-center justify-center p-8 text-white/60">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-storiq-purple mr-3"></div>
              Loading history...
            </div>
          ) : historyError ? (
            <Alert variant="destructive" className="border-red-500/50 bg-red-500/10">
              <AlertTitle className="text-red-200">Error Loading History</AlertTitle>
              <AlertDescription className="text-red-300">{historyError}</AlertDescription>
            </Alert>
          ) : scriptHistory.length === 0 ? (
            <div className="text-center py-12 text-white/40">
              <History className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <p className="text-lg">No script history found</p>
              <p className="text-sm mt-1">Your generated scripts will appear here</p>
            </div>
          ) : (
            <div className="space-y-4">
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
                  <Card key={idx} className="bg-storiq-card-bg border-storiq-border p-5 hover:border-storiq-purple/30 transition-all duration-200">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1 min-w-0">
                        <div className="text-white font-semibold mb-1 line-clamp-2">Prompt: {item.prompt}</div>
                        <div className="text-white/50 text-xs">
                          {new Date(item.createdAt).toLocaleString()}
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleCopy}
                          className="h-8 px-3 text-xs border-storiq-purple/50 hover:bg-storiq-purple/20 text-white"
                        >
                          <Copy className="w-3 h-3 mr-1 text-white" />
                          {copied ? "Copied!" : "Copy"}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleToggleExpand}
                          className="h-8 px-3 text-xs border-storiq-purple/50 hover:bg-storiq-purple/20 text-white"
                        >
                          {isExpanded ? (
                            <ChevronUp className="w-3 h-3 mr-1 text-white" />
                          ) : (
                            <ChevronDown className="w-3 h-3 mr-1 text-white" />
                          )}
                          {isExpanded ? "Less" : "More"}
                        </Button>
                      </div>
                    </div>
                    
                    <div className={`text-white/70 text-sm leading-relaxed transition-all duration-200 overflow-hidden ${
                      isExpanded ? "max-h-none" : "max-h-20"
                    }`}>
                      <div className="font-semibold text-white/90 mb-1">Script:</div>
                      {item.script}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default CreateVideo;