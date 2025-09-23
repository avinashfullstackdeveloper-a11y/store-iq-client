// ImageGenerator.tsx
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Loader from "@/components/ui/Loader";
import { authFetch } from "@/lib/authFetch";

const ImageGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setImageUrl(null);
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
      } else {
        setError("No image returned from server.");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-storiq-card-bg rounded-xl shadow">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="text-white font-medium" htmlFor="prompt">
          Image Prompt
        </label>
        <Input
          id="prompt"
          type="text"
          placeholder="Describe your image..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          disabled={loading}
          autoFocus
        />
        <Button type="submit" disabled={loading || !prompt.trim()}>
          Generate Image
        </Button>
      </form>
      {loading && <Loader message="Generating image..." />}
      {error && (
        <div className="mt-4 text-red-500 text-center font-medium">{error}</div>
      )}
      {imageUrl && !loading && (
        <div className="mt-6 flex flex-col items-center">
          <img
            src={imageUrl}
            alt="Generated"
            className="rounded-lg border border-storiq-border max-w-full max-h-96"
            style={{ background: "#222", objectFit: "contain" }}
          />
          <a
            href={imageUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 text-storiq-purple underline text-sm"
          >
            Open full image
          </a>
        </div>
      )}
    </div>
  );
};

export default ImageGenerator;