import ProgramPage from '../page';
import { getAvailableSlugs } from '../../../../public/data/programs/recovery';
import { getAvailableExerciseSlugs } from '../../../../public/data/programs/exercise-custom';

// Generate static params for all available custom program slugs
export async function generateStaticParams() {
  const slugs = [...getAvailableSlugs(), ...getAvailableExerciseSlugs()];
  
  return slugs.map((slug) => ({
    slug: slug,
  }));
}

// Dynamic route for custom programs
export default function DynamicProgramPage() {
  return <ProgramPage isCustomProgram={true} />;
}
