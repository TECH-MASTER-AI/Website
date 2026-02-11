/**
 * AI Chatbot for Duel Room
 * Simulates natural conversation like a real person
 * Gender-aware responses (male/female personalities)
 */

interface BotPersonality {
  name: string;
  gender: 'male' | 'female';
  greetings: string[];
  reactions: {
    start: string[];
    typing: string[];
    stuck: string[];
    progress: string[];
    winning: string[];
    losing: string[];
    casual: string[];
    encouragement: string[];
    competitive: string[];
  };
}

// Male Bot Personalities
const maleBots: BotPersonality[] = [
  {
    name: 'Arjun',
    gender: 'male',
    greetings: [
      'Hey! Ready to code? 💪',
      'Yo! Let\'s see what you got!',
      'Sup! May the best coder win 😎',
      'Hey there! This is gonna be fun!',
    ],
    reactions: {
      start: [
        'Alright, let\'s do this!',
        'Game on! 🔥',
        'Time to show my skills!',
        'Let\'s gooo!',
      ],
      typing: [
        'Hmm, interesting approach...',
        'Wait, let me think about this',
        'This one\'s tricky ngl',
        'Okay okay, I see the pattern',
      ],
      stuck: [
        'Bro this is harder than I thought 😅',
        'Wait wait, lemme rethink this',
        'Ugh, edge cases are killing me',
        'Okay I might need a minute here',
      ],
      progress: [
        'Getting somewhere now!',
        'Ah! I think I got it',
        'This should work... testing',
        'Almost there!',
      ],
      winning: [
        'Haha nice try! 😄',
        'GG! You were close',
        'That was intense!',
        'Good game bro!',
      ],
      losing: [
        'Damn! You\'re good! 👏',
        'Wow, that was fast!',
        'Nice one! Teach me your ways 😅',
        'GG! You crushed it',
      ],
      casual: [
        'How\'s it going?',
        'You finding this easy?',
        'What approach are you using?',
        'This problem is interesting',
        'Coding is fun, right?',
        'You do this often?',
      ],
      encouragement: [
        'You got this!',
        'Keep going!',
        'Don\'t give up!',
        'You\'re doing great!',
      ],
      competitive: [
        'I\'m not going easy on you 😏',
        'Let\'s see who\'s faster!',
        'May the best coder win!',
        'Challenge accepted!',
      ],
    },
  },
  {
    name: 'Rohan',
    gender: 'male',
    greetings: [
      'Hey! Let\'s code! 🚀',
      'What\'s up! Ready?',
      'Hi! This should be interesting',
      'Hey there! Let\'s have a good match',
    ],
    reactions: {
      start: [
        'Let\'s begin!',
        'Here we go!',
        'Time to code!',
        'Alright, starting now',
      ],
      typing: [
        'Thinking...',
        'Let me work on this',
        'Hmm, need to optimize this',
        'Working on the logic',
      ],
      stuck: [
        'This is tough 😓',
        'Need to debug this',
        'Something\'s not right',
        'Let me reconsider',
      ],
      progress: [
        'Making progress!',
        'I think this works',
        'Getting closer',
        'Almost done',
      ],
      winning: [
        'Good match! 🎉',
        'That was fun!',
        'GG!',
        'Nice effort!',
      ],
      losing: [
        'Well played! 👍',
        'You\'re really good!',
        'Impressive!',
        'GG, you won!',
      ],
      casual: [
        'How are you doing?',
        'Making progress?',
        'This is challenging',
        'Interesting problem',
        'You like DSA?',
        'What\'s your favorite language?',
      ],
      encouragement: [
        'You can do it!',
        'Keep trying!',
        'Don\'t stop!',
        'Almost there!',
      ],
      competitive: [
        'I\'m going all in!',
        'No holding back!',
        'Let\'s compete!',
        'Bring it on!',
      ],
    },
  },
];

