import 'package:flutter/material.dart';

import '../../app/theme.dart';
import '../../core/models/debt_note_models.dart';
import '../../core/repository/debt_note_repository.dart';

class NewRecordScreen extends StatefulWidget {
  const NewRecordScreen({super.key});

  @override
  State<NewRecordScreen> createState() => _NewRecordScreenState();
}

class _NewRecordScreenState extends State<NewRecordScreen> {
  final _titleCtrl = TextEditingController();
  final _amountCtrl = TextEditingController();
  final _installmentsCtrl = TextEditingController(text: '1');
  String _scheduleType = 'one_time';
  String? _contactId;
  List<DebtNoteContact> _contacts = [];
  bool _saving = false;

  @override
  void initState() {
    super.initState();
    _loadContacts();
  }

  Future<void> _loadContacts() async {
    final contacts = await debtNoteRepo.fetchContacts();
    if (mounted) setState(() => _contacts = contacts);
  }

  Future<void> _save() async {
    final amount = double.tryParse(_amountCtrl.text);
    if (_titleCtrl.text.trim().isEmpty || amount == null || amount <= 0) return;
    setState(() => _saving = true);
    try {
      await debtNoteRepo.createRecordWithSchedule(
        contactId: _contactId,
        direction: 'receivable',
        title: _titleCtrl.text.trim(),
        principal: amount,
        scheduleType: _scheduleType,
        installmentCount: int.tryParse(_installmentsCtrl.text) ?? 1,
      );
      if (mounted) Navigator.pop(context);
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('New record')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          TextField(controller: _titleCtrl, decoration: const InputDecoration(labelText: 'Title / purpose')),
          const SizedBox(height: 12),
          TextField(
            controller: _amountCtrl,
            keyboardType: TextInputType.number,
            decoration: const InputDecoration(labelText: 'Amount (₱)'),
          ),
          const SizedBox(height: 12),
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              border: Border.all(color: DNTheme.success.withOpacity(0.4)),
              color: DNTheme.success.withOpacity(0.08),
            ),
            child: const Text(
              'Collection record — money owed to you.',
              style: TextStyle(color: DNTheme.success, fontSize: 13),
            ),
          ),
          const SizedBox(height: 16),
          DropdownButtonFormField<String>(
            value: _scheduleType,
            decoration: const InputDecoration(labelText: 'Schedule'),
            items: scheduleLabels.entries
                .map((e) => DropdownMenuItem(value: e.key, child: Text(e.value)))
                .toList(),
            onChanged: (v) => setState(() => _scheduleType = v ?? 'one_time'),
          ),
          if (_scheduleType != 'one_time') ...[
            const SizedBox(height: 12),
            TextField(
              controller: _installmentsCtrl,
              keyboardType: TextInputType.number,
              decoration: const InputDecoration(labelText: 'Number of installments'),
            ),
          ],
          const SizedBox(height: 12),
          DropdownButtonFormField<String?>(
            value: _contactId,
            decoration: const InputDecoration(labelText: 'Contact (optional)'),
            items: [
              const DropdownMenuItem(value: null, child: Text('None')),
              ..._contacts.map((c) => DropdownMenuItem(value: c.id, child: Text(c.name))),
            ],
            onChanged: (v) => setState(() => _contactId = v),
          ),
          const SizedBox(height: 24),
          FilledButton(
            onPressed: _saving ? null : _save,
            style: FilledButton.styleFrom(backgroundColor: DNTheme.bloodRed, minimumSize: const Size.fromHeight(48)),
            child: _saving ? const CircularProgressIndicator(color: DNTheme.paper) : const Text('Create record'),
          ),
        ],
      ),
    );
  }
}
