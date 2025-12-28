import React from 'react';
import { Users, Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import { usePatients } from '@/contexts/PatientContext';

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  subtext?: string;
  variant?: 'default' | 'warning' | 'success' | 'urgent';
}

function StatCard({ icon, label, value, subtext, variant = 'default' }: StatCardProps) {
  const variantStyles = {
    default: 'bg-card border-border',
    warning: 'bg-warning/5 border-warning/20',
    success: 'bg-success/5 border-success/20',
    urgent: 'bg-urgent/5 border-urgent/20 animate-pulse-urgent',
  };

  const iconStyles = {
    default: 'text-muted-foreground',
    warning: 'text-warning',
    success: 'text-success',
    urgent: 'text-urgent',
  };

  return (
    <div className={`stat-card ${variantStyles[variant]} animate-slide-up`}>
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2.5 rounded-lg bg-muted/50 ${iconStyles[variant]}`}>
          {icon}
        </div>
        {variant === 'urgent' && (
          <span className="status-badge status-urgent text-[10px]">
            Needs Attention
          </span>
        )}
      </div>
      <p className="text-3xl font-bold text-foreground mb-1">{value}</p>
      <p className="text-sm text-muted-foreground">{label}</p>
      {subtext && (
        <p className="text-xs text-muted-foreground/70 mt-1">{subtext}</p>
      )}
    </div>
  );
}

export function StatsPanel() {
  const { stats } = usePatients();

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        icon={<Clock className="w-5 h-5" />}
        label="Pending Review"
        value={stats.pending}
        subtext="Awaiting triage"
        variant="warning"
      />
      <StatCard
        icon={<AlertTriangle className="w-5 h-5" />}
        label="Urgent Cases"
        value={stats.urgent}
        subtext="Immediate attention"
        variant="urgent"
      />
      <StatCard
        icon={<CheckCircle className="w-5 h-5" />}
        label="Reviewed Today"
        value={stats.reviewed}
        subtext="Completed"
        variant="success"
      />
      <StatCard
        icon={<Users className="w-5 h-5" />}
        label="Total Patients"
        value={stats.total}
        subtext="Today's queue"
      />
    </div>
  );
}
