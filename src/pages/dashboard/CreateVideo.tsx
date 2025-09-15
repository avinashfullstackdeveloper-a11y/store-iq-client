import React, { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";

import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

const mockGeminiVeo3Api = async ({
  prompt,
  duration,
  preset,
  voice,
}: {
  prompt: string;
  duration: number;
  preset: string;
  voice: string;
}): Promise<{ videoUrl: string }> => {
  // Simulate network latency and random error
  await new Promise((res) => setTimeout(res, 2000));
  if (Math.random() < 0.15) {
    throw new Error("Failed to generate video. Please try again.");
  }
  // Return a sample video URL (public domain sample)
  return {
    videoUrl:
      "https://www.w3schools.com/html/mov_bbb.mp4",
  };
};

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

  // Unified status state
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  // Form validation error
  const [formError, setFormError] = useState<string | null>(null);

  const handleGenerateScript = () => {
    if (!prompt.trim()) {
      setFormError("Prompt cannot be empty.");
      return;
    }
    setFormError(null);
    // Simulate script generation based on the prompt
    const simulatedScript = `Generated Script for: "${prompt}"\n\n---\n\nScene 1: [Description based on prompt]\nAction: [Character performs action]\nDialogue: [Character speaks]\n\nScene 2: [Another description]\nAction: [Another action]\nDialogue: [More dialogue]\n\n---\n\nThis is a simulated script. In a real application, this would involve an API call to an AI model.`;
    setGeneratedScript(simulatedScript);
  };

  const handleGenerateVideo = async () => {
    if (!prompt.trim()) {
      setFormError("Prompt cannot be empty.");
      return;
    }
    setFormError(null);
    setStatus("loading");
    setError(null);
    setVideoUrl(null);
    try {
      const res = await mockGeminiVeo3Api({
        prompt,
        duration: duration[0],
        preset: selectedPreset,
        voice: selectedVoice,
      });
      setVideoUrl(res.videoUrl);
      setStatus("success");
    } catch (err: unknown) {
      let message = "Unknown error";
      if (isErrorWithMessage(err)) {
        message = err.message;
      }
      setError(message);
      setStatus("error");
    }
  };

  // --- DATA ---
  const presets = ["Default", "Ghibli Studio", "Educational", "Anime", "Realist"];
  const voiceOptions = ["Voice Library", "Record", "No voice"];

  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Create a new video</h1>
          <p className="text-white/60">Select a tool and pick your options to create your video.</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Side - Video Preview */}
          {/* Removed default image preview as requested */}
          {/* Video Result */}
          <div className="w-full lg:w-96 mt-8">
            {status === "loading" && (
              <Card className="p-4 flex flex-col items-center justify-center border-2 border-storiq-purple/60 shadow-lg shadow-storiq-purple/20">
                <Skeleton className="w-64 h-96 mb-4" />
                <span className="text-storiq-purple font-semibold animate-pulse">Generating video...</span>
              </Card>
            )}
            {status === "error" && error && (
              <Alert variant="destructive" className="mb-4 border-2 border-red-500/60">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {status === "success" && videoUrl && (
              <Card className="p-2 border-2 border-green-500/60 shadow-lg shadow-green-500/10" tabIndex={-1} aria-live="polite">
                <video
                  src={videoUrl}
                  controls
                  className="rounded-lg w-full aspect-[9/16] bg-black outline-none focus:ring-2 focus:ring-storiq-purple"
                  poster="/src/assets/images/sea.png"
                  tabIndex={0}
                  aria-label="Generated video"
                />
                <div className="mt-2 text-green-400 text-center text-sm font-semibold" role="status">
                  ✅ Video generated successfully!
                </div>
                <div className="text-white/80 text-center text-xs">
                  Video generated by Gemini Veo-3 (mock)
                </div>
              </Card>
            )}
            {status === "idle" && (
              <Card className="p-4 flex flex-col items-center justify-center border border-storiq-border bg-storiq-card-bg">
                <span className="text-white/40">No video generated yet.</span>
              </Card>
            )}
          </div>

          {/* Right Side - Controls */}
          <div className="flex-1 space-y-8">
            {/* Video Prompt */}
            <div>
              <h3 className="text-white text-xl font-bold mb-4">Your video prompt</h3>
              <p className="text-white/60 text-sm mb-4">
                Use natural language to describe what you want to see in the video. AI will generate a script based on your prompt.
              </p>
              <label htmlFor="video-prompt" className="sr-only">
                Video prompt
              </label>
              <Textarea
                id="video-prompt"
                aria-label="Video prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
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
                  disabled={status === "loading"}
                >
                  🔍 Generate Script
                </Button>
              </div>
            </div>
            {/* Generate Video Button */}
            <div className="flex justify-end mt-4">
              <Button
                size="lg"
                className="bg-storiq-purple hover:bg-storiq-purple/80 text-white font-semibold"
                onClick={handleGenerateVideo}
                aria-label="Generate video"
                disabled={status === "loading"}
                tabIndex={0}
              >
                {status === "loading" ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" aria-hidden="true"></span>
                    Generating...
                  </span>
                ) : (
                  <>
                    🎬 Generate Video
                  </>
                )}
              </Button>
            </div>

            {/* Generated Script Display */}
            {generatedScript && (
              <div className="mt-8">
                <h3 className="text-white text-xl font-bold mb-4">Generated Script</h3>
                <div className="bg-storiq-card-bg border border-storiq-border rounded-lg p-4 text-white/80 whitespace-pre-wrap">
                  {generatedScript}
                </div>
              </div>
            )}

            {/* Target Duration */}
            <div>
              <label htmlFor="duration-slider" className="block text-white text-lg font-medium mb-4">
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
              <h3 className="text-white text-xl font-bold mb-4">Choose a generation preset</h3>
              <div className="flex flex-wrap gap-4 mb-4">
                {presets.map((preset) => (
                  <div key={preset} className="text-center">
                    <button
                      onClick={() => setSelectedPreset(preset)}
                      className={`block w-28 h-20 rounded-lg overflow-hidden mb-2 border-2 transition-colors duration-200 ${selectedPreset === preset ? "border-storiq-purple shadow-md shadow-storiq-purple/20" : "border-storiq-border hover:border-storiq-purple/50"}`}
                      aria-pressed={selectedPreset === preset}
                      aria-label={`Select preset: ${preset}`}
                      tabIndex={0}
                      onKeyDown={e => {
                        if (e.key === "Enter" || e.key === " ") setSelectedPreset(preset);
                      }}
                    >
                      <img
                        src={`https://placehold.co/120x80/1a1a1a/ffffff?text=${preset.replace(/ /g, '+')}`}
                        alt={preset}
                        className="w-full h-full object-cover"
                      />
                    </button>
                    <span className={`text-sm transition-colors ${selectedPreset === preset ? "text-white font-medium" : "text-white/60"}`}>
                      {preset}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Voice Selection */}
            <div>
              <h3 className="text-white text-xl font-bold mb-4">Select Voice or Record Yourself</h3>
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
                    onKeyDown={e => {
                      if (e.key === "Enter" || e.key === " ") setSelectedVoice(option);
                    }}
                  >
                    {option}
                  </Button>
                ))}
              </div>

              {/* Search and Filters */}
              <div className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-[200px]">
                  <label htmlFor="voice-search" className="sr-only">
                    Search voices
                  </label>
                  <input
                    id="voice-search"
                    type="text"
                    placeholder="Search voices..."
                    className="w-full bg-storiq-card-bg border border-storiq-border rounded-lg px-4 py-2 text-white placeholder:text-white/40 focus:border-storiq-purple focus:ring-storiq-purple"
                    aria-label="Search voices"
                  />
                </div>
                <Button variant="outline" className="border-storiq-border bg-storiq-card-bg text-white/80 hover:text-white">
                  🔽 Filters
                </Button>
                <Button variant="outline" className="border-storiq-border bg-storiq-card-bg text-white/80 hover:text-white">
                  🔄 Reset
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CreateVideo;
