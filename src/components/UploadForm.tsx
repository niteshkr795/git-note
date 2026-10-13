'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useResources } from '@/context/ResourceContext';
import { Button } from '@/components/ui/Button';
import { SUBJECTS, SEMESTERS, RESOURCE_TYPES, ACADEMIC_YEARS } from '@/data/mockData';
import { Semester, ResourceType, AcademicYear, FileFormat } from '@/types';
import {
  UploadCloud,
  FileText,
  X,
  AlertCircle,
  CheckCircle2,
  FileCheck,
  ShieldAlert,
  ArrowRight,
  Info,
} from 'lucide-react';
import Link from 'next/link';

export const UploadForm: React.FC = () => {
  const router = useRouter();
  const { addResource } = useResources();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subject, setSubject] = useState('');
  const [semester, setSemester] = useState<Semester>('Semester 4');
  const [resourceType, setResourceType] = useState<ResourceType>('Notes');
  const [academicYear, setAcademicYear] = useState<AcademicYear>('2024-25');
  const [tagsInput, setTagsInput] = useState('');

  // File state
  const [selectedFile, setSelectedFile] = useState<{
    name: string;
    size: string;
    format: FileFormat;
  } | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Validation & status states
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadSuccessResource, setUploadSuccessResource] = useState<{ id: string; title: string } | null>(null);

  const handleFileSelection = (file: File) => {
    // Check file format
    const name = file.name;
    const ext = name.split('.').pop()?.toUpperCase();
    let format: FileFormat = 'PDF';

    if (ext === 'PDF') format = 'PDF';
    else if (ext === 'DOC' || ext === 'DOCX') format = 'DOCX';
    else if (ext === 'ZIP') format = 'ZIP';
    else {
      setErrors((prev) => ({
        ...prev,
        file: 'Supported file types: PDF, DOCX, ZIP only.',
      }));
      return;
    }

    // Size limit: 25MB
    if (file.size > 25 * 1024 * 1024) {
      setErrors((prev) => ({
        ...prev,
        file: 'File size exceeds 25 MB limit.',
      }));
      return;
    }

    const sizeInMB = (file.size / (1024 * 1024)).toFixed(1) + ' MB';
    setSelectedFile({
      name,
      size: sizeInMB,
      format,
    });
    setErrors((prev) => {
      const copy = { ...prev };
      delete copy.file;
      return copy;
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelection(e.dataTransfer.files[0]);
    }
  };

  const validateForm = () => {
    const errs: Record<string, string> = {};

    if (!title.trim()) {
      errs.title = 'Resource title is required.';
    } else if (title.trim().length < 5) {
      errs.title = 'Title must be at least 5 characters.';
    }

    if (!subject) {
      errs.subject = 'Please select a subject.';
    }

    if (!description.trim()) {
      errs.description = 'Please provide a short description or syllabus topics covered.';
    } else if (description.trim().length < 15) {
      errs.description = 'Description should be at least 15 characters to help students.';
    }

    if (!selectedFile) {
      errs.file = 'Please choose or drag a document file to upload.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsUploading(true);
    setUploadProgress(15);

    // Simulated multi-stage progress
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 95) {
          clearInterval(interval);
          return 95;
        }
        return prev + 25;
      });
    }, 200);

    setTimeout(() => {
      clearInterval(interval);
      setUploadProgress(100);

      const parsedTags = tagsInput
        ? tagsInput
            .split(',')
            .map((t) => t.trim().replace(/^#/, ''))
            .filter(Boolean)
        : [resourceType, semester.replace('Semester ', 'Sem ')];

      const newResource = addResource({
        title: title.trim(),
        description: description.trim(),
        subject,
        semester,
        resourceType,
        academicYear,
        fileFormat: selectedFile?.format || 'PDF',
        fileSize: selectedFile?.size || '4.2 MB',
        tags: parsedTags,
        pageCount: Math.floor(Math.random() * 30) + 12,
      });

      setIsUploading(false);
      setUploadSuccessResource({
        id: newResource.id,
        title: newResource.title,
      });
    }, 1200);
  };

  const handleReset = () => {
    setTitle('');
    setDescription('');
    setSubject('');
    setSemester('Semester 4');
    setResourceType('Notes');
    setAcademicYear('2024-25');
    setTagsInput('');
    setSelectedFile(null);
    setErrors({});
    setUploadSuccessResource(null);
  };

  if (uploadSuccessResource) {
    return (
      <div className="bg-white border border-slate-200/90 rounded-3xl p-8 sm:p-12 text-center max-w-xl mx-auto shadow-sm">
        <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4 border border-emerald-200">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <span className="text-xs font-bold uppercase tracking-wider text-teal-600 bg-teal-50 px-3 py-1 rounded-full border border-teal-200/60">
          Upload Complete
        </span>

        <h3 className="text-xl font-bold text-slate-900 mt-3 mb-2">
          Resource Successfully Shared!
        </h3>

        <p className="text-sm text-slate-600 mb-6 leading-relaxed max-w-md mx-auto">
          &quot;{uploadSuccessResource.title}&quot; has been cataloged and is now discoverable by your college peers in Explore.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href={`/resources/${uploadSuccessResource.id}`}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#0a1128] hover:bg-[#15224a] text-white text-sm font-semibold transition-colors flex items-center justify-center gap-2 shadow-sm"
          >
            <span>View Resource Page</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={handleReset}
            className="w-full sm:w-auto"
          >
            Upload Another Document
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Safety & Academic Guidelines Banner */}
      <div className="bg-blue-50/70 border border-blue-200/80 rounded-2xl p-4 flex items-start gap-3.5 text-xs text-blue-900">
        <ShieldAlert className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <p className="font-bold text-blue-950">Student Contributor Guidelines</p>
          <p className="text-blue-800 mt-0.5">
            Share high-quality study materials you have permission to distribute (e.g. solved papers, handwritten lecture notes, lab sheets). Do not upload confidential exams or commercial copyright texts.
          </p>
        </div>
      </div>

      {/* Drag & Drop File Upload Area */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
          Document File <span className="text-rose-500">*</span>
        </label>

        {!selectedFile ? (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-3xl p-8 text-center cursor-pointer transition-all duration-200 ${
              isDragging
                ? 'border-blue-600 bg-blue-50/50 scale-[1.01]'
                : errors.file
                ? 'border-rose-300 bg-rose-50/30 hover:bg-rose-50/50'
                : 'border-slate-300 hover:border-blue-500 hover:bg-slate-50/80 bg-white'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx,.zip"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileSelection(e.target.files[0]);
                }
              }}
            />

            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3 border border-blue-100 shadow-sm">
              <UploadCloud className="w-7 h-7" />
            </div>

            <p className="text-sm font-bold text-slate-800 mb-1">
              Click to select or drag and drop your document
            </p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
              PDF, DOCX, or ZIP files up to 25 MB
            </p>
          </div>
        ) : (
          <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                <FileCheck className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-900 truncate">
                  {selectedFile.name}
                </p>
                <p className="text-[11px] text-slate-500">
                  {selectedFile.format} • {selectedFile.size}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSelectedFile(null)}
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
              title="Remove file"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {errors.file && (
          <p className="text-xs text-rose-600 font-medium mt-1.5 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            {errors.file}
          </p>
        )}
      </div>

      {/* Title Field */}
      <div>
        <div className="flex justify-between items-center mb-1.5">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Resource Title <span className="text-rose-500">*</span>
          </label>
          <span className="text-[11px] text-slate-400 font-mono">
            {title.length}/120
          </span>
        </div>
        <input
          type="text"
          maxLength={120}
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            if (errors.title) setErrors((prev) => ({ ...prev, title: '' }));
          }}
          placeholder="e.g. End-Term 2023 Solved Paper with BCNF Normalization & SQL Queries"
          className={`w-full text-xs sm:text-sm p-3 rounded-xl border bg-white outline-none transition-all ${
            errors.title
              ? 'border-rose-400 focus:ring-2 focus:ring-rose-100'
              : 'border-slate-200/90 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
          }`}
        />
        {errors.title && (
          <p className="text-xs text-rose-600 font-medium mt-1 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            {errors.title}
          </p>
        )}
      </div>

      {/* Grid: Subject & Semester */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Subject */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Subject <span className="text-rose-500">*</span>
          </label>
          <select
            value={subject}
            onChange={(e) => {
              setSubject(e.target.value);
              if (errors.subject) setErrors((prev) => ({ ...prev, subject: '' }));
            }}
            className={`w-full text-xs font-medium p-3 rounded-xl border bg-white outline-none transition-all cursor-pointer ${
              errors.subject
                ? 'border-rose-400 focus:ring-2 focus:ring-rose-100'
                : 'border-slate-200/90 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
            }`}
          >
            <option value="">Select University Subject</option>
            {SUBJECTS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          {errors.subject && (
            <p className="text-xs text-rose-600 font-medium mt-1 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              {errors.subject}
            </p>
          )}
        </div>

        {/* Semester */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Semester <span className="text-rose-500">*</span>
          </label>
          <select
            value={semester}
            onChange={(e) => setSemester(e.target.value as Semester)}
            className="w-full text-xs font-medium p-3 rounded-xl border border-slate-200/90 bg-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all cursor-pointer"
          >
            {SEMESTERS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid: Resource Type & Academic Year */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Resource Type */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Resource Type <span className="text-rose-500">*</span>
          </label>
          <select
            value={resourceType}
            onChange={(e) => setResourceType(e.target.value as ResourceType)}
            className="w-full text-xs font-medium p-3 rounded-xl border border-slate-200/90 bg-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all cursor-pointer"
          >
            {RESOURCE_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        {/* Academic Year */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Academic Year <span className="text-rose-500">*</span>
          </label>
          <select
            value={academicYear}
            onChange={(e) => setAcademicYear(e.target.value as AcademicYear)}
            className="w-full text-xs font-medium p-3 rounded-xl border border-slate-200/90 bg-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all cursor-pointer"
          >
            {ACADEMIC_YEARS.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Description Field */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
          Description & Key Topics Covered <span className="text-rose-500">*</span>
        </label>
        <textarea
          rows={4}
          value={description}
          onChange={(e) => {
            setDescription(e.target.value);
            if (errors.description) setErrors((prev) => ({ ...prev, description: '' }));
          }}
          placeholder="Briefly describe what this document contains (e.g., covers Unit 3 & 4, includes tree rotation step-by-step proofs and university exam marks breakdown)..."
          className={`w-full text-xs sm:text-sm p-3 rounded-xl border bg-white outline-none transition-all resize-y ${
            errors.description
              ? 'border-rose-400 focus:ring-2 focus:ring-rose-100'
              : 'border-slate-200/90 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
          }`}
        />
        {errors.description && (
          <p className="text-xs text-rose-600 font-medium mt-1 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            {errors.description}
          </p>
        )}
      </div>

      {/* Tags Input */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
          Tags / Keywords (Optional)
        </label>
        <input
          type="text"
          value={tagsInput}
          onChange={(e) => setTagsInput(e.target.value)}
          placeholder="e.g. EndSem, Solved, Trees, DynamicProgramming (comma-separated)"
          className="w-full text-xs sm:text-sm p-3 rounded-xl border border-slate-200/90 bg-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
        />
        <p className="text-[11px] text-slate-400 mt-1">
          Separate tags with commas to make your resource easy to search.
        </p>
      </div>

      {/* Upload Progress Indicator when uploading */}
      {isUploading && (
        <div className="bg-blue-50/80 p-4 rounded-2xl border border-blue-200/80 space-y-2">
          <div className="flex justify-between text-xs font-semibold text-blue-900">
            <span>Validating & Cataloging Resource...</span>
            <span>{uploadProgress}%</span>
          </div>
          <div className="w-full h-2 bg-blue-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-600 to-teal-400 rounded-full transition-all duration-200"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
        <Button
          type="button"
          variant="outline"
          size="md"
          onClick={() => router.push('/')}
          disabled={isUploading}
        >
          Cancel
        </Button>

        <Button
          type="submit"
          variant="primary"
          size="md"
          isLoading={isUploading}
          leftIcon={<UploadCloud className="w-4 h-4" />}
        >
          Publish Resource
        </Button>
      </div>
    </form>
  );
};
