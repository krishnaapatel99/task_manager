import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import LoadingSpinner from "../components/LoadingSpinner";
import Notification from "../components/Notification";
import TaskForm from "../components/TaskForm";
import TaskList from "../components/TaskList";
import api from "../services/api";
import { getErrorMessage } from "../services/errorMessage";

export default function DashboardPage({ title = "Task Dashboard", subtitle = "Track progress and keep work moving." }) {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [editingTask, setEditingTask] = useState(null);
  const [role, setRole] = useState("");
  const [notification, setNotification] = useState({ message: "", type: "success" });
  const [isLoadingTasks, setIsLoadingTasks] = useState(true);
  const [isCreatingTask, setIsCreatingTask] = useState(false);

  const loadTasks = async () => {
    setIsLoadingTasks(true);
    try {
      const response = await api.get("/tasks/", { params: { page: 1, size: 50 } });
      setTasks(response.data.items || []);
    } catch (error) {
      setNotification({
        message: getErrorMessage(error, "Could not load tasks"),
        type: "error"
      });
    } finally {
      setIsLoadingTasks(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await api.get("/auth/me");
        setRole(response.data?.role || "");
      } catch {
        setRole("");
      }
    };
    loadProfile();
  }, []);

  const handleCreate = async (payload) => {
    setIsCreatingTask(true);
    try {
      await api.post("/tasks/", payload);
      setNotification({ message: "Task created", type: "success" });
      loadTasks();
    } catch (error) {
      setNotification({
        message: getErrorMessage(error, "Task creation failed"),
        type: "error"
      });
    } finally {
      setIsCreatingTask(false);
    }
  };

  const handleUpdate = async (payload) => {
    if (!editingTask) return;
    try {
      await api.put(`/tasks/${editingTask.id}`, payload);
      setEditingTask(null);
      setNotification({ message: "Task updated", type: "success" });
      loadTasks();
    } catch (error) {
      setNotification({
        message: getErrorMessage(error, "Task update failed"),
        type: "error"
      });
    }
  };

  const handleDelete = async (taskId) => {
    try {
      await api.delete(`/tasks/${taskId}`);
      setNotification({ message: "Task deleted", type: "success" });
      loadTasks();
    } catch (error) {
      setNotification({
        message: getErrorMessage(error, "Task deletion failed"),
        type: "error"
      });
    }
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      // Ignore logout API errors and continue navigation.
    }
    navigate("/login");
  };

  return (
    <div className="mx-auto mt-10 max-w-4xl px-4 pb-10">
      <div className="mb-6 flex items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight text-white">{title}</h1>
            {role && (
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${
                  role === "admin"
                    ? "bg-emerald-500/15 text-emerald-300 ring-emerald-500/30"
                    : "bg-blue-500/15 text-blue-300 ring-blue-500/30"
                }`}
              >
                {role === "admin" ? "Admin" : "User"}
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-slate-300">{subtitle}</p>
        </div>
        <button
          className="rounded-lg border border-slate-600 bg-slate-800 px-4 py-2 text-sm font-medium text-slate-100 transition hover:bg-slate-700"
          onClick={logout}
        >
          Logout
        </button>
      </div>
      <Notification {...notification} />
      <h2 className="mb-2 text-lg font-semibold text-slate-100">{editingTask ? "Edit Task" : "Create Task"}</h2>
      <TaskForm
        onSubmit={editingTask ? handleUpdate : handleCreate}
        initialValues={editingTask}
        submitLabel={editingTask ? "Update Task" : "Create Task"}
        isLoading={isCreatingTask}
      />
      {editingTask && (
        <button
          onClick={() => setEditingTask(null)}
          className="mb-6 rounded-lg border border-slate-600 bg-slate-800 px-4 py-2 text-sm font-medium text-slate-100 transition hover:bg-slate-700"
        >
          Cancel Editing
        </button>
      )}
      <h2 className="mb-3 text-lg font-semibold text-slate-100">Your Tasks</h2>
      {isLoadingTasks ? (
        <div className="flex justify-center py-8">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <TaskList tasks={tasks} onEdit={setEditingTask} onDelete={handleDelete} />
      )}
    </div>
  );
}
