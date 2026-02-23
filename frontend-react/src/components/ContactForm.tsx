import { useState } from 'react';
import { Send, User, Phone, Mail, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import GlareHover from './GlareHover';

const ContactForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Send email via Web3Forms
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          access_key: '1aa19b6d-ae8a-48c2-9512-4513edd3ff0c',
          to: 'techmaster.hub@gmail.com',
          subject: 'New TechMaster Pre-Registration',
          from_name: 'TechMaster Website',
          name: formData.name,
          phone: formData.phone,
          email: formData.email,
          message: `New pre-registration:\n\nName: ${formData.name}\nPhone: ${formData.phone}\nEmail: ${formData.email}`,
        }),
      });

      const result = await response.json();

      // Store in localStorage for admin panel
      const existingData = JSON.parse(localStorage.getItem('techmasterai_users') || '[]');
      const newEntry = {
        ...formData,
        id: Date.now(),
        submittedAt: new Date().toISOString(),
        type: 'preregister',
      };
      localStorage.setItem('techmasterai_users', JSON.stringify([...existingData, newEntry]));

      if (result.success) {
        setIsSubmitted(true);
        toast.success('Registration successful!');
      } else {
        toast.error('Something went wrong. Please try again.');
      }
    } catch (error) {
      toast.error('Failed to submit. Please try again.');
    }

    setIsSubmitting(false);

    // Reset after showing success
    setTimeout(() => {
      setIsSubmitted(false);
      setFormData({ name: '', phone: '', email: '' });
    }, 3000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Limit phone number to 10 digits
    if (name === 'phone') {
      const numericValue = value.replace(/\D/g, ''); // Remove non-numeric characters
      if (numericValue.length <= 10) {
        setFormData({ ...formData, [name]: numericValue });
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  if (isSubmitted) {
    return (
      <div className="modal-card-wrapper relative">
        {/* Glow Layer */}
        <div 
          className="modal-card-glow absolute inset-0 rounded-2xl pointer-events-none"
          style={{
            boxShadow: '0 0 30px var(--theme-glow-secondary), 0 8px 32px var(--theme-shadow-primary)',
            zIndex: 0,
          }}
        />
        
        <div 
          className="modal-card-inner relative w-full max-w-2xl mx-auto rounded-2xl p-6 sm:p-8 text-center transition-all duration-300 overflow-hidden" 
          style={{ 
            background: 'var(--theme-card-bg)', 
            border: '1px solid var(--theme-border-primary)',
            backdropFilter: 'blur(20px)',
            zIndex: 1,
          }}
        >
          <CheckCircle 
            className="w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-4" 
            style={{ color: 'var(--theme-accent)' }} 
          />
          <h3 
            className="font-heading text-xl sm:text-2xl font-bold mb-2" 
            style={{ color: 'var(--theme-text-primary)' }}
          >
            You're on the list!
          </h3>
          <p 
            className="font-body text-sm sm:text-base" 
            style={{ color: 'var(--theme-text-secondary)' }}
          >
            We'll notify you when we launch. Check your email for confirmation.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-card-wrapper relative">
      {/* Glow Layer */}
      <div 
        className="modal-card-glow absolute inset-0 rounded-2xl pointer-events-none"
        style={{
          boxShadow: '0 0 30px var(--theme-glow-secondary), 0 8px 32px var(--theme-shadow-primary)',
          zIndex: 0,
        }}
      />
      
      <form
        onSubmit={handleSubmit}
        className="modal-card-inner relative w-full max-w-2xl mx-auto rounded-2xl p-6 sm:p-8 transition-all duration-300 overflow-hidden"
        style={{ 
          background: 'var(--theme-card-bg)', 
          border: '1px solid var(--theme-border-primary)',
          backdropFilter: 'blur(20px)',
          zIndex: 1,
        }}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Name Input */}
          <div className="space-y-2">
            <label 
              htmlFor="name" 
              className="font-body text-sm font-medium block" 
              style={{ color: 'var(--theme-text-primary)' }}
            >
              Full Name
            </label>
            <div className="relative group">
              <User 
                className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 transition-colors pointer-events-none" 
                style={{ color: 'var(--theme-text-muted)' }} 
              />
              <input
                id="name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="John Doe"
                required
                className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 rounded-lg font-body text-sm transition-all duration-200"
                style={{ 
                  background: 'var(--theme-bg-tertiary)',
                  border: '1px solid var(--theme-border-secondary)',
                  color: 'var(--theme-text-primary)',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = 'var(--theme-accent)';
                  e.currentTarget.style.boxShadow = '0 0 0 3px var(--theme-glow-tertiary)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'var(--theme-border-secondary)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
            </div>
          </div>

          {/* Phone Input */}
          <div className="space-y-2">
            <label 
              htmlFor="phone" 
              className="font-body text-sm font-medium block" 
              style={{ color: 'var(--theme-text-primary)' }}
            >
              Phone Number
            </label>
            <div className="relative group">
              <Phone 
                className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 transition-colors pointer-events-none" 
                style={{ color: 'var(--theme-text-muted)' }} 
              />
              <input
                id="phone"
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="1234567890"
                required
                maxLength={10}
                pattern="[0-9]{10}"
                className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 rounded-lg font-body text-sm transition-all duration-200"
                style={{ 
                  background: 'var(--theme-bg-tertiary)',
                  border: '1px solid var(--theme-border-secondary)',
                  color: 'var(--theme-text-primary)',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = 'var(--theme-accent)';
                  e.currentTarget.style.boxShadow = '0 0 0 3px var(--theme-glow-tertiary)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'var(--theme-border-secondary)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
            </div>
          </div>

          {/* Email Input */}
          <div className="space-y-2">
            <label 
              htmlFor="email" 
              className="font-body text-sm font-medium block" 
              style={{ color: 'var(--theme-text-primary)' }}
            >
              Email Address
            </label>
            <div className="relative group">
              <Mail 
                className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 transition-colors pointer-events-none" 
                style={{ color: 'var(--theme-text-muted)' }} 
              />
              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                required
                className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 rounded-lg font-body text-sm transition-all duration-200"
                style={{ 
                  background: 'var(--theme-bg-tertiary)',
                  border: '1px solid var(--theme-border-secondary)',
                  color: 'var(--theme-text-primary)',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = 'var(--theme-accent)';
                  e.currentTarget.style.boxShadow = '0 0 0 3px var(--theme-glow-tertiary)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'var(--theme-border-secondary)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <GlareHover
          width="100%"
          height="auto"
          background="transparent"
          borderRadius="0.5rem"
          borderColor="transparent"
          glareColor="#00C2FF"
          glareOpacity={0.5}
          glareAngle={-45}
          glareSize={150}
          transitionDuration={600}
        >
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 rounded-lg font-heading text-sm sm:text-base font-semibold transition-all duration-300 touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: 'var(--theme-accent)',
              color: 'var(--theme-bg-primary)',
              boxShadow: '0 0 20px var(--theme-glow-primary), 0 4px 12px var(--theme-glow-secondary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
            }}
            onMouseEnter={(e) => {
              if (!isSubmitting) {
                e.currentTarget.style.filter = 'brightness(0.9)';
                e.currentTarget.style.boxShadow = '0 0 40px var(--theme-glow-primary), 0 8px 24px var(--theme-glow-secondary)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.filter = 'brightness(1)';
              e.currentTarget.style.boxShadow = '0 0 20px var(--theme-glow-primary), 0 4px 12px var(--theme-glow-secondary)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            {isSubmitting ? (
              <>
                <div 
                  className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-t-transparent rounded-full animate-spin" 
                  style={{ 
                    borderColor: 'var(--theme-bg-primary)',
                    borderTopColor: 'transparent',
                  }} 
                />
                <span style={{ lineHeight: 1 }}>Submitting...</span>
              </>
            ) : (
              <>
                <span style={{ lineHeight: 1 }}>Join Waitlist</span>
                <Send className="w-4 h-4 sm:w-5 sm:h-5" style={{ flexShrink: 0 }} />
              </>
            )}
          </button>
        </GlareHover>
        
        {/* Trust Microcopy */}
        <p 
          className="font-body text-xs text-center mt-4" 
          style={{ color: 'var(--theme-text-muted)' }}
        >
          No spam. Early access only. Unsubscribe anytime.
        </p>
      </form>
    </div>
  );
};

export default ContactForm;
