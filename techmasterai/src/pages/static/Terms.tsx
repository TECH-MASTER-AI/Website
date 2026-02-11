import { StaticPageLayout } from '@/components/StaticPageLayout';

const Terms = () => {
  return (
    <StaticPageLayout
      title="Terms & Conditions"
      subtitle="Last updated: February 11, 2026"
    >
      <div className="py-12 max-w-4xl mx-auto">
        <div className="glass-panel p-8 md:p-12 rounded-2xl space-y-8 font-body theme-text-secondary">
          <section>
            <h2 className="font-heading font-bold text-2xl theme-text-primary mb-4">
              1. Acceptance of Terms
            </h2>
            <p className="leading-relaxed">
              By accessing and using TechMasterAI, you accept and agree to be bound by the terms and provisions 
              of this agreement. If you do not agree to these terms, please do not use our service.
            </p>
          </section>

          <section>
            <h2 className="font-heading font-bold text-2xl theme-text-primary mb-4">
              2. Use License
            </h2>
            <p className="leading-relaxed mb-4">
              Permission is granted to temporarily access the materials on TechMasterAI for personal, 
              non-commercial use only. This is the grant of a license, not a transfer of title, and under 
              this license you may not:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Modify or copy the materials</li>
              <li>Use the materials for commercial purposes</li>
              <li>Attempt to reverse engineer any software</li>
              <li>Remove any copyright or proprietary notations</li>
              <li>Transfer the materials to another person</li>
            </ul>
          </section>

          <section>
            <h2 className="font-heading font-bold text-2xl theme-text-primary mb-4">
              3. User Accounts
            </h2>
            <p className="leading-relaxed">
              You are responsible for maintaining the confidentiality of your account and password. You agree 
              to accept responsibility for all activities that occur under your account.
            </p>
          </section>

          <section>
            <h2 className="font-heading font-bold text-2xl theme-text-primary mb-4">
              4. Code Submissions
            </h2>
            <p className="leading-relaxed">
              By submitting code to our platform, you grant TechMasterAI a non-exclusive license to use, 
              reproduce, and display your submissions for the purpose of providing our services. You retain 
              all ownership rights to your code.
            </p>
          </section>

          <section>
            <h2 className="font-heading font-bold text-2xl theme-text-primary mb-4">
              5. Prohibited Conduct
            </h2>
            <p className="leading-relaxed mb-4">
              You agree not to:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Violate any applicable laws or regulations</li>
              <li>Infringe on intellectual property rights</li>
              <li>Transmit malicious code or viruses</li>
              <li>Harass or harm other users</li>
              <li>Attempt to gain unauthorized access</li>
              <li>Use automated systems to access the service</li>
            </ul>
          </section>

          <section>
            <h2 className="font-heading font-bold text-2xl theme-text-primary mb-4">
              6. Termination
            </h2>
            <p className="leading-relaxed">
              We may terminate or suspend your account and access to the service immediately, without prior 
              notice, for any breach of these Terms.
            </p>
          </section>

          <section>
            <h2 className="font-heading font-bold text-2xl theme-text-primary mb-4">
              7. Disclaimer
            </h2>
            <p className="leading-relaxed">
              The materials on TechMasterAI are provided on an 'as is' basis. We make no warranties, expressed 
              or implied, and hereby disclaim all other warranties including, without limitation, implied 
              warranties of merchantability, fitness for a particular purpose, or non-infringement.
            </p>
          </section>

          <section>
            <h2 className="font-heading font-bold text-2xl theme-text-primary mb-4">
              8. Contact
            </h2>
            <p className="leading-relaxed">
              Questions about the Terms of Service should be sent to{' '}
              <a href="mailto:support@techmasterai.in" className="theme-accent hover:underline">
                support@techmasterai.in
              </a>
            </p>
          </section>
        </div>
      </div>
    </StaticPageLayout>
  );
};

export default Terms;
