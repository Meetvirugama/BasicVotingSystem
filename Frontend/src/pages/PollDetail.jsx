import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Timer, ArrowLeft, TrendingUp, Users } from "lucide-react";
import { motion } from "framer-motion";
import api from "../services/api";
import Badge from "../components/Badge";
import Coin from "../components/Coin";
import { useAuth } from "../context/AuthContext";

const PollDetail = () => {
  const { id } = useParams();
  const { user, updateBalance } = useAuth();
  const [poll, setPoll] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stakeAmount, setStakeAmount] = useState("");
  const [selectedOption, setSelectedOption] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);
  const [hasPredicted, setHasPredicted] = useState(false);
  const [userPrediction, setUserPrediction] = useState(null);

  useEffect(() => {
    const fetchPoll = async () => {
      try {
        const { data } = await api.get(`/polls/${id}`);
        if (data.success) {
          setPoll(data.poll);
          setHasPredicted(data.hasPredicted || false);
          setUserPrediction(data.userPrediction || null);
          if (data.hasPredicted && data.userPrediction) {
            const opt = data.poll.options.find(o => o.id === data.userPrediction.option_id);
            if (opt) setSelectedOption(opt);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPoll();
  }, [id]);

  const handlePredict = async () => {
    if (!selectedOption || !stakeAmount || stakeAmount <= 0) return;
    setSubmitting(true);
    setMessage(null);
    try {
      const { data } = await api.post(`/polls/${id}/predict`, {
        option_id: selectedOption.id,
        stakeAmount: parseFloat(stakeAmount)
      });
      if (data.success) {
        setMessage({ type: "success", text: data.message || "Prediction successfully submitted!" });
        updateBalance(parseFloat(user.coinBalance) - parseFloat(stakeAmount));
        const res = await api.get(`/polls/${id}`);
        if (res.data.success) {
          setPoll(res.data.poll);
          setHasPredicted(res.data.hasPredicted || false);
          setUserPrediction(res.data.userPrediction || null);
        }
      }
    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: err.response?.data?.error || "Error placing prediction." });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!poll) return <div className="text-center mt-20 text-slate-500 font-bold">Poll not found.</div>;

  const totalPool = poll.options.reduce((acc, opt) => acc + parseFloat(opt.totalStaked), 0);

  // Prediction Calculator
  const potentialReturn = selectedOption && stakeAmount
    ? (parseFloat(stakeAmount) * (totalPool > 0 && parseFloat(selectedOption.totalStaked) > 0 ? (totalPool * 0.9) / parseFloat(selectedOption.totalStaked) : 1)).toFixed(2)
    : "0.00";

  return (
    <div className="animate-in fade-in duration-500 max-w-4xl mx-auto">
      <button onClick={() => window.history.back()} className="flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 font-bold mb-6 transition-colors">
        <ArrowLeft className="w-5 h-5" /> Back to Feed
      </button>

      <div className="bg-white dark:bg-dark-800 border border-slate-200 dark:border-dark-700 rounded-[2.5rem] p-6 md:p-10 shadow-2xl shadow-slate-200/50 dark:shadow-none mb-8 relative overflow-hidden">
        
        {/* Header */}
        <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
          <Badge variant="primary" className="text-sm">{poll.category?.name || "General"}</Badge>
          <div className="flex gap-3">
            <Badge variant="success" className="flex items-center gap-1.5 px-3 py-1.5 text-sm">
              <Timer className="w-4 h-4" /> Active
            </Badge>
            <div className="bg-slate-100 dark:bg-dark-700 text-slate-600 dark:text-slate-300 font-bold flex items-center gap-2 px-4 py-1.5 rounded-xl text-sm border border-slate-200 dark:border-dark-600">
              <Users className="w-4 h-4" /> {totalPool} Pooled
            </div>
          </div>
        </div>

        <h1 className="text-3xl md:text-4xl font-display font-black text-slate-900 dark:text-white leading-tight mb-4">
          {poll.title}
        </h1>
        <p className="text-slate-500 dark:text-slate-400 font-medium text-lg mb-10">{poll.description}</p>

        {/* Options Graph Layout */}
        <div className="space-y-4 mb-10">
          {poll.options.map((opt) => {
            const pool = parseFloat(opt.totalStaked);
            const percentage = totalPool > 0 ? ((pool / totalPool) * 100).toFixed(0) : 0;
            const odds = pool > 0 ? ((totalPool * 0.9) / pool).toFixed(2) : "1.00";
            const isSelected = selectedOption?.id === opt.id;

            return (
              <div 
                key={opt.id} 
                onClick={() => !hasPredicted && setSelectedOption(opt)}
                className={`relative rounded-2xl p-5 cursor-pointer transition-all border-2 overflow-hidden ${
                  isSelected 
                    ? "border-primary bg-primary/5 shadow-lg shadow-primary/20 scale-[1.01]" 
                    : "border-slate-100 dark:border-dark-700 bg-slate-50 dark:bg-dark-900 hover:border-primary/30"
                } ${hasPredicted ? "cursor-default" : ""}`}
              >
                <motion.div 
                  className={`absolute top-0 left-0 h-full ${isSelected ? "bg-primary/10" : "bg-slate-200/50 dark:bg-dark-700/50"}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
                
                <div className="relative z-10 flex flex-col md:flex-row justify-between md:items-center gap-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${isSelected ? "border-primary" : "border-slate-300 dark:border-dark-600"}`}>
                      {isSelected && <div className="w-3 h-3 bg-primary rounded-full" />}
                    </div>
                    <span className="font-bold text-lg text-slate-800 dark:text-slate-200">{opt.name}</span>
                  </div>
                  
                  <div className="flex items-center gap-4 ml-10 md:ml-0">
                    <div className="text-right">
                      <div className="text-2xl font-black text-slate-900 dark:text-white">{percentage}%</div>
                      <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">{pool} Coins</div>
                    </div>
                    <div className="bg-white dark:bg-dark-800 border border-slate-200 dark:border-dark-600 rounded-xl px-4 py-2 flex items-center gap-2 shadow-sm">
                      <TrendingUp className="w-5 h-5 text-success" />
                      <span className="font-black text-success">{odds}x</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {message && (
          <div className={`p-4 rounded-2xl mb-6 font-bold border ${message.type === 'success' ? 'bg-success/10 text-success border-success/20' : 'bg-danger/10 text-danger border-danger/20'}`}>
            {message.text}
          </div>
        )}

        {/* Interactive Stake Calculator or Active Prediction Panel */}
        {hasPredicted && userPrediction ? (
          <div className="bg-gradient-to-r from-success/5 to-primary/5 border border-success/20 dark:border-success/30 rounded-3xl p-6 md:p-8 shadow-inner relative overflow-hidden">
            <div className="absolute right-0 bottom-0 translate-x-6 translate-y-6 opacity-5 pointer-events-none">
              <Users className="w-64 h-64 text-success" />
            </div>
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
              <div>
                <span className="bg-success/10 text-success text-xs font-bold px-3 py-1.5 rounded-lg border border-success/20 uppercase tracking-widest mb-3 inline-block">
                  ✨ Prediction Locked & Recorded
                </span>
                <h3 className="font-display font-black text-2xl text-slate-800 dark:text-white mb-2">Your Active Prediction</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">You predicted <span className="font-bold text-slate-700 dark:text-slate-300">"{poll.options.find(opt => opt.id === userPrediction.option_id)?.name || ''}"</span> on this poll.</p>
              </div>

              <div className="flex flex-wrap gap-4 w-full md:w-auto">
                <div className="bg-white dark:bg-dark-800 border border-slate-200 dark:border-dark-700 px-5 py-3 rounded-2xl flex-1 md:flex-none min-w-[120px] text-center shadow-sm">
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1">STAKED AMOUNT</span>
                  <span className="text-lg font-black text-slate-800 dark:text-slate-100 flex items-center justify-center gap-1">
                    {parseFloat(userPrediction.stakeAmount).toFixed(0)} <Coin size="sm" />
                  </span>
                </div>
                <div className="bg-white dark:bg-dark-800 border border-slate-200 dark:border-dark-700 px-5 py-3 rounded-2xl flex-1 md:flex-none min-w-[100px] text-center shadow-sm">
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1">LOCKED ODDS</span>
                  <span className="text-lg font-black text-primary">
                    {parseFloat(userPrediction.lockedOdds).toFixed(2)}x
                  </span>
                </div>
                <div className="bg-primary text-white px-6 py-3 rounded-2xl flex-grow md:flex-grow-0 min-w-[150px] text-center shadow-md shadow-primary/20">
                  <span className="text-[10px] font-bold text-white/80 uppercase tracking-wider block mb-1">POTENTIAL RETURN</span>
                  <span className="text-xl font-black flex items-center justify-center gap-1">
                    +{(parseFloat(userPrediction.stakeAmount) * parseFloat(userPrediction.lockedOdds)).toFixed(2)} <Coin size="sm" />
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-slate-50 dark:bg-dark-900 border border-slate-200 dark:border-dark-700 rounded-3xl p-6 md:p-8">
            <h3 className="font-display font-bold text-xl text-slate-800 dark:text-slate-100 mb-6">Make Your Prediction</h3>
            
            <div className="flex flex-col md:flex-row gap-6 items-end">
              <div className="flex-1 w-full">
                <label className="block text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                  Stake Amount
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Coin size="sm" />
                  </div>
                  <input 
                    type="number" 
                    value={stakeAmount}
                    onChange={(e) => setStakeAmount(e.target.value)}
                    placeholder="Enter coins to stake" 
                    className="w-full pl-12 pr-4 py-4 bg-white dark:bg-dark-800 border-2 border-slate-200 dark:border-dark-600 rounded-2xl focus:outline-none focus:border-primary font-bold text-lg text-slate-800 dark:text-white transition-colors"
                  />
                </div>
              </div>

              <div className="flex-1 w-full bg-primary/10 border border-primary/20 rounded-2xl p-4 flex justify-between items-center h-[60px]">
                <div>
                  <span className="text-xs font-bold text-primary/80 uppercase tracking-wider block">Potential Return</span>
                  <span className="text-xl font-black text-primary flex items-center gap-1">
                    +{potentialReturn} <Coin size="sm" />
                  </span>
                </div>
                {selectedOption && (
                  <Badge variant="primary" className="h-8">
                    {((totalPool * 0.9) / parseFloat(selectedOption.totalStaked)).toFixed(2)}x Odds
                  </Badge>
                )}
              </div>

              <button 
                disabled={!selectedOption || !stakeAmount || stakeAmount <= 0 || submitting}
                onClick={handlePredict}
                className="w-full md:w-auto bg-primary hover:bg-primary-dark disabled:bg-slate-300 dark:disabled:bg-dark-700 disabled:text-slate-500 text-white font-bold py-4 px-8 rounded-2xl transition-all shadow-xl shadow-primary/20 disabled:shadow-none h-[60px] flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  "Confirm Prediction"
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PollDetail;
