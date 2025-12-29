import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { usePatients } from '@/contexts/PatientContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { Upload, Camera, User, Phone, Calendar, CheckCircle2, AlertCircle, X, Hash } from 'lucide-react';
import { toast } from 'sonner';

export function TechnicianUploadPanel() {
  const { selectedPatient, addPatient } = usePatients();
  const { addNotification } = useNotifications();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  
  // Form state
  const [patientName, setPatientName] = useState('');
  const [patientUid, setPatientUid] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [phone, setPhone] = useState('');
  const [leftEyeImage, setLeftEyeImage] = useState<File | null>(null);
  const [rightEyeImage, setRightEyeImage] = useState<File | null>(null);
  const [leftEyePreview, setLeftEyePreview] = useState<string | null>(null);
  const [rightEyePreview, setRightEyePreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const leftEyeInputRef = useRef<HTMLInputElement>(null);
  const rightEyeInputRef = useRef<HTMLInputElement>(null);

  const validatePhone = (value: string): boolean => {
    const phoneRegex = /^\d{10}$/;
    return phoneRegex.test(value);
  };

  const validateImage = (file: File): { valid: boolean; error?: string } => {
    const validTypes = ['image/jpeg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      return { valid: false, error: 'Only JPEG and PNG formats are accepted' };
    }
    return { valid: true };
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, eye: 'left' | 'right') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateImage(file);
    if (!validation.valid) {
      toast.error(validation.error);
      e.target.value = '';
      return;
    }

    // Create preview URL
    const previewUrl = URL.createObjectURL(file);

    if (eye === 'left') {
      setLeftEyeImage(file);
      setLeftEyePreview(previewUrl);
    } else {
      setRightEyeImage(file);
      setRightEyePreview(previewUrl);
    }
    toast.success(`${eye === 'left' ? 'OS (Left Eye)' : 'OD (Right Eye)'} image uploaded`);
  };

  const removeImage = (eye: 'left' | 'right') => {
    if (eye === 'left') {
      if (leftEyePreview) URL.revokeObjectURL(leftEyePreview);
      setLeftEyeImage(null);
      setLeftEyePreview(null);
      if (leftEyeInputRef.current) leftEyeInputRef.current.value = '';
    } else {
      if (rightEyePreview) URL.revokeObjectURL(rightEyePreview);
      setRightEyeImage(null);
      setRightEyePreview(null);
      if (rightEyeInputRef.current) rightEyeInputRef.current.value = '';
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!patientName.trim()) {
      newErrors.name = 'Patient name is required';
    }

    if (!patientUid.trim()) {
      newErrors.uid = 'UID is required';
    }

    if (!age || parseInt(age) < 1 || parseInt(age) > 120) {
      newErrors.age = 'Valid age is required';
    }

    if (!gender) {
      newErrors.gender = 'Gender is required';
    }

    if (!phone) {
      newErrors.phone = 'Phone number is required';
    } else if (!validatePhone(phone)) {
      newErrors.phone = 'Phone must be exactly 10 digits';
    }

    if (!leftEyeImage && !rightEyeImage) {
      newErrors.images = 'At least one eye image is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUploadImages = async () => {
    if (!validateForm()) {
      toast.error('Please fix the errors before submitting');
      return;
    }

    setIsUploading(true);
    
    try {
      // Add patient with file objects (they'll be uploaded in the context)
      await addPatient({
        name: patientName,
        uid: patientUid,
        age: parseInt(age),
        gender: gender as 'Male' | 'Female' | 'Other',
        phone: `+91-${phone}`,
        leftEyeImage: leftEyeImage || undefined,
        rightEyeImage: rightEyeImage || undefined,
      });

      // Add notification
      addNotification(
        patientName,
        'Patient added successfully',
        'success'
      );
      
      setUploadSuccess(true);

      // Reset form
      setTimeout(() => {
        setUploadSuccess(false);
        setPatientName('');
        setPatientUid('');
        setAge('');
        setGender('');
        setPhone('');
        if (leftEyePreview) URL.revokeObjectURL(leftEyePreview);
        if (rightEyePreview) URL.revokeObjectURL(rightEyePreview);
        setLeftEyeImage(null);
        setRightEyeImage(null);
        setLeftEyePreview(null);
        setRightEyePreview(null);
        setErrors({});
      }, 2000);
    } catch (error) {
      console.error('Error adding patient:', error);
    } finally {
      setIsUploading(false);
    }
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
          {/* UID Field */}
          <div className="space-y-2">
            <Label htmlFor="patient-uid" className="text-xs flex items-center gap-1">
              <Hash className="w-3 h-3" /> Patient UID <span className="text-destructive">*</span>
            </Label>
            <Input 
              id="patient-uid" 
              placeholder="Enter unique patient ID" 
              className={`h-9 ${errors.uid ? 'border-destructive' : ''}`}
              value={patientUid}
              onChange={(e) => setPatientUid(e.target.value)}
            />
            {errors.uid && <p className="text-xs text-destructive">{errors.uid}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="patient-name" className="text-xs">
              Patient Name <span className="text-destructive">*</span>
            </Label>
            <Input 
              id="patient-name" 
              placeholder="Enter patient name" 
              className={`h-9 ${errors.name ? 'border-destructive' : ''}`}
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
            />
            {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="age" className="text-xs">
                Age <span className="text-destructive">*</span>
              </Label>
              <Input 
                id="age" 
                type="number" 
                placeholder="Age" 
                className={`h-9 ${errors.age ? 'border-destructive' : ''}`}
                value={age}
                onChange={(e) => setAge(e.target.value)}
                min="1"
                max="120"
              />
              {errors.age && <p className="text-xs text-destructive">{errors.age}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="gender" className="text-xs">
                Gender <span className="text-destructive">*</span>
              </Label>
              <select 
                id="gender" 
                className={`w-full h-9 px-3 rounded-md border bg-background text-sm ${errors.gender ? 'border-destructive' : 'border-input'}`}
                value={gender}
                onChange={(e) => setGender(e.target.value)}
              >
                <option value="">Select</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
              {errors.gender && <p className="text-xs text-destructive">{errors.gender}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="text-xs">
              Phone Number <span className="text-destructive">*</span>
            </Label>
            <div className="flex">
              <span className="inline-flex items-center px-3 h-9 text-sm bg-muted border border-r-0 border-input rounded-l-md">
                +91
              </span>
              <Input 
                id="phone" 
                placeholder="10 digit number" 
                className={`h-9 rounded-l-none ${errors.phone ? 'border-destructive' : ''}`}
                value={phone}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                  setPhone(value);
                }}
                maxLength={10}
              />
            </div>
            {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
          </div>

          {/* Image Upload Areas */}
          <div className="space-y-2">
            <Label className="text-xs">
              Fundus Images <span className="text-destructive">*</span>
            </Label>
            {errors.images && <p className="text-xs text-destructive">{errors.images}</p>}
            <div className="grid grid-cols-2 gap-3">
              {/* OS (Left Eye) */}
              <div className="relative">
                <input
                  ref={leftEyeInputRef}
                  type="file"
                  accept="image/jpeg,image/png"
                  onChange={(e) => handleImageChange(e, 'left')}
                  className="hidden"
                  id="left-eye-upload"
                />
                {leftEyePreview ? (
                  <div className="relative border-2 border-success rounded-lg p-2">
                    <img 
                      src={leftEyePreview} 
                      alt="OS preview" 
                      className="w-full h-16 object-cover rounded"
                    />
                    <button
                      onClick={() => removeImage('left')}
                      className="absolute -top-2 -right-2 w-5 h-5 bg-destructive text-white rounded-full flex items-center justify-center"
                    >
                      <X className="w-3 h-3" />
                    </button>
                    <span className="text-[10px] text-success mt-1 block text-center">OS (Left Eye)</span>
                  </div>
                ) : (
                  <label
                    htmlFor="left-eye-upload"
                    className="border-2 border-dashed border-border rounded-lg p-4 text-center hover:border-primary/50 transition-colors cursor-pointer block"
                  >
                    <Camera className="w-6 h-6 mx-auto text-muted-foreground mb-2" />
                    <span className="text-xs text-muted-foreground">OS (Left Eye)</span>
                  </label>
                )}
              </div>
              
              {/* OD (Right Eye) */}
              <div className="relative">
                <input
                  ref={rightEyeInputRef}
                  type="file"
                  accept="image/jpeg,image/png"
                  onChange={(e) => handleImageChange(e, 'right')}
                  className="hidden"
                  id="right-eye-upload"
                />
                {rightEyePreview ? (
                  <div className="relative border-2 border-success rounded-lg p-2">
                    <img 
                      src={rightEyePreview} 
                      alt="OD preview" 
                      className="w-full h-16 object-cover rounded"
                    />
                    <button
                      onClick={() => removeImage('right')}
                      className="absolute -top-2 -right-2 w-5 h-5 bg-destructive text-white rounded-full flex items-center justify-center"
                    >
                      <X className="w-3 h-3" />
                    </button>
                    <span className="text-[10px] text-success mt-1 block text-center">OD (Right Eye)</span>
                  </div>
                ) : (
                  <label
                    htmlFor="right-eye-upload"
                    className="border-2 border-dashed border-border rounded-lg p-4 text-center hover:border-primary/50 transition-colors cursor-pointer block"
                  >
                    <Camera className="w-6 h-6 mx-auto text-muted-foreground mb-2" />
                    <span className="text-xs text-muted-foreground">OD (Right Eye)</span>
                  </label>
                )}
              </div>
            </div>
            <p className="text-[10px] text-muted-foreground">Accepts JPEG/PNG fundus images only</p>
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
                Added!
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
