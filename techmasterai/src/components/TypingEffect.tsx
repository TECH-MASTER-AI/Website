import { useState, useEffect } from 'react';

interface TypingEffectProps {
  text: string;
  className?: string;
  typingSpeed?: number;
  startDelay?: number;
  showCursor?: boolean;
}

const TypingEffect = ({
  text,
  className = '',
  typingSpeed = 100,
  startDelay = 0,
  showCursor = true,
}: TypingEffectProps) => {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    // Start delay before typing begins
    const delayTimer = setTimeout(() => {
      if (currentIndex < text.length) {
        const typingTimer = setTimeout(() => {
          setDisplayText(text.substring(0, currentIndex + 1));
          setCurrentIndex(currentIndex + 1);
        }, typingSpeed);

        return () => clearTimeout(typingTimer);
      } else if (currentIndex === text.length && !isComplete) {
        setIsComplete(true);
      }
    }, startDelay);

    return () => clearTimeout(delayTimer);
  }, [currentIndex, text, typingSpeed, startDelay, isComplete]);

  return (
    <span className={className}>
      {displayText}
      {showCursor && !isComplete && (
        <span className="inline-block w-0.5 h-[0.9em] bg-current ml-1 animate-pulse" />
      )}
    </span>
  );
};

export default TypingEffect;
