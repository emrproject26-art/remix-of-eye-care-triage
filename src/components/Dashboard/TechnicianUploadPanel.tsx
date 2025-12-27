import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { usePatients } from '@/contexts/PatientContext';
import { Upload, Camera, User, Phone, Calendar, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export function TechnicianUploadPanel() {
  const { selectedPatient } = usePatients();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const handleUploadImages = async () => {
    setIsUploading(true);
    // Simulate upload
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsUploading(false);
    setUploadSuccess(true);
    toast.success('Images uploaded successfully', {
      description: 'Patient has been added to the review queue'
    });
    setTimeout(() => setUploadSuccess(false), 3000);
  };

  return (
    <div className="space-y-4">
      {/* Upload New Patient Card */}
      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Upload className="w-4 h-4 text-primary" />
            Add New Patient
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="patient-name" className="text-xs">Patient Name</Label>
            <Input id="patient-name" placeholder="Enter patient name" className="h-9" />
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="age" className="text-xs">Age</Label>
              <Input id="age" type="number" placeholder="Age" className="h-9" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gender" className="text-xs">Gender</Label>
              <select id="gender" className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm">
                <option value="">Select</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="text-xs">Phone Number</Label>
            <Input id="phone" placeholder="+91-XXXXXXXXXX" className="h-9" />
          </div>

          {/* Image Upload Areas */}
          <div className="grid grid-cols-2 gap-3">
            <div className="border-2 border-dashed border-border rounded-lg p-4 text-center hover:border-primary/50 transition-colors cursor-pointer">
              <Camera className="w-6 h-6 mx-auto text-muted-foreground mb-2" />
              <span className="text-xs text-muted-foreground">Left Eye</span>
            </div>
            <div className="border-2 border-dashed border-border rounded-lg p-4 text-center hover:border-primary/50 transition-colors cursor-pointer">
              <Camera className="w-6 h-6 mx-auto text-muted-foreground mb-2" />
              <span className="text-xs text-muted-foreground">Right Eye</span>
            </div>
          </div>

          <Button 
            className="w-full" 
            onClick={handleUploadImages}
            disabled={isUploading}
          >
            {isUploading ? (
              <>
                <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-2" />
                Uploading...
              </>
            ) : uploadSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Uploaded!
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Add to Queue
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Selected Patient Info (View Only) */}
      {selectedPatient && (
        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <User className="w-4 h-4 text-primary" />
              Selected Patient
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <User className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">Name:</span>
              <span className="font-medium">{selectedPatient.name}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="w-4 h-4 text-muted-foreground text-center font-mono text-xs">#</span>
              <span className="text-muted-foreground">UID:</span>
              <span className="font-medium mono-text">{selectedPatient.uid}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">Age:</span>
              <span className="font-medium">{selectedPatient.age} years</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Phone className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">Phone:</span>
              <span className="font-medium">{selectedPatient.phone}</span>
            </div>

            {/* Status Badge */}
            <div className="pt-2 border-t border-border">
              <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                selectedPatient.status === 'pending' ? 'bg-warning/10 text-warning' :
                selectedPatient.status === 'urgent' ? 'bg-destructive/10 text-destructive' :
                'bg-success/10 text-success'
              }`}>
                {selectedPatient.status === 'pending' && <AlertCircle className="w-3 h-3" />}
                {selectedPatient.status === 'urgent' && <AlertCircle className="w-3 h-3" />}
                {selectedPatient.status === 'reviewed' && <CheckCircle2 className="w-3 h-3" />}
                {selectedPatient.status.charAt(0).toUpperCase() + selectedPatient.status.slice(1)}
              </div>
            </div>

            {/* Note for technicians */}
            <div className="bg-muted/50 rounded-lg p-3 text-xs text-muted-foreground">
              <p className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                Review decisions are made by ophthalmologists. You can view patient details and upload new images.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
