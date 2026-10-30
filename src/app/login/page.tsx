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
      errs.email = 'Student or institutional email is required.';
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
        if (message === 'Failed to fetch' || message.toLowerCase().includes('failed to fetch')) {
          message = 'Unable to connect to Supabase. Check network connection or ad-blockers.';
        } else if (message.toLowerCase().includes('invalid login credentials')) {
          message = 'Invalid email or password. Please check your credentials or register an account.';
        } else if (message.toLowerCase().includes('email not confirmed')) {
          message = 'Please confirm your email address via the confirmation link sent to your inbox.';
        }
        setErrors({ form: message });
        addToast('error', 'Authentication Failed', message);
      } else {
        addToast('success', 'Signed In', 'Welcome back to GitNote.');
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
    <div className="w-full max-w-sm space-y-6">
      {/* Brand Header */}
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
          Sign In to Academic Portal
        </h2>
        <p className="text-xs text-[#71717a] mt-1">
          Access your contributed course notes and saved repository papers
        </p>
      </div>

      {/* Form Container */}
      <div className="bg-white rounded-md border border-[#e5e2db] p-6 shadow-2xs space-y-4">
        {errors.form && (
          <div className="bg-[#fef2f2] border border-[#fecaca] rounded p-3 flex items-start gap-2 text-xs text-[#991b1b]">
            <AlertCircle className="w-3.5 h-3.5 text-[#991b1b] shrink-0 mt-0.5" />
            <p className="leading-relaxed">{errors.form}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Email Field */}
          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-[#71717a] mb-1">
              Email Address
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

          {/* Password Field */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-mono uppercase tracking-wider text-[#71717a]">
                Password
              </label>
              <button
                type="button"
                onClick={() => addToast('info', 'Password Reset', 'Contact institutional IT support or use reset email.')}
                className="text-[11px] text-[#1d3b64] hover:underline"
              >
                Forgot?
              </button>
            </div>
            <div className="relative">
              <div className="absolute left-3 top-2.5 text-[#a1a1aa]">
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
                className={`w-full pl-9 pr-8 py-2 text-xs bg-white border rounded-md outline-none transition-colors ${
                  errors.password
                    ? 'border-[#fecaca] focus:border-[#991b1b]'
                    : 'border-[#e5e2db] focus:border-[#1d3b64] focus:ring-1 focus:ring-[#1d3b64]'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2.5 top-2.5 text-[#a1a1aa] hover:text-[#18181b] cursor-pointer"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-[#991b1b] mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3 shrink-0" />
                {errors.password}
              </p>
            )}
          </div>

          {/* Remember Me */}
          <div className="flex items-center justify-between pt-0.5">
            <label className="flex items-center gap-2 cursor-pointer text-xs text-[#52525b]">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-3.5 h-3.5 rounded border-[#e5e2db] text-[#1d3b64] focus:ring-[#1d3b64]"
              />
              <span>Remember session</span>
            </label>
          </div>

          {/* Submit */}
          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={isLoading}
            className="w-full mt-1"
            rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
          >
            Sign In
          </Button>
        </form>

        <div className="pt-2 text-center border-t border-[#eeece6]">
          <p className="text-[11px] font-mono text-[#71717a] flex items-center justify-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-[#166534]" />
            Encrypted Supabase Auth
          </p>
        </div>
      </div>

      {/* Footer link */}
      <p className="text-center text-xs text-[#71717a]">
        New to the repository?{' '}
        <Link
          href="/signup"
          className="font-medium text-[#1d3b64] hover:underline"
        >
          Create Student Account
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-10 bg-[#fbfaf8]">
      <Suspense fallback={<div className="text-center text-xs text-[#71717a]">Loading sign in...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
