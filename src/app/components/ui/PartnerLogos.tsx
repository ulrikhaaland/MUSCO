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
      <div className="marquee-container w-full overflow-hidden opacity-60">
        <div className="marquee gap-10 py-4">
          {allLogos.map((src, idx) => (
            <Image
              key={src + idx}
              src={src}
              alt="Partner logo"
              width={140}
              height={48}
              className="h-16 w-auto invert brightness-0"
              priority={idx < logos.length}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
