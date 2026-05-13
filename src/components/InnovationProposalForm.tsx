import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Lightbulb, 
  Target, 
  ListChecks, 
  Scale, 
  Coins, 
  Clock, 
  ChevronRight, 
  ArrowLeft,
  Save,
  Send,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { cn } from '../lib/utils';
import { InnovationProposal } from '../types';

interface Props {
  onClose: () => void;
  onSubmit: (proposal: Omit<InnovationProposal, 'id' | 'userId' | 'userName' | 'userPhoto' | 'createdAt' | 'status'>) => void;
}

export default function InnovationProposalForm({ onClose, onSubmit }: Props) {
  const [step, setStep] = useState(1);
  const [title, setTitle] = useState('');
  const [executiveSummary, setExecutiveSummary] = useState('');
  const [projectOverview, setProjectOverview] = useState('');
  const [problem, setProblem] = useState('');
  const [mainObjective, setMainObjective] = useState('');
  const [specificObjectives, setSpecificObjectives] = useState<string[]>(['']);
  const [scopeOfWork, setScopeOfWork] = useState<{ phase: string; duration: string; details: string[] }[]>([
    { phase: 'Requirement Analysis', duration: '1 Week', details: ['Gather client requirements', 'Identify business goals'] }
  ]);
  const [description, setDescription] = useState('');
  const [materials, setMaterials] = useState<string[]>(['']);
  const [technologies, setTechnologies] = useState<{ area: string; tech: string }[]>([
    { area: 'Frontend', tech: 'React / Vite' },
    { area: 'Backend', tech: 'Node.js' },
    { area: 'Database', tech: 'Firebase' }
  ]);
  const [methodology, setMethodology] = useState<string[]>(['']);
  const [deliverables, setDeliverables] = useState<string[]>(['Fully functional software', 'Source code', 'Documentation']);
  const [benefits, setBenefits] = useState({ social: '', economic: '', environmental: '', general: ['Faster operations', 'Improved accuracy'] });
  const [budget, setBudget] = useState<{ item: string; cost: number }[]>([
    { item: 'Design', cost: 500 },
    { item: 'Development', cost: 3000 },
    { item: 'Testing', cost: 500 }
  ]);
  const [timeline, setTimeline] = useState<{ activity: string; duration: string }[]>([
    { activity: 'Design', duration: '1-2 Weeks' },
    { activity: 'Development', duration: '4-8 Weeks' }
  ]);
  const [conclusion, setConclusion] = useState('');
  const [contactInfo, setContactInfo] = useState({
    name: 'Nahom Henok',
    school: 'MELKA HAYU',
    email: 'henokgirma878@gmail.com',
    phone: '+251 913 701 487'
  });

  const totalSteps = 11;

  const nextStep = () => setStep(s => Math.min(s + 1, totalSteps));
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  const handleAddInArray = (setter: React.Dispatch<React.SetStateAction<string[]>>) => {
    setter(prev => [...prev, '']);
  };

  const handleRemoveInArray = (index: number, setter: React.Dispatch<React.SetStateAction<string[]>>) => {
    setter(prev => prev.filter((_, i) => i !== index));
  };

  const updateInArray = (index: number, value: string, setter: React.Dispatch<React.SetStateAction<string[]>>) => {
    setter(prev => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      title,
      executiveSummary,
      projectOverview,
      problem,
      objectives: { main: mainObjective, specific: specificObjectives.filter(s => s.trim() !== '') },
      scopeOfWork,
      description,
      materials: materials.filter(m => m.trim() !== ''),
      technologies,
      methodology: methodology.filter(m => m.trim() !== ''),
      deliverables: deliverables.filter(d => d.trim() !== ''),
      benefits,
      budget: budget.filter(b => b.item.trim() !== ''),
      timeline: timeline.filter(t => t.activity.trim() !== ''),
      conclusion,
      contactInfo
    });
  };

  const renderStep = () => {
    switch(step) {
      case 1:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <div className="flex flex-col gap-2">
              <label className="text-gold uppercase tracking-widest text-[10px] font-bold">1. Title & Executive Summary</label>
              <input 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Project Title"
                className="w-full bg-white/5 border border-gold/20 rounded-2xl p-4 focus:border-gold focus:outline-none text-white italic font-serif text-lg"
              />
              <textarea 
                value={executiveSummary}
                onChange={(e) => setExecutiveSummary(e.target.value)}
                placeholder="Executive Summary: Overview of the proposal, efficiency improvements, automation, etc."
                rows={6}
                className="w-full bg-white/5 border border-gold/20 rounded-2xl p-4 focus:border-gold focus:outline-none text-white leading-relaxed mt-2"
              />
            </div>
          </motion.div>
        );
      case 2:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <div className="flex flex-col gap-2">
              <label className="text-gold uppercase tracking-widest text-[10px] font-bold">2. Project Overview & Problem</label>
              <textarea 
                value={projectOverview}
                onChange={(e) => setProjectOverview(e.target.value)}
                placeholder="Project Overview: Purpose, custom needs addressed..."
                rows={4}
                className="w-full bg-white/5 border border-gold/20 rounded-2xl p-4 focus:border-gold focus:outline-none text-white mb-4"
              />
              <textarea 
                value={problem}
                onChange={(e) => setProblem(e.target.value)}
                placeholder="Problem Statement: What specific problems does this solve?"
                rows={4}
                className="w-full bg-white/5 border border-gold/20 rounded-2xl p-4 focus:border-gold focus:outline-none text-white"
              />
            </div>
          </motion.div>
        );
      case 3:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <div className="flex flex-col gap-2">
              <label className="text-gold uppercase tracking-widest text-[10px] font-bold">3. Objectives</label>
              <div className="space-y-4">
                <input 
                  value={mainObjective}
                  onChange={(e) => setMainObjective(e.target.value)}
                  placeholder="Main Objective"
                  className="w-full bg-white/5 border border-gold/20 rounded-xl p-3 focus:border-gold focus:outline-none text-white"
                />
                <div className="space-y-2">
                  <label className="text-[10px] text-gray-500 uppercase font-bold px-1">Specific Objectives</label>
                  {specificObjectives.map((obj, i) => (
                    <div key={i} className="flex gap-2">
                      <input 
                        value={obj}
                        onChange={(e) => updateInArray(i, e.target.value, setSpecificObjectives)}
                        placeholder={`Objective ${i + 1}`}
                        className="flex-1 bg-white/5 border border-gold/10 rounded-xl p-3 focus:border-gold focus:outline-none text-white text-sm"
                      />
                      <button onClick={() => handleRemoveInArray(i, setSpecificObjectives)} className="p-3 text-red-500/50 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  ))}
                  <button onClick={() => handleAddInArray(setSpecificObjectives)} className="flex items-center gap-2 text-gold/60 hover:text-gold text-[10px] uppercase font-bold py-2"><Plus className="w-4 h-4" /> Add Objective</button>
                </div>
              </div>
            </div>
          </motion.div>
        );
      case 4:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <label className="text-gold uppercase tracking-widest text-[10px] font-bold">4. Scope of Work (Phases)</label>
            <div className="space-y-4">
              {scopeOfWork.map((phase, i) => (
                <div key={i} className="p-4 bg-white/5 rounded-2xl border border-gold/10 space-y-3">
                  <div className="flex gap-2">
                    <input 
                      value={phase.phase}
                      onChange={(e) => {
                        const next = [...scopeOfWork];
                        next[i].phase = e.target.value;
                        setScopeOfWork(next);
                      }}
                      placeholder="Phase Name (e.g. Design)"
                      className="flex-1 bg-transparent border-b border-gold/20 p-1 focus:border-gold outline-none text-white font-bold"
                    />
                    <input 
                      value={phase.duration}
                      onChange={(e) => {
                        const next = [...scopeOfWork];
                        next[i].duration = e.target.value;
                        setScopeOfWork(next);
                      }}
                      placeholder="Duration"
                      className="w-24 bg-transparent border-b border-gold/20 p-1 focus:border-gold outline-none text-gold text-xs"
                    />
                    <button onClick={() => setScopeOfWork(s => s.filter((_, idx) => idx !== i))} className="text-red-500/50"><Trash2 className="w-4 h-4" /></button>
                  </div>
                  {phase.details.map((detail, di) => (
                    <div key={di} className="flex gap-2">
                      <input 
                        value={detail}
                        onChange={(e) => {
                          const next = [...scopeOfWork];
                          next[i].details[di] = e.target.value;
                          setScopeOfWork(next);
                        }}
                        placeholder="Detail point"
                        className="flex-1 bg-white/5 border border-white/5 rounded-lg p-2 text-xs text-gray-300"
                      />
                      <button onClick={() => {
                        const next = [...scopeOfWork];
                        next[i].details = next[i].details.filter((_, idx) => idx !== di);
                        setScopeOfWork(next);
                      }} className="text-red-500/30"><Trash2 className="w-3 h-3" /></button>
                    </div>
                  ))}
                  <button onClick={() => {
                    const next = [...scopeOfWork];
                    next[i].details.push('');
                    setScopeOfWork(next);
                  }} className="text-gold/40 text-[10px] uppercase font-bold">+ Add Detail</button>
                </div>
              ))}
              <button 
                onClick={() => setScopeOfWork(s => [...s, { phase: '', duration: '', details: [''] }])}
                className="w-full py-3 border border-dashed border-gold/20 rounded-2xl text-gold/40 text-xs hover:border-gold/50 hover:text-gold transition-all"
              >
                + Add Project Phase
              </button>
            </div>
          </motion.div>
        );
      case 5:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <div>
              <label className="text-gold uppercase tracking-widest text-[10px] font-bold mb-4 block">5. Technologies Proposed</label>
              <div className="space-y-2">
                {technologies.map((t, i) => (
                  <div key={i} className="flex gap-2">
                    <input 
                      value={t.area}
                      onChange={(e) => {
                        const next = [...technologies];
                        next[i].area = e.target.value;
                        setTechnologies(next);
                      }}
                      placeholder="Area (e.g. Frontend)"
                      className="w-1/3 bg-white/5 border border-gold/10 rounded-xl p-3 text-white text-sm"
                    />
                    <input 
                      value={t.tech}
                      onChange={(e) => {
                        const next = [...technologies];
                        next[i].tech = e.target.value;
                        setTechnologies(next);
                      }}
                      placeholder="Tech (e.g. React)"
                      className="flex-1 bg-white/5 border border-gold/10 rounded-xl p-3 text-white text-sm"
                    />
                    <button onClick={() => setTechnologies(ts => ts.filter((_, idx) => idx !== i))} className="p-3 text-red-500/50"><Trash2 className="w-4 h-4" /></button>
                  </div>
                ))}
                <button onClick={() => setTechnologies(ts => [...ts, { area: '', tech: '' }])} className="text-gold/60 text-[10px] uppercase font-bold py-2">+ Add Technology</button>
              </div>
            </div>
            <div className="mt-6">
              <label className="text-gold uppercase tracking-widest text-[10px] font-bold mb-2 block">Project Detailed Description</label>
              <textarea 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Technical details, architecture..."
                rows={6}
                className="w-full bg-white/5 border border-gold/20 rounded-2xl p-4 text-white text-sm leading-relaxed"
              />
            </div>
          </motion.div>
        );
      case 6:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <div className="space-y-4">
              <label className="text-gold uppercase tracking-widest text-[10px] font-bold">6. Methodology & Materials</label>
              <div className="space-y-2">
                <label className="text-[10px] text-gray-500 uppercase font-bold px-1">Methodology Steps</label>
                {methodology.map((m, i) => (
                  <div key={i} className="flex gap-2">
                    <input 
                      value={m}
                      onChange={(e) => updateInArray(i, e.target.value, setMethodology)}
                      placeholder={`Step ${i + 1}`}
                      className="flex-1 bg-white/5 border border-gold/10 rounded-xl p-3 text-white text-sm"
                    />
                    <button onClick={() => handleRemoveInArray(i, setMethodology)} className="p-3 text-red-500/50"><Trash2 className="w-4 h-4" /></button>
                  </div>
                ))}
                <button onClick={() => handleAddInArray(setMethodology)} className="text-gold/60 text-[10px] uppercase font-bold py-2">+ Add Step</button>
              </div>
              <div className="pt-4 space-y-2">
                <label className="text-[10px] text-gray-500 uppercase font-bold px-1">Materials / Hardware (if any)</label>
                {materials.map((mat, i) => (
                  <div key={i} className="flex gap-2">
                    <input 
                      value={mat}
                      onChange={(e) => updateInArray(i, e.target.value, setMaterials)}
                      placeholder="Material"
                      className="flex-1 bg-white/5 border border-gold/10 rounded-xl p-3 text-white text-sm"
                    />
                    <button onClick={() => handleRemoveInArray(i, setMaterials)} className="p-3 text-red-500/50"><Trash2 className="w-4 h-4" /></button>
                  </div>
                ))}
                <button onClick={() => handleAddInArray(setMaterials)} className="text-gold/60 text-[10px] uppercase font-bold py-2">+ Add Material</button>
              </div>
            </div>
          </motion.div>
        );
      case 7:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <div className="space-y-4">
              <label className="text-gold uppercase tracking-widest text-[10px] font-bold">7. Deliverables & Benefits</label>
              <div className="space-y-2">
                <label className="text-[10px] text-gray-500 uppercase font-bold px-1">Project Deliverables</label>
                {deliverables.map((d, i) => (
                  <div key={i} className="flex gap-2">
                    <input value={d} onChange={(e) => updateInArray(i, e.target.value, setDeliverables)} className="flex-1 bg-white/5 border border-gold/10 rounded-xl p-3 text-white text-sm" />
                    <button onClick={() => handleRemoveInArray(i, setDeliverables)} className="p-3 text-red-500/50"><Trash2 className="w-4 h-4" /></button>
                  </div>
                ))}
                <button onClick={() => handleAddInArray(setDeliverables)} className="text-gold/60 text-[10px] uppercase font-bold py-2">+ Add Deliverable</button>
              </div>
              <div className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-gray-500 uppercase font-bold mb-1 block">Social Impact</label>
                  <textarea value={benefits.social} onChange={(e) => setBenefits(b => ({ ...b, social: e.target.value }))} className="w-full bg-white/5 border border-gold/10 rounded-xl p-3 text-white text-xs" rows={2} />
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 uppercase font-bold mb-1 block">Economic Impact</label>
                  <textarea value={benefits.economic} onChange={(e) => setBenefits(b => ({ ...b, economic: e.target.value }))} className="w-full bg-white/5 border border-gold/10 rounded-xl p-3 text-white text-xs" rows={2} />
                </div>
              </div>
            </div>
          </motion.div>
        );
      case 8:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <label className="text-gold uppercase tracking-widest text-[10px] font-bold">8. Budget Estimate</label>
            <div className="space-y-3">
              {budget.map((item, i) => (
                <div key={i} className="flex gap-2">
                  <input 
                    value={item.item}
                    onChange={(e) => {
                      const next = [...budget];
                      next[i].item = e.target.value;
                      setBudget(next);
                    }}
                    placeholder="Item / Milestone"
                    className="flex-1 bg-white/5 border border-gold/10 rounded-xl p-3 text-white text-sm"
                  />
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gold/50 text-xs">$</span>
                    <input 
                      type="number"
                      value={item.cost}
                      onChange={(e) => {
                        const next = [...budget];
                        next[i].cost = parseFloat(e.target.value) || 0;
                        setBudget(next);
                      }}
                      className="w-24 bg-white/5 border border-gold/10 rounded-xl p-3 pl-6 text-white text-sm"
                    />
                  </div>
                  <button onClick={() => setBudget(b => b.filter((_, idx) => idx !== i))} className="p-3 text-red-500/50"><Trash2 className="w-4 h-4" /></button>
                </div>
              ))}
              <button onClick={() => setBudget(b => [...b, { item: '', cost: 0 }])} className="text-gold/60 text-[10px] uppercase font-bold py-2">+ Add Item</button>
            </div>
            <div className="p-4 bg-gold/10 rounded-2xl border border-gold/20 flex justify-between items-center mt-4">
              <span className="text-[10px] text-gold uppercase font-bold">Total Project Cost</span>
              <span className="text-xl font-bold text-gold italic font-serif">${budget.reduce((acc, curr) => acc + curr.cost, 0).toLocaleString()}</span>
            </div>
          </motion.div>
        );
      case 9:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <label className="text-gold uppercase tracking-widest text-[10px] font-bold">9. Work Plan / Timeline</label>
            <div className="space-y-3">
              {timeline.map((item, i) => (
                <div key={i} className="flex gap-2">
                  <input value={item.activity} onChange={(e) => {
                    const next = [...timeline];
                    next[i].activity = e.target.value;
                    setTimeline(next);
                  }} placeholder="Activity" className="flex-1 bg-white/5 border border-gold/10 rounded-xl p-3 text-white text-sm" />
                  <input value={item.duration} onChange={(e) => {
                    const next = [...timeline];
                    next[i].duration = e.target.value;
                    setTimeline(next);
                  }} placeholder="Duration" className="w-32 bg-white/5 border border-gold/10 rounded-xl p-3 text-white text-sm" />
                  <button onClick={() => setTimeline(t => t.filter((_, idx) => idx !== i))} className="p-3 text-red-500/50"><Trash2 className="w-4 h-4" /></button>
                </div>
              ))}
              <button onClick={() => setTimeline(t => [...t, { activity: '', duration: '' }])} className="text-gold/60 text-[10px] uppercase font-bold py-2">+ Add Task</button>
            </div>
          </motion.div>
        );
      case 10:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <div className="flex flex-col gap-2">
              <label className="text-gold uppercase tracking-widest text-[10px] font-bold">10. Conclusion</label>
              <textarea 
                value={conclusion}
                onChange={(e) => setConclusion(e.target.value)}
                placeholder="Final summary, commitment, and vision..."
                rows={10}
                className="w-full bg-white/5 border border-gold/20 rounded-2xl p-4 text-white text-sm leading-relaxed"
              />
            </div>
          </motion.div>
        );
      case 11:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <label className="text-gold uppercase tracking-widest text-[10px] font-bold">11. Contact Information</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] text-gray-500 uppercase font-bold">Full Name</label>
                <input value={contactInfo.name} onChange={(e) => setContactInfo(c => ({...c, name: e.target.value}))} className="w-full bg-white/5 border border-gold/10 rounded-xl p-3 text-white text-sm" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] text-gray-500 uppercase font-bold">School / Organization</label>
                <input value={contactInfo.school} onChange={(e) => setContactInfo(c => ({...c, school: e.target.value}))} className="w-full bg-white/5 border border-gold/10 rounded-xl p-3 text-white text-sm" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] text-gray-500 uppercase font-bold">Email Address</label>
                <input value={contactInfo.email} onChange={(e) => setContactInfo(c => ({...c, email: e.target.value}))} className="w-full bg-white/5 border border-gold/10 rounded-xl p-3 text-white text-sm" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] text-gray-500 uppercase font-bold">Phone Number</label>
                <input value={contactInfo.phone} onChange={(e) => setContactInfo(c => ({...c, phone: e.target.value}))} className="w-full bg-white/5 border border-gold/10 rounded-xl p-3 text-white text-sm" />
              </div>
            </div>
            <div className="p-8 bg-gold/5 border border-gold/20 rounded-3xl text-center mt-8">
              <CheckCircle2 className="w-12 h-12 text-gold mx-auto mb-4" />
              <h4 className="text-xl font-bold text-gold mb-2 italic">Proposal Complete</h4>
              <p className="text-gray-400 text-xs text-balance">Review all sections before submitting. Your professional proposal is ready to be reviewed.</p>
            </div>
          </motion.div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-2xl z-[2000] flex flex-col pt-safe px-6 pb-12 overflow-y-auto">
      <div className="flex items-center justify-between py-6 sticky top-0 bg-black/80 backdrop-blur-md z-20">
        <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full">
          <X className="w-6 h-6 text-gold" />
        </button>
        <div className="text-center">
          <h2 className="text-lg font-bold text-gold italic font-serif">Project Proposal</h2>
          <p className="text-[8px] text-gray-500 uppercase tracking-widest">Step {step} of {totalSteps}</p>
        </div>
        <div className="w-10" />
      </div>

      <div className="flex-1 max-w-2xl mx-auto w-full pt-8">
        <div className="w-full h-1 bg-white/10 rounded-full mb-12 overflow-hidden">
          <motion.div initial={{ width: 0 }} animate={{ width: `${(step/totalSteps) * 100}%` }} className="h-full gold-gradient" />
        </div>

        {renderStep()}

        <div className="flex gap-4 mt-12 pb-20">
          {step > 1 && (
            <button onClick={prevStep} className="flex-1 py-4 bg-white/5 border border-white/10 text-white font-bold rounded-2xl hover:bg-white/10 transition-all flex items-center justify-center gap-2">
              <ArrowLeft className="w-5 h-5" /> Back
            </button>
          )}
          {step < totalSteps ? (
            <button onClick={nextStep} className="flex-[2] py-4 bg-gold text-black font-bold rounded-2xl hover:bg-gold-light transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(212,175,55,0.3)]">
              Continue <ChevronRight className="w-5 h-5" />
            </button>
          ) : (
            <button onClick={handleSubmit} className="flex-[2] py-4 bg-gold text-black font-bold rounded-2xl hover:bg-gold-light transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(212,175,55,0.3)]">
              <Send className="w-5 h-5" /> Submit Proposal
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function X({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
  );
}
