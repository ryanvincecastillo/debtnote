import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:image_picker/image_picker.dart';
import 'package:share_plus/share_plus.dart';

import '../../app/theme.dart';
import '../../core/models/debt_note_models.dart';
import '../../core/repository/debt_note_repository.dart';
import '../../widgets/dn_components.dart';

class RecordDetailScreen extends StatefulWidget {
  const RecordDetailScreen({super.key, required this.recordId});

  final String recordId;

  @override
  State<RecordDetailScreen> createState() => _RecordDetailScreenState();
}

class _RecordDetailScreenState extends State<RecordDetailScreen> {
  DebtNoteRecord? _record;
  List<DebtNoteInstallment> _installments = [];
  List<DebtNoteAgreement> _agreements = [];
  List<DebtNoteReminder> _reminders = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() => _loading = true);
    final records = await debtNoteRepo.fetchRecords();
    final matches = records.where((r) => r.id == widget.recordId);
    final record = matches.isEmpty ? null : matches.first;
    final installments = await debtNoteRepo.fetchInstallments(widget.recordId);
    final agreements = await debtNoteRepo.fetchAgreements(widget.recordId);
    final reminders = await debtNoteRepo.fetchReminders(recordId: widget.recordId);
    if (mounted) {
      setState(() {
        _record = record;
        _installments = installments;
        _agreements = agreements;
        _reminders = reminders;
        _loading = false;
      });
    }
  }

  Future<void> _logPayment() async {
    final amountCtrl = TextEditingController();
    final saved = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: DNTheme.surface,
        title: const Text('Log payment'),
        content: TextField(
          controller: amountCtrl,
          keyboardType: TextInputType.number,
          decoration: const InputDecoration(labelText: 'Amount'),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
          FilledButton(
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text('Save'),
          ),
        ],
      ),
    );
    if (saved == true) {
      final amount = double.tryParse(amountCtrl.text);
      if (amount != null && amount > 0) {
        final pending = _installments.where((i) => i.status == 'pending');
        final nextPending = pending.isEmpty ? null : pending.first;
        await debtNoteRepo.recordPayment(
          recordId: widget.recordId,
          amount: amount,
          installmentId: nextPending?.id,
        );
        _load();
      }
    }
  }

  Future<void> _scheduleReminder() async {
    final profile = await debtNoteRepo.fetchProfile();
    var tone = profile?.defaultTone ?? 'taglish_casual';
    await showModalBottomSheet<void>(
      context: context,
      backgroundColor: DNTheme.surface,
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setModal) => Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('Reminder tone', style: TextStyle(fontWeight: FontWeight.w600, color: DNTheme.paper)),
              const SizedBox(height: 8),
              Wrap(
                spacing: 8,
                children: toneLabels.keys.map((t) => DNToneChip(
                  tone: t,
                  selected: tone == t,
                  onTap: () => setModal(() => tone = t),
                )).toList(),
              ),
              const SizedBox(height: 16),
              FilledButton(
                onPressed: () async {
                  await debtNoteRepo.scheduleReminder(
                    recordId: widget.recordId,
                    scheduledAt: DateTime.now().add(const Duration(hours: 1)),
                    tone: tone,
                  );
                  if (ctx.mounted) Navigator.pop(ctx);
                  _load();
                },
                child: const Text('Schedule email reminder'),
              ),
              const SizedBox(height: 16),
            ],
          ),
        ),
      ),
    );
  }

  Future<void> _createAgreement() async {
    final nameCtrl = TextEditingController(text: _record?.contactName ?? '');
    final emailCtrl = TextEditingController();
    final saved = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: DNTheme.surface,
        title: const Text('Create agreement link'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(controller: nameCtrl, decoration: const InputDecoration(labelText: 'Borrower name')),
            TextField(controller: emailCtrl, decoration: const InputDecoration(labelText: 'Borrower email')),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
          FilledButton(onPressed: () => Navigator.pop(ctx, true), child: const Text('Create')),
        ],
      ),
    );
    if (saved == true && nameCtrl.text.trim().isNotEmpty) {
      final agreement = await debtNoteRepo.createAgreement(
        recordId: widget.recordId,
        borrowerName: nameCtrl.text.trim(),
        borrowerEmail: emailCtrl.text.trim().isEmpty ? null : emailCtrl.text.trim(),
      );
      final link = 'https://debtnote.app/a/${agreement.publicToken}';
      await Share.share('Sign your promissory note: $link');
      _load();
    }
  }

  Future<void> _uploadProof() async {
    final picker = ImagePicker();
    final file = await picker.pickImage(source: ImageSource.gallery, imageQuality: 85);
    if (file == null) return;
    final bytes = await file.readAsBytes();
    await debtNoteRepo.submitProof(
      recordId: widget.recordId,
      bytes: bytes,
      fileName: file.name,
    );
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Proof uploaded — reminders frozen')),
      );
      _load();
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) {
      return const Scaffold(body: Center(child: CircularProgressIndicator(color: DNTheme.bloodRed)));
    }
    final record = _record;
    if (record == null) {
      return const Scaffold(body: DNEmptyState(message: 'Record not found'));
    }

    return Scaffold(
      appBar: AppBar(title: Text(record.title)),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          DNCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(formatPeso(record.balance), style: const TextStyle(fontSize: 28, fontWeight: FontWeight.bold, color: DNTheme.paper)),
                Text('Balance of ${formatPeso(record.principal)} · ${scheduleLabels[record.scheduleType]}',
                    style: const TextStyle(color: DNTheme.textSecondary)),
              ],
            ),
          ),
          const SizedBox(height: 16),
          const Text('Installments', style: TextStyle(fontWeight: FontWeight.w600, color: DNTheme.paper)),
          const SizedBox(height: 8),
          DNInstallmentTimeline(installments: _installments),
          const SizedBox(height: 16),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: [
              OutlinedButton.icon(onPressed: _logPayment, icon: const Icon(Icons.payments), label: const Text('Log payment')),
              OutlinedButton.icon(onPressed: _scheduleReminder, icon: const Icon(Icons.notifications), label: const Text('Remind')),
              OutlinedButton.icon(onPressed: _createAgreement, icon: const Icon(Icons.draw), label: const Text('Agreement')),
              OutlinedButton.icon(onPressed: _uploadProof, icon: const Icon(Icons.receipt), label: const Text('Upload proof')),
            ],
          ),
          const SizedBox(height: 24),
          const Text('Reminders', style: TextStyle(fontWeight: FontWeight.w600, color: DNTheme.paper)),
          ..._reminders.map((r) => ListTile(
                dense: true,
                title: Text('${toneLabels[r.tone]} · ${r.status}', style: const TextStyle(color: DNTheme.textPrimary)),
                subtitle: Text(r.scheduledAt.toLocal().toString(), style: const TextStyle(color: DNTheme.textSecondary, fontSize: 11)),
              )),
          const SizedBox(height: 16),
          const Text('Agreements', style: TextStyle(fontWeight: FontWeight.w600, color: DNTheme.paper)),
          ..._agreements.map((a) => ListTile(
                dense: true,
                title: Text(a.borrowerName, style: const TextStyle(color: DNTheme.textPrimary)),
                subtitle: Text(a.signedAt != null ? 'Signed' : 'Pending signature',
                    style: TextStyle(color: a.signedAt != null ? DNTheme.success : DNTheme.warning, fontSize: 11)),
                trailing: IconButton(
                  icon: const Icon(Icons.copy, size: 18),
                  onPressed: () {
                    Clipboard.setData(ClipboardData(text: 'https://debtnote.app/a/${a.publicToken}'));
                    ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Link copied')));
                  },
                ),
              )),
        ],
      ),
    );
  }
}
