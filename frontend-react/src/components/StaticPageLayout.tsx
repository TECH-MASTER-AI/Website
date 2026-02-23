import { ReactNode } from 'react';
import Header from './Header';
import Footer from './Footer';

interface StaticPageLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

export const StaticPageLayout = ({ children, title, subtitle }: StaticPageLayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--theme-bg-primary)' }}>
      <Header />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-16 px-4">
        <div className="container mx-auto max-w-6xl text-center">
          <h1 className="font-heading font-bold text-4xl md:text-5xl lg:text-6xl mb-6 theme-text-primary">
            {title}
          </h1>
          {subtitle && (
            <p className="font-body text-lg md:text-xl theme-text-secondary max-w-3xl mx-auto">
              {subtitle}
            </p>
          )}
        </div>
      </section>

      {/* Content */}
      <main className="flex-1 px-4 pb-20">
        <div className="container mx-auto max-w-6xl">
          {children}
        </div>
      </main>

      <Footer />
    </div>
  );
};
