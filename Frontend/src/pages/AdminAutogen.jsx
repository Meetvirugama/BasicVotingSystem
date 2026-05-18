import React, { useEffect, useState } from "react";
import { Settings, Sparkles, RefreshCw, CheckCircle, XCircle, AlertTriangle, Play, HelpCircle } from "lucide-react";
import api from "../services/api";
import Badge from "../components/Badge";
import { motion, AnimatePresence } from "framer-motion";

const AdminAutogen = () => {
  const [queue, setQueue] = useState([]);
  const [settings, setSettings] = useState({
    isEnabled: true,
    crawlInterval: 30,
    confidenceThreshold: 0.80,
    autoPublishThreshold: 85.0
  });
  const [loading, setLoading] = useState(true);
  const [crawling, setCrawling] = useState(false);
  const [actioningId, setActioningId] = useState(null);
  const [notify, setNotify] = useState(null);

  const fetchQueueAndSettings = async () => {
    try {
      const settingsRes = await api.get("/admin/polls/generator/settings");
      if (settingsRes.data.success) {
        setSettings(settingsRes.data.settings);
      }
      const queueRes = await api.get("/admin/polls/generator/queue");
      if (queueRes.data.success) {
        setQueue(queueRes.data.queue.filter(item => item.moderationStatus === "pending_review"));
      }
    } catch (err) {
      console.error("Error loading generator queue:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueueAndSettings();
  }, []);

  const triggerNotify = (text, type = "success") => {
    setNotify({ text, type });
    setTimeout(() => setNotify(null), 4000);
  };

  const handleCrawl = async () => {
    setCrawling(true);
    try {
      const { data } = await api.post("/admin/polls/generator/crawl");
      if (data.success) {
        triggerNotify(data.message, "success");
        await fetchQueueAndSettings();
      }
    } catch (err) {
      triggerNotify("Failed to trigger autonomous crawlers.", "error");
    } finally {
      setCrawling(false);
    }
  };

  const handleApprove = async (id) => {
    setActioningId(id);
    try {
      const { data } = await api.post(`/admin/polls/generator/approve/${id}`);
      if (data.success) {
        triggerNotify("Poll approved and published to active feed!", "success");
        setQueue(prev => prev.filter(item => item.id !== id));
      }
    } catch (err) {
      triggerNotify("Failed to approve prediction poll.", "error");
    } finally {
      setActioningId(null);
    }
  };

  const handleReject = async (id) => {
    setActioningId(id);
    try {
      const { data } = await api.post(`/admin/polls/generator/reject/${id}`, {
        reason: "Rejected by Administrator review"
      });
      if (data.success) {
        triggerNotify("Poll rejected and removed from queue.", "info");
        setQueue(prev => prev.filter(item => item.id !== id));
      }
    } catch (err) {
      triggerNotify("Failed to reject prediction poll.", "error");
    } finally {
      setActioningId(null);
    }
  };

  const handleSaveSettings = async () => {
    try {
      const { data } = await api.post("/admin/polls/generator/settings", settings);
      if (data.success) {
        triggerNotify("Generator settings updated successfully!", "success");
      }
    } catch (err) {
      triggerNotify("Failed to save settings.", "error");
    }
  };

  return (
    <div className="animate-in fade-in duration-500 max-w-6xl mx-auto pb-10">
      
      {/* Toast Notification */}
      <AnimatePresence>
        {notify && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className={`fixed top-6 right-6 z-50 px-6 py-3.5 rounded-2xl shadow-xl flex items-center gap-2.5 font-bold border ${
              notify.type === "success" 
                ? "bg-emerald-50 dark:bg-emerald-950/90 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                : notify.type === "error"
                ? "bg-rose-50 dark:bg-rose-950/90 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800"
                : "bg-slate-50 dark:bg-slate-900/90 text-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-800"
            }`}
          >
            {notify.type === "success" ? <CheckCircle className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
            <span>{notify.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-display font-black text-slate-900 dark:text-white flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-primary animate-pulse" />
            AI Prediction Engine
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">
            Autonomous crawler discovery, Llama parsing, Jaccard deduplication & queue review.
          </p>
        </div>

        <button
          onClick={handleCrawl}
          disabled={crawling}
          className="bg-primary hover:bg-primary-dark text-white font-bold px-6 py-3 rounded-2xl shadow-lg shadow-primary/20 flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50"
        >
          <RefreshCw className={`w-5 h-5 ${crawling ? "animate-spin" : ""}`} />
          {crawling ? "Crawling Feeds..." : "🔮 Discover & Crawl Feeds"}
        </button>
      </div>

      {/* Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Hand side Queue list */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-dark-800 border border-slate-200 dark:border-dark-700 rounded-[2rem] p-6 shadow-sm">
            <h2 className="text-xl font-display font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <span>⏳ Pending Review Moderation Queue</span>
              <span className="text-xs bg-slate-100 dark:bg-dark-700 px-3 py-1 rounded-full text-slate-500 dark:text-slate-400 font-black">
                {queue.length} Pending
              </span>
            </h2>

            {loading ? (
              <div className="flex justify-center items-center h-48">
                <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
              </div>
            ) : queue.length === 0 ? (
              <div className="text-center py-12 bg-slate-50 dark:bg-dark-900/50 rounded-2xl border border-dashed border-slate-200 dark:border-dark-700">
                <HelpCircle className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-1">Queue is Clear!</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                  Click '🔮 Discover & Crawl Feeds' above to manually scan RSS and Esports API logs for new prediction ideas.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <AnimatePresence>
                  {queue.map((item) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10, height: 0 }}
                      className="bg-slate-50 dark:bg-dark-900/50 border border-slate-100 dark:border-dark-700 p-5 rounded-2xl space-y-4"
                    >
                      <div className="flex justify-between items-start flex-wrap gap-2">
                        <div className="flex items-center gap-2.5">
                          <Badge variant="primary">{item.categoryName}</Badge>
                          <span className="text-xs font-bold text-slate-400">
                            Confidence: {(item.confidenceScore * 100).toFixed(0)}%
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <span className="text-xs font-black bg-primary/10 text-primary px-3 py-1 rounded-lg">
                            Score: {item.priorityScore}
                          </span>
                          <span className={`text-xs font-black px-3 py-1 rounded-lg ${
                            item.duplicateRisk > 0.3 
                              ? "bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400" 
                              : "bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400"
                          }`}>
                            Risk: {(item.duplicateRisk * 100).toFixed(0)}%
                          </span>
                        </div>
                      </div>

                      <div>
                        <h3 className="font-display font-bold text-slate-900 dark:text-white leading-tight text-lg mb-1">
                          {item.title}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                          {item.description}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {item.options.map((opt, i) => (
                          <span 
                            key={i} 
                            className="bg-white dark:bg-dark-800 text-xs font-bold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-dark-700 px-3 py-1.5 rounded-xl"
                          >
                            {opt}
                          </span>
                        ))}
                      </div>

                      <div className="pt-2 border-t border-slate-100 dark:border-dark-700 flex justify-end gap-2">
                        <button
                          disabled={actioningId === item.id}
                          onClick={() => handleReject(item.id)}
                          className="hover:bg-rose-50 dark:hover:bg-rose-950/20 text-rose-500 px-4 py-2 rounded-xl text-xs font-bold border border-rose-200 dark:border-rose-900 transition flex items-center gap-1.5 disabled:opacity-50"
                        >
                          <XCircle className="w-4 h-4" /> Reject
                        </button>
                        <button
                          disabled={actioningId === item.id}
                          onClick={() => handleApprove(item.id)}
                          className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md shadow-emerald-500/10 transition flex items-center gap-1.5 disabled:opacity-50"
                        >
                          <CheckCircle className="w-4 h-4" /> Approve & Publish
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>

        {/* Right Hand side Settings */}
        <div className="space-y-6">
          
          {/* Controls Card */}
          <div className="bg-white dark:bg-dark-800 border border-slate-200 dark:border-dark-700 rounded-[2rem] p-6 shadow-sm space-y-6">
            <h3 className="text-lg font-display font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Settings className="w-5 h-5 text-primary" />
              Engine Configuration
            </h3>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  Auto-Gen Master Enable
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={settings.isEnabled}
                    onChange={(e) => setSettings({ ...settings, isEnabled: e.target.checked })}
                    className="w-5 h-5 accent-primary cursor-pointer rounded"
                  />
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                    {settings.isEnabled ? "🟢 Enabled" : "🔴 Paused"}
                  </span>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  Min AI Confidence: {(settings.confidenceThreshold * 100).toFixed(0)}%
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="0.95"
                  step="0.05"
                  value={settings.confidenceThreshold}
                  onChange={(e) => setSettings({ ...settings, confidenceThreshold: parseFloat(e.target.value) })}
                  className="w-full h-1.5 bg-slate-200 dark:bg-dark-700 rounded-lg appearance-none cursor-pointer accent-primary"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  Auto-Publish Priority Score: {settings.autoPublishThreshold}
                </label>
                <input
                  type="range"
                  min="60"
                  max="95"
                  step="1"
                  value={settings.autoPublishThreshold}
                  onChange={(e) => setSettings({ ...settings, autoPublishThreshold: parseInt(e.target.value) })}
                  className="w-full h-1.5 bg-slate-200 dark:bg-dark-700 rounded-lg appearance-none cursor-pointer accent-primary"
                />
              </div>
            </div>

            <button
              onClick={handleSaveSettings}
              className="w-full bg-slate-900 dark:bg-dark-700 hover:bg-slate-800 dark:hover:bg-dark-600 text-white font-bold py-3 rounded-2xl transition"
            >
              Save Engine Settings
            </button>
          </div>

          {/* Scrapers Status Card */}
          <div className="bg-white dark:bg-dark-800 border border-slate-200 dark:border-dark-700 rounded-[2rem] p-6 shadow-sm space-y-4">
            <h3 className="text-lg font-display font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Play className="w-5 h-5 text-success fill-success/20" />
              Active Scraper Feeds
            </h3>
            
            <div className="space-y-3">
              {[
                { name: "PandaScore Esports", interval: "15m", status: "Active" },
                { name: "Cricbuzz public data", interval: "30m", status: "Active" },
                { name: "Hacker News RSS feed", interval: "60m", status: "Active" },
                { name: "YouTube subscriber API", interval: "6h", status: "Active" },
                { name: "Social trend APIs", interval: "24h", status: "Paused" }
              ].map((feed, idx) => (
                <div key={idx} className="flex justify-between items-center bg-slate-50 dark:bg-dark-900/50 p-3 rounded-xl border border-slate-100 dark:border-dark-700">
                  <div>
                    <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 leading-none mb-1">{feed.name}</h4>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Interval: {feed.interval}</span>
                  </div>
                  <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                    feed.status === "Active" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300" : "bg-slate-200 text-slate-500 dark:bg-dark-700"
                  }`}>
                    {feed.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

export default AdminAutogen;
