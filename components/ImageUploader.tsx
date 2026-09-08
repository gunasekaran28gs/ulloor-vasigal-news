"use client";

import { useState, useRef } from "react";
import Image from "next/image";

type ImageUploaderProps = {
  value: string;
  onChange: (url: string) => void;
  label?: string;
};

export default function ImageUploader({ value, onChange, label = "Cover image" }: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleFile(file: File) {
    setUploading(true);
    setError("");

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/upload", { method: "POST", body: formData });
    const data = await res.json().catch(() => ({}));

    setUploading(false);

    if (!res.ok) {
      setError(data.error || "Upload failed.");
      return;
    }

    onChange(data.url);
  }

  return (
    <div>
      <label className="text-xs font-semibold text-gray-500 block mb-1">{label}</label>

      {value ? (
        <div className="relative w-full aspect-[16/9] mb-2 rounded-md overflow-hidden bg-gray-100 border border-gray-200">
          <Image src={value} alt="Cover preview" fill className="object-cover" />
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute top-2 right-2 bg-white/90 hover:bg-white text-xs font-semibold px-2 py-1 rounded shadow"
          >
            Remove
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="w-full aspect-[16/9] mb-2 rounded-md border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-sm text-gray-400 hover:border-red-700 hover:text-red-700 transition-colors disabled:opacity-50"
        >
          {uploading ? "Uploading…" : "Click to upload an image"}
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = "";
        }}
      />

      {error && <p className="text-xs text-red-700 mt-1">{error}</p>}
    </div>
  );
}
