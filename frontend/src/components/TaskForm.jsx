import { useState } from "react";
import LoadingSpinner from "./LoadingSpinner";

export default function TaskForm({ onSubmit, initialValues, submitLabel, isLoading = false }) {
  const [title, setTitle] = useState(initialValues?.title || "");
  const [description, setDescription] = useState(initialValues?.description || "");
  const [status, setStatus] = useState(initialValues?.status || "pending");

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit({ title, description, status });
    if (!initialValues) {
      setTitle("");
      setDescription("");
      setStatus("pending");
    }
  };

  return (
    <form
      className="mb-3 rounded-2xl border border-white/10 bg-slate-900/70 p-5 shadow-xl backdrop-blur"
      onSubmit={handleSubmit}
    >
      <input
        className="mb-3 w-full rounded-lg border border-slate-700 bg-slate-950/80 px-3 py-2.5 text-sm text-slate-100 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
        placeholder="Title"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        required
      />
      <textarea
        className="mb-3 w-full rounded-lg border border-slate-700 bg-slate-950/80 px-3 py-2.5 text-sm text-slate-100 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
        placeholder="Description"
        value={description}
        onChange={(event) => setDescription(event.target.value)}
      />
      <select
        className="mb-4 w-full rounded-lg border border-slate-700 bg-slate-950/80 px-3 py-2.5 text-sm text-slate-100 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
        value={status}
        onChange={(event) => setStatus(event.target.value)}
      >
        <option value="pending">Pending</option>
        <option value="in_progress">In Progress</option>
        <option value="completed">Completed</option>
      </select>
      <button
        className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        type="submit"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <LoadingSpinner size="sm" />
            {submitLabel.includes("Create") ? "Creating..." : "Updating..."}
          </>
        ) : (
          submitLabel
        )}
      </button>
    </form>
  );
}
