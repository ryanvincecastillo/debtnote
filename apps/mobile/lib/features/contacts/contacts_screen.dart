import 'package:flutter/material.dart';

import '../../app/theme.dart';
import '../../core/models/debt_note_models.dart';
import '../../core/repository/debt_note_repository.dart';
import '../../widgets/dn_components.dart';

class ContactsScreen extends StatefulWidget {
  const ContactsScreen({super.key});

  @override
  State<ContactsScreen> createState() => _ContactsScreenState();
}

class _ContactsScreenState extends State<ContactsScreen> {
  List<DebtNoteContact> _contacts = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() => _loading = true);
    final contacts = await debtNoteRepo.fetchContacts();
    if (mounted) setState(() {
      _contacts = contacts;
      _loading = false;
    });
  }

  Future<void> _showForm([DebtNoteContact? existing]) async {
    final nameCtrl = TextEditingController(text: existing?.name ?? '');
    final phoneCtrl = TextEditingController(text: existing?.phone ?? '');
    final emailCtrl = TextEditingController(text: existing?.email ?? '');

    final saved = await showModalBottomSheet<bool>(
      context: context,
      isScrollControlled: true,
      backgroundColor: DNTheme.surface,
      builder: (ctx) => Padding(
        padding: EdgeInsets.only(bottom: MediaQuery.of(ctx).viewInsets.bottom, left: 16, right: 16, top: 24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(controller: nameCtrl, decoration: const InputDecoration(labelText: 'Name')),
            const SizedBox(height: 12),
            TextField(controller: phoneCtrl, decoration: const InputDecoration(labelText: 'Phone')),
            const SizedBox(height: 12),
            TextField(controller: emailCtrl, decoration: const InputDecoration(labelText: 'Email')),
            const SizedBox(height: 16),
            FilledButton(
              onPressed: () => Navigator.pop(ctx, true),
              child: const Text('Save contact'),
            ),
            const SizedBox(height: 24),
          ],
        ),
      ),
    );

    if (saved == true && nameCtrl.text.trim().isNotEmpty) {
      await debtNoteRepo.upsertContact(
        id: existing?.id,
        name: nameCtrl.text.trim(),
        phone: phoneCtrl.text.trim().isEmpty ? null : phoneCtrl.text.trim(),
        email: emailCtrl.text.trim().isEmpty ? null : emailCtrl.text.trim(),
      );
      _load();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Contacts')),
      floatingActionButton: FloatingActionButton(
        onPressed: () => _showForm(),
        child: const Icon(Icons.person_add),
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator(color: DNTheme.bloodRed))
          : _contacts.isEmpty
              ? const DNEmptyState(message: 'Add people you lend to or borrow from.', icon: Icons.people_outline)
              : ListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount: _contacts.length,
                  itemBuilder: (_, i) {
                    final c = _contacts[i];
                    return Padding(
                      padding: const EdgeInsets.only(bottom: 8),
                      child: DNCard(
                        onTap: () => _showForm(c),
                        child: ListTile(
                          contentPadding: EdgeInsets.zero,
                          title: Text(c.name, style: const TextStyle(color: DNTheme.paper, fontWeight: FontWeight.w600)),
                          subtitle: Text(
                            [c.phone, c.email].where((e) => e != null && e.isNotEmpty).join(' · '),
                            style: const TextStyle(color: DNTheme.textSecondary, fontSize: 12),
                          ),
                          trailing: IconButton(
                            icon: const Icon(Icons.delete_outline, color: DNTheme.bloodRed),
                            onPressed: () async {
                              await debtNoteRepo.deleteContact(c.id);
                              _load();
                            },
                          ),
                        ),
                      ),
                    );
                  },
                ),
    );
  }
}
