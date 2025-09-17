import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogHeader,
  DialogFooter,
} from "@/components/ui/dialog";
import AdvancedVideoPlayer from "@/components/AdvancedVideoPlayer";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Play, 
  Edit3, 
  Trash2, 
  Clock, 
  Calendar,
  Download,
  MoreVertical,
  FileVideo
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConfirmDialog } from "@/components/confirm-dialog";

const Videos = () => {
  // State
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generatedThumbs, setGeneratedThumbs] = useState<{
    [key: string]: string;
  }>({});
  const [modal, setModal] = useState<{
    open: boolean;
    src: string | null;
    title: string;
    videoId: string | null;
    loading: boolean;
    error: string | null;
  }>({
    open: false,
    src: null,
    title: "",
    videoId: null,
    loading: true,
    error: null,
  });
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteVideoId, setDeleteVideoId] = useState<string | null>(null);

  // Fetch videos
  useEffect(() => {
    const fetchVideos = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("jwt_token");
        if (!token) throw new Error("User not authenticated (no token found)");
        const payload = token.split(".")[1];
        if (!payload) throw new Error("Invalid JWT format");
        const decodedPayload = JSON.parse(
          atob(payload.replace(/-/g, "+").replace(/_/g, "/"))
        );
        const userId = decodedPayload.id;
        if (!userId) throw new Error("User ID not found in token");
        const res = await fetch(
          `/api/videos?userId=${encodeURIComponent(userId)}`
        );
        if (!res.ok) throw new Error("Failed to fetch videos");
        const data = await res.json();
        setVideos(Array.isArray(data) ? data : []);
      } catch (err: any) {
        setError(err.message || "Unknown error");
      } finally {
        setLoading(false);
      }
    };
    fetchVideos();
  }, []);

  // Generate thumbnails
  useEffect(() => {
    const generateThumbnails = async () => {
      const updates: { [key: string]: string } = {};
      await Promise.all(
        videos.map(async (video) => {
          if (
            !video.thumbnail &&
            video.url &&
            !generatedThumbs[video.id || video.url]
          ) {
            try {
              const thumb = await extractVideoFrame(video.url);
              if (thumb) {
                updates[video.id || video.url] = thumb;
              }
            } catch {}
          }
        })
      );
      if (Object.keys(updates).length > 0) {
        setGeneratedThumbs((prev) => ({ ...prev, ...updates }));
      }
    };
    if (videos.length > 0) generateThumbnails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videos]);

  // Extract frame for thumbnail
  const extractVideoFrame = (url: string): Promise<string | null> =>
    new Promise((resolve) => {
      const video = document.createElement("video");
      video.src = url;
      video.crossOrigin = "anonymous";
      video.muted = true;
      video.playsInline = true;
      video.currentTime = 1;
      video.addEventListener("loadeddata", () => {
        try {
          const canvas = document.createElement("canvas");
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            resolve(canvas.toDataURL("image/png"));
          } else {
            resolve(null);
          }
        } catch {
          resolve(null);
        }
      });
      video.addEventListener("error", () => resolve(null));
    });

  // Modal handlers
  const openModal = (video: any) => {
    setModal({
      open: true,
      src: video.url || "",
      title: video.title || "Untitled Video",
      videoId: video.id || null,
      loading: true,
      error: null,
    });
  };
  const closeModal = () => {
    setModal({
      open: false,
      src: null,
      title: "",
      videoId: null,
      loading: true,
      error: null,
    });
  };

  // Delete handler
  const handleDelete = async () => {
    console.log("[handleDelete] deleteVideoId:", deleteVideoId);
    if (!deleteVideoId) {
      console.log("[handleDelete] Early return: deleteVideoId is missing");
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("jwt_token");
      if (!token) {
        console.log("[handleDelete] Early return: JWT token is missing");
        throw new Error("User not authenticated (no token found)");
      }
      // Find the video object to get the s3Key
      const videoToDelete = videos.find((v) => v.id === deleteVideoId);
      if (!videoToDelete || !videoToDelete.s3Key) {
        console.log("[handleDelete] Early return: videoToDelete or s3Key missing", videoToDelete);
        throw new Error("Video s3Key not found");
      }
      console.log("[handleDelete] Deleting video object:", videoToDelete, "s3Key:", videoToDelete.s3Key);
      const res = await fetch(
        "/api/delete-video",
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ s3Key: videoToDelete.s3Key }),
        }
      );
      if (!res.ok) throw new Error("Failed to delete video");
      setVideos((prev) => prev.filter((v) => v.id !== deleteVideoId));
      setDeleteVideoId(null);
      setDeleteConfirmOpen(false);
      closeModal();
    } catch (err: any) {
      setError(err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  // Keyboard accessibility for modal (ESC to close)
  useEffect(() => {
    if (!modal.open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [modal.open]);

  // Format duration
  const formatDuration = (seconds: number) => {
    if (!seconds) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <DashboardLayout>
      <div className="p-6 md:p-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Your Videos</h1>
          <p className="text-white/60">
            Manage and preview all the videos you've created
          </p>
        </div>

        {/* Preview Modal */}
        <Dialog
          open={modal.open}
          onOpenChange={(open) => {
            if (!open) closeModal();
          }}
        >
          <DialogContent className="max-w-4xl p-0 overflow-hidden bg-card border-0">
            <DialogHeader className="px-6 pt-6">
              <DialogTitle className="text-xl text-white">{modal.title}</DialogTitle>
            </DialogHeader>
            
            {/* Video Player Container */}
            <div className="relative px-6">
              <AspectRatio ratio={16 / 9} className="bg-black rounded-lg overflow-hidden">
                {/* Overlay: Loading spinner */}
                {modal.loading && (
                  <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/60 transition-opacity animate-fade-in">
                    <div
                      className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"
                      aria-label="Loading spinner"
                    ></div>
                    <span className="text-white text-lg font-medium">
                      Loading video...
                    </span>
                  </div>
                )}
                
                {/* Overlay: Error */}
                {modal.error && (
                  <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/80 transition-opacity animate-fade-in p-4">
                    <span className="text-destructive text-lg font-semibold mb-2">
                      Failed to load video
                    </span>
                    <span className="text-white/70 text-center text-sm mb-4">{modal.error}</span>
                    <Button
                      variant="outline"
                      onClick={closeModal}
                      aria-label="Close error overlay"
                    >
                      Close
                    </Button>
                  </div>
                )}
                
                {/* Video Player */}
                {modal.src && (
                  <AdvancedVideoPlayer
                    src={modal.src}
                    className="w-full h-full"
                    aria-label="Video preview"
                    onLoadedData={() => {
                      setModal((prev) => ({
                        ...prev,
                        loading: false,
                        error: null,
                      }));
                    }}
                    onError={() => {
                      setModal((prev) => ({
                        ...prev,
                        loading: false,
                        error:
                          "This video could not be loaded. Please try again later.",
                      }));
                    }}
                  />
                )}
              </AspectRatio>
            </div>
            
            {/* Action Buttons */}
            <DialogFooter className="flex justify-end gap-2 px-6 pb-6">
              <Button
                variant="outline"
                onClick={() => handleOpenDeleteDialog(modal.videoId)}
                className="gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
              <Button className="gap-2">
                <Download className="h-4 w-4" />
                Download
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        {deleteVideoId && (
          <ConfirmDialog
            open={deleteConfirmOpen}
            onOpenChange={(open) => {
              setDeleteConfirmOpen(open);
              if (!open) setDeleteVideoId(null);
            }}
            title="Delete Video"
            description="Are you sure you want to delete this video? This action cannot be undone."
            confirmText="Delete"
            cancelText="Cancel"
            onConfirm={handleDelete}
            variant="destructive"
          />
        )}

        {/* Videos Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="overflow-hidden border-border bg-card">
                <Skeleton className="h-48 w-full rounded-none" />
                <CardContent className="p-4">
                  <Skeleton className="h-5 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-full mb-1" />
                  <Skeleton className="h-4 w-2/3 mb-3" />
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-8 w-20" />
                    <Skeleton className="h-8 w-20" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-full bg-destructive/20 p-4 mb-4">
              <FileVideo className="h-10 w-10 text-destructive" />
            </div>
            <h3 className="text-xl font-medium text-white mb-2">Unable to load videos</h3>
            <p className="text-muted-foreground mb-6 max-w-md">{error}</p>
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        ) : videos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="rounded-full bg-muted p-4 mb-4">
              <FileVideo className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-medium text-white mb-2">No videos yet</h3>
            <p className="text-muted-foreground mb-6">
              Videos you create will appear here
            </p>
            <Button>Create Your First Video</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {videos.map((video, index) => (
              // TEMP: Log video object to verify structure and id presence
              console.log("TEMP DEBUG: video object", video),
              <Card
                key={video.id || index}
                className="group overflow-hidden border-border bg-card hover:border-primary/50 transition-all duration-300 hover:shadow-lg"
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={
                      video.thumbnail
                        ? video.thumbnail
                        : generatedThumbs[video.id || video.url]
                        ? generatedThumbs[video.id || video.url]
                        : "/placeholder.svg"
                    }
                    alt={video.title || "Untitled Video"}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/placeholder.svg";
                    }}
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <Button 
                      onClick={() => openModal(video)}
                      className="rounded-full h-12 w-12"
                      size="icon"
                    >
                      <Play className="h-5 w-5 fill-current ml-1" />
                    </Button>
                  </div>
                  
                  {video.duration && (
                    <Badge variant="secondary" className="absolute bottom-2 right-2">
                      <Clock className="h-3 w-3 mr-1" />
                      {formatDuration(video.duration)}
                    </Badge>
                  )}
                </div>
                
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-white font-semibold line-clamp-1 flex-1 mr-2">
                      {video.title || "Untitled Video"}
                    </h3>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openModal(video)}>
                          <Play className="h-4 w-4 mr-2" />
                          Preview
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit3 className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => handleOpenDeleteDialog(video.id)}
                          disabled={video.id === undefined || video.id === null}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  
                  <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                    {video.subtitle || video.description || "No description"}
                  </p>
                  
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3 mr-1" />
                    {video.createdAt ? (
                      new Date(video.createdAt).toLocaleDateString()
                    ) : (
                      "Unknown date"
                    )}
                  </div>
                </CardContent>
                
                <CardFooter className="p-4 pt-0 flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 gap-2"
                    onClick={() => openModal(video)}
                  >
                    <Play className="h-4 w-4" />
                    Preview
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 gap-2"
                  >
                    <Edit3 className="h-4 w-4" />
                    Edit
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
  // Helper to open delete dialog safely
  function handleOpenDeleteDialog(videoId: string | null) {
    console.log("[handleOpenDeleteDialog] called with videoId:", videoId);
    // TEMP: Confirm correct videoId received
    console.log("TEMP DEBUG: handleOpenDeleteDialog received videoId:", videoId);
    if (videoId) {
      setDeleteVideoId(videoId);
      setDeleteConfirmOpen(true);
    }
  }

};


export default Videos;