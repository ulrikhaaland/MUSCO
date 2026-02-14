const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const inputPath = path.join(projectRoot, 'shared/theme/tokens.json');
const webOutputPath = path.join(projectRoot, 'src/app/generated-theme-tokens.css');
const flutterOutputPath = path.join(projectRoot, 'flutter_app/lib/theme/generated_theme_tokens.dart');

function toCss(tokens) {
  return `/* AUTO-GENERATED from shared/theme/tokens.json - do not edit by hand. */\n/* Run: node scripts/generate-theme-artifacts.js */\n:root {\n  --surface-deepest: ${tokens.surface.deepest};\n  --surface-base: ${tokens.surface.base};\n  --surface-elevated: ${tokens.surface.elevated};\n  --surface-muted: ${tokens.surface.muted};\n\n  --brand: ${tokens.brand.primary};\n  --brand-hover: ${tokens.brand.hover};\n  --brand-soft: ${tokens.brand.soft};\n  --brand-border: ${tokens.brand.border};\n  --brand-text: ${tokens.brand.text};\n  --brand-text-light: ${tokens.brand.textLight};\n\n  --secondary: ${tokens.secondary.primary};\n  --secondary-hover: ${tokens.secondary.hover};\n  --secondary-soft: ${tokens.secondary.soft};\n  --secondary-border: ${tokens.secondary.border};\n\n  --border-default: ${tokens.border.default};\n  --border-muted: ${tokens.border.muted};\n  --border-subtle: ${tokens.border.subtle};\n\n  --drag-handle: ${tokens.misc.dragHandle};\n  --tooltip-bg: ${tokens.misc.tooltipBg};\n}\n`;
}

function parseColor(value) {
  const v = value.trim();

  if (v.startsWith('#')) {
    const hex = v.slice(1);
    if (hex.length === 6) {
      return `Color(0xFF${hex.toUpperCase()})`;
    }
    if (hex.length === 8) {
      return `Color(0x${hex.toUpperCase()})`;
    }
  }

  const rgba = v.match(/^rgba\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*([0-9]*\.?[0-9]+)\s*\)$/i);
  if (rgba) {
    const [, r, g, b, a] = rgba;
    const alpha = Number(a);
    return `Color.fromRGBO(${Number(r)}, ${Number(g)}, ${Number(b)}, ${alpha})`;
  }

  throw new Error(`Unsupported color format in tokens.json: ${value}`);
}

function toDart(tokens) {
  return `// AUTO-GENERATED from shared/theme/tokens.json - do not edit by hand.\n// Run: node scripts/generate-theme-artifacts.js\n\nimport 'package:flutter/material.dart';\n\nclass GeneratedThemeTokens {\n  const GeneratedThemeTokens._();\n\n  // Surfaces\n  static const surfaceDeepest = ${parseColor(tokens.surface.deepest)};\n  static const surfaceBase = ${parseColor(tokens.surface.base)};\n  static const surfaceElevated = ${parseColor(tokens.surface.elevated)};\n  static const surfaceMuted = ${parseColor(tokens.surface.muted)};\n\n  // Brand\n  static const brand = ${parseColor(tokens.brand.primary)};\n  static const brandHover = ${parseColor(tokens.brand.hover)};\n  static const brandSoft = ${parseColor(tokens.brand.soft)};\n  static const brandBorder = ${parseColor(tokens.brand.border)};\n  static const brandText = ${parseColor(tokens.brand.text)};\n  static const brandTextLight = ${parseColor(tokens.brand.textLight)};\n\n  // Secondary\n  static const secondary = ${parseColor(tokens.secondary.primary)};\n  static const secondaryHover = ${parseColor(tokens.secondary.hover)};\n  static const secondarySoft = ${parseColor(tokens.secondary.soft)};\n  static const secondaryBorder = ${parseColor(tokens.secondary.border)};\n\n  // Borders\n  static const borderDefault = ${parseColor(tokens.border.default)};\n  static const borderMuted = ${parseColor(tokens.border.muted)};\n  static const borderSubtle = ${parseColor(tokens.border.subtle)};\n\n  // Misc\n  static const dragHandle = ${parseColor(tokens.misc.dragHandle)};\n  static const tooltipBg = ${parseColor(tokens.misc.tooltipBg)};\n  static const error = ${parseColor(tokens.misc.error)};\n\n  // Text\n  static const textPrimary = ${parseColor(tokens.text.primary)};\n  static const textSecondary = ${parseColor(tokens.text.secondary)};\n}\n`;
}

function main() {
  if (!fs.existsSync(inputPath)) {
    throw new Error('Missing shared/theme/tokens.json');
  }

  const tokens = JSON.parse(fs.readFileSync(inputPath, 'utf8'));

  fs.writeFileSync(webOutputPath, toCss(tokens));
  fs.writeFileSync(flutterOutputPath, toDart(tokens));

  console.log(`Generated ${path.relative(projectRoot, webOutputPath)}`);
  console.log(`Generated ${path.relative(projectRoot, flutterOutputPath)}`);
}

main();
