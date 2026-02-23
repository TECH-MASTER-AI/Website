import { StaticPageLayout } from '@/components/StaticPageLayout';

const Cookies = () => {
  return (
    <StaticPageLayout
      title="Cookie Policy"
      subtitle="Last updated: February 11, 2026"
    >
      <div className="py-12 max-w-4xl mx-auto">
        <div className="glass-panel p-8 md:p-12 rounded-2xl space-y-8 font-body theme-text-secondary">
          <section>
            <h2 className="font-heading font-bold text-2xl theme-text-primary mb-4">
              What Are Cookies?
            </h2>
            <p className="leading-relaxed">
              Cookies are small text files that are placed on your device when you visit our website. They help 
              us provide you with a better experience by remembering your preferences and understanding how you 
              use our platform.
            </p>
          </section>

          <section>
            <h2 className="font-heading font-bold text-2xl theme-text-primary mb-4">
              How We Use Cookies
            </h2>
            <div className="space-y-6">
              <div>
                <h3 className="font-heading font-semibold text-lg theme-text-primary mb-2">
                  Essential Cookies
                </h3>
                <p className="leading-relaxed">
                  These cookies are necessary for the website to function properly. They enable core functionality 
                  such as security, authentication, and session management.
                </p>
              </div>
              <div>
                <h3 className="font-heading font-semibold text-lg theme-text-primary mb-2">
                  Preference Cookies
                </h3>
                <p className="leading-relaxed">
                  These cookies remember your preferences and settings, such as your theme choice (light/dark mode) 
                  and language preferences.
                </p>
              </div>
              <div>
                <h3 className="font-heading font-semibold text-lg theme-text-primary mb-2">
                  Analytics Cookies
                </h3>
                <p className="leading-relaxed">
                  We use analytics cookies to understand how visitors interact with our website. This helps us 
                  improve our services and user experience.
                </p>
              </div>
              <div>
                <h3 className="font-heading font-semibold text-lg theme-text-primary mb-2">
                  Performance Cookies
                </h3>
                <p className="leading-relaxed">
                  These cookies help us monitor and improve the performance of our platform by collecting 
                  information about page load times and error messages.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="font-heading font-bold text-2xl theme-text-primary mb-4">
              Managing Cookies
            </h2>
            <p className="leading-relaxed mb-4">
              You can control and manage cookies in various ways:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Most browsers allow you to refuse or accept cookies</li>
              <li>You can delete cookies that have already been set</li>
              <li>You can set your browser to notify you when cookies are being sent</li>
              <li>Note that disabling cookies may affect the functionality of our platform</li>
            </ul>
          </section>

          <section>
            <h2 className="font-heading font-bold text-2xl theme-text-primary mb-4">
              Third-Party Cookies
            </h2>
            <p className="leading-relaxed">
              We may use third-party services that set cookies on your device. These services include analytics 
              providers and authentication services. These third parties have their own privacy policies.
            </p>
          </section>

          <section>
            <h2 className="font-heading font-bold text-2xl theme-text-primary mb-4">
              Updates to This Policy
            </h2>
            <p className="leading-relaxed">
              We may update this Cookie Policy from time to time. We will notify you of any changes by posting 
              the new policy on this page and updating the "Last updated" date.
            </p>
          </section>

          <section>
            <h2 className="font-heading font-bold text-2xl theme-text-primary mb-4">
              Contact Us
            </h2>
            <p className="leading-relaxed">
              If you have questions about our use of cookies, please contact us at{' '}
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

export default Cookies;
