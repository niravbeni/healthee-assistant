"use client";

import { useState, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import { Card } from "@/components/ocean-duet/ui/card";
import { Button } from "@/components/ocean-duet/ui/button";
import { Badge } from "@/components/ocean-duet/ui/badge";
import { Upload, FileText, X, Loader2 } from "lucide-react";
import { useConversation } from "@/context/ConversationContext";
import type { Document } from "@/lib/ocean/types";

interface DocumentUploadProps {
  participantId: "A" | "B";
  disabled?: boolean;
}

export function DocumentUpload({ participantId, disabled }: DocumentUploadProps) {
  const { state, addDocument, removeDocument } = useConversation();
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const participant =
    participantId === "A"
      ? state.conversation.participantA
      : state.conversation.participantB;

  const handleFiles = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0 || disabled) return;

      setIsUploading(true);

      for (const file of Array.from(files)) {
        try {
          // Read file content
          const content = await readFileContent(file);

          // Create document object
          const document: Document = {
            id: uuidv4(),
            name: file.name,
            content,
            participantId,
            chunks: [], // Chunks will be created server-side
          };

          // Embed the document
          const response = await fetch("/api/embed-documents", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              participantId,
              name: file.name,
              content,
            }),
          });

          if (!response.ok) {
            throw new Error("Failed to embed document");
          }

          const result = await response.json();
          document.id = result.documentId;

          // Add to state
          addDocument(participantId, document);
        } catch (error) {
          console.error("Error uploading document:", error);
        }
      }

      setIsUploading(false);
    },
    [participantId, addDocument, disabled]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      handleFiles(e.target.files);
      e.target.value = ""; // Reset input
    },
    [handleFiles]
  );

  const handleRemove = useCallback(
    (documentId: string) => {
      removeDocument(participantId, documentId);
    },
    [participantId, removeDocument]
  );

  return (
    <div className="space-y-2">
      {/* Upload Zone */}
      <Card
        className={`border-2 border-dashed p-4 text-center transition-colors ${
          dragActive
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25"
        } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => {
          if (!disabled && !isUploading) {
            document.getElementById(`file-input-${participantId}`)?.click();
          }
        }}
      >
        <input
          id={`file-input-${participantId}`}
          type="file"
          accept=".txt,.pdf,.md"
          multiple
          onChange={handleInputChange}
          className="hidden"
          disabled={disabled || isUploading}
        />
        {isUploading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Processing...</span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <Upload className="h-6 w-6 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              Drop files or click to upload
            </span>
            <span className="text-[10px] text-muted-foreground/70">
              TXT, PDF, MD supported
            </span>
          </div>
        )}
      </Card>

      {/* Document List */}
      {participant.documents.length > 0 && (
        <div className="space-y-1">
          {participant.documents.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center justify-between text-xs bg-muted/50 rounded px-2 py-1.5"
            >
              <div className="flex items-center gap-2 min-w-0">
                <FileText className="h-3 w-3 shrink-0 text-muted-foreground" />
                <span className="truncate">{doc.name}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-5 w-5 p-0 shrink-0"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove(doc.id);
                }}
                disabled={disabled}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Helper function to read file content
async function readFileContent(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      resolve(content);
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsText(file);
  });
}
