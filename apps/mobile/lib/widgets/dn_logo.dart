import 'package:flutter/material.dart';

import '../app/theme.dart';

/// Brand logo from `debtnote.png` — gothic "DEBT NOTE" with corner rules.
class DNLogo extends StatelessWidget {
  const DNLogo({
    super.key,
    this.size = LogoSize.large,
    this.showTagline = false,
  });

  final LogoSize size;
  final bool showTagline;

  double get _width => switch (size) {
        LogoSize.hero => 220,
        LogoSize.large => 180,
        LogoSize.compact => 120,
      };

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      mainAxisSize: MainAxisSize.min,
      children: [
        Image.asset(
          'assets/debtnote.png',
          width: _width,
          fit: BoxFit.contain,
          filterQuality: FilterQuality.high,
        ),
        if (showTagline) ...[
          const SizedBox(height: 12),
          Text(
            'Collect without the awkwardness.',
            style: TextStyle(
              color: DNTheme.inkMuted,
              fontSize: size == LogoSize.compact ? 12 : 14,
              height: 1.5,
            ),
          ),
        ],
      ],
    );
  }
}

enum LogoSize { hero, large, compact }

class DNNotebookBackground extends StatelessWidget {
  const DNNotebookBackground({super.key, required this.child});

  final Widget child;

  @override
  Widget build(BuildContext context) {
    return Container(
      color: DNTheme.background,
      child: Stack(
        children: [
          Positioned(
            top: 48,
            right: 24,
            child: Opacity(
              opacity: 0.06,
              child: Image.asset(
                'assets/branding/death_note_reference.png',
                width: 180,
                fit: BoxFit.contain,
              ),
            ),
          ),
          child,
        ],
      ),
    );
  }
}

class DNAppBarTitle extends StatelessWidget {
  const DNAppBarTitle({super.key});

  @override
  Widget build(BuildContext context) {
    return const DNLogo(size: LogoSize.compact);
  }
}
