import { useState, memo } from 'react';

interface TeamAvatarProps {
  photo: string;
  initial: string;
  name: string;
  size?: 'small' | 'large';
  accentColor?: string;
}

const TeamAvatar = memo(({ 
  photo, 
  initial, 
  name, 
  size = 'small',
  accentColor = 'var(--theme-accent)'
}: TeamAvatarProps) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const sizeClasses = size === 'large' 
    ? 'w-40 h-40' 
    : 'w-32 h-32';

  const initialSize = size === 'large' 
    ? 'text-5xl' 
    : 'text-4xl';

  return (
    <div 
      className={`relative ${sizeClasses}`}
      style={{
        flexShrink: 0,
        margin: '0 auto',
      }}
    >
      <div 
        className="team-card-avatar rounded-full overflow-hidden"
        style={{
          width: '100%',
          height: '100%',
          aspectRatio: '1 / 1',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {!imageError ? (
          <>
            <img
              src={photo}
              alt={name}
              loading="lazy"
              decoding="async"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'center center',
                display: 'block',
                opacity: imageLoaded ? 1 : 0,
                transition: 'opacity 0.3s ease',
              }}
              onLoad={() => setImageLoaded(true)}
              onError={() => {
                setImageError(true);
                setImageLoaded(false);
              }}
            />
            {!imageLoaded && (
              <span 
                className={`font-heading ${initialSize} font-bold`}
                style={{ 
                  color: accentColor,
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  lineHeight: 1,
                }}
              >
                {initial}
              </span>
            )}
          </>
        ) : (
          <span 
            className={`font-heading ${initialSize} font-bold`}
            style={{ 
              color: accentColor,
              lineHeight: 1,
            }}
          >
            {initial}
          </span>
        )}
      </div>
    </div>
  );
});

TeamAvatar.displayName = 'TeamAvatar';

export default TeamAvatar;
