import { StaticPageLayout } from '@/components/StaticPageLayout';
import { Code, Trophy, Zap, Users, Brain, Target } from 'lucide-react';

const Features = () => {
  const features = [
    {
      icon: <Code className="w-8 h-8" />,
      title: 'Interactive Coding',
      description: 'Practice DSA problems with real-time code execution and instant feedback.'
    },
    {
      icon: <Trophy className="w-8 h-8" />,
      title: 'Competitive Duels',
      description: 'Challenge other developers in head-to-head coding battles.'
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: 'TypeForge',
      description: 'Improve your typing speed with code-specific exercises and challenges.'
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: 'Community Driven',
      description: 'Join a vibrant community of developers learning and growing together.'
    },
    {
      icon: <Brain className="w-8 h-8" />,
      title: 'AI Assistant',
      description: 'Get instant help and explanations from our AI-powered coding assistant.'
    },
    {
      icon: <Target className="w-8 h-8" />,
      title: 'Progress Tracking',
      description: 'Monitor your growth with detailed analytics and performance metrics.'
    }
  ];

  return (
    <StaticPageLayout
      title="Features"
      subtitle="Everything you need to master coding and compete with the best"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 py-12">
        {features.map((feature, index) => (
          <div
            key={index}
            className="glass-panel p-8 rounded-2xl hover:scale-105 transition-transform duration-300"
          >
            <div className="mb-4 theme-accent">
              {feature.icon}
            </div>
            <h3 className="font-heading font-bold text-xl mb-3 theme-text-primary">
              {feature.title}
            </h3>
            <p className="font-body theme-text-secondary">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </StaticPageLayout>
  );
};

export default Features;
