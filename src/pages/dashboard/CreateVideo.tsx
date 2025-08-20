import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";

const CreateVideo = () => {
  const presets = [
    { name: "Default", image: "/api/placeholder/120/80" },
    { name: "Ghibli Studio", image: "/api/placeholder/120/80" },
    { name: "Educational", image: "/api/placeholder/120/80" },
    { name: "Anime", image: "/api/placeholder/120/80" },
    { name: "Realist", image: "/api/placeholder/120/80" }
  ];

  const voiceOptions = ["Voice Library", "Record", "No voice"];

  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Create a new video</h1>
          <p className="text-white/60">Select a tool and pick your options to create your video.</p>
        </div>

        <div className="flex gap-8">
          {/* Left Side - Video Preview */}
          <div className="w-96">
            <div className="bg-gradient-to-b from-blue-400 to-blue-600 rounded-2xl aspect-[9/16] relative overflow-hidden">
              {/* Video preview placeholder */}
              <div className="absolute inset-0 bg-black/20"></div>
              <div className="absolute bottom-4 left-4 right-4">
                <div className="bg-black/60 backdrop-blur-sm rounded-full p-3 flex items-center justify-center">
                  <button className="text-white text-2xl">▶️</button>
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
                placeholder="Create a video about sustainable living tips.

Feature a young female character.

Each scene should have a different background. Use a modern sans-serif font and vibrant nature visuals."
                className="bg-storiq-card-bg border-storiq-border text-white placeholder:text-white/40 min-h-[200px] resize-none"
              />
              <div className="flex justify-end mt-4">
                <Button size="sm" className="bg-storiq-purple hover:bg-storiq-purple-light text-white">
                  🔍 Search
                </Button>
              </div>
            </div>

            {/* Target Duration */}
            <div>
              <h3 className="text-white text-lg font-medium mb-4">Target Duration: 30s</h3>
              <div className="relative">
                <Slider
                  defaultValue={[30]}
                  max={60}
                  step={1}
                  className="w-full"
                />
              </div>
            </div>

            {/* Generation Preset */}
            <div>
              <h3 className="text-white text-xl font-bold mb-4">Choose a generation preset</h3>
              <div className="flex space-x-4 mb-4">
                {presets.map((preset, index) => (
                  <div key={index} className="text-center">
                    <button className={`block w-24 h-16 rounded-lg overflow-hidden mb-2 border-2 transition-colors ${
                      index === 0 ? "border-storiq-purple" : "border-storiq-border hover:border-storiq-purple/50"
                    }`}>
                      <div className="w-full h-full bg-gradient-to-br from-storiq-blue/30 to-storiq-purple/30"></div>
                    </button>
                    <span className={`text-sm ${index === 0 ? "text-white" : "text-white/60"}`}>
                      {preset.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Voice Selection */}
            <div>
              <h3 className="text-white text-xl font-bold mb-4">Select Voice or Record Yourself</h3>
              <div className="flex space-x-4 mb-6">
                {voiceOptions.map((option, index) => (
                  <Button
                    key={index}
                    className={`${
                      index === 0
                        ? "bg-storiq-purple text-white"
                        : "bg-storiq-card-bg border border-storiq-border text-white hover:bg-storiq-purple/20"
                    }`}
                  >
                    {option}
                  </Button>
                ))}
              </div>

              {/* Search and Filters */}
              <div className="flex space-x-4">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Search"
                    className="w-full bg-storiq-card-bg border border-storiq-border rounded-lg px-4 py-2 text-white placeholder:text-white/40"
                  />
                </div>
                <Button variant="outline" className="border-storiq-border text-white hover:bg-storiq-purple">
                  🔽 Filters
                </Button>
                <Button variant="outline" className="border-storiq-border text-white hover:bg-storiq-purple">
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