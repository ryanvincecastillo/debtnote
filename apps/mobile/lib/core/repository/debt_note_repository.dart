import 'dart:typed_data';

import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import '../models/debt_note_models.dart';
import '../project/app_project.dart';

class DebtNoteRepository {
  DebtNoteRepository(this._client);

  final SupabaseClient _client;

  String get _userId => _client.auth.currentUser!.id;

  /// Guest agreement base URL (web). Defaults to production.
  String get agreementBaseUrl {
    final fromEnv = dotenv.env['APP_URL']?.trim();
    if (fromEnv != null && fromEnv.isNotEmpty) {
      return fromEnv.replaceAll(RegExp(r'/$'), '');
    }
    return 'https://debtnote.app';
  }

  String agreementLink(String publicToken) => '$agreementBaseUrl/a/$publicToken';

  Future<String> _projectId() async {
    final id = await AppProject.ensureInitialized();
    if (id == null) throw StateError('APP_PROJECT_ID not resolved');
    return id;
  }

  Future<DebtNoteProfile> ensureProfile({String displayName = ''}) async {
    final projectId = await _projectId();
    final result = await _client.rpc('debt_note_ensure_profile', params: {
      'p_project_id': projectId,
      'p_display_name': displayName,
    });
    return DebtNoteProfile.fromMap(result as Map<String, dynamic>);
  }

  Future<DebtNoteProfile?> fetchProfile() async {
    final projectId = await _projectId();
    final row = await _client
        .from('debt_note_profiles')
        .select()
        .eq('project_id', projectId)
        .eq('id', _userId)
        .maybeSingle();
    if (row == null) return null;
    return DebtNoteProfile.fromMap(row);
  }

  Future<void> updateProfile({
    String? displayName,
    String? gcashNumber,
    String? mayaNumber,
    String? defaultTone,
  }) async {
    final projectId = await _projectId();
    final payload = <String, dynamic>{};
    if (displayName != null) payload['display_name'] = displayName;
    if (gcashNumber != null) payload['gcash_number'] = gcashNumber;
    if (mayaNumber != null) payload['maya_number'] = mayaNumber;
    if (defaultTone != null) payload['default_tone'] = defaultTone;
    if (payload.isEmpty) return;
    await _client
        .from('debt_note_profiles')
        .update(payload)
        .eq('project_id', projectId)
        .eq('id', _userId);
  }

  Future<List<DebtNoteContact>> fetchContacts() async {
    final projectId = await _projectId();
    final rows = await _client
        .from('debt_note_contacts')
        .select()
        .eq('project_id', projectId)
        .eq('owner_user_id', _userId)
        .order('name');
    return rows.map((r) => DebtNoteContact.fromMap(r)).toList();
  }

  Future<DebtNoteContact> upsertContact({
    String? id,
    required String name,
    String? phone,
    String? email,
    String? notes,
  }) async {
    final projectId = await _projectId();
    final payload = {
      'project_id': projectId,
      'owner_user_id': _userId,
      'name': name,
      'phone': phone,
      'email': email,
      'notes': notes,
    };
    if (id != null) {
      await _client
          .from('debt_note_contacts')
          .update(payload)
          .eq('id', id)
          .eq('owner_user_id', _userId);
      return DebtNoteContact(id: id, name: name, phone: phone, email: email, notes: notes);
    }
    final row = await _client.from('debt_note_contacts').insert(payload).select().single();
    return DebtNoteContact.fromMap(row);
  }

  Future<void> deleteContact(String id) async {
    await _client.from('debt_note_contacts').delete().eq('id', id).eq('owner_user_id', _userId);
  }

  Future<List<DebtNoteRecord>> fetchRecords({String? direction}) async {
    final projectId = await _projectId();
    var filter = _client
        .from('debt_note_records')
        .select('*, debt_note_contacts(name, email)')
        .eq('project_id', projectId)
        .eq('owner_user_id', _userId);
    if (direction != null) {
      filter = filter.eq('direction', direction);
    }
    final rows = await filter.order('created_at', ascending: false);
    return rows.map((r) => DebtNoteRecord.fromMap(r)).toList();
  }

  Future<String> createRecordWithSchedule({
    String? contactId,
    required String direction,
    required String title,
    required double principal,
    required String scheduleType,
    int installmentCount = 1,
    DateTime? startDate,
    String? notes,
  }) async {
    final projectId = await _projectId();
    return await _client.rpc('debt_note_create_record_with_schedule', params: {
      'p_project_id': projectId,
      'p_contact_id': contactId,
      'p_direction': direction,
      'p_title': title,
      'p_principal': principal,
      'p_schedule_type': scheduleType,
      'p_installment_count': installmentCount,
      'p_start_date': (startDate ?? DateTime.now()).toIso8601String().split('T').first,
      'p_notes': notes,
    }) as String;
  }

