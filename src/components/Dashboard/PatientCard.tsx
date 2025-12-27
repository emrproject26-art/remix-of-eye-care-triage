import React from 'react';
import { User, Phone, Calendar, AlertCircle, Activity } from 'lucide-react';
import { Patient } from '@/types';
import { cn } from '@/lib/utils';

interface PatientCardProps {
  patient: Patient;
  isSelected: boolean;
  onClick: () => void;
}

export function PatientCard({ patient, isSelected, onClick }: PatientCardProps) {
  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getAIScoreColor = (score?: number) => {
    if (!score) return 'text-muted-foreground';
    if (score >= 80) return 'text-urgent';
    if (score >= 50) return 'text-warning';
    return 'text-success';
  };

  const getStatusBadge = () => {
    switch (patient.status) {
      case 'urgent':
        return <span className="status-badge status-urgent">Urgent</span>;
      case 'reviewed':
        return <span className="status-badge status-reviewed">Reviewed</span>;
      default:
        return <span className="status-badge status-pending">Pending</span>;
    }
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        'patient-card',
        isSelected && 'selected',
        patient.status === 'urgent' && 'border-urgent/40 bg-urgent/5'
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold",
            patient.gender === 'Female' ? 'bg-pink-100 text-pink-700' : 'bg-blue-100 text-blue-700'
          )}>
            {patient.name.split(' ').map(n => n[0]).join('')}
          </div>
          <div>
            <h3 className="font-medium text-foreground">{patient.name}</h3>
            <p className="text-xs text-muted-foreground mono-text">{patient.uid}</p>
          </div>
        </div>
        {getStatusBadge()}
      </div>

      <div className="grid grid-cols-2 gap-2 text-sm mb-3">
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <User className="w-3.5 h-3.5" />
          <span>{patient.age}y, {patient.gender}</span>
        </div>
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Calendar className="w-3.5 h-3.5" />
          <span>{formatTime(patient.visitDate)}</span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-border">
        <div className="flex items-center gap-1.5">
          <Phone className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-xs text-muted-foreground mono-text">
            {patient.phone.slice(-10)}
          </span>
        </div>
        
        {patient.aiScore !== undefined && (
          <div className={cn(
            "flex items-center gap-1.5 text-xs font-medium",
            getAIScoreColor(patient.aiScore)
          )}>
            <Activity className="w-3.5 h-3.5" />
            <span>AI: {patient.aiScore}%</span>
          </div>
        )}
      </div>

      {patient.condition && patient.status !== 'reviewed' && (
        <div className="mt-3 p-2 rounded-md bg-muted/50 flex items-start gap-2">
          <AlertCircle className={cn("w-4 h-4 mt-0.5 shrink-0", getAIScoreColor(patient.aiScore))} />
          <p className="text-xs text-muted-foreground leading-relaxed">
            Suspected: {patient.condition}
          </p>
        </div>
      )}
    </div>
  );
}
