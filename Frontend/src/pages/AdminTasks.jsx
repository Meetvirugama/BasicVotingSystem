import React, { useEffect, useState } from "react";
import { ShieldAlert, Activity, AlertTriangle, Users, Settings, PlusCircle } from "lucide-react";
import api from "../services/api";
import Badge from "../components/Badge";

const AdminTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [fraudFlags, setFraudFlags] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const { data } = await api.get("/tasks");
        if (data.success) {
          setTasks(data.tasks);
          setFraudFlags([
            { id: 1, user_id: 'TestUser', type: 'Velocity Abuse', severity: 'High', description: 'Started 6 tasks in 60 seconds.' }
          ]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAdminData();
  }, []);

  return (
    <div className="animate-in fade-in duration-500">
      <div className="mb-8 border-b border-slate-200 dark:border-dark-700 pb-6 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-display font-black text-slate-900 dark:text-white mb-2 flex items-center gap-3">
            <ShieldAlert className="text-danger w-8 h-8" /> Admin Engine
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Manage tasks and monitor the anti-abuse engine.</p>
        </div>
        <div className="hidden md:flex gap-3">
          <button className="bg-white dark:bg-dark-800 border border-slate-200 dark:border-dark-700 text-slate-600 dark:text-slate-300 font-bold px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-dark-700 transition">
            <Settings className="w-4 h-4" /> System Config
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Active Users", value: "1,204", icon: Users, color: "text-primary", bg: "bg-primary/10" },
          { label: "Task Completions", value: "8,592", icon: Activity, color: "text-success", bg: "bg-success/10" },
          { label: "Coins Circulating", value: "452K", icon: PlusCircle, color: "text-warning", bg: "bg-warning/10" },
          { label: "Fraud Flags", value: "12", icon: AlertTriangle, color: "text-danger", bg: "bg-danger/10" },
        ].map((metric, i) => (
          <div key={i} className="bg-white dark:bg-dark-800 p-5 rounded-3xl border border-slate-200 dark:border-dark-700 flex items-center gap-4 shadow-sm">
            <div className={`w-12 h-12 rounded-2xl ${metric.bg} flex items-center justify-center`}>
              <metric.icon className={`w-6 h-6 ${metric.color}`} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">{metric.label}</p>
              <p className="text-xl font-black text-slate-900 dark:text-white">{metric.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Task Management */}
        <div className="bg-white dark:bg-dark-800 rounded-[2rem] border border-slate-200 dark:border-dark-700 p-6 shadow-xl shadow-slate-200/40 dark:shadow-none">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-display font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <Activity className="text-success" /> Active Tasks
            </h2>
            <button className="bg-primary/10 text-primary hover:bg-primary/20 px-4 py-2 rounded-xl text-sm font-bold transition">
              + New Task
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-dark-900 border-b border-slate-200 dark:border-dark-700">
                  <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider rounded-tl-xl">Title</th>
                  <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Reward</th>
                  <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right rounded-tr-xl">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-dark-700">
                {tasks.map(task => (
                  <tr key={task.id} className="hover:bg-slate-50 dark:hover:bg-dark-900 transition-colors">
                    <td className="p-4 text-sm font-bold text-slate-700 dark:text-slate-200">{task.title}</td>
                    <td className="p-4 text-sm font-black text-primary">+{task.rewardCoins}</td>
                    <td className="p-4 text-right">
                      <button className="text-slate-400 hover:text-primary font-bold text-xs bg-slate-100 dark:bg-dark-700 px-3 py-1.5 rounded-lg">Edit</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Fraud Monitoring */}
        <div className="bg-white dark:bg-dark-800 rounded-[2rem] border-2 border-danger/20 p-6 shadow-xl shadow-danger/10">
          <h2 className="text-xl font-display font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-6">
            <AlertTriangle className="text-danger" /> Anti-Abuse Log
          </h2>
          
          <div className="space-y-4">
            {fraudFlags.map(flag => (
              <div key={flag.id} className="bg-danger/5 border border-danger/10 rounded-2xl p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <Badge variant="danger" className="mb-2">{flag.type}</Badge>
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200">User ID: <span className="text-primary">{flag.user_id}</span></p>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 font-medium">{flag.description}</p>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                  <button className="flex-1 sm:flex-none bg-danger text-white text-xs font-bold px-4 py-2 rounded-xl shadow-md hover:bg-red-600 transition">
                    Ban User
                  </button>
                  <button className="flex-1 sm:flex-none bg-white dark:bg-dark-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-dark-600 text-xs font-bold px-4 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-dark-700 transition">
                    Dismiss
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default AdminTasks;
