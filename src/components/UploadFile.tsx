"use client";
import React, { useRef, useState } from "react";
import { File, Loader2 } from "lucide-react";
import { UploadCloud } from "lucide-react";
import ContentScanner from "./animata/content-scan";
import { motion } from "framer-motion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Button } from "./ui/button";
// import countTokens from '@/test/countTokens';
interface FileItem {
  name: string;
  content: string;
  size: number;
}

export default function UploadFile() {
  const [files, setFiles] = useState<FileItem | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [output, setOutput] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [template, setTemplate] = useState("template1");

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

    const droppedFiles = Array.from(e.dataTransfer.files);
    if (droppedFiles?.[0]) {
      await processFile(droppedFiles[0]);
    }
  };

  const handleFileUpload = async (fileList: FileList | null) => {
    if (fileList?.[0]) {
      await processFile(fileList[0]);
    }
  };

  const processFile = async (file: File) => {
    if (file.type !== "application/pdf") {
      alert("Please upload a PDF file");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setFiles({
        name: file.name,
        content: e.target?.result as string,
        size: file.size,
      });
    };
    reader.readAsDataURL(file);
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const extractToJson = async () => {
    if (!files) {
      console.error("No file to upload");
      return;
    }

    setIsLoading(true);
    try {
      console.log("Sending PDF for processing...");
      const processResponse = await fetch("/api/process-pdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fileContent: files.content,
        }),
      });

      if (!processResponse.ok) {
        throw new Error(`Failed to process PDF: ${processResponse.statusText}`);
      }

      const { text } = await processResponse.json();
      console.log(text);
      console.log("PDF processed successfully");

      console.log("Generating JSON...");
      // const tokenCountText = countTokens(text, 'gpt-4o-mini');
      // console.log(`Count token result pdf parse: ${tokenCountText}`);

      const jsonResponse = await fetch("/api/generate-json", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text, template }),
      });

      if (!jsonResponse.ok) {
        throw new Error(`Failed to generate JSON: ${jsonResponse.statusText}`);
      }

      const result = await jsonResponse.json();
      setOutput(JSON.stringify(result, null, 2));
      console.log(result);
      console.log("JSON generated successfully");
    } catch (error) {
      console.error("Error:", error);
      setOutput(`Error processing file: `);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full p-5  flex flex-col items-center justify-center  ">
      <div className="w-full max-w-3xl bg-white rounded-xl shadow-2xl p-10 mt-20">
        <h1 className="text-4xl font-bold text-center py-8 text-blue-700">
          Upload File & Generate JSON
        </h1>
        <ContentScanner
          content="The user has over 10 years of experience in technology, covering both front-end and back-end development. With extensive expertise in React, .NET, and NestJS, the user has successfully delivered various projects ranging from UI component libraries to REST API development. Additionally, the user's experience includes building modern UI components using TailwindCSS and ShadCN."
          highlightWords={[
            "over 10 years",
            "front-end development",
            "back-end development",
            "React",
            ".NET",
            "NestJS",
            "TailwindCSS",
            "ShadCN",
          ]}
          reverseDuration={1}
          scanDuration={9}
        />
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors duration-300 ease-in-out
                    ${dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-blue-400 hover:bg-blue-50"}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={openFileDialog}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            onChange={(e) => handleFileUpload(e.target.files)}
            className="hidden"
          />
          <motion.div
            className="flex items-center justify-center py-6"
            animate={{ y: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            <UploadCloud className="w-20 h-20 text-blue-500" />
          </motion.div>

          <p className="text-lg text-gray-600">
            Drag and drop your PDF file here or click to select file
          </p>

          {files && (
            <div className="mt-4 bg-blue-100 p-4 rounded-lg">
              <h4 className="text-sm font-semibold py-2 text-blue-700">Uploaded File:</h4>
              <ul className="text-center">
                <li className="text-sm flex items-center justify-center text-gray-700">
                  <File className="mr-2 h-4 w-4" />
                  {files.name} ({formatFileSize(files.size)})
                </li>
              </ul>
            </div>
          )}
        </div>
        <div className="w-full text-center pt-8 space-y-4">
          <div className="flex items-center justify-center space-x-4">
            <Select value={template} onValueChange={setTemplate}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select template" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="template1">Template 1</SelectItem>
                <SelectItem value="template2">Template 2</SelectItem>
              </SelectContent>
            </Select>
            <Button
              onClick={extractToJson}
              disabled={isLoading || !files}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300 disabled:bg-gray-300 disabled:text-gray-500"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Generate JSON"
              )}
            </Button>
          </div>
        </div>
      </div>

      {output && (
        <div className="w-full text-left p-10">
          <pre className="bg-gray-100 p-4 rounded overflow-auto text-black">{output}</pre>
        </div>
      )}
    </div>
  );
}
