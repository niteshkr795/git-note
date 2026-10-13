'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/Modal';
import { Button } from '@/components/ui/Button';
import { REPORT_REASONS } from '@/data/mockData';
import { useResources } from '@/context/ResourceContext';
import { AlertTriangle, ShieldAlert, CheckCircle2 } from 'lucide-react';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  resourceId: string;
  resourceTitle: string;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  resourceId,
  resourceTitle,
}) => {
  const { reportResource } = useResources();
  const [selectedReason, setSelectedReason] = useState<string>('');
  const [details, setDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReason) {
      setError('Please choose a reason for reporting this document.');
      return;
    }

    setError('');
    setIsSubmitting(true);

    // Mock API processing
    setTimeout(() => {
      reportResource(resourceId, selectedReason, details);
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 600);
  };

  const handleReset = () => {
    setSelectedReason('');
    setDetails('');
    setIsSubmitted(false);
    setError('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleReset} title="Report Academic Resource" maxWidth="lg">
      {isSubmitted ? (
        <div className="text-center py-6">
          <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3 border border-emerald-200">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h4 className="text-lg font-bold text-slate-900 mb-1">Report Received</h4>
          <p className="text-xs text-slate-600 max-w-sm mx-auto mb-6 leading-relaxed">
            Thank you for helping maintain high academic integrity on GitNote. Our community moderation team will review &quot;{resourceTitle}&quot; within 24 hours.
          </p>
          <Button variant="primary" onClick={handleReset} className="w-full">
            Done
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-amber-50/80 border border-amber-200/90 rounded-2xl p-3.5 flex items-start gap-3 text-xs text-amber-800">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-900">Academic Safety Notice</p>
              <p className="mt-0.5 text-amber-700 leading-relaxed">
                You are reporting: <strong className="font-semibold text-amber-950">&quot;{resourceTitle}&quot;</strong>. Reports help maintain accurate syllabus materials for all students.
              </p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Select Reason <span className="text-rose-500">*</span>
            </label>
            <div className="space-y-2">
              {REPORT_REASONS.map((reason) => (
                <label
                  key={reason.id}
                  className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                    selectedReason === reason.id
                      ? 'border-blue-600 bg-blue-50/50 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="reportReason"
                    value={reason.id}
                    checked={selectedReason === reason.id}
                    onChange={(e) => {
                      setSelectedReason(e.target.value);
                      setError('');
                    }}
                    className="mt-0.5 text-blue-600 focus:ring-blue-500"
                  />
                  <div>
                    <span className="block text-xs font-bold text-slate-800">
                      {reason.label}
                    </span>
                    <span className="block text-[11px] text-slate-500 leading-snug mt-0.5">
                      {reason.description}
                    </span>
                  </div>
                </label>
              ))}
            </div>
            {error && <p className="text-xs text-rose-600 mt-2 font-medium">{error}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Additional Details (Optional)
            </label>
            <textarea
              rows={3}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Provide specific page numbers or context if applicable..."
              className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <Button type="button" variant="outline" size="sm" onClick={handleReset}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="danger"
              size="sm"
              isLoading={isSubmitting}
              leftIcon={<AlertTriangle className="w-3.5 h-3.5" />}
            >
              Submit Report
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};
