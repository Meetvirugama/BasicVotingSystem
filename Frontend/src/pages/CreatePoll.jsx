import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  PlusCircle, 
  Trash2, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle,
  Trophy, 
  TrendingUp, 
  Landmark, 
  Terminal, 
  Film, 
  Coins, 
  Lock, 
  Compass, 
  HelpCircle 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const getCategoryIcon = (name) => {
  const mapping = {
    sports: Trophy,
    crypto: TrendingUp,
    politics: Landmark,
    tech: Terminal,
    entertainment: Film,
  };
  const key = name?.toLowerCase() || "";
  return mapping[key] || Compass;
};

const CreatePoll = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category_id: "",
    options: ["", ""],
    endTime: ""
  });

  const userBalance = user?.coinBalance || 0;

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await api.get("/categories");
        if (data.success) setCategories(data.categories);
      } catch (err) {
        console.error(err);
      }
    };
    fetchCategories();
  }, []);

  const handleNext = () => setStep(prev => Math.min(prev + 1, 5));
  const handleBack = () => setStep(prev => Math.max(prev - 1, 1));

  const updateField = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));

  const updateOption = (index, value) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData(prev => ({ ...prev, options: newOptions }));
  };

  const addOption = () => setFormData(prev => ({ ...prev, options: [...prev.options, ""] }));
  
  const removeOption = (index) => {
    const newOptions = formData.options.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, options: newOptions }));
  };

  const handleCategorySelect = (catId) => {
    updateField('category_id', catId);
    setTimeout(() => {
      setStep(2);
    }, 250); // Fluid 250ms visual feedback
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const { data } = await api.post("/polls", formData);
      if (data.success) {
        navigate(`/polls/${data.poll.id}`);
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "Failed to create poll");
    } finally {
      setLoading(false);
    }
  };

  const stepVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 }
  };

  const selectedCat = categories.find(c => c.id === formData.category_id);

  return (
    <div className="max-w-2xl mx-auto py-10 animate-in fade-in">
      <div className="mb-8">
        <h1 className="text-4xl font-display font-black text-slate-900 dark:text-white mb-2">Create New Poll</h1>
        <p className="text-slate-500 dark:text-slate-400 font-medium">Set up your prediction market in 4 simple steps.</p>
      </div>

      {/* Progress Steps */}
      <div className="flex justify-between items-center mb-10 relative">
        <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-200 dark:bg-dark-700 -z-10 rounded-full"></div>
        <div 
          className="absolute top-1/2 left-0 h-1 bg-primary -z-10 rounded-full transition-all duration-500"
          style={{ width: `${((step - 1) / 4) * 100}%` }}
        ></div>
        
        {[1, 2, 3, 4, 5].map(num => (
          <div key={num} className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border-4 transition-colors duration-300 ${
            step >= num ? "bg-primary border-white dark:border-dark-800 text-white" : "bg-slate-200 dark:bg-dark-700 border-white dark:border-dark-800 text-slate-400"
          }`}>
            {step > num ? <CheckCircle className="w-5 h-5" /> : num}
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-dark-800 border border-slate-200 dark:border-dark-700 rounded-[2rem] p-8 shadow-xl shadow-slate-200/40 dark:shadow-none overflow-hidden min-h-[400px]">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="step1" variants={stepVariants} initial="hidden" animate="visible" exit="exit" className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Select Category</h2>
                <p className="text-sm text-slate-500 mt-1">Choose a category matching the topic of your prediction. Locked categories require higher coin balances.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                {categories.map(cat => {
                  const isLocked = userBalance < cat.minCoinRequirement;
                  const isSelected = formData.category_id === cat.id;
                  const Icon = getCategoryIcon(cat.name);

                  return (
                    <div 
                      key={cat.id}
                      onClick={() => !isLocked && handleCategorySelect(cat.id)}
                      className={`relative overflow-hidden p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 flex flex-col justify-between min-h-[160px] group ${
                        isLocked 
                          ? "bg-slate-50 dark:bg-dark-900/40 border-slate-100 dark:border-dark-800 cursor-not-allowed opacity-60" 
                          : isSelected 
                            ? "bg-primary/5 dark:bg-primary/10 border-primary shadow-lg shadow-primary/10" 
                            : "bg-white dark:bg-dark-800 border-slate-200 dark:border-dark-700 hover:border-slate-300 dark:hover:border-dark-600 hover:shadow-md"
                      }`}
                    >
                      {/* Premium Spooky Locked State Overlay */}
                      {isLocked && (
                        <div className="absolute inset-0 bg-slate-900/40 dark:bg-dark-900/60 backdrop-blur-[2px] rounded-2xl flex flex-col items-center justify-center p-4 z-10">
                          <Lock className="w-7 h-7 text-danger mb-2 animate-pulse" />
                          <span className="bg-danger/20 text-danger border border-danger/30 text-[10px] font-black px-2.5 py-1 rounded-full flex items-center gap-1 uppercase tracking-wider">
                            <Coins className="w-3 h-3" /> Requires {cat.minCoinRequirement} Coins
                          </span>
                        </div>
                      )}

                      <div className="flex justify-between items-start mb-4">
                        <div className={`p-3 rounded-xl transition-colors duration-300 ${
                          isSelected 
                            ? "bg-primary/20 text-primary dark:text-primary-light" 
                            : "bg-slate-100 dark:bg-dark-700 text-slate-500 dark:text-slate-400 group-hover:bg-primary/10 group-hover:text-primary"
                        }`}>
                          <Icon className="w-6 h-6" />
                        </div>
                        {isSelected && !isLocked && (
                          <div className="bg-primary text-white p-1 rounded-full">
                            <CheckCircle className="w-4 h-4" />
                          </div>
                        )}
                      </div>

                      <div>
                        <h3 className="font-bold text-slate-800 dark:text-slate-100 group-hover:text-primary transition-colors">{cat.name}</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{cat.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step2" variants={stepVariants} initial="hidden" animate="visible" exit="exit" className="space-y-6">
              <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Poll Details</h2>
              
              {selectedCat && (
                <div className="flex items-center justify-between bg-slate-50 dark:bg-dark-900/60 p-4 rounded-2xl border border-slate-200 dark:border-dark-700/60">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary-light rounded-xl">
                      {React.createElement(getCategoryIcon(selectedCat.name), { className: "w-5 h-5" })}
                    </div>
                    <div>
                      <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Selected Category</span>
                      <h4 className="font-bold text-slate-800 dark:text-slate-100">{selectedCat.name}</h4>
                    </div>
                  </div>
                  <button 
                    onClick={() => setStep(1)} 
                    className="text-xs font-black text-primary dark:text-primary-light hover:underline uppercase tracking-wider"
                  >
                    Change
                  </button>
                </div>
              )}

              <div>
                <label className="block text-sm font-bold text-slate-500 mb-2">Question / Title</label>
                <input 
                  type="text" 
                  value={formData.title} 
                  onChange={e => updateField('title', e.target.value)}
                  className="w-full p-4 bg-slate-50 dark:bg-dark-900 border-2 border-slate-200 dark:border-dark-700 rounded-2xl focus:border-primary focus:outline-none text-slate-800 dark:text-white font-medium transition-colors"
                  placeholder="e.g., Who will win the 2026 World Cup?"
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-slate-500 mb-2">Description (Optional)</label>
                <textarea 
                  value={formData.description} 
                  onChange={e => updateField('description', e.target.value)}
                  className="w-full p-4 bg-slate-50 dark:bg-dark-900 border-2 border-slate-200 dark:border-dark-700 rounded-2xl focus:border-primary focus:outline-none text-slate-800 dark:text-white font-medium min-h-[100px] transition-colors"
                  placeholder="Provide any additional context or rules..."
                />
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="step3" variants={stepVariants} initial="hidden" animate="visible" exit="exit" className="space-y-6">
              <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Prediction Options</h2>
              <p className="text-sm text-slate-500">Provide the possible outcomes for this prediction.</p>
              
              <div className="space-y-4">
                {formData.options.map((opt, index) => (
                  <div key={index} className="flex gap-3 items-center">
                    <input 
                      type="text" 
                      value={opt} 
                      onChange={e => updateOption(index, e.target.value)}
                      className="flex-1 p-4 bg-slate-50 dark:bg-dark-900 border-2 border-slate-200 dark:border-dark-700 rounded-2xl focus:border-primary focus:outline-none text-slate-800 dark:text-white font-bold transition-colors"
                      placeholder={`Option ${index + 1}`}
                    />
                    {formData.options.length > 2 && (
                      <button onClick={() => removeOption(index)} className="p-4 text-danger hover:bg-danger/10 rounded-2xl transition-colors">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button onClick={addOption} className="text-primary font-bold flex items-center gap-2 hover:underline">
                <PlusCircle className="w-5 h-5" /> Add another option
              </button>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div key="step4" variants={stepVariants} initial="hidden" animate="visible" exit="exit" className="space-y-6">
              <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Time Limit</h2>
              <div>
                <label className="block text-sm font-bold text-slate-500 mb-2">When does voting close?</label>
                <input 
                  type="datetime-local" 
                  value={formData.endTime} 
                  onChange={e => updateField('endTime', e.target.value)}
                  className="w-full p-4 bg-slate-50 dark:bg-dark-900 border-2 border-slate-200 dark:border-dark-700 rounded-2xl focus:border-primary focus:outline-none text-slate-800 dark:text-white font-medium transition-colors"
                />
              </div>
            </motion.div>
          )}

          {step === 5 && (
            <motion.div key="step5" variants={stepVariants} initial="hidden" animate="visible" exit="exit" className="space-y-6">
              <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Review & Publish</h2>
              <div className="bg-slate-50 dark:bg-dark-900 p-6 rounded-2xl border border-slate-200 dark:border-dark-700">
                
                {selectedCat && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-light uppercase tracking-wider mb-4">
                    {React.createElement(getCategoryIcon(selectedCat.name), { className: "w-3.5 h-3.5" })}
                    {selectedCat.name}
                  </span>
                )}

                <h3 className="text-xl font-display font-bold text-slate-900 dark:text-white mb-2">{formData.title || "Untitled Poll"}</h3>
                <p className="text-slate-500 dark:text-slate-400 mb-6">{formData.description || "No description provided."}</p>
                
                <h4 className="font-bold text-slate-700 dark:text-slate-300 mb-3">Options:</h4>
                <div className="space-y-2">
                  {formData.options.map((opt, i) => (
                    <div key={i} className="bg-white dark:bg-dark-800 p-3 rounded-xl border border-slate-200 dark:border-dark-600 font-bold dark:text-slate-200">
                      {opt || `Empty Option ${i+1}`}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation Buttons */}
        <div className="mt-10 pt-6 border-t border-slate-100 dark:border-dark-700 flex justify-between">
          <button 
            onClick={handleBack} 
            disabled={step === 1}
            className="px-6 py-3 font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 disabled:opacity-0 transition-colors flex items-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" /> Back
          </button>

          {step < 5 ? (
            <button 
              onClick={handleNext}
              disabled={
                (step === 1 && !formData.category_id) ||
                (step === 2 && !formData.title) ||
                (step === 3 && formData.options.some(o => !o)) ||
                (step === 4 && !formData.endTime)
              }
              className="bg-primary hover:bg-primary-dark text-white px-8 py-3 rounded-xl font-bold transition-all shadow-md shadow-primary/20 flex items-center gap-2 disabled:bg-slate-200 disabled:text-slate-400 dark:disabled:bg-dark-700 dark:disabled:text-slate-500"
            >
              Next <ArrowRight className="w-5 h-5" />
            </button>
          ) : (
            <button 
              onClick={handleSubmit}
              disabled={loading}
              className="bg-success hover:bg-emerald-600 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-md shadow-success/20 flex items-center gap-2 disabled:bg-slate-200 disabled:text-slate-400 dark:disabled:bg-dark-700 dark:disabled:text-slate-500"
            >
              {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : "Publish Poll"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreatePoll;
