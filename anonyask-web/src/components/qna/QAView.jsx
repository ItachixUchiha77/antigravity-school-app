import React, { useState } from 'react';
import { useQAStore, useAuthStore, useUIStore } from '../../store/index.js';
import { SUBJECTS, USERS } from '../../data/mockData.js';
import { Avatar, Badge, Timestamp, EmptyState } from '../ui/index.jsx';
import {
  ThumbsUp, CheckCircle, MessageSquare, Send, ChevronDown, ChevronUp,
  BookOpen,
} from 'lucide-react';

// ─── Question Card ────────────────────────────────────────────────────────────
function QuestionCard({ question, currentUser, onUpvote, onAnswer, onMarkAnswered }) {
  const [expanded,   setExpanded]   = useState(question.answered);
  const [answerMode, setAnswerMode] = useState(false);
  const [answerText, setAnswerText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const hasUpvoted = question.upvotedBy.includes(currentUser?.id);
  const isTeacher  = currentUser?.role === 'teacher' || currentUser?.role === 'admin';
  const answerer   = question.answeredBy ? USERS[question.answeredBy] : null;

  const handleAnswer = async () => {
    if (!answerText.trim()) return;
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 400));
    onAnswer(question.id, answerText, currentUser.id);
    setAnswerText('');
    setAnswerMode(false);
    setExpanded(true);
    setSubmitting(false);
  };

  return (
    <div className={`glass-card rounded-2xl p-5 transition-all duration-200 hover:shadow-card-hover animate-slide-up ${
      question.answered ? 'border-l-4 border-l-success/50' : 'border-l-4 border-l-accent-purple/50'
    }`}>
      <div className="flex items-start gap-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent-purple to-accent-purple-light flex items-center justify-center flex-shrink-0">
          <span className="text-lg">🎭</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="badge-anonymous">🎭 Anonymous</span>
            {question.answered && <span className="badge-answered">✅ Answered</span>}
          </div>
          <Timestamp date={question.createdAt} />
        </div>
        <button
          id={`upvote-${question.id}`}
          onClick={() => onUpvote(question.id, currentUser?.id)}
          className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl border transition-all duration-200 ${
            hasUpvoted
              ? 'bg-accent-blue/20 border-accent-blue/40 text-accent-blue-light'
              : 'bg-bg-elevated border-border-default text-text-muted hover:text-accent-blue-light hover:border-accent-blue/30'
          }`}
        >
          <ThumbsUp size={14} />
          <span className="text-xs font-bold">{question.upvotes}</span>
        </button>
      </div>

      <p className="text-text-primary text-sm leading-relaxed mb-4 pl-13">{question.text}</p>

      {question.answered && question.answer && (
        <div className="mt-3">
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-2 text-success text-xs font-semibold mb-2 hover:text-success/80 transition-colors"
          >
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            {expanded ? 'Hide answer' : 'Show answer'}
          </button>
          {expanded && (
            <div className="bg-success/5 border border-success/20 rounded-xl p-4 animate-fade-in">
              <div className="flex items-center gap-2 mb-3">
                <Avatar initials={answerer?.initials || 'T'} size="sm" role="teacher" />
                <div>
                  <div className="text-sm font-semibold text-text-primary">{answerer?.name}</div>
                  <Timestamp date={question.answeredAt} />
                </div>
              </div>
              <div className="text-text-secondary text-sm leading-relaxed whitespace-pre-line">{question.answer}</div>
            </div>
          )}
        </div>
      )}

      {isTeacher && (
        <div className="mt-4 pt-3 border-t border-border-subtle flex items-center gap-2 flex-wrap">
          {!question.answered && (
            <button
              id={`mark-answered-${question.id}`}
              onClick={() => onMarkAnswered(question.id)}
              className="btn-ghost text-success text-xs border border-success/30 hover:bg-success/10"
            >
              <CheckCircle size={14} /> Mark Answered
            </button>
          )}
          <button
            id={`answer-btn-${question.id}`}
            onClick={() => setAnswerMode(!answerMode)}
            className="btn-ghost text-accent-blue-light text-xs border border-accent-blue/30 hover:bg-accent-blue/10"
          >
            <MessageSquare size={14} />
            {question.answered ? 'Edit Answer' : 'Answer'}
          </button>
        </div>
      )}

      {answerMode && (
        <div className="mt-4 animate-slide-up">
          <textarea
            id={`answer-input-${question.id}`}
            value={answerText}
            onChange={(e) => setAnswerText(e.target.value)}
            placeholder="Type your answer… You can use **bold** for emphasis."
            className="input-field resize-none text-sm min-h-[120px]"
            autoFocus
          />
          <div className="flex gap-2 mt-2 justify-end">
            <button onClick={() => setAnswerMode(false)} className="btn-secondary text-sm">Cancel</button>
            <button
              id={`submit-answer-${question.id}`}
              onClick={handleAnswer}
              disabled={submitting || !answerText.trim()}
              className="btn-primary text-sm"
            >
              {submitting
                ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <><Send size={14} /> Post Answer</>}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Ask Box (students) ───────────────────────────────────────────────────────
function AskBox({ onSubmit }) {
  const [text,    setText]    = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading || !text.trim()) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 300));
    onSubmit(text.trim());
    setText('');
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border-t border-border-subtle bg-bg-secondary flex-shrink-0">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent-purple to-accent-purple-light flex items-center justify-center flex-shrink-0 mt-1">
          <span className="text-lg">🎭</span>
        </div>
        <div className="flex-1">
          <textarea
            id="ask-question-input"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) handleSubmit(e); }}
            placeholder="Ask your question anonymously… (Enter to send, Shift+Enter for new line)"
            className="input-field resize-none text-sm min-h-[60px] max-h-[120px]"
            rows={2}
          />
          <div className="flex items-center justify-between mt-2">
            <span className="flex items-center gap-1.5 text-xs text-text-muted">
              <span className="badge-anonymous text-[10px]">🎭 Anonymous</span>
              Your identity is always hidden
            </span>
            <button
              id="submit-question-btn"
              type="submit"
              disabled={loading || !text.trim()}
              className="btn-primary text-sm py-2 px-4"
            >
              {loading
                ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <><Send size={14} /> Ask</>}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}

// ─── Main Q&A View ────────────────────────────────────────────────────────────
export default function QAView() {
  const currentUser = useAuthStore((s) => s.currentUser);
  const { selectedClassId, selectedSubjectId } = useUIStore();
  const { questions, addQuestion, upvoteQuestion, answerQuestion, markAnswered } = useQAStore();

  const subject   = SUBJECTS.find((s) => s.id === selectedSubjectId);
  const isTeacher = currentUser?.role === 'teacher' || currentUser?.role === 'admin';
  const isStudent = currentUser?.role === 'student';

  const filteredQs = questions
    .filter((q) => q.classId === selectedClassId && q.subjectId === selectedSubjectId)
    .sort((a, b) => b.upvotes - a.upvotes || new Date(b.createdAt) - new Date(a.createdAt));

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border-subtle bg-bg-secondary flex-shrink-0">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
            style={{ backgroundColor: `${subject?.color}20`, border: `1px solid ${subject?.color}30` }}
          >
            {subject?.emoji}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-bold text-text-primary text-lg">{subject?.name}</h2>
            <p className="text-text-muted text-xs">
              {filteredQs.length} question{filteredQs.length !== 1 ? 's' : ''} ·
              <span className="ml-1 text-success">{filteredQs.filter((q) => q.answered).length} answered</span>
            </p>
          </div>

          <div className="ml-1">
            <Badge variant="purple">🎭 Anonymous</Badge>
          </div>
        </div>

      </div>

      {/* Feed */}
      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
        {filteredQs.length === 0 ? (
          <EmptyState
            icon="🎭"
            title="Nothing here yet"
            description={isStudent ? 'Be the first to ask! Your question will be completely anonymous.' : 'No questions in this channel yet.'}
          />
        ) : (
          filteredQs.map((question) => (
            <QuestionCard
              key={question.id}
              question={question}
              currentUser={currentUser}
              onUpvote={upvoteQuestion}
              onAnswer={answerQuestion}
              onMarkAnswered={markAnswered}
            />
          ))
        )}
      </div>

      {/* Ask box — students only */}
      {isStudent && (
        <AskBox onSubmit={(text) => addQuestion(selectedClassId, selectedSubjectId, text, currentUser.id)} />
      )}

      {/* Teacher info bar */}
      {!isStudent && (
        <div className="px-6 py-3 border-t border-border-subtle bg-bg-secondary flex-shrink-0 flex items-center gap-2 text-xs text-text-muted">
          <BookOpen size={14} />
          Viewing as {currentUser?.role}. Answer questions above.
        </div>
      )}
    </div>
  );
}
