/**
 * TechMasterAI Knowledge Base - Comprehensive Hardcoded Information
 * 
 * PRIORITY SYSTEM:
 * 1. Check Hardcoded Knowledge Base FIRST (instant, accurate responses)
 * 2. If not found, call Groq API (general questions)
 * 3. Friendly fallback (if API fails)
 * 
 * This ensures:
 * - Company info is always accurate and instant
 * - No API calls for common questions (faster, cheaper)
 * - Consistent branding and messaging
 * - Works even if API is down
 * 
 * COVERAGE:
 * - Company information (name, mission, vision, contact)
 * - Leadership team (all 8 members with roles)
 * - Platform features (Flow State, Code Royale, Type Forge, DSA Buddy, etc.)
 * - FAQ (pricing, languages, how to join, etc.)
 * - Social media links
 * - Career opportunities
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
    headquarters: "Bhopal, Madhya Pradesh, India",
    website: "https://techmaster.ai",
    email: "techmaster.hub@gmail.com",
    supportEmail: "support@techmasterai.in",
    socialMedia: {
      discord: "https://discord.gg/VuadJ44xEz",
      whatsapp: "https://chat.whatsapp.com/LTgvgy87Xdj5x8AKtbaF1c",
      linkedin: "https://www.linkedin.com/company/techmasterai/",
      instagram: "@officialtechmasterai"
    }
  },

  // Leadership Team
  team: {
    founder: {
      name: "Adarsh Kumar",
      role: "Founder",
      bio: "Visionary founder of TechMasterAI, passionate about creating opportunities for developers worldwide."
    },
    coFounder: {
      name: "Akshat Singh",
      role: "Co-Founder",
      bio: "Co-founder working alongside to build TechMasterAI's vision."
    },
    managingDirector: {
      name: "Kartavya Rana",
      role: "Managing Director",
      bio: "Overseeing operations and ensuring excellence in platform delivery."
    },
    coo: {
      name: "Amey Rathore",
      role: "Chief Operational Officer (COO)",
      bio: "Managing all operations and ensuring everything runs smoothly."
    },
    cmo: {
      name: "Divyam",
      role: "Chief Marketing Officer (CMO)",
      bio: "Driving marketing strategies and community engagement initiatives."
    },
    hr: {
      name: "Jyoti Rana",
      role: "HR (Human Resources Manager)",
      bio: "Taking care of all team members and recruitment."
    },
    designerHead: {
      name: "Nikhil",
      role: "Designer Head",
      bio: "Leading all design and UI/UX work to make the platform beautiful."
    },
    operationalManager: {
      name: "Aarushi",
      role: "Operational Manager",
      bio: "Managing day-to-day operations and coordination."
    }
  },

  // Platform Features
  features: [
    {
      name: "Flow State (DSA Practice)",
      description: "Practice 100+ curated DSA problems with Easy, Medium, and Hard difficulty levels. Real-time code execution, success rate tracking, and smart recommendations based on your skill level. Perfect for interview preparation!",
      icon: "💻",
      details: {
        problemCount: "100+",
        languages: ["Python", "JavaScript", "Java", "C++", "C"],
        features: ["Real-time execution", "Success rate tracking", "Smart recommendations", "Favorite problems", "Multiple test cases"]
      }
    },
    {
      name: "Code Royale (Competitive Duels)",
      description: "Real-time 1v1 coding duels with live opponent chat. Rating system from Bronze to Grandmaster. Win/Loss tracking and compete with coders worldwide!",
      icon: "⚔️",
      details: {
        mode: "1v1 Real-time",
        ratings: ["Bronze", "Silver", "Gold", "Platinum", "Diamond", "Master", "Grandmaster"],
        features: ["Live chat", "Rating system", "Win/Loss tracking", "Random or friend matching"]
      }
    },
    {
      name: "Type Forge",
      description: "Improve typing speed while coding! Code snippets typing practice, Spells mode with syntax highlighting, WPM tracking, and accuracy measurement.",
      icon: "⌨️",
      details: {
        modes: ["Code Snippets", "Spells", "Fun Mode"],
        metrics: ["WPM (Words Per Minute)", "Accuracy", "Time tracking"],
        features: ["Syntax highlighting", "Multiple difficulty levels", "Progress tracking"]
      }
    },
    {
      name: "DSA Buddy (AI Assistant)",
      description: "AI-powered coding assistant that provides hints without spoiling solutions, explains time/space complexity, suggests optimal approaches, and helps debug your code.",
      icon: "🤖",
      details: {
        capabilities: ["Smart hints", "Complexity analysis", "Approach suggestions", "Code debugging", "Available in problems and duels"]
      }
    },
    {
      name: "Leaderboards & Rankings",
      description: "Real-time rankings based on problems solved and duel ratings. Weekly and all-time rankings. See top performers and compete for the #1 spot!",
      icon: "🏆",
      details: {
        types: ["Weekly Rankings", "All-time Rankings", "Duel Ratings"],
        metrics: ["Problems solved", "Success rate", "Duel wins", "Rating points"]
      }
    },
    {
      name: "Activity Tracking & Streaks",
      description: "Track your coding journey with daily activity logs, streak tracking, and progress analytics. Stay motivated with visual progress indicators!",
      icon: "📊",
      details: {
        features: ["Daily streaks", "Activity calendar", "Progress charts", "Success rate analytics", "Submission history"]
      }
    }
  ],

  // FAQ
  faq: [
    {
      question: "What is TechMasterAI?",
      answer: "TechMasterAI is an innovative AI-powered competitive programming platform where developers can practice DSA problems, compete in real-time coding duels, improve typing speed, and track their progress. We offer 100+ curated problems, Code Royale duels, Type Forge, AI assistance, and comprehensive leaderboards!",
      category: "general",
      keywords: ["what is", "about", "platform", "techmaster"]
    },
    {
      question: "How do I join TechMasterAI?",
      answer: "You can join TechMasterAI by visiting our website and signing up! We're currently offering free access to all features. We also have internship opportunities in Full Stack Development, Python Development, Website Development, UI/UX, PR & Outreach, and Game Development. Visit /join-us to apply!",
      category: "access",
      keywords: ["join", "sign up", "register", "how to start", "get started"]
    },
    {
      question: "Is TechMasterAI free?",
      answer: "Yes! TechMasterAI is currently FREE to use with all features available including unlimited DSA practice, Code Royale duels, AI assistance, Type Forge, and leaderboards. Start learning today at no cost!",
      category: "pricing",
      keywords: ["free", "price", "cost", "paid", "subscription", "premium"]
    },
    {
      question: "What programming languages are supported?",
      answer: "We support Python 🐍, JavaScript (Node.js) 🟨, Java ☕, C++ ⚡, and C 🔧. You can code in your favorite language!",
      category: "technical",
      keywords: ["languages", "programming language", "which language", "support language"]
    },
    {
      question: "What is Flow State?",
      answer: "Flow State is our main DSA practice section with 100+ curated problems across Easy, Medium, and Hard difficulty levels. Features include real-time code execution, success rate tracking, smart recommendations, and the ability to favorite problems. Perfect for interview preparation!",
      category: "features",
      keywords: ["flow state", "dsa problems", "practice problems", "coding practice"]
    },
    {
      question: "What is Code Royale?",
      answer: "Code Royale is our competitive coding feature with real-time 1v1 duels, live opponent chat, rating system (Bronze to Grandmaster), and win/loss tracking. Challenge friends or random opponents worldwide!",
      category: "features",
      keywords: ["code royale", "duel", "duels", "compete", "competition", "battle", "1v1"]
    },
    {
      question: "What is Type Forge?",
      answer: "Type Forge helps you improve typing speed while coding! Practice with code snippets, use Spells mode with syntax highlighting, track your WPM (Words Per Minute) and accuracy. Type faster, code better!",
      category: "features",
      keywords: ["type forge", "typing", "typing speed", "keyboard", "wpm"]
    },
    {
      question: "What is DSA Buddy?",
      answer: "DSA Buddy is our AI-powered coding assistant that provides smart hints without spoiling solutions, explains time/space complexity, suggests optimal approaches, and helps debug your code. Available in both problem-solving and duels!",
      category: "features",
      keywords: ["dsa buddy", "ai helper", "ai assistant", "ai buddy", "hints"]
    },
    {
      question: "How does the rating system work?",
      answer: "Our rating system ranges from Bronze to Grandmaster based on your duel performance. Win duels to increase your rating and climb the ranks: Bronze → Silver → Gold → Platinum → Diamond → Master → Grandmaster!",
      category: "features",
      keywords: ["rating", "ranking", "leaderboard", "bronze", "silver", "gold", "grandmaster"]
    },
    {
      question: "Can I track my progress?",
      answer: "Yes! We offer comprehensive activity tracking with daily streaks, activity calendar, progress charts, success rate analytics, and submission history. Stay motivated with visual progress indicators!",
      category: "features",
      keywords: ["track", "progress", "streak", "activity", "analytics", "history"]
    },
    {
      question: "Are there internship opportunities?",
      answer: "Yes! We offer internships in Full Stack Development, Python Development, Website Development, UI/UX Development, PR and Outreach, and Game Developer (iOS & Android) positions in Bhopal, Madhya Pradesh. Visit /join-us to apply!",
      category: "career",
      keywords: ["internship", "job", "career", "opportunity", "hiring", "work"]
    },
    {
      question: "How can I contact TechMasterAI?",
      answer: "You can reach us via Email: techmaster.hub@gmail.com or support@techmasterai.in. Join our Discord: https://discord.gg/VuadJ44xEz, WhatsApp: https://chat.whatsapp.com/LTgvgy87Xdj5x8AKtbaF1c, LinkedIn: https://www.linkedin.com/company/techmasterai/, or Instagram: @officialtechmasterai",
      category: "contact",
      keywords: ["contact", "email", "reach", "support", "help"]
    }
  ]
};

/**
 * SMART KNOWLEDGE BASE SEARCH
 * Case-insensitive, synonym-aware, keyword matching
 * Priority: Check hardcoded responses FIRST before API
 */
