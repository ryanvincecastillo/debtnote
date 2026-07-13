import 'package:flutter/material.dart';

import '../app/theme.dart';

class DNCard extends StatelessWidget {
  const DNCard({
    super.key,
    required this.child,
    this.onTap,
    this.accent,
  });

  final Widget child;
  final VoidCallback? onTap;
  final Color? accent;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: DNTheme.surface,
      child: InkWell(
        onTap: onTap,
        child: Container(
          width: double.infinity,
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            border: Border.all(color: accent ?? DNTheme.border),
          ),
          child: child,
        ),
      ),
    );
  }
}

class DNLedgerRow extends StatelessWidget {
  const DNLedgerRow({
    super.key,
    required this.title,
    required this.amount,
    required this.direction,
    this.subtitle,
    this.onTap,
    this.overdue = false,
  });

  final String title;
  final double amount;
  final String direction;
  final String? subtitle;
  final VoidCallback? onTap;
  final bool overdue;

  @override
  Widget build(BuildContext context) {
    return DNCard(
      onTap: onTap,
      accent: overdue ? DNTheme.bloodRed : DNTheme.border,
      child: Row(
        children: [
          Container(
            width: 3,
            height: 48,
            color: DNTheme.success,
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: const TextStyle(fontWeight: FontWeight.w600, color: DNTheme.ink)),
                if (subtitle != null)
                  Text(subtitle!, style: const TextStyle(color: DNTheme.textSecondary, fontSize: 12)),
              ],
            ),
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text(formatPeso(amount), style: const TextStyle(fontWeight: FontWeight.bold, color: DNTheme.ink)),
              const Text(
                'Collect',
                style: TextStyle(
                  fontSize: 11,
                  color: DNTheme.success,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class DNToneChip extends StatelessWidget {
  const DNToneChip({
    super.key,
    required this.tone,
    required this.selected,
    required this.onTap,
  });

  final String tone;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return FilterChip(
      label: Text(toneLabels[tone] ?? tone),
      selected: selected,
      onSelected: (_) => onTap(),
      selectedColor: DNTheme.border,
      checkmarkColor: DNTheme.ink,
      backgroundColor: DNTheme.surface,
      side: BorderSide(color: selected ? DNTheme.ink : DNTheme.border),
      labelStyle: TextStyle(
        color: selected ? DNTheme.ink : DNTheme.textSecondary,
        fontSize: 12,
      ),
    );
  }
}

class DNInstallmentTimeline extends StatelessWidget {
  const DNInstallmentTimeline({super.key, required this.installments});

  final List<dynamic> installments;

  @override
  Widget build(BuildContext context) {
    if (installments.isEmpty) {
      return const Text('No installments yet.', style: TextStyle(color: DNTheme.textSecondary));
    }
    return Column(
      children: installments.map((item) {
        final due = item.dueDate as DateTime;
        final overdue = item.isOverdue as bool;
        return Padding(
          padding: const EdgeInsets.only(bottom: 8),
          child: Row(
            children: [
              Icon(
                item.status == 'paid' ? Icons.check_box : Icons.check_box_outline_blank,
                color: item.status == 'paid'
                    ? DNTheme.success
                    : overdue
                        ? DNTheme.bloodRed
                        : DNTheme.textSecondary,
                size: 18,
              ),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  '#${item.sequenceNo} · ${due.toLocal().toString().split(' ').first}',
                  style: TextStyle(color: overdue ? DNTheme.bloodRed : DNTheme.ink),
                ),
              ),
              Text(formatPeso(item.amount as double), style: const TextStyle(color: DNTheme.ink)),
            ],
          ),
        );
      }).toList(),
    );
  }
}

class DNEmptyState extends StatelessWidget {
  const DNEmptyState({super.key, required this.message, this.icon = Icons.menu_book_outlined});

  final String message;
  final IconData icon;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(icon, size: 48, color: DNTheme.textSecondary.withValues(alpha: 0.45)),
          const SizedBox(height: 12),
          Text(message, style: const TextStyle(color: DNTheme.textSecondary), textAlign: TextAlign.center),
        ],
      ),
    );
  }
}
