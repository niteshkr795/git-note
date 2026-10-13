'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useResources } from '@/context/ResourceContext';
import { Button } from '@/components/ui/Button';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirectTo');
  const { signIn } = useAuth();
  const { addToast } = useResources();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!email.trim()) {
      errs.email = 'College email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errs.email = 'Please enter a valid email address.';
    }

    if (!password) {
      errs.password = 'Password is required.';
    } else if (password.length < 6) {
      errs.password = 'Password must be at least 6 characters.';
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
      const { error } = await signIn(email.trim(), password);

      if (error) {
        let message = error.message;
        if (message.toLowerCase().includes('invalid login credentials')) {
          message = 'Invalid email or password. Please verify your credentials or register a new account.';
        } else if (message.toLowerCase().includes('email not confirmed')) {
          message = 'Please confirm your email address. Check your inbox for the Supabase confirmation link.';
        }
        setErrors({ form: message });
        addToast('error', 'Authentication Failed', message);
      } else {
        addToast('success', 'Welcome Back!', 'Signed in successfully to GitNote.');
        router.push(redirectTo || '/profile');
        router.refresh();
      }
    } catch (err: any) {
      const msg = err?.message || 'An unexpected error occurred during sign in.';
      setErrors({ form: msg });
      addToast('error', 'Sign In Error', msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-8">
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
          Sign in to Academic Hub
        </h2>
        <p className="text-xs text-[#475569] mt-1.5">
          Access your saved question papers, lecture notes, and study bookmarks
        </p>
      </div>

      {/* Form Container */}
      <div className="bg-white rounded-2xl border border-[#e2e8f0] p-8 shadow-xs space-y-6">

        {/* Global Form Error Banner */}
        {errors.form && (
          <div className="bg-rose-50 border border-rose-200 rounded-xl p-3.5 flex items-start gap-2.5 text-xs text-rose-700 animate-in fade-in duration-200">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed">{errors.form}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email Field */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              College Email
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

          {/* Password Field */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Password
              </label>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  addToast('info', 'Password Reset', 'Password recovery link can be dispatched to your student email.');
                }}
                className="text-[11px] font-semibold text-[#4f46e5] hover:text-[#4338ca]"
              >
                Forgot password?
              </a>
            </div>
            <div className="relative">
              <div className="absolute left-3.5 top-3.5 text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
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
                placeholder="••••••••"
                className={`w-full pl-10 pr-10 py-3 text-xs sm:text-sm bg-white border rounded-xl outline-none transition-all ${
                  errors.password
                    ? 'border-rose-400 focus:ring-2 focus:ring-rose-100'
                    : 'border-[#cbd5e1] focus:border-[#4f46e5] focus:ring-2 focus:ring-indigo-100'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
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

          {/* Remember Me Checkbox */}
          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-xs text-[#475569]">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-[#cbd5e1] text-[#4f46e5] focus:ring-[#4f46e5]"
              />
              <span>Remember this computer</span>
            </label>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isLoading}
            className="w-full mt-2"
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Sign In
          </Button>
        </form>

        {/* Institutional Trust Note */}
        <div className="pt-2 text-center">
          <p className="text-xs text-slate-400 flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#10b981]" />
            Secure Supabase Authentication
          </p>
        </div>
      </div>

      {/* Footer Link to Signup */}
      <p className="text-center text-xs text-[#475569]">
        Don&apos;t have a student account yet?{' '}
        <Link
          href="/signup"
          className="font-bold text-[#4f46e5] hover:text-[#4338ca] hover:underline"
        >
          Create an Account
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8 bg-[#faf8ff]">
      <Suspense fallback={<div className="text-center text-xs text-slate-400">Loading sign in...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
