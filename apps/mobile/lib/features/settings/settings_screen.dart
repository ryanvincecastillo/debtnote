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
                            const Text(
                              'Email reminders included. SMS + paid upgrade deferred until email delivery is solid.',
                              style: TextStyle(color: DNTheme.textSecondary, fontSize: 12),
                            ),
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
                  onPressed: _changeEmail,
                  icon: const Icon(Icons.alternate_email, color: DNTheme.paper),
                  label: const Text('Change email', style: TextStyle(color: DNTheme.paper)),
                ),
                const SizedBox(height: 12),
                OutlinedButton.icon(
                  onPressed: () => debtNoteRepo.signOut(),
                  icon: const Icon(Icons.logout, color: DNTheme.bloodRed),
                  label: const Text('Sign out', style: TextStyle(color: DNTheme.bloodRed)),
                ),
                const SizedBox(height: 24),
                const Text('Danger zone', style: TextStyle(fontWeight: FontWeight.w600, color: DNTheme.bloodRed)),
                const SizedBox(height: 8),
                const Text(
                  'Permanently erase your DebtNote notebook — contacts, records, agreements, reminders, and proofs.',
                  style: TextStyle(color: DNTheme.textSecondary, fontSize: 12),
                ),
                const SizedBox(height: 12),
                OutlinedButton.icon(
                  onPressed: _confirmDeleteAccount,
                  icon: const Icon(Icons.delete_forever, color: DNTheme.bloodRed),
                  label: const Text('Delete account', style: TextStyle(color: DNTheme.bloodRed)),
                ),
              ],
            ),
    );
  }

  Future<void> _changeEmail() async {
    final emailCtrl = TextEditingController();
    final next = await showDialog<String>(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: DNTheme.surface,
        title: const Text('Change email'),
        content: TextField(
          controller: emailCtrl,
          keyboardType: TextInputType.emailAddress,
          decoration: const InputDecoration(labelText: 'New email'),
          autofocus: true,
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
          FilledButton(
            onPressed: () => Navigator.pop(ctx, emailCtrl.text.trim()),
            child: const Text('Send code'),
          ),
        ],
      ),
    );
    if (next == null || next.isEmpty || !mounted) return;

    try {
      await debtNoteRepo.requestEmailChange(next);
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Could not send: $e')));
      return;
    }

    if (!mounted) return;
    final codeCtrl = TextEditingController();
    final code = await showDialog<String>(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: DNTheme.surface,
        title: const Text('Enter confirmation code'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Sent to $next', style: const TextStyle(color: DNTheme.textSecondary, fontSize: 12)),
            const SizedBox(height: 12),
            TextField(
              controller: codeCtrl,
              keyboardType: TextInputType.number,
              decoration: const InputDecoration(labelText: '6-digit code'),
              autofocus: true,
            ),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
          FilledButton(
            onPressed: () => Navigator.pop(ctx, codeCtrl.text.trim()),
            child: const Text('Confirm'),
          ),
        ],
      ),
    );
    if (code == null || code.isEmpty || !mounted) return;

    try {
      await debtNoteRepo.confirmEmailChange(newEmail: next, token: code);
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Email updated')));
      _load();
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Could not confirm: $e')));
    }
  }

  Future<void> _confirmDeleteAccount() async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: DNTheme.surface,
        title: const Text('Delete account?'),
        content: const Text(
          'This permanently deletes your DebtNote data. If this login is only used for DebtNote, the Auth user is removed too. Type DELETE in the next step.',
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Cancel')),
          TextButton(
            onPressed: () => Navigator.pop(ctx, true),
            style: TextButton.styleFrom(foregroundColor: DNTheme.bloodRed),
            child: const Text('Continue'),
          ),
        ],
      ),
    );
    if (confirmed != true || !mounted) return;

    final ctrl = TextEditingController();
    final typed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: DNTheme.surface,
        title: const Text('Type DELETE'),
        content: TextField(
          controller: ctrl,
          decoration: const InputDecoration(hintText: 'DELETE'),
          autofocus: true,
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Cancel')),
          TextButton(
            onPressed: () => Navigator.pop(ctx, ctrl.text.trim() == 'DELETE'),
            style: TextButton.styleFrom(foregroundColor: DNTheme.bloodRed),
            child: const Text('Delete forever'),
          ),
        ],
      ),
    );
    if (typed != true || !mounted) return;

    try {
      await debtNoteRepo.deleteAccount();
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Account deleted')),
      );
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Could not delete: $e')),
      );
    }
  }
}