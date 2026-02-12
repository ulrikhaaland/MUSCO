import 'package:flutter_test/flutter_test.dart';

import 'package:musco_app/main.dart';

void main() {
  testWidgets('App renders home page with viewer button', (WidgetTester tester) async {
    await tester.pumpWidget(const MuscoApp());

    expect(find.text('Musco'), findsOneWidget);
    expect(find.text('Open 3D Model Viewer'), findsOneWidget);
  });
}
