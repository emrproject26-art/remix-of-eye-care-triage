import { Patient, User, DashboardStats } from '@/types';

// Mock fundus image URLs (using placeholder medical-style images)
const fundusImages = [
  'https://images.unsplash.com/photo-1559757175-5700dde675bc?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1551601651-bc60f254d532?w=800&h=600&fit=crop',
];

const conditions = [
  { name: 'Diabetic Retinopathy', urgency: 'high', aiScore: 85 },
  { name: 'Normal Retina', urgency: 'low', aiScore: 12 },
  { name: 'Glaucoma Suspect', urgency: 'medium', aiScore: 65 },
  { name: 'Retinal Detachment', urgency: 'critical', aiScore: 95 },
  { name: 'Age-related Macular Degeneration', urgency: 'medium', aiScore: 72 },
  { name: 'Normal Retina', urgency: 'low', aiScore: 8 },
  { name: 'Mild NPDR', urgency: 'medium', aiScore: 45 },
  { name: 'Normal Retina', urgency: 'low', aiScore: 15 },
];

const indianNames = [
  { name: 'Priya Sharma', gender: 'Female' as const },
  { name: 'Rajesh Kumar', gender: 'Male' as const },
  { name: 'Lakshmi Venkatesh', gender: 'Female' as const },
  { name: 'Arjun Patel', gender: 'Male' as const },
  { name: 'Meenakshi Sundaram', gender: 'Female' as const },
  { name: 'Suresh Rajan', gender: 'Male' as const },
  { name: 'Kavitha Krishnan', gender: 'Female' as const },
  { name: 'Mohan Das', gender: 'Male' as const },
  { name: 'Anitha Balaji', gender: 'Female' as const },
  { name: 'Vijay Anand', gender: 'Male' as const },
  { name: 'Deepa Murthy', gender: 'Female' as const },
  { name: 'Karthik Subramanian', gender: 'Male' as const },
  { name: 'Saroja Devi', gender: 'Female' as const },
  { name: 'Ramesh Babu', gender: 'Male' as const },
  { name: 'Padmini Rao', gender: 'Female' as const },
  { name: 'Ganesh Iyer', gender: 'Male' as const },
];

const departments = ['General OPD', 'Retina Clinic', 'Diabetic Eye Clinic', 'Emergency'];

function generateUID(index: number): string {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  return `PAT${dateStr}${String(index + 1).padStart(3, '0')}`;
}

function generatePatients(): Patient[] {
  const patients: Patient[] = [];
  const now = new Date();

  for (let i = 0; i < 16; i++) {
    const person = indianNames[i % indianNames.length];
    const condition = conditions[i % conditions.length];
    const isReviewed = i > 10;
    const isUrgent = condition.urgency === 'critical' || condition.urgency === 'high';

    const visitTime = new Date(now);
    visitTime.setHours(8 + Math.floor(i / 2), (i % 2) * 30, 0);

    patients.push({
      id: `patient-${i + 1}`,
      uid: generateUID(i),
      name: person.name,
      age: 35 + Math.floor(Math.random() * 40),
      gender: person.gender,
      phone: `+91-${9000000000 + Math.floor(Math.random() * 999999999)}`,
      department: departments[Math.floor(Math.random() * departments.length)],
      visitDate: visitTime.toISOString(),
      status: isReviewed ? 'reviewed' : isUrgent ? 'urgent' : 'pending',
      images: {
        left: {
          url: fundusImages[i % fundusImages.length],
          format: 'JPEG',
          resolution: '2048x1536',
          eye: 'left',
        },
        right: {
          url: fundusImages[(i + 1) % fundusImages.length],
          format: 'JPEG',
          resolution: '2048x1536',
          eye: 'right',
        },
      },
      condition: condition.name,
      aiScore: condition.aiScore,
      reviewedAt: isReviewed ? new Date(now.getTime() - Math.random() * 3600000).toISOString() : undefined,
      reviewedBy: isReviewed ? 'Dr. Aravind' : undefined,
      decision: isReviewed ? (condition.urgency === 'low' ? 'normal' : 'abnormal') : undefined,
      findings: isReviewed ? `${condition.name} detected. Patient counseled.` : undefined,
      createdAt: visitTime.toISOString(),
    });
  }

  return patients;
}

export const mockPatients = generatePatients();

export const mockUsers: Record<string, User & { password: string }> = {
  'dr.aravind': {
    id: 'user-1',
    username: 'dr.aravind',
    password: 'Welcome@123',
    fullName: 'Dr. Aravind Srinivasan',
    role: 'ophthalmologist',
    email: 'dr.aravind@aravind.org',
  },
  'admin': {
    id: 'user-2',
    username: 'admin',
    password: 'Admin@2024',
    fullName: 'System Administrator',
    role: 'admin',
    email: 'admin@aravind.org',
  },
  'tech01': {
    id: 'user-3',
    username: 'tech01',
    password: 'Tech@123',
    fullName: 'Technician Ramya',
    role: 'technician',
    email: 'ramya.tech@aravind.org',
  },
};

export const mockStats: DashboardStats = {
  pending: mockPatients.filter(p => p.status === 'pending' || p.status === 'urgent').length,
  reviewed: mockPatients.filter(p => p.status === 'reviewed').length,
  urgent: mockPatients.filter(p => p.status === 'urgent').length,
  total: mockPatients.length,
  avgReviewTime: 4.5,
};
