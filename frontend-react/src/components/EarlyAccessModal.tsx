import { memo, useEffect } from 'react';
import { X } from 'lucide-react';
import ContactForm from './ContactForm';

interface EarlyAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const EarlyAccessModal = memo(({ isOpen, onClose }: EarlyAccessModalProps) => {
  // Handle ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      style={{
        background: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(6px)',
        animation: 'fadeIn 0.2s ease-out',
      }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl"
        style={{
          animation: 'modalSlideIn 0.3s ease-out',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button - Theme Matching */}
        <button
          onClick={onClose}
          className="absolute -top-2 -right-2 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 touch-manipulation z-[9999] shadow-lg"
          style={{
            background: 'var(--theme-card-bg)',
            border: '2px solid var(--theme-accent)',
            color: 'var(--theme-accent)',
            boxShadow: '0 4px 12px var(--theme-glow-secondary), 0 0 20px var(--theme-glow-tertiary)',
            backdropFilter: 'blur(10px)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--theme-accent)';
            e.currentTarget.style.color = 'var(--theme-bg-primary)';
            e.currentTarget.style.transform = 'scale(1.15)';
            e.currentTarget.style.boxShadow = '0 6px 16px var(--theme-glow-primary), 0 0 30px var(--theme-glow-secondary)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'var(--theme-card-bg)';
            e.currentTarget.style.color = 'var(--theme-accent)';
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 4px 12px var(--theme-glow-secondary), 0 0 20px var(--theme-glow-tertiary)';
          }}
          aria-label="Close modal"
        >
          <X className="w-6 h-6 font-bold" strokeWidth={3} />
        </button>

        {/* Contact Form */}
        <ContactForm />
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes modalSlideIn {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        /* Close button specific styles - Theme matching */
        .early-access-close-btn {
          position: absolute !important;
          top: -0.5rem !important;
          right: -0.5rem !important;
          z-index: 9999 !important;
          background: var(--theme-card-bg) !important;
          border: 2px solid var(--theme-accent) !important;
          color: var(--theme-accent) !important;
          box-shadow: 0 4px 12px var(--theme-glow-secondary), 0 0 20px var(--theme-glow-tertiary) !important;
          backdrop-filter: blur(10px) !important;
          width: 3rem !important;
          height: 3rem !important;
          border-radius: 50% !important;
        }

        .early-access-close-btn:hover {
          background: var(--theme-accent) !important;
          color: var(--theme-bg-primary) !important;
          transform: scale(1.15) !important;
          box-shadow: 0 6px 16px var(--theme-glow-primary), 0 0 30px var(--theme-glow-secondary) !important;
        }

        /* Mobile optimizations */
        @media (max-width: 640px) {
          .early-access-modal {
            max-height: calc(100vh - 2rem);
            overflow-y: auto;
            -webkit-overflow-scrolling: touch;
          }
          
          .early-access-close-btn {
            top: -0.25rem !important;
            right: -0.25rem !important;
            width: 2.75rem !important;
            height: 2.75rem !important;
          }
        }

        /* Reduced motion support */
        @media (prefers-reduced-motion: reduce) {
          @keyframes fadeIn {
            from, to {
              opacity: 1;
            }
          }

          @keyframes modalSlideIn {
            from, to {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }
        }
      `}</style>
    </div>
  );
});

EarlyAccessModal.displayName = 'EarlyAccessModal';

export default EarlyAccessModal;