import 'package:flutter/material.dart';
import 'generated_theme_tokens.dart';

class AppTheme {
  const AppTheme._();

  static ThemeData dark() {
    final scheme = const ColorScheme.dark(
      primary: GeneratedThemeTokens.brand,
      onPrimary: GeneratedThemeTokens.textPrimary,
      secondary: GeneratedThemeTokens.brandHover,
      onSecondary: GeneratedThemeTokens.textPrimary,
      surface: GeneratedThemeTokens.surfaceBase,
      onSurface: GeneratedThemeTokens.textPrimary,
      error: GeneratedThemeTokens.error,
      onError: GeneratedThemeTokens.textPrimary,
    );

    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.dark,
      colorScheme: scheme,
      scaffoldBackgroundColor: GeneratedThemeTokens.surfaceBase,
      canvasColor: GeneratedThemeTokens.surfaceBase,
      appBarTheme: const AppBarTheme(
        backgroundColor: GeneratedThemeTokens.surfaceBase,
        foregroundColor: GeneratedThemeTokens.textPrimary,
        elevation: 0,
        surfaceTintColor: Colors.transparent,
      ),
      navigationBarTheme: NavigationBarThemeData(
        backgroundColor: GeneratedThemeTokens.surfaceElevated,
        height: 68,
        indicatorColor: GeneratedThemeTokens.brand.withValues(alpha: 0.18),
        labelTextStyle: WidgetStateProperty.resolveWith((states) {
          final selected = states.contains(WidgetState.selected);
          return TextStyle(
            color: selected
                ? GeneratedThemeTokens.brandText
                : GeneratedThemeTokens.textSecondary,
            fontSize: 12,
            fontWeight: selected ? FontWeight.w600 : FontWeight.w500,
          );
        }),
        iconTheme: WidgetStateProperty.resolveWith((states) {
          final selected = states.contains(WidgetState.selected);
          return IconThemeData(
            color: selected
                ? GeneratedThemeTokens.brandText
                : GeneratedThemeTokens.textSecondary,
            size: 22,
          );
        }),
      ),
      dividerColor: GeneratedThemeTokens.borderDefault,
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: GeneratedThemeTokens.surfaceMuted,
        labelStyle: const TextStyle(color: GeneratedThemeTokens.textSecondary),
        hintStyle: const TextStyle(color: GeneratedThemeTokens.textSecondary),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10),
          borderSide: const BorderSide(
            color: GeneratedThemeTokens.borderDefault,
          ),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10),
          borderSide: const BorderSide(
            color: GeneratedThemeTokens.borderDefault,
          ),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10),
          borderSide: const BorderSide(
            color: GeneratedThemeTokens.brand,
            width: 1.5,
          ),
        ),
      ),
      filledButtonTheme: FilledButtonThemeData(
        style: FilledButton.styleFrom(
          backgroundColor: GeneratedThemeTokens.brand,
          foregroundColor: GeneratedThemeTokens.textPrimary,
          textStyle: const TextStyle(fontWeight: FontWeight.w600),
        ),
      ),
      textTheme: const TextTheme(
        headlineSmall: TextStyle(
          color: GeneratedThemeTokens.textPrimary,
          fontWeight: FontWeight.w700,
        ),
        bodyMedium: TextStyle(color: GeneratedThemeTokens.textSecondary),
        bodyLarge: TextStyle(color: GeneratedThemeTokens.textPrimary),
      ),
    );
  }
}
