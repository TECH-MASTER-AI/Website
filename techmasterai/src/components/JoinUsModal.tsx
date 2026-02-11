import { memo, useEffect } from 'react';
import { X, Briefcase } from 'lucide-react';

interface JoinUsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const JoinUsModal = memo(({ isOpen, onClose }: JoinUsModalProps) => {
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

  // Handle Apply Now click
  const handleApplyClick = () => {
    window.open('https://forms.gle/4u6dUZqP4RT9S3FLA', '_blank', 'noopener,noreferrer');
  };

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
        className="relative w-full max-w-md"
        style={{
          animation: 'modalSlideIn 0.3s ease-out',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Card */}
        <div
          className="join-us-modal-card relative rounded-2xl p-6 sm:p-8"
          style={{
            background: 'var(--theme-card-bg)',
            border: '1px solid var(--theme-border-primary)',
            boxShadow: '0 20px 60px var(--theme-shadow-primary), 0 0 40px var(--theme-glow-tertiary)',
            backdropFilter: 'blur(20px)',
          }}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 sm:top-4 sm:right-4 w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 touch-manipulation"
            style={{
              background: 'rgba(0, 194, 255, 0.1)',
              border: '1px solid rgba(0, 194, 255, 0.3)',
              color: 'var(--theme-accent)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(0, 194, 255, 0.2)';
              e.currentTarget.style.borderColor = 'rgba(0, 194, 255, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(0, 194, 255, 0.1)';
              e.currentTarget.style.borderColor = 'rgba(0, 194, 255, 0.3)';
            }}
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Icon */}
          <div
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl flex items-center justify-center mb-4 sm:mb-6 mx-auto"
            style={{
              background: 'var(--theme-card-hover-bg)',
              border: '1px solid var(--theme-accent)',
              color: 'var(--theme-accent)',
            }}
          >
            <Briefcase className="w-7 h-7 sm:w-8 sm:h-8" />
          </div>

          {/* Heading */}
          <h2
            className="font-heading text-2xl sm:text-3xl font-bold text-center mb-3 sm:mb-4"
            style={{ color: 'var(--theme-text-primary)' }}
          >
            We're Hiring
          </h2>

          {/* Supporting Copy */}
          <p
            className="font-body text-sm sm:text-base text-center mb-6 sm:mb-8 leading-relaxed"
            style={{ color: 'var(--theme-text-secondary)' }}
          >
            Join our team of innovators building the future of competitive coding. 
            We're looking for passionate developers, designers, and problem-solvers 
            ready to make an impact.
          </p>

          {/* CTA Button */}
          <button
            onClick={handleApplyClick}
            className="w-full inline-flex items-center justify-center px-6 py-3 sm:py-4 text-sm sm:text-base font-medium whitespace-nowrap transition-all duration-300 touch-manipulation"
            style={{
              borderRadius: '9999px',
              color: '#0B0F14',
              fontWeight: '600',
              fontFamily: 'var(--font-heading)',
              background: 'var(--theme-accent)',
              boxShadow: '0 0 20px var(--theme-glow-primary), 0 4px 12px var(--theme-glow-secondary)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.filter = 'brightness(0.9)';
              e.currentTarget.style.boxShadow = '0 0 40px var(--theme-glow-primary), 0 8px 24px var(--theme-glow-secondary)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.filter = 'brightness(1)';
              e.currentTarget.style.boxShadow = '0 0 20px var(--theme-glow-primary), 0 4px 12px var(--theme-glow-secondary)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            Apply Now
          </button>
        </div>
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

        .join-us-modal-card {
          will-change: transform, opacity;
          transform: translateZ(0);
        }

        /* Mobile optimizations */
        @media (max-width: 640px) {
          .join-us-modal-card {
            max-height: calc(100vh - 2rem);
            overflow-y: auto;
            -webkit-overflow-scrolling: touch;
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

JoinUsModal.displayName = 'JoinUsModal';

export default JoinUsModal;
