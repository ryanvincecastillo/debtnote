class SupabaseBootstrap {
  SupabaseBootstrap._();

  static bool _initialized = false;

  static bool get isInitialized => _initialized;

  static void markInitialized() {
    _initialized = true;
  }
}