  Future<List<DebtNoteInstallment>> fetchInstallments(String recordId) async {
    final projectId = await _projectId();
    final rows = await _client
        .from('debt_note_installments')
        .select()
        .eq('project_id', projectId)
        .eq('record_id', recordId)
        .order('sequence_no');
    return rows.map((r) => DebtNoteInstallment.fromMap(r)).toList();
  }

  Future<void> recordPayment({
    required String recordId,
    required double amount,
    String? installmentId,
    String? notes,
  }) async {
    final projectId = await _projectId();
    await _client.rpc('debt_note_record_payment', params: {
      'p_project_id': projectId,
      'p_record_id': recordId,
      'p_amount': amount,
      'p_installment_id': installmentId,
      'p_notes': notes,
    });
  }

  Future<DashboardSummary> fetchDashboardSummary() async {
    final records = await fetchRecords();
    var receivable = 0.0;
    var payable = 0.0;
    var active = 0;
    var overdue = 0;

    for (final record in records) {
      if (record.status != 'active') continue;
      active += 1;
      if (record.isReceivable) {
        receivable += record.balance;
      } else {
        payable += record.balance;
      }
      final installments = await fetchInstallments(record.id);
      overdue += installments.where((i) => i.isOverdue).length;
    }

    return DashboardSummary(
      totalReceivable: receivable,
      totalPayable: payable,
      overdueCount: overdue,
      activeRecords: active,
    );
  }

  Future<List<DebtNoteReminder>> fetchReminders({String? recordId}) async {
    final projectId = await _projectId();
    var filter = _client
        .from('debt_note_reminders')
        .select()
        .eq('project_id', projectId)
        .eq('owner_user_id', _userId);
    if (recordId != null) filter = filter.eq('record_id', recordId);
    final rows = await filter.order('scheduled_at');
    return rows.map((r) => DebtNoteReminder.fromMap(r)).toList();
  }

  Future<void> scheduleReminder({
    required String recordId,
    required DateTime scheduledAt,
    String? installmentId,
    String tone = 'taglish_casual',
    String channel = 'email',
  }) async {
    final projectId = await _projectId();
    await _client.from('debt_note_reminders').insert({
      'project_id': projectId,
      'owner_user_id': _userId,
      'record_id': recordId,
      'installment_id': installmentId,
      'tone': tone,
      'channel': channel,
      'scheduled_at': scheduledAt.toUtc().toIso8601String(),
    });
  }

  Future<DebtNoteAgreement> createAgreement({
    required String recordId,
    required String borrowerName,
    String? borrowerEmail,
    Map<String, dynamic>? terms,
  }) async {
    final projectId = await _projectId();
    final row = await _client
        .from('debt_note_agreements')
        .insert({
          'project_id': projectId,
          'owner_user_id': _userId,
          'record_id': recordId,
          'borrower_name': borrowerName,
          'borrower_email': borrowerEmail,
          'terms_json': terms ?? {},
        })
        .select()
        .single();
    return DebtNoteAgreement.fromMap(row);
  }

  Future<List<DebtNoteAgreement>> fetchAgreements(String recordId) async {
    final projectId = await _projectId();
    final rows = await _client
        .from('debt_note_agreements')
        .select()
        .eq('project_id', projectId)
        .eq('record_id', recordId);
    return rows.map((r) => DebtNoteAgreement.fromMap(r)).toList();
  }

  Future<void> submitProof({
    required String recordId,
    required Uint8List bytes,
    required String fileName,
  }) async {
    final projectId = await _projectId();
    final path = '$_userId/$recordId/${DateTime.now().millisecondsSinceEpoch}_$fileName';
    await _client.storage.from('debt-note-proofs').uploadBinary(path, bytes);
    await _client.rpc('debt_note_submit_proof', params: {
      'p_project_id': projectId,
      'p_record_id': recordId,
      'p_storage_path': path,
    });
    await notifyLenderProofPending(recordId);
  }

  Future<void> notifyLenderProofPending(String recordId) async {
    try {
      await _client.functions.invoke(
        'debt-note-notify-lender',
        body: {'event': 'proof_pending', 'recordId': recordId},
      );
    } catch (_) {
      // Alerts must not block upload.
    }
  }

  Future<List<DebtNoteProof>> fetchProofs(String recordId) async {
    final projectId = await _projectId();
    final rows = await _client
        .from('debt_note_proof_submissions')
        .select()
        .eq('project_id', projectId)
        .eq('record_id', recordId)
        .order('submitted_at', ascending: false);
    return rows.map((r) => DebtNoteProof.fromMap(r)).toList();
  }

