"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Code2,
  FileJson,
  Copy,
  Check,
  RefreshCw,
  Layout,
  Edit3,
  Eye,
  Download,
  UploadCloud,
  Loader2,
  X,
  ClipboardList,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "./ui/button";
import { DEFAULT_TEMPLATE_1, DEFAULT_TEMPLATE_2 } from "@/utils/constants";

export default function CVJsonBuilder() {
  const [activeTemplate, setActiveTemplate] = useState<"template1" | "template2">("template1");
  const [jsonContent, setJsonContent] = useState(JSON.stringify(DEFAULT_TEMPLATE_1, null, 2));
  const [isCopied, setIsCopied] = useState(false);
  const [viewMode, setViewMode] = useState<"edit" | "preview">("edit");
  const [error, setError] = useState<string | null>(null);

  // New states for upload and scanning
  const [isUploading, setIsUploading] = useState(false);
  const [scannedText, setScannedText] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const template = activeTemplate === "template1" ? DEFAULT_TEMPLATE_1 : DEFAULT_TEMPLATE_2;
    setJsonContent(JSON.stringify(template, null, 2));
    setError(null);
  }, [activeTemplate]);

  const handleAutoFill = async () => {
    if (!scannedText) return;

    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch("/api/generate-gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: scannedText,
          customStructure: jsonContent,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setJsonContent(JSON.stringify(result, null, 2));
        setViewMode("edit");
      } else {
        const errData = await response.json();
        setError(errData.error || "Gemini failed to parse CV text");
      }
    } catch (err: any) {
      setError(err.message || "Connection error with Gemini API");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleJsonChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setJsonContent(value);

    try {
      JSON.parse(value);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(jsonContent);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([jsonContent], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cv-structure-${activeTemplate}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formatJson = () => {
    try {
      const parsed = JSON.parse(jsonContent);
      setJsonContent(JSON.stringify(parsed, null, 2));
      setError(null);
    } catch (err: any) {
      setError("Cannot format: Invalid JSON");
    }
  };

  // File Upload Handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      await processFile(files[0]);
    }
  };

  const processFile = async (file: File) => {
    const fileType = file.name.split(".").pop()?.toLowerCase();

    if (fileType === "json") {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        try {
          const parsed = JSON.parse(content);
          setJsonContent(JSON.stringify(parsed, null, 2));
          setError(null);
        } catch (err) {
          setError("Failed to parse uploaded JSON file");
        }
      };
      reader.readAsText(file);
    } else if (fileType === "pdf") {
      setIsUploading(true);
      try {
        const reader = new FileReader();
        reader.onload = async (e) => {
          const base64Content = e.target?.result as string;
          const response = await fetch("/api/process-pdf", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ fileContent: base64Content }),
          });

          if (response.ok) {
            const { text } = await response.json();
            setScannedText(text);
          } else {
            setError("Failed to process PDF text");
          }
        };
        reader.readAsDataURL(file);
      } catch (err) {
        setError("Error uploading PDF");
      } finally {
        setIsUploading(false);
      }
    } else {
      setError("Only .json or .pdf files are supported");
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-12 text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center justify-center p-2 mb-4 rounded-2xl bg-blue-500/10 border border-blue-500/20"
          >
            <Code2 className="w-6 h-6 text-blue-400 mr-2" />
            <span className="text-blue-400 font-semibold tracking-wide uppercase text-xs">
              CV JSON Customizer
            </span>
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 tracking-tight">
            Build Your{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
              CV Structure
            </span>
          </h1>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg">
            Upload a file (PDF/JSON) to start. PDF text will be shown as a reference for your JSON.
          </p>
        </header>

        {/* Upload Zone */}
        <div className="mb-10 space-y-6">
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`relative group cursor-pointer border-2 border-dashed rounded-2xl p-8 text-center transition-all
                            ${dragActive ? "border-blue-500 bg-blue-500/10 shadow-[0_0_30px_rgba(59,130,246,0.1)]" : "border-slate-700 bg-slate-800/30 hover:border-slate-500 hover:bg-slate-800/50"}
                            ${isUploading ? "opacity-50 cursor-not-allowed" : ""}
                        `}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,.pdf"
              onChange={(e) => e.target.files?.[0] && processFile(e.target.files[0])}
              className="hidden"
            />
            <div className="flex flex-col items-center justify-center">
              {isUploading ? (
                <Loader2 className="w-10 h-10 text-blue-400 animate-spin mb-3" />
              ) : (
                <UploadCloud className="w-10 h-10 text-slate-500 group-hover:text-blue-400 transition-colors mb-3" />
              )}
              <p className="text-lg font-medium text-slate-300 group-hover:text-white transition-colors">
                {isUploading
                  ? "Reading file content..."
                  : "Click or drop your CV (PDF) or JSON here"}
              </p>
              <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
                JSON will populate the editor instantly. PDF will extract text to help you fill the
                fields manually.
              </p>
            </div>
          </div>

          {/* Reference Text Display (Now below upload) */}
          <AnimatePresence>
            {scannedText && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="bg-slate-800/50 backdrop-blur-xl border border-blue-500/30 rounded-2xl p-6 shadow-xl relative"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs font-semibold text-blue-400 uppercase tracking-wider flex items-center">
                    <ClipboardList className="w-4 h-4 mr-2" /> Scanned Text Reference
                  </h3>
                  <button
                    onClick={() => setScannedText(null)}
                    className="p-1.5 hover:bg-slate-700 rounded-lg text-slate-500 hover:text-white transition-all shadow-inner"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                  <div className="lg:col-span-3">
                    <div className="max-h-[300px] overflow-y-auto text-[11px] text-slate-400 font-mono leading-relaxed custom-scrollbar p-4 bg-[#020617]/50 rounded-xl border border-slate-700/50 whitespace-pre-wrap">
                      {scannedText}
                    </div>
                  </div>
                  <div className="flex flex-col justify-center space-y-4">
                    <Button
                      onClick={handleAutoFill}
                      disabled={isGenerating}
                      className="w-full h-auto min-h-[100px] bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white border-none shadow-lg shadow-blue-900/40 relative overflow-hidden group/btn py-6 flex flex-col items-center justify-center gap-0"
                    >
                      <div className="absolute inset-0 bg-white/10 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300 pointer-events-none" />

                      {isGenerating ? (
                        <div className="flex flex-col items-center">
                          <Loader2 className="w-6 h-6 mb-2 animate-spin text-white" />
                          <span className="text-sm font-medium">Processing...</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center w-full">
                          <RefreshCw className="w-6 h-6 mb-2 group-hover/btn:rotate-180 transition-transform duration-500 text-blue-200" />
                          <span className="font-bold text-lg">✨ Auto-Fill Template</span>
                          <span className="text-[11px] text-blue-100/70 mt-1 uppercase tracking-wider font-semibold">
                            Via Gemini AI
                          </span>
                        </div>
                      )}
                    </Button>
                    <p className="text-[10px] text-slate-500 text-center italic bg-blue-500/5 p-3 rounded-lg border border-blue-500/10">
                      AI mapping may take up to 60s for complex CVs. Please wait while it processes.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Controls & Editor */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left: Template & Options */}
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-2xl p-6 shadow-xl">
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center">
                <Layout className="w-4 h-4 mr-2" /> Templates
              </h3>
              <div className="space-y-3">
                <button
                  onClick={() => setActiveTemplate("template1")}
                  className={`w-full text-left p-4 rounded-xl transition-all border ${
                    activeTemplate === "template1"
                      ? "bg-blue-600/20 border-blue-500/50 text-white shadow-[0_0_20px_rgba(37,99,235,0.15)]"
                      : "bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500 hover:bg-slate-700/50"
                  }`}
                >
                  <div className="font-bold flex items-center">
                    Template Alpha
                    {activeTemplate === "template1" && (
                      <Check className="w-4 h-4 ml-auto text-blue-400" />
                    )}
                  </div>
                  <div className="text-xs mt-1 opacity-70">Deep professional structure</div>
                </button>
                <button
                  onClick={() => setActiveTemplate("template2")}
                  className={`w-full text-left p-4 rounded-xl transition-all border ${
                    activeTemplate === "template2"
                      ? "bg-cyan-600/20 border-cyan-500/50 text-white shadow-[0_0_20px_rgba(6,182,212,0.15)]"
                      : "bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500 hover:bg-slate-700/50"
                  }`}
                >
                  <div className="font-bold flex items-center">
                    Template Bravo
                    {activeTemplate === "template2" && (
                      <Check className="w-4 h-4 ml-auto text-cyan-400" />
                    )}
                  </div>
                  <div className="text-xs mt-1 opacity-70">Clean & skills-focused structure</div>
                </button>
              </div>
            </div>

            <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-2xl p-6 shadow-xl">
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
                Quick Actions
              </h3>
              <div className="grid grid-cols-1 gap-3">
                <Button
                  onClick={formatJson}
                  variant="outline"
                  className="w-full justify-start border-slate-700 hover:bg-slate-700/50 text-slate-200"
                >
                  <RefreshCw className="w-4 h-4 mr-2" /> Auto-Format
                </Button>
                <Button
                  onClick={copyToClipboard}
                  variant="outline"
                  className="w-full justify-start border-slate-700 hover:bg-slate-700/50 text-slate-200"
                >
                  {isCopied ? (
                    <Check className="w-4 h-4 mr-2 text-green-400" />
                  ) : (
                    <Copy className="w-4 h-4 mr-2" />
                  )}
                  {isCopied ? "Copied!" : "Copy JSON"}
                </Button>
                <Button
                  onClick={handleDownload}
                  className="w-full justify-start bg-blue-600 hover:bg-blue-700 text-white border-none shadow-lg shadow-blue-900/20"
                >
                  <Download className="w-4 h-4 mr-2" /> Download .json
                </Button>
              </div>
            </div>
          </div>

          {/* Right: Editor & Preview */}
          <div className="lg:col-span-9 space-y-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex bg-slate-800/80 p-1 rounded-lg border border-slate-700">
                <button
                  onClick={() => setViewMode("edit")}
                  className={`flex items-center px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                    viewMode === "edit"
                      ? "bg-slate-700 text-white shadow-sm"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <Edit3 className="w-3.5 h-3.5 mr-2" /> Editor
                </button>
                <button
                  onClick={() => setViewMode("preview")}
                  className={`flex items-center px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                    viewMode === "preview"
                      ? "bg-slate-700 text-white shadow-sm"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <Eye className="w-3.5 h-3.5 mr-2" /> Preview
                </button>
              </div>

              {error && (
                <div className="text-rose-400 text-xs font-mono bg-rose-500/10 border border-rose-500/20 px-3 py-1 rounded-full flex items-center animate-pulse">
                  <span className="w-1.5 h-1.5 bg-rose-500 rounded-full mr-2" />
                  Error:{" "}
                  {typeof error === "string"
                    ? error.substring(0, 60)
                    : (error as any).message || "Unknown Error"}
                </div>
              )}
            </div>

            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl blur opacity-10 group-focus-within:opacity-20 transition duration-1000"></div>
              <div className="relative bg-[#020617] rounded-2xl border border-slate-800 overflow-hidden min-h-[600px] flex flex-col shadow-2xl">
                {/* Editor Tab Bar */}
                <div className="bg-[#1e293b]/50 border-b border-slate-800 px-4 py-2 flex items-center space-x-2">
                  <div className="flex space-x-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-rose-500/50"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500/50"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/50"></div>
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono ml-4 tracking-widest uppercase">
                    cv-builder-v1.json
                  </div>
                </div>

                <AnimatePresence mode="wait">
                  {viewMode === "edit" ? (
                    <motion.div
                      key="edit"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex-1"
                    >
                      <textarea
                        value={jsonContent}
                        onChange={handleJsonChange}
                        spellCheck={false}
                        className="w-full h-full min-h-[550px] bg-transparent p-6 font-mono text-sm text-blue-300 outline-none resize-none selection:bg-blue-500/30 custom-scrollbar"
                        placeholder="Paste or write your CV JSON here..."
                      />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="preview"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex-1 p-6 overflow-auto custom-scrollbar"
                    >
                      <div className="rounded-xl bg-slate-900/50 border border-slate-800 p-8">
                        {error ? (
                          <div className="text-center py-20">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-rose-500/10 mb-4">
                              <FileJson className="w-8 h-8 text-rose-500" />
                            </div>
                            <p className="text-rose-400 font-semibold mb-2 text-lg">
                              Invalid JSON Structure
                            </p>
                            <p className="text-slate-500 text-sm max-w-xs mx-auto">
                              Please resolve the syntax errors in the editor to view the live
                              preview.
                            </p>
                          </div>
                        ) : (
                          <div className="font-mono text-sm space-y-2">
                            {(() => {
                              try {
                                const data = JSON.parse(jsonContent);
                                return (
                                  <div className="space-y-4 text-slate-300">
                                    {Object.entries(data).map(([key, value]) => (
                                      <div
                                        key={key}
                                        className="border-l-2 border-slate-800 pl-4 py-1 hover:border-blue-500/50 transition-colors group/item"
                                      >
                                        <span className="text-blue-400 font-bold group-hover/item:text-blue-300 transition-colors">
                                          &quot;{key}&quot;
                                        </span>
                                        :{" "}
                                        {typeof value === "object" ? (
                                          <span className="text-slate-500">
                                            {Array.isArray(value)
                                              ? `[Array(${value.length})]`
                                              : "{Object}"}
                                          </span>
                                        ) : (
                                          <span
                                            className={
                                              typeof value === "string"
                                                ? "text-emerald-400"
                                                : "text-amber-400"
                                            }
                                          >
                                            {JSON.stringify(value)}
                                          </span>
                                        )}
                                        {typeof value === "object" && value !== null && (
                                          <div className="mt-2 ml-4">
                                            <pre className="text-[11px] text-slate-400 bg-slate-800/20 p-4 rounded-xl border border-slate-800/50 group-hover/item:bg-slate-800/40 transition-colors whitespace-pre-wrap break-all">
                                              {JSON.stringify(value, null, 2)}
                                            </pre>
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                );
                              } catch {
                                return (
                                  <div className="text-slate-500 animate-pulse">
                                    Rendering preview...
                                  </div>
                                );
                              }
                            })()}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
