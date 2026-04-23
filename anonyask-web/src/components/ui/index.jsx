import React from 'react';

// ─── Avatar ───────────────────────────────────────────────────────────────────
// emoji + bgColor override the default role-gradient when both are provided.
export function Avatar({ initials, size = 'md', role, className = '', emoji = null, bgColor = null }) {
  const sizeClasses = {
    xs: 'w-6 h-6 text-[9px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-xl',
  };

  const emojiSize = { xs: 'text-xs', sm: 'text-sm', md: 'text-base', lg: 'text-xl', xl: 'text-3xl' };

  const roleColors = {
    student: 'from-accent-blue to-accent-blue-light',
    teacher: 'from-amber-600 to-amber-400',
    admin:   'from-red-700 to-red-500',
    anon:    'from-accent-purple to-accent-purple-light',
  };

  if (emoji) {
    return (
      <div
        className={`${sizeClasses[size]} rounded-full flex items-center justify-center flex-shrink-0 ${emojiSize[size]} ${className}`}
        style={{ backgroundColor: bgColor || '#3B82F6' }}
      >
        {emoji}
      </div>
    );
  }

  if (bgColor) {
    return (
      <div
        className={`${sizeClasses[size]} rounded-full flex items-center justify-center font-bold text-white flex-shrink-0 ${className}`}
        style={{ backgroundColor: bgColor }}
      >
        {initials}
      </div>
    );
  }

  const gradient = roleColors[role] || roleColors.student;
  return (
    <div
      className={`${sizeClasses[size]} rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center font-bold text-white flex-shrink-0 ${className}`}
    >
      {initials}
    </div>
  );
}

// ─── Badge ────────────────────────────────────────────────────────────────────
export function Badge({ children, variant = 'default', className = '' }) {
  const variants = {
    default:   'bg-bg-elevated text-text-muted border border-border-default',
    blue:      'bg-accent-blue/15 text-accent-blue-light border border-accent-blue/25',
    purple:    'bg-accent-purple/15 text-accent-purple-light border border-accent-purple/25',
    success:   'bg-success/15 text-success border border-success/25',
    warning:   'bg-warning/15 text-warning border border-warning/25',
    danger:    'bg-danger/15 text-danger border border-danger/25',
    anonymous: 'bg-accent-purple/15 text-accent-purple-light border border-accent-purple/25',
  };

  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}

// ─── RoleBadge ────────────────────────────────────────────────────────────────
export function RoleBadge({ role }) {
  const config = {
    student: { label: 'Student', variant: 'blue',    icon: '🎓' },
    teacher: { label: 'Teacher', variant: 'warning',  icon: '📚' },
    admin:   { label: 'Admin',   variant: 'danger',   icon: '🛡️' },
  };
  const { label, variant, icon } = config[role] || config.student;
  return <Badge variant={variant}>{icon} {label}</Badge>;
}

// ─── Spinner ──────────────────────────────────────────────────────────────────
export function Spinner({ size = 'md' }) {
  const sizes = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-10 h-10' };
  return (
    <div className={`${sizes[size]} border-2 border-border-default border-t-accent-blue rounded-full animate-spin`} />
  );
}

// ─── Divider ──────────────────────────────────────────────────────────────────
export function Divider({ label }) {
  return (
    <div className="flex items-center gap-3 my-4">
      <div className="flex-1 h-px bg-border-subtle" />
      {label && <span className="text-text-muted text-xs">{label}</span>}
      <div className="flex-1 h-px bg-border-subtle" />
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────
export function EmptyState({ icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-8 text-center animate-fade-in">
      <div className="text-6xl mb-4 opacity-60">{icon}</div>
      <h3 className="text-lg font-semibold text-text-secondary mb-2">{title}</h3>
      <p className="text-text-muted text-sm max-w-xs mb-6">{description}</p>
      {action}
    </div>
  );
}

// ─── Timestamp ────────────────────────────────────────────────────────────────
export function Timestamp({ date }) {
  const d = new Date(date);
  const now = new Date();
  const diffMs = now - d;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  let label;
  if (diffMins < 1) label = 'just now';
  else if (diffMins < 60) label = `${diffMins}m ago`;
  else if (diffHours < 24) label = `${diffHours}h ago`;
  else if (diffDays === 1) label = 'yesterday';
  else label = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

  return (
    <time className="text-text-muted text-xs" dateTime={date} title={d.toLocaleString('en-IN')}>
      {label}
    </time>
  );
}

// ─── Tag (priority for announcements) ────────────────────────────────────────
export function PriorityTag({ priority }) {
  const config = {
    urgent:    { label: '🔴 Urgent',    className: 'bg-danger/15 text-danger border-danger/25' },
    important: { label: '🟡 Important', className: 'bg-warning/15 text-warning border-warning/25' },
    general:   { label: '🟢 General',   className: 'bg-success/15 text-success border-success/25' },
  };
  const { label, className } = config[priority] || config.general;
  return (
    <span className={`inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full border ${className}`}>
      {label}
    </span>
  );
}
