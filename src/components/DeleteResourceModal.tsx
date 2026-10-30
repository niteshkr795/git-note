'use client';

import React, { useState } from 'react';
import { Resource } from '@/types';
import { Modal } from '@/components/Modal';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useResources } from '@/context/ResourceContext';
import { Trash2, AlertTriangle, FileText, GraduationCap } from 'lucide-react';

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
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded bg-[#fef2f2] border border-[#fecaca] flex items-center justify-center text-[#991b1b] shrink-0">
            <Trash2 className="w-5 h-5 text-[#991b1b]" />
          </div>

          <div className="space-y-0.5">
            <h3 className="font-editorial text-lg font-semibold text-[#18181b] tracking-tight">
              Delete Document Record?
            </h3>
            <p className="text-xs text-[#71717a] leading-relaxed">
              Are you sure you want to permanently remove this document from the institutional catalog?
            </p>
          </div>
        </div>

        {/* Resource Details Preview */}
        <div className="bg-[#fbfaf8] rounded-md border border-[#e5e2db] p-3.5 space-y-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge resourceType={resource.resourceType} size="sm">
              {resource.resourceType}
            </Badge>
            <span className="text-[11px] font-mono text-[#52525b] bg-[#f4f2ee] px-2 py-0.5 rounded border border-[#e5e2db]">
              {resource.semester}
            </span>
            <span className="text-[11px] font-mono text-[#71717a]">
              {resource.fileFormat} • {resource.fileSize}
            </span>
          </div>

          <h4 className="text-xs sm:text-sm font-medium text-[#18181b] leading-snug line-clamp-2">
            {resource.title}
          </h4>

          <div className="flex items-center gap-1.5 text-xs text-[#52525b]">
            <GraduationCap className="w-3.5 h-3.5 text-[#71717a]" />
            <span className="truncate max-w-[260px]">{resource.subject}</span>
          </div>
        </div>

        {/* Notice */}
        <div className="flex items-start gap-2 p-2.5 rounded bg-[#fef9ee] border border-[#fde68a] text-[#92400e] text-xs">
          <AlertTriangle className="w-3.5 h-3.5 text-[#b45309] shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            Students will no longer be able to discover or download this document once removed.
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#eeece6]">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isDeleting}
          >
            Cancel
          </Button>

          <Button
            type="button"
            variant="danger"
            size="sm"
            isLoading={isDeleting}
            onClick={handleDelete}
            leftIcon={<Trash2 className="w-3.5 h-3.5" />}
          >
            Confirm Deletion
          </Button>
        </div>
      </div>
    </Modal>
  );
};
