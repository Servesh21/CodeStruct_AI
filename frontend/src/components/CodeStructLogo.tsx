import React from 'react';

interface CodeStructLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const CodeStructLogo: React.FC<CodeStructLogoProps> = ({ className = '', size = 'md' }) => {
  const sizes = {
    sm: { width: 120, height: 28, fontSize: 16 },
    md: { width: 180, height: 40, fontSize: 22 },
    lg: { width: 240, height: 52, fontSize: 28 },
  };
  const s = sizes[size];

  return (
    <svg
      width={s.width}
      height={s.height}
      viewBox={`0 0 ${s.width} ${s.height}`}
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="CodeStruct.AI"
    >
      <text
        x="0"
        y={s.height * 0.7}
        fontFamily="'Plus Jakarta Sans', sans-serif"
        fontWeight="600"
        fontSize={s.fontSize}
        className="fill-on-surface dark:fill-dark-on-surface"
      >
        CodeStruct
      </text>
      <text
        x={s.fontSize * 5.7}
        y={s.height * 0.7}
        fontFamily="'Plus Jakarta Sans', sans-serif"
        fontWeight="600"
        fontSize={s.fontSize}
        className="fill-primary-container dark:fill-dark-primary-container"
      >
        .AI
      </text>
    </svg>
  );
};

export default CodeStructLogo;
