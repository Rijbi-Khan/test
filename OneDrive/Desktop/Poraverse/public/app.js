// Poraverse Admin Web Portal Client

async function fetchWithFallback(endpoint, options = {}) {
  // If running online, target live API backend
  if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    const apiBase = window.location.hostname.includes('poraverse-backend-2.onrender.com')
      ? ''
      : 'https://poraverse-backend-2.onrender.com';
    return await fetch(`${apiBase}${endpoint}`, options);
  }
  try {
    const res = await fetch(`http://localhost:8080${endpoint}`, options);
    if (!res.ok && res.status >= 500) {
      console.warn('Local backend error, falling back to Render Cloud backend...');
      return await fetch(`https://poraverse-backend-2.onrender.com${endpoint}`, options);
    }
    return res;
  } catch (e) {
    console.warn('Local backend unreachable. Falling back to Render Cloud backend...');
    return await fetch(`https://poraverse-backend-2.onrender.com${endpoint}`, options);
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

    container.innerHTML = pubs.map((p) => {
      const itemsList = safeArray(p.items);
      const booksListHtml = (itemsList.length > 0)
        ? itemsList.map((item) => `
            <div style="padding: 8px 12px; margin-top: 6px; background: rgba(255,255,255,0.04); border-radius: 8px; display: flex; align-items: center; justify-content: space-between; gap: 8px; font-size: 13px;">
              <div>
                <strong style="color: #fff;">📖 ${item.title}</strong>
                ${item.writer ? `<span style="color: var(--text-muted); margin-left: 6px; font-size: 11px;">✍️ ${item.writer}</span>` : ''}
                ${item.subject ? `<span style="background: rgba(0, 200, 150, 0.15); color: #00c896; padding: 2px 6px; border-radius: 4px; font-size: 10px; margin-left: 6px;">${item.subject}</span>` : ''}
                ${item.className ? `<span style="background: rgba(255, 175, 0, 0.15); color: #ffaf00; padding: 2px 6px; border-radius: 4px; font-size: 10px; margin-left: 4px;">${item.className}</span>` : ''}
              </div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <span style="font-weight: bold; color: #4ade80;">৳${item.price}</span>
                <button class="btn btn-danger btn-sm" style="padding: 2px 6px; font-size: 10px;" onclick="deleteBookItem('${item.id}')">🗑️</button>
              </div>
            </div>
          `).join('')
        : '<div style="font-size: 12px; color: var(--text-muted); margin-top: 8px; font-style: italic;">কোনো বই যোগ করা হয়নি।</div>';

      return `
        <div class="data-card" style="border: 1px solid rgba(0, 200, 150, 0.2); background: rgba(18, 22, 32, 0.7); margin-bottom: 16px; padding: 16px; border-radius: 12px;">
          <div class="data-card-header" style="display: flex; justify-content: space-between; align-items: center;">
            <div style="display: flex; align-items: center; gap: 10px;">
              ${p.logoUrl ? `<img src="${p.logoUrl}" alt="Logo" style="width: 36px; height: 36px; border-radius: 50%; object-fit: cover; background: #fff;" onerror="this.src='https://cdn-icons-png.flaticon.com/512/29/29302.png';">` : '<span style="font-size: 24px;">🏛️</span>'}
              <div>
                <strong style="font-size: 16px; color: #fff;">${p.name}</strong>
                <div style="font-size: 11px; color: var(--text-muted);">${p.description || 'Educational Publisher'}</div>
              </div>
            </div>
            <div style="display: flex; gap: 6px;">
              <button class="btn btn-secondary btn-sm" onclick="openBookModal('${p.id}')">📖 + Add Book</button>
              <button class="btn btn-danger btn-sm" onclick="deletePublisher('${p.id}')">🗑️ Delete</button>
            </div>
          </div>
          <div style="margin-top: 12px; border-top: 1px solid rgba(255,255,255,0.06); padding-top: 8px;">
            <div style="font-size: 11px; font-weight: bold; color: var(--text-muted); margin-bottom: 4px;">LISTED BOOKS (${itemsList.length}):</div>
            ${booksListHtml}
          </div>
        </div>
      `;
    }).join('');
  } catch (err) {
    container.innerHTML = `<div class="empty-state" style="color: var(--danger);">Failed: ${err.message}</div>`;
  }
}

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
      container.innerHTML = '<div class="empty-state">No social campaigns found.</div>';
      return;
    }

    container.innerHTML = campaigns.map((c) => `
      <div class="data-card">
        <div class="data-card-header">
          <strong style="font-size: 16px;">${c.title}</strong>
          <span class="data-tag data-tag-green">${c.category || 'General'}</span>
        </div>
        <div style="font-size: 12px; color: var(--text-muted);">Guidelines: ${c.guidelineText || c.description || 'N/A'}</div>
      </div>
    `).join('');
  } catch (err) {
    container.innerHTML = `<div class="empty-state" style="color: var(--danger);">Failed: ${err.message}</div>`;
  }
}

async function createCampaignPrompt() {
  const title = prompt('Enter Campaign Title (e.g. Winter Clothes Distribution):');
  if (!title) return;
  const category = prompt('Enter Category (e.g. Environment, Charity):') || 'Environment';
  const guidelineText = prompt('Enter Guideline Text for users:') || 'Attach proof photo.';

  try {
    const res = await fetchWithFallback('/social-work/admin/campaigns', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${state.accessToken}`,
      },
      body: JSON.stringify({ title, category, guidelineText }),
    });
    if (!res.ok) throw new Error('Failed to create campaign');
    showToast('Social Campaign created successfully!', 'success');
    loadSocialCampaigns();
  } catch (err) {
    showToast(err.message, 'error');
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
