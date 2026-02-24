/**
 * TechMasterAI Knowledge Base - Centralized & Smart Matching
 * Priority: Knowledge Base → AI API → Friendly Fallback
 */

export const TECHMASTERAI_KNOWLEDGE = {
  // Company Information
  company: {
    name: "TechMasterAI",
    tagline: "Master Code. Win Competitions.",
    description: "The premier platform where developers showcase their skills, compete in real-world challenges, and unlock career opportunities.",
    mission: "Empowering developers to compete and grow through innovative coding challenges and community collaboration.",
    vision: "To become the world's leading platform for competitive programming and developer skill development.",
    founded: "2024",
    headquarters: "India",
    website: "https://techmaster.ai",
    email: "techmaster.hub@gmail.com"
  },

  // Leadership Team
  team: {
    founder: {
      name: "Adarsh Kumar",
      role: "Founder/CFO",
      email: "adarshcollab09@gmail.com",
      linkedin: "https://www.linkedin.com/in/adarsh-kumar-300061331/",
      photo: "/adarsh.jpeg",
      bio: "Visionary founder of TechMasterAI, passionate about creating opportunities for developers worldwide."
    },
    ceo: {
      name: "Akshat Singh",
      role: "Co-Founder/CEO",
      email: "akshatthakur823@gmail.com",
      linkedin: "https://www.linkedin.com/in/akshat-singh-1103a0370/",
      photo: "/akshat.png",
      bio: "Leading TechMasterAI's strategic vision and growth initiatives."
    },
    managingDirector: {
      name: "Kartavya Rana",
      role: "Managing Director",
      email: "kartavyarana2004@gmail.com",
      linkedin: "https://www.linkedin.com/in/kartavya-rana-970945280/",
      photo: "/kartavya.jpeg",
      bio: "Overseeing operations and ensuring excellence in platform delivery."
    },
    cmo: {
      name: "Divyam",
      role: "Chief Marketing Officer",
      email: "divyam11nov@gmail.com",
      linkedin: "https://www.linkedin.com/in/divyam-1a683430a/",
      photo: "/divyam.png",
      bio: "Driving marketing strategies and community engagement initiatives."
    },
    cto: {
      name: "Amey Rathore",
      role: "Chief Technology Officer",
      email: "ameycollab069@gmail.com",
      linkedin: "https://www.linkedin.com/in/amey-rathore-92146535a/",
      photo: "/amey.png",
      bio: "Leading technical innovation and platform architecture."
    }
  },

  // Platform Features
  features: [
    {
      name: "Live Coding",
      description: "Collaborate in real time. Write, debug, and build together on the same codebase, as if your team shares one keyboard.",
      icon: "💻"
    },
    {
      name: "1v1 CodeArena",
      description: "Challenge your peers in head-to-head coding battles where logic meets speed and precision decides the winner.",
      icon: "⚔️"
    },
    {
      name: "Practice DSA",
      description: "Train your problem-solving instincts with 5,000+ high-quality DSA questions. From fundamentals to interview-grade challenges.",
      icon: "🧠"
    },
    {
      name: "Leaderboards & Rewards",
      description: "Climb the leaderboard, earn your rank, and turn consistency into recognition. Progress isn't just tracked — it's celebrated.",
      icon: "🏆"
    }
  ],

  // FAQ
  faq: [
    {
      question: "What is TechMasterAI?",
      answer: "TechMasterAI is a competitive programming platform where developers can practice coding, compete in challenges, and improve their skills through real-world problems.",
      category: "general"
    },
    {
      question: "How do I join?",
      answer: "Currently, we're in pre-launch phase. You can request early access through our website and we'll notify you when we launch.",
      category: "access"
    },
    {
      question: "Is it free?",
      answer: "We'll have both free and premium tiers. Basic features will be available for free, with advanced features in premium plans.",
      category: "pricing"
    },
    {
      question: "What programming languages are supported?",
      answer: "We support all major programming languages including Python, Java, C++, JavaScript, and more.",
      category: "technical"
    }
  ],

  // Contact Information
  contact: {
    email: "techmaster.hub@gmail.com",
    phone: "+91-XXXX-XXXX-XX",
    address: "India",
    socialMedia: {
      linkedin: "https://linkedin.com/company/techmaster-ai",
      twitter: "https://twitter.com/TechMasterAI",
      github: "https://github.com/TechMasterAI"
    }
  }
};

/**
 * SMART KNOWLEDGE BASE SEARCH
 * Case-insensitive, synonym-aware, keyword matching
 */