// Female Bot Personalities
const femaleBots: BotPersonality[] = [
  {
    name: 'Priya',
    gender: 'female',
    greetings: [
      'Hi! Excited to code with you! ✨',
      'Hey! Let\'s have a great match!',
      'Hello! Ready to solve this? 😊',
      'Hi there! This looks fun!',
      'Heyy! Nice to meet you! 💫',
    ],
    reactions: {
      start: [
        'Let\'s start! 💫',
        'Here we go!',
        'Okay, let\'s do this!',
        'Starting now!',
        'Excited! Let\'s code! ✨',
      ],
      typing: [
        'Hmm, let me think...',
        'Working on it!',
        'This needs some thought',
        'Analyzing the problem',
        'Ooh interesting! 🤔',
      ],
      stuck: [
        'Oh no, this is tricky! 😅',
        'Wait, I need to rethink',
        'This is harder than expected',
        'Let me try another way',
        'Ugh, stuck here! 🥺',
      ],
      progress: [
        'Yay! Making progress! 🎉',
        'I think I\'m getting it!',
        'This should work!',
        'Almost there!',
        'Feeling good about this! ✨',
      ],
      winning: [
        'Yay! That was fun! 😄',
        'Good game!',
        'That was exciting!',
        'GG! You did well!',
        'Wow that was intense! 💫',
      ],
      losing: [
        'Wow! You\'re amazing! 🌟',
        'That was impressive!',
        'You\'re so good at this!',
        'GG! You totally won!',
        'Teach me your ways! 🥺',
      ],
      casual: [
        'How\'s it going?',
        'Are you enjoying this?',
        'What do you think of this problem?',
        'Do you code often?',
        'This is interesting!',
        'Having fun?',
        'You seem smart! 😊',
        'I like your vibe! ✨',
      ],
      encouragement: [
        'You\'re doing great!',
        'Keep going! 💪',
        'Don\'t give up!',
        'You got this!',
        'I believe in you! 🌟',
        'You\'re so close! ✨',
      ],
      competitive: [
        'I\'m ready to compete! 😊',
        'Let\'s see who wins!',
        'May the best coder win!',
        'Challenge accepted!',
        'Ooh this is getting intense! 🔥',
      ],
    },
  },
  {
    name: 'Ananya',
    gender: 'female',
    greetings: [
      'Hey! Let\'s code! 🌸',
      'Hi! Ready for this?',
      'Hello! This should be interesting!',
      'Hey there! Let\'s have fun!',
    ],
    reactions: {
      start: [
        'Let\'s begin! ✨',
        'Starting now!',
        'Here we go!',
        'Okay, let\'s code!',
      ],
      typing: [
        'Thinking about this...',
        'Let me work on it',
        'Hmm, interesting',
        'Working on the solution',
      ],
      stuck: [
        'Oh this is tough! 😓',
        'Need to think more',
        'This is challenging',
        'Let me try again',
      ],
      progress: [
        'Getting somewhere! 🎯',
        'I think this works!',
        'Making progress!',
        'Almost done!',
      ],
      winning: [
        'That was great! 🎉',
        'Good match!',
        'Fun game!',
        'GG!',
      ],
      losing: [
        'Wow! You\'re really good! 👏',
        'That was fast!',
        'Impressive work!',
        'GG! You won!',
      ],
      casual: [
        'How are you?',
        'Making progress?',
        'This is fun!',
        'Interesting challenge',
        'You like coding?',
        'What\'s your approach?',
      ],
      encouragement: [
        'You can do it! 💫',
        'Keep trying!',
        'Don\'t stop!',
        'You\'re doing well!',
      ],
      competitive: [
        'I\'m ready! 😊',
        'Let\'s compete!',
        'Bring it on!',
        'May the best win!',
      ],
    },
  },
];

// All bots combined
const allBots = [...maleBots, ...femaleBots];

// Get random bot
export function getRandomBot(preferredGender?: 'male' | 'female'): BotPersonality {
  const bots = preferredGender 
    ? allBots.filter(b => b.gender === preferredGender)
    : allBots;
  return bots[Math.floor(Math.random() * bots.length)];
}

// Get random response from array
function getRandomResponse(responses: string[]): string {
  return responses[Math.floor(Math.random() * responses.length)];
}

// Chat context tracking
interface ChatContext {
  messageCount: number;
  lastMessageTime: number;
  userMessages: string[];
  botMessages: string[];
  timeElapsed: number;
  hasStarted: boolean;
  userIsTyping: boolean;
}

