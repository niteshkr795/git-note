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
  Shuffle,
  Users,
  Smile,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export interface PresetAvatar {
  id: string;
  category: 'men' | 'boys' | 'girls';
  label: string;
  url: string;
}

export const PRESET_AVATARS: PresetAvatar[] = [
  // Men (Adult Men / Mentors / Seniors)
  {
    id: 'preset-men-1',
    category: 'men',
    label: 'Senior Mentor',
    url: '/avatars/men-1.svg',
  },
  {
    id: 'preset-men-2',
    category: 'men',
    label: 'Tech Lead',
    url: '/avatars/men-2.svg',
  },
  {
    id: 'preset-men-3',
    category: 'men',
    label: 'Code Architect',
    url: '/avatars/men-3.svg',
  },
  {
    id: 'preset-men-4',
    category: 'men',
    label: 'Systems Specialist',
    url: '/avatars/men-4.svg',
  },
  {
    id: 'preset-men-5',
    category: 'men',
    label: 'Research Scholar',
    url: '/avatars/men-5.svg',
  },
  {
    id: 'preset-men-6',
    category: 'men',
    label: 'Data Engineer',
    url: '/avatars/men-6.svg',
  },
  {
    id: 'preset-men-7',
    category: 'men',
    label: 'DevOps Lead',
    url: '/avatars/men-7.svg',
  },
  {
    id: 'preset-men-8',
    category: 'men',
    label: 'Project Manager',
    url: '/avatars/men-8.svg',
  },

  // Boys (Students / College Guys / Hackers)
  {
    id: 'preset-boy-1',
    category: 'boys',
    label: 'Campus Coder',
    url: '/avatars/boy-1.svg',
  },
  {
    id: 'preset-boy-2',
    category: 'boys',
    label: 'Algorist Boy',
    url: '/avatars/boy-2.svg',
  },
  {
    id: 'preset-boy-3',
    category: 'boys',
    label: 'CS Student',
    url: '/avatars/boy-3.svg',
  },
  {
    id: 'preset-boy-4',
    category: 'boys',
    label: 'Hacker Boy',
    url: '/avatars/boy-4.svg',
  },
  {
    id: 'preset-boy-5',
    category: 'boys',
    label: 'Fullstack Boy',
    url: '/avatars/boy-5.svg',
  },
  {
    id: 'preset-boy-6',
    category: 'boys',
    label: 'Freshman Boy',
    url: '/avatars/boy-6.svg',
  },
  {
    id: 'preset-boy-7',
    category: 'boys',
    label: 'Open Sourcer',
    url: '/avatars/boy-7.svg',
  },
  {
    id: 'preset-boy-8',
    category: 'boys',
    label: 'Gamer Coder',
    url: '/avatars/boy-8.svg',
  },

  // Girls (Students / Women Tech Leads)
  {
    id: 'preset-girl-1',
    category: 'girls',
    label: 'Student Scholar',
    url: '/avatars/girl-1.svg',
  },
  {
    id: 'preset-girl-2',
    category: 'girls',
    label: 'UI/UX Designer',
    url: '/avatars/girl-2.svg',
  },
  {
    id: 'preset-girl-3',
    category: 'girls',
    label: 'Frontend Specialist',
    url: '/avatars/girl-3.svg',
  },
  {
    id: 'preset-girl-4',
    category: 'girls',
    label: 'Data Scientist',
    url: '/avatars/girl-4.svg',
  },
  {
    id: 'preset-girl-5',
    category: 'girls',
    label: 'Robotics Lead',
    url: '/avatars/girl-5.svg',
  },
  {
    id: 'preset-girl-6',
    category: 'girls',
    label: 'Cloud Architect',
    url: '/avatars/girl-6.svg',
  },
  {
    id: 'preset-girl-7',
    category: 'girls',
    label: 'AI Researcher',
    url: '/avatars/girl-7.svg',
  },
  {
    id: 'preset-girl-8',
    category: 'girls',
    label: 'Hackathon Champ',
    url: '/avatars/girl-8.svg',
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
  const [activeTab, setActiveTab] = useState<'presets' | 'generator' | 'upload' | 'url'>('presets');
  const [presetFilter, setPresetFilter] = useState<'all' | 'men' | 'boys' | 'girls'>('all');
  const [selectedAvatar, setSelectedAvatar] = useState<string>(currentAvatar);
  const [customUrlInput, setCustomUrlInput] = useState<string>('');
  const [urlPreviewError, setUrlPreviewError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cartoon Generator state
  const [genCategory, setGenCategory] = useState<'men' | 'boys' | 'girls'>('boys');
  const [genSeed, setGenSeed] = useState<string>('');

  // Sync current avatar when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedAvatar(currentAvatar);
      setUrlPreviewError(null);
      setCustomUrlInput('');
      setGenSeed(displayName || `Student-${Math.floor(Math.random() * 1000)}`);
    }
  }, [isOpen, currentAvatar, displayName]);

  // Compute live generated cartoon URL
  const getGeneratedAvatarUrl = (category: 'men' | 'boys' | 'girls', seed: string) => {
    const safeSeed = encodeURIComponent(seed.trim() || 'GitNoteStudent');
    if (category === 'men') {
      return `https://api.dicebear.com/9.x/avataaars/svg?seed=${safeSeed}&facialHairProbability=100&clothing=blazerAndShirt,collarAndSweater,shirtCrewNeck`;
    }
    if (category === 'girls') {
      return `https://api.dicebear.com/9.x/avataaars/svg?seed=${safeSeed}&facialHairProbability=0&top=longButNotTooLong,straight02,curly,bun,bob,straightAndStrand,bigHair,curvy`;
    }
    // boys
    return `https://api.dicebear.com/9.x/avataaars/svg?seed=${safeSeed}&facialHairProbability=0&clothing=hoodie,graphicShirt,shirtCrewNeck`;
  };

  const currentGeneratedUrl = getGeneratedAvatarUrl(genCategory, genSeed);

  // Filter presets based on selected category
  const filteredPresets = PRESET_AVATARS.filter((preset) => {
    if (presetFilter === 'all') return true;
    return preset.category === presetFilter;
  });

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
                    `Could not upload to cloud storage (${error.message}). Please choose one of our cartoon avatar presets.`
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

  const handleRandomizeSeed = () => {
    const randomAdjectives = ['Quick', 'Bright', 'Clever', 'Crypto', 'Cyber', 'Neon', 'Astro', 'Cosmic', 'Hyper', 'Sonic'];
    const randomNouns = ['Coder', 'Hacker', 'Builder', 'Engineer', 'Dev', 'Scholar', 'Guru', 'Wizard', 'Ace', 'Pixel'];
    const adj = randomAdjectives[Math.floor(Math.random() * randomAdjectives.length)];
    const noun = randomNouns[Math.floor(Math.random() * randomNouns.length)];
    const num = Math.floor(Math.random() * 999) + 1;
    setGenSeed(`${adj}${noun}${num}`);
  };

  const isChanged = selectedAvatar !== currentAvatar;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Choose Cartoon Avatar"
      maxWidth="lg"
    >
      <div className="space-y-6">
        {/* Live Preview Bar */}
        <div className="bg-[#faf8ff] border border-[#e2e8f0] rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative shrink-0">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-[#4f46e5] via-[#7c3aed] to-[#38bdf8] p-1 flex items-center justify-center shadow-md ring-4 ring-indigo-100 overflow-hidden">
                {selectedAvatar ? (
                  <img
                    src={selectedAvatar}
                    alt={displayName}
                    className="w-full h-full object-contain rounded-xl"
                    onError={() => {
                      setUrlPreviewError('Failed to load image from this URL.');
                    }}
                  />
                ) : (
                  <span className="text-2xl font-black text-white">
                    {(displayName || 'S').charAt(0).toUpperCase()}
                  </span>
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
                    Previewing New Avatar
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {selectedAvatar ? 'Cartoon avatar formatted for your GitNote profile' : 'Default initials avatar'}
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
              <span>Reset Avatar</span>
            </button>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap items-center gap-2 border-b border-[#e2e8f0] pb-2">
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
            <span>Cartoon Avatars</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('generator')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'generator'
                ? 'bg-[#4f46e5] text-white shadow-xs'
                : 'text-slate-600 hover:text-[#0f172a] hover:bg-slate-100'
            }`}
          >
            <Shuffle className="w-4 h-4" />
            <span>Generate Cartoon</span>
          </button>

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

        {/* Tab 1: Presets with Men / Boys / Girls Filter */}
        {activeTab === 'presets' && (
          <div className="space-y-4">
            {/* Category Filter Pills */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-semibold text-slate-500">Filter Cartoon Category:</span>
              <div className="flex items-center gap-1.5 bg-slate-100/80 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setPresetFilter('all')}
                  className={`text-xs px-3 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                    presetFilter === 'all'
                      ? 'bg-white text-[#4f46e5] shadow-2xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  All ({PRESET_AVATARS.length})
                </button>
                <button
                  type="button"
                  onClick={() => setPresetFilter('boys')}
                  className={`text-xs px-3 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                    presetFilter === 'boys'
                      ? 'bg-white text-indigo-600 shadow-2xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  👦 Boys (8)
                </button>
                <button
                  type="button"
                  onClick={() => setPresetFilter('girls')}
                  className={`text-xs px-3 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                    presetFilter === 'girls'
                      ? 'bg-white text-pink-600 shadow-2xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  👧 Girls (8)
                </button>
                <button
                  type="button"
                  onClick={() => setPresetFilter('men')}
                  className={`text-xs px-3 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                    presetFilter === 'men'
                      ? 'bg-white text-blue-700 shadow-2xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  👨 Men (8)
                </button>
              </div>
            </div>

            {/* Cartoon Avatars Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-h-72 overflow-y-auto p-1 pr-2">
              {filteredPresets.map((preset) => {
                const isSelected = selectedAvatar === preset.url;
                const categoryColor =
                  preset.category === 'girls'
                    ? 'bg-pink-50 text-pink-700 border-pink-200'
                    : preset.category === 'men'
                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                    : 'bg-indigo-50 text-indigo-700 border-indigo-200';

                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => setSelectedAvatar(preset.url)}
                    className={`group relative rounded-2xl overflow-hidden border-2 p-2 flex flex-col items-center gap-1.5 transition-all text-left cursor-pointer ${
                      isSelected
                        ? 'border-[#4f46e5] bg-indigo-50/70 shadow-sm ring-2 ring-indigo-200'
                        : 'border-[#e2e8f0] hover:border-[#cbd5e1] hover:bg-slate-50'
                    }`}
                  >
                    <div className="w-18 h-18 rounded-xl bg-gradient-to-b from-slate-50 to-indigo-50/50 p-1 overflow-hidden relative shadow-2xs flex items-center justify-center">
                      <img
                        src={preset.url}
                        alt={preset.label}
                        className="w-full h-full object-contain transition-transform group-hover:scale-110"
                        loading="lazy"
                      />
                      {isSelected && (
                        <div className="absolute inset-0 bg-[#4f46e5]/40 backdrop-blur-[0.5px] flex items-center justify-center">
                          <div className="bg-white text-[#4f46e5] rounded-full p-1 shadow-sm">
                            <Check className="w-4 h-4 stroke-[3]" />
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="w-full text-center">
                      <span className="text-[11px] font-semibold text-slate-800 block truncate">
                        {preset.label}
                      </span>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full border capitalize inline-block mt-0.5 ${categoryColor}`}
                      >
                        {preset.category}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 2: Cartoon Generator */}
        {activeTab === 'generator' && (
          <div className="space-y-4 bg-slate-50 border border-slate-200 rounded-2xl p-5">
            <div>
              <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Generate Custom Cartoon Avatar
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                Create a distinct cartoon avatar for boys, girls, or men using any character seed name.
              </p>
            </div>

            {/* Choose Gender/Style */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Choose Character Type:</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setGenCategory('boys')}
                  className={`p-2 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    genCategory === 'boys'
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <span>👦 Boy Student</span>
                </button>
                <button
                  type="button"
                  onClick={() => setGenCategory('girls')}
                  className={`p-2 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    genCategory === 'girls'
                      ? 'bg-pink-600 text-white border-pink-600 shadow-2xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <span>👧 Girl Student</span>
                </button>
                <button
                  type="button"
                  onClick={() => setGenCategory('men')}
                  className={`p-2 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    genCategory === 'men'
                      ? 'bg-blue-700 text-white border-blue-700 shadow-2xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <span>👨 Adult Man / Mentor</span>
                </button>
              </div>
            </div>

            {/* Seed Name Input with Shuffle */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Seed Name / Keyword:</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={genSeed}
                  onChange={(e) => setGenSeed(e.target.value)}
                  placeholder="e.g. Alex, CyberCoder, SRMCEM"
                  className="flex-1 text-xs p-2.5 rounded-xl border border-slate-300 bg-white outline-none focus:border-[#4f46e5] focus:ring-2 focus:ring-indigo-100"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  leftIcon={<Shuffle className="w-3.5 h-3.5" />}
                  onClick={handleRandomizeSeed}
                >
                  Shuffle
                </Button>
              </div>
            </div>

            {/* Live Generated Preview Box */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xs">
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center p-1">
                  <img
                    src={currentGeneratedUrl}
                    alt="Generated Cartoon"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">
                    Custom {genCategory === 'boys' ? 'Boy' : genCategory === 'girls' ? 'Girl' : 'Man'} Cartoon
                  </p>
                  <p className="text-[11px] text-slate-400">Seed: {genSeed || 'Default'}</p>
                </div>
              </div>

              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={() => setSelectedAvatar(currentGeneratedUrl)}
              >
                Use This Cartoon
              </Button>
            </div>
          </div>
        )}

        {/* Tab 3: File Upload */}
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
                accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
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
                {isProcessing ? 'Optimizing avatar...' : 'Click to upload or drag & drop'}
              </p>
              <p className="text-xs text-slate-500 mt-1 max-w-sm">
                SVG, PNG, JPEG, WEBP or GIF. Images are automatically centered and cropped to a square.
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

        {/* Tab 4: Direct URL */}
        {activeTab === 'url' && (
          <div className="space-y-3">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Paste Image URL
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                placeholder="https://example.com/avatar.svg"
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
              Supports direct URLs from DiceBear, GitHub avatars, Gravatar, or personal SVG hosting.
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
            Save Avatar
          </Button>
        </div>
      </div>
    </Modal>
  );
};
