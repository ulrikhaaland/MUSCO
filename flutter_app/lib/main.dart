import 'package:flutter/material.dart';
import 'screens/model_viewer_screen.dart';

void main() {
  runApp(const MuscoApp());
}

class MuscoApp extends StatelessWidget {
  const MuscoApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Musco',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.deepPurple),
        useMaterial3: true,
      ),
      home: const HomePage(),
    );
  }
}

class HomePage extends StatelessWidget {
  const HomePage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Musco'),
        backgroundColor: Theme.of(context).colorScheme.inversePrimary,
      ),
      body: Center(
        child: ElevatedButton.icon(
          icon: const Icon(Icons.view_in_ar),
          label: const Text('Open 3D Model Viewer'),
          onPressed: () {
            Navigator.push(
              context,
              MaterialPageRoute(
                builder: (_) => const ModelViewerScreen(),
              ),
            );
          },
        ),
      ),
    );
  }
}
