import { formatAsTypeScript, formatTsString } from './formatters';

// Test data with complex string content
const testObject = {
  name: "Lateral Raise",
  description: "The lateral raise is a simple yet effective isolation exercise for the shoulders. It primarily targets the lateral deltoids, helping to build width and definition in the shoulder area.",
  steps: [
    "Stand with your feet shoulder-width apart and hold a dumbbell in each hand at your sides.",
    "Keeping your back straight and your elbows slightly bent, raise your arms out to the sides until they're parallel to the floor.",
    "Pause briefly at the top, then slowly lower the weights back to the starting position."
  ],
  tips: [
    "Keep your core engaged throughout the movement.",
    "Don't use momentum to swing the weights up.",
    "If you encounter pain in the shoulder while performing the movement, consider implementing one of the following tweaks:\nTilt your pinkies slightly higher than your thumbs.\nTurn your palms forward so that your thumbs are pointing away from your body.",
    "Maintain a slight bend in your elbows, but don't bend them further during the movement."
  ],
  nested: {
    multilineString: `This is a multi-line string
with several lines
and it should be properly formatted
with template literals.`,
    numberValue: 42,
    booleanValue: true,
    nestedArray: ["one", "two", "three"]
  }
};

// Format the object as TypeScript
const formattedTs = formatAsTypeScript(testObject, 2);

// Print the result
console.log('Formatted TypeScript Object:');
console.log(formattedTs);

// Test individual string formatting
console.log('\nTesting individual string formatting:');

const testStrings = [
  "Simple string",
  "String with \"quotes\" in it",
  "String with 'single quotes' in it",
  "String with `backticks` in it",
  `Multiline
string with
several
lines`,
  "String with special characters: \n \t \\ \""
];

testStrings.forEach((str, index) => {
  console.log(`\nTest String ${index + 1}:`);
  console.log(`Original: ${str}`);
  console.log(`Formatted: ${formatTsString(str)}`);
}); 