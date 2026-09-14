import React from 'react';
import { ArrowLeft, Clock, Lock, CheckCircle2 } from 'lucide-react';
import { useAcademy } from '../../context/AppContext';
import { AcademyModule, Lesson, Challenge } from '../../types';
import { Icon } from '../Icon';

interface ModuleDetailProps {
  module: AcademyModule;
  lessons: Lesson[];
  checkpoint: Challenge | undefined;
  onBack: () => void;
  onOpenLesson: (lesson: Lesson) => void;
  onOpenCheckpoint: (challenge: Challenge) => void;
}

export const ModuleDetail: React.FC<ModuleDetailProps> = ({ module, lessons, checkpoint, onBack, onOpenLesson, onOpenCheckpoint }) => {
  const { completedLessonIds, completedChallengeIds } = useAcademy();

  const doneCount = lessons.filter((l) => completedLessonIds.includes(l.id)).length;
  const allLessonsDone = lessons.length > 0 && doneCount === lessons.length;
  const checkpointDone = checkpoint ? completedChallengeIds.includes(checkpoint.id) : false;

  return (
    <div className="space-y-5">
      <button onClick={onBack} className="flex items-center gap-1.5 text-xs font-bold text-[#8C7A6D] hover:text-[#3B2F27] cursor-pointer">
        <ArrowLeft className="w-3.5 h-3.5" /> All modules
      </button>

      <div className="bg-white rounded-3xl border border-[#EDE4D8] shadow-xs p-6 space-y-2">
        <div className="flex items-center gap-3">
          <span className="w-12 h-12 rounded-2xl bg-[#F2FBF7] flex items-center justify-center shrink-0">
            <Icon name={module.icon} className="w-7 h-7" />
          </span>
          <div>
            <p className="text-[10px] font-black uppercase tracking-wider text-[#8C7A6D]">Module {module.number} • {module.stage}</p>
            <h2 className="text-lg font-black text-[#3B2F27] font-['Nunito',sans-serif]">{module.title}</h2>
          </div>
        </div>
        <p className="text-xs text-[#7A6B5F] leading-relaxed">{module.intro}</p>
        <p className="text-[11px] font-bold text-[#207559]">{doneCount} / {lessons.length} lessons completed</p>
      </div>

      <div className="space-y-2.5">
        {lessons.map((lesson) => {
          const isDone = completedLessonIds.includes(lesson.id);
          return (
            <button
              key={lesson.id}
              onClick={() => onOpenLesson(lesson)}
              className="btn-bouncy w-full text-left flex items-center gap-3 bg-white rounded-2xl border border-[#EDE4D8] p-4 cursor-pointer hover:border-[#B8E6D5]"
            >
              <span className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black shrink-0 ${isDone ? 'bg-[#B8E6D5] text-[#194E3B]' : 'bg-[#FAF7F2] border border-[#E0D5C5] text-[#A39284]'}`}>
                {isDone ? <CheckCircle2 className="w-4 h-4" /> : lesson.number.split('.')[1]}
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-xs text-[#3B2F27] truncate">{lesson.title}</p>
                <p className="flex items-center gap-1 text-[10px] text-[#A39284]"><Clock className="w-3 h-3" /> {lesson.estimatedMinutes} min</p>
              </div>
            </button>
          );
        })}
      </div>

      {checkpoint && (
        <button
          onClick={() => allLessonsDone && onOpenCheckpoint(checkpoint)}
          disabled={!allLessonsDone}
          className={`btn-bouncy w-full flex items-center justify-between gap-2 p-5 rounded-2xl border cursor-pointer disabled:cursor-not-allowed ${
            checkpointDone
              ? 'bg-[#EBFBF0] border-[#10B981]/40'
              : allLessonsDone
              ? 'bg-[#FFD3BA]/40 border-[#F8BA9E]'
              : 'bg-[#FAF7F2] border-[#EDE4D8] opacity-60'
          }`}
        >
          <div className="text-left">
            <p className="text-xs font-black text-[#7A341A] flex items-center gap-1.5">
              {allLessonsDone ? <Icon name="leaderboard-business-builder" className="w-4 h-4" /> : <Lock className="w-3.5 h-3.5" />}
              Module Checkpoint: {checkpoint.title}
            </p>
            <p className="text-[10px] text-[#8C5A3E]">
              {checkpointDone ? 'Completed — you can retry anytime' : allLessonsDone ? checkpoint.tagline : 'Finish every lesson above to unlock'}
            </p>
          </div>
          <span className="text-lg">→</span>
        </button>
      )}
    </div>
  );
};
