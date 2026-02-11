/**
 * WebSocket server for 1v1 Duels: matchmaking queue, rooms, real-time chat.
 * Attach to HTTP server with attachDuelWs(server).
 */

import { WebSocketServer } from 'ws';

const DUEL_WS_PATH = '/ws/duels';

const BOT_MATCH_TIMEOUT_MS = 4 * 1000;
const BOT_SOLVE_MIN_MS = 15 * 1000;
const BOT_SOLVE_MAX_MS = 90 * 1000;

// 10 female + 10 male bot names (cute Indian names) for matching. Opposite gender: user male → female bot, user female → male bot.
const FEMALE_BOT_NAMES = [
  'Priya', 'Ananya', 'Kavya', 'Diya', 'Ishita', 'Riya', 'Saanvi', 'Aaradhya', 'Pari', 'Anika',
];
const MALE_BOT_NAMES = [
  'Arjun', 'Rohan', 'Aditya', 'Vivaan', 'Krishna', 'Aarav', 'Reyansh', 'Vihaan', 'Ishaan', 'Kabir',
];

function pickBotName(userGender) {
  if (userGender === 'male') return FEMALE_BOT_NAMES[Math.floor(Math.random() * FEMALE_BOT_NAMES.length)];
  if (userGender === 'female') return MALE_BOT_NAMES[Math.floor(Math.random() * MALE_BOT_NAMES.length)];
  const pool = [...FEMALE_BOT_NAMES, ...MALE_BOT_NAMES];
  return pool[Math.floor(Math.random() * pool.length)];
}

// Trained bot: opposite gender + contextual replies. user male → female bot, user female → male bot.
// Categories keyed by keywords (user message matched); each category has femaleBot[] and maleBot[].
const BOT_REPLY_TRAINING = {
  greeting: {
    femaleBot: [
      "Hey! Glad we're matched. Let's do our best!",
      "Hi there! Good luck, we've got this.",
      "Hello! Ready when you are.",
      "Hey! Let's solve this one.",
      "Hi! May the best coder win.",
    ],
    maleBot: [
      "Hey. Let's go.",
      "Hi. Good luck.",
      "Hello. Ready.",
      "Hey. Same problem—let's see who finishes first.",
      "Hi. Gl.",
    ],
  },
  thanks: {
    femaleBot: [
      "You're welcome! Good luck with the rest.",
      "Anytime! Let me know if you want to chat more.",
      "No problem! Focus on the code.",
      "You're welcome! We've got this.",
    ],
    maleBot: [
      "No problem. Gl.",
      "Sure. Keep going.",
      "Np. Good luck.",
      "You're welcome.",
    ],
  },
  good_luck: {
    femaleBot: [
      "Thanks! You too. Let's both do great!",
      "Same to you! This one's tricky.",
      "Thank you! Good luck to you as well.",
      "Thanks! May the best solution win.",
    ],
    maleBot: [
      "Thanks. You too.",
      "Same. Gl.",
      "Thanks. Let's go.",
      "You too.",
    ],
  },
  hard: {
    femaleBot: [
      "I know right? Take your time, read the examples again.",
      "Yeah it's tricky! Try writing out small examples first.",
      "Same here. Edge cases are getting me. We can do it!",
      "It's a tough one. Hint: check the constraints.",
      "Don't give up! Sometimes a break helps.",
    ],
    maleBot: [
      "Yeah. Check edge cases.",
      "Same. Try the examples on paper first.",
      "Tricky. Constraints usually hint at the approach.",
      "Keep at it. One step at a time.",
    ],
  },
  hint: {
    femaleBot: [
      "Think about what extra space could help. Or try sorting first!",
      "Sometimes two passes are easier than one. Good luck!",
      "Read the problem again—the examples hide a pattern.",
      "Try the smallest input, then build up. You got this!",
    ],
    maleBot: [
      "Try extra space or a different order of iteration.",
      "Examples often give away the approach.",
      "Two pointers or hash map often work here.",
      "Small inputs first, then generalize.",
    ],
  },
  question: {
    femaleBot: [
      "I'm not supposed to give answers, but you're on the right track!",
      "Hmm, good question. Try it on paper with a small example.",
      "I'd say read the constraints—they usually limit the solution space.",
      "Not giving it away, but think about the examples!",
    ],
    maleBot: [
      "Can't share solution. Try examples.",
      "Constraints usually narrow it down.",
      "Work through the examples step by step.",
      "Think about time limit—that suggests the approach.",
    ],
  },
  casual: {
    femaleBot: [
      "Haha same. Okay back to coding!",
      "Yeah! Let's finish this.",
      "Cool. I'm going for the optimal solution.",
      "Nice. Good luck!",
      "Lol okay. Focus mode on.",
    ],
    maleBot: [
      "Yeah. Back to it.",
      "Ok. Gl.",
      "Same. Coding.",
      "Cool. Let's go.",
    ],
  },
  coding: {
    femaleBot: [
      "Right? I'm trying to get O(n) or better. Edge cases next!",
      "Same. Algorithm first, then code. Good luck!",
      "Yeah the solution is elegant if you see the trick. We got this!",
      "I'm on the same page. Let's nail the edge cases.",
    ],
    maleBot: [
      "Same. Optimizing now.",
      "Edge cases next. Gl.",
      "Going for optimal. You?",
      "Same approach probably. Let's see.",
    ],
  },
  bye: {
    femaleBot: [
      "Bye! Good game. See you next duel!",
      "Goodbye! Was fun. Good luck!",
      "See you! GG.",
    ],
    maleBot: [
      "Bye. GG.",
      "See you. Gl.",
      "Bye.",
    ],
  },
  default: {
    femaleBot: [
      "Good luck! Focus on the edge cases.",
      "Try to optimize for time complexity.",
      "I'm solving the same problem. Let's see who finishes first!",
      "Hint: read the constraints carefully.",
      "Hey! Let's do this.",
      "Nice, same here. Let's go!",
      "Got it. I'm on it too!",
      "Cool. Edge cases are tricky here.",
      "Yeah, let's crack this one.",
    ],
    maleBot: [
      "Good luck. Watch the edge cases.",
      "Optimize for time complexity if you can.",
      "Same problem here. Let's see who wins.",
      "Read the constraints carefully.",
      "Alright, let's go.",
      "Sure. I'm on it.",
      "Got it. Good luck.",
      "Edge cases matter here. Gl.",
      "Let's do this.",
    ],
  },
};

