class DebtNoteProfile {
  DebtNoteProfile({
    required this.id,
    required this.projectId,
    required this.email,
    required this.displayName,
    this.gcashNumber,
    this.mayaNumber,
    this.defaultTone = 'taglish_casual',
    this.planTier = 'free',
  });

  final String id;
  final String projectId;
  final String email;
  final String displayName;
  final String? gcashNumber;
  final String? mayaNumber;
  final String defaultTone;
  final String planTier;

  factory DebtNoteProfile.fromMap(Map<String, dynamic> map) {
    return DebtNoteProfile(
      id: map['id'] as String,
      projectId: map['project_id'] as String,
      email: map['email'] as String? ?? '',
      displayName: map['display_name'] as String? ?? '',
      gcashNumber: map['gcash_number'] as String?,
      mayaNumber: map['maya_number'] as String?,
      defaultTone: map['default_tone'] as String? ?? 'taglish_casual',
      planTier: map['plan_tier'] as String? ?? 'free',
    );
  }
}

class DebtNoteContact {
  DebtNoteContact({
    required this.id,
    required this.name,
    this.phone,
    this.email,
    this.notes,
  });

  final String id;
  final String name;
  final String? phone;
  final String? email;
  final String? notes;

  factory DebtNoteContact.fromMap(Map<String, dynamic> map) {
    return DebtNoteContact(
      id: map['id'] as String,
      name: map['name'] as String,
      phone: map['phone'] as String?,
      email: map['email'] as String?,
      notes: map['notes'] as String?,
    );
  }
}

class DebtNoteRecord {
  DebtNoteRecord({
    required this.id,
    required this.direction,
    required this.title,
    required this.principal,
    required this.balance,
    required this.scheduleType,
    required this.status,
    this.contactId,
    this.contactName,
    this.notes,
    this.paluwaganPoolId,
  });

  final String id;
  final String direction;
  final String title;
  final double principal;
  final double balance;
  final String scheduleType;
  final String status;
  final String? contactId;
  final String? contactName;
  final String? notes;
  final String? paluwaganPoolId;

  bool get isReceivable => direction == 'receivable';
  bool get isOverdue => status == 'active' && balance > 0;

  factory DebtNoteRecord.fromMap(Map<String, dynamic> map) {
    final contact = map['debt_note_contacts'] as Map<String, dynamic>?;
    return DebtNoteRecord(
      id: map['id'] as String,
      direction: map['direction'] as String,
      title: map['title'] as String,
      principal: (map['principal'] as num).toDouble(),
      balance: (map['balance'] as num).toDouble(),
      scheduleType: map['schedule_type'] as String? ?? 'one_time',
      status: map['status'] as String? ?? 'active',
      contactId: map['contact_id'] as String?,
      contactName: contact?['name'] as String?,
      notes: map['notes'] as String?,
      paluwaganPoolId: map['paluwagan_pool_id'] as String?,
    );
  }
}

class DebtNoteInstallment {
  DebtNoteInstallment({
    required this.id,
    required this.recordId,
    required this.sequenceNo,
    required this.amount,
    required this.dueDate,
    required this.status,
  });

  final String id;
  final String recordId;
  final int sequenceNo;
  final double amount;
  final DateTime dueDate;
  final String status;

  bool get isOverdue =>
      status == 'pending' && dueDate.isBefore(DateTime.now());

  factory DebtNoteInstallment.fromMap(Map<String, dynamic> map) {
    return DebtNoteInstallment(
      id: map['id'] as String,
      recordId: map['record_id'] as String,
      sequenceNo: map['sequence_no'] as int,
      amount: (map['amount'] as num).toDouble(),
      dueDate: DateTime.parse(map['due_date'] as String),
      status: map['status'] as String? ?? 'pending',
    );
  }
}

class DebtNoteReminder {
  DebtNoteReminder({
    required this.id,
    required this.recordId,
    required this.channel,
    required this.tone,
    required this.scheduledAt,
    required this.status,
  });

  final String id;
  final String recordId;
  final String channel;
  final String tone;
  final DateTime scheduledAt;
  final String status;

  factory DebtNoteReminder.fromMap(Map<String, dynamic> map) {
    return DebtNoteReminder(
      id: map['id'] as String,
      recordId: map['record_id'] as String,
      channel: map['channel'] as String? ?? 'email',
      tone: map['tone'] as String? ?? 'taglish_casual',
      scheduledAt: DateTime.parse(map['scheduled_at'] as String),
      status: map['status'] as String? ?? 'pending',
    );
  }
}

class DebtNoteAgreement {
  DebtNoteAgreement({
    required this.id,
    required this.recordId,
    required this.publicToken,
    required this.borrowerName,
    this.borrowerEmail,
    this.signedAt,
  });

  final String id;
  final String recordId;
  final String publicToken;
  final String borrowerName;
  final String? borrowerEmail;
  final DateTime? signedAt;

  factory DebtNoteAgreement.fromMap(Map<String, dynamic> map) {
    return DebtNoteAgreement(
      id: map['id'] as String,
      recordId: map['record_id'] as String,
      publicToken: map['public_token'] as String,
      borrowerName: map['borrower_name'] as String,
      borrowerEmail: map['borrower_email'] as String?,
      signedAt: map['signed_at'] != null
          ? DateTime.parse(map['signed_at'] as String)
          : null,
    );
  }
}

class PaluwaganPool {
  PaluwaganPool({
    required this.id,
    required this.name,
    required this.contributionAmount,
    required this.cycleLength,
    required this.currentCycle,
    required this.status,
    this.members = const [],
  });

  final String id;
  final String name;
  final double contributionAmount;
  final int cycleLength;
  final int currentCycle;
  final String status;
  final List<PaluwaganMember> members;

  factory PaluwaganPool.fromMap(Map<String, dynamic> map) {
    final rawMembers = map['debt_note_paluwagan_members'] as List<dynamic>?;
    return PaluwaganPool(
      id: map['id'] as String,
      name: map['name'] as String,
      contributionAmount: (map['contribution_amount'] as num).toDouble(),
      cycleLength: map['cycle_length'] as int,
      currentCycle: map['current_cycle'] as int? ?? 1,
      status: map['status'] as String? ?? 'active',
      members: rawMembers
              ?.map((m) => PaluwaganMember.fromMap(m as Map<String, dynamic>))
              .toList() ??
          [],
    );
  }
}

class PaluwaganMember {
  PaluwaganMember({
    required this.id,
    required this.memberName,
    required this.payoutOrder,
    required this.hasReceivedPayout,
  });

  final String id;
  final String memberName;
  final int payoutOrder;
  final bool hasReceivedPayout;

  factory PaluwaganMember.fromMap(Map<String, dynamic> map) {
    return PaluwaganMember(
      id: map['id'] as String,
      memberName: map['member_name'] as String,
      payoutOrder: map['payout_order'] as int,
      hasReceivedPayout: map['has_received_payout'] as bool? ?? false,
    );
  }
}

class DashboardSummary {
  DashboardSummary({
    required this.totalReceivable,
    required this.totalPayable,
    required this.overdueCount,
    required this.activeRecords,
  });

  final double totalReceivable;
  final double totalPayable;
  final int overdueCount;
  final int activeRecords;
}
