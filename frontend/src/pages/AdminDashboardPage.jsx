import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import LoadingSpinner from "../components/LoadingSpinner";
import Notification from "../components/Notification";
import TaskForm from "../components/TaskForm";
import TaskList from "../components/TaskList";
import api from "../services/api";
import { getErrorMessage } from "../services/errorMessage";

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const [allTasks, setAllTasks] = useState([]);
  const [adminTasks, setAdminTasks] = useState([]);
  const [userTasks, setUserTasks] = useState([]);
  const [taskOwners, setTaskOwners] = useState({});
  const [editingTask, setEditingTask] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [notification, setNotification] = useState({ message: "", type: "success" });
  const [isLoadingTasks, setIsLoadingTasks] = useState(true);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isCreatingTask, setIsCreatingTask] = useState(false);

  const fetchTaskOwners = async (tasks) => {
    const uniqueOwnerIds = [...new Set(tasks.map(task => task.owner_id))];
    const owners = {};
    
    for (const ownerId of uniqueOwnerIds) {
      try {
        const response = await api.get(`/auth/users/${ownerId}`);
        owners[ownerId] = response.data;
      } catch (error) {
        console.error(`Failed to fetch user ${ownerId}:`, error);
        owners[ownerId] = { username: `User${ownerId}` }; // Fallback
      }
    }
    
    return owners;
  };

  const loadTasks = async () => {
    setIsLoadingTasks(true);
    try {
      const response = await api.get("/tasks/", { params: { page: 1, size: 100 } });
      const tasks = response.data.items || [];
      setAllTasks(tasks);
      
      // Fetch task owners information
      const owners = await fetchTaskOwners(tasks);
      setTaskOwners(owners);
      
      // Separate tasks into admin tasks (created by current admin) and user tasks
      if (currentUser) {
        const admin = tasks.filter(task => task.owner_id === currentUser.id);
        const users = tasks.filter(task => task.owner_id !== currentUser.id);
        setAdminTasks(admin);
        setUserTasks(users);
      }
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
    const loadProfile = async () => {
      setIsLoadingProfile(true);
      try {
        const response = await api.get("/auth/me");
        setCurrentUser(response.data);
      } catch {
        setCurrentUser(null);
      } finally {
        setIsLoadingProfile(false);
      }
    };
    loadProfile();
  }, []);

  useEffect(() => {
    if (currentUser) {
      loadTasks();
    }
  }, [currentUser]);

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
    <div className="mx-auto mt-10 max-w-7xl px-4 pb-10">
      <div className="mb-6 flex items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight text-white">Admin Dashboard</h1>
            <span className="rounded-full bg-emerald-500/15 px-2.5 py-1 text-xs font-semibold text-emerald-300 ring-1 ring-emerald-500/30">
              Admin
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-300">Manage every user's tasks across the system.</p>
        </div>
        <button
          className="rounded-lg border border-slate-600 bg-slate-800 px-4 py-2 text-sm font-medium text-slate-100 transition hover:bg-slate-700"
          onClick={logout}
        >
          Logout
        </button>
      </div>
      
      <Notification {...notification} />
      
      <div className="mb-8">
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
            className="mt-4 rounded-lg border border-slate-600 bg-slate-800 px-4 py-2 text-sm font-medium text-slate-100 transition hover:bg-slate-700"
          >
            Cancel Editing
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Admin Tasks Column */}
        <div>
          <h2 className="mb-3 text-lg font-semibold text-slate-100 flex items-center gap-2">
            <span className="rounded-full bg-emerald-500/15 px-2.5 py-1 text-xs font-semibold text-emerald-300 ring-1 ring-emerald-500/30">
              Admin Tasks
            </span>
            <span className="text-sm text-slate-400">({adminTasks.length})</span>
          </h2>
          {isLoadingTasks ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner size="lg" />
            </div>
          ) : (
            <TaskList 
              tasks={adminTasks} 
              onEdit={setEditingTask} 
              onDelete={handleDelete}
              currentUser={currentUser}
              taskOwners={taskOwners}
            />
          )}
        </div>

        {/* User Tasks Column */}
        <div>
          <h2 className="mb-3 text-lg font-semibold text-slate-100 flex items-center gap-2">
            <span className="rounded-full bg-blue-500/15 px-2.5 py-1 text-xs font-semibold text-blue-300 ring-1 ring-blue-500/30">
              User Tasks
            </span>
            <span className="text-sm text-slate-400">({userTasks.length})</span>
          </h2>
          {isLoadingTasks ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner size="lg" />
            </div>
          ) : (
            <TaskList 
              tasks={userTasks} 
              onEdit={setEditingTask} 
              onDelete={handleDelete}
              currentUser={currentUser}
              taskOwners={taskOwners}
            />
          )}
        </div>
      </div>
    </div>
  );
}
