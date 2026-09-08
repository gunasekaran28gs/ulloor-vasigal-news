"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Category = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  parentId?: string | null;
  parent?: { id: string; name: string } | null;
  _count?: { articles: number; children: number };
};

export default function CategoryManager({ initialCategories }: { initialCategories: Category[] }) {
  const router = useRouter();
  const [categories, setCategories] = useState(initialCategories);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [parentId, setParentId] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  function resetForm() {
    setName("");
    setDescription("");
    setParentId("");
    setEditingId(null);
    setError("");
  }

  function startEdit(cat: Category) {
    setEditingId(cat.id);
    setName(cat.name);
    setDescription(cat.description || "");
    setParentId(cat.parentId || "");
    setError("");
  }

  async function refresh() {
    const res = await fetch("/api/categories");
    if (res.ok) setCategories(await res.json());
    router.refresh();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    setError("");

    const payload = { name, description, parentId: parentId || null };
    const res = await fetch(editingId ? `/api/categories/${editingId}` : "/api/categories", {
      method: editingId ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setSaving(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Something went wrong.");
      return;
    }

    resetForm();
    await refresh();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this category? Articles in it will become uncategorized.")) return;
    const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
    if (res.ok) await refresh();
  }

  // Only top-level / other categories can be a parent — prevent selecting itself
  const availableParents = categories.filter((c) => c.id !== editingId);

  return (
    <div className="flex flex-col gap-8">
      <form onSubmit={handleSubmit} className="border border-gray-200 rounded-lg p-5 flex flex-col gap-4">
        <h2 className="font-semibold">{editingId ? "Edit category" : "Add new category"}</h2>

        <div>
          <label className="text-xs font-semibold text-gray-500 block mb-1">Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Technology"
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-700"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-500 block mb-1">Description (optional)</label>
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-500 block mb-1">Parent category (optional)</label>
          <select
            value={parentId}
            onChange={(e) => setParentId(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
          >
            <option value="">None (top-level category)</option>
            {availableParents.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        {error && <p className="text-sm text-red-700">{error}</p>}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving || !name.trim()}
            className="bg-red-700 hover:bg-red-800 text-white font-semibold text-sm px-4 py-2 rounded-md disabled:opacity-50"
          >
            {editingId ? "Save changes" : "Add category"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="border border-gray-300 font-semibold text-sm px-4 py-2 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="divide-y divide-gray-200 border border-gray-200 rounded-lg overflow-hidden">
        {categories.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-8">No categories yet.</p>
        ) : (
          categories.map((c) => (
            <div key={c.id} className="flex items-center justify-between px-4 py-3">
              <div>
                <p className="font-medium">
                  {c.parent && <span className="text-gray-400 mr-1">{c.parent.name} /</span>}
                  {c.name}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {c._count?.articles ?? 0} article{c._count?.articles === 1 ? "" : "s"}
                  {c._count?.children ? ` · ${c._count.children} subcategor${c._count.children === 1 ? "y" : "ies"}` : ""}
                </p>
              </div>
              <div className="flex gap-3 text-sm">
                <button onClick={() => startEdit(c)} className="font-semibold text-gray-500 hover:text-red-700">
                  Edit
                </button>
                <button onClick={() => handleDelete(c.id)} className="font-semibold text-gray-500 hover:text-red-700">
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
