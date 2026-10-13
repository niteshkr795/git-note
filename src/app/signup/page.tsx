'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useResources } from '@/context/ResourceContext';
import { Button } from '@/components/ui/Button';
import { SEMESTERS } from '@/data/mockData';
import {
  BookOpen,
  Mail,
  Lock,
  User,
  GraduationCap,
  Eye,
  EyeOff,
  AlertCircle,
  UserPlus,
  CheckCircle2,
} from 'lucide-react';

export default function SignupPage() {
  const router = useRouter();
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

  const validate = () => {
    const errs: Record<string, string> = {};

    if (!fullName.trim()) {
      errs.fullName = 'Full name is required.';
    }

    if (!email.trim()) {
      errs.email = 'College email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errs.email = 'Please provide a valid email.';
    }

    if (!college.trim()) {
      errs.college = 'College name is required.';
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
      errs.terms = 'You must agree to the academic sharing guidelines.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      addToast(
        'success',
        'Account Registered',
        `Welcome to GitNote, ${fullName.split(' ')[0]}!`
      );
      router.push('/');
    }, 800);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8 bg-[#faf8ff]">
      <div className="w-full max-w-lg space-y-8">
        {/* Header */}
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-3 mb-4 group">
            <div className="w-12 h-12 rounded-2xl bg-white p-1 shadow-md border border-slate-200/90 group-hover:scale-105 transition-transform flex items-center justify-center overflow-hidden">
              <Image
                src="/logo.png"
                alt="GitNote Logo"
                width={48}
                height={48}
                className="w-full h-full object-contain"
                priority
              />
            </div>
            <span className="font-extrabold text-2xl tracking-tight text-[#0f172a] font-mono">
              Git<span className="text-[#4f46e5]">Note</span>
            </span>
          </Link>

          <h2 className="text-2xl font-bold text-[#0f172a] tracking-tight">
            Create Student Account
          </h2>
          <p className="text-xs text-[#475569] mt-1.5">
            Join your university peers sharing previous year papers, notes, and lab manuals
          </p>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-2xl border border-[#e2e8f0] p-8 shadow-xs space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute left-3.5 top-3.5 text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value);
                    if (errors.fullName) setErrors((prev) => ({ ...prev, fullName: '' }));
                  }}
                  placeholder="Aarav Sharma"
                  className={`w-full pl-10 pr-3 py-3 text-xs sm:text-sm bg-white border rounded-xl outline-none transition-all ${
                    errors.fullName
                      ? 'border-rose-400 focus:ring-2 focus:ring-rose-100'
                      : 'border-[#cbd5e1] focus:border-[#4f46e5] focus:ring-2 focus:ring-indigo-100'
                  }`}
                />
              </div>
              {errors.fullName && (
                <p className="text-xs text-rose-600 font-medium mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  {errors.fullName}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                College Email <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute left-3.5 top-3.5 text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
                  }}
                  placeholder="aarav.cs23@srmcem.ac.in"
                  className={`w-full pl-10 pr-3 py-3 text-xs sm:text-sm bg-white border rounded-xl outline-none transition-all ${
                    errors.email
                      ? 'border-rose-400 focus:ring-2 focus:ring-rose-100'
                      : 'border-[#cbd5e1] focus:border-[#4f46e5] focus:ring-2 focus:ring-indigo-100'
                  }`}
                />
              </div>
              {errors.email && (
                <p className="text-xs text-rose-600 font-medium mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  {errors.email}
                </p>
              )}
            </div>

            {/* College & Branch */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  College Institution
                </label>
                <input
                  type="text"
                  value={college}
                  onChange={(e) => setCollege(e.target.value)}
                  placeholder="e.g. SRMCEM"
                  className="w-full p-3 text-xs sm:text-sm bg-white border border-[#cbd5e1] rounded-xl outline-none focus:border-[#4f46e5] focus:ring-2 focus:ring-indigo-100 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Current Semester
                </label>
                <select
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                  className="w-full p-3 text-xs sm:text-sm bg-white border border-[#cbd5e1] rounded-xl outline-none focus:border-[#4f46e5] focus:ring-2 focus:ring-indigo-100 transition-all cursor-pointer"
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errors.password) setErrors((prev) => ({ ...prev, password: '' }));
                    }}
                    placeholder="At least 6 chars"
                    className={`w-full p-3 text-xs sm:text-sm bg-white border rounded-xl outline-none transition-all ${
                      errors.password
                        ? 'border-rose-400 focus:ring-2 focus:ring-rose-100'
                        : 'border-[#cbd5e1] focus:border-[#4f46e5] focus:ring-2 focus:ring-indigo-100'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-rose-600 font-medium mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    {errors.password}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Confirm Password <span className="text-rose-500">*</span>
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: '' }));
                  }}
                  placeholder="Re-enter password"
                  className={`w-full p-3 text-xs sm:text-sm bg-white border rounded-xl outline-none transition-all ${
                    errors.confirmPassword
                      ? 'border-rose-400 focus:ring-2 focus:ring-rose-100'
                      : 'border-[#cbd5e1] focus:border-[#4f46e5] focus:ring-2 focus:ring-indigo-100'
                  }`}
                />
                {errors.confirmPassword && (
                  <p className="text-xs text-rose-600 font-medium mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    {errors.confirmPassword}
                  </p>
                )}
              </div>
            </div>

            {/* Terms checkbox */}
            <div>
              <label className="flex items-start gap-2.5 cursor-pointer text-xs text-[#475569] pt-1">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => {
                    setAgreeTerms(e.target.checked);
                    if (errors.terms) setErrors((prev) => ({ ...prev, terms: '' }));
                  }}
                  className="w-4 h-4 mt-0.5 rounded border-[#cbd5e1] text-[#4f46e5] focus:ring-[#4f46e5]"
                />
                <span>
                  I agree to the academic sharing honor code and declare that all shared materials conform to college exam integrity standards.
                </span>
              </label>
              {errors.terms && (
                <p className="text-xs text-rose-600 font-medium mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  {errors.terms}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isLoading}
              className="w-full mt-2"
              rightIcon={<UserPlus className="w-4 h-4" />}
            >
              Complete Registration
            </Button>
          </form>
        </div>

        {/* Footer Link to Login */}
        <p className="text-center text-xs text-[#475569]">
          Already have an account?{' '}
          <Link
            href="/login"
            className="font-bold text-[#4f46e5] hover:text-[#4338ca] hover:underline"
          >
            Sign In to Account
          </Link>
        </p>
      </div>
    </div>
  );
}
