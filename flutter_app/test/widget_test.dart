import 'package:flutter_test/flutter_test.dart';
import 'package:musco_app/main.dart';

void main() {
  testWidgets('App renders without error', (tester) async {
    await tester.pumpWidget(const MuscoApp());
    // Verify the app starts (WebView won't fully render in test).
    expect(find.byType(MuscoApp), findsOneWidget);
  });
}