export function searchKnowledgeBase(query) {
  if (!query || typeof query !== 'string') return null;
  
  const normalizedQuery = query.toLowerCase().trim();
  
  // Company & About queries
  if (normalizedQuery.includes('techmaster') || 
      normalizedQuery.includes('what is') || 
      normalizedQuery.includes('about') ||
      normalizedQuery.includes('company')) {
    return `🚀 **TechMasterAI** - ${TECHMASTERAI_KNOWLEDGE.company.tagline}

${TECHMASTERAI_KNOWLEDGE.company.description}

**Our Mission**: ${TECHMASTERAI_KNOWLEDGE.company.mission}

Founded in ${TECHMASTERAI_KNOWLEDGE.company.founded} and headquartered in ${TECHMASTERAI_KNOWLEDGE.company.headquarters}, we're building the future of competitive programming!`;
  }

  // Founder queries - multiple variations
  if (normalizedQuery.includes('founder') || 
      normalizedQuery.includes('adarsh') ||
      normalizedQuery.includes('who founded') ||
      normalizedQuery.includes('who started')) {
    return `👨‍💼 **${TECHMASTERAI_KNOWLEDGE.team.founder.name}** is our ${TECHMASTERAI_KNOWLEDGE.team.founder.role}

${TECHMASTERAI_KNOWLEDGE.team.founder.bio}

📧 Contact: ${TECHMASTERAI_KNOWLEDGE.team.founder.email}
🔗 LinkedIn: ${TECHMASTERAI_KNOWLEDGE.team.founder.linkedin}`;
  }

  // CEO queries - multiple variations
  if (normalizedQuery.includes('ceo') || 
      normalizedQuery.includes('akshat') ||
      normalizedQuery.includes('chief executive') ||
      normalizedQuery.includes('who is ceo')) {
    return `👨‍💼 **${TECHMASTERAI_KNOWLEDGE.team.ceo.name}** is our ${TECHMASTERAI_KNOWLEDGE.team.ceo.role}

${TECHMASTERAI_KNOWLEDGE.team.ceo.bio}

📧 Contact: ${TECHMASTERAI_KNOWLEDGE.team.ceo.email}
🔗 LinkedIn: ${TECHMASTERAI_KNOWLEDGE.team.ceo.linkedin}`;
  }

  // Team queries
  if (normalizedQuery.includes('team') || 
      normalizedQuery.includes('leadership') ||
      normalizedQuery.includes('who works') ||
      normalizedQuery.includes('staff')) {
    return `👥 **Our Leadership Team**:

🏆 **${TECHMASTERAI_KNOWLEDGE.team.founder.name}** - ${TECHMASTERAI_KNOWLEDGE.team.founder.role}
🏆 **${TECHMASTERAI_KNOWLEDGE.team.ceo.name}** - ${TECHMASTERAI_KNOWLEDGE.team.ceo.role}
🏆 **${TECHMASTERAI_KNOWLEDGE.team.managingDirector.name}** - ${TECHMASTERAI_KNOWLEDGE.team.managingDirector.role}
🏆 **${TECHMASTERAI_KNOWLEDGE.team.cmo.name}** - ${TECHMASTERAI_KNOWLEDGE.team.cmo.role}
🏆 **${TECHMASTERAI_KNOWLEDGE.team.cto.name}** - ${TECHMASTERAI_KNOWLEDGE.team.cto.role}

We're a passionate team dedicated to empowering developers worldwide! 🚀`;
  }

  // Features queries
  if (normalizedQuery.includes('feature') || 
      normalizedQuery.includes('what do you offer') ||
      normalizedQuery.includes('services') ||
      normalizedQuery.includes('platform') ||
      normalizedQuery.includes('what can')) {
    const features = TECHMASTERAI_KNOWLEDGE.features.map(f => `${f.icon} **${f.name}**: ${f.description}`).join('\n\n');
    return `🎯 **TechMasterAI Platform Features**:

${features}

Ready to level up your coding skills? Join thousands of developers already competing! 🏆`;
  }

  // Contact & Join queries
  if (normalizedQuery.includes('contact') || 
      normalizedQuery.includes('email') ||
      normalizedQuery.includes('reach') ||
      normalizedQuery.includes('get in touch')) {
    return `📞 **Get in Touch**:

📧 Email: ${TECHMASTERAI_KNOWLEDGE.contact.email}
📱 Phone: ${TECHMASTERAI_KNOWLEDGE.contact.phone}
🏢 Address: ${TECHMASTERAI_KNOWLEDGE.contact.address}

🌐 **Follow Us**:
LinkedIn: ${TECHMASTERAI_KNOWLEDGE.contact.socialMedia.linkedin}
Twitter: ${TECHMASTERAI_KNOWLEDGE.contact.socialMedia.twitter}
GitHub: ${TECHMASTERAI_KNOWLEDGE.contact.socialMedia.github}`;
  }

  // Join/Signup queries
  if (normalizedQuery.includes('join') || 
      normalizedQuery.includes('sign up') ||
      normalizedQuery.includes('register') ||
      normalizedQuery.includes('how to start') ||
      normalizedQuery.includes('get started') ||
      normalizedQuery.includes('internship') ||
      normalizedQuery.includes('career') ||
      normalizedQuery.includes('opportunity')) {
    return `🚀 **Ready to Join TechMasterAI?**

**Internship Opportunities Available:**
• Full Stack Development
• Python Development  
• Website Development
• UI/UX Development
• PR and Outreach
• Game Developer (iOS & Android)

📍 **Location**: Bhopal, Madhya Pradesh

**How to Apply:**
1. Visit our Join Us page: /join-us
2. Choose your preferred internship
3. Fill out the application form
4. Start building future-ready tech talent with us!

Click the "Join Us" button in the navigation to explore all opportunities! 🎯`;
  }

  // PM of India queries (as requested)
  if (normalizedQuery.includes('pm of india') || 
      normalizedQuery.includes('prime minister india') ||
      normalizedQuery.includes('who is pm of india') ||
      normalizedQuery.includes('prime minister of india')) {
    return `🇮🇳 The current Prime Minister of India is **Narendra Modi**, serving since May 2014. He represents the Bharatiya Janata Party (BJP) and is known for various initiatives in technology and digital transformation.

*Note: I'm Nova, TechMasterAI's assistant. For the latest political information, please check official government sources.*`;
  }

  // FAQ queries
  const faqMatch = TECHMASTERAI_KNOWLEDGE.faq.find(item => 
    normalizedQuery.includes(item.question.toLowerCase()) ||
    item.question.toLowerCase().includes(normalizedQuery)
  );
  
  if (faqMatch) {
    return `❓ **${faqMatch.question}**

${faqMatch.answer}`;
  }

  // No knowledge base match found
  return null;
}