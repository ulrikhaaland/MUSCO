import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import 'screens/viewer_screen.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();

  // Dark status bar to match the viewer background.
  SystemChrome.setSystemUIOverlayStyle(const SystemUiOverlayStyle(
    statusBarColor: Colors.transparent,
    statusBarIconBrightness: Brightness.light,
    systemNavigationBarColor: Colors.black,
  ));

  runApp(const MuscoApp());
}

class MuscoApp extends StatelessWidget {
  const MuscoApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Musco',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF6366F1), // Indigo-500
          brightness: Brightness.dark,
        ),
        scaffoldBackgroundColor: Colors.black,
        useMaterial3: true,
      ),
      home: const ViewerScreen(),
    );
  }
}
