// Poraverse Admin Web Portal Client

async function fetchWithFallback(endpoint, options = {}) {
  options.headers = options.headers || {};
  if (state && state.accessToken && !options.headers['Authorization'] && !options.headers['authorization']) {
    options.headers['Authorization'] = `Bearer ${state.accessToken}`;
  }

  const apiBase = (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1')
    ? (window.location.hostname.includes('poraverse-backend-2.onrender.com') ? '' : 'https://poraverse-backend-2.onrender.com')
    : 'http://localhost:8080';

  try {
    const res = await fetch(`${apiBase}${endpoint}`, options);
    if (res.status === 401 && !endpoint.includes('/auth/admin/login') && !endpoint.includes('/auth/admin/verify-2fa')) {
      console.warn('Session expired or unauthorized request to:', endpoint);
      if (state && state.accessToken) {
        state.accessToken = null;
        localStorage.removeItem('admin_access_token');
        localStorage.removeItem('admin_refresh_token');
        showToast('সেশনের মেয়াদ শেষ হয়ে গেছে। অনুগ্রহ করে পুনরায় লগইন করুন।', 'warning');
        const dash = document.getElementById('dashboardContainer');
        const auth = document.getElementById('authContainer');
        const f1 = document.getElementById('step1Form');
        const f2 = document.getElementById('step2Form');
        if (dash) dash.classList.add('hidden');
        if (auth) auth.classList.remove('hidden');
        if (f1) f1.classList.remove('hidden');
        if (f2) f2.classList.add('hidden');
      }
    }
    return res;
  } catch (e) {
    if (apiBase !== 'https://poraverse-backend-2.onrender.com') {
      return await fetch(`https://poraverse-backend-2.onrender.com${endpoint}`, options);
    }
    throw e;
  }
}

let state = {
  tempToken: null,
  accessToken: localStorage.getItem('admin_access_token') || null,
  refreshToken: localStorage.getItem('admin_refresh_token') || null,
  adminUser: null,
};

// Init application
function initApp() {
  setupEventListeners();
  if (state.accessToken) {
    checkSession();
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}

function showToast(message, type = 'success') {
  const container = document.getElementById('toastContainer');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 4000);
}

window.handleStep1Login = async function(e) {
  if (e) e.preventDefault();
  const f1 = document.getElementById('step1Form');
  const btnSubmit = document.getElementById('btnStep1') || (f1 ? f1.querySelector('button[type="submit"]') : null);
  const originalText = btnSubmit ? btnSubmit.innerHTML : '<span>Validate Credentials & Proceed</span> →';
  if (btnSubmit) {
    btnSubmit.disabled = true;
    btnSubmit.innerHTML = '⏳ Validating Credentials...';
  }

  const emailInput = document.getElementById('adminEmail') || document.getElementById('adminPhone');
  const passwordInput = document.getElementById('adminPassword');
  const email = emailInput ? emailInput.value.trim() : '';
  const password = passwordInput ? passwordInput.value.trim() : '';

  if (!email || !password) {
    alert('Please enter both Email and Password!');
    if (btnSubmit) {
      btnSubmit.disabled = false;
      btnSubmit.innerHTML = originalText;
    }
    return;
  }

  try {
    const res = await fetchWithFallback('/auth/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Login failed');

    if (data.requires2FA) {
      state.tempToken = data.tempToken;
      const step1El = document.getElementById('step1Form');
      const step2El = document.getElementById('step2Form');
      if (step1El) step1El.classList.add('hidden');
      if (step2El) step2El.classList.remove('hidden');
      showToast('Credentials verified! Enter your 6-digit TOTP code.', 'info');
    } else if (data.accessToken) {
      state.accessToken = data.accessToken;
      state.refreshToken = data.refreshToken;
      state.adminUser = data.user;

      localStorage.setItem('admin_access_token', data.accessToken);
      localStorage.setItem('admin_refresh_token', data.refreshToken);

      showToast('Authentication Successful! Welcome Admin.', 'success');
      showDashboard();
    } else {
      throw new Error('Invalid authentication response from server.');
    }
  } catch (err) {
    showToast(err.message, 'error');
    alert('Login Error: ' + err.message);
  } finally {
    if (btnSubmit) {
      btnSubmit.disabled = false;
      btnSubmit.innerHTML = originalText;
    }
  }
};

window.handleStep2Login = async function(e) {
  if (e) e.preventDefault();
  const f2 = document.getElementById('step2Form');
  const btnSubmit = document.getElementById('btnStep2') || (f2 ? f2.querySelector('button[type="submit"]') : null);
  const originalText = btnSubmit ? btnSubmit.innerHTML : 'Verify & Enter Portal →';
  if (btnSubmit) {
    btnSubmit.disabled = true;
    btnSubmit.innerHTML = '⏳ Verifying 2FA...';
  }

  const totpInput = document.getElementById('totpCode');
  const totpCode = totpInput ? totpInput.value.trim() : '';

  if (!totpCode) {
    alert('Please enter your 6-digit TOTP code!');
    if (btnSubmit) {
      btnSubmit.disabled = false;
      btnSubmit.innerHTML = originalText;
    }
    return;
  }

  try {
    const res = await fetchWithFallback('/auth/admin/verify-2fa', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tempToken: state.tempToken, totpCode }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || '2FA Verification failed');

    state.accessToken = data.accessToken;
    state.refreshToken = data.refreshToken;
    state.adminUser = data.user;

    localStorage.setItem('admin_access_token', data.accessToken);
    localStorage.setItem('admin_refresh_token', data.refreshToken);

    showToast('2FA Authentication Successful! Welcome Admin.', 'success');
    showDashboard();
  } catch (err) {
    showToast(err.message, 'error');
    alert('2FA Verification Error: ' + err.message);
  } finally {
    if (btnSubmit) {
      btnSubmit.disabled = false;
      btnSubmit.innerHTML = originalText;
    }
  }
};

