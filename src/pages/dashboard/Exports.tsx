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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

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
      case "completed": return "bg-green-500";
      case "failed": return "bg-red-500";
      case "processing": return "bg-blue-500";
      default: return "bg-yellow-500";
    }
  };

  const getStatusText = () => {
    switch (item.status?.toLowerCase()) {
      case "processing": return "Processing...";
      case "pending": return "Queued";
      case "failed": return "Failed";
      default: return "Exporting...";
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
            className={`${getStatusColor().replace('bg-', 'bg-')}/20 text-white border-none`}
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
              <div className="animate-pulse text-xs text-blue-400">Processing video...</div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const Exports = () => {
  const [exportHistory, setExportHistory] = useState<any[]>([]);
  const [sortBy, setSortBy] = useState<'filename' | 'date' | 'status'>('date');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [filterStatus, setFilterStatus] = useState<'all' | 'completed' | 'failed'>('all');

  const { user } = useAuth();
  const userId = user && user.id ? user.id : null;

  // Filter and sort logic
  const filteredAndSortedExports = React.useMemo(() => {
    let arr = [...exportHistory];
    
    // Apply status filter
    if (filterStatus !== 'all') {
      arr = arr.filter(item => {
        const status = item.status?.toLowerCase();
        switch (filterStatus) {
          case 'completed': return status === 'completed';
          case 'failed': return status === 'failed';
          default: return true;
        }
      });
    }
    
    // Apply sorting
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
  }, [exportHistory, sortBy, sortDir, filterStatus]);

  const inProgressExports = filteredAndSortedExports.filter(item => 
    item.status?.toLowerCase() !== 'completed' && item.status?.toLowerCase() !== 'failed'
  );
  
  const completedExports = filteredAndSortedExports.filter(item => 
    item.status?.toLowerCase() === 'completed'
  );

  const handleSort = (col: 'filename' | 'date' | 'status') => {
    if (sortBy === col) {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(col);
      setSortDir(col === 'date' ? 'desc' : 'asc');
    }
  };

  // Remove export functionality (unchanged)
  const handleDeleteExport = async (exportId: string) => {
    // ... (existing delete logic remains the same)
    const allExports = JSON.parse(localStorage.getItem("exports") || "[]");
    const exportItem = allExports.find(
      (item: any) => item.export_id === exportId && item.userId === userId
    );
    const s3Url = exportItem?.downloadUrl || exportItem?.url || "";
    let s3Key = "";
    
    try {
      if (s3Url) {
        const urlObj = new URL(s3Url);
        s3Key = urlObj.pathname.startsWith("/") ? urlObj.pathname.slice(1) : urlObj.pathname;
      }
    } catch (e) {
      s3Key = "";
    }

    if (s3Key) {
      try {
        await fetch("/api/delete-video", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ s3Key }),
          credentials: "include",
        });
      } catch (e) {
        // Error handling
      }
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
          item.job_id === jobId ? { ...item, ...data } : item
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
          const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/video/crop/${item.job_id}`, {
            method: "GET",
            credentials: "include"
          });
          if (!res.ok) return;
          const data = await res.json();
          
          if (data.status && (data.status.toLowerCase() === "completed" || data.status.toLowerCase() === "failed")) {
            updateExportEntryByJobId(item.job_id, {
              status: data.status.charAt(0).toUpperCase() + data.status.slice(1),
              downloadUrl: data.downloadUrl || data.url || null,
            });
          } else if (data.status && data.progress !== undefined) {
            updateExportEntryByJobId(item.job_id, {
              status: data.status.charAt(0).toUpperCase() + data.status.slice(1),
              progress: data.progress,
            });
          }
        } catch (e) {
          // Ignore errors
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
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="M8 5v14l11-7z" />
      </svg>
    ),
    Download: (props) => (
      <svg width="20" height="20" fill="none" viewBox="0 0 20 20" {...props}>
        <path d="M10 3v10m0 0l4-4m-4 4l-4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    Delete: (props) => (
      <svg width="20" height="20" fill="none" viewBox="0 0 20 20" {...props}>
        <path d="M6 7v7a2 2 0 002 2h4a2 2 0 002-2V7M4 7h12M9 3h2a1 1 0 011 1v1H8V4a1 1 0 011-1z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    Sort: ({ direction = 'asc', ...props }) => (
      <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor" {...props}>
        {direction === 'asc' ? (
          <path d="M10 6l4 4H6l4-4z" />
        ) : (
          <path d="M10 14l-4-4h8l-4 4z" />
        )}
      </svg>
    )
  };

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">Your Exports</h1>
          <p className="text-white/60 text-lg">
            Manage and download your exported videos
          </p>
        </div>

        {/* Stats Overview */}
        <div className="flex flex-col md:flex-row gap-6 mb-8 w-full">
          <Card className="bg-storiq-card-bg border-storiq-border flex-1 min-w-[220px]">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm">Total Exports</p>
                  <p className="text-2xl font-bold text-white">{exportHistory.length}</p>
                </div>
                <div className="p-3 bg-blue-500/20 rounded-full">
                  <Icons.Play className="w-6 h-6 text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-storiq-card-bg border-storiq-border flex-1 min-w-[220px]">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm">Completed</p>
                  <p className="text-2xl font-bold text-white">{completedExports.length}</p>
                </div>
                <div className="p-3 bg-green-500/20 rounded-full">
                  <svg className="w-6 h-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Controls */}
        <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center mb-6">
          <div className="flex flex-wrap gap-4">
            <Button
              variant={filterStatus === 'all' ? 'default' : 'outline'}
              onClick={() => setFilterStatus('all')}
              className={`${
                filterStatus === 'all'
                  ? 'bg-storiq-primary text-white hover:bg-storiq-primary/90'
                  : 'bg-white/10 text-white border-storiq-border hover:bg-storiq-primary/20'
              }`}
            >
              All Exports
            </Button>
            <Button
              variant={filterStatus === 'completed' ? 'default' : 'outline'}
              onClick={() => setFilterStatus('completed')}
              className={`${
                filterStatus === 'completed'
                  ? 'bg-storiq-primary text-white hover:bg-storiq-primary/90'
                  : 'bg-white/10 text-white border-storiq-border hover:bg-storiq-primary/20'
              }`}
            >
              Completed
            </Button>
            <Button
              variant={filterStatus === 'failed' ? 'default' : 'outline'}
              onClick={() => setFilterStatus('failed')}
              className={`${
                filterStatus === 'failed'
                  ? 'bg-storiq-primary text-white hover:bg-storiq-primary/90'
                  : 'bg-white/10 text-white border-storiq-border hover:bg-storiq-primary/20'
              }`}
            >
              Failed
            </Button>
          </div>
          <Select value={sortBy} onValueChange={(value: 'filename' | 'date' | 'status') => setSortBy(value)}>
            <SelectTrigger className="w-[180px] bg-storiq-card-bg border-storiq-border text-white">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">Date</SelectItem>
              <SelectItem value="filename">Filename</SelectItem>
              <SelectItem value="status">Status</SelectItem>
            </SelectContent>
          </Select>
        </div>


        {/* Export History Table */}
        <Card className="bg-storiq-card-bg border-storiq-border">
          <CardHeader>
            <CardTitle className="text-white">Export History</CardTitle>
            <CardDescription className="text-white/60">
              {filteredAndSortedExports.length} exports found
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[400px]">
              <Table>
                <TableHeader className="sticky top-0 bg-storiq-card-bg z-10">
                  <TableRow>
                    <TableHead 
                      className="text-white cursor-pointer hover:bg-white/5 transition-colors"
                      onClick={() => handleSort('filename')}
                    >
                      <div className="flex items-center gap-2">
                        Filename
                        {sortBy === 'filename' && <Icons.Sort direction={sortDir} />}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="text-white cursor-pointer hover:bg-white/5 transition-colors"
                      onClick={() => handleSort('date')}
                    >
                      <div className="flex items-center gap-2">
                        Date
                        {sortBy === 'date' && <Icons.Sort direction={sortDir} />}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="text-white cursor-pointer hover:bg-white/5 transition-colors"
                      onClick={() => handleSort('status')}
                    >
                      <div className="flex items-center gap-2">
                        Status
                        {sortBy === 'status' && <Icons.Sort direction={sortDir} />}
                      </div>
                    </TableHead>
                    <TableHead className="text-white text-center">Download</TableHead>
                    <TableHead className="text-white text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAndSortedExports.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-12 text-white/60">
                        <div className="flex flex-col items-center gap-2">
                          <svg className="w-12 h-12 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          No exports found
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredAndSortedExports.map((item) => (
                      <TableRow key={item.export_id} className="group hover:bg-storiq-dark-lighter/50 transition-colors">
                        <TableCell className="font-medium text-white">
                          <div className="max-w-[200px] truncate" title={item.filename || item.name}>
                            {item.filename || item.name || "Untitled"}
                          </div>
                        </TableCell>
                        <TableCell className="text-white/80">
                          {item.date || item.createdAt ? new Date(item.date || item.createdAt).toLocaleDateString() : "-"}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="secondary"
                            className={`
                              ${item.status === "Completed" ? "bg-green-500/20 text-green-400" : ""}
                              ${item.status === "Failed" ? "bg-red-500/20 text-red-400" : ""}
                              ${!["Completed", "Failed"].includes(item.status) ? "bg-yellow-500/20 text-yellow-400" : ""}
                              border-none
                            `}
                          >
                            {item.status || "Unknown"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          {item.downloadUrl || item.url ? (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <a
                                    href={item.downloadUrl || item.url}
                                    download={item.filename || item.name}
                                    className="inline-flex"
                                  >
                                    <Button
                                      variant="outline"
                                      size="icon"
                                      className="border-green-500 text-green-500 hover:bg-green-500/10"
                                    >
                                      <Icons.Download />
                                    </Button>
                                  </a>
                                </TooltipTrigger>
                                <TooltipContent>Download</TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          ) : (
                            <span className="text-white/40 text-sm">N/A</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="destructive"
                                  size="icon"
                                  onClick={() => handleDeleteExport(item.export_id)}
                                  className="hover:scale-105 transition-transform"
                                >
                                  <Icons.Delete />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Delete Export</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Exports;