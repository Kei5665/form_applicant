'use client';

import Image from 'next/image';

type FingerHintProps = {
  isVisible: boolean;
  className?: string;
  size?: number;
};

export default function FingerHint({ isVisible, className = '', size = 52 }: FingerHintProps) {
  const containerClassName = `pointer-events-none ${className}`.trim();
  const animationClassName = `transition-all duration-300 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}`;

  return (
    <div className={containerClassName} aria-hidden="true">
      <div className={animationClassName}>
        <Image
          src="/images/finger.png"
          width={size}
          height={Math.round(size * 0.72)}
          alt=""
          className="select-none drop-shadow-lg animate-bounce"
        />
      </div>
    </div>
  );
}


