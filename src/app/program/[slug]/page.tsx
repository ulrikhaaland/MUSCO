import ProgramPage from '../page';
import { getAvailableSlugs } from '../../../../public/data/programs/recovery';

// Generate static params for all available recovery programs
export async function generateStaticParams() {
  const slugs = getAvailableSlugs();
  
  return slugs.map((slug) => ({
    slug: slug,
  }));
}

// Dynamic route for recovery programs
// This will handle paths like /program/runnersknee, /program/shoulder, etc.
export default function DynamicProgramPage() {
  return <ProgramPage isCustomProgram={true} />;
} 