import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import 'app/app_gate.dart';
import 'app/theme.dart';
import 'core/project/app_project.dart';
import 'core/supabase/supabase_bootstrap.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  await runZonedGuarded(() async {
    try {
      await dotenv.load(fileName: '.env');
    } catch (_) {}

    final supabaseUrl = dotenv.env['SUPABASE_URL'] ?? '';
    final supabaseAnonKey = dotenv.env['SUPABASE_ANON_KEY'] ?? '';

    if (supabaseUrl.isNotEmpty && supabaseAnonKey.isNotEmpty) {
      await Supabase.initialize(
        url: supabaseUrl,
        anonKey: supabaseAnonKey,
        authOptions: const FlutterAuthClientOptions(
          authFlowType: AuthFlowType.pkce,
        ),
      );
      SupabaseBootstrap.markInitialized();
      if (AppProject.isConfigured) {
        await AppProject.ensureInitialized();
      }
    }

    runApp(const DebtNoteApp());
  }, (error, stack) {
    debugPrint('Unhandled error: $error');
    debugPrintStack(stackTrace: stack);
  });
}

class DebtNoteApp extends StatelessWidget {
  const DebtNoteApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Debt Note App',
      debugShowCheckedModeBanner: false,
      theme: DNTheme.darkTheme,
      home: const AppGate(),
    );
  }
}
