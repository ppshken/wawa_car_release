import React, { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import {
  X,
  ZoomIn,
  ZoomOut,
  RotateCw,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Download,
  ExternalLink,
  Camera,
} from "lucide-react";

export interface LightboxImage {
  url: string;
  title?: string;
  description?: string;
}

interface ImageLightboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  images: LightboxImage[];
  currentIndex?: number;
  onIndexChange?: (index: number) => void;
}

export const ImageLightboxModal: React.FC<ImageLightboxModalProps> = ({
  isOpen,
  onClose,
  images,
  currentIndex = 0,
  onIndexChange,
}) => {
  const [index, setIndex] = useState<number>(currentIndex);
  const [scale, setScale] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  useEffect(() => {
    setIndex(currentIndex);
    setScale(1);
    setRotation(0);
    setPosition({ x: 0, y: 0 });
  }, [currentIndex, isOpen]);

  const handleNext = useCallback(() => {
    if (images.length <= 1) return;
    const nextIdx = (index + 1) % images.length;
    setIndex(nextIdx);
    if (onIndexChange) onIndexChange(nextIdx);
    setScale(1);
    setRotation(0);
    setPosition({ x: 0, y: 0 });
  }, [index, images.length, onIndexChange]);

  const handlePrev = useCallback(() => {
    if (images.length <= 1) return;
    const prevIdx = (index - 1 + images.length) % images.length;
    setIndex(prevIdx);
    if (onIndexChange) onIndexChange(prevIdx);
    setScale(1);
    setRotation(0);
    setPosition({ x: 0, y: 0 });
  }, [index, images.length, onIndexChange]);

  const handleZoomIn = () => {
    setScale((prev) => Math.min(prev + 0.25, 4));
  };

  const handleZoomOut = () => {
    setScale((prev) => {
      const next = Math.max(prev - 0.25, 0.5);
      if (next <= 1) setPosition({ x: 0, y: 0 });
      return next;
    });
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleReset = () => {
    setScale(1);
    setRotation(0);
    setPosition({ x: 0, y: 0 });
  };

  // Keyboard navigation & Shortcuts
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowRight") {
        handleNext();
      } else if (e.key === "ArrowLeft") {
        handlePrev();
      } else if (e.key === "+" || e.key === "=") {
        handleZoomIn();
      } else if (e.key === "-") {
        handleZoomOut();
      } else if (e.key === "r" || e.key === "R") {
        handleRotate();
      } else if (e.key === "0") {
        handleReset();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handleNext, handlePrev, onClose]);

  // Mouse Drag to Pan when Zoomed
  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && scale > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  if (!isOpen || images.length === 0) return null;

  const currentImg = images[index] || images[0];

  const handleDownload = () => {
    if (!currentImg?.url) return;
    const a = document.createElement("a");
    a.href = currentImg.url;
    a.download = currentImg.title || `image_${index + 1}.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[999999] bg-slate-950/90 backdrop-blur-md flex flex-col justify-between overflow-hidden animate-in fade-in duration-200 select-none"
      onClick={onClose}
      onMouseUp={handleMouseUp}
    >
      {/* Top Navigation Bar */}
      <div
        className="p-3 px-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between z-20 shrink-0 text-white"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 min-w-0 max-w-md">
          <Camera className="w-4 h-4 text-blue-400 shrink-0" />
          <span className="font-semibold text-xs text-slate-200 truncate">
            {currentImg?.title || `รูปภาพที่ ${index + 1}`}
          </span>
          {images.length > 1 && (
            <span className="bg-slate-800 border border-slate-700 text-slate-300 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full shrink-0">
              {index + 1} / {images.length}
            </span>
          )}
        </div>

        {/* Toolbar Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Zoom Out */}
          <button
            type="button"
            onClick={handleZoomOut}
            disabled={scale <= 0.5}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 disabled:opacity-40 transition-colors"
            title="ย่อรูป (Zoom Out: -)"
          >
            <ZoomOut className="w-4 h-4" />
          </button>

          {/* Zoom Level Indicator */}
          <span className="text-[10px] font-mono text-slate-300 min-w-[40px] text-center font-bold">
            {Math.round(scale * 100)}%
          </span>

          {/* Zoom In */}
          <button
            type="button"
            onClick={handleZoomIn}
            disabled={scale >= 4}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 disabled:opacity-40 transition-colors"
            title="ขยายรูป (Zoom In: +)"
          >
            <ZoomIn className="w-4 h-4" />
          </button>

          {/* Separator */}
          <div className="h-4 w-[1px] bg-slate-800 my-auto mx-1" />

          {/* Close */}
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-rose-600/80 hover:bg-rose-600 text-white transition-colors ml-1"
            title="ปิดหน้าต่าง (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Image Area with Controls */}
      <div
        className="relative flex-1 w-full h-full flex items-center justify-center overflow-hidden p-4 cursor-grab active:cursor-grabbing"
        onClick={(e) => e.stopPropagation()}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
      >
        {/* Previous Image Button */}
        {images.length > 1 && (
          <button
            type="button"
            onClick={handlePrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-slate-900/80 hover:bg-slate-900 border border-slate-700/80 text-white shadow-xl transition-transform hover:scale-110"
            title="รูปก่อนหน้า (ลูกศรซ้าย)"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        {/* Image Display Wrapper */}
        <div
          className="relative max-w-full max-h-full flex items-center justify-center transition-transform duration-100 ease-out"
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale}) rotate(${rotation}deg)`,
          }}
        >
          <img
            src={currentImg?.url}
            alt={currentImg?.title || "Car Release Photo"}
            className="max-w-[85vw] max-h-[75vh] object-contain rounded-xl shadow-2xl pointer-events-none"
          />
        </div>

        {/* Next Image Button */}
        {images.length > 1 && (
          <button
            type="button"
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-slate-900/80 hover:bg-slate-900 border border-slate-700/80 text-white shadow-xl transition-transform hover:scale-110"
            title="รูปถัดไป (ลูกศรรวา)"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* Bottom Thumbnail Strip / Description */}
      <div
        className="p-3 bg-slate-900/90 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-2 z-20 shrink-0 text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {currentImg?.description ? (
          <p className="text-xs text-slate-300 font-medium truncate max-w-xl">
            {currentImg.description}
          </p>
        ) : (
          <div className="text-[11px] text-slate-400">
            * คลิกที่รูปเพื่อลากย้าย | ปุ่ม <kbd className="bg-slate-800 px-1 rounded text-slate-200">+</kbd>/<kbd className="bg-slate-800 px-1 rounded text-slate-200">-</kbd> เพื่อย่อขยาย | ปุ่ม <kbd className="bg-slate-800 px-1 rounded text-slate-200">R</kbd> หมุนรูป | <kbd className="bg-slate-800 px-1 rounded text-slate-200">Esc</kbd> ปิด
          </div>
        )}

        {/* Thumbnail Selector Strip */}
        {images.length > 1 && (
          <div className="flex items-center gap-1.5 overflow-x-auto max-w-md custom-scrollbar py-0.5">
            {images.map((img, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  setIndex(i);
                  if (onIndexChange) onIndexChange(i);
                  setScale(1);
                  setRotation(0);
                  setPosition({ x: 0, y: 0 });
                }}
                className={`w-9 h-9 rounded-md overflow-hidden border-2 transition-all shrink-0 ${
                  i === index
                    ? "border-blue-500 scale-105 shadow-md"
                    : "border-slate-700 opacity-60 hover:opacity-100"
                }`}
              >
                <img
                  src={img.url}
                  alt={img.title || `thumb_${i}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};

export default ImageLightboxModal;
