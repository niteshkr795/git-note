import { Resource, UserProfile, ReportReason } from '@/types';

export const SUBJECTS: string[] = [
  'Data Structures & Algorithms',
  'Operating Systems',
  'Database Management Systems',
  'Computer Networks',
  'Machine Learning & AI',
  'Engineering Mathematics III',
  'Compiler Design',
  'Software Engineering & Agile',
  'Digital Electronics & Logic Design',
  'Object Oriented Programming in Java',
];

export const SEMESTERS: string[] = [
  'Semester 1',
  'Semester 2',
  'Semester 3',
  'Semester 4',
  'Semester 5',
  'Semester 6',
  'Semester 7',
  'Semester 8',
];

export const RESOURCE_TYPES = [
  'PYQ',
  'Notes',
  'Assignment',
  'Lab Manual',
  'Study Material',
] as const;

export const ACADEMIC_YEARS = [
  '2024-25',
  '2023-24',
  '2022-23',
  '2021-22',
] as const;

export const INITIAL_RESOURCES: Resource[] = [];

export const MOCK_USER_PROFILE: UserProfile = {
  id: 'usr-1',
  name: 'Aarav Sharma',
  email: 'aarav.sharma@srmcem.ac.in',
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
  avatarInitials: 'AS',
  college: 'Shri Ramswaroop Memorial College of Engineering and Management (SRMCEM)',
  branch: 'Computer Science & Engineering',
  semester: 'Semester 6',
  bio: '6th-semester CSE student passionate about distributed systems and algorithms. Maintaining notes and past year solutions to help junior batches ace their end-sem exams!',
  joinedDate: 'August 2023',
  stats: {
    totalUploads: 0,
    totalDownloads: 0,
    totalBookmarks: 0,
  },
};

export const REPORT_REASONS: ReportReason[] = [
  {
    id: 'outdated_syllabus',
    label: 'Outdated or Incorrect Syllabus',
    description: 'This document does not match the latest university curriculum or contains obsolete topics.',
  },
  {
    id: 'poor_quality',
    label: 'Poor Scan or Unreadable Quality',
    description: 'The scan resolution is blurry, pages are cropped, missing, or upside-down.',
  },
  {
    id: 'wrong_metadata',
    label: 'Incorrect Subject / Semester Tag',
    description: 'The title, subject, semester, or academic year metadata does not correspond to the actual file.',
  },
  {
    id: 'copyright',
    label: 'Copyright or Unauthorized Publishing',
    description: 'This resource contains copyrighted commercial publisher material or private exam keys.',
  },
  {
    id: 'abusive_inappropriate',
    label: 'Inappropriate or Abusive Content',
    description: 'Contains spam, offensive text, or violates academic community integrity standards.',
  },
];
