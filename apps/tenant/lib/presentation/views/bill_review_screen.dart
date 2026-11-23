import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:cloud_functions/cloud_functions.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:url_launcher/url_launcher.dart';

/// Screen for tenant to review bill and submit payment confirmation
/// 
/// Flow:
/// 1. Owner sends bill → status becomes 'bill_sent'
/// 2. Tenant sees this screen with payment details
/// 3. Tenant pays via UPI (using deep link)
/// 4. Tenant enters transaction ID and clicks "I've Paid"
/// 5. Owner receives notification to verify
/// 6. Owner confirms → Tenant record created
class BillReviewScreen extends StatefulWidget {
  final String enrollmentRequestId;
  
  const BillReviewScreen({
    super.key,
    required this.enrollmentRequestId,
  });

  @override
  State<BillReviewScreen> createState() => _BillReviewScreenState();
}

class _BillReviewScreenState extends State<BillReviewScreen> {
  final _transactionIdController = TextEditingController();
  final _firestore = FirebaseFirestore.instance;
  
  bool _isSubmitting = false;
  bool _isGeneratingLink = false;
  bool _showManualEntry = false;
  String? _error;

  @override
  void dispose() {
    _transactionIdController.dispose();
    super.dispose();
  }

  bool _hasTriedCashfree = false;

