import React, { useEffect, useState } from "react";
import { CheckCircle, PlayCircle, Clock, Search, ShieldCheck } from "lucide-react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState("All Tasks");
  
  const { user, updateBalance } = useAuth();

  const filteredTasks = tasks.filter(task => {
    if (selectedTab === "All Tasks") return true;
    
    const catName = task.category?.name?.toLowerCase() || "";
    const title = task.title?.toLowerCase() || "";
    const desc = task.description?.toLowerCase() || "";
    const tabName = selectedTab.toLowerCase();
    
    if (tabName === "daily") {
      return catName === "daily" || title.includes("daily") || desc.includes("daily");
    }
    
    if (tabName === "featured") {
      return catName === "featured" || title.includes("featured") || desc.includes("featured");
    }
    
    if (tabName === "surveys") {
      return catName === "surveys" || catName === "survey" || title.includes("survey") || desc.includes("survey");
    }
    
    return catName === tabName;
  });

  const [activeTask, setActiveTask] = useState(null);
  const [taskTimer, setTaskTimer] = useState(0);
  const [timerInterval, setTimerInterval] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [catRes, taskRes] = await Promise.all([
        api.get("/tasks/categories"),
        api.get("/tasks")
      ]);
      if (catRes.data.success) setCategories(catRes.data.categories);
      if (taskRes.data.success) setTasks(taskRes.data.tasks);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStartTask = async (task) => {
    try {
      const { data } = await api.post(`/tasks/${task.id}/start`);
      if (data.success) {
        setActiveTask(task);
        setTaskTimer(task.minimumTimeRequirement);
        
        if (task.minimumTimeRequirement > 0) {
          const interval = setInterval(() => {
            setTaskTimer((prev) => {
              if (prev <= 1) {
                clearInterval(interval);
                return 0;
              }
              return prev - 1;
            });
          }, 1000);
          setTimerInterval(interval);
        }
        
        // Open the external link in a new tab if it's a visit task
        if (task.taskLink) {
          window.open(task.taskLink, "_blank");
        }
      }
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.error || "Failed to start task." });
    }
  };

  const handleVerifyTask = async () => {
    if (taskTimer > 0) return;
    setSubmitting(true);
    try {
      const { data } = await api.post(`/tasks/${activeTask.id}/verify`);
      if (data.success) {
        setMessage({ type: "success", text: `Success! You earned ${data.coinsEarned} coins.` });
        if (user && data.coinsEarned) {
           updateBalance(parseFloat(user.coinBalance) + parseFloat(data.coinsEarned));
        }
        setActiveTask(null);
        fetchData(); // refresh tasks
      }
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.error || "Verification failed." });
    } finally {
      setSubmitting(false);
    }
  };

  const closeModal = () => {
    setActiveTask(null);
    if (timerInterval) clearInterval(timerInterval);
  };

  return (
    <div className="animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-black text-slate-900 dark:text-white mb-2 flex items-center gap-3">
          <ShieldCheck className="text-primary w-8 h-8" /> Task Center
        </h1>
        <p className="text-slate-500 dark:text-slate-400 font-medium">Complete tasks to earn virtual coins and build your reputation.</p>
      </div>

      {message && (
        <div className={`p-4 rounded-2xl mb-8 font-bold border ${message.type === 'success' ? 'bg-success/10 text-success border-success/20' : 'bg-danger/10 text-danger border-danger/20'}`}>
          {message.text}
          <button className="float-right underline opacity-80 hover:opacity-100" onClick={() => setMessage(null)}>Dismiss</button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-4 mb-8 overflow-x-auto pb-2 scrollbar-hide">
        {['All Tasks', 'Daily', 'Featured', 'Surveys'].map((tab) => {
          const isActive = selectedTab === tab;
          return (
            <button 
              key={tab} 
              onClick={() => setSelectedTab(tab)}
              className={`px-5 py-2.5 rounded-xl font-bold whitespace-nowrap transition-all duration-300 ${
                isActive 
                  ? 'bg-slate-800 text-white dark:bg-primary dark:text-white shadow-md shadow-primary/20 scale-[1.02]' 
                  : 'bg-white dark:bg-dark-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-dark-700 hover:bg-slate-50 dark:hover:bg-dark-700'
              }`}
            >
              {tab}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTasks.length === 0 ? (
            <div className="col-span-full bg-white dark:bg-dark-800 border border-slate-200 dark:border-dark-700 rounded-3xl p-12 text-center shadow-md">
              <ShieldCheck className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <h3 className="font-bold text-slate-800 dark:text-slate-200 text-lg">No tasks available</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">There are no active {selectedTab.toLowerCase() === 'all tasks' ? '' : selectedTab.toLowerCase()} tasks right now. Check back later!</p>
            </div>
          ) : (
            filteredTasks.map(task => {
              const isCompleted = task.userStatus === 'completed';
              const isPending = task.userStatus === 'started';

              return (
                <div key={task.id} className={`bg-white dark:bg-dark-800 border rounded-3xl p-6 transition-all shadow-xl ${isCompleted ? 'border-slate-100 dark:border-dark-700 opacity-60 shadow-none' : 'border-slate-200 dark:border-dark-600 shadow-slate-200/40 dark:shadow-none hover:-translate-y-1 hover:border-primary/40 hover:shadow-primary/20'}`}>
                  <div className="flex justify-between items-start mb-4">
                    <span className="bg-slate-100 dark:bg-dark-700 text-slate-600 dark:text-slate-300 text-[10px] font-bold px-3 py-1.5 rounded-lg uppercase tracking-wider">
                      {task.category?.name || "General"}
                    </span>
                    <div className="font-black text-primary dark:text-primary-light bg-primary/10 px-3 py-1 rounded-lg border border-primary/20 flex items-center gap-1">
                      +{task.rewardCoins}
                    </div>
                  </div>

                  <h3 className="text-lg font-display font-bold text-slate-800 dark:text-slate-100 mb-2">{task.title}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mb-6 line-clamp-2">{task.description}</p>
                  
                  <div className="flex items-center justify-between text-xs font-bold text-slate-400 dark:text-slate-500 mb-6 bg-slate-50 dark:bg-dark-900 p-3 rounded-xl border border-slate-100 dark:border-dark-700">
                    <div className="flex items-center gap-1"><Clock className="w-4 h-4" /> {task.minimumTimeRequirement}s req</div>
                    <div className="flex items-center gap-1 capitalize text-primary/80">{task.difficultyLevel}</div>
                  </div>

                  {isCompleted ? (
                    <button disabled className="w-full bg-slate-100 dark:bg-dark-700 text-slate-400 dark:text-slate-500 font-bold py-3.5 rounded-xl flex items-center justify-center gap-2">
                      <CheckCircle className="w-5 h-5" /> Completed
                    </button>
                  ) : (
                    <button 
                      onClick={() => handleStartTask(task)}
                      className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3.5 rounded-xl transition-all shadow-md shadow-primary/20 flex items-center justify-center gap-2 active:scale-95"
                    >
                      {isPending ? <PlayCircle className="w-5 h-5" /> : <PlayCircle className="w-5 h-5" />}
                      {isPending ? "Resume Task" : "Start Task"}
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Task Execution Modal */}
      {activeTask && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white dark:bg-dark-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-slate-200 dark:border-dark-600">
            <div className="p-6 md:p-8">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <span className="text-primary font-bold text-xs uppercase tracking-widest mb-1 block">Active Task</span>
                  <h2 className="text-2xl font-display font-black text-slate-900 dark:text-white">{activeTask.title}</h2>
                </div>
                <div className="font-black text-primary bg-primary/10 px-3 py-1 rounded-lg border border-primary/20">
                  +{activeTask.rewardCoins}
                </div>
              </div>
              
              <div className="bg-slate-50 dark:bg-dark-900 p-5 rounded-2xl border border-slate-100 dark:border-dark-700 mb-8">
                <p className="text-slate-600 dark:text-slate-300 font-medium leading-relaxed">{activeTask.description}</p>
                {activeTask.taskLink && (
                  <a href={activeTask.taskLink} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 mt-4 text-primary font-bold hover:underline">
                    <Search className="w-4 h-4" /> Open Link
                  </a>
                )}
              </div>

              <div className="space-y-4">
                <button 
                  onClick={handleVerifyTask}
                  disabled={taskTimer > 0 || submitting}
                  className="w-full bg-primary hover:bg-primary-dark disabled:bg-slate-200 dark:disabled:bg-dark-700 disabled:text-slate-400 dark:disabled:text-slate-500 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : taskTimer > 0 ? (
                    <><Clock className="w-5 h-5" /> Wait {taskTimer}s to verify...</>
                  ) : (
                    <><CheckCircle className="w-5 h-5" /> Verify & Claim Reward</>
                  )}
                </button>
                <button 
                  onClick={closeModal}
                  className="w-full bg-white dark:bg-dark-800 text-slate-500 dark:text-slate-400 font-bold py-3.5 rounded-xl hover:bg-slate-50 dark:hover:bg-dark-700 transition border border-slate-200 dark:border-dark-600"
                >
                  Cancel & Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tasks;
