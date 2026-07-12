import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class DNTheme {
  DNTheme._();

  static const Color background = Color(0xFF000000);
  static const Color surface = Color(0xFF0A0A0A);
  static const Color ink = Color(0xFFFFFFFF);
  static const Color inkMuted = Color(0xFF9CA3AF);
  static const Color paper = Color(0xFFF5F0E1);
  static const Color bloodRed = Color(0xFFC1121F);
  static const Color gold = Color(0xFFB8860B);
  static const Color textPrimary = Color(0xFFFFFFFF);
  static const Color textSecondary = Color(0xFF9CA3AF);
  static const Color success = Color(0xFF22C55E);
  static const Color warning = Color(0xFFF59E0B);
  static const Color border = Color(0xFF2A2A2A);

  static ThemeData darkTheme = ThemeData(
    useMaterial3: true,
    brightness: Brightness.dark,
    scaffoldBackgroundColor: background,
    fontFamily: GoogleFonts.inter().fontFamily,
    colorScheme: const ColorScheme.dark(
      primary: ink,
      secondary: bloodRed,
      surface: surface,
      onPrimary: background,
      onSurface: textPrimary,
    ),
    appBarTheme: AppBarTheme(
      backgroundColor: background,
      foregroundColor: ink,
      elevation: 0,
      centerTitle: false,
      titleTextStyle: GoogleFonts.unifrakturMaguntia(
        fontSize: 22,
        color: ink,
      ),
    ),
    cardTheme: CardThemeData(
      color: surface,
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(4),
        side: const BorderSide(color: border),
      ),
    ),
    inputDecorationTheme: InputDecorationTheme(
      filled: true,
      fillColor: surface,
      labelStyle: const TextStyle(color: textSecondary),
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(4),
        borderSide: const BorderSide(color: border),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(4),
        borderSide: const BorderSide(color: border),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(4),
        borderSide: const BorderSide(color: ink, width: 1.5),
      ),
    ),
    filledButtonTheme: FilledButtonThemeData(
      style: FilledButton.styleFrom(
        backgroundColor: ink,
        foregroundColor: background,
        padding: const EdgeInsets.symmetric(vertical: 16),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(4)),
        textStyle: const TextStyle(fontWeight: FontWeight.w700, letterSpacing: 0.5),
      ),
    ),
    floatingActionButtonTheme: const FloatingActionButtonThemeData(
      backgroundColor: ink,
      foregroundColor: background,
    ),
    navigationBarTheme: NavigationBarThemeData(
      backgroundColor: surface,
      indicatorColor: border,
      labelTextStyle: WidgetStateProperty.all(
        const TextStyle(fontSize: 11, color: textSecondary),
      ),
      iconTheme: WidgetStateProperty.resolveWith((states) {
        if (states.contains(WidgetState.selected)) {
          return const IconThemeData(color: ink);
        }
        return const IconThemeData(color: textSecondary);
      }),
    ),
  );
}

const toneLabels = {
  'taglish_casual': 'Taglish (Casual)',
  'corporate': 'Corporate Notice',
  'assertive': 'Assertive Collector',
  'shinigami': 'Shinigami Notice',
};

const scheduleLabels = {
  'one_time': 'One-time',
  'daily': 'Daily',
  'weekly': 'Weekly',
  'semi_monthly_15_30': '15th / 30th (Salary)',
  'paluwagan': 'Paluwagan',
};

String formatPeso(double amount) => '₱${amount.toStringAsFixed(2)}';
