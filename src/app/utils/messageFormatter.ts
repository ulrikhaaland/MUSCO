export function formatMessage(content: string): string {
  // First, normalize line endings and clean up extra spaces
  let formattedMessage = content
    .replace(/\r\n/g, '\n')
    .replace(/\s+/g, ' ')
    .trim();

  // Clean up existing bold syntax and normalize colons
  formattedMessage = formattedMessage
    .replace(/\*\*/g, '')
    .replace(/\s*:\s*/g, ': ');

  // Format section headers (### style) with proper spacing
  formattedMessage = formattedMessage.replace(
    /###\s+([^:\n]+)/g,
    '\n\n\n\n**$1**'
  );

  // Format numbered sections with proper spacing and bold titles
  formattedMessage = formattedMessage.replace(
    /(?<![\n])\n*(\d+\.\s+)([^:\n]+):/g,
    '\n\n\n\n$1**$2**:'
  );

  // Format primary bullet points
  formattedMessage = formattedMessage.replace(
    /(?<=\n|^)\s*[-•]\s+([^:\n]+):/g,
    '\n    • $1:'
  );

  // Format secondary bullet points (treatments, etc.)
  formattedMessage = formattedMessage.replace(
    /(?<=:)\s*-\s+([^:\n]+):\s*/g,
    '\n        • $1: '
  );

  // Add extra spacing between sections
  formattedMessage = formattedMessage.replace(
    /(\d+\.\s+[^\n]+:(?:\n(?!\d+\.).*)*)/g,
    '$1\n\n\n'
  );

  // Clean up excessive whitespace and newlines
  formattedMessage = formattedMessage
    .replace(/\n{5,}/g, '\n\n\n\n')  // Allow up to 4 consecutive newlines
    .replace(/\s+\n/g, '\n')
    .replace(/\n\s+/g, '\n')
    .trim();

  return formattedMessage;
}