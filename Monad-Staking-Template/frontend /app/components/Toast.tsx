"use client";

import { useEffect, useState } from "react";
import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from "lucide-react";

export type ToastType = "success" | "error" | "info" | "warning";

export interface Toast {
  id: string;
  message: string | React.ReactNode;
  type: ToastType;
  duration?: number;
}

interface ToastCardProps {
  toast: Toast;
  onClose: (id: string) => void;
}

const SharpCard = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-black border border-zinc-800 relative flex flex-col ${className}`}>
    <div className="absolute -top-px -left-px w-2 h-2 border-t border-l border-zinc-500" />
    <div className="absolute -top-px -right-px w-2 h-2 border-t border-r border-zinc-500" />
    <div className="absolute -bottom-px -left-px w-2 h-2 border-b border-l border-zinc-500" />
    <div className="absolute -bottom-px -right-px w-2 h-2 border-b border-r border-zinc-500" />
    {children}
  </div>
);

export function ToastCard({ toast, onClose }: ToastCardProps) {
  const duration = toast.duration ?? 5000;
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setIsExiting(true);
        setTimeout(() => {
          onClose(toast.id);
        }, 300); // Wait for fade-out animation
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [toast.id, duration, onClose]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      onClose(toast.id);
    }, 300);
  };

  const getIcon = () => {
    switch (toast.type) {
      case "success":
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case "error":
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case "warning":
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case "info":
        return <Info className="w-4 h-4 text-blue-500" />;
      default:
        return <Info className="w-4 h-4 text-zinc-500" />;
    }
  };

  const getBorderColor = () => {
    switch (toast.type) {
      case "success":
        return "border-green-500/30";
      case "error":
        return "border-red-500/30";
      case "warning":
        return "border-yellow-500/30";
      case "info":
        return "border-blue-500/30";
      default:
        return "border-zinc-800";
    }
  };

  return (
    <SharpCard className={`p-4 min-w-[320px] max-w-md shadow-lg transition-opacity duration-300 ${getBorderColor()} ${isExiting ? 'opacity-0' : 'opacity-100'}`}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">{getIcon()}</div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-mono text-white leading-relaxed break-words">
            {toast.message}
          </div>
        </div>
        <button
          onClick={handleClose}
          className="flex-shrink-0 text-zinc-500 hover:text-white transition-colors p-1 -mt-1 -mr-1"
          aria-label="Close notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </SharpCard>
  );
}

interface ToastContainerProps {
  toasts: Toast[];
  onClose: (id: string) => void;
}

export function ToastContainer({ toasts, onClose }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-20 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto animate-in">
          <ToastCard toast={toast} onClose={onClose} />
        </div>
      ))}
    </div>
  );
}

