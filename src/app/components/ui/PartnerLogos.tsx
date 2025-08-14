import Image from 'next/image';
import { useTranslation } from '@/app/i18n';

const logos = [
  '/partners/1.svg',
  '/partners/2.svg',
  '/partners/3.svg',
  '/partners/4.svg',
  '/partners/5.svg',
];

export function PartnerLogos() {
  const { t } = useTranslation();
  // Duplicate array for seamless marquee
  const allLogos = [...logos, ...logos];

  return (
    <div className="space-y-4 pt-8">
      <p className="text-center text-gray-500 text-sm tracking-wide uppercase">
        {t('partners.headline')}
      </p>
      <div
        className="marquee-container w-full overflow-hidden"
        style={{
          maskImage: 'linear-gradient(to right, transparent, black 8%, black 92%, transparent)',
          WebkitMaskImage: 'linear-gradient(to right, transparent, black 8%, black 92%, transparent)'
        }}
      >
        <div className="marquee gap-8 sm:gap-12 md:gap-20 py-2 sm:py-3 md:py-4">
          {allLogos.map((src, idx) => (
            <Image
              key={src + idx}
              src={src}
              alt="Partner logo"
              width={140}
              height={48}
              className={`w-auto brightness-0 invert contrast-200 ${src.includes('/5.svg') ? 'h-10 sm:h-12 md:h-[3.75rem] relative top-[8px] sm:top-[10px] md:top-[14px]' : 'h-12 sm:h-14 md:h-[6rem]'}`}
              priority={idx < logos.length}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
