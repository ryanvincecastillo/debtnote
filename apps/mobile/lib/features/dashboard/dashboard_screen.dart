import 'package:flutter/material.dart';

import '../../app/theme.dart';
import '../../core/models/debt_note_models.dart';
import '../../core/repository/debt_note_repository.dart';
import '../../widgets/dn_logo.dart';
import '../../widgets/dn_components.dart';
import '../records/new_record_screen.dart';
import '../records/record_detail_screen.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  DashboardSummary? _summary;
  List<DebtNoteRecord> _records = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() => _loading = true);
    try {
      final summary = await debtNoteRepo.fetchDashboardSummary();
      final records = await debtNoteRepo.fetchRecords();
      if (mounted) {
        setState(() {
          _summary = summary;
          _records = records.where((r) => r.status == 'active').take(8).toList();
          _loading = false;
        });
      }
    } catch (_) {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const DNAppBarTitle(),
        actions: [
          IconButton(icon: const Icon(Icons.refresh), onPressed: _load),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () async {
          await Navigator.push(
            context,
            MaterialPageRoute(builder: (_) => const NewRecordScreen()),
          );
          _load();
        },
        icon: const Icon(Icons.add),
        label: const Text('New utang'),
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator(color: DNTheme.bloodRed))
          : RefreshIndicator(
              onRefresh: _load,
              color: DNTheme.bloodRed,
              child: ListView(
                padding: const EdgeInsets.all(16),
                children: [
                  Row(
                    children: [
                      Expanded(
                        child: _SummaryTile(
                          label: 'Pautang (collect)',
                          amount: _summary?.totalReceivable ?? 0,
                          color: DNTheme.success,
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: _SummaryTile(
                          label: 'Utang (pay)',
                          amount: _summary?.totalPayable ?? 0,
                          color: DNTheme.warning,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  DNCard(
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceAround,
                      children: [
                        _StatChip(label: 'Active', value: '${_summary?.activeRecords ?? 0}'),
                        _StatChip(label: 'Overdue', value: '${_summary?.overdueCount ?? 0}', alert: true),
                      ],
                    ),
                  ),
                  const SizedBox(height: 24),
                  const Text('Recent records', style: TextStyle(fontWeight: FontWeight.w600, color: DNTheme.paper)),
                  const SizedBox(height: 12),
                  if (_records.isEmpty)
                    const DNEmptyState(message: 'No active utang yet. Tap + to add one.')
                  else
                    ..._records.map(
                      (r) => Padding(
                        padding: const EdgeInsets.only(bottom: 8),
                        child: DNLedgerRow(
                          title: r.title,
                          amount: r.balance,
                          direction: r.direction,
                          subtitle: r.contactName,
                          onTap: () async {
                            await Navigator.push(
                              context,
                              MaterialPageRoute(
                                builder: (_) => RecordDetailScreen(recordId: r.id),
                              ),
                            );
                            _load();
                          },
                        ),
                      ),
                    ),
                ],
              ),
            ),
    );
  }
}

class _SummaryTile extends StatelessWidget {
  const _SummaryTile({required this.label, required this.amount, required this.color});

  final String label;
  final double amount;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return DNCard(
      accent: color,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: const TextStyle(color: DNTheme.textSecondary, fontSize: 12)),
          const SizedBox(height: 4),
          Text(formatPeso(amount), style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: color)),
        ],
      ),
    );
  }
}

class _StatChip extends StatelessWidget {
  const _StatChip({required this.label, required this.value, this.alert = false});

  final String label;
  final String value;
  final bool alert;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Text(value, style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: alert ? DNTheme.bloodRed : DNTheme.paper)),
        Text(label, style: const TextStyle(color: DNTheme.textSecondary, fontSize: 12)),
      ],
    );
  }
}
