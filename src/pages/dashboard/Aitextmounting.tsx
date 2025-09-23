import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import DashboardLayout from "@/components/DashboardLayout";
import AdvancedVideoPlayer from "@/components/AdvancedVideoPlayer";
import { AspectRatio } from "@/components/ui/aspect-ratio";

interface Video {
  id: string;
  url: string;
  title?: string;
}

export default function TextToSpeech() {
  const [text, setText] = useState("");
  const [voices, setVoices] = useState<any[]>([]);
  const [selectedVoice, setSelectedVoice] = useState("");
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [loadingAudio, setLoadingAudio] = useState(false);

  const [videos, setVideos] = useState<Video[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [mountedVideo, setMountedVideo] = useState<Video | null>(null);
  const [loadingMount, setLoadingMount] = useState(false);
  const [loadingVideos, setLoadingVideos] = useState(false);

  const token = localStorage.getItem("token");

  const fetchWithAuth = (url: string, options: RequestInit = {}) => {
    const headers = options.headers || {};
    if (token) headers["Authorization"] = `Bearer ${token}`;
    return fetch(url, { ...options, headers, credentials: "include" });
  };

  // Fetch voices
  useEffect(() => {
    fetchWithAuth(`${import.meta.env.VITE_API_BASE_URL}/video-tts/voices`)
      .then((res) => res.json())
      .then((data) => {
        setVoices(data.voices || []);
        if (data.voices?.length) setSelectedVoice(data.voices[0].voice_id || data.voices[0].voiceId);
      })
      .catch(console.error);
  }, []);

  // Fetch user's videos
  const fetchVideos = async () => {
    setLoadingVideos(true);
    try {
      const res = await fetchWithAuth(`${import.meta.env.VITE_API_BASE_URL}/api/videos`);
      if (!res.ok) throw new Error("Failed to fetch videos");
      const videoArray: Video[] = await res.json();
      setVideos(videoArray);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch videos");
    } finally {
      setLoadingVideos(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  // Generate TTS audio
  const generateAudio = async () => {
    if (!text.trim()) return alert("Please enter text!");
    setLoadingAudio(true);
    setAudioUrl(null);

    try {
      const audioRes = await fetchWithAuth(`${import.meta.env.VITE_API_BASE_URL}/video-tts/tts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, voiceId: selectedVoice }),
      });

      if (!audioRes.ok) throw new Error("TTS request failed");
      const audioBlob = await audioRes.blob();
      setAudioUrl(URL.createObjectURL(audioBlob));
    } catch (err) {
      console.error(err);
      alert("Something went wrong with audio generation");
    } finally {
      setLoadingAudio(false);
    }
  };

  // Mount selected video with audio
  // Mount selected video with audio (updated)
const mountVideoWithAudio = async () => {
  if (!selectedVideo) return alert("Select a video first");
  if (!audioUrl) return alert("Generate audio first");

  setLoadingMount(true);

  try {
    // Step 1: Fetch the audio blob from the local object URL
    const audioBlob = await fetch(audioUrl).then((res) => res.blob());

    // Step 2: Upload audio to backend (or S3) to get a public URL
    const formData = new FormData();
    formData.append("file", audioBlob, "tts-audio.mp3");

    const uploadRes = await fetchWithAuth(`${import.meta.env.VITE_API_BASE_URL}/api/upload-audio`, {
      method: "POST",
      body: formData,
    });

    if (!uploadRes.ok) throw new Error("Audio upload failed");
    const { url: publicAudioUrl } = await uploadRes.json();

    // Step 3: Prepare request body with public audio URL
    const requestBody = {
      videoUrl: selectedVideo.url,
      audioUrl: publicAudioUrl, // use the uploaded audio URL
    };

    console.log("Sending request to /api/video/mount-audio with:");
    console.log("URL:", `${import.meta.env.VITE_API_BASE_URL}/api/video/mount-audio`);
    console.log("Method: POST");
    console.log("Headers:", {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    });
    console.log("Body:", requestBody);

    // Step 4: Send mount request
    const res = await fetchWithAuth(`${import.meta.env.VITE_API_BASE_URL}/api/video/mount-audio`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
      credentials: "include",
    });

    console.log("Response object:", res);
    if (!res.ok) throw new Error("Failed to mount video with audio");

    const data = await res.json();
    setMountedVideo({ id: data.s3Key, url: data.url, title: "Mounted Video" });

    // Refresh videos
    fetchVideos();
  } catch (err) {
    console.error(err);
    alert("Failed to mount video with audio");
  } finally {
    setLoadingMount(false);
  }
};



  return (
    <DashboardLayout>
      <div className="p-6 space-y-4">
        <h2 className="text-xl font-bold text-white">AI Voice Mounting + Video</h2>

        <textarea
          className="w-full border rounded p-2"
          placeholder="Enter text..."
          rows={5}
          value={text}
          onChange={(e) => setText(e.target.value)}
        />

        <div>
          <label className="block mb-1 font-semibold text-white">Select Voice:</label>
          <select
            value={selectedVoice}
            onChange={(e) => setSelectedVoice(e.target.value)}
            className="w-full border rounded p-2 bg-black text-white"
          >
            {voices.map((v) => (
              <option key={v.voice_id || v.voiceId} value={v.voice_id || v.voiceId}>
                {v.name}
              </option>
            ))}
          </select>
        </div>

        <Button onClick={generateAudio} disabled={loadingAudio}>
          {loadingAudio ? "Generating Audio..." : "Generate Audio"}
        </Button>

        {audioUrl && (
          <div>
            <h3 className="mt-2 font-semibold text-white">Generated Audio</h3>
            <audio controls src={audioUrl} className="w-full" />
          </div>
        )}

        {videos.length > 0 && (
          <div className="mt-4">
            <h3 className="font-semibold text-white mb-2">Select Video to Mount</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {videos.map((video) => (
                <AspectRatio
                  key={video.id}
                  ratio={16 / 9}
                  className={`bg-black rounded-lg overflow-hidden border-2 cursor-pointer ${
                    selectedVideo?.id === video.id ? "border-blue-500" : "border-transparent"
                  }`}
                  onClick={() => setSelectedVideo(video)}
                >
                  <AdvancedVideoPlayer src={video.url} className="w-full h-full" />
                </AspectRatio>
              ))}
            </div>
          </div>
        )}

        <Button
          onClick={mountVideoWithAudio}
          disabled={!selectedVideo || !audioUrl || loadingMount}
        >
          {loadingMount ? "Mounting Video..." : "Mount Video with Audio"}
        </Button>

        {mountedVideo && (
          <div className="mt-4">
            <h3 className="font-semibold text-white mb-2">Mounted Video</h3>
            <AspectRatio ratio={16 / 9} className="bg-black rounded-lg overflow-hidden">
              <AdvancedVideoPlayer src={mountedVideo.url} className="w-full h-full" />
            </AspectRatio>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
