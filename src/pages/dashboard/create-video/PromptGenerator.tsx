import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/context/AuthContext";
import {
  Wand2,
  Copy,
  ChevronDown,
  ChevronUp,
  History,
  FileText,
} from "lucide-react";

function isErrorWithMessage(err: unknown): err is { message: string } {
  return (
    typeof err === "object" &&
    err !== null &&
    "message" in err &&
    typeof (err as { message?: unknown }).message === "string"
  );
}

const PromptGenerator: React.FC = () => {
  const { user } = useAuth();

  // --- STATE MANAGEMENT ---
  type Status = "idle" | "loading" | "success" | "error";
  const [prompt, setPrompt] = useState(
    `Create a video about sustainable living tips.

Feature a young female character.

Each scene should have a different background. Use a modern sans-serif font and vibrant nature visuals.`
  );
  const [generatedScript, setGeneratedScript] = useState<string | null>(null);

  // Status for script generation
  const [scriptStatus, setScriptStatus] = useState<Status>("idle");
  const [scriptError, setScriptError] = useState<string | null>(null);

  // Form validation error
  const [formError, setFormError] = useState<string | null>(null);

  // --- SCRIPT HISTORY ---
  type ScriptHistoryItem = {
    _id: string;
    prompt: string;
    script: string;
    createdAt: string;
  };
  const [scriptHistory, setScriptHistory] = useState<ScriptHistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState<boolean>(true);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null); // _id of item being deleted
  const [clearAllLoading, setClearAllLoading] = useState<boolean>(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [clearAllError, setClearAllError] = useState<string | null>(null);

  // --- Per-card state for script history section ---
  const [expandedCards, setExpandedCards] = useState<boolean[]>([]);
  const [copiedCards, setCopiedCards] = useState<boolean[]>([]);

  // Keep per-card state arrays in sync with scriptHistory length
  useEffect(() => {
    setExpandedCards((prev) =>
      scriptHistory.map((_, idx) => prev[idx] ?? false)
    );
    setCopiedCards((prev) =>
      scriptHistory.map((_, idx) => false)
    );
  }, [scriptHistory]);

  useEffect(() => {
    if (!user) {
      setHistoryLoading(false);
      return;
    }
    setHistoryLoading(true);
    setHistoryError(null);
    const userId = user.id || user.email;
    fetch(`/api/scripts/history?userId=${encodeURIComponent(userId)}`, {
      credentials: "include",
    })
      .then(async (res) => {
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err?.error || "Failed to fetch script history.");
        }
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) {
          setScriptHistory(data);
        } else {
          setScriptHistory([]);
        }
        setHistoryLoading(false);
      })
      .catch((err) => {
        setHistoryError(
          err && typeof err.message === "string"
            ? err.message
            : "Failed to fetch script history."
        );
        setHistoryLoading(false);
      });
  }, [user]);

  // --- HANDLERS ---
  const handleGenerateScript = async () => {
    if (!prompt.trim()) {
      setFormError("Prompt cannot be empty.");
      return;
    }
    setFormError(null);
    setScriptStatus("loading");
    setScriptError(null);
    setGeneratedScript(null);
    try {
      const res = await fetch("/api/generate-script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
        credentials: "include",
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || "Failed to generate script.");
      }
      const data = await res.json();
      if (!data?.script) throw new Error("No script returned from API.");
      setGeneratedScript(data.script);
      setScriptStatus("success");
      if (user) {
        const userId = (user && user.id) || (user && user.email);
        fetch("/api/scripts/history", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, prompt, script: data.script }),
          credentials: "include",
        }).catch(() => {});
      }
    } catch (err: unknown) {
      let message = "Unknown error";
      if (isErrorWithMessage(err)) {
        message = err.message;
      }
      setScriptError(message);
      setScriptStatus("error");
    }
  };

  // --- DELETE INDIVIDUAL HISTORY ITEM ---
  const handleDeleteHistoryItem = async (_id: string) => {
    setDeleteLoading(_id);
    setDeleteError(null);
    try {
      const res = await fetch(`/api/scripts/history/${_id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || "Failed to delete history item.");
      }
      setScriptHistory((prev) => prev.filter((item) => item._id !== _id));
    } catch (err: unknown) {
      let message = "Unknown error";
      if (isErrorWithMessage(err)) {
        message = err.message;
      }
      setDeleteError(message);
    } finally {
      setDeleteLoading(null);
    }
  };

  // --- CLEAR ALL HISTORY ---
  const handleClearAllHistory = async () => {
    if (!user) return;
    setClearAllLoading(true);
    setClearAllError(null);
    const userId = user.id || user.email;
    try {
      const res = await fetch(`/api/scripts/history?userId=${encodeURIComponent(userId)}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || "Failed to clear history.");
      }
      setScriptHistory([]);
    } catch (err: unknown) {
      let message = "Unknown error";
      if (isErrorWithMessage(err)) {
        message = err.message;
      }
      setClearAllError(message);
    } finally {
      setClearAllLoading(false);
    }
  };

  return (
    <div className="p-2 sm:p-4 md:p-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <Wand2 className="w-8 h-8 text-storiq-purple" />
          Script Generator
        </h1>
        <p className="text-white/60 text-base md:text-lg">
          Describe your vision and let AI generate a script for your video.
        </p>
      </div>

      <div className="flex flex-col gap-6 md:gap-8">
        {/* Prompt Input Card */}
        <div>
          <div className="bg-storiq-card-bg/50 border-storiq-border rounded-2xl shadow-2xl p-6 mb-0">
            <h3 className="text-white text-lg font-semibold mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-storiq-purple" />
              Script Prompt
            </h3>
            <Textarea
              value={prompt}
              onChange={(e) => {
                setPrompt(e.target.value);
                if (formError) setFormError(null);
              }}
              placeholder="Describe your video here... Be as detailed as possible for better results."
              className="bg-storiq-card-bg border-storiq-border text-white placeholder:text-white/40 min-h-[150px] resize-none focus:border-storiq-purple focus:ring-storiq-purple font-medium"
            />

            {formError && (
              <Alert variant="destructive" className="mt-3 border-red-500/50 bg-red-500/10">
                <AlertTitle className="text-red-200">Validation Error</AlertTitle>
                <AlertDescription className="text-red-300">{formError}</AlertDescription>
              </Alert>
            )}

            <Button
              onClick={handleGenerateScript}
              disabled={scriptStatus === "loading" || !prompt.trim()}
              className="w-full mt-4 bg-gradient-to-r from-storiq-purple to-storiq-purple/80 hover:from-storiq-purple/90 hover:to-storiq-purple/70 text-white font-semibold h-12 text-base transition-all duration-200"
            >
              {scriptStatus === "loading" ? (
                <span className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  Generating Script...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Wand2 className="w-4 h-4" />
                  Generate Script
                </span>
              )}
            </Button>

            {scriptStatus === "error" && scriptError && (
              <Alert variant="destructive" className="mt-3 border-red-500/50 bg-red-500/10">
                <AlertTitle className="text-red-200">Script Generation Failed</AlertTitle>
                <AlertDescription className="text-red-300">{scriptError}</AlertDescription>
              </Alert>
            )}

            {scriptStatus === "success" && generatedScript && (
              <div className="flex items-center gap-2 mt-3 text-green-400 text-sm font-semibold p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                Script generated successfully!
              </div>
            )}
          </div>
        </div>

        {/* Generated Script Display */}
        {generatedScript && (
          <div>
            <div className="bg-storiq-card-bg/50 border-storiq-border rounded-2xl shadow-2xl p-6 mb-0">
              <h3 className="text-white text-lg font-semibold mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-storiq-purple" />
                Generated Script
              </h3>
              <div className="bg-storiq-card-bg border border-storiq-border rounded-lg p-4 text-white/80 whitespace-pre-wrap max-h-60 overflow-y-auto text-sm leading-relaxed hide-scrollbar">
                {generatedScript}
              </div>
            </div>
          </div>
        )}

        {/* Script History Section */}
        <div>
          <div className="bg-storiq-card-bg/50 border-storiq-border rounded-2xl shadow-2xl p-6">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <History className="w-6 h-6 text-storiq-purple" />
              Script History
            </h2>

            {/* Clear All History Button */}
            {scriptHistory.length > 0 && !historyLoading && (
              <div className="flex justify-end mb-4">
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={handleClearAllHistory}
                  disabled={clearAllLoading}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-xs"
                >
                  {clearAllLoading ? "Clearing..." : "Clear All History"}
                </Button>
              </div>
            )}
            {clearAllError && (
              <Alert variant="destructive" className="mb-4 border-red-500/50 bg-red-500/10">
                <AlertTitle className="text-red-200">Error</AlertTitle>
                <AlertDescription className="text-red-300">{clearAllError}</AlertDescription>
              </Alert>
            )}

            {historyLoading ? (
              <div className="flex items-center justify-center p-8 text-white/60">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-storiq-purple mr-3"></div>
                Loading history...
              </div>
            ) : historyError ? (
              <Alert variant="destructive" className="border-red-500/50 bg-red-500/10">
                <AlertTitle className="text-red-200">Error Loading History</AlertTitle>
                <AlertDescription className="text-red-300">{historyError}</AlertDescription>
              </Alert>
            ) : scriptHistory.length === 0 ? (
              <div className="text-center py-12 text-white/40">
                <History className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p className="text-lg">No script history found</p>
                <p className="text-sm mt-1">Your generated scripts will appear here</p>
              </div>
            ) : (
              <div className="space-y-4">
                {deleteError && (
                  <Alert variant="destructive" className="mb-2 border-red-500/50 bg-red-500/10">
                    <AlertTitle className="text-red-200">Error</AlertTitle>
                    <AlertDescription className="text-red-300">{deleteError}</AlertDescription>
                  </Alert>
                )}
                {scriptHistory.map((item, idx) => {
                  const isExpanded = expandedCards[idx] || false;
                  const copied = copiedCards[idx] || false;

                  const handleCopy = () => {
                    navigator.clipboard.writeText(item.script);
                    setCopiedCards((prev) => {
                      const updated = [...prev];
                      updated[idx] = true;
                      return updated;
                    });
                    setTimeout(() => {
                      setCopiedCards((prev) => {
                        const updated = [...prev];
                        updated[idx] = false;
                        return updated;
                      });
                    }, 1200);
                  };

                  const handleToggleExpand = () => {
                    setExpandedCards((prev) => {
                      const updated = [...prev];
                      updated[idx] = !updated[idx];
                      return updated;
                    });
                  };

                  return (
                    <div key={item._id || idx} className="bg-storiq-card-bg border-storiq-border rounded-xl p-5 hover:border-storiq-purple/30 transition-all duration-200">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1 min-w-0">
                          <div className="text-white font-semibold mb-1 line-clamp-2">Prompt: {item.prompt}</div>
                          <div className="text-white/50 text-xs">
                            {new Date(item.createdAt).toLocaleString()}
                          </div>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={handleCopy}
                            className="h-8 px-3 text-xs border-storiq-purple/50 hover:bg-storiq-purple/20 text-white"
                          >
                            <Copy className="w-3 h-3 mr-1 text-white" />
                            {copied ? "Copied!" : "Copy"}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={handleToggleExpand}
                            className="h-8 px-3 text-xs border-storiq-purple/50 hover:bg-storiq-purple/20 text-white"
                          >
                            {isExpanded ? (
                              <ChevronUp className="w-3 h-3 mr-1 text-white" />
                            ) : (
                              <ChevronDown className="w-3 h-3 mr-1 text-white" />
                            )}
                            {isExpanded ? "Less" : "More"}
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteHistoryItem(item._id)}
                            disabled={deleteLoading === item._id}
                            className="h-8 px-3 text-xs ml-1 bg-red-600 hover:bg-red-700 text-white"
                          >
                            {deleteLoading === item._id ? "Deleting..." : "Delete"}
                          </Button>
                        </div>
                      </div>

                      <div className={`text-white/70 text-sm leading-relaxed transition-all duration-200 overflow-hidden ${
                        isExpanded ? "max-h-none" : "max-h-20"
                      }`}>
                        <div className="font-semibold text-white/90 mb-1">Script:</div>
                        {item.script}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromptGenerator;