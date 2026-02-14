import 'package:flutter/material.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:flutter_localizations/flutter_localizations.dart';

import 'l10n/app_i18n.dart';
import 'screens/model_viewer_screen.dart';
import 'theme/app_theme.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  try {
    await Firebase.initializeApp();
  } catch (e) {
    // Keep the app usable in local/dev environments where Firebase
    // is not configured yet; chat will fall back to anonymous requests.
    // ignore: avoid_print
    print('[MuscoApp] Firebase init skipped: $e');
  }

  runApp(const MuscoApp());
}

class MuscoApp extends StatefulWidget {
  const MuscoApp({super.key});

  @override
  State<MuscoApp> createState() => _MuscoAppState();
}

class _MuscoAppState extends State<MuscoApp> {
  final AppI18n _i18n = AppI18n();
  bool _isReady = false;

  @override
  void initState() {
    super.initState();
    _bootstrapI18n();
  }

  Future<void> _bootstrapI18n() async {
    final preferredLocale = WidgetsBinding.instance.platformDispatcher.locale;
    await _i18n.initialize(preferredLocale);
    if (!mounted) return;
    setState(() => _isReady = true);
  }

  @override
  Widget build(BuildContext context) {
    if (!_isReady) {
      return MaterialApp(
        title: 'Musco',
        theme: AppTheme.dark(),
        home: const Scaffold(
          backgroundColor: Colors.black,
          body: Center(child: CircularProgressIndicator()),
        ),
      );
    }

    return AppI18nScope(
      notifier: _i18n,
      child: AnimatedBuilder(
        animation: _i18n,
        builder: (context, _) {
          return MaterialApp(
            title: 'Musco',
            theme: AppTheme.dark(),
            locale: _i18n.locale,
            supportedLocales: AppI18n.supportedLocales,
            localizationsDelegates: const [
              GlobalMaterialLocalizations.delegate,
              GlobalWidgetsLocalizations.delegate,
              GlobalCupertinoLocalizations.delegate,
            ],
            home: const AppShell(),
          );
        },
      ),
    );
  }
}

class AppShell extends StatefulWidget {
  const AppShell({super.key});

  @override
  State<AppShell> createState() => _AppShellState();
}

class _AppShellState extends State<AppShell> {
  int _currentIndex = 0;

  late final List<Widget> _pages = const [
    ModelViewerScreen(showBackButton: false),
    _PlaceholderTabPage(title: 'Program'),
    _PlaceholderTabPage(title: 'Programs'),
    _PlaceholderTabPage(title: 'Calendar'),
    _PlaceholderTabPage(title: 'Profile'),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: IndexedStack(index: _currentIndex, children: _pages),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _currentIndex,
        onDestinationSelected: (index) {
          setState(() => _currentIndex = index);
        },
        destinations: const [
          NavigationDestination(
            icon: Icon(Icons.explore_outlined),
            selectedIcon: Icon(Icons.explore),
            label: 'Explore',
          ),
          NavigationDestination(
            icon: Icon(Icons.fitness_center_outlined),
            selectedIcon: Icon(Icons.fitness_center),
            label: 'Program',
          ),
          NavigationDestination(
            icon: Icon(Icons.view_list_outlined),
            selectedIcon: Icon(Icons.view_list),
            label: 'Programs',
          ),
          NavigationDestination(
            icon: Icon(Icons.calendar_month_outlined),
            selectedIcon: Icon(Icons.calendar_month),
            label: 'Calendar',
          ),
          NavigationDestination(
            icon: Icon(Icons.person_outline),
            selectedIcon: Icon(Icons.person),
            label: 'Profile',
          ),
        ],
      ),
    );
  }
}

class _PlaceholderTabPage extends StatefulWidget {
  const _PlaceholderTabPage({required this.title});

  final String title;

  @override
  State<_PlaceholderTabPage> createState() => _PlaceholderTabPageState();
}

class _PlaceholderTabPageState extends State<_PlaceholderTabPage>
    with AutomaticKeepAliveClientMixin {
  final TextEditingController _controller = TextEditingController();
  int _counter = 0;

  @override
  bool get wantKeepAlive => true;

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    super.build(context);

    return Scaffold(
      appBar: AppBar(title: Text(widget.title)),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              '${widget.title} placeholder',
              style: Theme.of(context).textTheme.headlineSmall,
            ),
            const SizedBox(height: 12),
            Text(
              'This page is scaffolded and keeps state while switching tabs.',
              style: Theme.of(context).textTheme.bodyMedium,
            ),
            const SizedBox(height: 16),
            TextField(
              controller: _controller,
              decoration: const InputDecoration(
                border: OutlineInputBorder(),
                labelText: 'State test input',
              ),
            ),
            const SizedBox(height: 12),
            Text('Counter: $_counter'),
            const SizedBox(height: 8),
            FilledButton(
              onPressed: () => setState(() => _counter++),
              child: const Text('Increment'),
            ),
          ],
        ),
      ),
    );
  }
}
