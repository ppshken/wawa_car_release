import React from 'react';
import { Camera, X, CheckCircle2 } from 'lucide-react';

interface MultiImageUploadProps {
  labels: string[]; // e.g. ['หน้ารถ', 'ข้างขวา', 'ข้างซ้าย', 'หลังรถ', 'ภายใน/PDA']
  images: { [key: string]: string };
  onChange: (key: string, base64: string) => void;
  requiredKeys?: string[];
}

export const MultiImageUpload: React.FC<MultiImageUploadProps> = ({
  labels,
  images,
  onChange,
  requiredKeys = []
}) => {
  const handleFileChange = (key: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        onChange(key, reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemove = (key: string) => {
    onChange(key, '');
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {labels.map((label, idx) => {
        const key = `image_around_${idx + 1}`;
        const isUploaded = !!images[key];
        const isReq = requiredKeys.includes(key);

        return (
          <div
            key={key}
            className={`relative rounded-xl border p-2 flex flex-col items-center justify-center min-h-[110px] text-center transition-all ${
              isUploaded
                ? 'bg-emerald-950/20 border-emerald-500/40'
                : isReq
                ? 'bg-slate-800/80 border-slate-700 hover:border-blue-500/50'
                : 'bg-slate-800/40 border-slate-700/60 hover:border-slate-600'
            }`}
          >
            {isUploaded ? (
              <div className="relative w-full h-24 rounded-lg overflow-hidden group">
                <img src={images[key]} alt={label} className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => handleRemove(key)}
                  className="absolute top-1 right-1 bg-rose-600 text-white rounded-full p-1 shadow-md hover:bg-rose-700 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
                <div className="absolute bottom-0 inset-x-0 bg-slate-900/80 text-[10px] text-emerald-300 py-0.5 px-1 truncate flex items-center justify-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> {label}
                </div>
              </div>
            ) : (
              <label className="cursor-pointer w-full h-full flex flex-col items-center justify-center py-3 px-1 space-y-1.5">
                <div className="w-9 h-9 rounded-full bg-slate-700/80 text-blue-400 flex items-center justify-center">
                  <Camera className="w-5 h-5" />
                </div>
                <span className="text-xs font-medium text-slate-300">
                  {label} {isReq && <span className="text-rose-400">*</span>}
                </span>
                <span className="text-[10px] text-slate-500">แตะเพื่อถ่าย/เลือกรูป</span>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={(e) => handleFileChange(key, e)}
                />
              </label>
            )}
          </div>
        );
      })}
    </div>
  );
};
