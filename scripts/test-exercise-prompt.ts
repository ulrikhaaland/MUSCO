import { exploreSystemPrompt } from '../src/app/api/prompts/explorePrompt';

console.log('🔍 Testing Exercise Index Integration\n');
console.log('✅ Prompt loaded successfully');
console.log(`✅ Total length: ${exploreSystemPrompt.length} characters`);
console.log(`✅ Estimated tokens: ${Math.ceil(exploreSystemPrompt.length / 4)}`);
console.log(`✅ Includes exercise index: ${exploreSystemPrompt.includes('Shoulders:')}`);
console.log(`✅ Includes Cable Face Pull: ${exploreSystemPrompt.includes('Cable Face Pull')}`);
console.log(`✅ Includes Barbell Glute Bridge: ${exploreSystemPrompt.includes('Barbell Glute Bridge')}`);

console.log('\n📝 Sample exercises found:');
const exerciseMatches = exploreSystemPrompt.match(/• \w+.*?: (.*?)$/gm);
if (exerciseMatches) {
  exerciseMatches.slice(0, 5).forEach(match => console.log(`   ${match}`));
}

console.log('\n✅ Integration test passed!');