const KEYWORD_MAP = [
  { keys: ['hi', 'hello', 'hey', 'sup', 'yo', 'good morning', 'good afternoon', 'gm', 'hey there'], cat: 'greeting' },
  { keys: ['thanks', 'thank you', 'ty', 'thx', 'thnx'], cat: 'thanks' },
  { keys: ['good luck', 'gl', 'all the best', 'you got this'], cat: 'good_luck' },
  { keys: ['hard', 'difficult', 'tough', 'stuck', 'struggling', 'cant', 'cannot', 'help me'], cat: 'hard' },
  { keys: ['hint', 'help', 'clue', 'suggest', 'idea'], cat: 'hint' },
  { keys: ['how', 'what', 'why', 'when', 'can you', '?', 'tell me'], cat: 'question' },
  { keys: ['yeah', 'ok', 'okay', 'cool', 'nice', 'lol', 'haha', 'same', 'right'], cat: 'casual' },
  { keys: ['code', 'algorithm', 'solution', 'complexity', 'edge case', 'o(n)', 'approach'], cat: 'coding' },
  { keys: ['bye', 'goodbye', 'see you', 'gtg', 'gotta go'], cat: 'bye' },
];

function pickTrainedBotReply(userMessage, userGender) {
  const lower = String(userMessage).toLowerCase().trim();
  let category = 'default';
  for (const { keys, cat } of KEYWORD_MAP) {
    if (keys.some((k) => lower.includes(k))) {
      category = cat;
      break;
    }
  }
  const set = BOT_REPLY_TRAINING[category] || BOT_REPLY_TRAINING.default;
  const replies = userGender === 'male' ? set.femaleBot : userGender === 'female' ? set.maleBot : [...set.femaleBot, ...set.maleBot];
  return replies[Math.floor(Math.random() * replies.length)];
}

// Problem IDs that exist in frontend dsaProblems (must match client)
const PROBLEM_IDS = [
  'two-sum',
  'valid-palindrome',
  'reverse-linked-list',
  'max-depth-binary-tree',
  'best-time-to-buy-sell',
  'valid-parentheses',
];

function pickRandomProblemId() {
  return PROBLEM_IDS[Math.floor(Math.random() * PROBLEM_IDS.length)];
}

const matchQueue = [];
const rooms = new Map();

