/**
 * Utility functions for formatting TypeScript code and handling string formatting
 */

// Function to format an object as TypeScript (without quotes on property names)
export function formatAsTypeScript(obj: any, indent = 0): string {
  if (obj === null) return 'null';
  if (obj === undefined) return 'undefined';
  
  const indentStr = ' '.repeat(indent);
  const indentStrInner = ' '.repeat(indent + 2);
  
  if (Array.isArray(obj)) {
    if (obj.length === 0) return '[]';
    
    const items = obj.map(item => {
      if (typeof item === 'string') {
        // Properly format and escape string content for TypeScript
        return `${indentStrInner}${formatTsString(item, indent + 2)}`;
      }
      if (typeof item === 'object' && item !== null) {
        return formatAsTypeScript(item, indent + 2);
      }
      return `${indentStrInner}${item}`;
    }).join(',\n');
    
    return `[\n${items}\n${indentStr}]`;
  }
  
  if (typeof obj === 'object' && obj !== null) {
    const entries = Object.entries(obj).map(([key, value]) => {
      if (typeof value === 'string') {
        // Properly format and escape string content for TypeScript
        return `${indentStrInner}${key}: ${formatTsString(value, indent + 2)}`;
      }
      if (typeof value === 'object' && value !== null) {
        return `${indentStrInner}${key}: ${formatAsTypeScript(value, indent + 2)}`;
      }
      return `${indentStrInner}${key}: ${value}`;
    }).join(',\n');
    
    return `{\n${entries}\n${indentStr}}`;
  }
  
  if (typeof obj === 'string') {
    return formatTsString(obj, indent);
  }
  
  return String(obj);
}

// Helper function to properly format and escape string content for TypeScript
export function formatTsString(str: string, indent = 0): string {
  if (!str) return '""';
  
  // Check if the string contains newlines or quotes
  const hasNewlines = str.includes('\n');
  const hasQuotes = str.includes('"') || str.includes("'");
  const hasBackticks = str.includes('`');
  
  // For strings with newlines or quotes, use template literals
  if (hasNewlines || hasQuotes) {
    // Replace any backticks with escaped backticks
    const escaped = str.replace(/`/g, '\\`');
    
    // Use template literals for multiline strings
    // For readability, add indentation to each line
    if (hasNewlines) {
      const indentStr = ' '.repeat(indent);
      const indentedLines = escaped.split('\n')
        .map(line => line.trim()) // Trim each line
        .filter(line => line.length > 0) // Remove empty lines
        .join('\n' + indentStr + '  '); // Add indentation
      
      return `\`${indentedLines}\``;
    }
    
    return `\`${escaped}\``;
  }
  
  // If string contains backticks but no other special chars, use double quotes
  if (hasBackticks) {
    return `"${str.replace(/"/g, '\\"')}"`;
  }
  
  // For simple strings, use double quotes
  return `"${str.replace(/"/g, '\\"')}"`;
}

// Function to clean and format multiline text (for descriptions, tips, etc.)
export function cleanMultilineText(text: string): string {
  if (!text) return '';
  
  // Replace multiple spaces and newlines with single space
  return text
    .replace(/\s+/g, ' ')
    .trim();
}

// Function to format array content for TypeScript
export function formatArrayForTs(arr: string[]): string {
  if (!arr || arr.length === 0) return '[]';
  
  const formattedItems = arr.map(item => formatTsString(item, 2)).join(',\n    ');
  return `[\n    ${formattedItems}\n  ]`;
}

// Function specifically for formatting tips that may have sub-points
export function formatTipsForTs(tips: string[]): string {
  if (!tips || tips.length === 0) return '[]';
  
  // Process tips: check if there are tips with sub-points
  const processedTips = tips.map(tip => {
    // Clean up the tip text
    return tip.trim().replace(/\s+/g, ' ');
  });
  
  return formatArrayForTs(processedTips);
} 