window.backToStep1 = function() {
  const f1 = document.getElementById('step1Form');
  const f2 = document.getElementById('step2Form');
  if (f2) f2.classList.add('hidden');
  if (f1) f1.classList.remove('hidden');
};

window.logoutAdmin = function() {
  localStorage.removeItem('admin_access_token');
  localStorage.removeItem('admin_refresh_token');
  state.accessToken = null;
  state.refreshToken = null;
  const dashboardContainer = document.getElementById('dashboardContainer');
  const authContainer = document.getElementById('authContainer');
  if (dashboardContainer) dashboardContainer.classList.add('hidden');
  if (authContainer) authContainer.classList.remove('hidden');
  showToast('Logged out successfully.', 'info');
};

window.closeQRModal = function() {
  const qrModal = document.getElementById('qrModal');
  if (qrModal) qrModal.classList.add('hidden');
};

function setupEventListeners() {
  const f1 = document.getElementById('step1Form');
  if (f1) f1.addEventListener('submit', handleStep1Login);

  const f2 = document.getElementById('step2Form');
  if (f2) f2.addEventListener('submit', handleStep2Login);

  const btnBack = document.getElementById('btnBackToStep1');
  if (btnBack) btnBack.addEventListener('click', backToStep1);

  const btnLog = document.getElementById('btnLogout');
  if (btnLog) btnLog.addEventListener('click', logoutAdmin);

  const btn2FA = document.getElementById('btnSetup2FA');
  if (btn2FA) btn2FA.addEventListener('click', setup2FA);

  const btnGetStep2QR = document.getElementById('btnGetStep2QR');
  if (btnGetStep2QR) btnGetStep2QR.addEventListener('click', setup2FAStep2);

  const btnCloseQR = document.getElementById('btnCloseQRModal');
  if (btnCloseQR) btnCloseQR.addEventListener('click', closeQRModal);

  const btnRefReports = document.getElementById('btnRefreshReports');
  if (btnRefReports) btnRefReports.addEventListener('click', loadModerationQueue);

  const btnRefOrders = document.getElementById('btnRefreshOrders');
  if (btnRefOrders) btnRefOrders.addEventListener('click', loadBundleOrders);

  const btnUpdRole = document.getElementById('btnUpdateRole');
  if (btnUpdRole) btnUpdRole.addEventListener('click', updateRole);

  const btnAddPubModal = document.getElementById('btnAddPublisherModal');
  if (btnAddPubModal) btnAddPubModal.addEventListener('click', openPublisherModal);

  const btnAddCampModal = document.getElementById('btnAddCampaignModal');
  if (btnAddCampModal) btnAddCampModal.addEventListener('click', createCampaignPrompt);

  document.querySelectorAll('.nav-tab').forEach((tab) => {
    tab.addEventListener('click', () => {
      if (tab.dataset.tab) switchTab(tab.dataset.tab);
    });
  });
}

window.handlePublisherLogoFileSelect = function(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(evt) {
    document.getElementById('pubLogoInput').value = evt.target.result;
    showToast('ডিভাইস থেকে লোগো ফটো লোড হয়েছে!', 'success');
  };
  reader.readAsDataURL(file);
};

window.handleBookImageFileSelect = function(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(evt) {
    document.getElementById('bookImageInput').value = evt.target.result;
    showToast('ডিভাইস থেকে কভার ফটো লোড হয়েছে!', 'success');
  };
  reader.readAsDataURL(file);
};

window.handleCampaignCoverFileSelect = function(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(evt) {
    document.getElementById('campaignCoverInput').value = evt.target.result;
    showToast('ডিভাইস থেকে কভার ফটো লোড হয়েছে!', 'success');
  };
  reader.readAsDataURL(file);
};