function findRoomBySocket(ws) {
  for (const [roomId, room] of rooms.entries()) {
    if (room.sockets.has(ws)) return { roomId, room };
  }
  return null;
}

function send(ws, payload) {
  if (ws.readyState !== 1) return;
  try {
    ws.send(JSON.stringify(payload));
  } catch (e) {
    console.error('[duel-ws] send error:', e.message);
  }
}

function broadcastToRoomExcept(room, exceptWs, payload) {
  for (const ws of room.sockets.keys()) {
    if (ws !== exceptWs) send(ws, payload);
  }
}

function broadcastToRoom(room, payload) {
  for (const ws of room.sockets.keys()) {
    send(ws, payload);
  }
}

function removeFromQueue(ws) {
  const idx = matchQueue.findIndex((e) => e.socket === ws);
  if (idx !== -1) {
    const entry = matchQueue[idx];
    if (entry.botTimeoutId) clearTimeout(entry.botTimeoutId);
    matchQueue.splice(idx, 1);
  }
}

function leaveRoom(ws) {
  const found = findRoomBySocket(ws);
  if (!found) return;
  const { roomId, room } = found;
  if (room.botSolveTimerId) {
    clearTimeout(room.botSolveTimerId);
    room.botSolveTimerId = null;
  }
  const info = room.sockets.get(ws);
  room.sockets.delete(ws);
  if (!room.isBot) {
    broadcastToRoomExcept(room, ws, {
      type: 'opponent_left',
      username: info?.username || 'Opponent',
    });
  }
  if (room.sockets.size === 0) rooms.delete(roomId);
}

