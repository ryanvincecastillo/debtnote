import 'package:flutter/material.dart';

import '../../app/theme.dart';
import '../../core/models/debt_note_models.dart';
import '../../core/repository/debt_note_repository.dart';
import '../../widgets/dn_components.dart';

class RemindersScreen extends StatefulWidget {
  const RemindersScreen({super.key});

  @override
  State<RemindersScreen> createState() => _RemindersScreenState();
}

class _RemindersScreenState extends State<RemindersScreen> {
  List<DebtNoteReminder> _reminders = [];
  String _previewTone = 'taglish_casual';
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() => _loading = true);
    final reminders = await debtNoteRepo.fetchReminders();
    if (mounted) setState(() {
      _reminders = reminders;
      _loading = false;
    });
  }

  String _previewMessage(String tone) {
    switch (tone) {
      case 'corporate':
        return 'Dear Juan, this is a formal notice regarding your obligation of ₱1,500.00 due 15-July-2026.';
      case 'assertive':
        return 'Juan, your ₱1,500.00 payment was due 15-July-2026. Please pay today.';
      case 'shinigami':
        return 'Juan... ang utang na ₱1,500.00 ay due na. Huwag palampasin — ang notebook ay nakatutok.';
      default:
        return 'Hi Juan! Friendly reminder: your payment of ₱1,500.00 is due on 15-July-2026. Salamat!';
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Reminders')),
      body: _loading
          ? const Center(child: CircularProgressIndicator(color: DNTheme.bloodRed))
          : ListView(
              padding: const EdgeInsets.all(16),
              children: [
                const Text('Tone preview', style: TextStyle(fontWeight: FontWeight.w600, color: DNTheme.paper)),
                const SizedBox(height: 8),
                Wrap(
                  spacing: 8,
                  children: toneLabels.keys
                      .map((t) => DNToneChip(
                            tone: t,
                            selected: _previewTone == t,
                            onTap: () => setState(() => _previewTone = t),
                          ))
                      .toList(),
                ),
                const SizedBox(height: 12),
                DNCard(
                  child: Text(_previewMessage(_previewTone), style: const TextStyle(color: DNTheme.paper, height: 1.5)),
                ),
                const SizedBox(height: 24),
                const Text('Scheduled queue', style: TextStyle(fontWeight: FontWeight.w600, color: DNTheme.paper)),
                const SizedBox(height: 8),
                if (_reminders.isEmpty)
                  const DNEmptyState(message: 'No reminders scheduled yet.', icon: Icons.schedule)
                else
                  ..._reminders.map(
                    (r) => Padding(
                      padding: const EdgeInsets.only(bottom: 8),
                      child: DNCard(
                        child: Row(
                          children: [
                            Icon(
                              r.status == 'frozen' ? Icons.ac_unit : Icons.email_outlined,
                              color: r.status == 'frozen' ? Colors.blue : DNTheme.gold,
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(toneLabels[r.tone] ?? r.tone, style: const TextStyle(color: DNTheme.paper)),
                                  Text(
                                    '${r.status.toUpperCase()} · ${r.scheduledAt.toLocal()}',
                                    style: const TextStyle(color: DNTheme.textSecondary, fontSize: 11),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
              ],
            ),
    );
  }
}
