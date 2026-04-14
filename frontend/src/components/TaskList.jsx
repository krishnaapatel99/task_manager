export default function TaskList({ tasks, onEdit, onDelete, currentUser, taskOwners = {} }) {
  const getStatusBadge = (status) => {
    if (status === "completed") return "bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/30";
    if (status === "in_progress") return "bg-amber-500/15 text-amber-300 ring-1 ring-amber-500/30";
    return "bg-slate-500/15 text-slate-300 ring-1 ring-slate-500/30";
  };

  const getTaskTitle = (task) => {
    // If this is the current user's task and they're an admin, show "Admin task"
    if (currentUser && task.owner_id === currentUser.id && currentUser.role === "admin") {
      return `Admin task: ${task.title}`;
    }
    
    // For other users' tasks, show username
    const owner = taskOwners[task.owner_id];
    if (owner) {
      return `${owner.username} task: ${task.title}`;
    }
    
    // Fallback to original title
    return task.title;
  };

  return (
    <div className="space-y-3">
      {tasks.map((task) => (
        <div
          className="rounded-2xl border border-white/10 bg-slate-900/70 p-4 shadow-xl backdrop-blur"
          key={task.id}
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-lg font-semibold text-slate-100">{getTaskTitle(task)}</h3>
            <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusBadge(task.status)}`}>
              {task.status.replace("_", " ")}
            </span>
          </div>
          <p className="mt-2 text-sm text-slate-300">{task.description || "No description"}</p>
          <div className="mt-4 flex items-center gap-2">
            <button
              className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-blue-500"
              onClick={() => onEdit(task)}
            >
              Edit
            </button>
            <button
              className="rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-red-500"
              onClick={() => onDelete(task.id)}
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
