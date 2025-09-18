import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import React, { useEffect, useState } from "react";

const Exports = () => {
  const [exportHistory, setExportHistory] = useState<any[]>([]);

  // Remove export by export_id and update localStorage/UI
  const handleDeleteExport = (exportId: string) => {
    setExportHistory(prev => {
      const updated = prev.filter(item => item.export_id !== exportId);
      localStorage.setItem("exports", JSON.stringify(updated));
      return updated;
    });
  };

  useEffect(() => {
    try {
      const raw = localStorage.getItem("exports");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setExportHistory(parsed);
        }
      }
    } catch (e) {
      setExportHistory([]);
    }
  }, []);

  // Poll for status updates for pending/processing exports
  useEffect(() => {
    // Helper to update both state and localStorage
    // Update export entry by backend jobId, not export_id
    const updateExportEntryByJobId = (jobId: string, data: any) => {
      setExportHistory(prev => {
        const updated = prev.map(item =>
          item.job_id === jobId ? { ...item, ...data } : item
        );
        localStorage.setItem("exports", JSON.stringify(updated));
        return updated;
      });
    };

    // Find all pending/processing jobs
    const pollingEntries = exportHistory.filter(
      item =>
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
            (data.status.toLowerCase() === "completed" || data.status.toLowerCase() === "failed")
          ) {
            console.log('[Polling] Backend response for job', item.job_id, data);
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
          <p className="text-white/60">Here are all the videos that you exported.</p>
        </div>

        {/* Filters */}
        <div className="flex space-x-4 mb-8">
          <Select defaultValue="date">
            <SelectTrigger className="w-32 bg-storiq-card-bg border-storiq-border text-white">
              <SelectValue placeholder="Date" />
            </SelectTrigger>
            <SelectContent className="bg-storiq-card-bg border-storiq-border">
              <SelectItem value="date" className="text-white hover:bg-storiq-purple/20">Date</SelectItem>
              <SelectItem value="name" className="text-white hover:bg-storiq-purple/20">Name</SelectItem>
            </SelectContent>
          </Select>

          <Select defaultValue="status">
            <SelectTrigger className="w-32 bg-storiq-card-bg border-storiq-border text-white">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="bg-storiq-card-bg border-storiq-border">
              <SelectItem value="status" className="text-white hover:bg-storiq-purple/20">Status</SelectItem>
              <SelectItem value="completed" className="text-white hover:bg-storiq-purple/20">Completed</SelectItem>
              <SelectItem value="failed" className="text-white hover:bg-storiq-purple/20">Failed</SelectItem>
            </SelectContent>
          </Select>

          <Select defaultValue="format">
            <SelectTrigger className="w-32 bg-storiq-card-bg border-storiq-border text-white">
              <SelectValue placeholder="Format" />
            </SelectTrigger>
            <SelectContent className="bg-storiq-card-bg border-storiq-border">
              <SelectItem value="format" className="text-white hover:bg-storiq-purple/20">Format</SelectItem>
              <SelectItem value="mp4" className="text-white hover:bg-storiq-purple/20">MP4</SelectItem>
              <SelectItem value="mov" className="text-white hover:bg-storiq-purple/20">MOV</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* In Progress Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">In Progress</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {exportHistory.filter(item => item.status !== "Completed").length === 0 ? (
              <div className="col-span-3 text-white/60 text-center py-8">No exports in progress.</div>
            ) : (
              exportHistory
                .filter(item => item.status !== "Completed")
                .map((item, idx) => (
                  <div key={item.export_id} className="bg-storiq-card-bg border border-storiq-border rounded-2xl overflow-hidden">
                    <div className="relative h-48 w-full bg-slate-800 flex items-center justify-center">
                      {/* Striped background created with CSS */}
                      <div
                        className="absolute inset-0"
                        style={{
                          backgroundImage: 'repeating-linear-gradient(135deg, transparent, transparent 10px, rgba(0, 0, 0, 0.2) 10px, rgba(0, 0, 0, 0.2) 20px)'
                        }}
                      ></div>
                      {/* Play button overlay */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-black/50 rounded-full h-16 w-16 flex items-center justify-center cursor-pointer">
                          <PlayIcon className="h-8 w-8 text-white" />
                        </div>
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="text-white text-xl font-bold mb-1">{item.filename || item.name || "Untitled"}</h3>
                      <p className="text-white/60 text-sm mb-4">
                        {item.status || "Exporting"}
                        {item.resolution ? ` • ${item.resolution}` : ""}
                        {item.format ? ` • ${item.format}` : ""}
                      </p>
                      {/* Progress Bar */}
                      {typeof item.progress === "number" ? (
                        <div className="flex items-center gap-x-3 mb-4">
                          <div className="w-full bg-storiq-dark rounded-full h-2">
                            <div
                              className="bg-storiq-purple h-2 rounded-full"
                              style={{ width: `${item.progress}%` }}
                            ></div>
                          </div>
                          <p className="text-storiq-purple text-sm font-medium whitespace-nowrap">
                            {item.progress}%
                          </p>
                        </div>
                      ) : null}
                      {(() => {
                        // Log just before rendering the download button
                        if (item.downloadUrl || item.url) {
                          console.log('[In Progress] Download button:', { jobId: item.export_id, downloadUrl: item.downloadUrl || item.url });
                        }
                        return null;
                      })()}
                      <a
                        href={item.downloadUrl || item.url}
                        download={item.filename || item.name || "exported-video"}
                        className="block w-full text-center border border-storiq-border text-white hover:bg-storiq-purple hover:border-storiq-purple rounded-md py-2 transition-colors"
                        style={{ pointerEvents: (item.downloadUrl || item.url) ? "auto" : "none", opacity: (item.downloadUrl || item.url) ? 1 : 0.5 }}
                        tabIndex={(item.downloadUrl || item.url) ? 0 : -1}
                      >
                        Download
                      </a>
                      <Button
                        variant="destructive"
                        className="mt-4 w-full"
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
                <div className="p-4 text-white/60 col-span-6">No exports found.</div>
              ) : (
                exportHistory.map((item, index) => (
                  <div key={item.export_id} className="p-4 grid grid-cols-6 gap-4 text-white items-center">
                    <div className="font-medium">{item.filename || item.name || "Untitled"}</div>
                    <div className="text-white/60">{item.date || item.createdAt || "-"}</div>
                    <div className="text-white/60">
                      {item.crop
                        ? `${item.crop.start ?? "-"} - ${item.crop.end ?? "-"}`
                        : "-"}
                    </div>
                    <div>
                      <span className={`px-2 py-1 rounded-md text-sm font-medium ${
                        item.status === 'Completed'
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {item.status || "Completed"}
                      </span>
                    </div>
                    <div>
                      {(item.downloadUrl || item.url) ? (
                        <>
                          {(() => {
                            // Log just before rendering the download button
                            console.log('[History] Download button:', { jobId: item.export_id, downloadUrl: item.downloadUrl || item.url });
                            return null;
                          })()}
                          <a
                            href={item.downloadUrl || item.url}
                            download={item.filename || item.name || "exported-video"}
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
