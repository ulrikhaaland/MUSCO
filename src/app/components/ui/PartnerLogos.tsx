import Image from 'next/image';
import { useTranslation } from '@/app/i18n';

const logos = [
  '/partners/1.svg',
  '/partners/2.svg',
  '/partners/3.svg',
  '/partners/4.svg',
  '/partners/5.svg',
];

export function PartnerLogos({ size = 'md', showHeading = true, className = '', mode = 'marquee' }: { size?: 'sm' | 'md' | 'lg'; showHeading?: boolean; className?: string; mode?: 'marquee' | 'static' }) {
  const { t } = useTranslation();
  // Duplicate array for seamless marquee
  const allLogos = [...logos, ...logos];

  return (
    <div className={`${className} ${showHeading ? 'space-y-4 pt-8' : ''}`}>
      {showHeading && (
        <p className="text-center text-gray-500 text-sm tracking-wide uppercase">
          {t('partners.headline')}
        </p>
      )}
      {mode === 'marquee' ? (
        <div
          className="marquee-container w-full overflow-hidden"
          style={{
            maskImage: 'linear-gradient(to right, transparent, black 8%, black 92%, transparent)',
            WebkitMaskImage: 'linear-gradient(to right, transparent, black 8%, black 92%, transparent)'
          }}
        >
          <div className={`marquee ${
            size === 'sm'
              ? 'gap-6 sm:gap-8 md:gap-12 py-1.5 sm:py-2 md:py-3'
              : size === 'lg'
              ? 'gap-10 md:gap-24 py-3 md:py-5'
              : 'gap-8 sm:gap-12 md:gap-20 py-2 sm:py-3 md:py-4'
          }`}>
            {allLogos.map((src, idx) => (
              <Image
                key={src + idx}
                src={src}
                alt="Partner logo"
                width={140}
                height={48}
                className={`w-auto brightness-0 invert contrast-200 ${(() => {
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
                priority={idx < logos.length}
              />
            ))}
          </div>
        </div>
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
