import { StaticPageLayout } from '@/components/StaticPageLayout';

const Privacy = () => {
  return (
    <StaticPageLayout
      title="Privacy Policy"
      subtitle="Last updated: February 11, 2026"
    >
      <div className="py-12 max-w-4xl mx-auto">
        <div className="glass-panel p-8 md:p-12 rounded-2xl space-y-8 font-body theme-text-secondary">
          <section>
            <h2 className="font-heading font-bold text-2xl theme-text-primary mb-4">
              1. Information We Collect
            </h2>
            <p className="leading-relaxed mb-4">
              We collect information you provide directly to us, including:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Account information (email, username, password)</li>
              <li>Profile information (display name, avatar)</li>
              <li>Coding submissions and practice history</li>
              <li>Usage data and analytics</li>
            </ul>
          </section>

          <section>
            <h2 className="font-heading font-bold text-2xl theme-text-primary mb-4">
              2. How We Use Your Information
            </h2>
            <p className="leading-relaxed mb-4">
              We use the information we collect to:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Provide, maintain, and improve our services</li>
              <li>Process your coding submissions and track progress</li>
              <li>Send you technical notices and support messages</li>
              <li>Respond to your comments and questions</li>
              <li>Analyze usage patterns to improve user experience</li>
            </ul>
          </section>

          <section>
            <h2 className="font-heading font-bold text-2xl theme-text-primary mb-4">
              3. Information Sharing
            </h2>
            <p className="leading-relaxed">
              We do not sell your personal information. We may share your information only in the following circumstances:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4 mt-4">
              <li>With your consent</li>
              <li>To comply with legal obligations</li>
              <li>To protect our rights and prevent fraud</li>
              <li>With service providers who assist our operations</li>
            </ul>
          </section>

          <section>
            <h2 className="font-heading font-bold text-2xl theme-text-primary mb-4">
              4. Data Security
            </h2>
            <p className="leading-relaxed">
              We implement appropriate technical and organizational measures to protect your personal information 
              against unauthorized access, alteration, disclosure, or destruction.
            </p>
          </section>

          <section>
            <h2 className="font-heading font-bold text-2xl theme-text-primary mb-4">
              5. Your Rights
            </h2>
            <p className="leading-relaxed mb-4">
              You have the right to:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Access your personal information</li>
              <li>Correct inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Object to processing of your data</li>
              <li>Export your data</li>
            </ul>
          </section>

          <section>
            <h2 className="font-heading font-bold text-2xl theme-text-primary mb-4">
              6. Contact Us
            </h2>
            <p className="leading-relaxed">
              If you have questions about this Privacy Policy, please contact us at{' '}
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

export default Privacy;
