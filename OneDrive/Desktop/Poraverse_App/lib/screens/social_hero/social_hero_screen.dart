import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import '../../providers/poraverse_provider.dart';
import '../../models/models.dart';

class SocialHeroScreen extends StatefulWidget {
  const SocialHeroScreen({super.key});
  @override
  State<SocialHeroScreen> createState() => _SocialHeroScreenState();
}

class _SocialHeroScreenState extends State<SocialHeroScreen> {
  int _mainSectionTab = 0; // 0 = Badges & Points (Dark Overview), 1 = Social Work Campaigns & Posts
  SocialWorkCampaignModel? _selectedCampaign;

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<PoraverseProvider>();
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      backgroundColor: isDark ? const Color(0xFF0F172A) : const Color(0xFFF7F9FB),
      appBar: AppBar(
        backgroundColor: isDark ? const Color(0xFF0F172A) : Colors.white,
        elevation: 0,
        surfaceTintColor: Colors.transparent,
        automaticallyImplyLeading: false,
        title: Text(
          'Social Hero',
          style: GoogleFonts.outfit(
            color: const Color(0xFF006D36),
            fontWeight: FontWeight.w700,
            fontSize: 22,
          ),
        ),
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(48),
          child: Container(
            color: isDark ? const Color(0xFF0F172A) : Colors.white,
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Row(
              children: [
                _mainTabBtn('ব্যাজ ও পয়েন্ট (Badges)', 0, isDark),
                const SizedBox(width: 16),
                _mainTabBtn('সামাজিক কাজ (Social Work) 🌿', 1, isDark),
              ],
            ),
          ),
        ),
      ),
      body: _mainSectionTab == 0
          ? _buildBadgesView(provider, isDark)
          : _selectedCampaign == null
              ? _buildCampaignsList(provider, isDark)
              : _buildCampaignDetailView(_selectedCampaign!, provider, isDark),
    );
  }

  Widget _mainTabBtn(String label, int index, bool isDark) {
    final sel = _mainSectionTab == index;
    return GestureDetector(
      onTap: () => setState(() {
        _mainSectionTab = index;
        _selectedCampaign = null;
      }),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Padding(
            padding: const EdgeInsets.symmetric(vertical: 8),
            child: Text(
              label,
              style: TextStyle(
                color: sel
                    ? const Color(0xFF006D36)
                    : (isDark ? Colors.grey.shade400 : const Color(0xFF64748B)),
                fontWeight: FontWeight.bold,
                fontSize: 13,
              ),
            ),
          ),
          AnimatedContainer(
            duration: const Duration(milliseconds: 200),
            height: 3,
            width: 50,
            decoration: BoxDecoration(
              color: sel ? const Color(0xFF006D36) : Colors.transparent,
              borderRadius: BorderRadius.circular(99),
            ),
          ),
        ],
      ),
    );
  }

  // ─── BADGES & POINTS OVERVIEW ─────────────────────────────
  Widget _buildBadgesView(PoraverseProvider provider, bool isDark) {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        // ── Top Card: Hero Points Banner ──────────────────────────────────
        Container(
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            color: isDark ? const Color(0xFF1E262E) : Colors.white,
            borderRadius: BorderRadius.circular(20),
            border: Border.all(
              color: Colors.amber.shade600.withValues(alpha: isDark ? 0.6 : 0.4),
              width: 1.5,
            ),
            boxShadow: [
              BoxShadow(
                color: isDark
                    ? Colors.amber.shade900.withValues(alpha: 0.15)
                    : Colors.amber.shade500.withValues(alpha: 0.08),
                blurRadius: 16,
                spreadRadius: 2,
              ),
            ],
          ),
          child: Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Pill Badge
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: Colors.amber.withValues(alpha: 0.15),
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(color: Colors.amber.shade600.withValues(alpha: 0.3)),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const Icon(Icons.verified, color: Colors.amber, size: 14),
                          const SizedBox(width: 4),
                          Text(
                            'HERO STATUS: ACTIVE',
                            style: GoogleFonts.outfit(
                              color: isDark ? Colors.amber.shade400 : Colors.amber.shade800,
                              fontWeight: FontWeight.bold,
                              fontSize: 10,
                              letterSpacing: 1,
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 12),
                    Text(
                      'Social Hero Points',
                      style: GoogleFonts.outfit(
                        color: isDark ? Colors.white : const Color(0xFF0F172A),
                        fontSize: 22,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 6),
                    Text(
                      'Contribute to the community and real-world causes to earn points and unlock exclusive badges.',
                      style: TextStyle(
                        color: isDark ? Colors.grey.shade400 : const Color(0xFF475569),
                        fontWeight: FontWeight.w400,
                        fontSize: 12,
                        height: 1.3,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 16),
              // Golden Points Ring
              Container(
                width: 86,
                height: 86,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: isDark ? const Color(0xFF12181F) : const Color(0xFFFFFBEB),
                  border: Border.all(color: Colors.amber.shade500, width: 3),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.amber.shade500.withValues(alpha: 0.3),
                      blurRadius: 16,
                    ),
                  ],
                ),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text(
                      '450',
                      style: GoogleFonts.outfit(
                        color: isDark ? Colors.amber.shade400 : Colors.amber.shade800,
                        fontSize: 26,
                        fontWeight: FontWeight.bold,
                        height: 1.0,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      'PTS',
                      style: GoogleFonts.outfit(
                        color: isDark ? Colors.amber.shade400 : Colors.amber.shade800,
                        fontSize: 10,
                        fontWeight: FontWeight.bold,
                        letterSpacing: 1,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 24),

        // ── Active Campaigns Header ──────────────────────────────────────
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              'Active Campaigns',
              style: GoogleFonts.outfit(
                color: isDark ? Colors.white : const Color(0xFF0F172A),
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            GestureDetector(
              onTap: () => setState(() => _mainSectionTab = 1),
              child: const Text(
                'View All',
                style: TextStyle(
                  color: Color(0xFF006D36),
                  fontWeight: FontWeight.bold,
                  fontSize: 13,
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: 14),

        // ── Active Campaign Card ─────────────────────────────────────────
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: isDark ? const Color(0xFF1E262E) : Colors.white,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: isDark ? Colors.grey.shade800 : Colors.grey.shade200),
            boxShadow: isDark
                ? []
                : [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.04),
                      blurRadius: 10,
                      offset: const Offset(0, 4),
                    ),
                  ],
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Top title + PTS
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      const Icon(Icons.eco, color: Color(0xFF006D36), size: 20),
                      const SizedBox(width: 6),
                      Text(
                        'Tree Plantation 2026',
                        style: GoogleFonts.outfit(
                          color: isDark ? Colors.white : const Color(0xFF0F172A),
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: isDark ? const Color(0xFF064E3B) : const Color(0xFFDCFCE7),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Text(
                      '+50 PTS',
                      style: TextStyle(
                        color: isDark ? const Color(0xFF34D399) : const Color(0xFF15803D),
                        fontWeight: FontWeight.bold,
                        fontSize: 11,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 14),
              // Center Graphic Box
              Container(
                height: 110,
                width: double.infinity,
                decoration: BoxDecoration(
                  color: isDark ? const Color(0xFF062D1B) : const Color(0xFFF0FDF4),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: const Center(
                  child: Icon(Icons.eco, color: Color(0xFF006D36), size: 54),
                ),
              ),
              const SizedBox(height: 14),
              Text(
                'Join the local cyber-arborists this weekend. Scan the QR code at the site to verify participation and claim your environmental badge.',
                style: TextStyle(
                  color: isDark ? Colors.grey.shade300 : const Color(0xFF334155),
                  fontSize: 12,
                  height: 1.4,
                ),
              ),
              const SizedBox(height: 14),
              // Progress bar
              ClipRRect(
                borderRadius: BorderRadius.circular(6),
                child: LinearProgressIndicator(
                  value: 0.85,
                  backgroundColor: isDark ? const Color(0xFF0F172A) : const Color(0xFFE2E8F0),
                  valueColor: const AlwaysStoppedAnimation<Color>(Color(0xFF006D36)),
                  minHeight: 6,
                ),
              ),
              const SizedBox(height: 6),
              Align(
                alignment: Alignment.centerRight,
                child: Text(
                  '85% FUNDED',
                  style: TextStyle(
                    color: isDark ? Colors.grey.shade400 : const Color(0xFF64748B),
                    fontSize: 10,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
              const SizedBox(height: 14),
              SizedBox(
                width: double.infinity,
                height: 48,
                child: ElevatedButton(
                  onPressed: () {
                    if (provider.socialWorkCampaigns.isNotEmpty) {
                      _showParticipateModal(context, provider.socialWorkCampaigns.first, provider);
                    }
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF006D36),
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                  child: const Text(
                    'CLAIM BADGE',
                    style: TextStyle(
                      fontWeight: FontWeight.bold,
                      fontSize: 14,
                      letterSpacing: 1,
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildSmartCoverImage(String? src) {
    if (src == null || src.trim().isEmpty) return const SizedBox.shrink();
    final trimmed = src.trim();

    if (trimmed.startsWith('data:image') || trimmed.contains('base64,')) {
      try {
        final base64String = trimmed.contains('base64,') ? trimmed.split('base64,').last : trimmed;
        final bytes = base64Decode(base64String);
        return Image.memory(
          bytes,
          height: 160,
          width: double.infinity,
          fit: BoxFit.cover,
          errorBuilder: (_, __, ___) => const SizedBox.shrink(),
        );
      } catch (e) {
        return const SizedBox.shrink();
      }
    }

    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      return Image.network(
        trimmed,
        height: 160,
        width: double.infinity,
        fit: BoxFit.cover,
        errorBuilder: (_, __, ___) => const SizedBox.shrink(),
      );
    }

    return const SizedBox.shrink();
  }

  // ─── SOCIAL WORK CAMPAIGNS LIST VIEW ─────────────────────
  Widget _buildCampaignsList(PoraverseProvider provider, bool isDark) {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: isDark ? const Color(0xFF1E262E) : Colors.white,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: const Color(0xFF006D36).withValues(alpha: 0.3)),
            boxShadow: isDark ? [] : [BoxShadow(color: Colors.black.withValues(alpha: 0.04), blurRadius: 8)],
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('সামাজিক কাজ ও পরিবেশগত ক্যাম্পেইন 🌿', style: GoogleFonts.outfit(fontWeight: FontWeight.bold, fontSize: 16, color: isDark ? Colors.white : const Color(0xFF0F172A))),
              const SizedBox(height: 4),
              Text('আপনিও অংশগ্রহণ করুন এবং সমাজের ইতিবাচক পরিবর্তনের অংশ হোন।', style: TextStyle(color: isDark ? Colors.grey.shade400 : const Color(0xFF475569), fontSize: 12)),
            ],
          ),
        ),
        const SizedBox(height: 16),
        ...provider.socialWorkCampaigns.map((campaign) {
          return Container(
            margin: const EdgeInsets.only(bottom: 16),
            decoration: BoxDecoration(
              color: isDark ? const Color(0xFF1E262E) : Colors.white,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: isDark ? Colors.grey.shade800 : Colors.grey.shade200),
              boxShadow: isDark ? [] : [BoxShadow(color: Colors.black.withValues(alpha: 0.04), blurRadius: 8, offset: const Offset(0, 3))],
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                if (campaign.coverImageUrl != null && campaign.coverImageUrl!.isNotEmpty)
                  ClipRRect(
                    borderRadius: const BorderRadius.vertical(top: Radius.circular(16)),
                    child: _buildSmartCoverImage(campaign.coverImageUrl),
                  ),
                Padding(
                  padding: const EdgeInsets.all(14),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                            decoration: BoxDecoration(color: isDark ? const Color(0xFF064E3B) : const Color(0xFFDCFCE7), borderRadius: BorderRadius.circular(6)),
                            child: Text(campaign.category, style: TextStyle(color: isDark ? const Color(0xFF34D399) : const Color(0xFF15803D), fontSize: 11, fontWeight: FontWeight.bold)),
                          ),
                          const Spacer(),
                          Text('🎯 +100 PTS', style: GoogleFonts.outfit(color: isDark ? Colors.amber.shade400 : Colors.amber.shade800, fontWeight: FontWeight.bold, fontSize: 12)),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Text(campaign.title, style: GoogleFonts.outfit(fontWeight: FontWeight.bold, fontSize: 16, color: isDark ? Colors.white : const Color(0xFF0F172A))),
                      const SizedBox(height: 4),
                      Text(campaign.guidelineText, style: TextStyle(color: isDark ? Colors.grey.shade400 : const Color(0xFF475569), fontSize: 12, height: 1.4), maxLines: 2, overflow: TextOverflow.ellipsis),
                      const SizedBox(height: 12),
                      Row(
                        children: [
                          Expanded(
                            child: OutlinedButton.icon(
                              onPressed: () => setState(() => _selectedCampaign = campaign),
                              icon: const Icon(Icons.remove_red_eye_outlined, size: 16),
                              label: const Text('পোস্টসমূহ দেখুন', style: TextStyle(fontSize: 12)),
                              style: OutlinedButton.styleFrom(
                                foregroundColor: const Color(0xFF006D36),
                                side: const BorderSide(color: Color(0xFF006D36)),
                              ),
                            ),
                          ),
                          const SizedBox(width: 10),
                          Expanded(
                            child: ElevatedButton.icon(
                              onPressed: () => _showParticipateModal(context, campaign, provider),
                              icon: const Icon(Icons.add_a_photo, size: 16),
                              label: const Text('অংশগ্রহণ করুন', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                              style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF006D36), foregroundColor: Colors.white),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ],
            ),
          );
        }),
      ],
    );
  }

  // ─── CAMPAIGN DETAIL & POSTS VIEW ──────────────────────
  Widget _buildCampaignDetailView(SocialWorkCampaignModel campaign, PoraverseProvider provider, bool isDark) {
    final campaignPosts = provider.socialWorkPosts.where((p) => p.campaignId == campaign.id).toList();

    return Column(
      children: [
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
          color: isDark ? const Color(0xFF1E262E) : Colors.white,
          child: Row(
            children: [
              IconButton(
                onPressed: () => setState(() => _selectedCampaign = null),
                icon: Icon(Icons.arrow_back, color: isDark ? Colors.white : const Color(0xFF0F172A)),
              ),
              Expanded(
                child: Text(
                  campaign.title,
                  style: GoogleFonts.outfit(fontWeight: FontWeight.bold, fontSize: 16, color: isDark ? Colors.white : const Color(0xFF0F172A)),
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              ElevatedButton.icon(
                onPressed: () => _showParticipateModal(context, campaign, provider),
                icon: const Icon(Icons.add, size: 16),
                label: const Text('পোস্ট করুন', style: TextStyle(fontSize: 11)),
                style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF006D36), foregroundColor: Colors.white),
              ),
            ],
          ),
        ),
        Expanded(
          child: campaignPosts.isEmpty
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.photo_library_outlined, size: 48, color: Colors.grey.shade600),
                      const SizedBox(height: 12),
                      Text('এখনো কোনো পোস্ট করা হয়নি', style: TextStyle(color: Colors.grey.shade400, fontSize: 14)),
                      const SizedBox(height: 12),
                      ElevatedButton(
                        onPressed: () => _showParticipateModal(context, campaign, provider),
                        style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF047857), foregroundColor: Colors.white),
                        child: const Text('প্রথম পোস্ট করুন'),
                      ),
                    ],
                  ),
                )
              : ListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount: campaignPosts.length,
                  itemBuilder: (context, index) {
                    final post = campaignPosts[index];
                    return _buildSocialPostCard(post, provider);
                  },
                ),
        ),
      ],
    );
  }

  Widget _buildSocialPostCard(SocialWorkPostModel post, PoraverseProvider provider) {
    final commentCtrl = TextEditingController();
    final isLiked = post.likedUserIds.contains(provider.currentUser.id);

    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: const Color(0xFF1E262E),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.grey.shade800),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              CircleAvatar(
                radius: 18,
                backgroundColor: const Color(0xFF047857),
                backgroundImage: post.userAvatar != null ? NetworkImage(post.userAvatar!) : null,
                child: post.userAvatar == null ? Text(post.userName[0], style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)) : null,
              ),
              const SizedBox(width: 10),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(post.userName, style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: Colors.white)),
                  Text(post.createdAt, style: TextStyle(fontSize: 10, color: Colors.grey.shade400)),
                ],
              ),
            ],
          ),
          const SizedBox(height: 10),
          Text(post.caption, style: TextStyle(fontSize: 13, color: Colors.grey.shade200, height: 1.4)),
          if (post.imageUrls.isNotEmpty) ...[
            const SizedBox(height: 10),
            ClipRRect(
              borderRadius: BorderRadius.circular(12),
              child: Image.network(
                post.imageUrls.first,
                height: 200,
                width: double.infinity,
                fit: BoxFit.cover,
                errorBuilder: (_, __, ___) => const SizedBox.shrink(),
              ),
            ),
          ],
          const SizedBox(height: 10),
          Divider(height: 1, color: Colors.grey.shade800),
          Padding(
            padding: const EdgeInsets.symmetric(vertical: 4),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                TextButton.icon(
                  onPressed: () => provider.toggleLikeSocialWorkPost(post.id),
                  icon: Icon(isLiked ? Icons.favorite : Icons.favorite_border, color: isLiked ? Colors.red : Colors.grey.shade400, size: 18),
                  label: Text('${post.likesCount}', style: TextStyle(color: isLiked ? Colors.red : Colors.grey.shade400, fontSize: 12)),
                ),
                TextButton.icon(
                  onPressed: () {},
                  icon: Icon(Icons.mode_comment_outlined, color: Colors.grey.shade400, size: 18),
                  label: Text('${post.commentsCount}', style: TextStyle(color: Colors.grey.shade400, fontSize: 12)),
                ),
                TextButton.icon(
                  onPressed: () {
                    ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('পোস্টটি শেয়ার করা হয়েছে!')));
                  },
                  icon: Icon(Icons.share_outlined, color: Colors.grey.shade400, size: 18),
                  label: Text('${post.sharesCount}', style: TextStyle(color: Colors.grey.shade400, fontSize: 12)),
                ),
              ],
            ),
          ),
          Divider(height: 1, color: Colors.grey.shade800),
          const SizedBox(height: 8),
          Row(
            children: [
              Expanded(
                child: TextField(
                  controller: commentCtrl,
                  style: const TextStyle(fontSize: 12, color: Colors.white),
                  decoration: InputDecoration(
                    hintText: 'একটি মন্তব্য লিখুন...',
                    hintStyle: TextStyle(fontSize: 11, color: Colors.grey.shade500),
                    filled: true,
                    fillColor: const Color(0xFF0F172A),
                    contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(20), borderSide: BorderSide(color: Colors.grey.shade800)),
                  ),
                ),
              ),
              const SizedBox(width: 8),
              IconButton(
                onPressed: () {
                  if (commentCtrl.text.trim().isNotEmpty) {
                    provider.addCommentSocialWorkPost(post.id, commentCtrl.text.trim());
                    commentCtrl.clear();
                  }
                },
                icon: const Icon(Icons.send, color: Color(0xFF10B981), size: 20),
              ),
            ],
          ),
        ],
      ),
    );
  }

  void _showParticipateModal(BuildContext context, SocialWorkCampaignModel campaign, PoraverseProvider provider) {
    final captionCtrl = TextEditingController();
    bool isPosting = false;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => StatefulBuilder(
        builder: (context, setModalState) => Container(
          decoration: const BoxDecoration(
            color: Color(0xFF1E262E),
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
                  Text('অংশগ্রহণ করুন (Social Hero)', style: GoogleFonts.outfit(fontWeight: FontWeight.bold, fontSize: 16, color: Colors.white)),
                  IconButton(onPressed: () => Navigator.pop(ctx), icon: const Icon(Icons.close, color: Colors.grey)),
                ],
              ),
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(color: const Color(0xFF064E3B), borderRadius: BorderRadius.circular(10)),
                child: Text('📌 নির্দেশনাবলী:\n${campaign.guidelineText}', style: const TextStyle(fontSize: 11, color: Color(0xFF34D399), height: 1.3)),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: captionCtrl,
                maxLines: 3,
                style: const TextStyle(fontSize: 13, color: Colors.white),
                decoration: InputDecoration(
                  hintText: 'আপনার অভিজ্ঞতা বা পোস্টের বিস্তারিত লিখুন...',
                  hintStyle: TextStyle(fontSize: 11, color: Colors.grey.shade500),
                  filled: true,
                  fillColor: const Color(0xFF0F172A),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                ),
              ),
              const SizedBox(height: 12),
              Row(
                children: [
                  OutlinedButton.icon(
                    onPressed: () {},
                    icon: const Icon(Icons.image, size: 16),
                    label: const Text('ছবি যুক্ত করুন', style: TextStyle(fontSize: 11)),
                  ),
                  const SizedBox(width: 8),
                  OutlinedButton.icon(
                    onPressed: () {},
                    icon: const Icon(Icons.videocam, size: 16),
                    label: const Text('ভিডিও যুক্ত করুন', style: TextStyle(fontSize: 11)),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              SizedBox(
                width: double.infinity,
                height: 48,
                child: ElevatedButton(
                  onPressed: isPosting
                      ? null
                      : () {
                          if (captionCtrl.text.trim().isEmpty) return;
                          setModalState(() => isPosting = true);
                          provider.addSocialWorkPost(SocialWorkPostModel(
                            id: 'swp-${DateTime.now().millisecondsSinceEpoch}',
                            campaignId: campaign.id,
                            userId: provider.currentUser.id,
                            userName: provider.currentUser.name,
                            userAvatar: provider.currentUser.profileImageUrl,
                            caption: captionCtrl.text.trim(),
                            imageUrls: [campaign.coverImageUrl ?? 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800'],
                            createdAt: DateTime.now().toString().split(' ')[0],
                          ));
                          Navigator.pop(ctx);
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(content: Text('🎉 অভিনন্দন! সামাজিক উদ্যোগে আপনার পোস্ট সফলভাবে প্রকাশিত হয়েছে।'), backgroundColor: Colors.green),
                          );
                        },
                  style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF047857), foregroundColor: Colors.white),
                  child: isPosting
                      ? const SizedBox(width: 24, height: 24, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                      : const Text('পোস্ট সাবমিট করুন', style: TextStyle(fontWeight: FontWeight.bold)),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
