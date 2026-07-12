import 'package:flutter/material.dart';

import '../../app/theme.dart';
import '../../core/repository/debt_note_repository.dart';
import '../../widgets/dn_components.dart';

class SettingsScreen extends StatefulWidget {
  const SettingsScreen({super.key});

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  final _nameCtrl = TextEditingController();
  final _gcashCtrl = TextEditingController();
  final _mayaCtrl = TextEditingController();
  String _tone = 'taglish_casual';
  String _plan = 'free';
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    final profile = await debtNoteRepo.fetchProfile();
    if (profile != null && mounted) {
      setState(() {
        _nameCtrl.text = profile.displayName;
        _gcashCtrl.text = profile.gcashNumber ?? '';
        _mayaCtrl.text = profile.mayaNumber ?? '';
        _tone = profile.defaultTone;
        _plan = profile.planTier;
        _loading = false;
      });
    } else if (mounted) {
      setState(() => _loading = false);
    }
  }

  Future<void> _save() async {
    await debtNoteRepo.updateProfile(
      displayName: _nameCtrl.text.trim(),
      gcashNumber: _gcashCtrl.text.trim(),
      mayaNumber: _mayaCtrl.text.trim(),
      defaultTone: _tone,
    );
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Settings saved')));
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Settings'),
        actions: [
          TextButton(onPressed: _save, child: const Text('Save')),
        ],
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator(color: DNTheme.bloodRed))
          : ListView(
              padding: const EdgeInsets.all(16),
              children: [
                DNCard(
                  child: Row(
                    children: [
                      const Icon(Icons.workspace_premium, color: DNTheme.gold),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text('Plan: ${_plan.toUpperCase()}', style: const TextStyle(color: DNTheme.paper, fontWeight: FontWeight.w600)),
                            const Text('Email reminders included. SMS coming soon.', style: TextStyle(color: DNTheme.textSecondary, fontSize: 12)),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 16),
                TextField(controller: _nameCtrl, decoration: const InputDecoration(labelText: 'Display name')),
                const SizedBox(height: 12),
                TextField(controller: _gcashCtrl, decoration: const InputDecoration(labelText: 'GCash number')),
                const SizedBox(height: 12),
                TextField(controller: _mayaCtrl, decoration: const InputDecoration(labelText: 'Maya number')),
                const SizedBox(height: 16),
                const Text('Default reminder tone', style: TextStyle(color: DNTheme.paper, fontWeight: FontWeight.w600)),
                const SizedBox(height: 8),
                Wrap(
                  spacing: 8,
                  children: toneLabels.keys
                      .map((t) => DNToneChip(
                            tone: t,
                            selected: _tone == t,
                            onTap: () => setState(() => _tone = t),
                          ))
                      .toList(),
                ),
                const SizedBox(height: 32),
                OutlinedButton.icon(
                  onPressed: () => debtNoteRepo.signOut(),
                  icon: const Icon(Icons.logout, color: DNTheme.bloodRed),
                  label: const Text('Sign out', style: TextStyle(color: DNTheme.bloodRed)),
                ),
              ],
            ),
    );
  }
}
