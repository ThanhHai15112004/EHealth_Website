"use client";

import { ReactNode, useEffect, useRef } from "react";
import { cn } from "@/utils/helpers";

export interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    size?: "sm" | "md" | "lg" | "xl" | "full";
    closeOnOverlayClick?: boolean;
    showCloseButton?: boolean;
    footer?: ReactNode;
    children: ReactNode;
}

const sizeStyles = {
    sm: "max-w-sm",
    md: "max-w-2xl",
    lg: "max-w-3xl",
    xl: "max-w-5xl",
    full: "max-w-6xl",
};

export function Modal({
    isOpen,
    onClose,
    title,
    size = "md",
    closeOnOverlayClick = true,
    showCloseButton = true,
    footer,
    children,
}: ModalProps) {
    const closeButtonRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener("keydown", handleEscape);
            document.body.style.overflow = "hidden";
        }

        return () => {
            document.removeEventListener("keydown", handleEscape);
            document.body.style.overflow = "unset";
        };
    }, [isOpen, onClose]);

    useEffect(() => {
        if (!isOpen) return;

        const timer = window.setTimeout(() => {
            closeButtonRef.current?.focus();
        }, 30);

        return () => window.clearTimeout(timer);
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-3 backdrop-blur-sm sm:p-4"
            onClick={(event) => {
                if (closeOnOverlayClick && event.target === event.currentTarget) {
                    onClose();
                }
            }}
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby={title ? "modal-title" : undefined}
                className={cn(
                    "flex max-h-[min(92vh,960px)] w-full flex-col overflow-hidden rounded-[28px] bg-white shadow-2xl dark:bg-[#111821]",
                    sizeStyles[size],
                )}
                onClick={(event) => event.stopPropagation()}
            >
                {(title || showCloseButton) && (
                    <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-[#2d353e] sm:px-6">
                        {title ? (
                            <h2 id="modal-title" className="pr-4 text-lg font-semibold text-slate-900 dark:text-white">
                                {title}
                            </h2>
                        ) : (
                            <span />
                        )}
                        {showCloseButton && (
                            <button
                                ref={closeButtonRef}
                                aria-label="Đóng"
                                onClick={onClose}
                                className="rounded-2xl p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                            >
                                <span className="material-symbols-outlined text-[20px]">close</span>
                            </button>
                        )}
                    </div>
                )}

                <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4 sm:px-6 sm:py-5">
                    {children}
                </div>

                {footer && (
                    <div className="shrink-0 border-t border-slate-200 bg-white px-5 py-4 dark:border-[#2d353e] dark:bg-[#111821] sm:px-6">
                        <div className="flex flex-wrap items-center justify-end gap-3">
                            {footer}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Modal;
