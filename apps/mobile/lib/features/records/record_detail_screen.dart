import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:image_picker/image_picker.dart';
import 'package:intl/intl.dart';
import 'package:share_plus/share_plus.dart';
import 'package:url_launcher/url_launcher.dart';

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
  List<DebtNoteProof> _proofs = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  String? get _debtorEmail {
    final contact = _record?.contactEmail?.trim();
    if (contact != null && contact.isNotEmpty) return contact;
    for (final a in _agreements) {
      final e = a.borrowerEmail?.trim();
      if (e != null && e.isNotEmpty) return e;
    }
    return null;
  }

  Future<void> _load() async {
    setState(() => _loading = true);
    final records = await debtNoteRepo.fetchRecords();
    final matches = records.where((r) => r.id == widget.recordId);
    final record = matches.isEmpty ? null : matches.first;
    final installments = await debtNoteRepo.fetchInstallments(widget.recordId);
    final agreements = await debtNoteRepo.fetchAgreements(widget.recordId);
    final reminders = await debtNoteRepo.fetchReminders(recordId: widget.recordId);
    final proofs = await debtNoteRepo.fetchProofs(widget.recordId);
    if (mounted) {
      setState(() {
        _record = record;
        _installments = installments;
        _agreements = agreements;
        _reminders = reminders;
        _proofs = proofs;
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

  Future<DateTime?> _pickDateTime({DateTime? initial}) async {
    final now = DateTime.now();
    final base = initial ?? now.add(const Duration(hours: 1));
    final date = await showDatePicker(
      context: context,
      initialDate: base,
      firstDate: now,
      lastDate: now.add(const Duration(days: 365 * 2)),
    );
    if (date == null || !mounted) return null;
    final time = await showTimePicker(
      context: context,
      initialTime: TimeOfDay.fromDateTime(base),
    );
    if (time == null) return null;
    return DateTime(date.year, date.month, date.day, time.hour, time.minute);
  }

  Future<void> _scheduleReminder() async {
    final email = _debtorEmail;
    if (email == null) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text(
            'Walang email ang debtor. Magdagdag sa contact, o i-share via WhatsApp.',
          ),
        ),
      );
      return;
    }

    final profile = await debtNoteRepo.fetchProfile();
    if (!mounted) return;
    var tone = profile?.defaultTone ?? 'taglish_casual';
    var scheduledAt = DateTime.now().add(const Duration(hours: 1));

    await showModalBottomSheet<void>(
      context: context,
      backgroundColor: DNTheme.surface,
      isScrollControlled: true,
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setModal) => Padding(
          padding: EdgeInsets.fromLTRB(16, 16, 16, 16 + MediaQuery.of(ctx).viewInsets.bottom),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('Email the debtor',
                  style: TextStyle(fontWeight: FontWeight.w600, color: DNTheme.paper)),
              const SizedBox(height: 8),
              Text(
                'Sends to $email — not to you.',
                style: const TextStyle(color: DNTheme.textSecondary, fontSize: 12),
              ),
              const SizedBox(height: 12),
              const Text('Tone', style: TextStyle(color: DNTheme.paper, fontSize: 13)),
              const SizedBox(height: 8),
              Wrap(
                spacing: 8,
                children: toneLabels.keys
                    .map(
                      (t) => DNToneChip(
                        tone: t,
                        selected: tone == t,
                        onTap: () => setModal(() => tone = t),
                      ),
                    )
                    .toList(),
              ),
              const SizedBox(height: 16),
              ListTile(
                contentPadding: EdgeInsets.zero,
                title: const Text('Send at', style: TextStyle(color: DNTheme.paper)),
                subtitle: Text(
                  DateFormat('yyyy-MM-dd HH:mm').format(scheduledAt.toLocal()),
                  style: const TextStyle(color: DNTheme.textSecondary),
                ),
                trailing: const Icon(Icons.edit_calendar, color: DNTheme.paper),
                onTap: () async {
                  final picked = await _pickDateTime(initial: scheduledAt);
                  if (picked != null) setModal(() => scheduledAt = picked);
                },
              ),
              const SizedBox(height: 8),
              FilledButton(
                onPressed: () async {
                  await debtNoteRepo.scheduleReminder(
                    recordId: widget.recordId,
                    scheduledAt: scheduledAt,
                    tone: tone,
                  );
                  if (ctx.mounted) Navigator.pop(ctx);
                  _load();
                },
                child: const Text('Schedule email reminder'),
              ),
              const SizedBox(height: 8),
            ],
          ),
        ),
      ),
    );
  }

  Future<void> _createAgreement() async {
    final nameCtrl = TextEditingController(text: _record?.contactName ?? '');
    final emailCtrl = TextEditingController(text: _record?.contactEmail ?? '');
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
      final link = debtNoteRepo.agreementLink(agreement.publicToken);
      await Share.share('Sign your promissory note: $link');
      _load();
    }
  }

  Future<void> _shareWhatsApp(String link) async {
    final text = Uri.encodeComponent('Sign your promissory note: $link');
    final uri = Uri.parse('https://wa.me/?text=$text');
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    } else {
      await Share.share('Sign your promissory note: $link');
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

  Future<void> _reviewProof(DebtNoteProof proof, String decision) async {
    await debtNoteRepo.reviewProof(
      proofId: proof.id,
      recordId: widget.recordId,
      decision: decision,
    );
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(decision == 'verified' ? 'Proof verified' : 'Proof rejected')),
      );
      _load();
    }
  }

  Future<void> _openProof(DebtNoteProof proof) async {
    final url = await debtNoteRepo.proofSignedUrl(proof.storagePath);
    if (url == null || !mounted) return;
    final uri = Uri.parse(url);
    await launchUrl(uri, mode: LaunchMode.externalApplication);
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
                Text(formatPeso(record.balance),
                    style: const TextStyle(fontSize: 28, fontWeight: FontWeight.bold, color: DNTheme.paper)),
                Text(
                  'Balance of ${formatPeso(record.principal)} · ${scheduleLabels[record.scheduleType]}',
                  style: const TextStyle(color: DNTheme.textSecondary),
                ),
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
              OutlinedButton.icon(
                  onPressed: _logPayment, icon: const Icon(Icons.payments), label: const Text('Log payment')),
              OutlinedButton.icon(
                  onPressed: _scheduleReminder, icon: const Icon(Icons.notifications), label: const Text('Remind')),
              OutlinedButton.icon(
                  onPressed: _createAgreement, icon: const Icon(Icons.draw), label: const Text('Agreement')),
              OutlinedButton.icon(
                  onPressed: _uploadProof, icon: const Icon(Icons.receipt), label: const Text('Upload proof')),
            ],
          ),
          const SizedBox(height: 24),
          const Text('Reminders', style: TextStyle(fontWeight: FontWeight.w600, color: DNTheme.paper)),
          if (_reminders.isEmpty)
            const Padding(
              padding: EdgeInsets.symmetric(vertical: 8),
              child: Text('No reminders yet.', style: TextStyle(color: DNTheme.textSecondary, fontSize: 12)),
            ),
          ..._reminders.map(
            (r) => ListTile(
              dense: true,
              title: Text('${toneLabels[r.tone]} · ${r.status}',
                  style: const TextStyle(color: DNTheme.textPrimary)),
              subtitle: Text(r.scheduledAt.toLocal().toString(),
                  style: const TextStyle(color: DNTheme.textSecondary, fontSize: 11)),
            ),
          ),
          const SizedBox(height: 16),
          const Text('Proof submissions', style: TextStyle(fontWeight: FontWeight.w600, color: DNTheme.paper)),
          if (_proofs.isEmpty)
            const Padding(
              padding: EdgeInsets.symmetric(vertical: 8),
              child: Text('No proofs yet.', style: TextStyle(color: DNTheme.textSecondary, fontSize: 12)),
            ),
          ..._proofs.map(
            (p) => Card(
              color: DNTheme.surface,
              child: Padding(
                padding: const EdgeInsets.all(12),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(p.storagePath.split('/').last,
                        style: const TextStyle(color: DNTheme.paper, fontSize: 13)),
                    Text('${p.status} · ${p.submittedAt.toLocal()}',
                        style: const TextStyle(color: DNTheme.textSecondary, fontSize: 11)),
                    const SizedBox(height: 8),
                    Wrap(
                      spacing: 8,
                      children: [
                        TextButton(onPressed: () => _openProof(p), child: const Text('Preview')),
                        if (p.status == 'pending') ...[
                          TextButton(
                              onPressed: () => _reviewProof(p, 'verified'), child: const Text('Verify')),
                          TextButton(
                            onPressed: () => _reviewProof(p, 'rejected'),
                            style: TextButton.styleFrom(foregroundColor: DNTheme.bloodRed),
                            child: const Text('Reject'),
                          ),
                        ],
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ),
          const SizedBox(height: 16),
          const Text('Agreements', style: TextStyle(fontWeight: FontWeight.w600, color: DNTheme.paper)),
          ..._agreements.map((a) {
            final link = debtNoteRepo.agreementLink(a.publicToken);
            return ListTile(
              dense: true,
              title: Text(a.borrowerName, style: const TextStyle(color: DNTheme.textPrimary)),
              subtitle: Text(a.signedAt != null ? 'Signed' : 'Pending signature',
                  style: TextStyle(color: a.signedAt != null ? DNTheme.success : DNTheme.warning, fontSize: 11)),
              trailing: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  IconButton(
                    icon: const Icon(Icons.chat, size: 18),
                    tooltip: 'WhatsApp',
                    onPressed: () => _shareWhatsApp(link),
                  ),
                  IconButton(
                    icon: const Icon(Icons.copy, size: 18),
                    onPressed: () {
                      Clipboard.setData(ClipboardData(text: link));
                      ScaffoldMessenger.of(context)
                          .showSnackBar(const SnackBar(content: Text('Link copied')));
                    },
                  ),
                ],
              ),
            );
          }),
        ],
      ),
    );
  }
}
