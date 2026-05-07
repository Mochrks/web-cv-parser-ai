"use client";

import React, { useState, useEffect, useRef } from "react";
import {
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
  Sparkles,
  Cpu,
  FileText,
  Zap,
  ArrowRight,
  Star,
  Braces,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { DEFAULT_TEMPLATE_1, DEFAULT_TEMPLATE_2 } from "@/utils/constants";

export default function CVJsonBuilder() {
  const [activeTemplate, setActiveTemplate] = useState<"template1" | "template2">("template1");
  const [jsonContent, setJsonContent] = useState(JSON.stringify(DEFAULT_TEMPLATE_1, null, 2));
  const [isCopied, setIsCopied] = useState(false);
  const [viewMode, setViewMode] = useState<"edit" | "preview">("edit");
  const [error, setError] = useState<string | null>(null);
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
        body: JSON.stringify({ text: scannedText, customStructure: jsonContent }),
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
    } catch {
      setError("Cannot format: Invalid JSON");
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const files = e.dataTransfer.files;
    if (files && files[0]) await processFile(files[0]);
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
        } catch {
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
      } catch {
        setError("Error uploading PDF");
      } finally {
        setIsUploading(false);
      }
    } else {
      setError("Only .json or .pdf files are supported");
    }
  };

  const lineCount = jsonContent.split("\n").length;

  return (
    <div className="min-h-screen text-[#F5F7FA] font-sans">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 py-10 md:py-16">
        {/* ══════════════════════════════════════
            HERO — Bold Editorial Style
           ══════════════════════════════════════ */}
        <header className="mb-20 relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Top Nav Row */}
            <div className="flex items-center justify-between mb-12">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#A6F23A] flex items-center justify-center">
                  <Braces className="w-5 h-5 text-[#07111F]" strokeWidth={3} />
                </div>
                <span className="text-xl font-extrabold tracking-tight">CV Parser</span>
              </div>
              <div className="hidden md:flex items-center gap-6"></div>
            </div>

            {/* Hero Title — Oversized & Bold */}
            <div className="max-w-4xl">
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[0.95] mb-8">
                Transform
                <br />
                CVs Into{" "}
                <span className="relative inline-block">
                  <span className="highlight-marker text-white">JSON</span>
                </span>
                <br />
                <span className="text-[#A6F23A]/60">Instantly.</span>
              </h1>

              <p className="text-[#f5f7fa]/75 text-lg md:text-xl max-w-xl leading-relaxed mb-10">
                Our AI engine reads, extracts, and structures every detail from your resume into
                production-ready JSON format.
              </p>
            </div>

            {/* Stats Row — Sparkz Style */}
            <div className="flex flex-wrap gap-12 items-end">
              {[
                { val: "< 60s", label: "Processing Time", icon: Zap },
                { val: "2", label: "JSON Templates", icon: FileText },
                { val: "AI", label: "Gemini Engine", icon: Cpu },
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + i * 0.1 }}
                  className="flex flex-col"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <stat.icon className="w-4 h-4 text-[#A6F23A]" />
                    <span className="text-3xl md:text-4xl font-black text-[#f5f7fa] tracking-tight">
                      {stat.val}
                    </span>
                  </div>
                  <span className="text-[11px] text-[#A8B3C7]/70 uppercase tracking-[0.15em] font-semibold">
                    {stat.label}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </header>

        {/* ══════════════════════════════════════
            UPLOAD DROPZONE
           ══════════════════════════════════════ */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-16"
        >
          <div className="flex items-center gap-3 mb-6">
            <Star className="w-5 h-5 text-[#A6F23A]" fill="#A6F23A" />
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">Upload Your CV</h2>
          </div>

          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`dropzone p-12 md:p-16 text-center group ${dragActive ? "active" : ""} ${isUploading ? "opacity-50 pointer-events-none" : ""}`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,.pdf"
              onChange={(e) => e.target.files?.[0] && processFile(e.target.files[0])}
              className="hidden"
            />
            <div className="flex flex-col items-center gap-5">
              {isUploading ? (
                <div className="w-20 h-20 rounded-3xl bg-[#A6F23A]/10 flex items-center justify-center">
                  <Loader2 className="w-10 h-10 text-[#A6F23A] animate-spin" />
                </div>
              ) : (
                <div className="w-20 h-20 rounded-3xl bg-[#A6F23A]/[0.07] border border-[#A6F23A]/10 flex items-center justify-center group-hover:bg-[#A6F23A] group-hover:border-[#A6F23A] transition-all duration-500 group-hover:scale-110">
                  <UploadCloud className="w-10 h-10 text-[#A6F23A]/50 group-hover:text-[#07111F] transition-colors duration-300" />
                </div>
              )}

              <div>
                <p className="text-xl md:text-2xl font-bold text-[#F5F7FA] mb-2 group-hover:text-[#A6F23A] transition-colors duration-300">
                  {isUploading ? "Scanning document..." : "Drop your file or click to browse"}
                </p>
                <p className="text-sm text-[#A8B3C7]/50 max-w-md mx-auto">
                  AI will extract and map all fields automatically from your PDF or JSON
                </p>
              </div>

              <div className="flex items-center gap-3 mt-2">
                {[".pdf", ".json"].map((ext) => (
                  <span
                    key={ext}
                    className="px-4 py-1.5 rounded-full text-xs font-bold bg-[#122033] border border-white/[0.06] text-[#A8B3C7]/60 uppercase tracking-wider"
                  >
                    {ext}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </motion.section>

        {/* ══════════════════════════════════════
            SCANNED TEXT REFERENCE
           ══════════════════════════════════════ */}
        <AnimatePresence>
          {scannedText && (
            <motion.section
              initial={{ opacity: 0, y: 30, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30, scale: 0.97 }}
              className="glass-panel p-8 md:p-10 mb-16 border-[#A6F23A]/10"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-extrabold text-[#A6F23A] uppercase tracking-[0.2em] flex items-center gap-2">
                  <ClipboardList className="w-4 h-4" /> Extracted Text
                </h3>
                <button
                  onClick={() => setScannedText(null)}
                  className="p-2.5 rounded-xl hover:bg-white/[0.06] text-[#A8B3C7]/40 hover:text-white transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <div className="lg:col-span-3">
                  <div className="scan-effect max-h-[300px] overflow-y-auto text-[11px] text-[#A8B3C7]/70 font-mono leading-relaxed custom-scrollbar p-6 bg-[#07111F]/60 rounded-2xl border border-white/[0.04] whitespace-pre-wrap">
                    {scannedText}
                  </div>
                </div>
                <div className="flex flex-col justify-center gap-4">
                  <button
                    onClick={handleAutoFill}
                    disabled={isGenerating}
                    className="btn-neon w-full py-6 flex flex-col items-center gap-3"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-7 h-7 animate-spin" />
                        <span className="text-sm font-extrabold">Processing...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-7 h-7" />
                        <span className="text-lg font-black">Auto-Fill</span>
                        <span className="text-[10px] opacity-60 uppercase tracking-[0.2em] font-bold">
                          Gemini Engine
                        </span>
                      </>
                    )}
                  </button>
                  <p className="text-[10px] text-[#A8B3C7]/30 text-center italic p-3 rounded-xl bg-[#A6F23A]/[0.03] border border-[#A6F23A]/[0.06]">
                    AI may take up to 60s for complex CVs
                  </p>
                </div>
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {/* ══════════════════════════════════════
            EDITOR SECTION — Bold Section Title
           ══════════════════════════════════════ */}
        <section className="mb-8">
          <div className="flex items-center gap-3 mb-8">
            <Star className="w-5 h-5 text-[#A6F23A]" fill="#A6F23A" />
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">JSON Builder</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* ── Sidebar ── */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="lg:col-span-3 space-y-6"
            >
              {/* Templates */}
              <div className="glass-panel p-6">
                <h3 className="text-[11px] font-extrabold text-[#A8B3C7]/50 uppercase tracking-[0.2em] mb-5 flex items-center gap-2">
                  <Layout className="w-3.5 h-3.5 text-[#A6F23A]/50" /> Templates
                </h3>
                <div className="space-y-3">
                  {[
                    {
                      key: "template1" as const,
                      name: "Alpha",
                      desc: "Deep professional structure",
                    },
                    { key: "template2" as const, name: "Bravo", desc: "Skills-focused layout" },
                  ].map((t) => (
                    <button
                      key={t.key}
                      onClick={() => setActiveTemplate(t.key)}
                      className={`template-card w-full text-left ${activeTemplate === t.key ? "active" : ""}`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-extrabold text-sm">{t.name}</span>
                        {activeTemplate === t.key && (
                          <div className="w-6 h-6 rounded-full bg-[#A6F23A] flex items-center justify-center">
                            <Check className="w-3.5 h-3.5 text-[#07111F]" strokeWidth={3} />
                          </div>
                        )}
                      </div>
                      <p className="text-[11px] text-[#A8B3C7]/40">{t.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="glass-panel p-6">
                <h3 className="text-[11px] font-extrabold text-[#A8B3C7]/50 uppercase tracking-[0.2em] mb-5">
                  Actions
                </h3>
                <div className="space-y-3">
                  <button
                    onClick={formatJson}
                    className="btn-dark w-full flex items-center gap-3 text-left"
                  >
                    <RefreshCw className="w-4 h-4 text-[#A6F23A]/60" />
                    <span>Auto-Format</span>
                  </button>
                  <button
                    onClick={copyToClipboard}
                    className="btn-dark w-full flex items-center gap-3 text-left"
                  >
                    {isCopied ? (
                      <Check className="w-4 h-4 text-[#A6F23A]" />
                    ) : (
                      <Copy className="w-4 h-4 text-[#A6F23A]/60" />
                    )}
                    <span>{isCopied ? "Copied!" : "Copy JSON"}</span>
                  </button>
                  <button
                    onClick={handleDownload}
                    className="btn-neon w-full flex items-center justify-center gap-3 py-3.5"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download .json</span>
                    <ArrowRight className="w-4 h-4 ml-auto" />
                  </button>
                </div>
              </div>

              {/* Info Card */}
              <div className="rounded-2xl bg-[#A6F23A] p-6 text-[#07111F]">
                <h4 className="font-black text-lg mb-2 leading-tight">Need Help?</h4>
                <p className="text-sm opacity-70 leading-relaxed mb-4">
                  Upload a PDF and let our AI engine auto-fill the JSON template for you.
                </p>
                <div className="text-xs font-bold uppercase tracking-[0.15em] opacity-50">
                  {lineCount} lines · {activeTemplate}
                </div>
              </div>
            </motion.div>

            {/* ── Editor Panel ── */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="lg:col-span-9 space-y-4"
            >
              {/* Mode Toggle + Error */}
              <div className="flex items-center justify-between">
                <div className="flex p-1.5 rounded-2xl bg-[#0A1628] border border-white/[0.06]">
                  {(["edit", "preview"] as const).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setViewMode(mode)}
                      className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
                        viewMode === mode
                          ? "bg-[#A6F23A] text-[#07111F]"
                          : "text-[#A8B3C7]/40 hover:text-[#A8B3C7]/70"
                      }`}
                    >
                      {mode === "edit" ? (
                        <Edit3 className="w-3.5 h-3.5" />
                      ) : (
                        <Eye className="w-3.5 h-3.5" />
                      )}
                      {mode === "edit" ? "Editor" : "Preview"}
                    </button>
                  ))}
                </div>

                {error && (
                  <div className="text-rose-400 text-[11px] font-mono bg-rose-500/10 border border-rose-500/15 px-4 py-2 rounded-full flex items-center gap-2 animate-pulse">
                    <span className="w-2 h-2 bg-rose-500 rounded-full" />
                    {typeof error === "string" ? error.substring(0, 50) : "Unknown Error"}
                  </div>
                )}
              </div>

              {/* Code Editor */}
              <div className="editor-container min-h-[640px] flex flex-col">
                <div className="editor-toolbar">
                  <div className="editor-dots">
                    <div className="editor-dot red" />
                    <div className="editor-dot yellow" />
                    <div className="editor-dot green" />
                  </div>
                  <div className="flex items-center gap-2 ml-5">
                    <FileJson className="w-3.5 h-3.5 text-[#A6F23A]/40" />
                    <span className="text-[11px] text-[#A8B3C7]/40 font-mono tracking-wider">
                      cv-builder-v1.json
                    </span>
                  </div>
                  <div className="ml-auto flex items-center gap-3">
                    <span className="text-[10px] text-[#A8B3C7]/20 font-mono">
                      {lineCount} lines
                    </span>
                    <div className="status-dot" />
                  </div>
                </div>

                <AnimatePresence mode="wait">
                  {viewMode === "edit" ? (
                    <motion.div
                      key="edit"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      className="flex-1"
                    >
                      <textarea
                        value={jsonContent}
                        onChange={handleJsonChange}
                        spellCheck={false}
                        className="w-full h-full min-h-[580px] bg-transparent p-6 font-mono text-sm text-[#A6F23A]/80 outline-none resize-none custom-scrollbar selection:bg-[#A6F23A]/20 leading-relaxed"
                        placeholder="Paste or write your CV JSON here..."
                      />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="preview"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      className="flex-1 p-6 overflow-auto custom-scrollbar"
                    >
                      <div className="rounded-2xl bg-[#07111F]/50 border border-white/[0.04] p-8">
                        {error ? (
                          <div className="text-center py-20">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-rose-500/10 mb-4">
                              <FileJson className="w-8 h-8 text-rose-500/60" />
                            </div>
                            <p className="text-rose-400 font-bold mb-2 text-lg">Invalid JSON</p>
                            <p className="text-[#A8B3C7]/30 text-sm">
                              Fix the syntax errors in the editor.
                            </p>
                          </div>
                        ) : (
                          <div className="font-mono text-sm space-y-2">
                            {(() => {
                              try {
                                const data = JSON.parse(jsonContent);
                                return (
                                  <div className="space-y-3">
                                    {Object.entries(data).map(([key, value]) => (
                                      <div
                                        key={key}
                                        className="border-l-2 border-white/[0.05] pl-4 py-2 hover:border-[#A6F23A]/50 transition-all duration-300 group/item rounded-r-lg hover:bg-white/[0.01]"
                                      >
                                        <span className="text-[#A6F23A] font-bold">
                                          &quot;{key}&quot;
                                        </span>
                                        :{" "}
                                        {typeof value === "object" ? (
                                          <span className="text-[#A8B3C7]/30">
                                            {Array.isArray(value)
                                              ? `[Array(${value.length})]`
                                              : "{Object}"}
                                          </span>
                                        ) : (
                                          <span
                                            className={
                                              typeof value === "string"
                                                ? "text-[#6EDC3D]"
                                                : "text-amber-400/70"
                                            }
                                          >
                                            {JSON.stringify(value)}
                                          </span>
                                        )}
                                        {typeof value === "object" && value !== null && (
                                          <div className="mt-3 ml-4">
                                            <pre className="text-[11px] text-[#A8B3C7]/40 bg-[#07111F]/40 p-4 rounded-xl border border-white/[0.03] whitespace-pre-wrap break-all">
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
                                  <div className="text-[#A8B3C7]/20 animate-pulse">
                                    Rendering...
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
            </motion.div>
          </div>
        </section>
      </div>
    </div>
  );
}