  Future<void> _payViaCashfree(Map<String, dynamic> data) async {
    final businessId = data['businessId'] as String? ?? '';
    final tenantId = data['tenantId'] as String? ?? FirebaseAuth.instance.currentUser?.uid ?? '';

    setState(() => _isGeneratingLink = true);

    try {
      final callable = FirebaseFunctions.instance.httpsCallable('createCashfreePaymentSession');
      final result = await callable.call({
        'businessId': businessId,
        'tenantId': tenantId,
        'enrollmentRequestId': widget.enrollmentRequestId,
        'forceNew': _hasTriedCashfree,
      });

      _hasTriedCashfree = true;

      final paymentUrl = result.data['paymentUrl'] as String?;
      if (paymentUrl != null && paymentUrl.isNotEmpty) {
        final uri = Uri.parse(paymentUrl);
        await launchUrl(uri, mode: LaunchMode.externalApplication);
        if (mounted) {
          _showPaymentProcessingDialog('Cashfree');
        }
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Failed to generate Cashfree payment link.')),
        );
      }
    } on FirebaseFunctionsException catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(e.message ?? 'Failed to create Cashfree payment link')),
      );
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error initiating Cashfree payment: $e')),
      );
    } finally {
      if (mounted) setState(() => _isGeneratingLink = false);
    }
  }

  Future<void> _payViaOnlineGateway(Map<String, dynamic> data) async {
    final businessId = data['businessId'] as String? ?? '';
    if (businessId.isEmpty) {
      await _payViaCashfree(data);
      return;
    }

    try {
      final cfSnap = await FirebaseFirestore.instance.doc('businesses/$businessId/settings/cashfree').get();
      // If Cashfree is NOT explicitly disabled by the PG owner, Cashfree is preferred!
      if (!cfSnap.exists || cfSnap.data()?['enabled'] != false) {
        await _payViaCashfree(data);
        return;
      }
    } catch (_) {
      await _payViaCashfree(data);
      return;
    }

    // Only fallback to Razorpay if Cashfree was explicitly disabled by the PG owner
    await _payViaRazorpay(data);
  }

  void _showPaymentProcessingDialog(String provider) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Row(
          children: [
            Icon(Icons.hourglass_top_rounded, color: Color(0xFF0D7377)),
            SizedBox(width: 8),
            Text('Payment Processing'),
          ],
        ),
        content: Text(
          'Once you complete your payment on $provider, your reservation will be automatically verified and confirmed within moments.\n\nYou do not need to enter any transaction ID manually.',
          style: const TextStyle(height: 1.5),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(),
            child: const Text('OK'),
          ),
        ],
      ),
    );
  }

  Future<void> _payViaRazorpay(Map<String, dynamic> data) async {
    final businessId = data['businessId'] as String? ?? '';
    final tenantId = data['tenantId'] as String? ?? FirebaseAuth.instance.currentUser?.uid ?? '';

    setState(() => _isGeneratingLink = true);

    try {
      final callable = FirebaseFunctions.instance.httpsCallable('createPaymentLink');
      final result = await callable.call({
        'businessId': businessId,
        'tenantId': tenantId,
        'enrollmentRequestId': widget.enrollmentRequestId,
      });

      final paymentLinkUrl = result.data['paymentLinkUrl'] as String?;
      if (paymentLinkUrl != null && paymentLinkUrl.isNotEmpty) {
        final uri = Uri.parse(paymentLinkUrl);
        await launchUrl(uri, mode: LaunchMode.externalApplication);
        if (mounted) {
          _showRazorpayProcessingDialog();
        }
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Failed to generate payment link. Please try again.')),
        );
      }
    } on FirebaseFunctionsException catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(e.message ?? 'Failed to create payment link')),
      );
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error initiating payment: $e')),
      );
    } finally {
      if (mounted) setState(() => _isGeneratingLink = false);
    }
  }

  void _showRazorpayProcessingDialog() {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Row(
          children: [
            Icon(Icons.hourglass_top_rounded, color: Color(0xFF0D7377)),
            SizedBox(width: 8),
            Text('Payment Processing'),
          ],
        ),
        content: const Text(
          'Once you complete your payment on Razorpay, your reservation will be automatically verified and confirmed within moments.\n\nYou do not need to enter any transaction ID manually.',
          style: TextStyle(height: 1.5),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(),
            child: const Text('OK'),
          ),
        ],
      ),
    );
  }

  Future<void> _openUpiApp(String upiId, double amount, String propertyName) async {
    // Build UPI intent URL
    final upiUrl = Uri.parse(
      'upi://pay?pa=$upiId&pn=${Uri.encodeComponent(propertyName)}&am=$amount&cu=INR&tn=${Uri.encodeComponent("Deposit for $propertyName")}'
    );
    
    try {
      if (await canLaunchUrl(upiUrl)) {
        await launchUrl(upiUrl, mode: LaunchMode.externalApplication);
      } else {
        // Show manual payment instructions
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('Open any UPI app and pay to $upiId'),
              duration: const Duration(seconds: 5),
              action: SnackBarAction(
                label: 'Copy UPI',
                onPressed: () {
                  Clipboard.setData(ClipboardData(text: upiId));
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('UPI ID copied!')),
                  );
                },
              ),
            ),
          );
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Could not open UPI app: $e')),
        );
      }
    }
  }

  Future<void> _submitPayment(Map<String, dynamic> data) async {
    final transactionId = _transactionIdController.text.trim();
    
    if (transactionId.isEmpty) {
      setState(() => _error = 'Please enter the transaction ID / UTR number');
      return;
    }
    
    if (transactionId.length < 6) {
      setState(() => _error = 'Transaction ID seems too short. Please check and re-enter.');
      return;
    }

    setState(() {
      _isSubmitting = true;
      _error = null;
    });

    try {
      await _firestore.collection('enrollmentRequests').doc(widget.enrollmentRequestId).update({
        'status': 'payment_submitted',
        'transactionId': transactionId,
        'paymentSubmittedAt': FieldValue.serverTimestamp(),
        'paymentSubmittedBy': FirebaseAuth.instance.currentUser?.uid,
        'updatedAt': FieldValue.serverTimestamp(),
      });

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Payment submitted! Owner will verify and confirm shortly.'),
            backgroundColor: Colors.green,
          ),
        );
        Navigator.pop(context, true);
      }
    } catch (e) {
      setState(() {
        _error = 'Failed to submit: $e';
        _isSubmitting = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Review & Pay'),
        backgroundColor: Colors.white,
        foregroundColor: Colors.black87,
        elevation: 0,
      ),
      body: StreamBuilder<DocumentSnapshot>(
        stream: _firestore
            .collection('enrollmentRequests')
            .doc(widget.enrollmentRequestId)
            .snapshots(),
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }

          if (!snapshot.hasData || !snapshot.data!.exists) {
            return const Center(
              child: Text('Request not found'),
            );
          }

          final data = snapshot.data!.data() as Map<String, dynamic>;
          final status = data['status'] as String?;
          
          // Check if already submitted or confirmed
          if (status == 'payment_submitted') {
            return _buildWaitingForConfirmation(data);
          }
          
          if (status == 'confirmed' || status == 'approved') {
            return _buildPaymentConfirmed(data);
          }
          
          if (status != 'bill_sent') {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.info_outline, size: 64, color: Colors.grey),
                  const SizedBox(height: 16),
                  Text('Status: ${status ?? "Unknown"}'),
                  const Text('No pending bill for this request.'),
                ],
              ),
            );
          }

          return _buildBillReview(data);
        },
      ),
    );
  }

  Widget _buildBillReview(Map<String, dynamic> data) {
    final propertyName = data['propertyName'] as String? ?? 'PG';
    final roomNumber = data['roomNumber']?.toString() ?? '-';
    final bedNumber = data['bedNumber']?.toString() ?? '-';
    final depositAmount = (data['depositAmount'] as num?)?.toDouble() ?? 0;
    final advanceAmount = (data['advanceAmount'] as num?)?.toDouble() ?? 0;
    final monthlyRent = (data['monthlyRent'] as num?)?.toDouble() ?? 0;
    final totalAmount = (data['totalBillAmount'] as num?)?.toDouble() ?? (depositAmount + advanceAmount);
    final ownerUpiId = data['ownerUpiId'] as String? ?? '';

    final paymentMode = (data['paymentMode'] as String? ?? 'upi_manual').toLowerCase();

    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Property & Room Info
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [Colors.blue.shade600, Colors.blue.shade800],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(16),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  '🎉 Room Reserved For You!',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),
                const SizedBox(height: 16),
                Row(
                  children: [
                    const Icon(Icons.apartment, color: Colors.white70, size: 20),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        propertyName,
                        style: const TextStyle(
                          fontSize: 16,
                          color: Colors.white,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                Row(
                  children: [
                    const Icon(Icons.bed, color: Colors.white70, size: 20),
                    const SizedBox(width: 8),
                    Text(
                      'Room $roomNumber, Bed $bedNumber',
                      style: const TextStyle(fontSize: 16, color: Colors.white),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                Row(
                  children: [
                    const Icon(Icons.calendar_month, color: Colors.white70, size: 20),
                    const SizedBox(width: 8),
                    Text(
                      'Monthly Rent: ₹${monthlyRent.toInt().toString().replaceAllMapped(RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), (m) => '${m[1]},')}',
                      style: const TextStyle(fontSize: 16, color: Colors.white),
                    ),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),

          // Bill Breakdown
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.05),
                  blurRadius: 10,
                  offset: const Offset(0, 2),
                ),
              ],
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Payment Details',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 16),
                _buildBillRow('Security Deposit', depositAmount),
                const Divider(),
                _buildBillRow('Advance Rent', advanceAmount),
                const Divider(thickness: 2),
                _buildBillRow('Total Amount', totalAmount, isTotal: true),
              ],
            ),
          ),
          const SizedBox(height: 24),

          // ── Payment Mode Specific Section ──
          if (paymentMode == 'razorpay' || paymentMode == 'cashfree' || paymentMode == 'online') ...[
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: const Color(0xFFecfdf5),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: const Color(0xFF10b981).withAlpha(120)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          color: const Color(0xFF10b981).withAlpha(30),
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: const Icon(Icons.shield_rounded, color: Color(0xFF047857), size: 24),
                      ),
                      const SizedBox(width: 12),
                      const Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Pay Online (0% Fee on UPI)',
                              style: TextStyle(
                                fontSize: 17,
                                fontWeight: FontWeight.bold,
                                color: Color(0xFF065f46),
                              ),
                            ),
                            SizedBox(height: 2),
                            Text(
                              'Instant UPI, Cards, Netbanking • Auto-verified',
                              style: TextStyle(fontSize: 12, color: Color(0xFF047857)),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  const Text(
                    'Your move-in payment will be instantly verified and your bed reservation confirmed automatically. No manual UTR entry needed!',
                    style: TextStyle(fontSize: 13, color: Color(0xFF065f46), height: 1.4),
                  ),
                  const SizedBox(height: 14),
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: const Color(0xFF10b981).withAlpha(80)),
                    ),
                    child: Column(
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            const Text(
                              'Bill Amount',
                              style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: Colors.black87),
                            ),
                            Text(
                              '₹${totalAmount.toInt().toString().replaceAllMapped(RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), (m) => '${m[1]},')}',
                              style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFF065f46)),
                            ),
                          ],
                        ),
                        const SizedBox(height: 8),
                        Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                              decoration: BoxDecoration(
                                color: Colors.green.shade100,
                                borderRadius: BorderRadius.circular(4),
                              ),
                              child: Text(
                                '0% FEE',
                                style: TextStyle(
                                  fontSize: 10,
                                  fontWeight: FontWeight.bold,
                                  color: Colors.green.shade800,
                                ),
                              ),
                            ),
                            const SizedBox(width: 8),
                            const Expanded(
                              child: Text(
                                'Free on UPI (GPay, PhonePe). Cards subject to ~2% fee on checkout.',
                                style: TextStyle(fontSize: 11, color: Colors.grey),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 16),
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton.icon(
                      onPressed: _isGeneratingLink ? null : () => _payViaOnlineGateway(data),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF10b981),
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        elevation: 2,
                      ),
                      icon: _isGeneratingLink
                          ? const SizedBox(
                              width: 20,
                              height: 20,
                              child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                            )
                          : const Icon(Icons.lock_rounded, size: 20),
                      label: Text(
                        _isGeneratingLink
                            ? 'Opening Payment Gateway...'
                            : 'Pay ₹${totalAmount.toInt().toString().replaceAllMapped(RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), (m) => '${m[1]},')} Securely',
                        style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                      ),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),
            Center(
              child: TextButton.icon(
                onPressed: () => setState(() => _showManualEntry = !_showManualEntry),
                icon: Icon(
                  _showManualEntry ? Icons.keyboard_arrow_up : Icons.keyboard_arrow_down,
                  size: 18,
                  color: Colors.grey.shade600,
                ),
                label: Text(
                  _showManualEntry
                      ? 'Hide manual transaction confirmation'
                      : 'Already paid outside? Confirm manually',
                  style: TextStyle(fontSize: 13, color: Colors.grey.shade600),
                ),
              ),
            ),
            if (_showManualEntry) ...[
              const SizedBox(height: 12),
              _buildManualConfirmationSection(data),
            ],
          ] else if (paymentMode == 'bank_transfer') ...[
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: Colors.blue.shade50,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: Colors.blue.shade200),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Icon(Icons.account_balance, color: Colors.blue.shade700),
                      const SizedBox(width: 8),
                      const Text(
                        'Pay via Bank Transfer',
                        style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  if ((data['bankName'] as String? ?? '').isNotEmpty)
                    _buildBankDetailRow('Bank Name', data['bankName'] as String),
                  if ((data['accountNumber'] as String? ?? '').isNotEmpty)
                    _buildBankDetailRow('Account Number', data['accountNumber'] as String),
                  if ((data['ifscCode'] as String? ?? '').isNotEmpty)
                    _buildBankDetailRow('IFSC Code', data['ifscCode'] as String),
                  if ((data['accountHolderName'] as String? ?? '').isNotEmpty)
                    _buildBankDetailRow('Beneficiary', data['accountHolderName'] as String),
                ],
              ),
            ),
            const SizedBox(height: 24),
            _buildManualConfirmationSection(data),
          ] else ...[
            // Default: Pay via UPI Section
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: Colors.green.shade50,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: Colors.green.shade200),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Icon(Icons.account_balance_wallet, color: Colors.green.shade700),
                      const SizedBox(width: 8),
                      const Text(
                        'Pay via UPI',
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  const Text(
                    'Pay directly to the owner\'s UPI - No platform fees!',
                    style: TextStyle(color: Colors.black87),
                  ),
                  const SizedBox(height: 16),
                  
                  // UPI ID display
                  if (ownerUpiId.isNotEmpty) ...[
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(color: Colors.grey.shade300),
                      ),
                      child: Row(
                        children: [
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Text(
                                  'UPI ID',
                                  style: TextStyle(fontSize: 12, color: Colors.grey),
                                ),
                                Text(
                                  ownerUpiId,
                                  style: const TextStyle(
                                    fontSize: 16,
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                              ],
                            ),
                          ),
                          IconButton(
                            onPressed: () {
                              Clipboard.setData(ClipboardData(text: ownerUpiId));
                              ScaffoldMessenger.of(context).showSnackBar(
                                const SnackBar(content: Text('UPI ID copied!')),
                              );
                            },
                            icon: const Icon(Icons.copy),
                            tooltip: 'Copy UPI ID',
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 16),
                    
                    // Pay Now Button
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton.icon(
                        onPressed: () => _openUpiApp(ownerUpiId, totalAmount, propertyName),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.green.shade600,
                          padding: const EdgeInsets.symmetric(vertical: 14),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(10),
                          ),
                        ),
                        icon: const Icon(Icons.open_in_new, color: Colors.white),
                        label: Text(
                          'Pay ₹${totalAmount.toInt().toString().replaceAllMapped(RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), (m) => '${m[1]},')} via UPI',
                          style: const TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                            color: Colors.white,
                          ),
                        ),
                      ),
                    ),
                  ],
                ],
              ),
            ),
            const SizedBox(height: 24),
            _buildManualConfirmationSection(data),
          ],
          const SizedBox(height: 40),
        ],
      ),
    );
  }

  Widget _buildBankDetailRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(color: Colors.grey)),
          Text(value, style: const TextStyle(fontWeight: FontWeight.w600)),
        ],
      ),
    );
  }

  Widget _buildManualConfirmationSection(Map<String, dynamic> data) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 10,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Confirm Your Payment',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'After paying, enter the transaction ID (UTR / Reference number) to confirm.',
            style: TextStyle(color: Colors.grey.shade600),
          ),
          const SizedBox(height: 16),
          TextField(
            controller: _transactionIdController,
            decoration: InputDecoration(
              labelText: 'Transaction ID / UTR Number',
              hintText: 'e.g., 123456789012',
              border: const OutlineInputBorder(),
              prefixIcon: const Icon(Icons.receipt_long),
              errorText: _error,
            ),
            keyboardType: TextInputType.text,
            textCapitalization: TextCapitalization.characters,
          ),
          const SizedBox(height: 16),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: _isSubmitting ? null : () => _submitPayment(data),
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.blue.shade600,
                padding: const EdgeInsets.symmetric(vertical: 14),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(10),
                ),
              ),
              child: _isSubmitting
                  ? const SizedBox(
                      width: 24,
                      height: 24,
                      child: CircularProgressIndicator(
                        strokeWidth: 2,
                        color: Colors.white,
                      ),
                    )
                  : const Text(
                      "I've Paid - Confirm Payment",
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                      ),
                    ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildBillRow(String label, double amount, {bool isTotal = false}) {
    final formattedAmount = '₹${amount.toInt().toString().replaceAllMapped(
      RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'),
      (m) => '${m[1]},',
    )}';
    
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: TextStyle(
              fontSize: isTotal ? 18 : 16,
              fontWeight: isTotal ? FontWeight.bold : FontWeight.normal,
              color: isTotal ? Colors.black : Colors.grey.shade700,
            ),
          ),
          Text(
            formattedAmount,
            style: TextStyle(
              fontSize: isTotal ? 20 : 16,
              fontWeight: isTotal ? FontWeight.bold : FontWeight.w500,
              color: isTotal ? Colors.green.shade700 : Colors.black87,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildWaitingForConfirmation(Map<String, dynamic> data) {
    final transactionId = data['transactionId'] as String? ?? '';
    final propertyName = data['propertyName'] as String? ?? 'PG';
    
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                color: Colors.orange.shade50,
                shape: BoxShape.circle,
              ),
              child: Icon(
                Icons.hourglass_top,
                size: 64,
                color: Colors.orange.shade600,
              ),
            ),
            const SizedBox(height: 24),
            const Text(
              'Payment Verification Pending',
              style: TextStyle(
                fontSize: 22,
                fontWeight: FontWeight.bold,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 12),
            Text(
              'Your payment for $propertyName has been submitted.\n\nThe owner is verifying your transaction.',
              style: TextStyle(
                fontSize: 16,
                color: Colors.grey.shade600,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 24),
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.grey.shade100,
                borderRadius: BorderRadius.circular(12),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Icon(Icons.receipt_long, color: Colors.grey),
                  const SizedBox(width: 12),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Transaction ID',
                        style: TextStyle(
                          fontSize: 12,
                          color: Colors.grey,
                        ),
                      ),
                      Text(
                        transactionId,
                        style: const TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 32),
            Text(
              'You will be notified once confirmed.',
              style: TextStyle(
                fontSize: 14,
                color: Colors.grey.shade500,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildPaymentConfirmed(Map<String, dynamic> data) {
    final propertyName = data['propertyName'] as String? ?? 'PG';
    final roomNumber = data['roomNumber']?.toString() ?? '-';
    final bedNumber = data['bedNumber']?.toString() ?? '-';
    
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                color: Colors.green.shade50,
                shape: BoxShape.circle,
              ),
              child: Icon(
                Icons.check_circle,
                size: 64,
                color: Colors.green.shade600,
              ),
            ),
            const SizedBox(height: 24),
            const Text(
              '🎉 Welcome!',
              style: TextStyle(
                fontSize: 28,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 12),
            Text(
              'Your payment has been confirmed.\nWelcome to $propertyName!',
              style: TextStyle(
                fontSize: 16,
                color: Colors.grey.shade600,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 24),
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: Colors.blue.shade50,
                borderRadius: BorderRadius.circular(16),
              ),
              child: Column(
                children: [
                  Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(Icons.bed, color: Colors.blue),
                      const SizedBox(width: 8),
                      Text(
                        'Room $roomNumber, Bed $bedNumber',
                        style: const TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 32),
            ElevatedButton(
              onPressed: () {
                Navigator.of(context).popUntil((route) => route.isFirst);
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.blue.shade600,
                padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 14),
              ),
              child: const Text(
                'Go to My PG',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
