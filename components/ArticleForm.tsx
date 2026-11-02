"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { JSONContent } from "@tiptap/react";
import Editor from "./Editor";
import ImageUploader from "./ImageUploader";

type Category = { id: string; name: string };

type ArticleFormProps = {
  categories: Category[];
  canPublish: boolean;
  initial?: {
    id?: string;
    title?: string;
    excerpt?: string;
    content?: string;
    coverImage?: string;
    categoryId?: string;
    metaTitle?: string;
    metaDescription?: string;
    status?: string;
  };
};

export default function ArticleForm({ categories, canPublish, initial }: ArticleFormProps) {
  const router = useRouter();
  const isEdit = !!initial?.id;
  const isPublished = canPublish && initial?.status === "PUBLISHED";

  const [title, setTitle] = useState(initial?.title || "");
  const [excerpt, setExcerpt] = useState(initial?.excerpt || "");
  const [coverImage, setCoverImage] = useState(initial?.coverImage || "");
  const [categoryId, setCategoryId] = useState(initial?.categoryId || "");
  const [metaTitle, setMetaTitle] = useState(initial?.metaTitle || "");
  const [metaDescription, setMetaDescription] = useState(initial?.metaDescription || "");
  const [content, setContent] = useState(initial?.content || "");
  const [contentJson, setContentJson] = useState<JSONContent | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function save(status?: "DRAFT" | "IN_REVIEW" | "PUBLISHED") {
    setSaving(true);
    setError("");

    const payload = {
      title,
      excerpt,
      content,
      contentJson,
      coverImage,
      categoryId: categoryId || null,
      metaTitle: metaTitle || title,
      metaDescription: metaDescription || excerpt,
      ...(status ? { status } : {}),
    };

    const res = await fetch(isEdit ? `/api/articles/${initial!.id}` : "/api/articles", {
      method: isEdit ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setSaving(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Something went wrong.");
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-ink mb-6">
        {isEdit ? "Edit Article" : "New Article"}
      </h1>

      <div className="flex flex-col gap-5">
        <input
          placeholder="Headline"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="text-2xl font-bold w-full bg-transparent border-b border-line pb-2 focus:outline-none focus:border-brand"
        />

        <textarea
          placeholder="Short excerpt / dek (shown in listings and previews)"
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          rows={2}
          className="w-full border border-line rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
        />

        <div className="grid sm:grid-cols-2 gap-4">
          <ImageUploader value={coverImage} onChange={setCoverImage} label="Cover image" />
          <div>
            <label className="text-xs font-semibold text-muted block mb-1">Category</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full border border-line rounded-md px-3 py-2 text-sm"
            >
              <option value="">Uncategorized</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-muted block mb-1">Content</label>
          <Editor
            content={content}
            onChange={(html, json) => {
              setContent(html);
              setContentJson(json);
            }}
          />
        </div>

        <details className="border border-line rounded-md px-4 py-3">
          <summary className="text-sm font-semibold cursor-pointer">SEO settings</summary>
          <div className="mt-3 flex flex-col gap-3">
            <div>
              <label className="text-xs font-semibold text-muted block mb-1">Meta title</label>
              <input
                value={metaTitle}
                onChange={(e) => setMetaTitle(e.target.value)}
                placeholder={title || "Defaults to headline"}
                className="w-full border border-line rounded-md px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted block mb-1">Meta description</label>
              <textarea
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                rows={2}
                placeholder={excerpt || "Defaults to excerpt"}
                className="w-full border border-line rounded-md px-3 py-2 text-sm"
              />
            </div>
          </div>
        </details>

        {error && <p className="text-sm text-danger">{error}</p>}

        <div className="flex flex-wrap gap-3 pt-2">
          <button
            onClick={() => save("DRAFT")}
            disabled={saving || !title || !content}
            className="border border-line font-semibold text-sm px-4 py-2 rounded-md hover:bg-soft disabled:opacity-50"
          >
            {isPublished ? "Move to draft" : "Save draft"}
          </button>
          {!canPublish && (
            <button
              onClick={() => save("IN_REVIEW")}
              disabled={saving || !title || !content}
              className="bg-yellow-600 hover:bg-yellow-700 text-white font-semibold text-sm px-4 py-2 rounded-md disabled:opacity-50"
            >
              Submit for review
            </button>
          )}
          {canPublish && (
            <button
              onClick={() => save("PUBLISHED")}
              disabled={saving || !title || !content}
              className="bg-brand hover:bg-brand-dark text-white font-semibold text-sm px-4 py-2 rounded-md disabled:opacity-50"
            >
              {isPublished ? "Update" : "Publish"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
