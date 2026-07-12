import 'package:flutter/foundation.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import '../supabase/supabase_bootstrap.dart';

class AppProject {
  AppProject._();

  static String? _resolvedProjectId;
  static Future<String?>? _pendingResolution;

  static String? get configuredProjectIdentifier {
    final value = dotenv.env['APP_PROJECT_ID']?.trim();
    if (value == null || value.isEmpty) return null;
    return value;
  }

  static bool get isConfigured => configuredProjectIdentifier != null;
  static String? get activeProjectIdSync => _resolvedProjectId;

  static Future<String?> ensureInitialized() {
    if (_resolvedProjectId != null) return Future.value(_resolvedProjectId);
    final pending = _pendingResolution;
    if (pending != null) return pending;
    final future = _resolveProjectId();
    _pendingResolution = future;
    return future.whenComplete(() => _pendingResolution = null);
  }

  static Future<void> reset() async {
    _resolvedProjectId = null;
    _pendingResolution = null;
  }

  static Future<String?> _resolveProjectId() async {
    final configured = configuredProjectIdentifier;
    if (configured == null) return null;
    if (_looksLikeUuid(configured)) {
      _resolvedProjectId = configured;
      return _resolvedProjectId;
    }
    if (!SupabaseBootstrap.isInitialized) return null;
    try {
      final row = await Supabase.instance.client
          .from('projects')
          .select('id')
          .eq('slug', configured)
          .maybeSingle();
      final resolvedId = (row?['id'] as String?)?.trim();
      if (resolvedId == null || resolvedId.isEmpty) return null;
      _resolvedProjectId = resolvedId;
      return _resolvedProjectId;
    } catch (error) {
      debugPrint('Failed to resolve APP_PROJECT_ID: $error');
      return null;
    }
  }

  static bool _looksLikeUuid(String value) {
    return RegExp(
      r'^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$',
    ).hasMatch(value);
  }
}
