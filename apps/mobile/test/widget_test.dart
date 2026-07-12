import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:debtnote_mobile/features/auth/auth_screen.dart';

void main() {
  testWidgets('Debt Note App auth screen smoke test', (WidgetTester tester) async {
    await tester.pumpWidget(const MaterialApp(home: AuthScreen()));
    expect(find.text('Let the notebook do the talking.'), findsOneWidget);
    expect(find.byType(Image), findsWidgets);
  });
}
