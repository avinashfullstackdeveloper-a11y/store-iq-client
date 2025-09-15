import React, { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";

const CreateVideo = () => {
  // --- STATE MANAGEMENT ---
  const [prompt, setPrompt] = useState(
    `Create a video about sustainable living tips.

Feature a young female character.

Each scene should have a different background. Use a modern sans-serif font and vibrant nature visuals.`
  );
  const [duration, setDuration] = useState([30]);
  const [selectedPreset, setSelectedPreset] = useState("Default");
  const [selectedVoice, setSelectedVoice] = useState("Voice Library");
  const [generatedScript, setGeneratedScript] = useState<string | null>(null); // New state for generated script

  const handleGenerateScript = () => {
    // Simulate script generation based on the prompt
    const simulatedScript = `Generated Script for: "${prompt}"\n\n---\n\nScene 1: [Description based on prompt]\nAction: [Character performs action]\nDialogue: [Character speaks]\n\nScene 2: [Another description]\nAction: [Another action]\nDialogue: [More dialogue]\n\n---\n\nThis is a simulated script. In a real application, this would involve an API call to an AI model.`;
    setGeneratedScript(simulatedScript);
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
          <div className="w-full lg:w-96">
            <div className="rounded-2xl aspect-[9/16] relative overflow-hidden shadow-lg bg-cover bg-center" style={{ backgroundImage: `url('/src/assets/images/sea.png')` }}>
              {/* Image from src/assets/images/sea.png */}
              <div className="absolute inset-0 bg-black/20"></div>
              <div className="absolute bottom-4 left-4 right-4">
                <div className="bg-black/60 backdrop-blur-sm rounded-full p-3 flex items-center justify-center">
                  <button className="text-white text-2xl" aria-label="Play Video Preview">▶️</button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Controls */}
          <div className="flex-1 space-y-8">
            {/* Video Prompt */}
            <div>
              <h3 className="text-white text-xl font-bold mb-4">Your video prompt</h3>
              <p className="text-white/60 text-sm mb-4">
                Use natural language to describe what you want to see in the video. AI will generate a script based on your prompt.
              </p>
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe your video here..."
                className="bg-storiq-card-bg border-storiq-border text-white placeholder:text-white/40 min-h-[200px] resize-none focus:border-storiq-purple focus:ring-storiq-purple"
              />
              <div className="flex justify-end mt-4">
                <Button
                  size="sm"
                  className="bg-storiq-purple hover:bg-storiq-purple/80 text-white font-semibold"
                  onClick={handleGenerateScript} // Add onClick handler
                >
                  🔍 Search
                </Button>
              </div>
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
              <h3 className="text-white text-lg font-medium mb-4">Target Duration: {duration[0]}s</h3>
              <Slider
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
                  >
                    {option}
                  </Button>
                ))}
              </div>

              {/* Search and Filters */}
              <div className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-[200px]">
                  <input
                    type="text"
                    placeholder="Search voices..."
                    className="w-full bg-storiq-card-bg border border-storiq-border rounded-lg px-4 py-2 text-white placeholder:text-white/40 focus:border-storiq-purple focus:ring-storiq-purple"
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
