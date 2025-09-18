import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";

/** Animated progress card for in-progress exports */
import Loader from "@/components/ui/Loader";

const InProgressExportCard = ({ item }: { item: any }) => {
  return (
    <div className="bg-storiq-card-bg border border-storiq-border rounded-2xl overflow-hidden">
      <div className="h-32 w-full bg-storiq-dark flex flex-col items-center justify-center">
        {/* No loader here */}
      </div>
      <div className="p-6">
        <h3 className="text-white text-xl font-bold mb-1">
          {item.filename || item.name || "Untitled"}
        </h3>
        <p className="text-white/60 text-sm mb-4">
          {item.status || "Exporting"}
          {item.resolution ? ` • ${item.resolution}` : ""}
          {item.format ? ` • ${item.format}` : ""}
        </p>
      </div>
    </div>
  );
};

const Exports = () => {
  const [exportHistory, setExportHistory] = useState<any[]>([]);
  const { user } = useAuth();
  const userId = user && user.id ? user.id : null;

  // Remove export by export_id and update localStorage/UI
  const handleDeleteExport = async (exportId: string) => {
    // Find the export item to get its S3 URL
    const allExports = JSON.parse(localStorage.getItem("exports") || "[]");
    const exportItem = allExports.find(
      (item: any) => item.export_id === exportId && item.userId === userId
    );
    const s3Url = exportItem?.downloadUrl || exportItem?.url || "";
    // Extract S3 key from the URL (after the bucket domain)
    let s3Key = "";
    try {
      if (s3Url) {
        const urlObj = new URL(s3Url);
        // S3 key is the pathname without leading slash
        s3Key = urlObj.pathname.startsWith("/")
          ? urlObj.pathname.slice(1)
          : urlObj.pathname;
      }
    } catch (e) {
      // Invalid URL
      s3Key = "";
    }

    // Call backend to delete from S3 if key exists
    if (s3Key) {
      try {
        await fetch("/api/delete-video", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ s3Key }),
        });
      } catch (e) {
        // Optionally handle error (e.g., show toast)
      }
    }

    // Remove from UI and localStorage as before
    setExportHistory((prev) => {
      const updated = prev.filter((item) => item.export_id !== exportId);
      const filteredAll = allExports.filter(
        (item: any) => !(item.export_id === exportId && item.userId === userId)
      );
      localStorage.setItem("exports", JSON.stringify(filteredAll));
      return updated;
    });
  };

  useEffect(() => {
    try {
      const raw = localStorage.getItem("exports");
      if (raw) {
        let parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          // Patch legacy exports missing userId
          let patched = false;
          parsed = parsed.map((item) => {
            if (!item.userId && userId) {
              patched = true;
              return { ...item, userId };
            }
            return item;
          });
          if (patched) {
            localStorage.setItem("exports", JSON.stringify(parsed));
          }
          // Only show exports for the current user
          setExportHistory(parsed.filter((item) => item.userId === userId));
        }
      }
    } catch (e) {
      setExportHistory([]);
    }
  }, [userId]);

  // Poll for status updates for pending/processing exports
  useEffect(() => {
    // Helper to update both state and localStorage
    // Update export entry by backend jobId, not export_id
    const updateExportEntryByJobId = (jobId: string, data: any) => {
      setExportHistory((prev) => {
        const updated = prev.map((item) =>
          item.job_id === jobId ? { ...item, ...data } : item
        );
        localStorage.setItem("exports", JSON.stringify(updated));
        return updated;
      });
    };

    // Find all pending/processing jobs
    const pollingEntries = exportHistory.filter(
      (item) =>
        (item.status === "pending" ||
          item.status === "processing" ||
          item.status === "Pending" ||
          item.status === "Processing") &&
        item.job_id // backend job id must exist
    );

    if (pollingEntries.length === 0) return;

    // Poll each job every 5 seconds
    const intervals: NodeJS.Timeout[] = [];

    pollingEntries.forEach((item) => {
      const poll = async () => {
        try {
          // Always use backend job_id for polling
          const res = await fetch(`/api/video/crop/${item.job_id}`);
          if (!res.ok) return;
          const data = await res.json();
          // Log backend response for each completed/failed job
          if (
            data.status &&
            (data.status.toLowerCase() === "completed" ||
              data.status.toLowerCase() === "failed")
          ) {
            console.log(
              "[Polling] Backend response for job",
              item.job_id,
              data
            );
            updateExportEntryByJobId(item.job_id, {
              status:
                data.status.charAt(0).toUpperCase() + data.status.slice(1),
              downloadUrl: data.downloadUrl || data.url || null,
            });
          } else if (data.status && data.progress !== undefined) {
            updateExportEntryByJobId(item.job_id, {
              status:
                data.status.charAt(0).toUpperCase() + data.status.slice(1),
              progress: data.progress,
            });
          }
        } catch (e) {
          // Ignore polling errors
        }
      };
      poll();
      const interval = setInterval(poll, 5000);
      intervals.push(interval);
    });

    return () => {
      intervals.forEach(clearInterval);
    };
  }, [exportHistory]);

  // A simple play icon component using SVG
  const PlayIcon = (props) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      {...props}
    >
      <path d="M8 5v14l11-7z" />
    </svg>
  );

  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Your Exports</h1>
          <p className="text-white/60">
            Here are all the videos that you exported.
          </p>
        </div>

        {/* Filters */}
        <div className="flex space-x-4 mb-8">
          <Select defaultValue="date">
            <SelectTrigger className="w-32 bg-storiq-card-bg border-storiq-border text-white">
              <SelectValue placeholder="Date" />
            </SelectTrigger>
            <SelectContent className="bg-storiq-card-bg border-storiq-border">
              <SelectItem
                value="date"
                className="text-white hover:bg-storiq-purple/20"
              >
                Date
              </SelectItem>
              <SelectItem
                value="name"
                className="text-white hover:bg-storiq-purple/20"
              >
                Name
              </SelectItem>
            </SelectContent>
          </Select>

          <Select defaultValue="status">
            <SelectTrigger className="w-32 bg-storiq-card-bg border-storiq-border text-white">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="bg-storiq-card-bg border-storiq-border">
              <SelectItem
                value="status"
                className="text-white hover:bg-storiq-purple/20"
              >
                Status
              </SelectItem>
              <SelectItem
                value="completed"
                className="text-white hover:bg-storiq-purple/20"
              >
                Completed
              </SelectItem>
              <SelectItem
                value="failed"
                className="text-white hover:bg-storiq-purple/20"
              >
                Failed
              </SelectItem>
            </SelectContent>
          </Select>

          <Select defaultValue="format">
            <SelectTrigger className="w-32 bg-storiq-card-bg border-storiq-border text-white">
              <SelectValue placeholder="Format" />
            </SelectTrigger>
            <SelectContent className="bg-storiq-card-bg border-storiq-border">
              <SelectItem
                value="format"
                className="text-white hover:bg-storiq-purple/20"
              >
                Format
              </SelectItem>
              <SelectItem
                value="mp4"
                className="text-white hover:bg-storiq-purple/20"
              >
                MP4
              </SelectItem>
              <SelectItem
                value="mov"
                className="text-white hover:bg-storiq-purple/20"
              >
                MOV
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* In Progress Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">In Progress</h2>
          {exportHistory.filter((item) => item.status !== "Completed").length > 0 && (
            <div className="flex flex-col items-center mb-6">
              <Loader
                size="large"
                variant="spinner"
                primaryColor="#A259FF"
                overlayColor="transparent"
                message="Your export in progress"
              />
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {exportHistory.filter((item) => item.status !== "Completed")
              .length === 0 ? (
              <div className="col-span-3 text-white/60 text-center py-8">
                No exports in progress.
              </div>
            ) : (
              exportHistory
                .filter((item) => item.status !== "Completed")
                .map((item, idx) => (
                  <InProgressExportCard key={item.export_id} item={item} />
                ))
            )}
          </div>
        </div>

        {/* Export History */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-6">Export History</h2>
          <div className="bg-storiq-card-bg border border-storiq-border rounded-2xl">
            {/* Table Header */}
            <div className="p-4 grid grid-cols-6 gap-4 text-white/60 font-semibold border-b border-storiq-border">
              <div>Filename</div>
              <div>Date</div>
              <div>Crop Range</div>
              <div>Status</div>
              <div>Download</div>
              <div>Actions</div>
            </div>

            {/* Table Rows */}
            <div className="divide-y divide-storiq-border">
              {exportHistory.length === 0 ? (
                <div className="p-4 text-white/60 col-span-6">
                  No exports found.
                </div>
              ) : (
                exportHistory.map((item, index) => (
                  <div
                    key={item.export_id}
                    className="p-4 grid grid-cols-6 gap-4 text-white items-center"
                  >
                    <div className="font-medium">
                      {item.filename || item.name || "Untitled"}
                    </div>
                    <div className="text-white/60">
                      {item.date || item.createdAt || "-"}
                    </div>
                    <div className="text-white/60">
                      {item.crop
                        ? `${item.crop.start ?? "-"} - ${item.crop.end ?? "-"}`
                        : "-"}
                    </div>
                    <div>
                      <span
                        className={`px-2 py-1 rounded-md text-sm font-medium ${
                          item.status === "Completed"
                            ? "bg-green-500/20 text-green-400"
                            : "bg-red-500/20 text-red-400"
                        }`}
                      >
                        {item.status || "Completed"}
                      </span>
                    </div>
                    <div>
                      {item.downloadUrl || item.url ? (
                        <>
                          {(() => {
                            // Log just before rendering the download button
                            console.log("[History] Download button:", {
                              jobId: item.export_id,
                              downloadUrl: item.downloadUrl || item.url,
                            });
                            return null;
                          })()}
                          <a
                            href={item.downloadUrl || item.url}
                            download={
                              item.filename || item.name || "exported-video"
                            }
                            className="text-storiq-purple underline hover:text-white transition-colors"
                          >
                            Download
                          </a>
                        </>
                      ) : (
                        <span className="text-white/40">N/A</span>
                      )}
                    </div>
                    <div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteExport(item.export_id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Exports;
