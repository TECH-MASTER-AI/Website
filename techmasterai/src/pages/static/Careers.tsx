import { StaticPageLayout } from '@/components/StaticPageLayout';
import { Briefcase, Heart, Rocket } from 'lucide-react';

const Careers = () => {
  const openings = [
    {
      title: 'Senior Full Stack Engineer',
      type: 'Full-time',
      location: 'Remote',
      description: 'Build scalable features for our coding platform using React, Node.js, and PostgreSQL.'
    },
    {
      title: 'AI/ML Engineer',
      type: 'Full-time',
      location: 'Remote',
      description: 'Develop and improve our AI coding assistant and recommendation systems.'
    },
    {
      title: 'Product Designer',
      type: 'Full-time',
      location: 'Remote',
      description: 'Design beautiful and intuitive user experiences for developers worldwide.'
    },
    {
      title: 'DevOps Engineer',
      type: 'Full-time',
      location: 'Remote',
      description: 'Manage infrastructure, CI/CD pipelines, and ensure platform reliability.'
    }
  ];

  return (
    <StaticPageLayout
      title="Join Our Team"
      subtitle="Help us build the future of coding education"
    >
      <div className="py-12 space-y-16">
        {/* Why Join Section */}
        <section>
          <h2 className="font-heading font-bold text-3xl theme-text-primary mb-8 text-center">
            Why Join TechMasterAI?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="glass-panel p-8 rounded-2xl text-center">
              <Rocket className="w-12 h-12 theme-accent mx-auto mb-4" />
              <h3 className="font-heading font-bold text-xl mb-3 theme-text-primary">
                Fast Growth
              </h3>
              <p className="font-body theme-text-secondary">
                Join a rapidly growing startup with ambitious goals and unlimited potential.
              </p>
            </div>
            <div className="glass-panel p-8 rounded-2xl text-center">
              <Heart className="w-12 h-12 theme-accent mx-auto mb-4" />
              <h3 className="font-heading font-bold text-xl mb-3 theme-text-primary">
                Great Culture
              </h3>
              <p className="font-body theme-text-secondary">
                Work with passionate people who love coding and building great products.
              </p>
            </div>
            <div className="glass-panel p-8 rounded-2xl text-center">
              <Briefcase className="w-12 h-12 theme-accent mx-auto mb-4" />
              <h3 className="font-heading font-bold text-xl mb-3 theme-text-primary">
                Remote First
              </h3>
              <p className="font-body theme-text-secondary">
                Work from anywhere with flexible hours and a focus on work-life balance.
              </p>
            </div>
          </div>
        </section>

        {/* Open Positions */}
        <section>
          <h2 className="font-heading font-bold text-3xl theme-text-primary mb-8">
            Open Positions
          </h2>
          <div className="space-y-6">
            {openings.map((job, index) => (
              <div key={index} className="glass-panel p-8 rounded-2xl hover:scale-[1.02] transition-transform">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                  <h3 className="font-heading font-bold text-2xl theme-text-primary">
                    {job.title}
                  </h3>
                  <div className="flex gap-3">
                    <span className="px-3 py-1 rounded-full text-sm font-semibold" style={{
                      background: 'var(--theme-card-hover-bg)',
                      color: 'var(--theme-accent)'
                    }}>
                      {job.type}
                    </span>
                    <span className="px-3 py-1 rounded-full text-sm font-semibold" style={{
                      background: 'var(--theme-card-hover-bg)',
                      color: 'var(--theme-text-secondary)'
                    }}>
                      {job.location}
                    </span>
                  </div>
                </div>
                <p className="font-body theme-text-secondary mb-6">
                  {job.description}
                </p>
                <a
                  href="https://docs.google.com/forms/d/e/1FAIpQLSeq6hhmBAl-AUXls5U86qCBtoO828gLO2AXOpBk0DeQfo322A/viewform"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cyber-button inline-block py-2 px-6 rounded-full font-heading font-semibold"
                >
                  Apply Now
                </a>
              </div>
            ))}
          </div>
        </section>
      </div>
    </StaticPageLayout>
  );
};

export default Careers;