export function searchKnowledgeBase(query) {
  if (!query || typeof query !== 'string') return null;
  
  const normalizedQuery = query.toLowerCase().trim();
  
  // ============================================
  // COMPANY & ABOUT QUERIES
  // ============================================
  if (normalizedQuery.match(/(what.*is.*techmaster|about.*techmaster|tell.*about.*techmaster|techmaster.*platform|what.*this.*website|what.*this.*site|describe.*techmaster)/)) {
    return `🚀 **TechMasterAI** - ${TECHMASTERAI_KNOWLEDGE.company.tagline}

${TECHMASTERAI_KNOWLEDGE.company.description}

**Our Mission**: ${TECHMASTERAI_KNOWLEDGE.company.mission}

**Our Vision**: ${TECHMASTERAI_KNOWLEDGE.company.vision}

Founded in ${TECHMASTERAI_KNOWLEDGE.company.founded} and headquartered in ${TECHMASTERAI_KNOWLEDGE.company.headquarters}, we're building the future of competitive programming! 🎯`;
  }

  // ============================================
  // FOUNDER & LEADERSHIP QUERIES
  // ============================================
  if (normalizedQuery.match(/(who.*founder|founder.*name|who.*founded|who.*started|who.*created|who.*made.*techmaster|founder.*techmaster|adarsh.*kumar)/)) {
    return `👨‍💼 **${TECHMASTERAI_KNOWLEDGE.team.founder.name}** is our ${TECHMASTERAI_KNOWLEDGE.team.founder.role}!

${TECHMASTERAI_KNOWLEDGE.team.founder.bio}

He's the visionary behind TechMasterAI! 🚀

**Full Leadership Team**:
• **Adarsh Kumar** - Founder
• **Akshat Singh** - Co-Founder
• **Kartavya Rana** - Managing Director
• **Amey Rathore** - Chief Operational Officer (COO)
• **Divyam** - Chief Marketing Officer (CMO)
• **Jyoti Rana** - HR (Human Resources Manager)
• **Nikhil** - Designer Head
• **Aarushi** - Operational Manager`;
  }

  // Co-Founder queries
  if (normalizedQuery.match(/(co.*founder|cofounder|akshat.*singh|akshat)/)) {
    return `👨‍💼 **${TECHMASTERAI_KNOWLEDGE.team.coFounder.name}** is our ${TECHMASTERAI_KNOWLEDGE.team.coFounder.role}!

${TECHMASTERAI_KNOWLEDGE.team.coFounder.bio}

He works alongside Adarsh Kumar to build TechMasterAI's vision! 💻`;
  }

  // Managing Director queries
  if (normalizedQuery.match(/(managing.*director|kartavya.*rana|kartavya|md.*techmaster)/)) {
    return `👨‍💼 **${TECHMASTERAI_KNOWLEDGE.team.managingDirector.name}** is our ${TECHMASTERAI_KNOWLEDGE.team.managingDirector.role}!

${TECHMASTERAI_KNOWLEDGE.team.managingDirector.bio}

He oversees the overall management and strategic direction! 📊`;
  }

  // COO queries
  if (normalizedQuery.match(/(coo|chief.*operational|operational.*officer|amey.*rathore|amey)/)) {
    return `👨‍💼 **${TECHMASTERAI_KNOWLEDGE.team.coo.name}** is our ${TECHMASTERAI_KNOWLEDGE.team.coo.role}!

${TECHMASTERAI_KNOWLEDGE.team.coo.bio}

He manages all operations and ensures everything runs smoothly! 🎯`;
  }

  // CMO queries
  if (normalizedQuery.match(/(cmo|chief.*marketing|marketing.*officer|divyam)/)) {
    return `👨‍💼 **${TECHMASTERAI_KNOWLEDGE.team.cmo.name}** is our ${TECHMASTERAI_KNOWLEDGE.team.cmo.role}!

${TECHMASTERAI_KNOWLEDGE.team.cmo.bio}

He drives marketing strategies and community engagement! 📈`;
  }

  // HR queries
  if (normalizedQuery.match(/(hr.*manager|human.*resource|jyoti.*rana|jyoti)/)) {
    return `👩‍💼 **${TECHMASTERAI_KNOWLEDGE.team.hr.name}** is our ${TECHMASTERAI_KNOWLEDGE.team.hr.role}!

${TECHMASTERAI_KNOWLEDGE.team.hr.bio}

She takes care of all team members and recruitment! 👥`;
  }

  // Designer Head queries
  if (normalizedQuery.match(/(designer.*head|design.*head|head.*designer|nikhil)/)) {
    return `👨‍🎨 **${TECHMASTERAI_KNOWLEDGE.team.designerHead.name}** is our ${TECHMASTERAI_KNOWLEDGE.team.designerHead.role}!

${TECHMASTERAI_KNOWLEDGE.team.designerHead.bio}

He leads all design and UI/UX work! 🎨`;
  }

  // Operational Manager queries
  if (normalizedQuery.match(/(operational.*manager|operations.*manager|aarushi)/)) {
    return `👩‍💼 **${TECHMASTERAI_KNOWLEDGE.team.operationalManager.name}** is our ${TECHMASTERAI_KNOWLEDGE.team.operationalManager.role}!

${TECHMASTERAI_KNOWLEDGE.team.operationalManager.bio}

She manages day-to-day operations and coordination! 📋`;
  }

  // Team queries
  if (normalizedQuery.match(/(team.*members|leadership.*team|who.*works|staff.*techmaster|team.*techmaster|all.*team)/)) {
    return `👥 **Our Leadership Team**:

🏆 **${TECHMASTERAI_KNOWLEDGE.team.founder.name}** - ${TECHMASTERAI_KNOWLEDGE.team.founder.role}
🏆 **${TECHMASTERAI_KNOWLEDGE.team.coFounder.name}** - ${TECHMASTERAI_KNOWLEDGE.team.coFounder.role}
🏆 **${TECHMASTERAI_KNOWLEDGE.team.managingDirector.name}** - ${TECHMASTERAI_KNOWLEDGE.team.managingDirector.role}
🏆 **${TECHMASTERAI_KNOWLEDGE.team.coo.name}** - ${TECHMASTERAI_KNOWLEDGE.team.coo.role}
🏆 **${TECHMASTERAI_KNOWLEDGE.team.cmo.name}** - ${TECHMASTERAI_KNOWLEDGE.team.cmo.role}
🏆 **${TECHMASTERAI_KNOWLEDGE.team.hr.name}** - ${TECHMASTERAI_KNOWLEDGE.team.hr.role}
🏆 **${TECHMASTERAI_KNOWLEDGE.team.designerHead.name}** - ${TECHMASTERAI_KNOWLEDGE.team.designerHead.role}
🏆 **${TECHMASTERAI_KNOWLEDGE.team.operationalManager.name}** - ${TECHMASTERAI_KNOWLEDGE.team.operationalManager.role}

We're a passionate team of 8 dedicated to empowering developers worldwide! 🚀`;
  }

  // ============================================
  // FEATURES QUERIES
  // ============================================
  if (normalizedQuery.match(/(what.*features|what.*offer|what.*can.*do|platform.*features|services|capabilities)/)) {
    const features = TECHMASTERAI_KNOWLEDGE.features.map(f => 
      `${f.icon} **${f.name}**: ${f.description}`
    ).join('\n\n');
    return `🎯 **TechMasterAI Platform Features**:

${features}

Ready to level up your coding skills? Join thousands of developers already competing! 🏆`;
  }

  // Flow State queries
  if (normalizedQuery.match(/(flow.*state|dsa.*practice|practice.*problems|dsa.*problems|coding.*practice)/)) {
    const flowState = TECHMASTERAI_KNOWLEDGE.features[0];
    return `💻 **${flowState.name}**

${flowState.description}

**Details**:
• ${flowState.details.problemCount} curated problems
• Languages: ${flowState.details.languages.join(', ')}
• Features: ${flowState.details.features.join(', ')}

Perfect for interview preparation! 🎯`;
  }

  // Code Royale queries
  if (normalizedQuery.match(/(code.*royale|duel|duels|compete|competition|battle|1v1|versus)/)) {
    const codeRoyale = TECHMASTERAI_KNOWLEDGE.features[1];
    return `⚔️ **${codeRoyale.name}**

${codeRoyale.description}

**Details**:
• Mode: ${codeRoyale.details.mode}
• Ratings: ${codeRoyale.details.ratings.join(' → ')}
• Features: ${codeRoyale.details.features.join(', ')}

Challenge your friends or random opponents! 🏆`;
  }

  // Type Forge queries
  if (normalizedQuery.match(/(type.*forge|typing.*speed|typing.*practice|keyboard.*practice|wpm)/)) {
    const typeForge = TECHMASTERAI_KNOWLEDGE.features[2];
    return `⌨️ **${typeForge.name}**

${typeForge.description}

**Details**:
• Modes: ${typeForge.details.modes.join(', ')}
• Metrics: ${typeForge.details.metrics.join(', ')}
• Features: ${typeForge.details.features.join(', ')}

Type faster, code better! 🚀`;
  }

  // DSA Buddy / AI Helper queries
  if (normalizedQuery.match(/(dsa.*buddy|ai.*helper|ai.*assistant|ai.*buddy|hints|help.*coding)/)) {
    const dsaBuddy = TECHMASTERAI_KNOWLEDGE.features[3];
    return `🤖 **${dsaBuddy.name}**

${dsaBuddy.description}

**Capabilities**:
${dsaBuddy.details.capabilities.map(c => `• ${c}`).join('\n')}

Your personal coding mentor! 💡`;
  }

  // Leaderboard queries
  if (normalizedQuery.match(/(leaderboard|ranking|top.*coders|best.*coders|standings)/)) {
    const leaderboard = TECHMASTERAI_KNOWLEDGE.features[4];
    return `🏆 **${leaderboard.name}**

${leaderboard.description}

**Details**:
• Types: ${leaderboard.details.types.join(', ')}
• Metrics: ${leaderboard.details.metrics.join(', ')}

Can you reach the top? 🎯`;
  }

  // Progress tracking queries
  if (normalizedQuery.match(/(track.*progress|activity.*tracking|streak|progress.*analytics)/)) {
    const tracking = TECHMASTERAI_KNOWLEDGE.features[5];
    return `📊 **${tracking.name}**

${tracking.description}

**Features**:
${tracking.details.features.map(f => `• ${f}`).join('\n')}

Stay motivated with visual progress! 🎯`;
  }

  // Languages queries
  if (normalizedQuery.match(/(programming.*language|which.*language|support.*language|languages.*available)/)) {
    return `💻 **Supported Programming Languages**:

• Python 🐍
• JavaScript (Node.js) 🟨
• Java ☕
• C++ ⚡
• C 🔧

Code in your favorite language! 🚀`;
  }

  // ============================================
  // CONTACT & SOCIAL QUERIES
  // ============================================
  if (normalizedQuery.match(/(contact|email|reach.*out|get.*in.*touch|support|help.*desk)/)) {
    return `📞 **Get in Touch with TechMasterAI**:

📧 **Email**: 
• ${TECHMASTERAI_KNOWLEDGE.company.email}
• ${TECHMASTERAI_KNOWLEDGE.company.supportEmail}

🌐 **Social Media**:
• Discord: ${TECHMASTERAI_KNOWLEDGE.company.socialMedia.discord}
• WhatsApp: ${TECHMASTERAI_KNOWLEDGE.company.socialMedia.whatsapp}
• LinkedIn: ${TECHMASTERAI_KNOWLEDGE.company.socialMedia.linkedin}
• Instagram: ${TECHMASTERAI_KNOWLEDGE.company.socialMedia.instagram}

We're here to help! 😊`;
  }

  if (normalizedQuery.match(/(social.*media|follow.*us|discord|whatsapp|linkedin|instagram)/)) {
    return `🌟 **Follow TechMasterAI on Social Media**:

💬 **Discord**: ${TECHMASTERAI_KNOWLEDGE.company.socialMedia.discord}
📱 **WhatsApp**: ${TECHMASTERAI_KNOWLEDGE.company.socialMedia.whatsapp}
🔗 **LinkedIn**: ${TECHMASTERAI_KNOWLEDGE.company.socialMedia.linkedin}
📸 **Instagram**: ${TECHMASTERAI_KNOWLEDGE.company.socialMedia.instagram}

Stay connected with our community! 🚀`;
  }

  // ============================================
  // JOIN & CAREER QUERIES
  // ============================================
  if (normalizedQuery.match(/(join|sign.*up|register|how.*to.*start|get.*started|create.*account)/)) {
    return `🚀 **Ready to Join TechMasterAI?**

**For Users**: Visit our website and sign up to start coding! All features are FREE! 🎉

**Internship Opportunities Available**:
• Full Stack Development
• Python Development  
• Website Development
• UI/UX Development
• PR and Outreach
• Game Developer (iOS & Android)

📍 **Location**: ${TECHMASTERAI_KNOWLEDGE.company.headquarters}

**How to Apply**:
1. Visit our Join Us page: /join-us
2. Choose your preferred internship
3. Fill out the application form
4. Start building future-ready tech talent with us!

Click the "Join Us" button in the navigation to explore all opportunities! 🎯`;
  }

  if (normalizedQuery.match(/(internship|job|career|opportunity|hiring|work.*at|recruitment|apply)/)) {
    return `💼 **Career Opportunities at TechMasterAI**:

We're hiring talented individuals for:
• Full Stack Development
• Python Development
• Website Development
• UI/UX Development
• PR and Outreach
• Game Developer (iOS & Android)

📍 **Location**: ${TECHMASTERAI_KNOWLEDGE.company.headquarters}

📝 **Apply here**: Visit /join-us on our website

**We value**:
• Passion for coding 💻
• Innovation and creativity 💡
• Team collaboration 🤝
• Problem-solving skills 🧩

Join our amazing team! ✨`;
  }

  // ============================================
  // PRICING QUERIES
  // ============================================
  if (normalizedQuery.match(/(free|price|cost|paid|subscription|premium|how.*much)/)) {
    return `🎉 **TechMasterAI is currently FREE to use!**

**All features are available**:
✅ Unlimited DSA practice (100+ problems)
✅ Code Royale duels
✅ AI assistance (DSA Buddy)
✅ Type Forge
✅ Leaderboards & Rankings
✅ Activity tracking & Streaks

Start learning today at no cost! 💻✨`;
  }

  // ============================================
  // RATING SYSTEM QUERIES
  // ============================================
  if (normalizedQuery.match(/(rating.*system|how.*rating|rank|bronze|silver|gold|platinum|diamond|master|grandmaster)/)) {
    return `🏆 **TechMasterAI Rating System**:

Our competitive rating system ranges from Bronze to Grandmaster based on your duel performance!

**Rating Tiers**:
🥉 Bronze → 🥈 Silver → 🥇 Gold → 💎 Platinum → 💠 Diamond → ⭐ Master → 👑 Grandmaster

**How it works**:
• Win duels to increase your rating
• Lose duels and your rating decreases
• Higher-rated opponents give more points
• Climb the ranks and reach Grandmaster!

Can you become a Grandmaster? 🎯`;
  }

  // ============================================
  // GENERAL INFO QUERIES
  // ============================================
  if (normalizedQuery.match(/(mission|goal|vision|purpose|why.*created)/)) {
    return `🎯 **Our Mission & Vision**:

**Mission**: ${TECHMASTERAI_KNOWLEDGE.company.mission}

**Vision**: ${TECHMASTERAI_KNOWLEDGE.company.vision}

We believe learning DSA should be:
• Fun and interactive 🎮
• Competitive and motivating 🏆
• AI-assisted and smart 🤖
• Community-driven 👥

We're building the future of coding education! 🚀`;
  }

  if (normalizedQuery.match(/(when.*started|launch|founded.*when|how.*old|established|history)/)) {
    return `🚀 **TechMasterAI History**:

Founded in ${TECHMASTERAI_KNOWLEDGE.company.founded} by ${TECHMASTERAI_KNOWLEDGE.team.founder.name}, TechMasterAI is a new and innovative platform!

We're constantly adding new features and improvements based on user feedback. Join us on this exciting journey! 💻✨`;
  }

  if (normalizedQuery.match(/(team.*size|how.*many.*people|employees|members.*count)/)) {
    return `👥 **TechMasterAI Team**:

We have a dedicated core team of **8 passionate professionals**!

Our team includes:
• Adarsh Kumar - Founder
• Akshat Singh - Co-Founder
• Kartavya Rana - Managing Director
• Amey Rathore - COO
• Divyam - CMO
• Jyoti Rana - HR Manager
• Nikhil - Designer Head
• Aarushi - Operational Manager

Small team, big dreams! 🚀`;
  }

  // ============================================
  // FAQ MATCHING
  // ============================================
  const faqMatch = TECHMASTERAI_KNOWLEDGE.faq.find(item => {
    // Check if query matches question or keywords
    const matchesQuestion = normalizedQuery.includes(item.question.toLowerCase()) ||
                           item.question.toLowerCase().includes(normalizedQuery);
    const matchesKeywords = item.keywords && item.keywords.some(keyword => 
      normalizedQuery.includes(keyword.toLowerCase())
    );
    return matchesQuestion || matchesKeywords;
  });
  
  if (faqMatch) {
    return `❓ **${faqMatch.question}**

${faqMatch.answer}`;
  }

  // No knowledge base match found - will fall through to Groq API
  return null;
}