  Future<void> reviewProof({
    required String proofId,
    required String recordId,
    required String decision,
  }) async {
    await _client.from('debt_note_proof_submissions').update({
      'status': decision,
      if (decision == 'verified') 'verified_at': DateTime.now().toUtc().toIso8601String(),
    }).eq('id', proofId);

    if (decision == 'verified') {
      await _client
          .from('debt_note_reminders')
          .update({'status': 'pending'})
          .eq('record_id', recordId)
          .eq('status', 'frozen');
    }
  }

  Future<String?> proofSignedUrl(String storagePath) async {
    final res = await _client.storage
        .from('debt-note-proofs')
        .createSignedUrl(storagePath, 60 * 30);
    return res;
  }

  Future<List<PaluwaganPool>> fetchPaluwaganPools() async {
    final projectId = await _projectId();
    final rows = await _client
        .from('debt_note_paluwagan_pools')
        .select('*, debt_note_paluwagan_members(*)')
        .eq('project_id', projectId)
        .eq('owner_user_id', _userId)
        .order('created_at', ascending: false);
    return rows.map((r) => PaluwaganPool.fromMap(r)).toList();
  }

  Future<PaluwaganPool> createPaluwaganPool({
    required String name,
    required double contributionAmount,
    required int cycleLength,
    required List<String> memberNames,
  }) async {
    final projectId = await _projectId();
    final poolRow = await _client
        .from('debt_note_paluwagan_pools')
        .insert({
          'project_id': projectId,
          'owner_user_id': _userId,
          'name': name,
          'contribution_amount': contributionAmount,
          'cycle_length': cycleLength,
        })
        .select()
        .single();

    final poolId = poolRow['id'] as String;
    for (var i = 0; i < memberNames.length; i++) {
      await _client.from('debt_note_paluwagan_members').insert({
        'project_id': projectId,
        'owner_user_id': _userId,
        'pool_id': poolId,
        'member_name': memberNames[i],
        'payout_order': i + 1,
      });
    }

    final pools = await fetchPaluwaganPools();
    return pools.firstWhere((p) => p.id == poolId);
  }

  Future<void> advancePaluwaganCycle(String poolId) async {
    final projectId = await _projectId();
    final pool = await _client
        .from('debt_note_paluwagan_pools')
        .select()
        .eq('id', poolId)
        .single();
    final current = pool['current_cycle'] as int? ?? 1;
    final length = pool['cycle_length'] as int;

    await _client
        .from('debt_note_paluwagan_members')
        .update({'has_received_payout': true})
        .eq('pool_id', poolId)
        .eq('payout_order', current);

    final nextCycle = current >= length ? 1 : current + 1;
    await _client
        .from('debt_note_paluwagan_pools')
        .update({'current_cycle': nextCycle})
        .eq('id', poolId)
        .eq('project_id', projectId);
  }

  /// Wipe DebtNote data (+ Auth user when not shared with other apps).
  Future<Map<String, dynamic>> deleteAccount() async {
    final projectId = await _projectId();
    final res = await _client.functions.invoke(
      'debt-note-delete-account',
      body: {'projectId': projectId},
    );
    final data = (res.data is Map)
        ? Map<String, dynamic>.from(res.data as Map)
        : <String, dynamic>{};
    if (res.status >= 400) {
      throw StateError(data['error']?.toString() ?? 'Delete account failed');
    }
    await signOut();
    return data;
  }

  /// Request Auth email change (confirmation code goes to the new address).
  Future<void> requestEmailChange(String newEmail) async {
    await _client.auth.updateUser(
      UserAttributes(email: newEmail.trim()),
      emailRedirectTo: 'debtnote://login-callback',
    );
  }

  /// Confirm email change with the OTP from the new inbox.
  Future<void> confirmEmailChange({
    required String newEmail,
    required String token,
  }) async {
    await _client.auth.verifyOTP(
      email: newEmail.trim(),
      token: token.trim(),
      type: OtpType.emailChange,
    );
    final email = _client.auth.currentUser?.email;
    if (email != null && email.isNotEmpty) {
      await _client
          .from('debt_note_profiles')
          .update({'email': email})
          .eq('id', _userId);
    }
    // Also refresh via ensure_profile so email stays aligned.
    await ensureProfile();
  }

  Future<void> signOut() => _client.auth.signOut();
}

DebtNoteRepository get debtNoteRepo =>
    DebtNoteRepository(Supabase.instance.client);