window.handleAddPublisherSubmit = async function(e) {
  if (e) e.preventDefault();
  const name = document.getElementById('pubNameInput').value.trim();
  const logoUrl = document.getElementById('pubLogoInput').value.trim();
  const description = document.getElementById('pubDescInput').value.trim();

  if (!name) return showToast('প্রকাশনীর নাম লিখুন!', 'error');

  const btnSubmit = document.querySelector('#formAddPublisher button[type="submit"]');
  const originalText = btnSubmit ? btnSubmit.innerHTML : 'Save Publisher';
  if (btnSubmit) {
    btnSubmit.disabled = true;
    btnSubmit.innerHTML = '⏳ Saving Publisher...';
  }

  try {
    const res = await fetchWithFallback('/admin/publications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${state.accessToken}`,
      },
      body: JSON.stringify({ name, logoUrl, description: description || 'Educational Publisher' }),
    });
    const responseData = await res.json();
    if (!res.ok) throw new Error(responseData.message || 'Failed to create publisher');

    showToast('প্রকাশনী সফলভাবে যোগ করা হয়েছে!', 'success');
    closePublisherModal();
    loadCatalog();
  } catch (err) {
    showToast(err.message, 'error');
    alert('Publisher Save Error: ' + err.message);
  } finally {
    if (btnSubmit) {
      btnSubmit.disabled = false;
      btnSubmit.innerHTML = originalText;
    }
  }
};

window.handleAddBookSubmit = async function(e) {
  if (e) e.preventDefault();
  const pubId = document.getElementById('bookTargetPubId').value;
  const title = document.getElementById('bookTitleInput').value.trim();
  const writer = document.getElementById('bookWriterInput').value.trim();
  const subject = document.getElementById('bookSubjectInput').value.trim();
  const className = document.getElementById('bookClassInput').value.trim();
  const price = parseFloat(document.getElementById('bookPriceInput').value);
  const imageUrl = document.getElementById('bookImageInput').value.trim();

  if (!pubId || !title || isNaN(price)) return showToast('বইয়ের সঠিক তথ্য ও মূল্য প্রদান করুন!', 'error');

  const btnSubmit = document.querySelector('#formAddBook button[type="submit"]');
  const originalText = btnSubmit ? btnSubmit.innerHTML : 'Add Book';
  if (btnSubmit) {
    btnSubmit.disabled = true;
    btnSubmit.innerHTML = '⏳ Saving Book...';
  }

  try {
    const res = await fetchWithFallback(`/admin/publications/${pubId}/items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${state.accessToken}`,
      },
      body: JSON.stringify({
        title,
        price,
        writer,
        subject,
        className,
        imageUrl,
        category: subject || 'Guide Book',
      }),
    });
    const responseData = await res.json();
    if (!res.ok) throw new Error(responseData.message || 'Failed to add book');

    showToast('বই সফলভাবে প্রকাশনীতে যোগ করা হয়েছে!', 'success');
    closeBookModal();
    loadCatalog();
  } catch (err) {
    showToast(err.message, 'error');
    alert('Book Save Error: ' + err.message);
  } finally {
    if (btnSubmit) {
      btnSubmit.disabled = false;
      btnSubmit.innerHTML = originalText;
    }
  }
};

function switchTab(tabName) {
  document.querySelectorAll('.nav-tab').forEach((t) => {
    if (t.dataset.tab === tabName) t.classList.add('active');
    else t.classList.remove('active');
  });

  document.querySelectorAll('.tab-content').forEach((c) => {
    c.classList.add('hidden');
    c.classList.remove('active');
  });

  const targetId = `tab-${tabName}`;
  const targetEl = document.getElementById(targetId);
  if (targetEl) {
    targetEl.classList.remove('hidden');
    targetEl.classList.add('active');
  }

  loadTabData(tabName);
}

async function checkSession() {
  try {
    const res = await fetchWithFallback('/auth/me', {
      headers: { Authorization: `Bearer ${state.accessToken}` },
    });
    const user = await res.json();
    if (res.ok && (user.role === 'admin' || user.role === 'moderator')) {
      state.adminUser = user;
      showDashboard();
    } else {
      throw new Error('Unauthorized');
    }
  } catch (e) {
    localStorage.removeItem('admin_access_token');
    state.accessToken = null;
  }
}

function showDashboard() {
  authContainer.classList.add('hidden');
  dashboardContainer.classList.remove('hidden');
  document.getElementById('navAdminName').textContent = state.adminUser?.name || 'Poraverse Admin';
  loadModerationQueue();
}

