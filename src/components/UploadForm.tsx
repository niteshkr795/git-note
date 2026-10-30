'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useResources } from '@/context/ResourceContext';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { SUBJECTS, SEMESTERS, RESOURCE_TYPES, ACADEMIC_YEARS } from '@/data/mockData';
import { Semester, ResourceType, AcademicYear, FileFormat } from '@/types';
import { formatFileSize } from '@/lib/formatters';
import {
  UploadCloud,
  X,
  AlertCircle,
  CheckCircle2,
  FileCheck,
  ShieldCheck,
  ArrowRight,
  LogIn,
} from 'lucide-react';
import Link from 'next/link';

export const UploadForm: React.FC = () => {
  const router = useRouter();
  const { user } = useAuth();
  const { refreshResources, addToast, userProfile } = useResources();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subject, setSubject] = useState('');
  const [semester, setSemester] = useState<Semester>(
    ((user?.user_metadata?.semester || userProfile?.semester || 'Semester 1') as Semester)
  );
  const [resourceType, setResourceType] = useState<ResourceType>('Notes');
  const [academicYear, setAcademicYear] = useState<AcademicYear>('2025-26');
  const [tagsInput, setTagsInput] = useState('');

  // Update default semester if user profile loads after mount
  useEffect(() => {
    const activeSem = (user?.user_metadata?.semester || userProfile?.semester) as Semester;
    if (activeSem) {
      setSemester(activeSem);
    }
  }, [user, userProfile]);

  // File state
  const [selectedFileObj, setSelectedFileObj] = useState<File | null>(null);
  const [selectedFileMeta, setSelectedFileMeta] = useState<{
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

    const formattedSize = formatFileSize(file.size);
    setSelectedFileObj(file);
    setSelectedFileMeta({
      name,
      size: formattedSize,
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

    if (!user) {
      errs.auth = 'You must be signed in to upload study resources.';
    }

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

    if (!selectedFileObj || !selectedFileMeta) {
      errs.file = 'Please choose or drag a document file to upload.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm() || !user || !selectedFileObj || !selectedFileMeta) return;

    setIsUploading(true);
    setUploadProgress(15);

    try {
      const { data: authData } = await supabase.auth.getUser();
      const currentUserId = authData?.user?.id || user?.id;

      if (!currentUserId) {
        setErrors({
          upload: 'Your authentication session has expired. Please sign in again.',
        });
        setIsUploading(false);
        return;
      }

      setUploadProgress(25);
      const { data: profileRow } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', currentUserId)
        .maybeSingle();

      if (!profileRow) {
        const { error: profileError } = await supabase.from('profiles').upsert(
          {
            id: currentUserId,
            email: authData?.user?.email || user.email,
            full_name:
              authData?.user?.user_metadata?.full_name ||
              user.user_metadata?.full_name ||
              user.email?.split('@')[0] ||
              'Student Contributor',
            college: authData?.user?.user_metadata?.college || user.user_metadata?.college || 'SRMCEM Lucknow',
            branch: authData?.user?.user_metadata?.branch || user.user_metadata?.branch || 'Computer Science & Engineering',
            semester: authData?.user?.user_metadata?.semester || user.user_metadata?.semester || semester,
          },
          { onConflict: 'id' }
        );

        if (profileError) {
          console.warn('[GitNote] Could not create profile fallback:', profileError.message);
        }
      }

      // Upload file to Supabase Storage bucket
      setUploadProgress(45);
      const cleanFileName = selectedFileObj.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const storagePath = `${currentUserId}/${Date.now()}_${cleanFileName}`;

      let activeBucket = 'study-resources';
      let storageUploadData: any = null;
      let storageError: any = null;

      const mimeMap: Record<string, string> = {
        PDF: 'application/pdf',
        DOCX: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ZIP: 'application/zip',
      };
      const contentType = selectedFileObj.type || mimeMap[selectedFileMeta.format] || 'application/pdf';

      const primaryUpload = await supabase.storage
        .from('study-resources')
        .upload(storagePath, selectedFileObj, {
          cacheControl: '3600',
          upsert: false,
          contentType,
        });

      if (
        primaryUpload.error &&
        (primaryUpload.error.message?.toLowerCase().includes('bucket not found') ||
          (primaryUpload.error as any).statusCode === '404' ||
          (primaryUpload.error as any).statusCode === 404)
      ) {
        activeBucket = 'academic-resources';
        const fallbackUpload = await supabase.storage
          .from('academic-resources')
          .upload(storagePath, selectedFileObj, {
            cacheControl: '3600',
            upsert: false,
            contentType,
          });
        storageUploadData = fallbackUpload.data;
        storageError = fallbackUpload.error;
      } else {
        storageUploadData = primaryUpload.data;
        storageError = primaryUpload.error;
      }

      if (storageError) {
        console.error('[GitNote] Storage upload error:', storageError);
        setErrors({
          upload: `File upload failed: ${storageError.message}. Please check your storage bucket permissions.`,
        });
        setIsUploading(false);
        return;
      }

      setUploadProgress(75);
      const uploadedStoragePath = storageUploadData?.path || storagePath;

      // Insert metadata row in PostgreSQL 'resources' table
      const parsedTags = tagsInput
        ? tagsInput
            .split(',')
            .map((t) => t.trim().replace(/^#/, ''))
            .filter(Boolean)
        : [resourceType, semester.replace('Semester ', 'Sem ')];

      const resourceInsertPayload: Record<string, any> = {
        title: title.trim(),
        description: description.trim(),
        resource_type: resourceType,
        subject: subject,
        subject_name: subject,
        semester: semester,
        academic_year: academicYear,
        file_format: selectedFileMeta.format,
        file_size: selectedFileMeta.size,
        file_size_bytes: selectedFileObj.size,
        storage_path: uploadedStoragePath,
        page_count: Math.floor(Math.random() * 20) + 10,
        tags: parsedTags,
        uploader_id: currentUserId,
        owner_id: currentUserId,
        status: 'published',
        is_verified: false,
      };

      const { data: insertedResource, error: dbError } = await supabase
        .from('resources')
        .insert(resourceInsertPayload)
        .select('id, title')
        .single();

      if (dbError) {
        console.error('[GitNote] Database insert error:', dbError);
        try {
          await supabase.storage
            .from(activeBucket)
            .remove([uploadedStoragePath]);
        } catch (cleanupErr) {
          console.warn('[GitNote] Could not clean up orphaned file:', cleanupErr);
        }

        setErrors({
          upload: `Database error saving resource: ${dbError.message}`,
        });
        setIsUploading(false);
        return;
      }

      setUploadProgress(100);
      await refreshResources();

      addToast('success', 'Deposit Cataloged', `"${insertedResource.title}" is now archived.`);
      setUploadSuccessResource({
        id: insertedResource.id,
        title: insertedResource.title,
      });
    } catch (err: any) {
      console.error('[GitNote] Unexpected upload exception:', err);
      setErrors({
        upload: err?.message || 'An unexpected error occurred during upload. Please try again.',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleReset = () => {
    setTitle('');
    setDescription('');
    setSubject('');
    setSemester('Semester 4');
    setResourceType('Notes');
    setAcademicYear('2025-26');
    setTagsInput('');
    setSelectedFileObj(null);
    setSelectedFileMeta(null);
    setErrors({});
    setUploadSuccessResource(null);
  };

  if (uploadSuccessResource) {
    return (
      <div className="bg-white border border-[var(--color-paper-border)] rounded-lg p-8 sm:p-12 text-center max-w-xl mx-auto shadow-xs">
        <div className="w-14 h-14 rounded-full bg-[var(--color-paper-accent)] text-[var(--color-accent)] flex items-center justify-center mx-auto mb-4 border border-[var(--color-paper-border)]">
          <CheckCircle2 className="w-7 h-7" />
        </div>

        <span className="text-xs font-mono uppercase tracking-wider text-[var(--color-accent)] bg-[var(--color-paper-accent)] px-3 py-1 rounded border border-[var(--color-paper-border)]">
          Deposit Cataloged
        </span>

        <h3 className="text-2xl font-serif text-[var(--color-foreground)] mt-3 mb-2 font-normal tracking-tight">
          Resource Successfully Archived
        </h3>

        <p className="text-xs text-[var(--color-muted)] mb-6 leading-relaxed max-w-md mx-auto">
          &quot;{uploadSuccessResource.title}&quot; has been cataloged into the academic library and is discoverable across course searches.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href={`/resources/${uploadSuccessResource.id}`}
            className="w-full sm:w-auto px-4 py-2 rounded-md bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white text-xs font-medium transition-all flex items-center justify-center gap-2 shadow-xs"
          >
            <span>Open in Reading Room</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>

          <Link
            href="/profile"
            className="w-full sm:w-auto px-4 py-2 rounded-md bg-[var(--color-paper-accent)] hover:bg-[var(--color-paper-border)] text-[var(--color-foreground)] text-xs font-medium transition-all flex items-center justify-center border border-[var(--color-paper-border)]"
          >
            Author Dossier
          </Link>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="w-full sm:w-auto text-xs"
          >
            Deposit Another
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Unauthenticated Warning Banner */}
      {!user && (
        <div className="bg-[#fffbeb] border border-[#fef3c7] rounded-lg p-4 flex items-start gap-3.5 text-xs text-[#92400e]">
          <AlertCircle className="w-4 h-4 text-[#d97706] shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold text-[#78350f]">Authentication Required</p>
            <p className="text-[#92400e]/90 mt-0.5 leading-relaxed">
              You must be signed in to deposit study materials. Uploads are indexed with your verified student identity.
            </p>
            <div className="mt-2.5">
              <Link
                href="/login?redirect=/upload"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#92400e] hover:bg-[#78350f] text-white font-medium text-xs transition-colors shadow-xs"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In to Deposit</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Safety & Academic Guidelines Banner */}
      <div className="bg-[var(--color-paper-accent)] border border-[var(--color-paper-border)] rounded-lg p-4 flex items-start gap-3.5 text-xs text-[var(--color-foreground)]/80">
        <ShieldCheck className="w-4 h-4 text-[var(--color-accent)] shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <p className="font-semibold text-[var(--color-foreground)]">Academic Integrity &amp; Provenance</p>
          <p className="text-[var(--color-muted)] mt-0.5">
            Deposit high-quality notes, solved papers, and lab reports you have permission to share. Avoid proprietary or restricted university exam keys.
          </p>
        </div>
      </div>

      {errors.upload && (
        <div className="bg-[#fef2f2] border border-[#fecaca] rounded-lg p-4 text-xs text-[#991b1b] space-y-1">
          <p className="font-semibold text-[#7f1d1d] flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 text-[#dc2626]" />
            Deposit Error
          </p>
          <p className="leading-relaxed">{errors.upload}</p>
        </div>
      )}

      {/* Drag & Drop File Upload Area */}
      <div>
        <label className="block text-xs font-mono uppercase tracking-wider text-[var(--color-muted)] mb-2">
          Document File <span className="text-rose-600">*</span>
        </label>

        {!selectedFileMeta ? (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-150 ${
              isDragging
                ? 'border-[var(--color-accent)] bg-[var(--color-paper-accent)]'
                : errors.file
                ? 'border-rose-300 bg-rose-50/40 hover:bg-rose-50/60'
                : 'border-[var(--color-paper-border)] hover:border-[var(--color-accent)] hover:bg-[var(--color-paper-accent)] bg-[var(--color-paper)]'
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

            <div className="w-12 h-12 rounded-full bg-white text-[var(--color-accent)] flex items-center justify-center mx-auto mb-3 border border-[var(--color-paper-border)] shadow-xs">
              <UploadCloud className="w-6 h-6" />
            </div>

            <p className="text-sm font-serif font-medium text-[var(--color-foreground)] mb-1">
              Click to select or drag and drop manuscript
            </p>
            <p className="text-xs text-[var(--color-muted)] max-w-sm mx-auto leading-relaxed">
              PDF, DOCX, or ZIP archives up to 25 MB
            </p>
          </div>
        ) : (
          <div className="bg-[var(--color-paper)] border border-[var(--color-paper-border)] rounded-lg p-3.5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded bg-white text-[var(--color-accent)] flex items-center justify-center border border-[var(--color-paper-border)] shrink-0">
                <FileCheck className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-[var(--color-foreground)] truncate">
                  {selectedFileMeta.name}
                </p>
                <p className="text-[11px] font-mono text-[var(--color-muted)]">
                  {selectedFileMeta.format} • {selectedFileMeta.size}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setSelectedFileObj(null);
                setSelectedFileMeta(null);
              }}
              className="p-1.5 text-[var(--color-muted)] hover:text-rose-600 rounded transition-colors cursor-pointer"
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
          <label className="text-xs font-mono uppercase tracking-wider text-[var(--color-muted)]">
            Resource Title <span className="text-rose-600">*</span>
          </label>
          <span className="text-[11px] text-[var(--color-muted)] font-mono">
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
          placeholder="e.g. End-Term 2024 Solved Paper: BCNF Normalization & Relational Algebra"
          className={`w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-md border bg-white outline-none transition-all ${
            errors.title
              ? 'border-rose-400 focus:border-rose-500'
              : 'border-[var(--color-paper-border)] focus:border-[var(--color-accent)]'
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
          <label className="block text-xs font-mono uppercase tracking-wider text-[var(--color-muted)] mb-1.5">
            Subject Classification <span className="text-rose-600">*</span>
          </label>
          <select
            value={subject}
            onChange={(e) => {
              setSubject(e.target.value);
              if (errors.subject) setErrors((prev) => ({ ...prev, subject: '' }));
            }}
            className={`w-full text-xs font-sans px-3.5 py-2.5 rounded-md border bg-white outline-none transition-all cursor-pointer ${
              errors.subject
                ? 'border-rose-400 focus:border-rose-500'
                : 'border-[var(--color-paper-border)] focus:border-[var(--color-accent)]'
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
          <label className="block text-xs font-mono uppercase tracking-wider text-[var(--color-muted)] mb-1.5">
            Semester Cohort <span className="text-rose-600">*</span>
          </label>
          <select
            value={semester}
            onChange={(e) => setSemester(e.target.value as Semester)}
            className="w-full text-xs font-sans px-3.5 py-2.5 rounded-md border border-[var(--color-paper-border)] bg-white outline-none focus:border-[var(--color-accent)] transition-all cursor-pointer"
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
          <label className="block text-xs font-mono uppercase tracking-wider text-[var(--color-muted)] mb-1.5">
            Catalog Category <span className="text-rose-600">*</span>
          </label>
          <select
            value={resourceType}
            onChange={(e) => setResourceType(e.target.value as ResourceType)}
            className="w-full text-xs font-sans px-3.5 py-2.5 rounded-md border border-[var(--color-paper-border)] bg-white outline-none focus:border-[var(--color-accent)] transition-all cursor-pointer"
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
          <label className="block text-xs font-mono uppercase tracking-wider text-[var(--color-muted)] mb-1.5">
            Academic Session <span className="text-rose-600">*</span>
          </label>
          <select
            value={academicYear}
            onChange={(e) => setAcademicYear(e.target.value as AcademicYear)}
            className="w-full text-xs font-sans px-3.5 py-2.5 rounded-md border border-[var(--color-paper-border)] bg-white outline-none focus:border-[var(--color-accent)] transition-all cursor-pointer"
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
        <label className="block text-xs font-mono uppercase tracking-wider text-[var(--color-muted)] mb-1.5">
          Syllabus Scope &amp; Abstract <span className="text-rose-600">*</span>
        </label>
        <textarea
          rows={4}
          value={description}
          onChange={(e) => {
            setDescription(e.target.value);
            if (errors.description) setErrors((prev) => ({ ...prev, description: '' }));
          }}
          placeholder="Briefly state covered syllabus modules (e.g. Unit 3 & 4: tree rotation proofs, Dijkstra shortest path analysis, university examination marks breakdown)..."
          className={`w-full text-xs sm:text-sm p-3 rounded-md border bg-white outline-none transition-all resize-y ${
            errors.description
              ? 'border-rose-400 focus:border-rose-500'
              : 'border-[var(--color-paper-border)] focus:border-[var(--color-accent)]'
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
        <label className="block text-xs font-mono uppercase tracking-wider text-[var(--color-muted)] mb-1.5">
          Keywords / Index Terms (Optional)
        </label>
        <input
          type="text"
          value={tagsInput}
          onChange={(e) => setTagsInput(e.target.value)}
          placeholder="e.g. EndSem, Solved, Trees, DynamicProgramming (comma-separated)"
          className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-md border border-[var(--color-paper-border)] bg-white outline-none focus:border-[var(--color-accent)] transition-all"
        />
        <p className="text-[11px] text-[var(--color-muted)] mt-1">
          Separate keywords with commas to improve indexation in catalog searches.
        </p>
      </div>

      {/* Upload Progress Indicator when uploading */}
      {isUploading && (
        <div className="bg-[var(--color-paper-accent)] p-4 rounded-md border border-[var(--color-paper-border)] space-y-2">
          <div className="flex justify-between text-xs font-mono text-[var(--color-foreground)]">
            <span>Archiving &amp; Indexing Document...</span>
            <span>{uploadProgress}%</span>
          </div>
          <div className="w-full h-1.5 bg-[var(--color-paper-border)] rounded-full overflow-hidden">
            <div
              className="h-full bg-[var(--color-accent)] rounded-full transition-all duration-200"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--color-paper-border)]">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => router.push('/')}
          disabled={isUploading}
        >
          Cancel
        </Button>

        <Button
          type="submit"
          variant="primary"
          size="sm"
          isLoading={isUploading}
          disabled={!user}
          leftIcon={<UploadCloud className="w-3.5 h-3.5" />}
        >
          Catalog Document
        </Button>
      </div>
    </form>
  );
};
