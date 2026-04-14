export default function Notification({ message, type }) {
  if (!message) return null;
  return (
    <div
      className={`mb-4 rounded-xl border px-4 py-3 text-sm font-medium shadow-lg ${
        type === "error"
          ? "border-red-500/40 bg-red-500/15 text-red-200"
          : "border-emerald-500/40 bg-emerald-500/15 text-emerald-200"
      }`}
    >
      {message}
    </div>
  );
}
