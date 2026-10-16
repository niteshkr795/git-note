import { Resource, UserProfile, ReportReason } from '@/types';

export const SUBJECTS: string[] = [
  // First-Year Common & Foundation
  'Engineering Mathematics I (Calculus & Linear Algebra)',
  'Engineering Mathematics II (Differential Equations & Complex Variables)',
  'Engineering Mathematics III (Transform Calculus & Statistics)',
  'Discrete Mathematics & Graph Theory',
  'Engineering Physics',
  'Engineering Chemistry',
  'Basic Electrical Engineering (BEE)',
  'Basic Electronics Engineering',
  'Programming for Problem Solving (C Programming)',
  'Engineering Mechanics',
  'Engineering Graphics & Design (CAD)',
  'Environmental Studies & Disaster Management',
  'Technical Communication & Soft Skills',

  // Computer Science, IT, AI & Data Science (GATE CS/IT)
  'Data Structures & Algorithms (DSA)',
  'Design & Analysis of Algorithms (DAA)',
  'Computer Organization & Architecture (COA)',
  'Operating Systems (OS)',
  'Database Management Systems (DBMS)',
  'Theory of Computation & Automata (TOC)',
  'Compiler Design',
  'Computer Networks (CN)',
  'Digital Logic & Circuit Design',
  'Software Engineering & Agile Methodologies',
  'Object Oriented Programming in Java',
  'Object Oriented Programming in C++',
  'Python Programming & Applications',
  'Web Technology & Full Stack Development',
  'Artificial Intelligence & Expert Systems',
  'Machine Learning & Deep Learning',
  'Cloud Computing & DevOps',
  'Cyber Security & Cryptography',
  'Data Science & Big Data Analytics',
  'Mobile Application Development (Android/Flutter)',
  'Computer Graphics & Multimedia',
  'Natural Language Processing (NLP)',
  'Internet of Things (IoT)',
  'Distributed Systems',

  // Electronics & Communication (GATE EC)
  'Analog Electronic Circuits',
  'Electronic Devices & Circuits (EDC)',
  'Signals & Systems',
  'Digital Signal Processing (DSP)',
  'Control Systems Engineering',
  'Electromagnetic Field Theory (EMFT)',
  'Analog & Digital Communication Systems',
  'Microprocessors & Microcontrollers (8085/8086/ARM)',
  'VLSI Design & Semiconductor Technology',
  'Microwave Engineering & Antennas',
  'Embedded Systems & RTOS',
  'Optical Fiber Communication',

  // Electrical Engineering (GATE EE)
  'Electric Circuit Analysis & Network Theory',
  'Electrical Machines I (DC Machines & Transformers)',
  'Electrical Machines II (AC Machines & Synchronous)',
  'Power Systems I (Transmission & Distribution)',
  'Power Systems II (Switchgear & Protection)',
  'Power Electronics & Electric Drives',
  'Electrical & Electronic Measurements',
  'Renewable Energy & Smart Grid Systems',

  // Mechanical Engineering (GATE ME)
  'Engineering Thermodynamics',
  'Fluid Mechanics & Hydraulic Machines',
  'Strength of Materials (Mechanics of Solids)',
  'Theory of Machines & Mechanisms (TOM)',
  'Design of Machine Elements (Machine Design)',
  'Heat & Mass Transfer (HMT)',
  'Manufacturing Science & Workshop Practice',
  'Refrigeration & Air Conditioning (RAC)',
  'Internal Combustion Engines & Automobile Engg',
  'Industrial Engineering & Operations Research',
  'CAD / CAM & Robotics',

  // Civil Engineering (GATE CE)
  'Structural Analysis',
  'Design of Concrete Structures (RCC)',
  'Design of Steel Structures',
  'Geotechnical Engineering & Soil Mechanics',
  'Surveying & Geomatics Engineering',
  'Hydraulics & Water Resources Engineering',
  'Transportation Engineering (Highways & Railways)',
  'Environmental Engineering & Wastewater Management',
  'Hydrology & Irrigation Engineering',
  'Building Materials & Construction Management',

  // GATE Exam Specific & Aptitude
  'GATE General Aptitude (Quantitative & Verbal Reasoning)',
  'GATE Engineering Mathematics',
  'GATE CS: Core Computer Science Comprehensive',
  'GATE EC: Core Electronics Comprehensive',
  'GATE EE: Core Electrical Comprehensive',
  'GATE ME: Core Mechanical Comprehensive',
  'GATE CE: Core Civil Comprehensive',
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
  '2026-27',
  '2025-26',
  '2024-25',
  '2023-24',
  '2022-23',
  '2021-22',
  '2020-21',
] as const;

/**
 * Normalizes any semester string format (e.g. "3", "Sem 3", "3rd Sem", "Semester 3")
 * into canonical "Semester X" format.
 */
export function normalizeSemester(sem: string | undefined | null, defaultFallback: string = ''): string {
  if (!sem || !String(sem).trim()) return defaultFallback;
  const match = String(sem).match(/\d+/);
  if (match) {
    const num = parseInt(match[0], 10);
    if (num >= 1 && num <= 8) {
      return `Semester ${num}`;
    }
  }
  return String(sem).trim();
}

/**
 * Generates all common permutations of a semester string for flexible database matching.
 * E.g., for "Semester 3" -> ["Semester 3", "Sem 3", "Sem-3", "3", "3rd", "3rd Sem", "3rd Semester"]
 */
export function getSemesterVariants(semInput: string | undefined | null): string[] {
  if (!semInput) return [];
  const match = String(semInput).match(/\d+/);
  if (!match) return [String(semInput).trim()];
  const num = match[0];
  const full = `Semester ${num}`;
  const shortSem = `Sem ${num}`;
  const hyphenSem = `Sem-${num}`;
  const ordinal = num === '1' ? '1st' : num === '2' ? '2nd' : num === '3' ? '3rd' : `${num}th`;
  return Array.from(
    new Set([
      full,
      shortSem,
      hyphenSem,
      num,
      ordinal,
      `${ordinal} Sem`,
      `${ordinal} Semester`,
      String(semInput).trim(),
    ])
  );
}

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
