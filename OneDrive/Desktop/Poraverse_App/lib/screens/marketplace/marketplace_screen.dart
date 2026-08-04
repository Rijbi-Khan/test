import 'dart:io';
import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:image_picker/image_picker.dart';
import '../../providers/poraverse_provider.dart';
import '../../theme/app_theme.dart';
import '../../models/models.dart';

class MarketplaceScreen extends StatefulWidget {
  const MarketplaceScreen({super.key});

  @override
  State<MarketplaceScreen> createState() => _MarketplaceScreenState();
}

class _MarketplaceScreenState extends State<MarketplaceScreen> {
  int _tabIndex = 0; // 0 = Buy, 1 = Resell, 2 = Donate
  String _searchQuery = '';

  // Sell form controllers
  final _nameCtrl = TextEditingController();
  final _originalPriceCtrl = TextEditingController();
  final _descCtrl = TextEditingController();
  final _classCtrl = TextEditingController();
  final _locationCtrl = TextEditingController();
  String _condition = 'Like New'; // 'Like New', 'Used Good', 'Used Fair'
  String _postTypeChoice = 'Resell'; // 'Resell' or 'Donate'
  
  // Simulated uploaded photos
  final List<String> _uploadedPhotos = [];

  @override
  void dispose() {
    _nameCtrl.dispose();
    _originalPriceCtrl.dispose();
    _descCtrl.dispose();
    _classCtrl.dispose();
    _locationCtrl.dispose();
    super.dispose();
  }

  // Calculate sell price based on condition
  double _calculateCustomerPrice(double originalPrice) {
    if (_condition == 'Like New') {
      return originalPrice * 0.20; // 20% of original price
    } else if (_condition == 'Used Good') {
      return originalPrice * 0.15; // 15% of original price
    } else {
      return originalPrice * 0.12; // 12% of original price
    }
  }

