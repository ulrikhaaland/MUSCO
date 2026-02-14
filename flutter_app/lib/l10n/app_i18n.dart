import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

class AppI18n extends ChangeNotifier {
  static const supportedLocales = [Locale('en'), Locale('nb')];

  Locale _locale = const Locale('en');
  Map<String, String> _fallbackTranslations = const {};
  Map<String, String> _translations = const {};

  Locale get locale => _locale;

  Future<void> initialize(Locale preferredLocale) async {
    _fallbackTranslations = await _loadLocaleMap('en');
    final localeCode = _normalizeSupportedCode(preferredLocale.languageCode);
    _translations = localeCode == 'en'
        ? _fallbackTranslations
        : await _loadLocaleMap(localeCode);
    _locale = Locale(localeCode);
    notifyListeners();
  }

  Future<void> setLocale(Locale locale) async {
    final localeCode = _normalizeSupportedCode(locale.languageCode);
    if (_locale.languageCode == localeCode) return;
    _translations = localeCode == 'en'
        ? _fallbackTranslations
        : await _loadLocaleMap(localeCode);
    _locale = Locale(localeCode);
    notifyListeners();
  }

  String t(String key, {Map<String, String>? replacements}) {
    var value = _translations[key] ?? _fallbackTranslations[key] ?? key;
    if (replacements != null && replacements.isNotEmpty) {
      replacements.forEach((placeholder, replacement) {
        value = value.replaceAll('{{$placeholder}}', replacement);
      });
    }
    return value;
  }

  String _normalizeSupportedCode(String code) {
    final normalized = code.toLowerCase();
    return supportedLocales.any((l) => l.languageCode == normalized)
        ? normalized
        : 'en';
  }

  Future<Map<String, String>> _loadLocaleMap(String localeCode) async {
    final raw = await rootBundle.loadString('assets/i18n/$localeCode.json');
    final decoded = jsonDecode(raw) as Map<String, dynamic>;
    return decoded.map((key, value) => MapEntry(key, value.toString()));
  }
}

class AppI18nScope extends InheritedNotifier<AppI18n> {
  const AppI18nScope({
    super.key,
    required AppI18n notifier,
    required super.child,
  }) : super(notifier: notifier);

  static AppI18n of(BuildContext context) {
    final scope = context.dependOnInheritedWidgetOfExactType<AppI18nScope>();
    assert(scope != null, 'No AppI18nScope found in context.');
    return scope!.notifier!;
  }
}

extension AppI18nContext on BuildContext {
  AppI18n get i18n => AppI18nScope.of(this);

  String t(String key, {Map<String, String>? replacements}) =>
      i18n.t(key, replacements: replacements);
}
