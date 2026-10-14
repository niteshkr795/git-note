'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Modal } from '@/components/Modal';
import { Button } from '@/components/ui/Button';
import {
  Camera,
  UploadCloud,
  Sparkles,
  Link as LinkIcon,
  Trash2,
  Check,
  AlertCircle,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export const PRESET_AVATARS = [
  {
    id: 'preset-1',
    label: 'Student Developer',
    url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 'preset-2',
    label: 'Engineering Student',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 'preset-3',
    label: 'Tech Creator',
    url: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 'preset-4',
    label: 'Computer Science Lead',
    url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 'preset-5',
    label: 'Researcher',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 'preset-6',
    label: 'Campus Scholar',
    url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 'preset-7',
    label: 'Open Source Contributor',
    url: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 'preset-8',
    label: 'AI & Data Explorer',
    url: 'https://images.unsplash.com/photo-1628157582853-a796fa650a6a?w=400&auto=format&fit=crop&q=80',
  },
];

interface EditAvatarModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentAvatar: string;
  displayName: string;
  onSaveAvatar: (newAvatarUrl: string) => Promise<void>;
}

export const EditAvatarModal: React.FC<EditAvatarModalProps> = ({
  isOpen,
  onClose,
  currentAvatar,
  displayName,
  onSaveAvatar,
}) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'upload' | 'presets' | 'url'>('upload');
  const [selectedAvatar, setSelectedAvatar] = useState<string>(currentAvatar);
  const [customUrlInput, setCustomUrlInput] = useState<string>('');
  const [urlPreviewError, setUrlPreviewError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync current avatar when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedAvatar(currentAvatar);
      setUrlPreviewError(null);
      setCustomUrlInput('');
    }
  }, [isOpen, currentAvatar]);

  // Client-side image crop to 1:1 square & upload to Supabase storage for a lightweight public URL
  const processImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file (PNG, JPG, WEBP, GIF).');
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      alert('Image file is too large. Please select an image under 8 MB.');
      return;
    }

    setIsProcessing(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const maxDim = 400; // Optimal 400x400 square avatar
          canvas.width = maxDim;
          canvas.height = maxDim;
          const ctx = canvas.getContext('2d');

          if (!ctx) {
            setIsProcessing(false);
            return;
          }

          // Center crop to 1:1 aspect ratio
          const minSide = Math.min(img.width, img.height);
          const startX = (img.width - minSide) / 2;
          const startY = (img.height - minSide) / 2;

          ctx.drawImage(img, startX, startY, minSide, minSide, 0, 0, maxDim, maxDim);

          canvas.toBlob(async (blob) => {
            if (!blob) {
              setIsProcessing(false);
              return;
            }

            // If user is authenticated, upload to Supabase 'avatars' storage bucket
            if (user && isSupabaseConfigured) {
              try {
                const filePath = `${user.id}/avatar-${Date.now()}.jpg`;
                const { data, error } = await supabase.storage
                  .from('avatars')
                  .upload(filePath, blob, {
                    contentType: 'image/jpeg',
                    upsert: true,
                  });

                if (error) {
                  console.warn('[GitNote] Storage upload error:', error.message);
                  alert(
                    `Could not upload to cloud storage (${error.message}). Please create the 'avatars' public bucket in Supabase or choose one of our verified student presets.`
                  );
                  setIsProcessing(false);
                  return;
                }

                const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(data.path);
                setSelectedAvatar(urlData.publicUrl);
              } catch (uploadErr: any) {
                console.error('[GitNote] Upload error:', uploadErr);
                alert('Upload error: ' + (uploadErr?.message || 'Failed to upload photo.'));
              } finally {
                setIsProcessing(false);
              }
            } else {
              // Guest/demo preview: use thumbnail (max 150px)
              const thumbCanvas = document.createElement('canvas');
              thumbCanvas.width = 150;
              thumbCanvas.height = 150;
              const tCtx = thumbCanvas.getContext('2d');
              if (tCtx) {
                tCtx.drawImage(canvas, 0, 0, 150, 150);
                setSelectedAvatar(thumbCanvas.toDataURL('image/jpeg', 0.6));
              }
              setIsProcessing(false);
            }
          }, 'image/jpeg', 0.85);
        } catch (err) {
          console.error(err);
          setIsProcessing(false);
        }
      };
      img.onerror = () => {
        setIsProcessing(false);
        alert('Could not read image file.');
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleApplyUrl = () => {
    if (!customUrlInput.trim()) return;
    try {
      new URL(customUrlInput.trim());
      setSelectedAvatar(customUrlInput.trim());
      setUrlPreviewError(null);
    } catch {
      setUrlPreviewError('Please enter a valid HTTP or HTTPS image URL.');
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSaveAvatar(selectedAvatar);
      onClose();
    } catch (err: any) {
      console.error('Error saving avatar:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveAvatar = () => {
    setSelectedAvatar('');
  };

  const isChanged = selectedAvatar !== currentAvatar;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Profile Picture"
      maxWidth="lg"
    >
      <div className="space-y-6">
        {/* Live Preview Bar */}
        <div className="bg-[#faf8ff] border border-[#e2e8f0] rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative shrink-0">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-[#4f46e5] via-[#7c3aed] to-[#38bdf8] flex items-center justify-center text-2xl font-black text-white shadow-md ring-4 ring-indigo-100 overflow-hidden">
                {selectedAvatar ? (
                  <img
                    src={selectedAvatar}
                    alt={displayName}
                    className="w-full h-full object-cover"
                    onError={() => {
                      setUrlPreviewError('Failed to load image from this URL.');
                    }}
                  />
                ) : (
                  <span>{(displayName || 'S').charAt(0).toUpperCase()}</span>
                )}
              </div>
              <div
                className="absolute -bottom-1 -right-1 bg-[#10b981] text-white p-1 rounded-lg shadow-sm"
                title="Verified Student"
              >
                <ShieldCheck className="w-4 h-4" />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-[#0f172a]">{displayName}</span>
                {isChanged && (
                  <span className="text-[10px] font-semibold bg-indigo-50 text-indigo-600 border border-indigo-200 px-2 py-0.5 rounded-full">
                    Previewing New Photo
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {selectedAvatar ? 'Square photo formatted for GitNote profile card' : 'Default initials avatar'}
              </p>
            </div>
          </div>

          {selectedAvatar && (
            <button
              type="button"
              onClick={handleRemoveAvatar}
              className="text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100/80 border border-rose-200 px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Remove Photo</span>
            </button>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-[#e2e8f0] pb-2">
          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'upload'
                ? 'bg-[#4f46e5] text-white shadow-xs'
                : 'text-slate-600 hover:text-[#0f172a] hover:bg-slate-100'
            }`}
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload Image</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('presets')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'presets'
                ? 'bg-[#4f46e5] text-white shadow-xs'
                : 'text-slate-600 hover:text-[#0f172a] hover:bg-slate-100'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Student Presets</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('url')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'url'
                ? 'bg-[#4f46e5] text-white shadow-xs'
                : 'text-slate-600 hover:text-[#0f172a] hover:bg-slate-100'
            }`}
          >
            <LinkIcon className="w-4 h-4" />
            <span>Image URL</span>
          </button>
        </div>

        {/* Tab 1: File Upload */}
        {activeTab === 'upload' && (
          <div className="space-y-4">
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                isDragging
                  ? 'border-[#4f46e5] bg-indigo-50/50 scale-[1.01]'
                  : 'border-[#cbd5e1] hover:border-[#818cf8] hover:bg-[#faf8ff]'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                onChange={handleFileChange}
                className="hidden"
              />

              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-[#4f46e5] flex items-center justify-center mb-3">
                {isProcessing ? (
                  <RefreshCw className="w-6 h-6 animate-spin" />
                ) : (
                  <Camera className="w-6 h-6" />
                )}
              </div>

              <p className="text-xs sm:text-sm font-bold text-[#0f172a]">
                {isProcessing ? 'Optimizing photo...' : 'Click to upload or drag & drop'}
              </p>
              <p className="text-xs text-slate-500 mt-1 max-w-sm">
                JPEG, PNG, WEBP or GIF. Photos will be automatically centered and scaled for best display.
              </p>
              <div className="mt-4">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  leftIcon={<UploadCloud className="w-3.5 h-3.5" />}
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                >
                  Choose From Device
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Presets */}
        {activeTab === 'presets' && (
          <div className="space-y-3">
            <p className="text-xs text-slate-500">
              Pick one of our verified campus student portraits:
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-h-64 overflow-y-auto p-1">
              {PRESET_AVATARS.map((preset) => {
                const isSelected = selectedAvatar === preset.url;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => setSelectedAvatar(preset.url)}
                    className={`group relative rounded-2xl overflow-hidden border-2 p-1.5 flex flex-col items-center gap-1.5 transition-all text-left cursor-pointer ${
                      isSelected
                        ? 'border-[#4f46e5] bg-indigo-50/70 shadow-xs'
                        : 'border-[#e2e8f0] hover:border-[#cbd5e1] hover:bg-slate-50'
                    }`}
                  >
                    <div className="w-16 h-16 rounded-xl overflow-hidden relative shadow-2xs">
                      <img
                        src={preset.url}
                        alt={preset.label}
                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                      />
                      {isSelected && (
                        <div className="absolute inset-0 bg-[#4f46e5]/40 flex items-center justify-center">
                          <div className="bg-white text-[#4f46e5] rounded-full p-1 shadow-sm">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </div>
                        </div>
                      )}
                    </div>
                    <span className="text-[11px] font-medium text-slate-700 truncate w-full text-center">
                      {preset.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 3: Direct URL */}
        {activeTab === 'url' && (
          <div className="space-y-3">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Paste Image URL
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                placeholder="https://example.com/photo.jpg"
                value={customUrlInput}
                onChange={(e) => {
                  setCustomUrlInput(e.target.value);
                  setUrlPreviewError(null);
                }}
                className="flex-1 text-xs p-3 rounded-xl border border-[#cbd5e1] bg-white outline-none focus:border-[#4f46e5] focus:ring-2 focus:ring-indigo-100"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleApplyUrl}
              >
                Apply
              </Button>
            </div>
            {urlPreviewError && (
              <p className="text-xs text-rose-600 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{urlPreviewError}</span>
              </p>
            )}
            <p className="text-[11px] text-slate-400">
              Supports direct URLs from GitHub avatars, Unsplash, Gravatar, or personal hosting.
            </p>
          </div>
        )}

        {/* Modal Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-4 border-t border-[#f1f5f9]">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={handleSave}
            isLoading={isSaving}
          >
            Save Profile Photo
          </Button>
        </div>
      </div>
    </Modal>
  );
};