  void _publishListing(PoraverseProvider provider) {
    final title = _nameCtrl.text.trim();
    final originalPriceText = _originalPriceCtrl.text.trim();
    final desc = _descCtrl.text.trim();

    final isResell = _postTypeChoice == 'Resell';

    if (title.isEmpty || (isResell && originalPriceText.isEmpty)) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(isResell ? 'অনুগ্রহ করে পণ্যের নাম এবং মূল মূল্য প্রদান করুন।' : 'অনুগ্রহ করে পণ্যের নাম প্রদান করুন।')),
      );
      return;
    }

    final originalPrice = double.tryParse(originalPriceText) ?? 0.0;
    final systemPrice = isResell ? _calculateCustomerPrice(originalPrice) : 0.0;

    final item = MarketplaceItem(
      id: DateTime.now().millisecondsSinceEpoch.toString(),
      title: title,
      type: isResell ? 'Resell' : 'Donate',
      originalPrice: originalPrice,
      systemPrice: systemPrice,
      condition: isResell ? _condition : 'Good',
      className: _classCtrl.text.trim().isNotEmpty ? _classCtrl.text.trim() : 'Class 9',
      imageUrls: _uploadedPhotos.isNotEmpty
          ? List.from(_uploadedPhotos)
          : ['https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=500'],
      ownerName: provider.currentUser.name,
      ownerImageUrl: provider.currentUser.profileImageUrl,
      location: _locationCtrl.text.trim().isNotEmpty ? _locationCtrl.text.trim() : provider.currentUser.district,
      description: desc,
      status: 'Available',
    );

    provider.addMarketplaceItem(item);

    // Clear form & uploaded photos and switch to feed tab
    _nameCtrl.clear();
    _originalPriceCtrl.clear();
    _descCtrl.clear();
    _classCtrl.clear();
    _locationCtrl.clear();
    setState(() {
      _uploadedPhotos.clear();
      _tabIndex = isResell ? 1 : 2; // Switch to Resell (1) or Donate (2) tab
    });

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(isResell ? 'পণ্যটি রিসেল করার জন্য সফলভাবে পোস্ট হয়েছে!' : 'অনুদানটি সফলভাবে পোস্ট হয়েছে!'),
        backgroundColor: AppTheme.primary,
      ),
    );
  }

  void _showBkashPaymentModal(BuildContext context, MarketplaceItem item, PoraverseProvider provider) {
    final phoneController = TextEditingController(text: provider.currentUser.bkashNumber);
    final pinController = TextEditingController();
    bool isProcessing = false;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => StatefulBuilder(
        builder: (context, setModalState) => Container(
          decoration: BoxDecoration(
            color: Color(0xFFE2125E), // bkash primary pink color
            borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
          ),
          padding: EdgeInsets.only(
            left: 24,
            right: 24,
            top: 24,
            bottom: MediaQuery.of(context).viewInsets.bottom + 24,
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Image.asset('assets/images/logo.png', width: 64, height: 64), // Poraverse Logo
              SizedBox(height: 12),
              Text(
                'Poraverse bKash Payment',
                style: GoogleFonts.outfit(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 20),
              ),
              const Divider(color: Colors.white24, height: 24),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text('Item:', style: TextStyle(color: Colors.white70)),
                  Text(item.title, style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                ],
              ),
              SizedBox(height: 8),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text('Amount to Pay:', style: TextStyle(color: Colors.white70)),
                  Text('৳ ${item.systemPrice.toStringAsFixed(2)}', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 18)),
                ],
              ),
              SizedBox(height: 20),
              TextField(
                controller: phoneController,
                keyboardType: TextInputType.phone,
                style: TextStyle(color: Colors.white),
                decoration: InputDecoration(
                  labelText: 'bKash Wallet Number',
                  labelStyle: TextStyle(color: Colors.white70),
                  enabledBorder: UnderlineInputBorder(borderSide: BorderSide(color: Colors.white70)),
                  focusedBorder: UnderlineInputBorder(borderSide: BorderSide(color: Colors.white)),
                ),
              ),
              SizedBox(height: 12),
              TextField(
                controller: pinController,
                obscureText: true,
                keyboardType: TextInputType.number,
                style: TextStyle(color: Colors.white),
                decoration: InputDecoration(
                  labelText: 'bKash PIN',
                  labelStyle: TextStyle(color: Colors.white70),
                  enabledBorder: UnderlineInputBorder(borderSide: BorderSide(color: Colors.white70)),
                  focusedBorder: UnderlineInputBorder(borderSide: BorderSide(color: Colors.white)),
                ),
              ),
              SizedBox(height: 28),
              SizedBox(
                width: double.infinity,
                height: 50,
                child: ElevatedButton(
                  onPressed: isProcessing
                      ? null
                      : () async {
                          if (phoneController.text.isEmpty || pinController.text.isEmpty) {
                            return;
                          }
                          setModalState(() => isProcessing = true);
                          await Future.delayed(const Duration(milliseconds: 1500));
                          
                          provider.purchaseItem(item.id);
                          
                          if (context.mounted) {
                            Navigator.pop(ctx);
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(
                                content: Text('পেমেন্ট সফল হয়েছে! টাকা আমাদের মার্চেন্ট একাউন্টে জমা হয়েছে।'),
                                backgroundColor: Color(0xFFE2125E),
                              ),
                            );
                          }
                        },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppTheme.bgSecondary,
                    foregroundColor: const Color(0xFFE2125E),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                  ),
                  child: isProcessing
                      ? SizedBox(width: 24, height: 24, child: CircularProgressIndicator(color: Color(0xFFE2125E), strokeWidth: 2))
                      : Text('CONFIRM PAYMENT', style: TextStyle(fontWeight: FontWeight.bold)),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    try { context.watch<PoraverseProvider>(); } catch (e) { /* ignore */ }
    final provider = context.watch<PoraverseProvider>();
    return Scaffold(
      backgroundColor: AppTheme.bgPrimary,
      body: Column(
        children: [
          // ── Tabs ──────────────────────────────────────────
          Container(
            color: AppTheme.bgSecondary,
            padding: const EdgeInsets.fromLTRB(16, 16, 16, 0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Marketplace',
                  style: GoogleFonts.outfit(color: AppTheme.textPrimary, fontWeight: FontWeight.w700, fontSize: 24),
                ),
                SizedBox(height: 2),
                Text(
                  'কিনুন, রিসেল করুন, পাবলিশার্স বান্ডেল তৈরি করুন অথবা দান করুন।',
                  style: TextStyle(color: AppTheme.textMuted, fontSize: 12),
                ),
                SizedBox(height: 12),
                SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  child: Row(
                    children: [
                      _tabBtn('All (সকল)', 0),
                      SizedBox(width: 12),
                      _tabBtn('Resell (পুনর্বিক্রয়)', 1),
                      SizedBox(width: 12),
                      _tabBtn('Donate (দান)', 2),
                      SizedBox(width: 12),
                      _tabBtn('Publisher Bundles 📚', 3),
                      SizedBox(width: 12),
                      _tabBtn('+ পোস্ট দিন', 4),
                    ],
                  ),
                ),
              ],
            ),
          ),
          Container(color: AppTheme.bgSecondary, height: 1, child: Container(color: AppTheme.borderColor.withValues(alpha: 0.3))),
          
          Expanded(
            child: _tabIndex == 3
                ? _buildPublisherBundlesTab(provider)
                : _tabIndex == 4
                    ? _buildSellFormTab(provider)
                    : _buildBuyTab(provider),
          ),
        ],
      ),
    );
  }

  Widget _tabBtn(String label, int index) {
    final sel = _tabIndex == index;
    return GestureDetector(
      onTap: () => setState(() => _tabIndex = index),
      child: Column(
        children: [
          Text(
            label,
            style: TextStyle(color: sel ? AppTheme.primary : AppTheme.textMuted, fontWeight: FontWeight.bold, fontSize: 14),
          ),
          SizedBox(height: 6),
          AnimatedContainer(
            duration: const Duration(milliseconds: 200),
            height: 3,
            width: 40,
            decoration: BoxDecoration(
              color: sel ? AppTheme.primary : Colors.transparent,
              borderRadius: BorderRadius.circular(99),
            ),
          ),
        ],
      ),
    );
  }

  // ─── BUY / ALL / RESELL / DONATE TAB ─────────────────────
  Widget _buildBuyTab(PoraverseProvider provider) {
    final items = provider.marketplaceItems.where((i) {
      final matchesSearch = _searchQuery.isEmpty || i.title.toLowerCase().contains(_searchQuery.toLowerCase());
      if (_tabIndex == 1) return matchesSearch && i.type == 'Resell';
      if (_tabIndex == 2) return matchesSearch && i.type == 'Donate';
      return matchesSearch;
    }).toList();

    return RefreshIndicator(
      color: AppTheme.primary,
      backgroundColor: AppTheme.bgSecondary,
      onRefresh: () async {
        await Future.delayed(const Duration(milliseconds: 600));
        if (mounted) setState(() {});
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('মার্কেটপ্লেস রিফ্রেশ হয়েছে! 🔄'),
              duration: Duration(seconds: 1),
              backgroundColor: AppTheme.primary,
            ),
          );
        }
      },
      child: ListView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.all(16),
        children: [
          TextField(
            onChanged: (v) => setState(() => _searchQuery = v),
            style: TextStyle(color: AppTheme.textPrimary, fontSize: 14),
            decoration: InputDecoration(
              hintText: 'বই, নোট বা সামগ্রী খুঁজুন...',
              hintStyle: TextStyle(color: AppTheme.textMuted),
              prefixIcon: Icon(Icons.search, color: AppTheme.textMuted),
              filled: true,
              fillColor: AppTheme.bgSecondary,
              contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: AppTheme.borderColor)),
              enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: AppTheme.borderColor.withValues(alpha: 0.5))),
            ),
          ),
          SizedBox(height: 16),
          if (items.isEmpty)
            Center(
              child: Padding(
                padding: EdgeInsets.all(40),
                child: Text('কোনো পণ্য পাওয়া যায়নি।', style: TextStyle(color: AppTheme.textMuted)),
              ),
            )
          else
            ...items.map((item) => _buildItemCard(item, provider)),
        ],
      ),
    );
  }

  // ─── PUBLISHER BUNDLES TAB ──────────────────────────────
  Widget _buildPublisherBundlesTab(PoraverseProvider provider) {
    return Stack(
      children: [
        ListView(
          padding: const EdgeInsets.fromLTRB(16, 16, 16, 80),
          children: [
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [AppTheme.primary.withValues(alpha: 0.15), AppTheme.bgSecondary],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppTheme.primary.withValues(alpha: 0.3)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Icon(Icons.auto_stories, color: AppTheme.primary, size: 24),
                      SizedBox(width: 8),
                      Text('কাস্টম প্রকাশনী বান্ডেল মেকার', style: GoogleFonts.outfit(color: AppTheme.textPrimary, fontWeight: FontWeight.bold, fontSize: 16)),
                    ],
                  ),
                  SizedBox(height: 6),
                  Text('বাংলাদেশের বিশ্বস্ত প্রকাশনীগুলো থেকে আপনার প্রয়োজনীয় বই ও শিক্ষা সামগ্রী নির্বাচন করে একসাথে অর্ডার করুন।', style: TextStyle(color: AppTheme.textMuted, fontSize: 12)),
                ],
              ),
            ),
            SizedBox(height: 16),
            ...provider.publications.map((pub) => _buildPublicationCard(pub, provider)),
          ],
        ),
        if (provider.bundleCart.isNotEmpty)
          Positioned(
            left: 16,
            right: 16,
            bottom: 16,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              decoration: BoxDecoration(
                color: AppTheme.primary,
                borderRadius: BorderRadius.circular(16),
                boxShadow: [BoxShadow(color: AppTheme.primary.withValues(alpha: 0.4), blurRadius: 16, spreadRadius: 2)],
              ),
              child: Row(
                children: [
                  CircleAvatar(
                    backgroundColor: Colors.white24,
                    child: Text('${provider.bundleCart.length}', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                  ),
                  SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text('বান্ডেল কার্ট (${provider.bundleCart.length} টি বই)', style: TextStyle(color: Colors.white70, fontSize: 11)),
                        Text('মোট ৳${provider.bundleTotalPrice.toStringAsFixed(0)}', style: GoogleFonts.outfit(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16)),
                      ],
                    ),
                  ),
                  ElevatedButton(
                    onPressed: () => _showBundleCheckoutModal(context, provider),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.white,
                      foregroundColor: AppTheme.primary,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                    ),
                    child: Text('অর্ডার সম্পন্ন করুন', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
                  ),
                ],
              ),
            ),
          ),
      ],
    );
  }

  final Map<String, bool> _expandedPublishers = {};

  Widget _buildSmartImage(String? src, {double width = 40, double height = 40, BoxFit fit = BoxFit.cover, IconData fallbackIcon = Icons.menu_book}) {
    final fallbackWidget = Container(
      width: width,
      height: height,
      decoration: BoxDecoration(
        color: AppTheme.primary.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(8),
      ),
      alignment: Alignment.center,
      child: Icon(fallbackIcon, color: AppTheme.primary, size: width * 0.5),
    );

    if (src == null || src.trim().isEmpty) return fallbackWidget;

    final trimmed = src.trim();

    if (trimmed.startsWith('data:image') || trimmed.contains('base64,')) {
      try {
        final base64String = trimmed.contains('base64,') ? trimmed.split('base64,').last : trimmed;
        final bytes = base64Decode(base64String);
        return Image.memory(
          bytes,
          width: width,
          height: height,
          fit: fit,
          errorBuilder: (_, __, ___) => fallbackWidget,
        );
      } catch (e) {
        return fallbackWidget;
      }
    }

    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      return Image.network(
        trimmed,
        width: width,
        height: height,
        fit: fit,
        errorBuilder: (_, __, ___) => fallbackWidget,
      );
    }

    return fallbackWidget;
  }

  void _showBookDetailBottomSheet(BuildContext context, PublicationItemModel item, PoraverseProvider provider) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) {
        return StatefulBuilder(
          builder: (context, setSheetState) {
            final cartIndex = provider.bundleCart.indexWhere((c) => c.item.id == item.id);
            final inCartCount = cartIndex >= 0 ? provider.bundleCart[cartIndex].quantity : 0;

            return Container(
              decoration: BoxDecoration(
                color: AppTheme.bgSecondary,
                borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
              ),
              padding: EdgeInsets.only(
                left: 20,
                right: 20,
                top: 16,
                bottom: MediaQuery.of(context).padding.bottom + 20,
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Center(
                    child: Container(
                      width: 40,
                      height: 4,
                      margin: const EdgeInsets.only(bottom: 16),
                      decoration: BoxDecoration(color: Colors.grey.shade400, borderRadius: BorderRadius.circular(2)),
                    ),
                  ),
                  Center(
                    child: ClipRRect(
                      borderRadius: BorderRadius.circular(12),
                      child: Container(
                        color: Colors.black.withValues(alpha: 0.2),
                        padding: const EdgeInsets.all(8),
                        child: _buildSmartImage(
                          item.imageUrl,
                          width: MediaQuery.of(context).size.width * 0.65,
                          height: 240,
                          fit: BoxFit.contain,
                          fallbackIcon: Icons.menu_book,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),
                  Text(item.title, style: GoogleFonts.outfit(fontWeight: FontWeight.bold, fontSize: 20, color: AppTheme.textPrimary)),
                  if (item.writer != null && item.writer!.isNotEmpty)
                    Padding(
                      padding: const EdgeInsets.only(top: 4),
                      child: Text('✍️ লেখক: ${item.writer}', style: TextStyle(fontSize: 13, color: AppTheme.textMuted)),
                    ),
                  const SizedBox(height: 10),
                  Wrap(
                    spacing: 8,
                    children: [
                      if (item.subject != null && item.subject!.isNotEmpty)
                        Chip(
                          label: Text(item.subject!, style: TextStyle(fontSize: 11, color: AppTheme.primary, fontWeight: FontWeight.bold)),
                          backgroundColor: AppTheme.primary.withValues(alpha: 0.12),
                          visualDensity: VisualDensity.compact,
                        ),
                      if (item.className != null && item.className!.isNotEmpty)
                        Chip(
                          label: Text(item.className!, style: TextStyle(fontSize: 11, color: Colors.amber.shade900, fontWeight: FontWeight.bold)),
                          backgroundColor: Colors.amber.withValues(alpha: 0.15),
                          visualDensity: VisualDensity.compact,
                        ),
                    ],
                  ),
                  const Divider(height: 24),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text('মূল্য (Price):', style: TextStyle(fontSize: 14, color: AppTheme.textMuted)),
                      Text('৳${item.price.toStringAsFixed(0)}', style: GoogleFonts.outfit(fontSize: 24, fontWeight: FontWeight.bold, color: AppTheme.primary)),
                    ],
                  ),
                  const SizedBox(height: 16),
                  SizedBox(
                    width: double.infinity,
                    height: 50,
                    child: ElevatedButton.icon(
                      onPressed: () {
                        provider.addToBundleCart(item);
                        setSheetState(() {});
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(
                            content: Text('${item.title} কার্টে যোগ করা হয়েছে!'),
                            duration: const Duration(seconds: 1),
                          ),
                        );
                      },
                      icon: const Icon(Icons.add_shopping_cart, color: Colors.white),
                      label: Text(
                        inCartCount > 0 ? 'কার্টে যোগ করা হয়েছে (x$inCartCount)' : 'বান্ডেলে যোগ করুন',
                        style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                      ),
                      style: ElevatedButton.styleFrom(backgroundColor: AppTheme.primary, foregroundColor: Colors.white),
                    ),
                  ),
                ],
              ),
            );
          },
        );
      },
    );
  }

  Widget _buildPublicationCard(PublicationModel pub, PoraverseProvider provider) {
    final isExpanded = _expandedPublishers[pub.id] ?? true;

    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        color: AppTheme.bgSecondary,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppTheme.borderColor.withValues(alpha: 0.5)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          InkWell(
            onTap: () {
              setState(() {
                _expandedPublishers[pub.id] = !isExpanded;
              });
            },
            borderRadius: BorderRadius.circular(14),
            child: Padding(
              padding: const EdgeInsets.all(12),
              child: Row(
                children: [
                  ClipRRect(
                    borderRadius: BorderRadius.circular(10),
                    child: _buildSmartImage(pub.logoUrl, width: 44, height: 44, fallbackIcon: Icons.import_contacts),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(pub.name, style: GoogleFonts.outfit(fontWeight: FontWeight.bold, fontSize: 16, color: AppTheme.textPrimary)),
                        Text('${pub.description ?? "Educational Publisher"} • ${pub.items.length} টি বই', style: TextStyle(fontSize: 11, color: AppTheme.textMuted)),
                      ],
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.all(4),
                    decoration: BoxDecoration(
                      color: AppTheme.primary.withValues(alpha: 0.1),
                      shape: BoxShape.circle,
                    ),
                    child: Icon(isExpanded ? Icons.keyboard_arrow_up : Icons.keyboard_arrow_down, color: AppTheme.primary, size: 20),
                  ),
                ],
              ),
            ),
          ),
          if (isExpanded) ...[
            Divider(height: 1, color: AppTheme.borderColor.withValues(alpha: 0.3)),
            if (pub.items.isEmpty)
              Padding(
                padding: const EdgeInsets.all(16),
                child: Text('কোনো বই যোগ করা হয়নি', style: TextStyle(fontSize: 12, color: AppTheme.textMuted, fontStyle: FontStyle.italic)),
              )
            else
              ...pub.items.map((item) {
                final cartIndex = provider.bundleCart.indexWhere((c) => c.item.id == item.id);
                final inCartCount = cartIndex >= 0 ? provider.bundleCart[cartIndex].quantity : 0;

                return InkWell(
                  onTap: () => _showBookDetailBottomSheet(context, item, provider),
                  child: Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.center,
                      children: [
                        ClipRRect(
                          borderRadius: BorderRadius.circular(6),
                          child: _buildSmartImage(item.imageUrl, width: 40, height: 52, fit: BoxFit.cover, fallbackIcon: Icons.menu_book),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(item.title, style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: AppTheme.textPrimary)),
                              if (item.writer != null && item.writer!.isNotEmpty)
                                Text('✍️ ${item.writer}', style: TextStyle(fontSize: 11, color: AppTheme.textMuted)),
                              const SizedBox(height: 2),
                              Row(
                                children: [
                                  if (item.subject != null && item.subject!.isNotEmpty)
                                    Container(
                                      margin: const EdgeInsets.only(right: 6),
                                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                      decoration: BoxDecoration(
                                        color: AppTheme.primary.withValues(alpha: 0.12),
                                        borderRadius: BorderRadius.circular(4),
                                      ),
                                      child: Text(item.subject!, style: TextStyle(fontSize: 10, color: AppTheme.primary, fontWeight: FontWeight.bold)),
                                    ),
                                  if (item.className != null && item.className!.isNotEmpty)
                                    Container(
                                      margin: const EdgeInsets.only(right: 6),
                                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                      decoration: BoxDecoration(
                                        color: Colors.amber.withValues(alpha: 0.15),
                                        borderRadius: BorderRadius.circular(4),
                                      ),
                                      child: Text(item.className!, style: TextStyle(fontSize: 10, color: Colors.amber.shade900, fontWeight: FontWeight.bold)),
                                    ),
                                  Text('৳${item.price.toStringAsFixed(0)}', style: TextStyle(fontSize: 12, color: AppTheme.primary, fontWeight: FontWeight.bold)),
                                ],
                              ),
                            ],
                          ),
                        ),
                        if (inCartCount == 0)
                          OutlinedButton.icon(
                            onPressed: () => provider.addToBundleCart(item),
                            icon: const Icon(Icons.add, size: 14),
                            label: const Text('যোগ করুন', style: TextStyle(fontSize: 11)),
                            style: OutlinedButton.styleFrom(
                              foregroundColor: AppTheme.primary,
                              side: BorderSide(color: AppTheme.primary.withValues(alpha: 0.5)),
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                            ),
                          )
                        else
                          Row(
                            children: [
                              IconButton(
                                onPressed: () => provider.removeFromBundleCart(item),
                                icon: const Icon(Icons.remove_circle_outline, color: Colors.red, size: 20),
                              ),
                              Text('$inCartCount', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: AppTheme.textPrimary)),
                              IconButton(
                                onPressed: () => provider.addToBundleCart(item),
                                icon: Icon(Icons.add_circle_outline, color: AppTheme.primary, size: 20),
                              ),
                            ],
                          ),
                      ],
                    ),
                  ),
                );
              }),
          ],
        ],
      ),
    );
  }

  void _showBundleCheckoutModal(BuildContext context, PoraverseProvider provider) {
    final addressCtrl = TextEditingController(text: '${provider.currentUser.district}, Bangladesh');
    final phoneCtrl = TextEditingController(text: provider.currentUser.bkashNumber);
    bool isSubmitting = false;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => StatefulBuilder(
        builder: (context, setModalState) => Container(
          decoration: BoxDecoration(
            color: AppTheme.bgSecondary,
            borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
          ),
          padding: EdgeInsets.only(
            left: 20,
            right: 20,
            top: 20,
            bottom: MediaQuery.of(context).viewInsets.bottom + 20,
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text('বান্ডেল অর্ডার কনফার্মেশন', style: GoogleFonts.outfit(fontWeight: FontWeight.bold, fontSize: 18, color: AppTheme.textPrimary)),
                  IconButton(onPressed: () => Navigator.pop(ctx), icon: Icon(Icons.close, color: AppTheme.textMuted)),
                ],
              ),
              Divider(),
              Text('অর্ডারের বিষয়বস্তু:', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: AppTheme.textSecondary)),
              SizedBox(height: 6),
              ...provider.bundleCart.map((c) => Padding(
                padding: const EdgeInsets.only(bottom: 4),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Expanded(child: Text('${c.item.title} (x${c.quantity})', style: TextStyle(fontSize: 12, color: AppTheme.textPrimary))),
                    Text('৳${(c.item.price * c.quantity).toStringAsFixed(0)}', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: AppTheme.primary)),
                  ],
                ),
              )),
              Divider(),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text('সর্বমোট পেমেন্ট (bKash Escrow):', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: AppTheme.textPrimary)),
                  Text('৳${provider.bundleTotalPrice.toStringAsFixed(0)}', style: GoogleFonts.outfit(fontWeight: FontWeight.bold, fontSize: 18, color: AppTheme.primary)),
                ],
              ),
              SizedBox(height: 12),
              TextField(
                controller: addressCtrl,
                style: TextStyle(fontSize: 12, color: AppTheme.textPrimary),
                decoration: InputDecoration(
                  labelText: 'ডেলিভারি ঠিকানা (Address)',
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                ),
              ),
              SizedBox(height: 10),
              TextField(
                controller: phoneCtrl,
                style: TextStyle(fontSize: 12, color: AppTheme.textPrimary),
                decoration: InputDecoration(
                  labelText: 'বিকাশ নম্বর (bKash Number)',
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                ),
              ),
              SizedBox(height: 16),
              SizedBox(
                width: double.infinity,
                height: 48,
                child: ElevatedButton(
                  onPressed: isSubmitting
                      ? null
                      : () async {
                          setModalState(() => isSubmitting = true);
                          await provider.placeBundleOrder(shippingAddress: addressCtrl.text.trim());
                          if (context.mounted) {
                            Navigator.pop(ctx);
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(
                                content: Text('আপনার বান্ডেল অর্ডারটি সফলভাবে জমা হয়েছে! অ্যাডমিন ডেলিভারি প্রসেস করবে।'),
                                backgroundColor: Colors.green,
                              ),
                            );
                          }
                        },
                  style: ElevatedButton.styleFrom(backgroundColor: AppTheme.primary, foregroundColor: Colors.white),
                  child: isSubmitting
                      ? SizedBox(width: 24, height: 24, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                      : Text('অর্ডার সম্পন্ন করুন (Pay via bKash)', style: TextStyle(fontWeight: FontWeight.bold)),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildItemCard(MarketplaceItem item, PoraverseProvider provider) {
    return Container(
      margin: const EdgeInsets.only(bottom: 14),
      decoration: BoxDecoration(color: AppTheme.bgSecondary,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppTheme.borderColor.withValues(alpha: 0.4)),
        boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.04), blurRadius: 8)],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Image / Carousel section
          Container(
            height: 150,
            decoration: BoxDecoration(
              color: Color(0xFFECEDEF),
              borderRadius: BorderRadius.vertical(top: Radius.circular(14)),
            ),
            child: Stack(
              children: [
                Center(
                  child: item.imageUrls.isNotEmpty
                      ? (item.imageUrls[0].startsWith('http')
                          ? Image.network(
                              item.imageUrls[0],
                              fit: BoxFit.cover,
                              width: double.infinity,
                              height: double.infinity,
                              errorBuilder: (context, error, stackTrace) => Icon(Icons.menu_book, size: 64, color: AppTheme.primary.withValues(alpha: 0.3)),
                            )
                          : Image.file(
                              File(item.imageUrls[0]),
                              fit: BoxFit.cover,
                              width: double.infinity,
                              height: double.infinity,
                              errorBuilder: (context, error, stackTrace) => Icon(Icons.menu_book, size: 64, color: AppTheme.primary.withValues(alpha: 0.3)),
                            ))
                      : Icon(Icons.menu_book, size: 64, color: AppTheme.primary.withValues(alpha: 0.3)),
                ),
                Positioned(
                  top: 10,
                  left: 10,
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: item.type == 'Donate' ? Colors.orange : AppTheme.primary,
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: Text(
                      item.type == 'Donate' ? 'DONATION' : 'RESELL',
                      style: TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold),
                    ),
                  ),
                ),
                Positioned(
                  top: 10,
                  right: 10,
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: AppTheme.bgSecondary.withValues(alpha: 0.9),
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: Text(
                      item.condition,
                      style: TextStyle(color: AppTheme.textPrimary, fontSize: 10, fontWeight: FontWeight.bold),
                    ),
                  ),
                ),
              ],
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(14),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(item.title, style: TextStyle(color: AppTheme.textPrimary, fontWeight: FontWeight.bold, fontSize: 16)),
                SizedBox(height: 4),
                if (item.description.isNotEmpty) ...[
                  Text(item.description, style: TextStyle(color: AppTheme.textMuted, fontSize: 12)),
                  SizedBox(height: 8),
                ],
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        if (item.type != 'Donate') ...[
                          Text('৳ ${item.systemPrice.toStringAsFixed(0)}', style: TextStyle(color: AppTheme.primary, fontWeight: FontWeight.w800, fontSize: 20)),
                          Text('Original: ৳ ${item.originalPrice.toStringAsFixed(0)}', style: TextStyle(color: AppTheme.textMuted, fontSize: 11, decoration: TextDecoration.lineThrough)),
                        ] else ...[
                          Text('FREE / দান', style: TextStyle(color: Colors.orange, fontWeight: FontWeight.bold, fontSize: 18)),
                        ],
                      ],
                    ),
                    _buildActionButton(item, provider),
                  ],
                ),
                const Divider(height: 20),
                Row(
                  children: [
                    item.ownerImageUrl != null && item.ownerImageUrl!.isNotEmpty
                        ? Container(
                            width: 16, height: 16,
                            decoration: BoxDecoration(shape: BoxShape.circle),
                            clipBehavior: Clip.hardEdge,
                            child: item.ownerImageUrl!.startsWith('http')
                                ? Image.network(item.ownerImageUrl!, fit: BoxFit.cover)
                                : Image.asset('assets/images/user1.png', fit: BoxFit.cover), // fallback if local path and dart:io is tricky
                          )
                        : CircleAvatar(
                            radius: 8,
                            backgroundColor: AppTheme.primary.withValues(alpha: 0.2),
                            child: Text(
                              item.ownerName.isNotEmpty ? item.ownerName[0].toUpperCase() : 'U', 
                              style: TextStyle(fontSize: 8, color: AppTheme.primary, fontWeight: FontWeight.bold)
                            ),
                          ),
                    SizedBox(width: 4),
                    Text(item.ownerName, style: TextStyle(color: AppTheme.textMuted, fontSize: 11)),
                    const Spacer(),
                    Icon(Icons.location_on, size: 12, color: AppTheme.textMuted),
                    SizedBox(width: 4),
                    Text(item.location, style: TextStyle(color: AppTheme.textMuted, fontSize: 11)),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildActionButton(MarketplaceItem item, PoraverseProvider provider) {
    if (item.status == 'Available') {
      return ElevatedButton(
        onPressed: () {
          if (item.type == 'Donate') {
            provider.purchaseItem(item.id);
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(content: Text('অনুদানটি সফলভাবে দাবি করা হয়েছে!'), backgroundColor: Colors.orange),
            );
          } else {
            _showBkashPaymentModal(context, item, provider);
          }
        },
        style: ElevatedButton.styleFrom(backgroundColor: AppTheme.primary, foregroundColor: Colors.white, elevation: 0),
        child: Text(item.type == 'Donate' ? 'Claim Donation' : 'Buy Now (bKash)'),
      );
    } else if (item.status == 'PaymentHeld') {
      return Row(
        children: [
          Text('টাকা মার্চেন্ট ওয়ালেটে আছে', style: TextStyle(color: Colors.amber, fontWeight: FontWeight.bold, fontSize: 11)),
          SizedBox(width: 8),
          ElevatedButton(
            onPressed: () {
              provider.confirmDelivery(item.id);
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('ডেলিভারি নিশ্চিত হয়েছে এবং সেলারকে পেমেন্ট পাঠিয়ে দেওয়া হয়েছে!'), backgroundColor: AppTheme.primary),
              );
            },
            style: ElevatedButton.styleFrom(backgroundColor: Colors.amber, foregroundColor: Colors.black, elevation: 0),
            child: Text('Confirm Delivery'),
          ),
        ],
      );
    } else {
      return Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
        decoration: BoxDecoration(color: Colors.grey.shade200, borderRadius: BorderRadius.circular(4)),
        child: Text('Sold / বিক্রি হয়ে গেছে', style: TextStyle(color: Colors.grey, fontSize: 12, fontWeight: FontWeight.bold)),
      );
    }
  }

  // ─── RESELL / DONATE LISTING FORM TAB ───────────────────────
  Widget _buildSellFormTab(PoraverseProvider provider) {
    final originalPriceText = _originalPriceCtrl.text;
    final originalPrice = double.tryParse(originalPriceText) ?? 0.0;
    final isResell = _postTypeChoice == 'Resell';
    final systemPrice = isResell ? _calculateCustomerPrice(originalPrice) : 0.0;

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: AppTheme.bgSecondary,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: AppTheme.borderColor.withValues(alpha: 0.4)),
          boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.04), blurRadius: 8)],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'পোস্টের ক্যাটাগরি / ধরণ নির্বাচন করুন:',
              style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: AppTheme.textSecondary),
            ),
            SizedBox(height: 10),
            Row(
              children: [
                Expanded(
                  child: GestureDetector(
                    onTap: () => setState(() => _postTypeChoice = 'Resell'),
                    child: Container(
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      decoration: BoxDecoration(
                        color: isResell ? AppTheme.primary : AppTheme.bgPrimary,
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(color: isResell ? AppTheme.primary : AppTheme.borderColor),
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.storefront, size: 18, color: isResell ? Colors.white : AppTheme.textMuted),
                          SizedBox(width: 8),
                          Text('পুনর্বিক্রয় (Resell)', style: TextStyle(fontWeight: FontWeight.bold, color: isResell ? Colors.white : AppTheme.textPrimary, fontSize: 13)),
                        ],
                      ),
                    ),
                  ),
                ),
                SizedBox(width: 12),
                Expanded(
                  child: GestureDetector(
                    onTap: () => setState(() => _postTypeChoice = 'Donate'),
                    child: Container(
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      decoration: BoxDecoration(
                        color: !isResell ? Colors.orange : AppTheme.bgPrimary,
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(color: !isResell ? Colors.orange : AppTheme.borderColor),
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.volunteer_activism, size: 18, color: !isResell ? Colors.white : AppTheme.textMuted),
                          SizedBox(width: 8),
                          Text('দান (Donation)', style: TextStyle(fontWeight: FontWeight.bold, color: !isResell ? Colors.white : AppTheme.textPrimary, fontSize: 13)),
                        ],
                      ),
                    ),
                  ),
                ),
              ],
            ),
            const Divider(height: 24),
            
            Text(
              isResell ? 'List an Item for Resell (পুনর্বিক্রয়)' : 'List an Item for Donation (দান)',
              style: GoogleFonts.outfit(color: AppTheme.textPrimary, fontWeight: FontWeight.w700, fontSize: 18),
            ),
            SizedBox(height: 14),

            // Photo placeholder uploads (Max 3)
            Text('Upload Photos (সর্বোচ্চ ৩টি ছবি)', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: AppTheme.textSecondary)),
            SizedBox(height: 8),
            Row(
              children: [
                _photoBox(index: 1),
                SizedBox(width: 8),
                _photoBox(index: 2),
                SizedBox(width: 8),
                _photoBox(index: 3),
              ],
            ),
            SizedBox(height: 16),

            _formField(_nameCtrl, 'ITEM NAME / পণ্যের নাম', 'যেমন: Class 9 Math book'),
            SizedBox(height: 12),

            if (isResell) ...[
              // Condition and Original Price fields
              Row(
                children: [
                  Expanded(
                    child: TextFormField(
                      controller: _originalPriceCtrl,
                      keyboardType: TextInputType.number,
                      onChanged: (val) => setState(() {}),
                      style: TextStyle(color: AppTheme.textPrimary, fontSize: 14),
                      decoration: _formDeco('Original Price / গায়ের দাম (৳)'),
                    ),
                  ),
                  SizedBox(width: 12),
                  Expanded(
                    child: DropdownButtonFormField<String>(
                      initialValue: _condition,
                      dropdownColor: AppTheme.bgSecondary,
                      style: TextStyle(color: AppTheme.textPrimary, fontSize: 14),
                      decoration: _formDeco('Condition / অবস্থা'),
                      items: ['Like New', 'Used Good', 'Used Fair']
                          .map((v) => DropdownMenuItem(value: v, child: Text(v)))
                          .toList(),
                      onChanged: (v) => setState(() => _condition = v!),
                    ),
                  ),
                ],
              ),
              SizedBox(height: 12),
              
              // Calculated resell price info box
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: AppTheme.primary.withValues(alpha: 0.06),
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: AppTheme.primary.withValues(alpha: 0.2)),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'বিক্রয় মূল্য (Calculated Resell Price):',
                      style: TextStyle(fontWeight: FontWeight.w600, fontSize: 12, color: AppTheme.textSecondary),
                    ),
                    Text(
                      '৳ ${systemPrice.toStringAsFixed(2)}',
                      style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: AppTheme.primary),
                    ),
                  ],
                ),
              ),
              SizedBox(height: 12),
            ],

            Row(
              children: [
                Expanded(
                  child: _formField(_classCtrl, 'Class / শ্রেণী', 'যেমন: Class 9'),
                ),
                SizedBox(width: 12),
                Expanded(
                  child: _formField(_locationCtrl, 'জেলা / থানা', 'যেমন: কুড়িগ্রাম'),
                ),
              ],
            ),
            SizedBox(height: 12),

            TextFormField(
              controller: _descCtrl,
              maxLines: 3,
              style: TextStyle(color: AppTheme.textPrimary, fontSize: 14),
              decoration: _formDeco('Description / বিস্তারিত বিবরণী লিখুন...'),
            ),
            SizedBox(height: 24),

            SizedBox(
              width: double.infinity,
              height: 48,
              child: ElevatedButton(
                onPressed: () => _publishListing(provider),
                style: ElevatedButton.styleFrom(
                  backgroundColor: isResell ? AppTheme.primary : Colors.orange,
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                  elevation: 0,
                ),
                child: Text(
                  isResell ? 'Post for Resell / পাবলিশ করুন' : 'Post for Donation / দান করুন',
                  style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _photoBox({required int index}) {
    bool hasPhoto = index <= _uploadedPhotos.length;
    String? photoUrl = hasPhoto ? _uploadedPhotos[index - 1] : null;

    return Expanded(
      child: InkWell(
        onTap: () async {
          if (!hasPhoto && _uploadedPhotos.length < 3) {
            final picker = ImagePicker();
            final pickedFile = await picker.pickImage(source: ImageSource.gallery);
            if (!mounted) return;
            if (pickedFile != null) {
              setState(() {
                _uploadedPhotos.add(pickedFile.path);
              });
              ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('ছবি আপলোড করা হয়েছে!'), backgroundColor: AppTheme.primary));
            }
          } else if (hasPhoto) {
            setState(() {
              _uploadedPhotos.removeAt(index - 1);
            });
            ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('ছবি মুছে ফেলা হয়েছে!'), backgroundColor: Colors.red));
          }
        },
        child: AspectRatio(
          aspectRatio: 1,
          child: Container(
            decoration: BoxDecoration(
              color: AppTheme.bgPrimary,
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: AppTheme.borderColor),
              image: hasPhoto 
                  ? DecorationImage(
                      image: photoUrl!.startsWith('http') ? NetworkImage(photoUrl) as ImageProvider : FileImage(File(photoUrl)), 
                      fit: BoxFit.cover) 
                  : null,
            ),
            child: hasPhoto ? null : Center(
              child: Icon(Icons.add_a_photo_outlined, color: AppTheme.textMuted, size: 24),
            ),
          ),
        ),
      ),
    );
  }

  Widget _formField(TextEditingController ctrl, String label, String hint) {
    return TextFormField(
      controller: ctrl,
      style: TextStyle(color: AppTheme.textPrimary, fontSize: 14),
      decoration: _formDeco(label).copyWith(hintText: hint),
    );
  }

  InputDecoration _formDeco(String label) {
    return InputDecoration(
      labelText: label,
      labelStyle: TextStyle(color: AppTheme.textMuted, fontSize: 11, fontWeight: FontWeight.w700),
      filled: true,
      fillColor: AppTheme.bgPrimary,
      contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
      border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: BorderSide(color: AppTheme.borderColor)),
      enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: BorderSide(color: AppTheme.borderColor)),
    );
  }
}




