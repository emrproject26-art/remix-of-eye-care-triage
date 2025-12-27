import React from 'react';
import { Header } from './Header';
import { StatsPanel } from './StatsPanel';
import { PatientQueue } from './PatientQueue';
import { ImageViewer } from './ImageViewer';
import { ReviewPanel } from './ReviewPanel';
import { TechnicianUploadPanel } from './TechnicianUploadPanel';
import { usePatients } from '@/contexts/PatientContext';
import { PatientProvider } from '@/contexts/PatientContext';
import { useAuth } from '@/contexts/AuthContext';
import { Upload, Eye, Shield } from 'lucide-react';

function DashboardContent() {
  const { selectedPatient } = usePatients();
  const { user } = useAuth();

  const isOphthalmologist = user?.role === 'ophthalmologist';
  const isTechnician = user?.role === 'technician';
  const isAdmin = user?.role === 'admin';

  // Technicians see upload panel instead of review panel
  const canReview = isOphthalmologist || isAdmin;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Role indicator banner */}
      <div className={`px-4 py-2 text-sm flex items-center justify-center gap-2 ${
        isOphthalmologist ? 'bg-primary/10 text-primary' :
        isTechnician ? 'bg-accent/10 text-accent-foreground' :
        'bg-warning/10 text-warning'
      }`}>
        {isOphthalmologist && <Eye className="w-4 h-4" />}
        {isTechnician && <Upload className="w-4 h-4" />}
        {isAdmin && <Shield className="w-4 h-4" />}
        <span className="font-medium">
          {isOphthalmologist && 'Ophthalmologist View — Review and diagnose patients'}
          {isTechnician && 'Technician View — Upload images and manage patient queue'}
          {isAdmin && 'Admin View — Full access to all features'}
        </span>
      </div>
      
      <main className="p-4 lg:p-6 space-y-6">
        {/* Stats */}
        <StatsPanel />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6">
          {/* Patient Queue */}
          <div className="lg:col-span-3">
            <PatientQueue />
          </div>

          {/* Image Viewers */}
          <div className="lg:col-span-6 space-y-4">
            {selectedPatient ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ImageViewer
                  imageUrl={selectedPatient.images.left.url}
                  eye="left"
                  patientName={selectedPatient.name}
                />
                <ImageViewer
                  imageUrl={selectedPatient.images.right.url}
                  eye="right"
                  patientName={selectedPatient.name}
                />
              </div>
            ) : (
              <div className="h-[500px] bg-card rounded-xl border border-border flex flex-col items-center justify-center text-center p-8">
                <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                  <svg className="w-10 h-10 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-foreground mb-2">Fundus Image Viewer</h3>
                <p className="text-sm text-muted-foreground max-w-sm">
                  Select a patient from the queue to view their left and right eye fundus photographs
                </p>
              </div>
            )}

            {/* Patient Info Bar */}
            {selectedPatient && (
              <div className="bg-card rounded-xl border border-border p-4 animate-fade-in">
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Patient: </span>
                    <span className="font-medium text-foreground">{selectedPatient.name}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">UID: </span>
                    <span className="font-medium mono-text text-foreground">{selectedPatient.uid}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Age/Gender: </span>
                    <span className="font-medium text-foreground">{selectedPatient.age}y / {selectedPatient.gender}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Department: </span>
                    <span className="font-medium text-foreground">{selectedPatient.department}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Panel - Role dependent */}
          <div className="lg:col-span-3">
            {canReview ? (
              <ReviewPanel />
            ) : (
              <TechnicianUploadPanel />
            )}
          </div>
        </div>
      </main>

      {/* Keyboard Shortcuts Hint - Only for reviewers */}
      {canReview && (
        <div className="fixed bottom-4 left-4 hidden lg:flex items-center gap-4 text-xs text-muted-foreground bg-card/90 backdrop-blur border border-border rounded-lg px-4 py-2">
          <span><kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px] font-mono">N</kbd> Next</span>
          <span><kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px] font-mono">R</kbd> Normal</span>
          <span><kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px] font-mono">A</kbd> Abnormal</span>
          <span><kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px] font-mono">F</kbd> Fullscreen</span>
        </div>
      )}
    </div>
  );
}

export function DashboardPage() {
  return (
    <PatientProvider>
      <DashboardContent />
    </PatientProvider>
  );
}
