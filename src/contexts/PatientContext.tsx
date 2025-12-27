import React, { createContext, useContext, useState, useCallback } from 'react';
import { Patient, ReviewDecision, DashboardStats } from '@/types';
import { mockPatients, mockStats } from '@/data/mockData';

interface PatientContextType {
  patients: Patient[];
  selectedPatient: Patient | null;
  stats: DashboardStats;
  selectPatient: (patient: Patient | null) => void;
  submitReview: (patientId: string, decision: ReviewDecision, findings: string) => void;
  getPendingPatients: () => Patient[];
  getReviewedPatients: () => Patient[];
  getUrgentPatients: () => Patient[];
}

const PatientContext = createContext<PatientContextType | undefined>(undefined);

export function PatientProvider({ children }: { children: React.ReactNode }) {
  const [patients, setPatients] = useState<Patient[]>(mockPatients);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  const selectPatient = useCallback((patient: Patient | null) => {
    setSelectedPatient(patient);
  }, []);

  const submitReview = useCallback((patientId: string, decision: ReviewDecision, findings: string) => {
    setPatients(prev => prev.map(p => {
      if (p.id === patientId) {
        return {
          ...p,
          status: 'reviewed',
          decision,
          findings,
          reviewedAt: new Date().toISOString(),
          reviewedBy: 'Dr. Aravind',
        };
      }
      return p;
    }));
    setSelectedPatient(null);
  }, []);

  const getPendingPatients = useCallback(() => {
    return patients.filter(p => p.status === 'pending' || p.status === 'urgent')
      .sort((a, b) => {
        // Urgent first, then by AI score, then by time
        if (a.status === 'urgent' && b.status !== 'urgent') return -1;
        if (b.status === 'urgent' && a.status !== 'urgent') return 1;
        if ((a.aiScore || 0) !== (b.aiScore || 0)) {
          return (b.aiScore || 0) - (a.aiScore || 0);
        }
        return new Date(a.visitDate).getTime() - new Date(b.visitDate).getTime();
      });
  }, [patients]);

  const getReviewedPatients = useCallback(() => {
    return patients.filter(p => p.status === 'reviewed')
      .sort((a, b) => new Date(b.reviewedAt || 0).getTime() - new Date(a.reviewedAt || 0).getTime());
  }, [patients]);

  const getUrgentPatients = useCallback(() => {
    return patients.filter(p => p.status === 'urgent');
  }, [patients]);

  const stats: DashboardStats = {
    pending: patients.filter(p => p.status === 'pending').length,
    reviewed: patients.filter(p => p.status === 'reviewed').length,
    urgent: patients.filter(p => p.status === 'urgent').length,
    total: patients.length,
    avgReviewTime: 4.5,
  };

  return (
    <PatientContext.Provider value={{
      patients,
      selectedPatient,
      stats,
      selectPatient,
      submitReview,
      getPendingPatients,
      getReviewedPatients,
      getUrgentPatients,
    }}>
      {children}
    </PatientContext.Provider>
  );
}

export function usePatients() {
  const context = useContext(PatientContext);
  if (context === undefined) {
    throw new Error('usePatients must be used within a PatientProvider');
  }
  return context;
}
