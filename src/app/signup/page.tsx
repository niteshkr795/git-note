'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useResources } from '@/context/ResourceContext';
import { Button } from '@/components/ui/Button';
import { SEMESTERS } from '@/data/mockData';
import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  AlertCircle,
  UserPlus,
  CheckCircle2,
  Building2,
} from 'lucide-react';

export default function SignupPage() {
  const router = useRouter();
  const { signUp } = useAuth();
  const { addToast } = useResources();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [college, setCollege] = useState('SRMCEM Lucknow');
  const [branch, setBranch] = useState('Computer Science & Engineering');
  const [semester, setSemester] = useState('Semester 4');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);

  const validate = () => {
    const errs: Record<string, string> = {};

    if (!fullName.trim()) {
      errs.fullName = 'Full name is required.';
    }

    if (!email.trim()) {
      errs.email = 'Student email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errs.email = 'Please provide a valid email address.';
    }

    if (!college.trim()) {
      errs.college = 'College/Institution name is required.';
    }

    if (!password) {
      errs.password = 'Password is required.';
    } else if (password.length < 6) {
      errs.password = 'Password must be at least 6 characters.';
    }

    if (password !== confirmPassword) {
      errs.confirmPassword = 'Passwords do not match.';
    }

    if (!agreeTerms) {
      errs.terms = 'You must agree to academic integrity and sharing standards.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    setErrors({});

    try {
      const { data, error } = await signUp(email.trim(), password, {
        full_name: fullName.trim(),
        college: college.trim(),
        branch: branch.trim(),
        semester: semester.trim(),
      });

      if (error) {
        let msg = error.message;
        if (msg === 'Failed to fetch' || msg.toLowerCase().includes('failed to fetch')) {
          msg = 'Unable to connect to Supabase. Check your internet connection or ad-blockers.';
        } else if (msg.toLowerCase().includes('already registered')) {
          msg = 'An account with this email already exists. Please sign in instead.';
        } else if (msg.toLowerCase().includes('rate limit')) {
          msg = 'Email rate limit reached. In Supabase Dashboard, disable "Confirm email" or wait a few minutes.';
        }
        setErrors({ form: msg });
        addToast('error', 'Registration Failed', msg);
      } else {
        if (data.session) {
          addToast('success', 'Account Created', 'Welcome to GitNote! Your student profile is active.');
          router.push('/profile');
          router.refresh();
        } else {
          setVerificationSent(true);
          addToast('info', 'Verification Email Sent', 'Check your inbox to verify your student email address.');
        }
      }
    } catch (err: any) {
      const msg = err?.message || 'An unexpected error occurred during account creation.';
      setErrors({ form: msg });
      addToast('error', 'Registration Error', msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-10 bg-[#fbfaf8]">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2 mb-3 group">
            <div className="w-8 h-8 rounded border border-[#e5e2db] bg-white p-1 flex items-center justify-center">
              <Image
                src="/logo.png"
                alt="GitNote Logo"
                width={28}
                height={28}
                className="w-full h-full object-contain"
                priority
              />
            </div>
            <span className="font-editorial text-xl font-semibold tracking-tight text-[#18181b]">
              Git<span className="text-[#1d3b64]">Note</span>
            </span>
          </Link>

          <h2 className="font-editorial text-xl font-semibold text-[#18181b] tracking-tight">
            Register Student Contributor Account
          </h2>
          <p className="text-xs text-[#71717a] mt-1">
            Join your college community to catalog notes and access verified examination papers
          </p>
        </div>

        {verificationSent ? (
          <div className="bg-white rounded-md border border-[#e5e2db] p-8 text-center shadow-2xs space-y-4">
            <div className="w-12 h-12 rounded bg-[#f0fdf4] text-[#166534] flex items-center justify-center mx-auto border border-[#bbf7d0]">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="font-editorial text-lg font-semibold text-[#18181b]">
              Verification Email Sent
            </h3>
            <p className="text-xs text-[#71717a] leading-relaxed">
              We dispatched an activation link to <strong className="text-[#18181b]">{email}</strong>. Open the link to confirm your account and begin depositing study materials.
            </p>
            <div className="pt-2">
              <Link href="/login">
                <Button variant="primary" size="sm" className="w-full">
                  Return to Sign In
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-md border border-[#e5e2db] p-6 shadow-2xs space-y-4">
            {errors.form && (
              <div className="bg-[#fef2f2] border border-[#fecaca] rounded p-3 flex items-start gap-2 text-xs text-[#991b1b]">
                <AlertCircle className="w-3.5 h-3.5 text-[#991b1b] shrink-0 mt-0.5" />
                <p className="leading-relaxed">{errors.form}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5">
              {/* Full Name */}
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-[#71717a] mb-1">
                  Full Name <span className="text-[#991b1b]">*</span>
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-2.5 text-[#a1a1aa]">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => {
                      setFullName(e.target.value);
                      if (errors.fullName || errors.form) {
                        setErrors((prev) => {
                          const next = { ...prev };
                          delete next.fullName;
                          delete next.form;
                          return next;
                        });
                      }
                    }}
                    placeholder="e.g. Aarav Sharma"
                    className={`w-full pl-9 pr-3 py-2 text-xs bg-white border rounded-md outline-none transition-colors ${
                      errors.fullName
                        ? 'border-[#fecaca] focus:border-[#991b1b]'
                        : 'border-[#e5e2db] focus:border-[#1d3b64] focus:ring-1 focus:ring-[#1d3b64]'
                    }`}
                  />
                </div>
                {errors.fullName && (
                  <p className="text-xs text-[#991b1b] mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    {errors.fullName}
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-[#71717a] mb-1">
                  Student Email <span className="text-[#991b1b]">*</span>
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-2.5 text-[#a1a1aa]">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errors.email || errors.form) {
                        setErrors((prev) => {
                          const next = { ...prev };
                          delete next.email;
                          delete next.form;
                          return next;
                        });
                      }
                    }}
                    placeholder="student@srmcem.ac.in"
                    className={`w-full pl-9 pr-3 py-2 text-xs bg-white border rounded-md outline-none transition-colors ${
                      errors.email
                        ? 'border-[#fecaca] focus:border-[#991b1b]'
                        : 'border-[#e5e2db] focus:border-[#1d3b64] focus:ring-1 focus:ring-[#1d3b64]'
                    }`}
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-[#991b1b] mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    {errors.email}
                  </p>
                )}
              </div>

              {/* College & Semester */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-[#71717a] mb-1">
                    Institution <span className="text-[#991b1b]">*</span>
                  </label>
                  <input
                    type="text"
                    value={college}
                    onChange={(e) => setCollege(e.target.value)}
                    placeholder="SRMCEM Lucknow"
                    className="w-full px-2.5 py-2 text-xs bg-white border border-[#e5e2db] rounded-md outline-none focus:border-[#1d3b64] focus:ring-1 focus:ring-[#1d3b64] transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-[#71717a] mb-1">
                    Current Semester
                  </label>
                  <select
                    value={semester}
                    onChange={(e) => setSemester(e.target.value)}
                    className="w-full px-2 py-2 text-xs bg-white border border-[#e5e2db] rounded-md outline-none focus:border-[#1d3b64] focus:ring-1 focus:ring-[#1d3b64] transition-colors cursor-pointer"
                  >
                    {SEMESTERS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Passwords */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-[#71717a] mb-1">
                    Password <span className="text-[#991b1b]">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (errors.password || errors.form) {
                          setErrors((prev) => {
                            const next = { ...prev };
                            delete next.password;
                            delete next.form;
                            return next;
                          });
                        }
                      }}
                      placeholder="At least 6 chars"
                      className={`w-full pl-3 pr-8 py-2 text-xs bg-white border rounded-md outline-none transition-colors ${
                        errors.password
                          ? 'border-[#fecaca] focus:border-[#991b1b]'
                          : 'border-[#e5e2db] focus:border-[#1d3b64] focus:ring-1 focus:ring-[#1d3b64]'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2 top-2 text-[#a1a1aa] hover:text-[#18181b]"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-xs text-[#991b1b] mt-1">{errors.password}</p>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-[#71717a] mb-1">
                    Confirm Password <span className="text-[#991b1b]">*</span>
                  </label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (errors.confirmPassword || errors.form) {
                        setErrors((prev) => {
                          const next = { ...prev };
                          delete next.confirmPassword;
                          delete next.form;
                          return next;
                        });
                      }
                    }}
                    placeholder="Repeat password"
                    className={`w-full px-3 py-2 text-xs bg-white border rounded-md outline-none transition-colors ${
                      errors.confirmPassword
                        ? 'border-[#fecaca] focus:border-[#991b1b]'
                        : 'border-[#e5e2db] focus:border-[#1d3b64] focus:ring-1 focus:ring-[#1d3b64]'
                    }`}
                  />
                  {errors.confirmPassword && (
                    <p className="text-xs text-[#991b1b] mt-1">{errors.confirmPassword}</p>
                  )}
                </div>
              </div>

              {/* Terms checkbox */}
              <div className="pt-1">
                <label className="flex items-start gap-2 cursor-pointer text-xs text-[#52525b]">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => {
                      setAgreeTerms(e.target.checked);
                      if (errors.terms || errors.form) {
                        setErrors((prev) => {
                          const next = { ...prev };
                          delete next.terms;
                          delete next.form;
                          return next;
                        });
                      }
                    }}
                    className="w-3.5 h-3.5 mt-0.5 rounded border-[#e5e2db] text-[#1d3b64] focus:ring-[#1d3b64]"
                  />
                  <span>
                    I commit to the academic sharing guidelines and verify that deposited resources conform to syllabus standards.
                  </span>
                </label>
                {errors.terms && (
                  <p className="text-xs text-[#991b1b] mt-1">{errors.terms}</p>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={isLoading}
                className="w-full mt-2"
                rightIcon={<UserPlus className="w-3.5 h-3.5" />}
              >
                Create Account
              </Button>
            </form>
          </div>
        )}

        {/* Footer Link to Login */}
        <p className="text-center text-xs text-[#71717a]">
          Already registered in the archive?{' '}
          <Link
            href="/login"
            className="font-medium text-[#1d3b64] hover:underline"
          >
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
