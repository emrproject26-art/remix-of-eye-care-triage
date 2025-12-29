import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Patient, ReviewDecision, DashboardStats } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AddPatientData {
  name: string;
  uid: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  phone: string;
  leftEyeImage?: File;
  rightEyeImage?: File;
}

interface PatientContextType {
  patients: Patient[];
  selectedPatient: Patient | null;
  stats: DashboardStats;
  loading: boolean;
  selectPatient: (patient: Patient | null) => void;
  submitReview: (patientId: string, decision: ReviewDecision, findings: string) => Promise<void>;
  addPatient: (data: AddPatientData) => Promise<void>;
  getPendingPatients: () => Patient[];
  getReviewedPatients: () => Patient[];
  getUrgentPatients: () => Patient[];
  refreshPatients: () => Promise<void>;
}

const PatientContext = createContext<PatientContextType | undefined>(undefined);

export function PatientProvider({ children }: { children: React.ReactNode }) {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch patients from database
  const fetchPatients = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const mappedPatients: Patient[] = (data || []).map(p => ({
        id: p.id,
        uid: p.uid,
        name: p.name,
        age: p.age,
        gender: p.gender as 'Male' | 'Female' | 'Other',
        phone: p.phone,
        department: p.department,
        visitDate: p.visit_date,
        status: p.status as 'pending' | 'reviewed' | 'urgent',
        images: {
          left: {
            url: p.left_eye_image_url || '',
            format: 'JPEG',
            resolution: '2048x1536',
            eye: 'left' as const,
          },
          right: {
            url: p.right_eye_image_url || '',
            format: 'JPEG',
            resolution: '2048x1536',
            eye: 'right' as const,
          },
        },
        reviewedAt: p.reviewed_at || undefined,
        reviewedBy: p.reviewed_by || undefined,
        decision: p.decision as ReviewDecision | undefined,
        findings: p.findings || undefined,
        condition: p.condition || undefined,
        aiScore: p.ai_score || undefined,
        createdAt: p.created_at,
      }));

      setPatients(mappedPatients);
    } catch (error) {
      console.error('Error fetching patients:', error);
      toast.error('Failed to fetch patients');
    } finally {
      setLoading(false);
    }
  }, []);

  // Subscribe to realtime updates
  useEffect(() => {
    fetchPatients();

    const channel = supabase
      .channel('patients-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'patients',
        },
        () => {
          fetchPatients();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchPatients]);

  const refreshPatients = useCallback(async () => {
    await fetchPatients();
  }, [fetchPatients]);

  const selectPatient = useCallback((patient: Patient | null) => {
    setSelectedPatient(patient);
  }, []);

  const submitReview = useCallback(async (patientId: string, decision: ReviewDecision, findings: string) => {
    try {
      const { error } = await supabase
        .from('patients')
        .update({
          status: 'reviewed',
          decision,
          findings,
          reviewed_at: new Date().toISOString(),
          reviewed_by: 'Dr. Aravind',
        })
        .eq('id', patientId);

      if (error) throw error;

      setSelectedPatient(null);
      toast.success('Review submitted successfully');
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Failed to submit review');
    }
  }, []);

  const uploadImage = async (file: File, patientUid: string, eye: 'left' | 'right'): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${patientUid}/${eye}-${Date.now()}.${fileExt}`;
    
    const { error: uploadError } = await supabase.storage
      .from('patient-images')
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('patient-images')
      .getPublicUrl(fileName);

    return publicUrl;
  };

  const addPatient = useCallback(async (data: AddPatientData) => {
    try {
      let leftImageUrl = '';
      let rightImageUrl = '';

      // Upload images to storage
      if (data.leftEyeImage) {
        leftImageUrl = await uploadImage(data.leftEyeImage, data.uid, 'left');
      }
      if (data.rightEyeImage) {
        rightImageUrl = await uploadImage(data.rightEyeImage, data.uid, 'right');
      }

      // Insert patient record
      const { error } = await supabase
        .from('patients')
        .insert({
          uid: data.uid,
          name: data.name,
          age: data.age,
          gender: data.gender,
          phone: data.phone,
          department: 'General OPD',
          status: 'pending',
          left_eye_image_url: leftImageUrl || null,
          right_eye_image_url: rightImageUrl || null,
        });

      if (error) throw error;

      toast.success('Patient added successfully');
    } catch (error) {
      console.error('Error adding patient:', error);
      toast.error('Failed to add patient');
      throw error;
    }
  }, []);

  const getPendingPatients = useCallback(() => {
    return patients.filter(p => p.status === 'pending' || p.status === 'urgent')
      .sort((a, b) => {
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
      loading,
      selectPatient,
      submitReview,
      addPatient,
      getPendingPatients,
      getReviewedPatients,
      getUrgentPatients,
      refreshPatients,
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
