'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/Modal';
import { Button } from '@/components/ui/Button';
import { REPORT_REASONS } from '@/data/mockData';
import { useResources } from '@/context/ResourceContext';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';

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
          <div className="w-14 h-14 rounded-full bg-[#ecfdf5] text-[#047857] flex items-center justify-center mx-auto mb-3 border border-[#a7f3d0]">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h4 className="text-lg font-bold text-[#0f172a] mb-1">Report Received</h4>
          <p className="text-xs text-[#475569] max-w-sm mx-auto mb-6 leading-relaxed">
            Thank you for helping maintain high academic integrity on GitNote. Our community moderation team will review &quot;{resourceTitle}&quot; within 24 hours.
          </p>
          <Button variant="primary" onClick={handleReset} className="w-full">
            Done
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="p-3 bg-[#fffbeb] border border-[#fde68a] rounded-xl flex items-start gap-2.5 text-xs text-[#b45309]">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-[#f59e0b]" />
            <div>
              <span className="font-semibold block text-[#92400e]">Academic Standards Review</span>
              Reporting flags documents with broken scans, incorrect syllabus mappings, or copyright infringement.
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#0f172a] mb-2">
              Select Reason for Concern:
            </label>
            <div className="space-y-2">
              {REPORT_REASONS.map((reason) => (
                <label
                  key={reason.id}
                  className={`flex items-start gap-2.5 p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                    selectedReason === reason.id
                      ? 'border-[#4f46e5] bg-[#eef2ff] text-[#4338ca] font-semibold'
                      : 'border-[#cbd5e1] hover:bg-[#f8fafc] text-slate-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="reportReason"
                    value={reason.id}
                    checked={selectedReason === reason.id}
                    onChange={(e) => setSelectedReason(e.target.value)}
                    className="w-4 h-4 mt-0.5 text-[#4f46e5] border-slate-300 focus:ring-[#4f46e5]"
                  />
                  <div>
                    <span className="block">{reason.label}</span>
                    <span className="text-[11px] text-slate-500 font-normal">{reason.description}</span>
                  </div>
                </label>
              ))}
            </div>
            {error && <p className="text-xs text-rose-600 mt-1.5 font-medium">{error}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#0f172a] mb-1">
              Additional Context (Optional):
            </label>
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Provide specific page numbers or syllabus discrepancies..."
              rows={3}
              className="w-full p-3 bg-white border border-[#cbd5e1] rounded-xl text-xs text-[#0f172a] placeholder-slate-400 focus:border-[#4f46e5] focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#f1f5f9]">
            <Button type="button" variant="outline" size="sm" onClick={handleReset}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="danger"
              size="sm"
              isLoading={isSubmitting}
            >
              Submit Report
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};
