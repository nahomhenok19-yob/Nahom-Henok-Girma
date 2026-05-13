import React from 'react';
import { motion } from 'motion/react';
import { 
  X, 
  Download, 
  Share2, 
  CheckCircle2, 
  Clock, 
  Coins, 
  Lightbulb,
  User,
  School,
  Mail,
  Phone,
  FileText,
  Target,
  Layers,
  Cpu,
  Zap,
  Calendar
} from 'lucide-react';
import { InnovationProposal } from '../types';

interface Props {
  proposal: InnovationProposal;
  onClose: () => void;
}

export default function ProposalDetail({ proposal, onClose }: Props) {
  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-2xl z-[2100] flex flex-col overflow-y-auto">
      <div className="sticky top-0 bg-black/80 backdrop-blur-md z-20 py-4 px-6 flex items-center justify-between border-b border-white/10">
        <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-gold">
          <X className="w-6 h-6" />
        </button>
        <div className="text-center">
          <h2 className="text-sm font-bold text-gold uppercase tracking-widest">Proposal Details</h2>
          <p className="text-[10px] text-gray-500 uppercase">{proposal.status}</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => window.print()}
            className="p-2 hover:bg-white/5 rounded-full text-gold flex items-center gap-2"
          >
            <Download className="w-5 h-5" />
            <span className="text-[10px] uppercase font-bold hidden md:inline">Export PDF</span>
          </button>
          <button className="p-2 hover:bg-white/5 rounded-full text-gold">
            <Share2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto w-full p-8 md:p-12 space-y-12 pb-32">
        {/* Header Section */}
        <header className="text-center space-y-4">
          <div className="w-20 h-20 rounded-3xl bg-gold/10 flex items-center justify-center mx-auto mb-6">
            <Lightbulb className="w-10 h-10 text-gold" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold italic font-serif text-white">{proposal.title}</h1>
          <p className="text-gold/60 uppercase tracking-[0.2em] text-[10px] font-bold">Software Development Proposal</p>
          <div className="pt-4 flex flex-wrap justify-center gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-2"><Calendar className="w-4 h-4" /> {proposal.createdAt?.toDate().toLocaleDateString()}</span>
            <span className="flex items-center gap-2"><User className="w-4 h-4" /> {proposal.userName}</span>
          </div>
        </header>

        {/* Executive Summary */}
        {proposal.executiveSummary && (
          <section className="space-y-4">
            <h3 className="text-xs font-bold text-gold uppercase tracking-widest flex items-center gap-2 border-b border-gold/20 pb-2">
              <FileText className="w-4 h-4" /> 1. Executive Summary
            </h3>
            <p className="text-gray-300 leading-relaxed italic">{proposal.executiveSummary}</p>
          </section>
        )}

        {/* Project Overview & Problem */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {proposal.projectOverview && (
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-gold uppercase tracking-widest flex items-center gap-2">
                <Target className="w-4 h-4" /> 2. Project Overview
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed">{proposal.projectOverview}</p>
            </div>
          )}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-gold uppercase tracking-widest flex items-center gap-2">
              <FileText className="w-4 h-4" /> 3. Problem Statement
            </h3>
            <p className="text-gray-400 text-sm leading-relaxed">{proposal.problem}</p>
          </div>
        </section>

        {/* Objectives */}
        <section className="space-y-6">
          <h3 className="text-xs font-bold text-gold uppercase tracking-widest border-b border-gold/20 pb-2">4. Objectives</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1 p-4 bg-gold/5 border border-gold/20 rounded-2xl">
              <p className="text-[10px] text-gold uppercase font-bold mb-2">Main Goal</p>
              <p className="text-white text-sm font-bold">{proposal.objectives.main}</p>
            </div>
            <div className="md:col-span-2 space-y-2">
              <p className="text-[10px] text-gray-500 uppercase font-bold">Specific Targets</p>
              <div className="grid grid-cols-1 gap-2">
                {proposal.objectives.specific.map((obj, i) => (
                  <div key={i} className="flex items-center gap-3 text-gray-300 text-xs">
                    <CheckCircle2 className="w-3 h-3 text-gold shrink-0" />
                    <span>{obj}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Scope of Work */}
        {proposal.scopeOfWork && (
          <section className="space-y-6">
            <h3 className="text-xs font-bold text-gold uppercase tracking-widest border-b border-gold/20 pb-2">
              <Layers className="w-4 h-4 inline mr-2" /> 5. Scope of Work
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {proposal.scopeOfWork.map((phase, i) => (
                <div key={i} className="p-4 bg-white/5 rounded-2xl border border-white/5 space-y-2">
                  <div className="flex justify-between items-center">
                    <h4 className="text-sm font-bold text-white">{phase.phase}</h4>
                    <span className="text-[9px] text-gold/60 uppercase font-bold italic">{phase.duration}</span>
                  </div>
                  <ul className="space-y-1">
                    {phase.details.map((detail, di) => (
                      <li key={di} className="text-[10px] text-gray-400 flex items-start gap-2">
                        <span className="w-1 h-1 rounded-full bg-gold/30 mt-1.5 shrink-0" />
                        {detail}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Technologies */}
        {proposal.technologies && (
          <section className="space-y-4">
            <h3 className="text-xs font-bold text-gold uppercase tracking-widest flex items-center gap-2">
              <Cpu className="w-4 h-4" /> 6. Technologies Proposed
            </h3>
            <div className="flex flex-wrap gap-3">
              {proposal.technologies.map((t, i) => (
                <div key={i} className="px-4 py-2 bg-gold/5 border border-gold/10 rounded-xl">
                  <span className="text-[8px] text-gold/50 uppercase font-bold block">{t.area}</span>
                  <span className="text-xs text-white font-medium">{t.tech}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Deliverables */}
        {proposal.deliverables && (
          <section className="space-y-4">
            <h3 className="text-xs font-bold text-gold uppercase tracking-widest">7. Deliverables</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {proposal.deliverables.map((d, i) => (
                <div key={i} className="p-3 bg-white/5 rounded-xl border border-white/5 text-xs text-gray-300 flex items-center gap-2">
                  <Zap className="w-3 h-3 text-gold" /> {d}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Budget & Timeline */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-gold uppercase tracking-widest flex items-center gap-2">
              <Coins className="w-4 h-4" /> 8. Budget Estimate
            </h3>
            <div className="space-y-2">
              {proposal.budget.map((b, i) => (
                <div key={i} className="flex justify-between items-center text-xs py-1 border-b border-white/5">
                  <span className="text-gray-400">{b.item}</span>
                  <span className="text-white font-mono">${b.cost.toLocaleString()}</span>
                </div>
              ))}
              <div className="flex justify-between items-center pt-2 font-bold text-gold italic">
                <span>Total</span>
                <span>${proposal.budget.reduce((acc, curr) => acc + curr.cost, 0).toLocaleString()}</span>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-gold uppercase tracking-widest flex items-center gap-2">
              <Clock className="w-4 h-4" /> 9. Project Timeline
            </h3>
            <div className="space-y-2">
              {proposal.timeline.map((t, i) => (
                <div key={i} className="flex justify-between items-center text-xs py-1 border-b border-white/5">
                  <span className="text-gray-400">{t.activity}</span>
                  <span className="text-gold/80 italic">{t.duration}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="space-y-4">
          <h3 className="text-xs font-bold text-gold uppercase tracking-widest">10. Benefits</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-white/5 rounded-2xl">
              <h4 className="text-[10px] text-gold/60 uppercase font-bold mb-2">Social / Economic</h4>
              <p className="text-xs text-gray-400">{proposal.benefits.social} {proposal.benefits.economic}</p>
            </div>
            {proposal.benefits.general && proposal.benefits.general.length > 0 && (
              <div className="p-4 bg-white/5 rounded-2xl">
                <h4 className="text-[10px] text-gold/60 uppercase font-bold mb-2">Key Advantages</h4>
                <ul className="space-y-1">
                  {proposal.benefits.general.map((g, i) => (
                    <li key={i} className="text-xs text-gray-400 flex items-center gap-2">
                      <CheckCircle2 className="w-3 h-3 text-gold/50" /> {g}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </section>

        {/* Conclusion */}
        <section className="space-y-4">
          <h3 className="text-xs font-bold text-gold uppercase tracking-widest">11. Conclusion</h3>
          <p className="text-gray-300 leading-relaxed text-sm italic border-l-2 border-gold/30 pl-4">{proposal.conclusion}</p>
        </section>

        {/* Contact Information / Signature */}
        {proposal.contactInfo && (
          <footer className="mt-20 p-8 bg-gold/5 border border-gold/20 rounded-[3rem] space-y-6">
            <h3 className="text-center text-xs font-bold text-gold uppercase tracking-widest">Prepared By</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center">
                    <User className="w-4 h-4 text-gold" />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase font-bold">Name</p>
                    <p className="text-sm text-white font-bold">{proposal.contactInfo.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center">
                    <School className="w-4 h-4 text-gold" />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase font-bold">School</p>
                    <p className="text-sm text-white font-bold">{proposal.contactInfo.school}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center">
                    <Mail className="w-4 h-4 text-gold" />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase font-bold">Email</p>
                    <p className="text-sm text-white font-bold">{proposal.contactInfo.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center">
                    <Phone className="w-4 h-4 text-gold" />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase font-bold">Phone</p>
                    <p className="text-sm text-white font-bold">{proposal.contactInfo.phone}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="pt-6 border-t border-gold/10 text-center">
              <p className="text-[9px] text-gray-500 uppercase tracking-widest italic">Professional Software Proposal generated within AI Ethiopia</p>
            </div>
          </footer>
        )}
      </div>
    </div>
  );
}