async function setup2FA() {
  try {
    const res = await fetchWithFallback('/auth/admin/setup-2fa', {
      method: 'POST',
      headers: { Authorization: `Bearer ${state.accessToken}` },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Setup failed');

    document.getElementById('qrCodeContainer').innerHTML = `<img src="${data.qrCodeUrl}" alt="2FA QR Code">`;
    document.getElementById('manualSecret').textContent = data.secret;
    qrModal.classList.remove('hidden');
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function setup2FAStep2() {
  if (!state.tempToken) {
    showToast('Please complete Step 1 credential validation first!', 'warning');
    return;
  }
  try {
    const res = await fetchWithFallback('/auth/admin/setup-2fa', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tempToken: state.tempToken }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Setup failed');

    document.getElementById('qrCodeContainer').innerHTML = `<img src="${data.qrCodeUrl}" alt="2FA QR Code">`;
    document.getElementById('manualSecret').textContent = data.secret;
    qrModal.classList.remove('hidden');
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// ─── DATA LOADERS ─────────────────────────────────────────

function safeArray(data) {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.items)) return data.items;
  if (data && Array.isArray(data.data)) return data.data;
  return [];
}

async function loadTabData(tabName) {
  if (tabName === 'moderation') loadModerationQueue();
  else if (tabName === 'catalog') loadCatalog();
  else if (tabName === 'orders') loadBundleOrders();
  else if (tabName === 'social') loadSocialCampaigns();
}

async function loadModerationQueue() {
  const container = document.getElementById('reportsList');
  container.innerHTML = '<div class="empty-state">Loading moderation queue...</div>';
  try {
    const res = await fetchWithFallback('/admin/reports', {
      headers: { Authorization: `Bearer ${state.accessToken}` },
    });
    const responseData = await res.json();
    if (!res.ok) throw new Error(responseData.message || 'Failed to load reports');

    const reports = safeArray(responseData);

    if (!reports || reports.length === 0) {
      container.innerHTML = '<div class="empty-state">No pending reports! Content is clean.</div>';
      return;
    }

    container.innerHTML = reports.map((r) => {
      let mediaHtml = '';
      if (r.mediaUrl && r.mediaUrl.trim() !== '') {
        const media = r.mediaUrl.trim();
        const lower = media.toLowerCase();

        if (lower.startsWith('data:application/pdf') || lower.endsWith('.pdf') || lower.includes('pdf')) {
          mediaHtml = `
            <div style="margin-top: 10px; padding: 12px; background: rgba(239, 68, 68, 0.12); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 8px; display: flex; align-items: center; justify-content: space-between; gap: 10px;">
              <div style="display: flex; align-items: center; gap: 10px; overflow: hidden;">
                <span style="font-size: 26px;">📄</span>
                <div>
                  <div style="font-size: 13px; font-weight: bold; color: #f87171;">Attached PDF Document</div>
                  <div style="font-size: 11px; color: var(--text-muted);">PDF file attached with post</div>
                </div>
              </div>
              <a href="${media}" download="attached_document.pdf" target="_blank" class="btn btn-secondary btn-sm" style="font-size: 12px; padding: 6px 12px; font-weight: bold; text-decoration: none; background: #ff4d4d; color: white;">📄 Open / Download PDF</a>
            </div>
          `;
        } else if (lower.startsWith('data:video') || lower.endsWith('.mp4') || lower.endsWith('.webm') || lower.endsWith('.mov') || lower.includes('video')) {
          mediaHtml = `
            <div style="margin-top: 10px;">
              <div style="font-size: 11px; font-weight: bold; color: var(--text-muted); margin-bottom: 4px;">🎬 Attached Video Preview:</div>
              <video src="${media}" controls style="width: 100%; max-height: 280px; border-radius: 8px; background: #000;"></video>
            </div>
          `;
        } else {
          // Photo / Image
          mediaHtml = `
            <div style="margin-top: 10px;">
              <div style="font-size: 11px; font-weight: bold; color: var(--text-muted); margin-bottom: 4px;">🖼️ Attached Photo Preview:</div>
              <img src="${media}" alt="Photo Attachment" style="width: 100%; max-height: 320px; object-fit: contain; border-radius: 8px; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.15);">
            </div>
          `;
        }
      }

      return `
      <div class="data-card" style="border: 1px solid rgba(255, 77, 77, 0.3); background: rgba(20, 25, 35, 0.7); margin-bottom: 16px; padding: 16px; border-radius: 12px;">
        <div class="data-card-header" style="display: flex; justify-content: space-between; margin-bottom: 10px;">
          <span class="data-tag data-tag-red" style="background: rgba(255, 77, 77, 0.15); color: #ff4d4d; padding: 4px 10px; border-radius: 6px; font-weight: bold; font-size: 11px;">FLAGGED ${r.contentType ? r.contentType.toUpperCase() : 'POST'}</span>
          <span style="font-size: 11px; color: var(--text-muted);">${r.createdAt ? r.createdAt.split('T')[0] : ''}</span>
        </div>
        
        <div style="font-size: 15px; font-weight: 700; color: #fff; margin-bottom: 6px;">📌 ${r.contentTitle || 'Reported Post'}</div>
        ${r.contentBody ? `<div style="font-size: 13px; color: #d0d7de; background: rgba(255,255,255,0.05); padding: 10px; border-radius: 8px; margin-bottom: 10px; line-height: 1.4;">"${r.contentBody}"</div>` : ''}
        ${mediaHtml}

        <div style="margin-top: 12px; padding-top: 10px; border-top: 1px solid rgba(255,255,255,0.08); font-size: 12px;">
          <div style="color: var(--text-muted);">👤 <strong>Reporter:</strong> ${r.reporterName || r.reporterId || 'User'}</div>
          <div style="color: #ff4d4d; font-weight: 600; margin-top: 4px;">🚩 <strong>Reason:</strong> ${r.reason}</div>
          ${r.details ? `<div style="color: var(--text-muted); font-size: 11px; margin-top: 2px;">Details: ${r.details}</div>` : ''}
        </div>

        <div style="display: flex; gap: 10px; margin-top: 14px;">
          <button class="btn btn-secondary btn-sm flex-grow" onclick="resolveReport('${r.id}', 'dismissed')">Dismiss Report</button>
          <button class="btn btn-danger btn-sm flex-grow" style="background: #ff4d4d; color: white; font-weight: 700;" onclick="resolveReport('${r.id}', 'content_removed')">🗑️ Remove Post Permanently</button>
        </div>
      </div>
    `;
    }).join('');
  } catch (err) {
    container.innerHTML = `<div class="empty-state" style="color: var(--danger);">Failed: ${err.message}</div>`;
  }
}

async function resolveReport(reportId, action) {
  try {
    const res = await fetchWithFallback(`/admin/reports/${reportId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${state.accessToken}`,
      },
      body: JSON.stringify({ action, notes: `Action ${action} taken by admin` }),
    });
    if (!res.ok) throw new Error('Action failed');
    showToast(`Report ${action} successfully!`, 'success');
    loadModerationQueue();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

function openPublisherModal() {
  document.getElementById('modalAddPublisher').classList.remove('hidden');
}

function closePublisherModal() {
  document.getElementById('modalAddPublisher').classList.add('hidden');
  document.getElementById('formAddPublisher').reset();
}

function openBookModal(pubId) {
  document.getElementById('bookTargetPubId').value = pubId;
  document.getElementById('modalAddBook').classList.remove('hidden');
}

function closeBookModal() {
  document.getElementById('modalAddBook').classList.add('hidden');
  document.getElementById('formAddBook').reset();
}

window.stateCatalogItems = {};

async function loadCatalog() {
  const container = document.getElementById('publishersList');
  container.innerHTML = '<div class="empty-state">Loading publisher catalog...</div>';
  try {
    let res = await fetchWithFallback('/publications');
    if (!res.ok) {
      res = await fetchWithFallback('/admin/publications', {
        headers: { Authorization: `Bearer ${state.accessToken}` },
      });
    }
    const responseData = await res.json();
    if (!res.ok) throw new Error(responseData.message || 'Failed to load catalog');

    const pubs = safeArray(responseData);

    if (!pubs || pubs.length === 0) {
      container.innerHTML = '<div class="empty-state">কোনো প্রকাশনী পাওয়া যায়নি। "+ Add Publisher" বাটনে ক্লিক করে প্রকাশনী ও বই যোগ করুন।</div>';
      return;
    }

    stateCatalogItems = {};

    container.innerHTML = pubs.map((p) => {
      const itemsList = safeArray(p.items);
      
      const booksListHtml = (itemsList.length > 0)
        ? itemsList.map((item) => {
            stateCatalogItems[item.id] = { ...item, pubName: p.name };

            const bookCoverHtml = (item.imageUrl && item.imageUrl.trim() !== '')
              ? `<img src="${item.imageUrl.trim()}" alt="Book Cover" style="width: 38px; height: 50px; border-radius: 6px; object-fit: cover; border: 1px solid rgba(255,255,255,0.2);" onerror="this.outerHTML='<span style=\\'font-size:22px;\\'>📖</span>'">`
              : `<span style="font-size: 22px;">📖</span>`;

            return `
              <div onclick="openBookDetailModal('${item.id}')" style="padding: 8px 12px; margin-top: 6px; background: rgba(255,255,255,0.04); border-radius: 8px; display: flex; align-items: center; justify-content: space-between; gap: 10px; font-size: 13px; cursor: pointer; transition: background 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.08)'" onmouseout="this.style.background='rgba(255,255,255,0.04)'">
                <div style="display: flex; align-items: center; gap: 12px; flex: 1; overflow: hidden;">
                  ${bookCoverHtml}
                  <div style="overflow: hidden;">
                    <strong style="color: #fff; display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-size: 14px;">${item.title}</strong>
                    <div style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap; margin-top: 2px;">
                      ${item.writer ? `<span style="color: var(--text-muted); font-size: 11px;">✍️ ${item.writer}</span>` : ''}
                      ${item.subject ? `<span style="background: rgba(0, 200, 150, 0.15); color: #00c896; padding: 2px 6px; border-radius: 4px; font-size: 10px;">${item.subject}</span>` : ''}
                      ${item.className ? `<span style="background: rgba(255, 175, 0, 0.15); color: #ffaf00; padding: 2px 6px; border-radius: 4px; font-size: 10px;">${item.className}</span>` : ''}
                    </div>
                  </div>
                </div>
                <div style="display: flex; align-items: center; gap: 8px;" onclick="event.stopPropagation();">
                  <span style="font-weight: bold; color: #4ade80; font-size: 14px;">৳${item.price}</span>
                  <button class="btn btn-secondary btn-sm" style="padding: 4px 10px; font-size: 11px;" onclick="openBookDetailModal('${item.id}')">🔍 Details</button>
                  <button class="btn btn-danger btn-sm" style="padding: 4px 8px; font-size: 11px;" onclick="deleteBookItem('${item.id}')">🗑️</button>
                </div>
              </div>
            `;
          }).join('')
        : '<div style="font-size: 12px; color: var(--text-muted); margin-top: 8px; font-style: italic; padding: 8px;">কোনো বই যোগ করা হয়নি। "+ Add Book" ক্লিক করে বই যোগ করুন।</div>';

      const pubLogoHtml = (p.logoUrl && p.logoUrl.trim() !== '')
        ? `<img src="${p.logoUrl.trim()}" alt="Logo" style="width: 44px; height: 44px; border-radius: 10px; object-fit: cover; background: #fff; border: 1px solid rgba(255,255,255,0.2);" onerror="this.outerHTML='<span style=\\'font-size:28px;\\'>🏛️</span>'">`
        : `<span style="font-size: 28px;">🏛️</span>`;

      return `
        <div class="data-card" style="border: 1px solid rgba(0, 200, 150, 0.25); background: rgba(18, 22, 32, 0.75); margin-bottom: 16px; padding: 16px; border-radius: 14px;">
          <div class="data-card-header" style="display: flex; justify-content: space-between; align-items: center; cursor: pointer;" onclick="togglePublisherExpand('${p.id}')">
            <div style="display: flex; align-items: center; gap: 12px;">
              ${pubLogoHtml}
              <div>
                <strong style="font-size: 17px; color: #fff; display: block;">${p.name}</strong>
                <div style="font-size: 12px; color: var(--text-muted);">${p.description || 'Educational Publisher'} • <span style="color: #4ade80; font-weight: bold;">${itemsList.length} টি বই</span></div>
              </div>
            </div>
            <div style="display: flex; gap: 8px; align-items: center;" onclick="event.stopPropagation();">
              <button class="btn btn-secondary btn-sm" onclick="openBookModal('${p.id}')">📖 + Add Book</button>
              <button class="btn btn-danger btn-sm" onclick="deletePublisher('${p.id}')">🗑️ Delete</button>
              <button class="btn btn-outline btn-sm" onclick="togglePublisherExpand('${p.id}')" id="btnExp_${p.id}">▼ Expand</button>
            </div>
          </div>
          <div id="pubContent_${p.id}" style="margin-top: 14px; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 10px;">
            <div style="font-size: 11px; font-weight: bold; color: var(--text-muted); margin-bottom: 6px; letter-spacing: 0.5px;">LISTED BOOKS (${itemsList.length}):</div>
            ${booksListHtml}
          </div>
        </div>
      `;
    }).join('');
  } catch (err) {
    container.innerHTML = `<div class="empty-state" style="color: var(--danger);">Failed: ${err.message}</div>`;
  }
}

window.togglePublisherExpand = function(pubId) {
  const content = document.getElementById(`pubContent_${pubId}`);
  const btn = document.getElementById(`btnExp_${pubId}`);
  if (!content) return;
  if (content.style.display === 'none') {
    content.style.display = 'block';
    if (btn) btn.innerHTML = '▲ Collapse';
  } else {
    content.style.display = 'none';
    if (btn) btn.innerHTML = '▼ Expand';
  }
};

window.openBookDetailModal = function(itemId) {
  const item = stateCatalogItems[itemId];
  if (!item) return showToast('বইয়ের তথ্য পাওয়া যায়নি!', 'error');

  const modal = document.getElementById('modalBookDetail');
  const container = document.getElementById('bookDetailContent');
  if (!modal || !container) return;

  const imageHtml = (item.imageUrl && item.imageUrl.trim() !== '')
    ? `<div style="text-align: center; margin-bottom: 14px; background: rgba(0,0,0,0.4); padding: 12px; border-radius: 12px;">
         <img src="${item.imageUrl.trim()}" alt="${item.title}" style="max-height: 280px; max-width: 100%; object-fit: contain; border-radius: 8px; box-shadow: 0 4px 15px rgba(0,0,0,0.5);">
       </div>`
    : `<div style="text-align: center; margin-bottom: 14px; font-size: 64px; padding: 20px; background: rgba(255,255,255,0.05); border-radius: 12px;">📖</div>`;

  container.innerHTML = `
    ${imageHtml}
    <h3 style="color: #fff; margin-bottom: 6px; font-size: 18px;">${item.title}</h3>
    <div style="font-size: 13px; color: var(--text-muted); margin-bottom: 12px;">🏛️ <strong>প্রকাশনী:</strong> ${item.pubName || 'Publisher'}</div>
    
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; background: rgba(255,255,255,0.05); padding: 12px; border-radius: 10px; font-size: 13px; margin-bottom: 14px; text-align: left;">
      <div>✍️ <strong>লেখক:</strong> ${item.writer || 'N/A'}</div>
      <div>📘 <strong>বিষয়:</strong> ${item.subject || 'General'}</div>
      <div>🎓 <strong>শ্রেণী:</strong> ${item.className || 'General'}</div>
      <div>💰 <strong>মূল্য:</strong> <span style="color: #4ade80; font-weight: bold;">৳${item.price}</span></div>
    </div>

    <div style="display: flex; gap: 10px; justify-content: flex-end;">
      <button class="btn btn-secondary" onclick="closeBookDetailModal()">Close</button>
      <button class="btn btn-danger" onclick="deleteBookItem('${item.id}'); closeBookDetailModal();">🗑️ Delete Book</button>
    </div>
  `;

  modal.classList.remove('hidden');
};

window.closeBookDetailModal = function() {
  const modal = document.getElementById('modalBookDetail');
  if (modal) modal.classList.add('hidden');
};

async function createPublisherPrompt() {
  openPublisherModal();
}

async function addBookPrompt(pubId) {
  openBookModal(pubId);
}

async function deletePublisher(pubId) {
  if (!confirm('আপনি কি এই প্রকাশনী ও এর সকল বই মুছে ফেলতে চান?')) return;
  try {
    const res = await fetchWithFallback(`/admin/publications/${pubId}/delete`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${state.accessToken}` },
    });
    if (!res.ok) throw new Error('Failed to delete publisher');
    showToast('প্রকাশনী সফলভাবে মুছে ফেলা হয়েছে!', 'success');
    loadCatalog();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function deleteBookItem(itemId) {
  if (!confirm('আপনি কি এই বইটি মুছে ফেলতে চান?')) return;
  try {
    const res = await fetchWithFallback(`/admin/publications/items/${itemId}/delete`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${state.accessToken}` },
    });
    if (!res.ok) throw new Error('Failed to delete book');
    showToast('বইটি সফলভাবে মুছে ফেলা হয়েছে!', 'success');
    loadCatalog();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function loadBundleOrders() {
  const container = document.getElementById('ordersList');
  container.innerHTML = '<div class="empty-state">Loading bundle orders...</div>';
  try {
    const res = await fetchWithFallback('/admin/bundle-orders', {
      headers: { Authorization: `Bearer ${state.accessToken}` },
    });
    const responseData = await res.json();
    if (!res.ok) throw new Error(responseData.message || 'Failed to load bundle orders');

    const orders = safeArray(responseData);

    if (!orders || orders.length === 0) {
      container.innerHTML = '<div class="empty-state">No bundle orders found.</div>';
      return;
    }

    container.innerHTML = orders.map((o) => `
      <div class="data-card">
        <div class="data-card-header">
          <strong>Order #${(o.id || '').substring(0, 8)}</strong>
          <span class="data-tag data-tag-green">${(o.status || 'pending').toUpperCase()}</span>
        </div>
        <div style="font-size: 13px;">Customer: ${o.userName || 'User'} (${o.userPhone || 'N/A'})</div>
        <div style="font-size: 14px; font-weight: 700; color: var(--primary);">Total: ৳ ${o.totalPrice || o.totalAmount || 0}</div>
        <div style="font-size: 12px; color: var(--text-muted);">Address: ${o.shippingAddress || 'N/A'}</div>
        <div style="margin-top: 10px;">
          <select onchange="updateOrderStatus('${o.id}', this.value)" style="padding: 6px; border-radius: 6px; background: #0F172A; color: #fff;">
            <option value="pending" ${o.status === 'pending' ? 'selected' : ''}>Pending</option>
            <option value="confirmed" ${o.status === 'confirmed' ? 'selected' : ''}>Confirmed</option>
            <option value="shipped" ${o.status === 'shipped' ? 'selected' : ''}>Shipped</option>
            <option value="delivered" ${o.status === 'delivered' ? 'selected' : ''}>Delivered</option>
          </select>
        </div>
      </div>
    `).join('');
  } catch (err) {
    container.innerHTML = `<div class="empty-state" style="color: var(--danger);">Failed: ${err.message}</div>`;
  }
}

async function updateOrderStatus(orderId, status) {
  try {
    const res = await fetchWithFallback(`/admin/bundle-orders/${orderId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${state.accessToken}`,
      },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) throw new Error('Status update failed');
    showToast(`Order status updated to ${status}!`, 'success');
  } catch (err) {
    showToast(err.message, 'error');
  }
}

window.openCampaignModal = function() {
  document.getElementById('modalAddCampaign').classList.remove('hidden');
};

window.closeCampaignModal = function() {
  document.getElementById('modalAddCampaign').classList.add('hidden');
  document.getElementById('formAddCampaign').reset();
};

window.handleAddCampaignSubmit = async function(e) {
  if (e) e.preventDefault();
  const title = document.getElementById('campaignTitleInput').value.trim();
  const category = document.getElementById('campaignCategorySelect').value;
  const points = parseInt(document.getElementById('campaignPointsInput').value) || 100;
  const coverImageUrl = document.getElementById('campaignCoverInput').value.trim();
  const guidelineText = document.getElementById('campaignGuidelineInput').value.trim();
  const description = document.getElementById('campaignDescInput').value.trim();

  if (!title || !guidelineText) return showToast('ক্যাম্পেইনের নাম ও কাস্টম নিয়মাবলী প্রদান করুন!', 'error');

  const btnSubmit = document.querySelector('#formAddCampaign button[type="submit"]');
  const originalText = btnSubmit ? btnSubmit.innerHTML : 'Publish Campaign';
  if (btnSubmit) {
    btnSubmit.disabled = true;
    btnSubmit.innerHTML = '⏳ Publishing Campaign...';
  }

  try {
    const res = await fetchWithFallback('/social-work/admin/campaigns', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${state.accessToken}`,
      },
      body: JSON.stringify({ title, category, points, coverImageUrl, guidelineText, description }),
    });
    const responseData = await res.json();
    if (!res.ok) throw new Error(responseData.message || 'Failed to publish campaign');

    showToast('সামাজিক কাজ ও পরিবেশগত ক্যাম্পেইন সফলভাবে তৈরি করা হয়েছে!', 'success');
    closeCampaignModal();
    loadSocialCampaigns();
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    if (btnSubmit) {
      btnSubmit.disabled = false;
      btnSubmit.innerHTML = originalText;
    }
  }
};

window.deleteSocialCampaign = async function(campaignId) {
  if (!confirm('আপনি কি এই সামাজিক কাজ ক্যাম্পেইনটি মুছে ফেলতে চান?')) return;
  try {
    const res = await fetchWithFallback(`/social-work/admin/campaigns/${campaignId}/delete`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${state.accessToken}` },
    });
    if (!res.ok) throw new Error('Failed to delete campaign');
    showToast('ক্যাম্পেইন সফলভাবে মুছে ফেলা হয়েছে!', 'success');
    loadSocialCampaigns();
  } catch (err) {
    showToast(err.message, 'error');
  }
};

async function loadSocialCampaigns() {
  const container = document.getElementById('campaignsList');
  container.innerHTML = '<div class="empty-state">Loading campaigns...</div>';
  try {
    let res = await fetchWithFallback('/social-work/campaigns');
    if (!res.ok) {
      res = await fetchWithFallback('/social-work/admin/campaigns', {
        headers: { Authorization: `Bearer ${state.accessToken}` },
      });
    }
    const responseData = await res.json();
    if (!res.ok) throw new Error(responseData.message || 'Failed to load campaigns');

    const campaigns = safeArray(responseData);

    if (!campaigns || campaigns.length === 0) {
      container.innerHTML = '<div class="empty-state">কোনো সামাজিক কাজ ক্যাম্পেইন পাওয়া যায়নি। "+ Create Campaign" বাটনে ক্লিক করে নতুন ক্যাম্পেইন তৈরি করুন।</div>';
      return;
    }

    container.innerHTML = campaigns.map((c) => {
      const coverHtml = (c.coverImageUrl && c.coverImageUrl.trim() !== '')
        ? `<img src="${c.coverImageUrl.trim()}" alt="${c.title}" style="width: 100%; height: 180px; object-fit: cover; border-radius: 10px; margin-bottom: 12px; border: 1px solid rgba(255,255,255,0.1);" onerror="this.style.display='none'">`
        : '';

      const pts = c.points ? c.points : 100;

      return `
        <div class="data-card" style="background: rgba(20, 26, 38, 0.85); border: 1px solid rgba(16, 185, 129, 0.35); border-radius: 14px; padding: 16px; margin-bottom: 16px;">
          ${coverHtml}
          <div class="data-card-header" style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px; flex-wrap: wrap; gap: 8px;">
            <div>
              <span class="data-tag data-tag-green" style="background: rgba(16, 185, 129, 0.15); color: #34d399; font-weight: bold; padding: 4px 8px; border-radius: 6px; font-size: 11px;">${c.category || 'General Social Work'}</span>
              <h3 style="margin: 6px 0 0 0; color: #fff; font-size: 17px; font-weight: 700;">${c.title}</h3>
            </div>
            <span style="background: rgba(245, 158, 11, 0.2); color: #fbbf24; font-weight: 800; font-size: 12px; padding: 4px 10px; border-radius: 20px; border: 1px solid rgba(245, 158, 11, 0.4);">🎯 +${pts} PTS</span>
          </div>

          <div style="font-size: 12px; color: #d0d7de; background: rgba(255,255,255,0.04); padding: 10px 12px; border-radius: 8px; margin: 8px 0; border-left: 3px solid #10B981; line-height: 1.4;">
            <strong style="color: #34d399;">📋 কাস্টম নির্দেশনাবলী ও নিয়মসমূহ:</strong><br>
            <span style="white-space: pre-wrap;">${c.guidelineText || 'N/A'}</span>
          </div>

          ${c.description ? `<div style="font-size: 12px; color: var(--text-muted); margin-bottom: 10px;">${c.description}</div>` : ''}

          <div style="display: flex; justify-content: flex-end; margin-top: 12px; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 10px;">
            <button class="btn btn-danger btn-sm" onclick="deleteSocialCampaign('${c.id}')" style="padding: 6px 14px; font-size: 12px; background: #ff4d4d; color: white; font-weight: bold;">🗑️ Delete Campaign</button>
          </div>
        </div>
      `;
    }).join('');
  } catch (err) {
    container.innerHTML = `<div class="empty-state" style="color: var(--danger);">Failed: ${err.message}</div>`;
  }
}

async function updateRole() {
  const userId = document.getElementById('roleUserId').value.trim();
  const role = document.getElementById('targetRole').value;

  if (!userId) {
    showToast('Enter target User UUID!', 'warning');
    return;
  }

  try {
    const res = await fetchWithFallback(`/admin/users/${userId}/role`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${state.accessToken}`,
      },
      body: JSON.stringify({ role }),
    });
    if (!res.ok) throw new Error('Role update failed');
    showToast(`User role successfully set to ${role}!`, 'success');
    document.getElementById('roleUserId').value = '';
  } catch (err) {
    showToast(err.message, 'error');
  }
}
