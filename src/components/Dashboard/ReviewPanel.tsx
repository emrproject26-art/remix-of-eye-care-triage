import React, { useState } from 'react';
import { CheckCircle, AlertTriangle, XCircle, Send, ArrowRight, Stethoscope } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { usePatients } from '@/contexts/PatientContext';
import { ReviewDecision } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const decisionOptions: { value: ReviewDecision; label: string; icon: React.ReactNode; color: string }[] = [
  { 
    value: 'normal', 
    label: 'Normal', 
    icon: <CheckCircle className="w-5 h-5" />,
    color: 'bg-success/10 border-success/30 text-success hover:bg-success/20'
  },
  { 
    value: 'abnormal', 
    label: 'Abnormal', 
    icon: <AlertTriangle className="w-5 h-5" />,
    color: 'bg-warning/10 border-warning/30 text-warning hover:bg-warning/20'
  },
  { 
    value: 'urgent', 
    label: 'Urgent', 
    icon: <XCircle className="w-5 h-5" />,
    color: 'bg-urgent/10 border-urgent/30 text-urgent hover:bg-urgent/20'
  },
  { 
    value: 'refer', 
    label: 'Refer', 
    icon: <ArrowRight className="w-5 h-5" />,
    color: 'bg-accent/10 border-accent/30 text-accent hover:bg-accent/20'
  },
];

export function ReviewPanel() {
  const { selectedPatient, submitReview } = usePatients();
  const { toast } = useToast();
  const [decision, setDecision] = useState<ReviewDecision | null>(null);
  const [findings, setFindings] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!selectedPatient || !decision) return;

    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    submitReview(selectedPatient.id, decision, findings);
    
    toast({
      title: 'Review Submitted',
      description: `Patient ${selectedPatient.name} marked as ${decision}`,
    });

    setDecision(null);
    setFindings('');
    setIsSubmitting(false);
  };

  if (!selectedPatient) {
    return (
      <div className="h-full bg-card rounded-xl border border-border flex flex-col items-center justify-center p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
          <Stethoscope className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium text-foreground mb-2">No Patient Selected</h3>
        <p className="text-sm text-muted-foreground max-w-xs">
          Select a patient from the queue to view their fundus images and submit your review
        </p>
      </div>
    );
  }

  if (selectedPatient.status === 'reviewed') {
    return (
      <div className="h-full bg-card rounded-xl border border-border p-6">
        <h3 className="font-semibold text-foreground mb-4">Review Summary</h3>
        
        <div className="space-y-4">
          <div>
            <Label className="text-xs text-muted-foreground">Decision</Label>
            <p className="font-medium capitalize text-foreground">{selectedPatient.decision}</p>
          </div>
          
          <div>
            <Label className="text-xs text-muted-foreground">Findings</Label>
            <p className="text-sm text-foreground">{selectedPatient.findings || 'No findings recorded'}</p>
          </div>
          
          <div>
            <Label className="text-xs text-muted-foreground">Reviewed By</Label>
            <p className="text-sm text-foreground">{selectedPatient.reviewedBy}</p>
          </div>
          
          <div>
            <Label className="text-xs text-muted-foreground">Reviewed At</Label>
            <p className="text-sm text-foreground mono-text">
              {new Date(selectedPatient.reviewedAt!).toLocaleString('en-IN')}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-card rounded-xl border border-border flex flex-col">
      <div className="p-4 border-b border-border">
        <h3 className="font-semibold text-foreground">Submit Review</h3>
        <p className="text-xs text-muted-foreground mt-1">
          Patient: {selectedPatient.name} ({selectedPatient.uid})
        </p>
      </div>

      <div className="flex-1 p-4 space-y-4 overflow-auto">
        {/* AI Suggestion */}
        {selectedPatient.condition && (
          <div className="p-3 rounded-lg bg-accent/5 border border-accent/20">
            <p className="text-xs font-medium text-accent mb-1">AI Suggestion</p>
            <p className="text-sm text-foreground">{selectedPatient.condition}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Confidence: {selectedPatient.aiScore}%
            </p>
          </div>
        )}

        {/* Decision Selection */}
        <div className="space-y-2">
          <Label>Decision</Label>
          <div className="grid grid-cols-2 gap-2">
            {decisionOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setDecision(option.value)}
                className={cn(
                  "flex items-center gap-2 p-3 rounded-lg border-2 transition-all text-sm font-medium",
                  decision === option.value
                    ? option.color
                    : "border-border bg-muted/30 text-muted-foreground hover:border-border hover:bg-muted/50"
                )}
              >
                {option.icon}
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Findings */}
        <div className="space-y-2">
          <Label htmlFor="findings">Clinical Findings</Label>
          <Textarea
            id="findings"
            placeholder="Enter clinical observations and notes..."
            value={findings}
            onChange={(e) => setFindings(e.target.value)}
            className="min-h-[120px] resize-none"
          />
        </div>
      </div>

      {/* Submit Button */}
      <div className="p-4 border-t border-border">
        <Button
          variant="hospital"
          size="lg"
          className="w-full"
          onClick={handleSubmit}
          disabled={!decision || isSubmitting}
        >
          {isSubmitting ? (
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              Submitting...
            </div>
          ) : (
            <>
              <Send className="w-5 h-5" />
              Submit Review
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
