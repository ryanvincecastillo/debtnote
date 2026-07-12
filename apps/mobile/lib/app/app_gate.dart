import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import '../core/project/app_project.dart';
import '../core/repository/debt_note_repository.dart';
import '../features/auth/auth_screen.dart';
import '../features/contacts/contacts_screen.dart';
import '../features/dashboard/dashboard_screen.dart';
import '../features/paluwagan/paluwagan_screen.dart';
import '../features/reminders/reminders_screen.dart';
import '../features/settings/settings_screen.dart';

class AppGate extends StatefulWidget {
  const AppGate({super.key});

  @override
  State<AppGate> createState() => _AppGateState();
}

class _AppGateState extends State<AppGate> {
  bool _bootstrapping = true;

  @override
  void initState() {
    super.initState();
    _bootstrap();
    Supabase.instance.client.auth.onAuthStateChange.listen((_) {
      if (mounted) setState(() {});
    });
  }

  Future<void> _bootstrap() async {
    if (AppProject.isConfigured) {
      await AppProject.ensureInitialized();
    }
    final session = Supabase.instance.client.auth.currentSession;
    if (session != null && AppProject.activeProjectIdSync != null) {
      try {
        await debtNoteRepo.ensureProfile();
      } catch (_) {}
    }
    if (mounted) setState(() => _bootstrapping = false);
  }

  @override
  Widget build(BuildContext context) {
    if (_bootstrapping) {
      return const Scaffold(
        body: Center(child: CircularProgressIndicator()),
      );
    }

    final session = Supabase.instance.client.auth.currentSession;
    if (session == null) return const AuthScreen();
    return const MainShell();
  }
}

class MainShell extends StatefulWidget {
  const MainShell({super.key});

  @override
  State<MainShell> createState() => _MainShellState();
}

class _MainShellState extends State<MainShell> {
  int _index = 0;

  static const _screens = [
    DashboardScreen(),
    ContactsScreen(),
    RemindersScreen(),
    PaluwaganScreen(),
    SettingsScreen(),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: _screens[_index],
      bottomNavigationBar: NavigationBar(
        selectedIndex: _index,
        onDestinationSelected: (i) => setState(() => _index = i),
        destinations: const [
          NavigationDestination(icon: Icon(Icons.dashboard_outlined), selectedIcon: Icon(Icons.dashboard), label: 'Home'),
          NavigationDestination(icon: Icon(Icons.people_outline), selectedIcon: Icon(Icons.people), label: 'Contacts'),
          NavigationDestination(icon: Icon(Icons.notifications_outlined), selectedIcon: Icon(Icons.notifications), label: 'Nudges'),
          NavigationDestination(icon: Icon(Icons.groups_outlined), selectedIcon: Icon(Icons.groups), label: 'Paluwagan'),
          NavigationDestination(icon: Icon(Icons.settings_outlined), selectedIcon: Icon(Icons.settings), label: 'Settings'),
        ],
      ),
    );
  }
}
