import React, { useRef, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { 
  Upload, 
  ImageIcon, 
  Loader2, 
  Download, 
  RefreshCw,
  Sparkles,
  CheckCircle2,
  AlertCircle
} from "lucide-react";

const MobImageTool: React.FC = () => {
  const [sceneFile, setSceneFile] = useState<File | null>(null);
  const [objectFile, setObjectFile] = useState<File | null>(null);
  const [compositeImage, setCompositeImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneImgRef = useRef<HTMLImageElement>(new Image());
  const fileInputSceneRef = useRef<HTMLInputElement>(null);
  const fileInputObjectRef = useRef<HTMLInputElement>(null);

  // --- existing handlers (unchanged) ---
  const handleSceneUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSceneFile(file);
      setError(null);
      const img = new Image();
      img.src = URL.createObjectURL(file);
      img.onload = () => {
        sceneImgRef.current = img;
        const canvas = canvasRef.current;
        if (canvas) {
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext("2d");
          if (ctx) ctx.drawImage(img, 0, 0);
        }
      };
    }
  };

  const handleObjectUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setObjectFile(file);
      setError(null);
    }
  };

  const formatBase64Image = (imageData: string) => {
    if (imageData.startsWith("data:image/")) return imageData;
    return `data:image/png;base64,${imageData}`;
  };

  const handleCanvasClick = async (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!sceneFile || !objectFile) {
      setError("Please upload both scene and object images first.");
      return;
    }

    setLoading(true);
    setError(null);

    const canvas = canvasRef.current;
    const rect = canvas?.getBoundingClientRect();
    if (!canvas || !rect) return;

    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const xPercent = ((e.clientX - rect.left) * scaleX / canvas.width) * 100;
    const yPercent = ((e.clientY - rect.top) * scaleY / canvas.height) * 100;

    const maskCanvas = document.createElement("canvas");
    maskCanvas.width = canvas.width;
    maskCanvas.height = canvas.height;
    const maskCtx = maskCanvas.getContext("2d");
    if (!maskCtx) return;

    maskCtx.fillStyle = "black";
    maskCtx.fillRect(0, 0, canvas.width, canvas.height);

    const centerX = (xPercent / 100) * canvas.width;
    const centerY = (yPercent / 100) * canvas.height;
    const gradient = maskCtx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 80);
    gradient.addColorStop(0, "white");
    gradient.addColorStop(0.7, "white");
    gradient.addColorStop(1, "rgba(255,255,255,0.3)");

    maskCtx.beginPath();
    maskCtx.arc(centerX, centerY, 80, 0, Math.PI * 2);
    maskCtx.fillStyle = gradient;
    maskCtx.fill();

    const maskBlob = await new Promise<Blob | null>((resolve) =>
      maskCanvas.toBlob((b) => resolve(b), "image/png")
    );
    if (!maskBlob) return;

    const formData = new FormData();
    formData.append("image", sceneFile);
    formData.append("mask", new File([maskBlob], "mask.png", { type: "image/png" }));
    formData.append(
      "prompt",
      `Seamlessly blend and place the object from the reference image into the scene at the masked location. Match lighting, shadows, and perspective.`
    );
    formData.append("strength", "0.8");
    formData.append("cfg_scale", "7");

    try {
      const res = await fetch("/api/mob-image", { method: "POST", body: formData });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      if (data.image) {
        const formattedImage = formatBase64Image(data.image);
        setCompositeImage(formattedImage);
      } else {
        throw new Error("No image data received from server");
      }
    } catch (err) {
      console.error("Error generating composite image:", err);
      setError(err instanceof Error ? err.message : "Failed to generate composite image.");
    }

    setLoading(false);
  };

  const downloadImage = () => {
    if (!compositeImage) return;
    const link = document.createElement("a");
    link.download = "composite-image.png";
    link.href = compositeImage;
    link.click();
  };

  const resetAll = () => {
    setSceneFile(null);
    setObjectFile(null);
    setCompositeImage(null);
    setError(null);
    if (fileInputSceneRef.current) fileInputSceneRef.current.value = "";
    if (fileInputObjectRef.current) fileInputObjectRef.current.value = "";
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  return (
    <DashboardLayout>
      <div className="p-8">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            AI Image Composer
          </h1>
          <p className="text-gray-600 mt-2">
            Upload a background and an object → click where you want to place it → download the result.
          </p>
        </div>

        {/* Workflow steps */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-6 text-gray-600">
            <div className={`flex items-center ${sceneFile ? "text-green-600" : ""}`}>
              <CheckCircle2 className="mr-2 h-5 w-5" />
              Scene
            </div>
            <div>—</div>
            <div className={`flex items-center ${objectFile ? "text-green-600" : ""}`}>
              <CheckCircle2 className="mr-2 h-5 w-5" />
              Object
            </div>
            <div>—</div>
            <div className={`flex items-center ${compositeImage ? "text-green-600" : ""}`}>
              <Sparkles className="mr-2 h-5 w-5" />
              Result
            </div>
          </div>
        </div>

        {/* Upload Section */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Scene Upload */}
          <div
            className={`bg-white rounded-2xl shadow-lg p-6 border ${
              sceneFile ? "border-green-400" : "border-gray-100"
            }`}
          >
            <h3 className="text-xl font-semibold flex items-center mb-4">
              <ImageIcon className="mr-2 text-purple-600" />
              Background Scene
            </h3>
            <div
              className="border-2 border-dashed rounded-xl p-8 text-center cursor-pointer hover:border-purple-400 hover:bg-purple-50 transition"
              onClick={() => fileInputSceneRef.current?.click()}
            >
              <Upload className="mx-auto h-12 w-12 mb-4 text-gray-400" />
              <p className="text-sm font-medium">
                {sceneFile ? sceneFile.name : "Click to upload scene image"}
              </p>
              <p className="text-xs text-gray-500">JPG, PNG up to 10MB</p>
              <input
                ref={fileInputSceneRef}
                type="file"
                accept="image/*"
                onChange={handleSceneUpload}
                className="hidden"
              />
            </div>
          </div>

          {/* Object Upload */}
          <div
            className={`bg-white rounded-2xl shadow-lg p-6 border ${
              objectFile ? "border-green-400" : "border-gray-100"
            }`}
          >
            <h3 className="text-xl font-semibold flex items-center mb-4">
              <ImageIcon className="mr-2 text-blue-600" />
              Object to Place
            </h3>
            <div
              className="border-2 border-dashed rounded-xl p-8 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition"
              onClick={() => fileInputObjectRef.current?.click()}
            >
              <Upload className="mx-auto h-12 w-12 mb-4 text-gray-400" />
              <p className="text-sm font-medium">
                {objectFile ? objectFile.name : "Click to upload object image"}
              </p>
              <p className="text-xs text-gray-500">JPG, PNG up to 10MB</p>
              <input
                ref={fileInputObjectRef}
                type="file"
                accept="image/*"
                onChange={handleObjectUpload}
                className="hidden"
              />
            </div>
          </div>
        </div>

        {/* Canvas Section */}
        {sceneFile && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Click to Place Object</h3>
              <button
                onClick={resetAll}
                className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-900"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Reset
              </button>
            </div>

            {!objectFile && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4 flex items-center">
                <AlertCircle className="h-4 w-4 text-amber-600 mr-2" />
                <p className="text-amber-800 text-sm">
                  Please upload an object image before placing.
                </p>
              </div>
            )}

            <div className="flex justify-center">
              <canvas
                ref={canvasRef}
                onClick={handleCanvasClick}
                className={`border-2 border-gray-200 rounded-lg shadow-sm max-w-full h-auto ${
                  sceneFile && objectFile ? "cursor-crosshair hover:border-purple-400" : "cursor-not-allowed"
                }`}
                style={{ maxHeight: "500px" }}
              />
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-8 text-red-700 flex items-center">
            <AlertCircle className="mr-2 h-5 w-5" />
            <p>{error}</p>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 flex flex-col items-center">
            <Loader2 className="h-12 w-12 text-purple-600 animate-spin mb-4" />
            <h3 className="text-lg font-semibold">Creating Your Composite Image…</h3>
            <p className="text-gray-600 text-sm">AI is blending your object into the scene.</p>
          </div>
        )}

        {/* Result */}
        {compositeImage && !loading && (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">✨ Your Composite Image</h3>
              <button
                onClick={downloadImage}
                className="flex items-center px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg shadow hover:from-purple-700 hover:to-blue-700"
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </button>
            </div>
            <div className="flex justify-center">
              <img
                src={compositeImage}
                alt="Composite result"
                className="max-w-full h-auto rounded-lg shadow-md border"
                style={{ maxHeight: "600px" }}
                onError={() => setError("Failed to display generated image.")}
              />
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default MobImageTool;
