import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, Trash2, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const ConfirmLogout: React.FC<ConfirmModalProps> = ({
  isOpen,
  title = 'ยืนยันการลบข้อมูล',
  message = 'คุณแน่ใจหรือไม่ว่าต้องการลบรายการนี้? การดำเนินการนี้ไม่สามารถยกเลิกได้',
  confirmText = 'ยืนยันลบข้อมูล',
  cancelText = 'ยกเลิก',
  onConfirm,
  onCancel,
  isLoading = false
}) => {
  const [visible, setVisible] = useState(false);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setVisible(true);
      setClosing(false);
    } else if (visible) {
      // Trigger closing animation
      setClosing(true);
      const timer = setTimeout(() => {
        setVisible(false);
        setClosing(false);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleCancel = useCallback(() => {
    if (isLoading) return;
    onCancel();
  }, [isLoading, onCancel]);

  if (!visible) return null;

  return createPortal(
    <div
      className={`fixed inset-0 z-[99999] flex items-center justify-center p-4 ${closing ? 'animate-backdrop-out' : 'animate-backdrop-in'}`}
      style={{ backgroundColor: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(2px)' }}
    >
      <div
        className={`bg-white rounded-xl border border-slate-200 shadow-2xl max-w-md w-full p-5 space-y-4 relative ${closing ? 'animate-modal-out' : 'animate-modal-in'}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Icon Button */}
        <button
          onClick={handleCancel}
          className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Content Header */}
        <div className="flex items-start gap-3.5">
          <div className="space-y-1 pr-4">
            <h3 className="font-bold text-slate-900 text-sm">{title}</h3>
            <p className="text-xs text-slate-500 leading-relaxed">{message}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
          <button
            type="button"
            onClick={handleCancel}
            disabled={isLoading}
            className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 font-medium px-4 py-2 rounded-lg text-xs transition-colors disabled:opacity-50"
          >
            {cancelText}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg text-xs transition-colors shadow-2xs inline-flex items-center gap-1.5 disabled:opacity-50"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{isLoading ? 'กำลังลบ...' : confirmText}</span>
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ConfirmLogout;
