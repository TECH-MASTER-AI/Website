import { StaticPageLayout } from '@/components/StaticPageLayout';
import { Shield, Lock, Eye, AlertTriangle } from 'lucide-react';

const Security = () => {
  return (
    <StaticPageLayout
      title="Security"
      subtitle="How we protect your data and ensure platform security"
    >
      <div className="py-12 space-y-12">
        {/* Security Measures */}
        <section>
          <h2 className="font-heading font-bold text-3xl theme-text-primary mb-8 text-center">
            Our Security Measures
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="glass-panel p-8 rounded-2xl">
              <Shield className="w-12 h-12 theme-accent mb-4" />
              <h3 className="font-heading font-bold text-xl mb-3 theme-text-primary">
                Data Encryption
              </h3>
              <p className="font-body theme-text-secondary">
                All data is encrypted in transit using TLS 1.3 and at rest using AES-256 encryption.
              </p>
            </div>
            <div className="glass-panel p-8 rounded-2xl">
              <Lock className="w-12 h-12 theme-accent mb-4" />
              <h3 className="font-heading font-bold text-xl mb-3 theme-text-primary">
                Secure Authentication
              </h3>
              <p className="font-body theme-text-secondary">
                We use industry-standard authentication with bcrypt password hashing and secure session management.
              </p>
            </div>
            <div className="glass-panel p-8 rounded-2xl">
              <Eye className="w-12 h-12 theme-accent mb-4" />
              <h3 className="font-heading font-bold text-xl mb-3 theme-text-primary">
                Regular Audits
              </h3>
              <p className="font-body theme-text-secondary">
                Our systems undergo regular security audits and penetration testing by third-party experts.
              </p>
            </div>
            <div className="glass-panel p-8 rounded-2xl">
              <AlertTriangle className="w-12 h-12 theme-accent mb-4" />
              <h3 className="font-heading font-bold text-xl mb-3 theme-text-primary">
                Incident Response
              </h3>
              <p className="font-body theme-text-secondary">
                We have a dedicated incident response team ready to handle any security concerns 24/7.
              </p>
            </div>
          </div>
        </section>

        {/* Best Practices */}
        <section className="glass-panel p-8 md:p-12 rounded-2xl">
          <h2 className="font-heading font-bold text-2xl theme-text-primary mb-6">
            Security Best Practices for Users
          </h2>
          <div className="space-y-4 font-body theme-text-secondary">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-1" style={{ background: 'var(--theme-accent)' }}>
                <span className="text-xs font-bold" style={{ color: 'var(--theme-bg-primary)' }}>1</span>
              </div>
              <p>Use a strong, unique password for your TechMasterAI account</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-1" style={{ background: 'var(--theme-accent)' }}>
                <span className="text-xs font-bold" style={{ color: 'var(--theme-bg-primary)' }}>2</span>
              </div>
              <p>Never share your password or account credentials with anyone</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-1" style={{ background: 'var(--theme-accent)' }}>
                <span className="text-xs font-bold" style={{ color: 'var(--theme-bg-primary)' }}>3</span>
              </div>
              <p>Log out from shared or public computers after using TechMasterAI</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-1" style={{ background: 'var(--theme-accent)' }}>
                <span className="text-xs font-bold" style={{ color: 'var(--theme-bg-primary)' }}>4</span>
              </div>
              <p>Report any suspicious activity or security concerns immediately</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-1" style={{ background: 'var(--theme-accent)' }}>
                <span className="text-xs font-bold" style={{ color: 'var(--theme-bg-primary)' }}>5</span>
              </div>
              <p>Keep your email address up to date for security notifications</p>
            </div>
          </div>
        </section>

        {/* Contact for Security Concerns */}
        <section className="glass-panel p-8 md:p-12 rounded-2xl text-center">
          <h2 className="font-heading font-bold text-2xl theme-text-primary mb-4">
            Security Concerns?
          </h2>
          <p className="font-body theme-text-secondary mb-6 max-w-2xl mx-auto">
            If you have any security concerns or questions, please contact our support team.
          </p>
          <a
            href="mailto:support@techmasterai.in"
            className="theme-accent hover:underline font-semibold text-lg"
          >
            support@techmasterai.in
          </a>
        </section>
      </div>
    </StaticPageLayout>
  );
};

export default Security;