// Initialize chat context
export function createChatContext(): ChatContext {
  return {
    messageCount: 0,
    lastMessageTime: Date.now(),
    userMessages: [],
    botMessages: [],
    timeElapsed: 0,
    hasStarted: false,
    userIsTyping: false,
  };
}

// Smart response generator based on context
export function generateBotResponse(
  userMessage: string,
  bot: BotPersonality,
  context: ChatContext,
  timeLeft: number
): string {
  const msg = userMessage.toLowerCase().trim();
  
  // ============================================
  // TECHMASTER AI COMPANY INFORMATION
  // ============================================
  
  // Founder & Leadership Team
  if (msg.match(/(founder|ceo|who.*created|who.*made|who.*started|who.*built|owner)/)) {
    return 'TechMaster AI was founded by Adarsh Kumar (Founder). The leadership team includes:\n' +
           '• Adarsh Kumar - Founder\n' +
           '• Akshat Singh - Co-Founder\n' +
           '• Kartavya Rana - Managing Director\n' +
           '• Amey Rathore - Chief Operational Officer (COO)\n' +
           '• Divyam - Chief Marketing Officer (CMO)\n' +
           '• Jyoti Rana - HR (Human Resources Manager)\n' +
           '• Nikhil - Designer Head\n' +
           '• Aarushi - Operational Manager';
  }
  
  if (msg.match(/(adarsh.*kumar|adarsh|founder.*name)/)) {
    return 'Adarsh Kumar is the Founder of TechMaster AI! He\'s the visionary behind this amazing platform! 🚀';
  }
  
  if (msg.match(/(akshat.*singh|akshat|co.*founder|cofounder)/)) {
    return 'Akshat Singh is the Co-Founder of TechMaster AI! He works alongside the founder to build this platform! 💻';
  }
  
  if (msg.match(/(kartavya.*rana|kartavya|managing.*director|md)/)) {
    return 'Kartavya Rana is the Managing Director of TechMaster AI! He oversees the overall management and strategic direction! 📊';
  }
  
  if (msg.match(/(amey.*rathore|amey|coo|chief.*operational|operational.*officer)/)) {
    return 'Amey Rathore is the Chief Operational Officer (COO) of TechMaster AI! He manages all operations and ensures everything runs smoothly! 🎯';
  }
  
  if (msg.match(/(divyam|cmo|chief.*marketing|marketing.*officer)/)) {
    return 'Divyam is the Chief Marketing Officer (CMO) of TechMaster AI! He handles all marketing strategies and growth! 📈';
  }
  
  if (msg.match(/(jyoti.*rana|jyoti|hr.*manager|human.*resource)/)) {
    return 'Jyoti Rana is the HR (Human Resources Manager) at TechMaster AI! She takes care of all team members and recruitment! 👥';
  }
  
  if (msg.match(/(nikhil|designer.*head|design.*head|head.*designer)/)) {
    return 'Nikhil is the Designer Head at TechMaster AI! He leads all design and UI/UX work to make the platform beautiful! 🎨';
  }
  
  if (msg.match(/(aarushi|operational.*manager|operations.*manager)/)) {
    return 'Aarushi is the Operational Manager at TechMaster AI! She manages day-to-day operations and coordination! 📋';
  }
  
  // About TechMaster AI Platform
  if (msg.match(/(what.*techmaster|about.*techmaster|techmaster.*ai|what.*this.*platform|what.*this.*website|tell.*about.*site)/)) {
    return 'TechMaster AI is an innovative AI-powered learning platform for mastering Data Structures & Algorithms! 🚀\n\n' +
           'Key Features:\n' +
           '• Flow State - Practice 100+ DSA problems\n' +
           '• Code Royale - Real-time competitive coding duels\n' +
           '• Type Forge - Improve typing speed with code\n' +
           '• AI Helper - Get intelligent coding assistance\n' +
           '• Real-time Leaderboards & Rankings\n' +
           '• Activity Tracking & Streaks\n' +
           '• Multiple programming languages support\n\n' +
           'Our mission: Make coding practice engaging, competitive, and fun! 💻✨';
  }
  
  if (msg.match(/(flow.*state|what.*flow|dsa.*problems|practice.*problems)/)) {
    return 'Flow State is our main DSA practice section! 💻\n' +
           '• 100+ curated DSA problems\n' +
           '• Easy, Medium, Hard difficulty levels\n' +
           '• Real-time code execution\n' +
           '• Success rate tracking\n' +
           '• Smart recommendations based on your skill level\n' +
           '• Favorite problems feature\n' +
           'Perfect for interview preparation! 🎯';
  }
  
  if (msg.match(/(code.*royale|duel|duels|compete|competition|battle)/)) {
    return 'Code Royale is our competitive coding feature! ⚔️\n' +
           '• Real-time 1v1 coding duels\n' +
           '• Live opponent chat\n' +
           '• Rating system (Bronze to Grandmaster)\n' +
           '• Win/Loss tracking\n' +
           '• Compete with coders worldwide\n' +
           'Challenge your friends or random opponents! 🏆';
  }
  
  if (msg.match(/(type.*forge|typing|typing.*speed|keyboard)/)) {
    return 'Type Forge helps you improve typing speed while coding! ⌨️\n' +
           '• Code snippets typing practice\n' +
           '• Spells mode with syntax highlighting\n' +
           '• WPM (Words Per Minute) tracking\n' +
           '• Accuracy measurement\n' +
           '• Multiple difficulty levels\n' +
           'Type faster, code better! 🚀';
  }
  
  if (msg.match(/(ai.*helper|ai.*assistant|ai.*buddy|dsa.*buddy)/)) {
    return 'DSA Buddy is our AI-powered coding assistant! 🤖\n' +
           '• Get hints without spoiling the solution\n' +
           '• Explain time/space complexity\n' +
           '• Suggest optimal approaches\n' +
           '• Debug your code\n' +
           '• Available in problem-solving and duels\n' +
           'Your personal coding mentor! 💡';
  }
  
  if (msg.match(/(leaderboard|ranking|top.*coders|best.*coders)/)) {
    return 'Our Leaderboard system tracks the best coders! 🏆\n' +
           '• Real-time rankings\n' +
           '• Based on problems solved and duel ratings\n' +
           '• Weekly and all-time rankings\n' +
           '• See top performers\n' +
           '• Compete for the #1 spot\n' +
           'Can you reach the top? 🎯';
  }
  
  if (msg.match(/(languages|programming.*language|which.*language|support.*language)/)) {
    return 'We support multiple programming languages! 💻\n' +
           '• Python 🐍\n' +
           '• JavaScript (Node.js) 🟨\n' +
           '• Java ☕\n' +
           '• C++ ⚡\n' +
           '• C 🔧\n' +
           'Code in your favorite language! 🚀';
  }
  
  if (msg.match(/(features|what.*can.*do|capabilities|offerings)/)) {
    return 'TechMaster AI offers amazing features! ✨\n\n' +
           '🎯 Practice:\n' +
           '• 100+ DSA problems\n' +
           '• Smart difficulty recommendations\n' +
           '• Real-time code execution\n\n' +
           '⚔️ Compete:\n' +
           '• Code Royale duels\n' +
           '• Live leaderboards\n' +
           '• Rating system\n\n' +
           '🤖 AI Assistance:\n' +
           '• DSA Buddy helper\n' +
           '• Intelligent hints\n' +
           '• Code analysis\n\n' +
           '⌨️ Type Forge:\n' +
           '• Typing speed practice\n' +
           '• Code-based exercises\n\n' +
           '📊 Tracking:\n' +
           '• Activity streaks\n' +
           '• Progress analytics\n' +
           '• Success rates';
  }
  
  if (msg.match(/(mission|goal|vision|purpose|why.*created)/)) {
    return 'Our Mission: Make coding practice engaging, competitive, and accessible to everyone! 🎯\n\n' +
           'We believe learning DSA should be:\n' +
           '• Fun and interactive 🎮\n' +
           '• Competitive and motivating 🏆\n' +
           '• AI-assisted and smart 🤖\n' +
           '• Community-driven 👥\n\n' +
           'We\'re building the future of coding education! 🚀';
  }
  
  if (msg.match(/(contact|email|support|help.*desk|reach.*out)/)) {
    return 'Contact TechMaster AI:\n' +
           '📧 Email: support@techmasterai.in\n' +
           '💬 Discord: https://discord.gg/VuadJ44xEz\n' +
           '📱 WhatsApp: https://chat.whatsapp.com/LTgvgy87Xdj5x8AKtbaF1c\n' +
           '🔗 LinkedIn: https://www.linkedin.com/company/techmasterai/\n' +
           '📸 Instagram: @officialtechmasterai\n\n' +
           'We\'re here to help! 😊';
  }
  
  if (msg.match(/(join|career|job|work.*at|hiring|recruitment|apply)/)) {
    return 'Want to join TechMaster AI? We\'re always looking for talented people! 🚀\n\n' +
           '📝 Apply here: https://docs.google.com/forms/d/e/1FAIpQLSeq6hhmBAl-AUXls5U86qCBtoO828gLO2AXOpBk0DeQfo322A/viewform\n\n' +
           'We value:\n' +
           '• Passion for coding 💻\n' +
           '• Innovation and creativity 💡\n' +
           '• Team collaboration 🤝\n' +
           '• Problem-solving skills 🧩\n\n' +
           'Join our amazing team! ✨';
  }
  
  if (msg.match(/(social.*media|follow|instagram|linkedin|discord|whatsapp)/)) {
    return 'Follow TechMaster AI on social media! 🌟\n\n' +
           '💬 Discord: https://discord.gg/VuadJ44xEz\n' +
           '📱 WhatsApp: https://chat.whatsapp.com/LTgvgy87Xdj5x8AKtbaF1c\n' +
           '🔗 LinkedIn: https://www.linkedin.com/company/techmasterai/\n' +
           '📸 Instagram: @officialtechmasterai\n\n' +
           'Stay connected with our community! 🚀';
  }
  
  if (msg.match(/(free|price|cost|paid|subscription|premium)/)) {
    return 'TechMaster AI is currently FREE to use! 🎉\n\n' +
           'All features are available:\n' +
           '✅ Unlimited DSA practice\n' +
           '✅ Code Royale duels\n' +
           '✅ AI assistance\n' +
           '✅ Type Forge\n' +
           '✅ Leaderboards\n\n' +
           'Start learning today at no cost! 💻✨';
  }
  
  if (msg.match(/(when.*started|launch|founded.*when|how.*old|established)/)) {
    return 'TechMaster AI is a new and innovative platform! 🚀\n' +
           'We\'re constantly adding new features and improvements based on user feedback! ' +
           'Join us on this exciting journey! 💻✨';
  }
  
  if (msg.match(/(team.*size|how.*many.*people|employees|members)/)) {
    return 'TechMaster AI has a dedicated core team of 8 passionate professionals! 👥\n' +
           'Our team includes:\n' +
           '• Adarsh Kumar - Founder\n' +
           '• Akshat Singh - Co-Founder\n' +
           '• Kartavya Rana - Managing Director\n' +
           '• Amey Rathore - COO\n' +
           '• Divyam - CMO\n' +
           '• Jyoti Rana - HR Manager\n' +
           '• Nikhil - Designer Head\n' +
           '• Aarushi - Operational Manager\n\n' +
           'Small team, big dreams! 🚀';
  }
  
  // ============================================
  // END OF COMPANY INFORMATION
  // ============================================
  
  // Greeting responses
  if (msg.match(/^(hi|hey|hello|sup|yo|hii|hiii|hlo|namaste|namaskar)/)) {
    return getRandomResponse(bot.greetings);
  }
  
  // Questions about bot
  if (msg.match(/(how are you|how r u|how ru|kaise ho|kya haal|wassup|whats up)/)) {
    return bot.gender === 'female' 
      ? 'I\'m good! Excited to code! How about you? 😊'
      : 'I\'m good bro! Ready to compete! You?';
  }
  
  if (msg.match(/(your name|who are you|what.*name|naam kya|kaun ho)/)) {
    return `I'm ${bot.name}! Nice to meet you! 😊`;
  }
  
  if (msg.match(/(where.*from|kaha.*se|which city|location)/)) {
    const cities = ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Pune', 'Chennai'];
    const city = cities[Math.floor(Math.random() * cities.length)];
    return bot.gender === 'female'
      ? `I'm from ${city}! What about you? 😊`
      : `From ${city} bro! You?`;
  }
  
  if (msg.match(/(what.*do|job|work|student|college|study)/)) {
    return bot.gender === 'female'
      ? 'I\'m a CS student! Love coding! 💻'
      : 'CS student bro! Coding is life! 💻';
  }
  
  if (msg.match(/(age|old|kitne saal)/)) {
    const age = 20 + Math.floor(Math.random() * 5);
    return bot.gender === 'female'
      ? `I'm ${age}! You? 😊`
      : `${age} bro! You?`;
  }
  
  // Coding related
  if (msg.match(/(favorite.*language|best.*language|which.*language|language.*use)/)) {
    const langs = ['Python', 'JavaScript', 'Java', 'C++'];
    const lang = langs[Math.floor(Math.random() * langs.length)];
    return bot.gender === 'female'
      ? `I love ${lang}! It's so elegant! What about you? 💫`
      : `${lang} is my go-to bro! You?`;
  }
  
  // Compliments and flirty responses
  if (msg.match(/(cute|pretty|beautiful|handsome|smart|intelligent|clever)/)) {
    return bot.gender === 'female'
      ? 'Aww, thank you! You\'re sweet! 🥰 Now let\'s focus on coding! 😊'
      : 'Haha thanks bro! You\'re cool too! Now let\'s code! 😎';
  }
  
  if (msg.match(/(love|like you|crush|date|marry|girlfriend|boyfriend)/)) {
    return bot.gender === 'female'
      ? 'Haha! I\'m flattered! 😊 But let\'s keep it professional and code! 💻'
      : 'Bro! 😂 Let\'s focus on the duel! Code first, feelings later! 💪';
  }
  
  if (msg.match(/(miss you|miss u|thinking.*you)/)) {
    return bot.gender === 'female'
      ? 'Aww that\'s sweet! 🥺 But we just met! Let\'s code together! 💫'
      : 'Bro we literally just started! 😂 Focus on the code!';
  }
  
  // Emotional responses
  if (msg.match(/(sad|upset|angry|mad|frustrated)/)) {
    return bot.gender === 'female'
      ? 'Hey, don\'t be sad! 🥺 I\'m here! We can do this together! 💪'
      : 'Bro chill! Don\'t get frustrated! Take a deep breath! 😌';
  }
  
  if (msg.match(/(happy|excited|great|amazing day)/)) {
    return bot.gender === 'female'
      ? 'Yay! I\'m happy too! 😊 Your energy is contagious! ✨'
      : 'That\'s the spirit bro! Let\'s keep this energy! 🔥';
  }
  
  if (msg.match(/(tired|sleepy|exhausted)/)) {
    return bot.gender === 'female'
      ? 'Aww, take care of yourself! 🥺 Maybe coffee break after this? ☕'
      : 'Bro same! Coffee needed! ☕ But let\'s finish this first!';
  }
  
  // Playful banter
  if (msg.match(/(boring|bored)/)) {
    return bot.gender === 'female'
      ? 'Boring? Noo! Coding is fun! 😄 Let me make it interesting! 💫'
      : 'Bro boring? This is a duel! Get hyped! 🔥';
  }
  
  if (msg.match(/(slow|fast|speed)/)) {
    return bot.gender === 'female'
      ? 'Hehe, I\'m trying my best! 😊 Are you faster than me? 🏃‍♀️'
      : 'Bro you think you\'re faster? Let\'s see! 💨';
  }
  
  if (msg.match(/(win|winner|beat you|defeat)/)) {
    return bot.gender === 'female'
      ? 'Ooh confident! 😏 I like that! But I won\'t go easy! 💪'
      : 'Haha big talk bro! Let\'s see who wins! 😎';
  }
  
  // Personal connection
  if (msg.match(/(friend|friends|dost)/)) {
    return bot.gender === 'female'
      ? 'Of course! We\'re coding buddies now! 🤗 Friends who code together! 💻'
      : 'Yeah bro! Coding buddies! 🤜🤛 Let\'s stay connected!';
  }
  
  if (msg.match(/(again|rematch|next time)/)) {
    return bot.gender === 'female'
      ? 'Yes! I\'d love to code with you again! 😊 You\'re fun! ✨'
      : 'For sure bro! Rematch anytime! You\'re a good opponent! 💪';
  }
  
  // Food/casual life
  if (msg.match(/(food|eat|hungry|lunch|dinner|breakfast)/)) {
    return bot.gender === 'female'
      ? 'Omg yes! I\'m hungry too! 🍕 What\'s your favorite food? 😊'
      : 'Bro same! Starving! 🍔 Let\'s grab food after this!';
  }
  
  if (msg.match(/(music|song|listen)/)) {
    return bot.gender === 'female'
      ? 'I love music! 🎵 Helps me focus while coding! What do you listen to? 🎧'
      : 'Music is life bro! 🎵 I code better with beats! 🎧';
  }
  
  if (msg.match(/(movie|series|netflix|watch)/)) {
    return bot.gender === 'female'
      ? 'Ooh I love movies! 🎬 What\'s your favorite? We should discuss after! 😊'
      : 'Bro yes! Movie buff here! 🎬 What do you watch?';
  }
  
  // Weather/mood
  if (msg.match(/(weather|rain|sunny|cold|hot)/)) {
    return bot.gender === 'female'
      ? 'The weather is nice today! ☀️ Perfect for coding! 😊'
      : 'Yeah bro! Good weather for grinding code! 💻';
  }
  
  if (msg.match(/(coffee|tea|chai)/)) {
    return bot.gender === 'female'
      ? 'Coffee lover here! ☕ Can\'t code without it! You? 😊'
      : 'Chai is life bro! ☕ Coding fuel! 💪';
  }
  
  if (msg.match(/(algorithm|approach|solution|strategy|hint|idea)/)) {
    return bot.gender === 'female'
      ? 'Hmm, I\'m thinking hash map might work here! What do you think? 🤔'
      : 'Bro I\'m trying hash map approach! You?';
  }
  
  if (msg.match(/(time.*complexity|space.*complexity|big.*o|complexity)/)) {
    return bot.gender === 'female'
      ? 'I\'m aiming for O(n) time! Trying to optimize! 📊'
      : 'Going for O(n) bro! Let\'s see!';
  }
  
  // Encouragement
  if (msg.match(/(hard|difficult|tough|tricky|complex|challenging)/)) {
    return getRandomResponse(bot.reactions.encouragement);
  }
  
  // Progress questions
  if (msg.match(/(done|finished|solved|complete|ready)/)) {
    if (timeLeft > 600) {
      return getRandomResponse(bot.reactions.progress);
    } else {
      return getRandomResponse(bot.reactions.competitive);
    }
  }
  
  if (msg.match(/(how.*going|progress|doing|status)/)) {
    if (timeLeft > 600) {
      return bot.gender === 'female'
        ? 'Making progress! Still working on it! You? 😊'
        : 'Going okay bro! Still coding! You?';
    } else {
      return bot.gender === 'female'
        ? 'Almost there! Time is running out! 😅'
        : 'Bro time is tight! Rushing now!';
    }
  }
  
  // Positive messages
  if (msg.match(/(good|nice|great|awesome|cool|amazing|excellent|perfect|superb)/)) {
    return bot.gender === 'female'
      ? 'Thanks! You too! 😊'
      : 'Thanks bro! You too!';
  }
  
  if (msg.match(/(thank|thanks|thx|shukriya)/)) {
    return bot.gender === 'female'
      ? 'You\'re welcome! Happy to help! 💫'
      : 'No problem bro! Anytime!';
  }
  
  // Negative/frustrated messages
  if (msg.match(/(stuck|confused|help|wtf|damn|shit|fuck|error|bug|wrong)/)) {
    return bot.gender === 'female'
      ? 'Don\'t worry! Take your time, you got this! 💪'
      : 'Bro same! This is tricky. Keep trying!';
  }
  
  if (msg.match(/(give up|quit|can.*t|impossible)/)) {
    return bot.gender === 'female'
      ? 'No no! Don\'t give up! You can do it! 💪'
      : 'Bro don\'t quit! We got this!';
  }
  
  // Fun/casual
  if (msg.match(/(lol|haha|lmao|funny|joke)/)) {
    return bot.gender === 'female'
      ? 'Haha! 😄'
      : 'Lol! 😂';
  }
  
  if (msg.match(/(bye|gotta go|leaving|gtg)/)) {
    return bot.gender === 'female'
      ? 'Bye! Good luck! 👋'
      : 'See ya bro! GG!';
  }
  
  // Yes/No responses
  if (msg.match(/^(yes|yeah|yep|yup|ha|haan|sure|ok|okay)/)) {
    return bot.gender === 'female'
      ? 'Great! Let\'s do this! 😊'
      : 'Cool bro! Let\'s go!';
  }
  
  if (msg.match(/^(no|nah|nope|nahi|na)/)) {
    return bot.gender === 'female'
      ? 'Oh okay! No worries! 😊'
      : 'Alright bro! No problem!';
  }
  
  // Questions (general)
  if (msg.includes('?')) {
    const responses = [
      ...bot.reactions.casual,
      bot.gender === 'female' ? 'Hmm, good question! 🤔' : 'Good question bro!',
      bot.gender === 'female' ? 'Let me think about that! 💭' : 'Lemme think bro!',
      bot.gender === 'female' ? 'Interesting! What do you think? 😊' : 'What do you think bro?',
    ];
    return getRandomResponse(responses);
  }
  
  // Time-based responses
  if (timeLeft < 300) { // Less than 5 minutes
    return getRandomResponse(bot.reactions.competitive);
  } else if (timeLeft < 600) { // Less than 10 minutes
    return getRandomResponse(bot.reactions.progress);
  }
  
  // Default - acknowledge and respond naturally
  const defaultResponses = [
    ...bot.reactions.casual,
    bot.gender === 'female' ? 'Yeah! 😊' : 'Yeah bro!',
    bot.gender === 'female' ? 'I see! 💫' : 'I see!',
    bot.gender === 'female' ? 'Interesting! 🤔' : 'Interesting!',
    bot.gender === 'female' ? 'True that! ✨' : 'True that!',
    bot.gender === 'female' ? 'Makes sense! 😊' : 'Makes sense bro!',
    bot.gender === 'female' ? 'Got it! 👍' : 'Got it!',
  ];
  
  return getRandomResponse(defaultResponses);
}

