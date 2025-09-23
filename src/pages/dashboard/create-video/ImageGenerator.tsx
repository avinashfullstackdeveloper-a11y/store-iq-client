// ImageGenerator.tsx
import React, { useState, useEffect, useRef } from "react";
import henryPrompt from "@/assets/images/henry-prompt.webp";
import bearPrompt from "@/assets/images/bear-prompt.webp";
import spritePrompt from "@/assets/images/sprite-prompt.webp";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Loader from "@/components/ui/Loader";
import { authFetch } from "@/lib/authFetch";
import {
  Download,
  RefreshCw,
  Sparkles,
  Wand2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const ImageGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generationCount, setGenerationCount] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Default images for shuffle with descriptions
  const defaultImages = [
    {
      src: henryPrompt,
      description:
        "Close-up hyper-realistic portrait of Henry Cavill de **terno azul** Background: frozen battleground, falling snow, cold mist. Lighting: cool blue rim light, cinematic contrast, shallow depth of field, ultra-sharp details.",
    },
    {
      src: bearPrompt,
      description:
        "A majestic bear standing on its hind legs in a dense forest, with rays of sunlight filtering through the trees, creating a mystical atmosphere. The bear's fur is detailed and textured, showcasing the power and beauty of wildlife.",
    },
    {
      src: spritePrompt,
      description:
        "A highly creative and dynamic digital artwork of a Sprite soda can, sliced into floating segments, with realistic ice cubes, realistic lime and lemon fruit slices and splashes bursting out. The background is a smooth gradient of vibrant green, giving an energetic and refreshing feel.",
    },
  ];

  const [currentImageIdx, setCurrentImageIdx] = useState(0);
  const [nextImageIdx, setNextImageIdx] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const imageContainerRef = useRef<HTMLDivElement>(null);

  // Example prompt suggestions
  const promptSuggestions = [
    "A mystical forest with glowing mushrooms and fireflies",
    "Cyberpunk cityscape at night with neon lights",
    "Majestic dragon soaring above medieval castle",
    "Underwater temple with sunbeams filtering through",
    "Steampunk airship flying through clouds",
  ];

  // Smooth image transition effect
  useEffect(() => {
    if (imageUrl || loading || error) return;

    const transitionImages = () => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentImageIdx(nextImageIdx);
        setNextImageIdx((nextImageIdx + 1) % defaultImages.length);
        setTimeout(() => setIsTransitioning(false), 100);
      }, 500);
    };

    const interval = setInterval(transitionImages, 4000);
    return () => clearInterval(interval);
  }, [imageUrl, loading, error, nextImageIdx]);

  // Manual navigation for default images
  const navigateImage = (direction: "prev" | "next") => {
    if (imageUrl || loading || error) return;

    setIsTransitioning(true);
    setTimeout(() => {
      if (direction === "next") {
        setCurrentImageIdx((currentImageIdx + 1) % defaultImages.length);
        setNextImageIdx((currentImageIdx + 2) % defaultImages.length);
      } else {
        setCurrentImageIdx(
          (currentImageIdx - 1 + defaultImages.length) % defaultImages.length
        );
        setNextImageIdx((currentImageIdx + 1) % defaultImages.length);
      }
      setTimeout(() => setIsTransitioning(false), 100);
    }, 500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setImageUrl(null);
    setImageLoaded(false);

    if (!prompt.trim()) {
      setError("Please enter a prompt.");
      return;
    }

    setLoading(true);
    try {
      const res = await authFetch("/api/ai/generate-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data?.error || "Failed to generate image.");
        setLoading(false);
        return;
      }

      const data = await res.json();
      if (data?.imageUrl) {
        setImageUrl(data.imageUrl);
        setGenerationCount((prev) => prev + 1);
      } else {
        setError("No image returned from server.");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setPrompt(suggestion);
  };

  const handleRegenerate = () => {
    if (prompt.trim()) {
      handleSubmit(new Event("submit") as React.FormEvent);
    }
  };

  const handleDownload = () => {
    if (imageUrl) {
      const link = document.createElement("a");
      link.href = imageUrl;
      link.download = `generated-image-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  return (
    <div className="p-2 sm:p-4 md:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <Sparkles className="w-8 h-8 text-storiq-purple animate-pulse" />
          AI Image Generator
        </h1>
        <p className="text-white/60 text-base md:text-lg">
          Transform your imagination into stunning visuals with AI
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 md:gap-8">
        {/* Left Column - Prompt Input */}
        <div className="flex flex-col gap-6 md:gap-8 h-full w-full lg:w-[40%] max-lg:mb-4 overflow-y-auto lg:max-h-[calc(100vh-120px)] pr-0 lg:pr-2">
          <div className="bg-storiq-card-bg/50 border-storiq-border rounded-2xl shadow-2xl p-6 mb-0 backdrop-blur-sm">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-3">
                <label
                  className="text-white font-medium flex items-center gap-2"
                  htmlFor="prompt"
                >
                  <Wand2 className="w-4 h-4 text-storiq-purple" />
                  Describe your vision
                </label>
                <Input
                  id="prompt"
                  type="text"
                  placeholder="A beautiful landscape with mountains and lakes at sunset..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  disabled={loading}
                  autoFocus
                  className="bg-storiq-card-bg border-storiq-border text-white placeholder:text-white/40 h-12 text-base transition-all duration-200 focus:ring-2 focus:ring-storiq-purple/50 focus:border-storiq-purple"
                />
              </div>

              {/* Prompt Suggestions */}
              <div className="space-y-3">
                <p className="text-sm text-gray-400 flex items-center gap-2">
                  <Sparkles className="w-3 h-3" />
                  Try these ideas:
                </p>
                <div className="flex flex-wrap gap-2">
                  {promptSuggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleSuggestionClick(suggestion)}
                      disabled={loading}
                      className="px-3 py-2 text-sm bg-gray-800/50 hover:bg-gray-700/70 text-gray-300 rounded-lg border border-gray-700 transition-all duration-200 hover:border-storiq-purple/50 hover:scale-105 disabled:opacity-50 hover:shadow-lg hover:shadow-storiq-purple/10"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading || !prompt.trim()}
                className="w-full bg-gradient-to-r from-storiq-purple to-storiq-purple/80 hover:from-storiq-purple/90 hover:to-storiq-purple/70 text-white font-semibold h-12 text-base transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-storiq-purple/20"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Generating...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Create Image
                  </span>
                )}
              </Button>
            </form>
          </div>
        </div>

        {/* Right Column - Results */}
        <div className="w-full lg:w-[60%] flex-shrink-0">
          <div className="bg-storiq-card-bg/50 border-storiq-border rounded-2xl shadow-2xl p-6 h-full flex flex-col mx-auto backdrop-blur-sm">
            {loading && (
              <div className="flex flex-col items-center justify-center py-12 space-y-4 animate-fade-in">
                <div className="w-full max-w-md mx-auto flex justify-center">
                  <Loader message="Painting your vision..." size="small" overlay={false} />
                </div>
                <p className="text-gray-400 text-sm animate-pulse">
                  This may take a few moments...
                </p>
              </div>
            )}

            {error && (
              <div className="flex flex-col items-center justify-center py-8 space-y-4 animate-fade-in">
                <div className="p-3 bg-red-500/10 rounded-full animate-bounce">
                  <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center">
                    <span className="text-white text-sm font-bold">!</span>
                  </div>
                </div>
                <div className="text-red-400 text-center font-medium">
                  {error}
                </div>
                <Button
                  onClick={handleRegenerate}
                  variant="outline"
                  className="border-red-500/50 text-red-400 hover:bg-red-500/10 transition-all duration-200"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
              </div>
            )}

            {imageUrl && !loading && (
              <div className="space-y-6 animate-fade-in">
                {/* Image Preview */}
                <div className="relative group">
                  <div className="rounded-xl overflow-hidden border-2 border-gray-700 bg-gradient-to-br from-gray-900 to-black relative">
                    <img
                      src={imageUrl}
                      alt={`Generated: ${prompt}`}
                      className={`w-full h-auto max-h-96 object-contain transition-all duration-700 ${
                        imageLoaded
                          ? "opacity-100 scale-100"
                          : "opacity-0 scale-105"
                      }`}
                      onLoad={handleImageLoad}
                    />
                    {!imageLoaded && (
                      <div className="absolute inset-0 flex items-center justify-center bg-gray-900/50">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-storiq-purple"></div>
                      </div>
                    )}
                  </div>

                  {/* Floating Action Buttons */}
                  <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                    <Button
                      onClick={handleDownload}
                      size="sm"
                      className="bg-black/80 hover:bg-black text-white backdrop-blur-sm border border-gray-600 transition-transform duration-200 hover:scale-110"
                      title="Download image"
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={handleRegenerate}
                      size="sm"
                      className="bg-black/80 hover:bg-black text-white backdrop-blur-sm border border-gray-600 transition-transform duration-200 hover:scale-110"
                      title="Regenerate image"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Image Info and Actions */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <span className="bg-gray-800/50 px-3 py-1 rounded-full">
                      Generation #{generationCount}
                    </span>
                    <a
                      href={imageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-storiq-purple hover:text-storiq-purple/80 underline transition-colors flex items-center gap-1"
                    >
                      View full resolution
                    </a>
                  </div>

                  <Button
                    onClick={handleRegenerate}
                    variant="outline"
                    className="border-storiq-purple/50 text-storiq-purple hover:bg-storiq-purple/10 transition-all duration-200"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Generate Another
                  </Button>
                </div>

                {/* Prompt Used */}
                <div className="bg-gray-900/30 rounded-lg p-4 border border-gray-800 transition-all duration-200 hover:border-gray-700">
                  <p className="text-xs text-gray-400 mb-2 flex items-center gap-1">
                    <Wand2 className="w-3 h-3" />
                    Prompt used:
                  </p>
                  <p className="text-sm text-gray-300 font-medium leading-relaxed">
                    {prompt}
                  </p>
                </div>
              </div>
            )}

            {!imageUrl && !loading && !error && (
              <div className="flex flex-col items-center justify-center py-8 text-center space-y-6">
                <div className="relative w-full max-w-md">
                  {/* Navigation Arrows */}
                  <button
                    onClick={() => navigateImage("prev")}
                    disabled={isTransitioning}
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 z-20 bg-black/50 hover:bg-black/70 backdrop-blur-sm rounded-full p-2 transition-all duration-200 disabled:opacity-50 border border-gray-600"
                  >
                    <ChevronLeft className="w-5 h-5 text-white" />
                  </button>

                  <button
                    onClick={() => navigateImage("next")}
                    disabled={isTransitioning}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 z-20 bg-black/50 hover:bg-black/70 backdrop-blur-sm rounded-full p-2 transition-all duration-200 disabled:opacity-50 border border-gray-600"
                  >
                    <ChevronRight className="w-5 h-5 text-white" />
                  </button>

                  {/* Image Container with Transition */}
                  <div
                    ref={imageContainerRef}
                    className="relative bg-gradient-to-br from-storiq-purple/10 to-blue-500/10 rounded-2xl p-6 transition-all duration-500"
                  >
                    <div className="relative h-64 sm:h-80">
                      {/* Current Image */}
                      <img
                        src={defaultImages[currentImageIdx].src}
                        alt="Prompt example"
                        className={`absolute inset-0 w-full h-full object-contain rounded-xl transition-all duration-500 ease-in-out ${
                          isTransitioning
                            ? "opacity-0 scale-95"
                            : "opacity-100 scale-100"
                        }`}
                        style={{
                          boxShadow: "0 8px 40px 0 rgba(80,80,120,0.15)",
                        }}
                      />

                      {/* Next Image */}
                      <img
                        src={defaultImages[nextImageIdx].src}
                        alt="Next prompt example"
                        className={`absolute inset-0 w-full h-full object-contain rounded-xl transition-all duration-500 ease-in-out ${
                          isTransitioning
                            ? "opacity-100 scale-100"
                            : "opacity-0 scale-105"
                        }`}
                        style={{
                          boxShadow: "0 8px 40px 0 rgba(80,80,120,0.15)",
                        }}
                      />
                    </div>

                    <div className="mt-6 px-2">
                      <h4 className="text-white/60 text-base font-semibold mb-3 text-center flex items-center justify-center gap-2">
                        <Sparkles className="w-4 h-4 text-storiq-purple" />
                        Example Prompt
                      </h4>
                      <p className="text-xs sm:text-sm text-gray-300 font-medium text-center leading-relaxed transition-opacity duration-300">
                        {defaultImages[currentImageIdx].description}
                      </p>
                    </div>
                  </div>

                  {/* Dots Indicator */}
                  <div className="flex justify-center mt-4 space-x-2">
                    {defaultImages.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          if (index !== currentImageIdx) {
                            setIsTransitioning(true);
                            setTimeout(() => {
                              setCurrentImageIdx(index);
                              setNextImageIdx(
                                (index + 1) % defaultImages.length
                              );
                              setTimeout(() => setIsTransitioning(false), 100);
                            }, 500);
                          }
                        }}
                        className={`w-2 h-2 rounded-full transition-all duration-300 ${
                          index === currentImageIdx
                            ? "bg-storiq-purple w-6"
                            : "bg-gray-600 hover:bg-gray-500"
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <p className="text-gray-500 text-sm animate-pulse">
                  ✨ Enter your prompt above to create amazing images
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer Stats */}
      {(imageUrl || loading) && (
        <div className="text-center mt-6 animate-fade-in">
          <p className="text-xs text-gray-500 flex items-center justify-center gap-2">
            <Sparkles className="w-3 h-3" />
            Powered by AI • Images are generated on-demand
          </p>
        </div>
      )}
    </div>
  );
};

export default ImageGenerator;
