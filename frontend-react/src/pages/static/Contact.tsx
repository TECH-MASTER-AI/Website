import { StaticPageLayout } from '@/components/StaticPageLayout';
import { Mail, MessageCircle } from 'lucide-react';

const Contact = () => {
  return (
    <StaticPageLayout
      title="Get in Touch"
      subtitle="We'd love to hear from you"
    >
      <div className="py-12 max-w-4xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Email */}
          <div className="glass-panel p-8 rounded-2xl text-center">
            <Mail className="w-12 h-12 theme-accent mx-auto mb-4" />
            <h3 className="font-heading font-bold text-xl mb-3 theme-text-primary">
              Email Us
            </h3>
            <p className="font-body theme-text-secondary mb-4">
              For general inquiries and support
            </p>
            <a
              href="mailto:support@techmasterai.in"
              className="theme-accent hover:underline font-semibold"
            >
              support@techmasterai.in
            </a>
          </div>

          {/* Discord */}
          <div className="glass-panel p-8 rounded-2xl text-center">
            <MessageCircle className="w-12 h-12 theme-accent mx-auto mb-4" />
            <h3 className="font-heading font-bold text-xl mb-3 theme-text-primary">
              Join Discord
            </h3>
            <p className="font-body theme-text-secondary mb-4">
              Chat with our community
            </p>
            <a
              href="https://discord.gg/VuadJ44xEz"
              target="_blank"
              rel="noopener noreferrer"
              className="theme-accent hover:underline font-semibold"
            >
              Join Server
            </a>
          </div>
        </div>

        {/* Additional Contact Info */}
        <div className="glass-panel p-8 md:p-12 rounded-2xl mt-8">
          <h2 className="font-heading font-bold text-2xl theme-text-primary mb-6 text-center">
            Other Ways to Connect
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <a
              href="https://chat.whatsapp.com/LTgvgy87Xdj5x8AKtbaF1c"
              target="_blank"
              rel="noopener noreferrer"
              className="glass-panel p-6 rounded-xl text-center hover:scale-105 transition-transform"
            >
              <h3 className="font-heading font-semibold theme-text-primary mb-2">WhatsApp</h3>
              <p className="font-body text-sm theme-text-secondary">Join our community group</p>
            </a>
            <a
              href="https://www.linkedin.com/company/techmasterai/"
              target="_blank"
              rel="noopener noreferrer"
              className="glass-panel p-6 rounded-xl text-center hover:scale-105 transition-transform"
            >
              <h3 className="font-heading font-semibold theme-text-primary mb-2">LinkedIn</h3>
              <p className="font-body text-sm theme-text-secondary">Follow us for updates</p>
            </a>
            <a
              href="https://www.instagram.com/officialtechmasterai?igsh=MWdoempsZmxvbThuZA=="
              target="_blank"
              rel="noopener noreferrer"
              className="glass-panel p-6 rounded-xl text-center hover:scale-105 transition-transform"
            >
              <h3 className="font-heading font-semibold theme-text-primary mb-2">Instagram</h3>
              <p className="font-body text-sm theme-text-secondary">See what we're up to</p>
            </a>
          </div>
        </div>
      </div>
    </StaticPageLayout>
  );
};

export default Contact;
