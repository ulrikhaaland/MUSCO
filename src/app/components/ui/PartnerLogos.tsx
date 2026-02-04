'use client';

import Image from 'next/image';
import { useTranslation } from '@/app/i18n';
import { useEffect, useRef } from 'react';

const logos = [
  '/partners/1.svg',
  '/partners/2.svg',
  '/partners/3.svg',
  '/partners/4.svg',
  '/partners/5.svg',
];

function LogoSet({ size, prioritize }: { size: 'sm' | 'md' | 'lg'; prioritize: boolean }) {
  return (
    <div className={`flex shrink-0 items-center ${
      size === 'sm'
        ? 'gap-6 sm:gap-8 md:gap-12 pr-6 sm:pr-8 md:pr-12'
        : size === 'lg'
        ? 'gap-10 md:gap-24 pr-10 md:pr-24'
        : 'gap-8 sm:gap-12 md:gap-20 pr-8 sm:pr-12 md:pr-20'
    }`}>
      {logos.map((src) => (
        <Image
          key={src}
          src={src}
          alt="Partner logo"
          width={140}
          height={48}
          className={`w-auto shrink-0 brightness-0 invert contrast-200 ${(() => {
            const isFifth = src.includes('/5.svg');
            if (size === 'sm') {
              return isFifth
                ? 'h-8 sm:h-9 md:h-10 relative top-[4px] sm:top-[6px] md:top-[8px]'
                : 'h-10 sm:h-11 md:h-12';
            }
            if (size === 'lg') {
              return isFifth
                ? 'h-14 md:h-16 relative top-[10px] md:top-[12px]'
                : 'h-[6.5rem] md:h-[7rem]';
            }
            return isFifth
              ? 'h-10 sm:h-12 md:h-[3.75rem] relative top-[8px] sm:top-[10px] md:top-[14px]'
              : 'h-12 sm:h-14 md:h-[6rem]';
          })()}`}
          priority={prioritize}
        />
      ))}
    </div>
  );
}

function Marquee({ size }: { size: 'sm' | 'md' | 'lg' }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const firstSetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const track = trackRef.current;
    const firstSet = firstSetRef.current;
    if (!track || !firstSet) return;

    let offset = 0;
    let animationId: number;
    const speed = 0.5; // pixels per frame (~30px/sec at 60fps)

    const animate = () => {
      offset += speed;
      const setWidth = firstSet.offsetWidth;
      
      // Reset imperceptibly when we've scrolled one full set
      if (offset >= setWidth) {
        offset -= setWidth;
      }
      
      track.style.transform = `translateX(-${offset}px)`;
      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, []);

  return (
    <div
      className="marquee-container w-full overflow-hidden"
      style={{
        maskImage: 'linear-gradient(to right, transparent, black 8%, black 92%, transparent)',
        WebkitMaskImage: 'linear-gradient(to right, transparent, black 8%, black 92%, transparent)'
      }}
    >
      <div
        ref={trackRef}
        className={`flex w-max will-change-transform ${
          size === 'sm'
            ? 'py-1.5 sm:py-2 md:py-3'
            : size === 'lg'
            ? 'py-3 md:py-5'
            : 'py-2 sm:py-3 md:py-4'
        }`}
        style={{ backfaceVisibility: 'hidden' }}
      >
        <div ref={firstSetRef}>
          <LogoSet size={size} prioritize={true} />
        </div>
        <LogoSet size={size} prioritize={false} />
      </div>
    </div>
  );
}

export function PartnerLogos({ size = 'md', showHeading = true, className = '', mode = 'marquee' }: { size?: 'sm' | 'md' | 'lg'; showHeading?: boolean; className?: string; mode?: 'marquee' | 'static' }) {
  const { t } = useTranslation();

  return (
    <div className={`${className} ${showHeading ? 'space-y-3 pt-4 md:pt-8' : ''}`}>
      {showHeading && (
        <p className="text-center text-gray-500 text-sm tracking-wide uppercase">
          {t('partners.headline')}
        </p>
      )}
      {mode === 'marquee' ? (
        <Marquee size={size} />
      ) : (
        <div className={`${
          size === 'sm'
            ? 'py-1.5'
            : size === 'lg'
            ? 'py-3'
            : 'py-2'
        }`}>
          <div className={`flex items-center ${
            size === 'sm'
              ? 'gap-6'
              : size === 'lg'
              ? 'gap-12'
              : 'gap-8'
          }`}>
            {logos.map((src, idx) => (
              <Image
                key={src + idx}
                src={src}
                alt="Partner logo"
                width={140}
                height={48}
                className={`w-auto brightness-0 invert contrast-200 ${(() => {
                  const isFifth = src.includes('/5.svg');
                  if (size === 'sm') return isFifth ? 'h-9 relative top-[4px]' : 'h-11';
                  if (size === 'lg') return isFifth ? 'h-[4rem] relative top-[10px]' : 'h-[6.5rem]';
                  return isFifth ? 'h-[3.2rem] relative top-[8px]' : 'h-[4rem]';
                })()}`}
                priority={idx < logos.length}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
