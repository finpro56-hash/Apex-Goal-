import React, { useState } from 'react';
import { X, Sparkles, Calendar, Layers } from 'lucide-react';

interface NewGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (params: {
    title: string;
    description?: string;
    category?: string;
    targetDate?: string;
    initialMilestones?: { title: string; tasks: string[] }[];
  }) => Promise<void>;
}

const CATEGORIES = ['Career', 'Health', 'Learning', 'Finance', 'Creative', 'Personal'];

interface Template {
  name: string;
  category: string;
  title: string;
  milestones: { title: string; tasks: string[] }[];
}

const TEMPLATES: Template[] = [
  {
    name: 'Launch Product / App',
    category: 'Career',
    title: 'Launch MVP Application',
    milestones: [
      {
        title: 'Phase 1: Architecture & UI Spec',
        tasks: ['Define user flows & wireframes', 'Set up Git repo & tech stack', 'Configure database & auth'],
      },
      {
        title: 'Phase 2: Core Feature Build',
        tasks: ['Build primary interaction flow', 'Implement real-time sync & error states', 'Design mobile ergonomics'],
      },
      {
        title: 'Phase 3: Beta & Public Release',
        tasks: ['Test on physical mobile devices', 'Collect feedback from 5 testers', 'Launch on Product Hunt'],
      },
    ],
  },
  {
    name: '10K Running Milestone',
    category: 'Health',
    title: 'Run 10K Without Stopping',
    milestones: [
      {
        title: 'Phase 1: Base Building',
        tasks: ['Get proper running shoes & gear', 'Complete 3km jog 3 times a week', 'Establish hydration routine'],
      },
      {
        title: 'Phase 2: 7K Distance Threshold',
        tasks: ['Run continuous 5K in under 30 mins', 'Weekly 7K slow endurance jog', 'Integrate weekly strength workout'],
      },
      {
        title: 'Phase 3: Official 10K Summit',
        tasks: ['Complete 9K practice run', 'Taper mileage 4 days before event', 'Run official 10K pace trial'],
      },
    ],
  },
  {
    name: 'Master Conversational Language',
    category: 'Learning',
    title: 'Speak Conversational Japanese',
    milestones: [
      {
        title: 'Phase 1: Script & Phonetics',
        tasks: ['Master Hiragana alphabet (46 characters)', 'Master Katakana alphabet', 'Learn basic greeting phrases'],
      },
      {
        title: 'Phase 2: Core 500 Vocabulary',
        tasks: ['Learn top 250 high-frequency nouns', 'Learn top 150 daily verbs & conjugations', 'Listen to 15 beginner podcast episodes'],
      },
      {
        title: 'Phase 3: Real Human Dialogue',
        tasks: ['Book 3 conversation sessions on iTalki', 'Deliver a 5-minute self-introduction', 'Have a 15-minute non-English chat'],
      },
    ],
  },
];

export const NewGoalModal: React.FC<NewGoalModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [targetDate, setTargetDate] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleApplyTemplate = (tmpl: Template) => {
    setSelectedTemplate(tmpl);
    setTitle(tmpl.title);
    setCategory(tmpl.category);
  };

  const handleClearTemplate = () => {
    setSelectedTemplate(null);
    setTitle('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || isSubmitting) return;

    try {
      setIsSubmitting(true);
      await onSubmit({
        title: title.trim(),
        description: description.trim(),
        category,
        targetDate,
        initialMilestones: selectedTemplate ? selectedTemplate.milestones : undefined,
      });
      // Reset form
      setTitle('');
      setDescription('');
      setCategory(CATEGORIES[0]);
      setTargetDate('');
      setSelectedTemplate(null);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-200">
      <div
        className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-t-3xl sm:rounded-3xl p-5 max-h-[92vh] overflow-y-auto pb-safe shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="new-goal-title"
      >
        {/* Mobile Grab Handle */}
        <div className="w-10 h-1 bg-zinc-800 rounded-full mx-auto mb-3 sm:hidden" />

        <div className="flex items-center justify-between pb-3 border-b border-zinc-900">
          <div>
            <h2 id="new-goal-title" className="text-base font-bold text-white tracking-tight">
              Create Big Goal
            </h2>
            <p className="text-xs text-zinc-500">Decompose your ambition into manageable pieces.</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center text-zinc-500 hover:text-white rounded-full"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Starter Templates Selection */}
        <div className="mt-4">
          <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            Quick Breakdown Templates
          </label>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {TEMPLATES.map((tmpl) => (
              <button
                key={tmpl.name}
                type="button"
                onClick={() => handleApplyTemplate(tmpl)}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  selectedTemplate?.name === tmpl.name
                    ? 'bg-emerald-950/40 border-emerald-500/80 text-emerald-200 shadow-sm'
                    : 'bg-zinc-900/60 border-zinc-800/80 text-zinc-300 hover:border-zinc-700'
                }`}
              >
                <div className="text-xs font-semibold leading-tight">{tmpl.name}</div>
                <div className="text-[10px] text-zinc-500 mt-1">3 milestones</div>
              </button>
            ))}
          </div>
          {selectedTemplate && (
            <div className="mt-2 flex items-center justify-between text-xs text-emerald-400 bg-emerald-950/20 border border-emerald-900/50 rounded-lg px-3 py-1.5">
              <span>Includes 3 structured milestones and 9 sub-tasks</span>
              <button
                type="button"
                onClick={handleClearTemplate}
                className="text-[11px] underline text-zinc-400 hover:text-white"
              >
                Clear
              </button>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Goal Title */}
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
              Big Goal Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Write and Publish 10,000-Word Guide"
              maxLength={200}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
              Why this matters (Optional)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="The core motivation or milestone deadline..."
              maxLength={1000}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 transition-colors resize-none"
            />
          </div>

          {/* Category Selector */}
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
              Category
            </label>
            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES.map((cat) => (
                <button
                  type="button"
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    category === cat
                      ? 'bg-emerald-500 text-black font-semibold'
                      : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Target Date */}
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
              Target Target Date (Optional)
            </label>
            <input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="min-h-[44px] px-4 rounded-xl text-xs font-medium text-zinc-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!title.trim() || isSubmitting}
              className="min-h-[44px] px-5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-black text-xs font-bold transition-all shadow-[0_2px_12px_rgba(16,185,129,0.3)] flex items-center gap-1.5"
            >
              {isSubmitting ? 'Creating...' : 'Break Down Goal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
