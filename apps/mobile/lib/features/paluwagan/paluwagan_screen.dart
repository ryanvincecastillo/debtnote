import 'package:flutter/material.dart';

import '../../app/theme.dart';
import '../../core/models/debt_note_models.dart';
import '../../core/repository/debt_note_repository.dart';
import '../../widgets/dn_components.dart';

class PaluwaganScreen extends StatefulWidget {
  const PaluwaganScreen({super.key});

  @override
  State<PaluwaganScreen> createState() => _PaluwaganScreenState();
}

class _PaluwaganScreenState extends State<PaluwaganScreen> {
  List<PaluwaganPool> _pools = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() => _loading = true);
    final pools = await debtNoteRepo.fetchPaluwaganPools();
    if (mounted) setState(() {
      _pools = pools;
      _loading = false;
    });
  }

  Future<void> _createPool() async {
    final nameCtrl = TextEditingController();
    final amountCtrl = TextEditingController();
    final cycleCtrl = TextEditingController(text: '5');
    final membersCtrl = TextEditingController();

    final saved = await showModalBottomSheet<bool>(
      context: context,
      isScrollControlled: true,
      backgroundColor: DNTheme.surface,
      builder: (ctx) => Padding(
        padding: EdgeInsets.only(
          bottom: MediaQuery.of(ctx).viewInsets.bottom,
          left: 16,
          right: 16,
          top: 24,
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(controller: nameCtrl, decoration: const InputDecoration(labelText: 'Pool name')),
            const SizedBox(height: 12),
            TextField(controller: amountCtrl, keyboardType: TextInputType.number, decoration: const InputDecoration(labelText: 'Contribution (₱)')),
            const SizedBox(height: 12),
            TextField(controller: cycleCtrl, keyboardType: TextInputType.number, decoration: const InputDecoration(labelText: 'Cycle length (members)')),
            const SizedBox(height: 12),
            TextField(
              controller: membersCtrl,
              maxLines: 3,
              decoration: const InputDecoration(labelText: 'Member names (one per line)'),
            ),
            const SizedBox(height: 16),
            FilledButton(onPressed: () => Navigator.pop(ctx, true), child: const Text('Create pool')),
            const SizedBox(height: 24),
          ],
        ),
      ),
    );

    if (saved == true) {
      final amount = double.tryParse(amountCtrl.text);
      final cycle = int.tryParse(cycleCtrl.text) ?? 5;
      final members = membersCtrl.text.split('\n').map((s) => s.trim()).where((s) => s.isNotEmpty).toList();
      if (nameCtrl.text.trim().isNotEmpty && amount != null && members.isNotEmpty) {
        await debtNoteRepo.createPaluwaganPool(
          name: nameCtrl.text.trim(),
          contributionAmount: amount,
          cycleLength: cycle,
          memberNames: members,
        );
        _load();
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Paluwagan')),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _createPool,
        icon: const Icon(Icons.group_add),
        label: const Text('New pool'),
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator(color: DNTheme.bloodRed))
          : _pools.isEmpty
              ? const DNEmptyState(message: 'Create a community paluwagan pool.', icon: Icons.groups_outlined)
              : ListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount: _pools.length,
                  itemBuilder: (_, i) {
                    final pool = _pools[i];
                    final cycleMembers = pool.members.where((m) => m.payoutOrder == pool.currentCycle);
                    final currentMember = cycleMembers.isEmpty ? null : cycleMembers.first;
                    return Padding(
                      padding: const EdgeInsets.only(bottom: 12),
                      child: DNCard(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(pool.name, style: const TextStyle(fontWeight: FontWeight.bold, color: DNTheme.paper, fontSize: 18)),
                            Text('${formatPeso(pool.contributionAmount)} · Cycle ${pool.currentCycle}/${pool.cycleLength}',
                                style: const TextStyle(color: DNTheme.textSecondary)),
                            if (currentMember != null) ...[
                              const SizedBox(height: 8),
                              Text('Next payout: ${currentMember.memberName}', style: const TextStyle(color: DNTheme.gold)),
                            ],
                            const SizedBox(height: 8),
                            ...pool.members.map((m) => Row(
                                  children: [
                                    Icon(
                                      m.hasReceivedPayout ? Icons.check_circle : Icons.circle_outlined,
                                      size: 14,
                                      color: m.hasReceivedPayout ? DNTheme.success : DNTheme.textSecondary,
                                    ),
                                    const SizedBox(width: 6),
                                    Text('${m.payoutOrder}. ${m.memberName}', style: const TextStyle(color: DNTheme.textPrimary, fontSize: 13)),
                                  ],
                                )),
                            const SizedBox(height: 8),
                            TextButton(
                              onPressed: () async {
                                await debtNoteRepo.advancePaluwaganCycle(pool.id);
                                _load();
                              },
                              child: const Text('Advance cycle'),
                            ),
                          ],
                        ),
                      ),
                    );
                  },
                ),
    );
  }
}
