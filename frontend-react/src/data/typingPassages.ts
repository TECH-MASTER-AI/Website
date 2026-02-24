/**
 * Sample passages for typing test. Words ≈ chars/5.
 */
export const TYPING_PASSAGES = {
  short: [
    "The quick brown fox jumps over the lazy dog. Pack my box with five dozen liquor jugs.",
    "Technology is best when it brings people together. Innovation distinguishes between a leader and a follower.",
    "Code is like humor. When you have to explain it, it's bad. Simplicity is the soul of efficiency.",
    "Typing speed matters in every job. Practice daily and your fingers will learn the keys. Accuracy first, then speed.",
  ],
  medium: [
    "The only way to do great work is to love what you do. If you haven't found it yet, keep looking. Don't settle. As with all matters of the heart, you'll know when you find it. Your work is going to fill a large part of your life, and the only way to be truly satisfied is to do what you believe is great work.",
    "Programming isn't about what you know; it's about what you can figure out. The best error message is the one that never shows up. First, solve the problem. Then, write the code. Any fool can write code that a computer can understand. Good programmers write code that humans can understand.",
    "Learning to code is useful no matter what your career ambitions are. Coding makes you a better problem solver and a more logical thinker. The computer will do what you tell it to do, but you have to be clear and precise. Start with small projects and build up from there.",
    "Debugging is twice as hard as writing the code in the first place. If you write the code as cleverly as possible, you are by definition not smart enough to debug it. Write clear code and comment the tricky parts. Future you will thank present you.",
  ],
  long: [
    "The only way to do great work is to love what you do. If you haven't found it yet, keep looking. Don't settle. As with all matters of the heart, you'll know when you find it. Your work is going to fill a large part of your life, and the only way to be truly satisfied is to do what you believe is great work. And the only way to do great work is to love what you do. If you haven't found it yet, keep looking. Don't settle. Stay hungry. Stay foolish.",
    "Programming isn't about what you know; it's about what you can figure out. The best error message is the one that never shows up. First, solve the problem. Then, write the code. Any fool can write code that a computer can understand. Good programmers write code that humans can understand. Code is read much more often than it is written. So make it readable. Write code that you would be proud to show to others. Clean code always looks like it was written by someone who cares.",
    "Learning to code is useful no matter what your career ambitions are. Coding makes you a better problem solver and a more logical thinker. The computer will do what you tell it to do, but you have to be clear and precise. Start with small projects and build up from there. Practice every day even if it's just for a few minutes. Read other people's code and learn from it. Don't be afraid to make mistakes; that's how you learn. The best time to start was yesterday. The next best time is now.",
    "Algorithms are the heart of computer science. A good algorithm can turn an impossible problem into one that runs in milliseconds. Study data structures: arrays, hash maps, trees, and graphs. Practice on paper before you code. Time complexity and space complexity matter in interviews and in production. Master the basics and the rest will follow.",
  ],
} as const;

export type PassageLength = keyof typeof TYPING_PASSAGES;

export function getRandomPassage(length: PassageLength): string {
  const list = TYPING_PASSAGES[length];
  return list[Math.floor(Math.random() * list.length)];
}
