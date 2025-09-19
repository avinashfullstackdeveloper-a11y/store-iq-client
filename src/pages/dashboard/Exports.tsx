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
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";

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
  const [sortBy, setSortBy] = useState<'filename' | 'date' | 'status'>('date');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const { user } = useAuth();
  const userId = user && user.id ? user.id : null;

  // Sorting logic
  const sortedExportHistory = React.useMemo(() => {
    const arr = [...exportHistory];
    arr.sort((a, b) => {
      let aVal, bVal;
      if (sortBy === 'filename') {
        aVal = (a.filename || a.name || '').toLowerCase();
        bVal = (b.filename || b.name || '').toLowerCase();
      } else if (sortBy === 'date') {
        aVal = new Date(a.date || a.createdAt || 0).getTime();
        bVal = new Date(b.date || b.createdAt || 0).getTime();
      } else if (sortBy === 'status') {
        aVal = (a.status || '').toLowerCase();
        bVal = (b.status || '').toLowerCase();
      }
      if (aVal === undefined || bVal === undefined) return 0;
      if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return arr;
  }, [exportHistory, sortBy, sortDir]);

  const handleSort = (col: 'filename' | 'date' | 'status') => {
    if (sortBy === col) {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(col);
      setSortDir(col === 'date' ? 'desc' : 'asc');
    }
  };

  // Remove crop range handler (stub, implement as needed)
  const handleRemoveCropRange = (exportId: string) => {
    setExportHistory((prev) =>
      prev.map((item) =>
        item.export_id === exportId
          ? { ...item, crop: undefined }
          : item
      )
    );
    // Optionally update localStorage or backend here
  };

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
            <div className="p-0">
              {/* Responsive horizontal scroll and sticky header */}
              <div className="w-full overflow-x-auto">
                <div style={{ minWidth: 800 }}>
                  <ScrollArea>
                    <Table className="min-w-[800px]">
                      <TableHeader>
                        <TableRow className="bg-storiq-card-bg sticky top-0 z-10">
                          <TableHead
                            className="min-w-[180px] font-bold text-white cursor-pointer select-none"
                            aria-sort={sortBy === 'filename' ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'}
                            onClick={() => handleSort('filename')}
                          >
                            <div className="flex items-center gap-1">
                              Filename
                              {sortBy === 'filename' && (
                                <span className="ml-1">
                                  {sortDir === 'asc' ? (
                                    <svg width="14" height="14" viewBox="0 0 20 20" fill="none"><path d="M10 6l4 4H6l4-4z" fill="currentColor"/></svg>
                                  ) : (
                                    <svg width="14" height="14" viewBox="0 0 20 20" fill="none"><path d="M10 14l-4-4h8l-4 4z" fill="currentColor"/></svg>
                                  )}
                                </span>
                              )}
                            </div>
                          </TableHead>
                          <TableHead
                            className="min-w-[140px] text-right text-white cursor-pointer select-none"
                            aria-sort={sortBy === 'date' ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'}
                            onClick={() => handleSort('date')}
                          >
                            <div className="flex items-center justify-end gap-1">
                              Date
                              {sortBy === 'date' && (
                                <span className="ml-1">
                                  {sortDir === 'asc' ? (
                                    <svg width="14" height="14" viewBox="0 0 20 20" fill="none"><path d="M10 6l4 4H6l4-4z" fill="currentColor"/></svg>
                                  ) : (
                                    <svg width="14" height="14" viewBox="0 0 20 20" fill="none"><path d="M10 14l-4-4h8l-4 4z" fill="currentColor"/></svg>
                                  )}
                                </span>
                              )}
                            </div>
                          </TableHead>
                          <TableHead
                            className="min-w-[120px] text-white cursor-pointer select-none"
                            aria-sort={sortBy === 'status' ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'}
                            onClick={() => handleSort('status')}
                          >
                            <div className="flex items-center gap-1">
                              Status
                              {sortBy === 'status' && (
                                <span className="ml-1">
                                  {sortDir === 'asc' ? (
                                    <svg width="14" height="14" viewBox="0 0 20 20" fill="none"><path d="M10 6l4 4H6l4-4z" fill="currentColor"/></svg>
                                  ) : (
                                    <svg width="14" height="14" viewBox="0 0 20 20" fill="none"><path d="M10 14l-4-4h8l-4 4z" fill="currentColor"/></svg>
                                  )}
                                </span>
                              )}
                            </div>
                          </TableHead>
                          <TableHead className="min-w-[80px] text-center text-white">Download</TableHead>
                          <TableHead className="min-w-[160px] text-right text-white">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {sortedExportHistory.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={6} className="text-white/60 text-center py-8">
                              No exports found.
                            </TableCell>
                          </TableRow>
                        ) : (
                          sortedExportHistory.map((item) => (
                            <TableRow key={item.export_id} className="group hover:bg-storiq-dark-lighter transition-colors">
                              <TableCell className="font-bold text-white break-all">{item.filename || item.name || "Untitled"}</TableCell>
                              <TableCell className="text-right text-white/80">
                                {item.date || item.createdAt || "-"}
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant={
                                    item.status === "Completed"
                                      ? "default"
                                      : item.status === "Failed"
                                      ? "destructive"
                                      : "secondary"
                                  }
                                  className={
                                    item.status === "Completed"
                                      ? "bg-green-500/20 text-green-400 border-none"
                                      : item.status === "Failed"
                                      ? "bg-red-500/20 text-red-400 border-none"
                                      : "bg-yellow-500/20 text-yellow-400 border-none"
                                  }
                                >
                                  {item.status || "Completed"}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-center">
                                {item.downloadUrl || item.url ? (
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <a
                                          href={item.downloadUrl || item.url}
                                          download={item.filename || item.name || "exported-video"}
                                          className="inline-flex"
                                          tabIndex={-1}
                                        >
                                          <Button
                                            variant="outline"
                                            size="icon"
                                            className="border-white text-white hover:bg-white/10 focus:ring-2 focus:ring-white"
                                            aria-label="Download"
                                          >
                                            {/* Arrow Down Icon */}
                                            <svg
                                              width="20"
                                              height="20"
                                              fill="none"
                                              viewBox="0 0 20 20"
                                              className="text-white"
                                            >
                                              <path d="M10 3v10m0 0l4-4m-4 4l-4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                            </svg>
                                          </Button>
                                        </a>
                                      </TooltipTrigger>
                                      <TooltipContent>Download</TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                ) : (
                                  <span className="text-white/40">N/A</span>
                                )}
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end items-center gap-2">
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          variant="destructive"
                                          size="icon"
                                          aria-label="Delete"
                                          onClick={() => handleDeleteExport(item.export_id)}
                                        >
                                          {/* Trash Icon */}
                                          <svg width="20" height="20" fill="none" viewBox="0 0 20 20">
                                            <path d="M6 7v7a2 2 0 002 2h4a2 2 0 002-2V7M4 7h12M9 3h2a1 1 0 011 1v1H8V4a1 1 0 011-1z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                          </svg>
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>Delete</TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Exports;
