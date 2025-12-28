import React, { createContext, useContext, useState, useCallback } from 'react';
import { Patient, ReviewDecision, DashboardStats } from '@/types';
import { mockPatients } from '@/data/mockData';

interface AddPatientData {
  name: string;
  uid: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  phone: string;
  leftEyeImage?: string;
  rightEyeImage?: string;
}

interface PatientContextType {
  patients: Patient[];
  selectedPatient: Patient | null;
  stats: DashboardStats;
  selectPatient: (patient: Patient | null) => void;
  submitReview: (patientId: string, decision: ReviewDecision, findings: string) => void;
  addPatient: (data: AddPatientData) => void;
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

  const addPatient = useCallback((data: AddPatientData) => {
    const now = new Date();
    const newPatient: Patient = {
      id: `patient-${Date.now()}`,
      uid: data.uid,
      name: data.name,
      age: data.age,
      gender: data.gender,
      phone: data.phone,
      department: 'General OPD',
      visitDate: now.toISOString(),
      status: 'pending',
      images: {
        left: {
          url: data.leftEyeImage || 'https://images.unsplash.com/photo-1559757175-5700dde675bc?w=800&h=600&fit=crop',
          format: 'JPEG',
          resolution: '2048x1536',
          eye: 'left',
        },
        right: {
          url: data.rightEyeImage || 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&h=600&fit=crop',
          format: 'JPEG',
          resolution: '2048x1536',
          eye: 'right',
        },
      },
      createdAt: now.toISOString(),
    };
    
    setPatients(prev => [newPatient, ...prev]);
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
      addPatient,
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
