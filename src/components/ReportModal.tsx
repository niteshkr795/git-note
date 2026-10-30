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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReason) {
      setError('Please choose a reason for reporting this document.');
      return;
    }

    setError('');
    setIsSubmitting(true);

    try {
      await reportResource(resourceId, selectedReason, details);
      setIsSubmitted(true);
    } catch {
      setError('Failed to submit report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setSelectedReason('');
    setDetails('');
    setIsSubmitted(false);
    setError('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleReset} title="Report Academic Document" maxWidth="lg">
      {isSubmitted ? (
        <div className="text-center py-5">
          <div className="w-12 h-12 rounded bg-[#f0fdf4] text-[#166534] flex items-center justify-center mx-auto mb-3 border border-[#bbf7d0]">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h4 className="font-editorial text-base font-semibold text-[#18181b] mb-1">Notice Submitted</h4>
          <p className="text-xs text-[#71717a] max-w-sm mx-auto mb-5 leading-relaxed">
            Thank you for maintaining catalog accuracy. Institutional moderators will examine &quot;{resourceTitle}&quot;.
          </p>
          <Button variant="primary" size="sm" onClick={handleReset} className="w-full">
            Done
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="p-3 bg-[#fef9ee] border border-[#fde68a] rounded-md flex items-start gap-2.5 text-xs text-[#92400e]">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-[#b45309]" />
            <div>
              <span className="font-semibold block text-[#92400e]">Academic Catalog Integrity</span>
              Reports flag corrupted scans, inaccurate course mappings, or copyright infringement.
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-[#71717a] mb-2">
              Reason for Notice:
            </label>
            <div className="space-y-1.5">
              {REPORT_REASONS.map((reason) => (
                <label
                  key={reason.id}
                  className={`flex items-start gap-2.5 p-2.5 rounded-md border text-xs cursor-pointer transition-colors ${
                    selectedReason === reason.id
                      ? 'border-[#1d3b64] bg-[#eef3f8] text-[#18181b] font-medium'
                      : 'border-[#e5e2db] hover:bg-[#fbfaf8] text-[#52525b]'
                  }`}
                >
                  <input
                    type="radio"
                    name="reportReason"
                    value={reason.id}
                    checked={selectedReason === reason.id}
                    onChange={() => setSelectedReason(reason.id)}
                    className="mt-0.5 text-[#1d3b64] focus:ring-[#1d3b64]"
                  />
                  <div>
                    <span className="block font-medium">{reason.label}</span>
                    <span className="text-[11px] text-[#71717a]">{reason.description}</span>
                  </div>
                </label>
              ))}
            </div>
            {error && <p className="text-xs text-[#991b1b] mt-1.5">{error}</p>}
          </div>

          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-[#71717a] mb-1">
              Additional Observations (Optional)
            </label>
            <textarea
              rows={3}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Provide specific page numbers or syllabus discrepancies..."
              className="w-full text-xs p-2.5 rounded-md border border-[#e5e2db] bg-white outline-none focus:border-[#1d3b64] focus:ring-1 focus:ring-[#1d3b64] transition-colors resize-y"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#eeece6]">
            <Button type="button" variant="outline" size="sm" onClick={handleReset}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isSubmitting}
            >
              Submit Notice
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};
