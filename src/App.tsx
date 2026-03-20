/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Rocket, Target, Layout, CircleDollarSign, Mic2, ChevronRight, 
  AlertCircle, CheckCircle2, TrendingUp, Users, Lightbulb, 
  ArrowRight, Loader2, GitBranch, ShieldCheck, Zap, History,
  Terminal, Cpu, Globe, Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Stage, StartupData, DecisionPoint, DecisionOption } from './types';
import { validateIdea, simulatePitch, generateDecision, generateFinalFeedback } from './services/deepseek';

const MAX_DECISION_STEPS = 5;

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function App() {
  const [currentStage, setCurrentStage] = useState<Stage>('dashboard');
  const [data, setData] = useState<StartupData>({
    idea: '', targetAudience: '', problemSolved: '', revenueModel: '',
    initialCapital: 100000, monthlyBurn: 5000, marketShare: 0, teamSize: 1, reputation: 50,
  });

  const [validationResult, setValidationResult] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [pitchInput, setPitchInput] = useState('');
  const [pitchFeedback, setPitchFeedback] = useState<any>(null);
  const [currentDecision, setCurrentDecision] = useState<DecisionPoint | null>(null);
  const [decisionHistory, setDecisionHistory] = useState<{title: string, choice: string}[]>([]);
  const [lastImpact, setLastImpact] = useState<DecisionOption['impact'] | null>(null);
  const [decisionCount, setDecisionCount] = useState(0);
  const [finalEvaluation, setFinalEvaluation] = useState<any>(null);

  const handleValidate = async () => {
    setIsLoading(true);
    try {
      const result = await validateIdea(data);
      setValidationResult(result);
    } catch (error) { console.error(error); } finally { setIsLoading(false); }
  };

  const handlePitch = async () => {
    setIsLoading(true);
    try {
      const result = await simulatePitch(data, pitchInput);
      setPitchFeedback(result);
    } catch (error) { console.error(error); } finally { setIsLoading(false); }
  };

  const fetchNewDecision = async () => {
    setIsLoading(true);
    setLastImpact(null);
    try {
      const result = await generateDecision(data);
      setCurrentDecision(result);
    } catch (error) { console.error(error); } finally { setIsLoading(false); }
  };

  const handleSelectOption = (option: DecisionOption) => {
    const impact = option.impact;
    setLastImpact(impact);
    setData(prev => ({
      ...prev,
      initialCapital: prev.initialCapital + impact.financial,
      marketShare: Math.max(0, Math.min(100, prev.marketShare + impact.marketShare)),
      reputation: Math.max(0, Math.min(100, prev.reputation + impact.reputation)),
    }));
    setDecisionHistory(prev => [{ title: currentDecision?.title || '未知决策', choice: option.label }, ...prev]);
    setDecisionCount(prev => prev + 1);
  };

  const handleFinalEvaluation = async () => {
    setIsLoading(true);
    try {
      const result = await generateFinalFeedback(data, decisionHistory);
      setFinalEvaluation(result);
    } catch (error) { console.error(error); } finally { setIsLoading(false); }
  };

  const sidebarItems = [
    { id: 'dashboard', label: '系统', icon: Cpu },
    { id: 'idea', label: '核心创意', icon: Lightbulb },
    { id: 'canvas', label: '战略规划', icon: Target },
    { id: 'finance', label: '资产管理', icon: CircleDollarSign },
    { id: 'decision', label: '关键决策', icon: GitBranch },
    { id: 'pitch', label: '路演网络', icon: Mic2 },
  ];

  return (
    <div className="flex h-screen bg-cyber-black text-slate-100 overflow-hidden font-mono selection:bg-neon-cyan selection:text-black">
      <div className="scanline" />
      
      {/* HUD Sidebar */}
      <aside className="w-64 bg-cyber-gray border-r border-white/10 flex flex-col z-10">
        <div className="p-6 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-neon-cyan/20 border border-neon-cyan flex items-center justify-center text-neon-cyan shadow-[0_0_10px_rgba(0,242,255,0.3)]">
              <Rocket size={18} />
            </div>
            <span className="font-bold text-lg tracking-tighter neon-text-cyan">创业系统_OS</span>
          </div>
          <div className="mt-2 text-[10px] text-slate-500 uppercase tracking-widest">v2.0.4-稳定版</div>
        </div>

        <nav className="flex-1 px-3 py-6 space-y-2">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentStage(item.id as Stage)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 text-xs font-bold tracking-widest transition-all border border-transparent",
                currentStage === item.id 
                  ? "bg-neon-cyan/10 text-neon-cyan border-neon-cyan/50 shadow-[inset_0_0_10px_rgba(0,242,255,0.1)]" 
                  : "text-slate-500 hover:text-slate-300 hover:bg-white/5"
              )}
            >
              <item.icon size={14} />
              {item.label}
            </button>
          ))}
        </nav>

        {/* HUD Stats */}
        <div className="p-4 space-y-4 border-t border-white/5 bg-black/40">
          <div className="space-y-1">
            <div className="flex justify-between text-[10px] uppercase text-slate-500">
              <span>资本</span>
              <span className="text-neon-cyan">¥{data.initialCapital.toLocaleString()}</span>
            </div>
            <div className="h-1 bg-white/5 overflow-hidden">
              <div className="h-full bg-neon-cyan shadow-[0_0_10px_rgba(0,242,255,0.5)] transition-all" style={{ width: '70%' }} />
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-[10px] uppercase text-slate-500">
              <span>市场</span>
              <span className="text-neon-purple">{data.marketShare}%</span>
            </div>
            <div className="h-1 bg-white/5 overflow-hidden">
              <div className="h-full bg-neon-purple shadow-[0_0_10px_rgba(188,19,254,0.5)] transition-all" style={{ width: `${data.marketShare}%` }} />
            </div>
          </div>
        </div>
      </aside>

      {/* Main Viewport */}
      <main className="flex-1 overflow-y-auto relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,242,255,0.05),transparent_70%)] pointer-events-none" />
        
        <div className="max-w-5xl mx-auto p-10 relative z-10">
          <AnimatePresence mode="wait">
            {currentStage === 'dashboard' && (
              <motion.div key="dash" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-10">
                <header className="border-b border-white/10 pb-6 relative overflow-hidden">
                  <motion.div 
                    initial={{ x: '-100%' }}
                    animate={{ x: '100%' }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="absolute top-0 left-0 w-1/4 h-[1px] bg-neon-cyan shadow-[0_0_10px_#00f2ff]"
                  />
                  <h1 className="text-5xl font-black tracking-tighter neon-text-cyan italic glitch-text">核心控制台</h1>
                  <p className="terminal-text mt-2 text-slate-400">欢迎，创始人。正在初始化模拟环境...</p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    { icon: Lightbulb, label: '创意同步', desc: '市场缺口的神经分析。', color: 'cyan' },
                    { icon: Activity, label: '业务指标', desc: '实时资金流向追踪。', color: 'purple' },
                    { icon: Globe, label: '路演网络', desc: '全球投资者上行模拟。', color: 'amber' },
                  ].map((card, i) => (
                    <div key={i} className="cyber-card p-6 group hover:border-neon-cyan/50 transition-all">
                      <card.icon className={cn("mb-4", card.color === 'cyan' ? 'text-neon-cyan' : card.color === 'purple' ? 'text-neon-purple' : 'text-neon-amber')} size={32} />
                      <h3 className="font-bold text-lg tracking-tight">{card.label}</h3>
                      <p className="terminal-text mt-2">{card.desc}</p>
                    </div>
                  ))}
                </div>

                <div className="cyber-card p-10 border-neon-cyan/20 bg-gradient-to-br from-neon-cyan/5 to-transparent">
                  <h2 className="text-2xl font-bold mb-4 neon-text-cyan tracking-widest">初始化序列？</h2>
                  <p className="terminal-text mb-8 max-w-lg">市场瞬息万变。数据就是力量。开始你的模拟，在数字经济中竞争。</p>
                  <button onClick={() => setCurrentStage('idea')} className="btn-cyber">执行创业计划 V1.0</button>
                </div>
              </motion.div>
            )}

            {currentStage === 'idea' && (
              <motion.div key="idea" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
                <header className="border-b border-white/10 pb-4">
                  <h2 className="text-3xl font-bold neon-text-cyan tracking-tighter">第一阶段：创意验证</h2>
                  <p className="terminal-text text-slate-500 uppercase">输入核心参数以进行 AI 神经处理。</p>
                </header>

                <div className="cyber-card p-8 space-y-8">
                  <div className="space-y-3">
                    <label className="text-[10px] uppercase tracking-[0.3em] text-neon-cyan font-bold">概念输入</label>
                    <textarea 
                      className="w-full bg-black/50 p-6 border border-white/10 focus:border-neon-cyan outline-none min-h-[150px] text-sm font-mono"
                      placeholder="描述你的颠覆性想法..."
                      value={data.idea}
                      onChange={(e) => setData({...data, idea: e.target.value})}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-[10px] uppercase tracking-[0.3em] text-slate-500 font-bold">目标领域</label>
                      <input 
                        className="w-full bg-black/50 p-4 border border-white/10 focus:border-neon-cyan outline-none text-sm"
                        value={data.targetAudience}
                        onChange={(e) => setData({...data, targetAudience: e.target.value})}
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] uppercase tracking-[0.3em] text-slate-500 font-bold">痛点识别</label>
                      <input 
                        className="w-full bg-black/50 p-4 border border-white/10 focus:border-neon-cyan outline-none text-sm"
                        value={data.problemSolved}
                        onChange={(e) => setData({...data, problemSolved: e.target.value})}
                      />
                    </div>
                  </div>

                  <button onClick={handleValidate} disabled={isLoading || !data.idea} className="btn-cyber w-full flex items-center justify-center gap-3">
                    {isLoading ? <Loader2 className="animate-spin" /> : <Terminal size={18} />}
                    运行神经分析
                  </button>
                </div>

                {validationResult && (
                  <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="cyber-card p-8 border-l-4 border-neon-cyan">
                    <div className="flex justify-between items-center mb-8">
                      <h3 className="text-xl font-bold tracking-widest">分析报告</h3>
                      <div className="text-right">
                        <div className="text-[10px] text-slate-500 uppercase">可行性评分</div>
                        <div className="text-4xl font-black neon-text-cyan">{validationResult.score}</div>
                      </div>
                    </div>
                    <div className="terminal-text text-sm leading-relaxed mb-8 prose prose-invert max-w-none">
                      <ReactMarkdown>{validationResult.feedback}</ReactMarkdown>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                      {validationResult.suggestions.map((s: string, i: number) => (
                        <div key={i} className="p-4 bg-white/5 border border-white/5 text-[11px] flex gap-3">
                          <AlertCircle size={14} className="text-neon-cyan shrink-0" />
                          <span>{s}</span>
                        </div>
                      ))}
                    </div>
                    <button onClick={() => setCurrentStage('canvas')} className="btn-cyber w-full border-neon-purple text-neon-purple hover:bg-neon-purple">
                      初始化战略规划
                    </button>
                  </motion.div>
                )}
              </motion.div>
            )}

            {currentStage === 'canvas' && (
              <motion.div key="canvas" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
                <header className="border-b border-white/10 pb-4">
                  <h2 className="text-3xl font-bold neon-text-cyan tracking-tighter">第二阶段：战略规划</h2>
                  <p className="terminal-text text-slate-500 uppercase">定义你的运营参数和收入流。</p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="cyber-card p-6 space-y-4">
                    <label className="text-[10px] uppercase tracking-[0.3em] text-neon-cyan font-bold">收入模型</label>
                    <textarea 
                      className="w-full bg-black/50 p-4 border border-white/10 focus:border-neon-cyan outline-none min-h-[100px] text-sm font-mono"
                      placeholder="你将如何盈利？"
                      value={data.revenueModel}
                      onChange={(e) => setData({...data, revenueModel: e.target.value})}
                    />
                  </div>
                  <div className="cyber-card p-6 space-y-4">
                    <label className="text-[10px] uppercase tracking-[0.3em] text-neon-purple font-bold">增长策略</label>
                    <textarea 
                      className="w-full bg-black/50 p-4 border border-white/10 focus:border-neon-purple outline-none min-h-[100px] text-sm font-mono"
                      placeholder="你将如何扩张？"
                    />
                  </div>
                </div>

                <div className="cyber-card p-8 border-neon-cyan/20">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <ShieldCheck className="text-neon-cyan" size={20} />
                    战略咨询
                  </h3>
                  <p className="terminal-text text-sm">
                    你的收入模型至关重要。在扩张前确保你的单位经济效益是可持续的。
                    当前市场波动：<span className="text-neon-amber">中等</span>
                  </p>
                </div>
                
                <button onClick={() => setCurrentStage('finance')} className="btn-cyber w-full">继续前往资产管理</button>
              </motion.div>
            )}

            {currentStage === 'finance' && (
              <motion.div key="finance" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
                <header className="border-b border-white/10 pb-4">
                  <h2 className="text-3xl font-bold neon-text-amber tracking-tighter">第三阶段：资产分配</h2>
                  <p className="terminal-text text-slate-500 uppercase">管理你的财务跑道和烧钱速度。</p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="cyber-card p-8 space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest text-slate-500">初始资本 (¥)</label>
                      <input 
                        type="number"
                        className="w-full bg-black/50 p-4 border border-white/10 focus:border-neon-amber outline-none text-xl font-bold text-neon-amber"
                        value={data.initialCapital}
                        onChange={(e) => setData({...data, initialCapital: parseInt(e.target.value) || 0})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest text-slate-500">每月支出 (¥)</label>
                      <input 
                        type="number"
                        className="w-full bg-black/50 p-4 border border-white/10 focus:border-neon-amber outline-none text-xl font-bold text-rose-500"
                        value={data.monthlyBurn}
                        onChange={(e) => setData({...data, monthlyBurn: parseInt(e.target.value) || 0})}
                      />
                    </div>
                  </div>

                  <div className="cyber-card p-8 flex flex-col justify-center items-center text-center space-y-4 border-neon-amber/20">
                    <div className="text-[10px] uppercase tracking-[0.4em] text-slate-500">跑道预测</div>
                    <div className="text-6xl font-black neon-text-amber">
                      {data.monthlyBurn > 0 ? Math.floor(data.initialCapital / data.monthlyBurn) : '∞'}
                    </div>
                    <div className="text-xs uppercase tracking-widest text-neon-amber font-bold">剩余月份</div>
                    <p className="terminal-text mt-4 max-w-[200px]">警告：跑道少于 6 个月将触发系统警报。</p>
                  </div>
                </div>

                <button onClick={() => setCurrentStage('decision')} className="btn-cyber border-neon-amber text-neon-amber hover:bg-neon-amber w-full">初始化决策矩阵</button>
              </motion.div>
            )}

            {currentStage === 'decision' && (
              <motion.div key="dec" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                <header className="flex justify-between items-end border-b border-white/10 pb-4">
                  <div>
                    <h2 className="text-3xl font-bold neon-text-purple tracking-tighter">第四阶段：决策矩阵</h2>
                    <p className="terminal-text text-slate-500">检测到关键系统分支。请明智选择。</p>
                  </div>
                  <div className="flex gap-6">
                    <div className="text-right">
                      <div className="text-[10px] text-slate-500 uppercase">市场份额</div>
                      <div className="text-xl font-bold neon-text-purple">{data.marketShare}%</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] text-slate-500 uppercase">声望</div>
                      <div className="text-xl font-bold neon-text-amber">{data.reputation}/100</div>
                    </div>
                  </div>
                </header>

                {!currentDecision && !isLoading && (
                  <div className="cyber-card p-16 text-center space-y-8">
                    <GitBranch size={64} className="mx-auto text-neon-purple opacity-50" />
                    <div className="space-y-2">
                      <h3 className="text-2xl font-bold tracking-widest">等待输入</h3>
                      <p className="terminal-text max-w-xs mx-auto">市场正在演变。生成一个新场景来测试你的领导力。</p>
                    </div>
                    <button onClick={fetchNewDecision} className="btn-cyber border-neon-purple text-neon-purple hover:bg-neon-purple">生成场景</button>
                  </div>
                )}

                {isLoading && (
                  <div className="cyber-card p-20 flex flex-col items-center justify-center gap-6">
                    <Loader2 className="animate-spin text-neon-purple" size={48} />
                    <p className="terminal-text animate-pulse">正在模拟市场波动...</p>
                  </div>
                )}

                {currentDecision && !isLoading && (
                  <div className="space-y-6">
                    <div className="cyber-card p-8 border-t-2 border-neon-purple bg-neon-purple/5">
                      <div className="text-[10px] text-neon-purple font-bold mb-2 tracking-[0.4em]">事件日志</div>
                      <h3 className="text-2xl font-bold mb-4">{currentDecision.title}</h3>
                      <p className="terminal-text text-sm">{currentDecision.context}</p>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                      {currentDecision.options.map((opt) => (
                        <button
                          key={opt.id}
                          disabled={!!lastImpact}
                          onClick={() => handleSelectOption(opt)}
                          className={cn(
                            "cyber-card p-6 text-left transition-all group",
                            lastImpact ? "opacity-30 cursor-default" : "hover:bg-white/5 hover:border-neon-purple/50"
                          )}
                        >
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="font-bold tracking-widest group-hover:text-neon-purple">{opt.label}</h4>
                            <ChevronRight size={16} className="text-slate-600 group-hover:text-neon-purple" />
                          </div>
                          <p className="terminal-text text-[11px]">{opt.description}</p>
                        </button>
                      ))}
                    </div>

                    {lastImpact && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="cyber-card p-8 bg-neon-purple/10 border-neon-purple/30">
                        <div className="flex items-center gap-2 text-neon-cyan font-bold text-xs mb-6 tracking-widest">
                          <Zap size={14} /> 执行完成
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                          <div className="space-y-2">
                            <div className="text-[10px] text-slate-500 uppercase font-bold">短期影响</div>
                            <p className="terminal-text text-xs">{lastImpact.shortTerm}</p>
                          </div>
                          <div className="space-y-2">
                            <div className="text-[10px] text-slate-500 uppercase font-bold">长期预测</div>
                            <p className="terminal-text text-xs">{lastImpact.longTerm}</p>
                          </div>
                        </div>
                        <div className="flex gap-4">
                          {decisionCount < MAX_DECISION_STEPS ? (
                            <button onClick={fetchNewDecision} className="btn-cyber text-[10px] py-2">下一周期 ({decisionCount}/{MAX_DECISION_STEPS})</button>
                          ) : (
                            <button onClick={handleFinalEvaluation} className="btn-cyber border-neon-purple text-neon-purple hover:bg-neon-purple text-[10px] py-2">生成最终评估</button>
                          )}
                          <button onClick={() => setCurrentStage('pitch')} className="btn-cyber border-neon-amber text-neon-amber hover:bg-neon-amber text-[10px] py-2">上传路演</button>
                        </div>
                      </motion.div>
                    )}

                    {finalEvaluation && (
                      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="cyber-card p-8 border-neon-cyan bg-neon-cyan/5">
                        <div className="flex justify-between items-center mb-6">
                          <h3 className="text-2xl font-bold neon-text-cyan tracking-widest">最终模拟评估</h3>
                          <div className="px-4 py-1 text-xs font-bold border border-neon-purple text-neon-purple">
                            成就等级: {finalEvaluation.achievement}
                          </div>
                        </div>
                        
                        <p className="terminal-text text-sm mb-8 leading-relaxed italic">"{finalEvaluation.summary}"</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                          <div className="space-y-4">
                            <div className="text-[10px] text-emerald-500 font-bold tracking-widest uppercase">核心优势</div>
                            {finalEvaluation.strengths.map((s: string, i: number) => (
                              <div key={i} className="flex gap-2 text-[11px] items-start">
                                <CheckCircle2 size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                                <span>{s}</span>
                              </div>
                            ))}
                          </div>
                          <div className="space-y-4">
                            <div className="text-[10px] text-rose-500 font-bold tracking-widest uppercase">潜在风险</div>
                            {finalEvaluation.weaknesses.map((w: string, i: number) => (
                              <div key={i} className="flex gap-2 text-[11px] items-start">
                                <AlertCircle size={14} className="text-rose-500 shrink-0 mt-0.5" />
                                <span>{w}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <button onClick={() => setCurrentStage('pitch')} className="btn-cyber w-full">前往最终路演</button>
                      </motion.div>
                    )}

                    {decisionHistory.length > 0 && (
                      <div className="cyber-card p-6 border-white/5 bg-black/20">
                        <div className="text-[10px] text-slate-500 font-bold mb-4 tracking-widest flex items-center gap-2">
                          <History size={12} /> 历史决策日志
                        </div>
                        <div className="space-y-3 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                          {decisionHistory.map((h, i) => (
                            <div key={i} className="flex justify-between items-start text-[10px] border-b border-white/5 pb-2">
                              <span className="text-slate-400">{h.title}</span>
                              <span className="text-neon-purple font-bold">[{h.choice}]</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            )}

            {currentStage === 'pitch' && (
              <motion.div key="pitch" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                <header className="border-b border-white/10 pb-4">
                  <h2 className="text-3xl font-bold neon-text-amber tracking-tighter">第五阶段：路演模拟器</h2>
                  <p className="terminal-text text-slate-500">正在连接到全球投资者网络...</p>
                </header>

                <div className="cyber-card p-8 space-y-8">
                  <div className="flex items-center gap-4 p-4 bg-white/5 border border-white/5">
                    <div className="w-10 h-10 bg-neon-amber/20 border border-neon-amber flex items-center justify-center text-neon-amber">
                      <Globe size={20} />
                    </div>
                    <div className="terminal-text">
                      <p className="font-bold text-neon-amber">上行链路已建立</p>
                      <p className="text-[10px]">“传输你的价值主张。我们正在倾听。”</p>
                    </div>
                  </div>

                  <textarea 
                    className="w-full bg-black/50 p-6 border border-white/10 focus:border-neon-amber outline-none min-h-[200px] text-sm font-mono"
                    placeholder="启动路演序列..."
                    value={pitchInput}
                    onChange={(e) => setPitchInput(e.target.value)}
                  />

                  <button onClick={handlePitch} disabled={isLoading || !pitchInput} className="btn-cyber border-neon-amber text-neon-amber hover:bg-neon-amber w-full">
                    {isLoading ? <Loader2 className="animate-spin" /> : <Mic2 size={18} />}
                    传输路演数据
                  </button>
                </div>

                {pitchFeedback && (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="cyber-card p-8 border-l-4 border-neon-amber">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl font-bold tracking-widest">投资者回应</h3>
                      <div className={cn(
                        "px-4 py-1 text-[10px] font-bold border",
                        pitchFeedback.investmentIntent === '拒绝' ? "border-rose-500 text-rose-500" : "border-emerald-500 text-emerald-500"
                      )}>
                        状态: {pitchFeedback.investmentIntent}
                      </div>
                    </div>
                    <p className="terminal-text text-sm mb-8 leading-relaxed">{pitchFeedback.feedback}</p>
                    <div className="space-y-4">
                      <div className="text-[10px] text-neon-amber font-bold tracking-widest">质询点:</div>
                      {pitchFeedback.questions.map((q: string, i: number) => (
                        <div key={i} className="p-4 bg-white/5 border border-white/5 text-[11px] italic">
                          {i + 1}. {q}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
                
                <div className="mt-12 pt-8 border-t border-white/5 flex justify-center">
                  <button 
                    onClick={() => {
                      setCurrentStage('dashboard');
                      setData({
                        idea: '', targetAudience: '', problemSolved: '', revenueModel: '',
                        initialCapital: 100000, monthlyBurn: 5000, marketShare: 0, teamSize: 1, reputation: 50,
                      });
                      setValidationResult(null);
                      setPitchFeedback(null);
                      setCurrentDecision(null);
                      setDecisionHistory([]);
                      setLastImpact(null);
                      setDecisionCount(0);
                      setFinalEvaluation(null);
                    }}
                    className="text-slate-500 hover:text-neon-cyan transition-colors flex items-center gap-2 text-[10px] uppercase tracking-widest"
                  >
                    <History size={14} /> 重启模拟
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
