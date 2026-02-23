import { StaticPageLayout } from '@/components/StaticPageLayout';
import { Target, Users, Zap } from 'lucide-react';

const About = () => {
  return (
    <StaticPageLayout
      title="About TechMasterAI"
      subtitle="Empowering developers to compete, learn, and grow together"
    >
      <div className="py-12 space-y-16">
        {/* Mission Section */}
        <section className="glass-panel p-8 md:p-12 rounded-2xl">
          <div className="flex items-center gap-4 mb-6">
            <Target className="w-10 h-10 theme-accent" />
            <h2 className="font-heading font-bold text-3xl theme-text-primary">
              Our Mission
            </h2>
          </div>
          <p className="font-body text-lg theme-text-secondary leading-relaxed">
            At TechMasterAI, we believe that the best way to learn coding is through practice, competition, and community. 
            Our platform combines interactive DSA problems, competitive coding duels, and AI-powered assistance to create 
            the ultimate learning environment for developers of all levels.
          </p>
        </section>

        {/* Values Section */}
        <section>
          <h2 className="font-heading font-bold text-3xl theme-text-primary mb-8 text-center">
            Our Values
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="glass-panel p-8 rounded-2xl text-center">
              <Users className="w-12 h-12 theme-accent mx-auto mb-4" />
              <h3 className="font-heading font-bold text-xl mb-3 theme-text-primary">
                Community First
              </h3>
              <p className="font-body theme-text-secondary">
                We build features that bring developers together and foster collaborative learning.
              </p>
            </div>
            <div className="glass-panel p-8 rounded-2xl text-center">
              <Zap className="w-12 h-12 theme-accent mx-auto mb-4" />
              <h3 className="font-heading font-bold text-xl mb-3 theme-text-primary">
                Innovation
              </h3>
              <p className="font-body theme-text-secondary">
                We constantly push boundaries with AI-powered tools and gamified learning experiences.
              </p>
            </div>
            <div className="glass-panel p-8 rounded-2xl text-center">
              <Target className="w-12 h-12 theme-accent mx-auto mb-4" />
              <h3 className="font-heading font-bold text-xl mb-3 theme-text-primary">
                Excellence
              </h3>
              <p className="font-body theme-text-secondary">
                We're committed to providing the highest quality coding education and practice platform.
              </p>
            </div>
          </div>
        </section>

        {/* Story Section */}
        <section className="glass-panel p-8 md:p-12 rounded-2xl">
          <h2 className="font-heading font-bold text-3xl theme-text-primary mb-6">
            Our Story
          </h2>
          <div className="space-y-4 font-body text-lg theme-text-secondary leading-relaxed">
            <p>
              TechMasterAI was founded in 2025 by a team of passionate developers who saw a gap in the market 
              for a truly engaging and competitive coding practice platform.
            </p>
            <p>
              We started with a simple idea: make coding practice fun, competitive, and social. Today, we serve 
              thousands of developers worldwide, helping them prepare for interviews, improve their skills, and 
              connect with like-minded peers.
            </p>
            <p>
              Our platform has evolved to include TypeForge for typing practice, AI-powered assistance, and 
              real-time competitive duels. We're just getting started, and we're excited to continue building 
              the future of coding education.
            </p>
          </div>
        </section>
      </div>
    </StaticPageLayout>
  );
};

export default About;
