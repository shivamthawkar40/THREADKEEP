import React from 'react';
import { Link } from 'react-router-dom';
import {
  FolderGit2,
  Upload,
  Cpu,
  Radar,
  CheckSquare,
  FileCheck2,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';

const steps = [
  {
    id: 1,
    icon: FolderGit2,
    label: 'Create Project',
    desc: 'Set up your project workspace',
    path: '/app/projects/create',
    color: '#737653',
  },
  {
    id: 2,
    icon: Upload,
    label: 'Upload Documents',
    desc: 'PDF, DOCX, CSV, TXT files',
    path: '/app/documents',
    color: '#737653',
  },
  {
    id: 3,
    icon: Cpu,
    label: 'AI Reconstruction',
    desc: 'Extract knowledge & citations',
    path: '/app/reconstruction',
    color: '#737653',
  },
  {
    id: 4,
    icon: Radar,
    label: 'Detect Gaps & Conflicts',
    desc: 'Find blind spots & contradictions',
    path: '/app/gaps',
    color: '#C97645',
  },
  {
    id: 5,
    icon: CheckSquare,
    label: 'Human Review',
    desc: 'Approve or correct AI findings',
    path: '/app/reviews',
    color: '#737653',
  },
  {
    id: 6,
    icon: FileCheck2,
    label: 'Generate Handover',
    desc: 'Export executive PDF dossier',
    path: '/app/handover',
    color: '#737653',
  },
];

/**
 * WorkflowGuide component
 * @param {Object} props
 * @param {number} props.currentStep - 1-based index of the current step (0 = none active)
 * @param {boolean} props.compact - show compact horizontal version
 * @param {number[]} props.completedSteps - array of completed step IDs
 */
const WorkflowGuide = ({ currentStep = 0, compact = false, completedSteps = [] }) => {
  if (compact) {
    return (
      <div className="flex items-center gap-1 overflow-x-auto pb-1">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          const isActive = step.id === currentStep;
          const isDone = completedSteps.includes(step.id);
          return (
            <React.Fragment key={step.id}>
              <Link
                to={step.path}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold
                  transition-all whitespace-nowrap border
                  ${isActive
                    ? 'bg-teal text-ivory border-teal shadow-soft'
                    : isDone
                    ? 'bg-teal/10 text-teal-dark border-teal/20'
                    : 'bg-white text-charcoal-light border-sage/40 hover:bg-mint hover:text-charcoal'
                  }`}
              >
                {isDone ? (
                  <CheckCircle2 className="w-3 h-3 text-teal" />
                ) : (
                  <Icon className="w-3 h-3" />
                )}
                {step.label}
              </Link>
              {idx < steps.length - 1 && (
                <ArrowRight className="w-3 h-3 text-sage flex-shrink-0" />
              )}
            </React.Fragment>
          );
        })}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-sage/30 shadow-card p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-charcoal">Your Workflow</h3>
          <p className="text-xs text-charcoal-light mt-0.5">
            Follow these 6 steps to generate a complete handover dossier
          </p>
        </div>
        <span className="text-[11px] font-mono font-bold text-teal bg-teal/10 px-2 py-1 rounded-lg border border-teal/20">
          {completedSteps.length} / {steps.length} complete
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {steps.map((step) => {
          const Icon = step.icon;
          const isActive = step.id === currentStep;
          const isDone = completedSteps.includes(step.id);
          return (
            <Link
              key={step.id}
              to={step.path}
              className={`
                relative flex flex-col items-center text-center p-3 rounded-xl border
                transition-all duration-200 group
                ${isActive
                  ? 'bg-teal border-teal shadow-soft'
                  : isDone
                  ? 'bg-teal/8 border-teal/25 hover:bg-teal/12'
                  : 'bg-ivory border-sage/30 hover:border-teal/30 hover:bg-mint/50'
                }
              `}
            >
              {/* Step number */}
              <div className={`
                absolute -top-2 -right-2 w-5 h-5 rounded-full flex items-center justify-center
                text-[9px] font-black border
                ${isActive ? 'bg-ivory text-teal border-teal' : isDone ? 'bg-teal text-ivory border-teal' : 'bg-white text-charcoal-light border-sage/50'}
              `}>
                {isDone ? '✓' : step.id}
              </div>

              <div className={`
                w-9 h-9 rounded-xl flex items-center justify-center mb-2
                ${isActive ? 'bg-ivory/20' : isDone ? 'bg-teal/10' : 'bg-ivory-dark'}
              `}>
                <Icon className={`w-4 h-4 ${isActive ? 'text-ivory' : isDone ? 'text-teal-dark' : 'text-charcoal-light'}`} />
              </div>
              <div className={`text-[11px] font-bold leading-tight ${isActive ? 'text-ivory' : isDone ? 'text-teal-dark' : 'text-charcoal'}`}>
                {step.label}
              </div>
              <div className={`text-[10px] mt-0.5 leading-tight ${isActive ? 'text-ivory/80' : 'text-charcoal-light'}`}>
                {step.desc}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default WorkflowGuide;