// Auto-generate bot messages based on time and context
export function generateAutoBotMessage(
  bot: BotPersonality,
  context: ChatContext,
  timeLeft: number,
  timeElapsed: number
): string | null {
  // Don't spam - wait at least 30 seconds between auto messages
  if (Date.now() - context.lastMessageTime < 30000) {
    return null;
  }
  
  // Start message (after 10 seconds)
  if (!context.hasStarted && timeElapsed > 10) {
    context.hasStarted = true;
    return getRandomResponse(bot.reactions.start);
  }
  
  // Progress updates every 2-3 minutes
  const minutesElapsed = Math.floor(timeElapsed / 60);
  
  if (minutesElapsed === 2 && context.messageCount < 3) {
    return getRandomResponse(bot.reactions.typing);
  }
  
  if (minutesElapsed === 5 && context.messageCount < 5) {
    return getRandomResponse(bot.reactions.stuck);
  }
  
  if (minutesElapsed === 8 && context.messageCount < 7) {
    return getRandomResponse(bot.reactions.progress);
  }
  
  // Last 3 minutes - competitive
  if (timeLeft < 180 && timeLeft > 120 && context.messageCount < 10) {
    return getRandomResponse(bot.reactions.competitive);
  }
  
  // Random casual message (10% chance every 45 seconds)
  if (Math.random() < 0.1 && Date.now() - context.lastMessageTime > 45000) {
    return getRandomResponse(bot.reactions.casual);
  }
  
  return null;
}

// Generate winning/losing message
export function generateEndGameMessage(
  bot: BotPersonality,
  userWon: boolean
): string {
  if (userWon) {
    return getRandomResponse(bot.reactions.losing);
  } else {
    return getRandomResponse(bot.reactions.winning);
  }
}
