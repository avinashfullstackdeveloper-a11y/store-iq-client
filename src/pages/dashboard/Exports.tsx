"use client";

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
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

import { ConfirmDialog } from "@/components/confirm-dialog";

/** Improved animated progress card for in-progress exports */
const InProgressExportCard = ({ item }: { item: any }) => {
  const getProgressValue = () => {
    if (item.progress !== undefined) return item.progress;
    if (item.status === "Completed" || item.status === "completed") return 100;
    if (item.status === "Failed" || item.status === "failed") return 0;
    return 30; // Default progress for pending/processing
  };

  const getStatusColor = () => {
    switch (item.status?.toLowerCase()) {
      case "completed":
        return "bg-green-500";
      case "failed":
        return "bg-red-500";
      case "processing":
        return "bg-blue-500";
      default:
        return "bg-yellow-500";
    }
  };

  const getStatusText = () => {
    switch (item.status?.toLowerCase()) {
      case "processing":
        return "Processing...";
      case "pending":
        return "Queued";
      case "failed":
        return "Failed";
      default:
        return "Exporting...";
    }
  };

  return (
    <Card className="bg-storiq-card-bg border-storiq-border hover:border-storiq-primary/30 transition-all duration-300">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <CardTitle className="text-white text-lg font-semibold line-clamp-1">
            {item.filename || item.name || "Untitled"}
          </CardTitle>
          <Badge
            variant="secondary"
            className={`${getStatusColor().replace(
              "bg-",
              "bg-"
            )}/20 text-white border-none`}
          >
            {item.status || "Processing"}
          </Badge>
        </div>
        <CardDescription className="text-white/60">
          {item.resolution ? `${item.resolution} • ` : ""}
          {item.format || "MP4"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-white/70">{getStatusText()}</span>
            <span className="text-white/70">{getProgressValue()}%</span>
          </div>
          <Progress
            value={getProgressValue()}
            className="h-2 bg-white/10"
            indicatorClassName={getStatusColor()}
          />
          {item.status?.toLowerCase() === "processing" && (
            <div className="flex justify-center">
              <div className="animate-pulse text-xs text-blue-400">
                Processing video...
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const Exports = () => {
  const [exportHistory, setExportHistory] = useState<any[]>([]);
  const [sortBy, setSortBy] = useState<"filename" | "date" | "status">("date");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "completed" | "failed"
  >("all");

  // ConfirmDialog state
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const { user } = useAuth();
  const userId = user && user.id ? user.id : null;

  // Filter and sort logic
  const filteredAndSortedExports = React.useMemo(() => {
    let arr = [...exportHistory];

    // Apply status filter
    if (filterStatus !== "all") {
      arr = arr.filter((item) => {
        const status = item.status?.toLowerCase();
        switch (filterStatus) {
          case "completed":
            return status === "completed";
          case "failed":
            return status === "failed";
          default:
            return true;
        }
      });
    }

    // Apply sorting
    arr.sort((a, b) => {
      let aVal, bVal;
      if (sortBy === "filename") {
        aVal = (a.filename || a.name || "").toLowerCase();
        bVal = (b.filename || b.name || "").toLowerCase();
      } else if (sortBy === "date") {
        aVal = new Date(a.date || a.createdAt || 0).getTime();
        bVal = new Date(b.date || b.createdAt || 0).getTime();
      } else if (sortBy === "status") {
        aVal = (a.status || "").toLowerCase();
        bVal = (b.status || "").toLowerCase();
      }
      if (aVal === undefined || bVal === undefined) return 0;
      if (aVal < bVal) return sortDir === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

    return arr;
  }, [exportHistory, sortBy, sortDir, filterStatus]);

  const inProgressExports = filteredAndSortedExports.filter(
    (item) =>
      item.status?.toLowerCase() !== "completed" &&
      item.status?.toLowerCase() !== "failed"
  );

  const completedExports = filteredAndSortedExports.filter(
    (item) => item.status?.toLowerCase() === "completed"
  );

  const handleSort = (col: "filename" | "date" | "status") => {
    if (sortBy === col) {
      setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(col);
      setSortDir(col === "date" ? "desc" : "asc");
    }
  };

  // Remove export functionality (unchanged)
  const handleDeleteExport = async (exportId: string) => {
    const allExports = JSON.parse(localStorage.getItem("exports") || "[]");
    const exportItem = allExports.find(
      (item: any) => item.export_id === exportId && item.userId === userId
    );
    // Only delete the exported/edited file, never the original
    // Only delete if s3Key is present (like Videos page)
    const s3Key = exportItem?.s3Key;
    if (!s3Key) {
      // No exported file to delete, just remove from history
      setExportHistory((prev) => {
        const updated = prev.filter((item) => item.export_id !== exportId);
        const filteredAll = allExports.filter(
          (item: any) =>
            !(item.export_id === exportId && item.userId === userId)
        );
        localStorage.setItem("exports", JSON.stringify(filteredAll));
        return updated;
      });
      return;
    }

    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
      await fetch(`${API_BASE_URL}/api/delete-video`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ s3Key }),
        credentials: "include",
      });
    } catch (e) {
      // Error handling
    }

    setExportHistory((prev) => {
      const updated = prev.filter((item) => item.export_id !== exportId);
      const filteredAll = allExports.filter(
        (item: any) => !(item.export_id === exportId && item.userId === userId)
      );
      localStorage.setItem("exports", JSON.stringify(filteredAll));
      return updated;
    });
  };

  // ConfirmDialog handlers
  const handleOpenDeleteDialog = (exportId: string) => {
    setPendingDeleteId(exportId);
    setConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!pendingDeleteId) return;
    setDeleteLoading(true);
    await handleDeleteExport(pendingDeleteId);
    setDeleteLoading(false);
    setConfirmOpen(false);
    setPendingDeleteId(null);
  };

  const handleCancelDelete = () => {
    setConfirmOpen(false);
    setPendingDeleteId(null);
    setDeleteLoading(false);
  };

  useEffect(() => {
    try {
      const raw = localStorage.getItem("exports");
      if (raw) {
        let parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
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
          setExportHistory(parsed.filter((item) => item.userId === userId));
        }
      }
    } catch (e) {
      setExportHistory([]);
    }
  }, [userId]);

  // Polling logic (unchanged)
  useEffect(() => {
    const updateExportEntryByJobId = (jobId: string, data: any) => {
      setExportHistory((prev) => {
        const updated = prev.map((item) =>
          item.job_id === jobId || item.jobId === jobId
            ? { ...item, ...data }
            : item
        );
        localStorage.setItem("exports", JSON.stringify(updated));
        return updated;
      });
    };

    const pollingEntries = exportHistory.filter(
      (item) =>
        (item.status === "pending" ||
          item.status === "processing" ||
          item.status === "Pending" ||
          item.status === "Processing") &&
        item.job_id
    );

    if (pollingEntries.length === 0) return;

    const intervals: NodeJS.Timeout[] = [];

    pollingEntries.forEach((item) => {
      const poll = async () => {
        try {
          const jobId = item.jobId ?? item.job_id;
          const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
          const res = await fetch(`${API_BASE_URL}/api/video/crop/${jobId}`, {
            method: "GET",
            credentials: "include",
          });
          if (!res.ok) return;
          const data = await res.json();

          if (
            data.status &&
            (data.status.toLowerCase() === "completed" ||
              data.status.toLowerCase() === "failed")
          ) {
            updateExportEntryByJobId(jobId, {
              status:
                data.status.charAt(0).toUpperCase() + data.status.slice(1),
              ...(data.downloadUrl ? { downloadUrl: data.downloadUrl } : {}),
              ...(data.key ? { s3Key: data.key } : {}),
              ...(data.s3Key ? { s3Key: data.s3Key } : {}),
            });
          } else if (data.status && data.progress !== undefined) {
            updateExportEntryByJobId(jobId, {
              status:
                data.status.charAt(0).toUpperCase() + data.status.slice(1),
              progress: data.progress,
            });
          }
        } catch (e) {
          // Ignore errors_id
        }
      };
      poll();
      const interval = setInterval(poll, 5000);
      intervals.push(interval);
    });

    return () => intervals.forEach(clearInterval);
  }, [exportHistory]);

  // Icons component
  const Icons = {
    Play: (props) => (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        {...props}
      >
        <path d="M8 5v14l11-7z" />
      </svg>
    ),
    Download: (props) => (
      <svg width="20" height="20" fill="none" viewBox="0 0 20 20" {...props}>
        <path
          d="M10 3v10m0 0l4-4m-4 4l-4-4"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    Delete: (props) => (
      <svg width="20" height="20" fill="none" viewBox="0 0 20 20" {...props}>
        <path
          d="M6 7v7a2 2 0 002 2h4a2 2 0 002-2V7M4 7h12M9 3h2a1 1 0 011 1v1H8V4a1 1 0 011-1z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    Sort: ({ direction = "asc", ...props }) => (
      <svg
        width="14"
        height="14"
        viewBox="0 0 20 20"
        fill="currentColor"
        {...props}
      >
        {direction === "asc" ? (
          <path d="M10 6l4 4H6l4-4z" />
        ) : (
          <path d="M10 14l-4-4h8l-4 4z" />
        )}
      </svg>
    ),
  };

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">
            Your Exports
          </h1>
<p className="text-white/60">Here are all the videos that you exported.</p>
        </div>

        {/* Stats Overview */}
        {/* Stats Overview cards removed as requested */}
        {/* In Progress Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">In Progress</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {inProgressExports.length === 0 ? (
              <div className="p-8 text-center text-white/60">
                No exports in progress.
              </div>
            ) : (
              inProgressExports.map((item) => (
                <div
                  key={item.export_id}
                  className="bg-storiq-card-bg border border-storiq-border rounded-2xl overflow-hidden flex flex-col"
                >
                  {/* Striped background and play button overlay */}
                  <div className="relative h-48 w-full bg-slate-800 flex items-center justify-center">
                    <div
                      className="absolute inset-0"
                      style={{
                        backgroundImage:
                          'repeating-linear-gradient(135deg, transparent, transparent 10px, rgba(0,0,0,0.2) 10px, rgba(0,0,0,0.2) 20px)',
                      }}
                    ></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="bg-black/50 rounded-full h-16 w-16 flex items-center justify-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          className="h-8 w-8 text-white"
                        >
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  <div className="p-6 flex flex-col flex-1">
                    <h3 className="text-white text-xl font-bold mb-1 line-clamp-1">
                      {item.filename || item.name || "Untitled"}
                    </h3>
                    <p className="text-white/60 text-sm mb-4">
                      {item.status?.toLowerCase() === "processing"
                        ? "Exporting"
                        : item.status?.toLowerCase() === "pending"
                        ? "Queued"
                        : "Exporting"}{" "}
                      • {item.resolution ? `${item.resolution} • ` : ""}
                      {item.format || "MP4"}
                    </p>
                    {/* Progress Bar */}
                    <div className="flex items-center gap-x-3 mb-4">
                      <div className="w-full bg-storiq-dark rounded-full h-2">
                        <div
                          className="bg-storiq-purple h-2 rounded-full"
                          style={{
                            width: `${item.progress !== undefined ? item.progress : 30}%`,
                          }}
                        ></div>
                      </div>
                      <p className="text-storiq-purple text-sm font-medium whitespace-nowrap">
                        {item.progress !== undefined ? item.progress : 30}%
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      className="w-full border-storiq-border text-white hover:bg-storiq-purple hover:border-storiq-purple"
                      disabled
                    >
                      Download
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Filters and Controls - Table Style */}
        <div className="flex flex-wrap gap-4 mb-8">
          {/* Date Filter */}
          <Select
            value={sortBy}
            onValueChange={(value) =>
              setSortBy(value as "filename" | "date" | "status")
            }
          >
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
                value="filename"
                className="text-white hover:bg-storiq-purple/20"
              >
                Name
              </SelectItem>
              <SelectItem
                value="status"
                className="text-white hover:bg-storiq-purple/20"
              >
                Status
              </SelectItem>
            </SelectContent>
          </Select>
          {/* Status Filter */}
          <Select
            value={filterStatus}
            onValueChange={(value) =>
              setFilterStatus(value as "all" | "completed" | "failed")
            }
          >
            <SelectTrigger className="w-32 bg-storiq-card-bg border-storiq-border text-white">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="bg-storiq-card-bg border-storiq-border">
              <SelectItem
                value="all"
                className="text-white hover:bg-storiq-purple/20"
              >
                All Status
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
          {/* Format Filter */}
          <Select value="" onValueChange={() => {}}>
            <SelectTrigger className="w-32 bg-storiq-card-bg border-storiq-border text-white">
              <SelectValue placeholder="Format" />
            </SelectTrigger>
            <SelectContent className="bg-storiq-card-bg border-storiq-border">
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
          {/* Name Filter */}
          <input
            type="text"
            placeholder="Search by name"
            className="w-40 bg-storiq-card-bg border-storiq-border text-white px-3 py-2 rounded-md"
            onChange={(e) => {
              // Optionally implement name filtering logic here
            }}
          />
        </div>

        {/* Export History - Table Layout */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-6">Export History</h2>
          <div className="bg-storiq-card-bg border border-storiq-border rounded-2xl">
            {/* Table Header */}
            <div className="p-4 grid grid-cols-6 gap-4 text-white/60 font-semibold border-b border-storiq-border">
              <div>Filename</div>
              <div>Date</div>
              <div>Size</div>
              <div>Format</div>
              <div>Status</div>
              <div>Actions</div>
            </div>
            {/* Table Rows */}
            <div className="divide-y divide-storiq-border">
              {filteredAndSortedExports.length === 0 ? (
                <div className="p-8 text-center text-white/60 col-span-6">
                  No exports found. Your exported videos will appear here once
                  you start creating them.
                </div>
              ) : (
                filteredAndSortedExports.map((item) => (
                  <div
                    key={item.export_id}
                    className="p-4 grid grid-cols-6 gap-4 text-white items-center"
                  >
                    <div className="font-medium">
                      {item.filename || item.name || "Untitled Export"}
                    </div>
                    <div className="text-white/60">
                      {item.date || item.createdAt
                        ? new Date(
                            item.date || item.createdAt
                          ).toLocaleDateString()
                        : "Unknown date"}
                    </div>
                    <div className="text-white/60">{item.size || "-"}</div>
                    <div>
                      <span className="bg-storiq-purple/20 text-storiq-purple font-semibold px-2 py-1 rounded-md text-sm">
                        {item.format || "MP4"}
                      </span>
                    </div>
                    <div>
                      <span
                        className={`px-2 py-1 rounded-md text-sm font-medium ${
                          item.status?.toLowerCase() === "completed"
                            ? "bg-green-500/20 text-green-400"
                            : item.status?.toLowerCase() === "failed"
                            ? "bg-red-500/20 text-red-400"
                            : "bg-yellow-500/20 text-yellow-400"
                        }`}
                      >
                        {item.status || "Unknown"}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      {/* Download */}
                      {item.downloadUrl || item.url ? (
                        <a
                          href={item.downloadUrl || item.url}
                          download={item.filename || item.name}
                          className="inline-flex"
                          aria-label="Download export"
                        >
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-green-500/70 text-green-500 hover:bg-green-500/15 hover:border-green-600 focus:ring-2 focus:ring-green-400 focus:outline-none bg-transparent font-semibold px-3 py-1 rounded-lg flex items-center gap-2 transition-all"
                            aria-label="Download export"
                          >
                            <Icons.Download
                              className="w-4 h-4"
                              aria-hidden="true"
                            />
                          </Button>
                        </a>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          disabled
                          className="border-white/20 text-white/40 bg-transparent font-semibold px-3 py-1 rounded-lg flex items-center gap-2"
                          aria-label="Download not available"
                        >
                          <Icons.Download
                            className="w-4 h-4"
                            aria-hidden="true"
                          />
                        </Button>
                      )}
                      {/* Share (placeholder, logic unchanged) */}
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-blue-500/70 text-blue-500 hover:bg-blue-500/15 hover:border-blue-600 focus:ring-2 focus:ring-blue-400 focus:outline-none font-semibold px-3 py-1 rounded-lg flex items-center gap-2 transition-all"
                        aria-label="Share export"
                        // onClick={...} // keep logic unchanged
                      >
                        Share
                      </Button>
                      {/* Delete */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenDeleteDialog(item.export_id)}
                        className="border-red-500/70 text-red-500 hover:bg-red-500/15 hover:border-red-600 focus:ring-2 focus:ring-red-400 focus:outline-none font-semibold px-3 py-1 rounded-lg flex items-center gap-2 transition-all"
                        aria-label="Delete export"
                      >
                        <Icons.Delete className="w-4 h-4" aria-hidden="true" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
      {/* ConfirmDialog for delete confirmation */}
      <ConfirmDialog
        open={confirmOpen}
        title="Delete Export"
        description="Are you sure you want to delete this export? This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        loading={deleteLoading}
      />
    </DashboardLayout>
  );
};

export default Exports;
