import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { ConfirmModal } from "./ConfirmModal";

interface AnimatedDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string | React.ReactNode;
  formId?: string;
  onSubmit?: (e: React.FormEvent) => void;
  submitLabel?: string;
  isSubmitting?: boolean;
  isDirty?: boolean;
  maxWidthClass?: string;
  footer?: React.ReactNode;
  children: React.ReactNode;
}

export const AnimatedDrawer: React.FC<AnimatedDrawerProps> = ({
  isOpen,
  onClose,
  title,
  formId,
  onSubmit,
  submitLabel,
  isSubmitting = false,
  isDirty = false,
  maxWidthClass = "max-w-md sm:max-w-lg",
  footer,
  children,
}) => {
  const [visible, setVisible] = useState(false);
  const [closing, setClosing] = useState(false);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setVisible(true);
      setClosing(false);
      setShowDiscardConfirm(false);
    } else if (visible) {
      setClosing(true);
      const timer = setTimeout(() => {
        setVisible(false);
        setClosing(false);
        setShowDiscardConfirm(false);
      }, 230);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleRequestClose = () => {
    if (closing || isSubmitting) return;
    if (isDirty) {
      setShowDiscardConfirm(true);
    } else {
      onClose();
    }
  };

  const handleConfirmDiscard = () => {
    setShowDiscardConfirm(false);
    onClose();
  };

  if (!visible) return null;

  return createPortal(
    <>
      <div
        className={`fixed inset-0 top-0 left-0 right-0 bottom-0 w-screen h-screen z-[99999] flex justify-end overflow-hidden ${
          closing ? "animate-backdrop-out" : "animate-backdrop-in"
        }`}
        style={{
          backgroundColor: "rgba(15, 23, 42, 0.4)",
          backdropFilter: "blur(4px)",
        }}
      >
        <div
          className={`w-full ${maxWidthClass} bg-white h-full shadow-2xl flex flex-col border-l border-slate-200 ${
            closing ? "animate-drawer-out" : "animate-drawer-in"
          }`}
        >
          {/* Header */}
          <div className="p-3.5 px-4 border-b border-slate-200 flex items-center justify-between bg-white sticky top-0 z-10">
            <div className="flex items-center gap-2.5 min-w-0">
              <button
                type="button"
                onClick={handleRequestClose}
                className="p-1 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors shrink-0"
                title="ปิด"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="font-bold text-slate-900 text-sm tracking-tight truncate">
                {title}
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleRequestClose}
                disabled={isSubmitting}
                className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 font-medium px-3 py-1.5 rounded-lg text-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ปิด
              </button>
              {submitLabel && formId && (
                <button
                  type="submit"
                  form={formId}
                  disabled={isSubmitting}
                  className="bg-slate-900 hover:bg-slate-800 text-white font-semibold px-4 py-1.5 rounded-lg text-xs transition-colors shadow-2xs inline-flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting && (
                    <svg className="animate-spin h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  )}
                  {submitLabel}
                </button>
              )}
            </div>
          </div>

          {/* Body Content */}
          {formId ? (
            <form
              id={formId}
              onSubmit={onSubmit}
              className="flex-1 overflow-y-auto p-3.5 pb-20 space-y-4 text-xs custom-scrollbar"
            >
              <div className="space-y-3">{children}</div>
            </form>
          ) : (
            <div className="flex-1 overflow-y-auto pt-0 p-3.5 pb-20 space-y-4 text-xs custom-scrollbar">
              {children}
            </div>
          )}

          {/* Footer if specified */}
          {footer && (
            <div className="p-4 border-t border-slate-100 bg-slate-50/60 flex justify-between items-center shrink-0">
              {footer}
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Modal when discarding unsaved changes */}
      <ConfirmModal
        isOpen={showDiscardConfirm}
        title="มีข้อมูลที่ยังไม่ได้บันทึก"
        message="คุณมีข้อมูลที่กรอกค้างไว้ในฟอร์ม ต้องการปิดฟอร์มโดยละทิ้งข้อมูลนี้หรือไม่?"
        confirmText="ละทิ้งข้อมูลและปิด"
        cancelText="กรอกข้อมูลต่อ"
        onConfirm={handleConfirmDiscard}
        onCancel={() => setShowDiscardConfirm(false)}
      />
    </>,
    document.body
  );
};

export default AnimatedDrawer;
