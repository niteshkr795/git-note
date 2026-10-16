export type ResourceType = 'PYQ' | 'Notes' | 'Assignment' | 'Lab Manual' | 'Study Material';

export type Semester = 'Semester 1' | 'Semester 2' | 'Semester 3' | 'Semester 4' | 'Semester 5' | 'Semester 6' | 'Semester 7' | 'Semester 8';

export type AcademicYear =
  | '2026-27'
  | '2025-26'
  | '2024-25'
  | '2023-24'
  | '2022-23'
  | '2021-22'
  | '2020-21';

export type FileFormat = 'PDF' | 'DOCX' | 'ZIP';

export interface Uploader {
  id: string;
  name: string;
  avatar: string;
  avatarUrl?: string;
  college: string;
  branch: string;
  semester: string;
  verified?: boolean;
}

export interface Resource {
  id: string;
  title: string;
  description: string;
  subject: string;
  semester: Semester;
  resourceType: ResourceType;
  academicYear: AcademicYear;
  fileFormat: FileFormat;
  fileSize: string;
  fileSizeBytes?: number;
  pageCount?: number;
  downloadCount: number;
  viewCount: number;
  rating: number;
  createdAt: string;
  tags: string[];
  uploader: Uploader;
  previewUrl?: string;
  storagePath?: string;
  previewContent?: {
    summary: string;
    keyTopics: string[];
    sampleText: string;
    diagramType?: string;
  };
  isBookmarked?: boolean;
  isVerified?: boolean;
}

export interface FilterState {
  searchQuery: string;
  semester: string;
  subject: string;
  resourceType: string;
  academicYear: string;
  sortBy: 'recent' | 'downloads' | 'rating' | 'title';
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar: string;
  avatarInitials?: string;
  college: string;
  branch: string;
  semester: Semester;
  bio: string;
  joinedDate: string;
  stats: {
    totalUploads: number;
    totalDownloads: number;
    totalBookmarks: number;
  };
}

export interface ReportReason {
  id: string;
  label: string;
  description: string;
}
