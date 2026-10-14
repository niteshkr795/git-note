'use client';

import React, { useState } from 'react';
import { Resource } from '@/types';
import { Modal } from '@/components/Modal';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useResources } from '@/context/ResourceContext';
import { Trash2, AlertTriangle, FileText, Calendar, GraduationCap } from 'lucide-react';

interface DeleteResourceModalProps {
  resource: Resource | null;
  isOpen: boolean;
  onClose: () => void;
  onDeleted?: (deletedResource: Resource) => void;
}

export const DeleteResourceModal: React.FC<DeleteResourceModalProps> = ({
  resource,
  isOpen,
  onClose,
  onDeleted,
}) => {
  const { deleteResource } = useResources();
  const [isDeleting, setIsDeleting] = useState(false);

  if (!resource) return null;

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await deleteResource(resource.id);
      if (res.success) {
        onClose();
        if (onDeleted) {
          onDeleted(resource);
        }
      }
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="md">
      <div className="space-y-5">
        {/* Header with Danger Accent */}
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200/80 flex items-center justify-center text-rose-600 shrink-0 shadow-xs">
            <Trash2 className="w-6 h-6 text-rose-600" />
          </div>

          <div className="space-y-1">
            <h3 className="text-lg font-extrabold text-[#0f172a] tracking-tight">
              Delete Document?
            </h3>
            <p className="text-xs text-[#64748b] leading-relaxed">
              Are you sure you want to remove this academic material from GitNote? This action is permanent and cannot be undone.
            </p>
          </div>
        </div>

        {/* Resource Details Preview Box */}
        <div className="bg-[#faf8ff] rounded-2xl border border-[#e2e8f0] p-4 space-y-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge resourceType={resource.resourceType} size="sm">
              {resource.resourceType}
            </Badge>
            <span className="text-[11px] font-semibold text-slate-700 bg-white px-2.5 py-0.5 rounded-full border border-slate-200">
              {resource.semester}
            </span>
            <span className="text-[11px] font-medium text-slate-500 bg-white px-2 py-0.5 rounded-full border border-slate-200 flex items-center gap-1 font-mono">
              <FileText className="w-3 h-3 text-[#4f46e5]" />
              {resource.fileFormat} • {resource.fileSize}
            </span>
          </div>

          <h4 className="text-sm font-bold text-[#0f172a] leading-snug line-clamp-2">
            {resource.title}
          </h4>

          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#4338ca] bg-[#eef2ff] px-2.5 py-1 rounded-lg w-fit border border-[#e0e7ff]">
            <GraduationCap className="w-3.5 h-3.5 text-[#4f46e5]" />
            <span className="truncate max-w-[260px]">{resource.subject}</span>
          </div>
        </div>

        {/* Warning callout */}
        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-50/80 border border-amber-200/80 text-amber-900 text-xs">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            Classmates will no longer be able to discover, view, or download this file once it is removed from the library.
          </p>
        </div>

        {/* Actions Footer */}
        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-[#f1f5f9]">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isDeleting}
          >
            Keep Document
          </Button>

          <Button
            type="button"
            variant="danger"
            size="sm"
            onClick={handleDelete}
            isLoading={isDeleting}
            leftIcon={<Trash2 className="w-4 h-4" />}
            className="shadow-xs font-semibold"
          >
            Delete Permanently
          </Button>
        </div>
      </div>
    </Modal>
  );
};