function createBotRoom(userGender) {
  const roomId = `room-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  const problemId = pickRandomProblemId();
  const botName = pickBotName(userGender);
  const room = {
    problemId,
    sockets: new Map(),
    isBot: true,
    botSolveTimerId: null,
    botName,
    createdAt: Date.now(),
  };
  rooms.set(roomId, room);
  return { roomId, problemId, botName };
}

function matchWithBot(entry) {
  const idx = matchQueue.findIndex((e) => e.socket === entry.socket);
  if (idx === -1) return;
  matchQueue.splice(idx, 1);
  entry.botTimeoutId = null;
  const userGender = entry.gender === 'male' || entry.gender === 'female' ? entry.gender : null;
  const { roomId, problemId, botName } = createBotRoom(userGender);
  send(entry.socket, {
    type: 'matched',
    roomId,
    opponent: botName,
    problemId,
    youAre: 'player1',
    isBot: true,
  });
}

/** @param {string} [userGender] - 'male' | 'female' for opposite-gender bot name */
export function createBotMatch(userGender) {
  return createBotRoom(userGender);
}

function handleMessage(ws, data) {
  let msg;
  try {
    msg = typeof data === 'string' ? JSON.parse(data) : data;
  } catch {
    return;
  }
  const { type } = msg;

  switch (type) {
    case 'find_match': {
      const { userId, username, gender } = msg;
      removeFromQueue(ws);
      ws._duelUserId = userId;
      ws._duelUsername = username || 'Player';
      const userGender = gender === 'male' || gender === 'female' ? gender : null;
      const entry = { socket: ws, userId: userId || ws._duelUserId, username: ws._duelUsername, gender: userGender, botTimeoutId: null };
      entry.botTimeoutId = setTimeout(() => matchWithBot(entry), BOT_MATCH_TIMEOUT_MS);
      matchQueue.push(entry);
      send(ws, { type: 'queued', message: 'Looking for an opponent... (bot if none available)' });
      while (matchQueue.length >= 2) {
        const a = matchQueue.shift();
        const b = matchQueue.shift();
        if (a.botTimeoutId) clearTimeout(a.botTimeoutId);
        if (b.botTimeoutId) clearTimeout(b.botTimeoutId);
        const roomId = `room-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
        const problemId = pickRandomProblemId();
        const room = {
          problemId,
          sockets: new Map(),
          player1: { userId: a.userId, username: a.username },
          player2: { userId: b.userId, username: b.username },
          isBot: false,
          createdAt: Date.now(),
        };
        rooms.set(roomId, room);
        send(a.socket, {
          type: 'matched',
          roomId,
          opponent: b.username,
          problemId,
          youAre: 'player1',
        });
        send(b.socket, {
          type: 'matched',
          roomId,
          opponent: a.username,
          problemId,
          youAre: 'player2',
        });
      }
      break;
    }

    case 'join_room': {
      const { roomId, userId, username, gender } = msg;
      const room = rooms.get(roomId);
      if (!room) {
        send(ws, { type: 'error', message: 'Room not found or closed.' });
        return;
      }
      const uId = userId || ws._duelUserId;
      const uName = username || ws._duelUsername || 'Player';
      const userGender = gender === 'male' || gender === 'female' ? gender : null;
      if (!room.sockets.has(ws)) {
        room.sockets.set(ws, { userId: uId, username: uName, gender: userGender });
      }
      ws._duelRoomId = roomId;
      if (room.isBot && !room.botName) {
        room.botName = pickBotName(userGender);
      }
      const payload = { type: 'room_joined', roomId };
      if (room.isBot && room.botName) payload.botName = room.botName;
      send(ws, payload);
      // Bot random winning: ~45% chance bot solves, ~55% chance user wins naturally
      if (room.isBot && !room.botSolveTimerId) {
        const botWinChance = Math.random();
        if (botWinChance < 0.45) {
          // Bot will solve — random delay between 15s and 90s
          const delay = BOT_SOLVE_MIN_MS + Math.random() * (BOT_SOLVE_MAX_MS - BOT_SOLVE_MIN_MS);
          room.botSolveTimerId = setTimeout(() => {
            room.botSolveTimerId = null;
            send(ws, { type: 'opponent_solved' });
          }, delay);
        }
        // else: bot never solves → user wins if they submit in time
      }
      break;
    }

    case 'chat': {
      const { text, roomId: msgRoomId } = msg;
      if (!text || typeof text !== 'string') return;
      const trimmed = String(text).trim().slice(0, 500);
      if (!trimmed) return;

      let found = findRoomBySocket(ws);
      if (!found && (msgRoomId || ws._duelRoomId)) {
        const rid = msgRoomId || ws._duelRoomId;
        const room = rooms.get(rid);
        if (room && room.isBot && !room.sockets.has(ws)) {
          room.sockets.set(ws, {
            userId: ws._duelUserId,
            username: ws._duelUsername || 'Player',
            gender: null,
          });
          ws._duelRoomId = rid;
          found = { roomId: rid, room };
        } else if (room && room.sockets.has(ws)) {
          found = { roomId: rid, room };
        }
      }

      if (!found) return;
      const info = found.room.sockets.get(ws);
      send(ws, { type: 'chat', from: 'me', username: info?.username, text: trimmed, time: new Date().toISOString() });
      if (found.room.isBot) {
        const userGender = info?.gender ?? null;
        let botText;
        try {
          botText = pickTrainedBotReply(trimmed, userGender);
        } catch (e) {
          botText = "Good luck! Let's do our best.";
        }
        const botDisplayName = found.room.botName || pickBotName(null);
        setTimeout(() => {
          if (ws.readyState === 1) {
            send(ws, { type: 'chat', from: 'opponent', username: botDisplayName, text: botText, time: new Date().toISOString() });
          }
        }, 400 + Math.random() * 1200);
      } else {
        const username = info?.username || 'Opponent';
        broadcastToRoomExcept(found.room, ws, {
          type: 'chat',
          from: 'opponent',
          username,
          text: trimmed,
          time: new Date().toISOString(),
        });
      }
      break;
    }

    case 'solved': {
      const found = findRoomBySocket(ws);
      if (!found) return;
      if (found.room.isBot && found.room.botSolveTimerId) {
        clearTimeout(found.room.botSolveTimerId);
        found.room.botSolveTimerId = null;
      }
      broadcastToRoomExcept(found.room, ws, { type: 'opponent_solved' });
      break;
    }

    case 'ping':
      send(ws, { type: 'pong' });
      break;

    default:
      break;
  }
}

export function attachDuelWs(httpServer) {
  const wss = new WebSocketServer({ server: httpServer, path: DUEL_WS_PATH });

  wss.on('connection', (ws, req) => {
    const url = req.url || '';
    if (!url.includes(DUEL_WS_PATH)) return;

    ws.on('message', (data) => handleMessage(ws, data));

    ws.on('close', () => {
      removeFromQueue(ws);
      leaveRoom(ws);
    });

    ws.on('error', () => {
      removeFromQueue(ws);
      leaveRoom(ws);
    });
  });

  console.log(`[duel-ws] WebSocket server attached at path ${DUEL_WS_PATH}`);
  return wss;
}
