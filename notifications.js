// ============================================
// ACADEX — Notifications System
// notifications.js — Include on dashboard pages
// ============================================

const Notifications = {
  _items: [],
  _unreadCount: 0,
  _unsubscribe: null,

  // ---- INIT ----
  async init(user) {
    this._user = user;
    this._loadFromLocalStorage();

    // If Firebase live, set up real-time listener
    if (window.ACADEX_MODE === 'live' && typeof DB !== 'undefined') {
      this._unsubscribe = DB.listenNotifications(user.matricNumber || user.staffId, (notifs) => {
        this._items = [...notifs, ...this._items.filter(n => !notifs.find(fn => fn.id === n.id))];
        this._unreadCount = this._items.filter(n => !n.read).length;
        this._updateBadge();
      });
    }

    this._injectBellButton();
    this._updateBadge();
  },

  _loadFromLocalStorage() {
    const key = `acadex_notifs_${this._user?.matricNumber || this._user?.staffId}`;
    this._items = JSON.parse(localStorage.getItem(key) || '[]');
    if (this._items.length === 0) this._seedDemoNotifications();
    this._unreadCount = this._items.filter(n => !n.read).length;
  },

  _seedDemoNotifications() {
    if (this._user?.role === 'student') {
      this._items = [
        { id: 'n1', type: 'appeal', title: 'Appeal Update', message: 'Your appeal for PHY 101 Quiz 1 has been reviewed by Dr. Balogun.', read: false, date: new Date(Date.now() - 3600000).toISOString(), link: 'appeal.html' },
        { id: 'n2', type: 'material', title: 'New Material Available', message: 'Dr. Adeyemi uploaded "MTH 101 - Week 5 Notes"', read: false, date: new Date(Date.now() - 86400000).toISOString(), link: 'materials.html' },
        { id: 'n3', type: 'test', title: 'New CBT Test Available', message: 'CHM 101 Mid-Semester Test is now available. Deadline: 48 hours.', read: true, date: new Date(Date.now() - 172800000).toISOString(), link: 'cbt.html' },
      ];
    } else {
      this._items = [
        { id: 'n1', type: 'appeal', title: 'New Appeal Submitted', message: 'Abdulhakeem Ahmad submitted an appeal for MTH 101 Week 3 Test', read: false, date: new Date(Date.now() - 1800000).toISOString(), link: 'appeals-manager.html' },
        { id: 'n2', type: 'appeal', title: 'New Appeal Submitted', message: 'Fatima Bello submitted an appeal for MTH 101 Week 3 Test', read: false, date: new Date(Date.now() - 3600000).toISOString(), link: 'appeals-manager.html' },
      ];
    }
    this._unreadCount = this._items.filter(n => !n.read).length;
    this._saveToLocalStorage();
  },

  _saveToLocalStorage() {
    const key = `acadex_notifs_${this._user?.matricNumber || this._user?.staffId}`;
    localStorage.setItem(key, JSON.stringify(this._items));
  },

  // ---- ADD NOTIFICATION (for appeal updates etc.) ----
  add(notification) {
    const newNotif = { id: 'n_' + Date.now(), read: false, date: new Date().toISOString(), ...notification };
    this._items.unshift(newNotif);
    this._unreadCount++;
    this._saveToLocalStorage();
    this._updateBadge();
    // Show toast
    AcadEx.showToast(`🔔 ${notification.title}: ${notification.message.substring(0, 60)}...`, 'info');
  },

  markRead(id) {
    const notif = this._items.find(n => n.id === id);
    if (notif && !notif.read) { notif.read = true; this._unreadCount = Math.max(0, this._unreadCount - 1); this._saveToLocalStorage(); this._updateBadge(); }
    if (window.ACADEX_MODE === 'live' && typeof DB !== 'undefined') DB.markNotificationRead(id).catch(() => {});
  },

  markAllRead() {
    this._items.forEach(n => n.read = true);
    this._unreadCount = 0;
    this._saveToLocalStorage();
    this._updateBadge();
  },

  // ---- UI ----
  _injectBellButton() {
    // Find nav-user element and inject bell before it
    const navUser = document.querySelector('.nav-user');
    if (!navUser || document.getElementById('notifBell')) return;

    navUser.insertAdjacentHTML('afterbegin', `
      <div style="position:relative;cursor:pointer" id="notifBellWrap" onclick="Notifications.togglePanel()">
        <div id="notifBell" style="width:36px;height:36px;border-radius:50%;background:var(--bg,#f4f6f9);display:flex;align-items:center;justify-content:center;border:1px solid var(--border,#e8edf2);transition:background .15s">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>
        </div>
        <div id="notifBadge" style="display:none;position:absolute;top:-3px;right:-3px;min-width:18px;height:18px;background:#FF4D4F;border-radius:9px;font-size:10px;font-weight:700;color:white;display:flex;align-items:center;justify-content:center;padding:0 4px;"></div>
      </div>

      <div id="notifPanel" style="display:none;position:absolute;top:52px;right:0;width:340px;background:var(--surface,white);border-radius:16px;box-shadow:0 20px 60px rgba(0,0,0,.15);border:1px solid var(--border,#e8edf2);z-index:7000;overflow:hidden">
        <div style="padding:16px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid var(--border,#e8edf2)">
          <strong style="font-size:14px">Notifications</strong>
          <button onclick="Notifications.markAllRead();Notifications.renderPanel()" style="font-size:11px;color:var(--primary,#1A3C6E);background:none;border:none;cursor:pointer;font-family:inherit">Mark all read</button>
        </div>
        <div id="notifList" style="max-height:380px;overflow-y:auto"></div>
      </div>
    `);

    // Close panel on outside click
    document.addEventListener('click', (e) => {
      if (!e.target.closest('#notifBellWrap') && !e.target.closest('#notifPanel')) {
        const panel = document.getElementById('notifPanel');
        if (panel) panel.style.display = 'none';
      }
    });

    // Make nav-user position relative
    navUser.style.position = 'relative';
  },

  togglePanel() {
    const panel = document.getElementById('notifPanel');
    if (!panel) return;
    const isOpen = panel.style.display !== 'none';
    panel.style.display = isOpen ? 'none' : 'block';
    if (!isOpen) this.renderPanel();
  },

  renderPanel() {
    const list = document.getElementById('notifList');
    if (!list) return;
    if (this._items.length === 0) {
      list.innerHTML = `<div style="text-align:center;padding:32px;color:var(--ink-faint,#9aa3af);font-size:13px">🔔 No notifications yet</div>`;
      return;
    }
    const typeIcons = { appeal: '⚖️', material: '📚', test: '📋', info: '💡' };
    list.innerHTML = this._items.map(n => `
      <div onclick="Notifications.markRead('${n.id}');${n.link ? `window.location.href='${n.link}'` : ''}" 
           style="padding:12px 16px;border-bottom:1px solid var(--border,#e8edf2);cursor:pointer;background:${n.read ? 'transparent' : 'rgba(26,60,110,.04)'};transition:background .15s"
           onmouseover="this.style.background='rgba(26,60,110,.06)'" onmouseout="this.style.background='${n.read ? 'transparent' : 'rgba(26,60,110,.04)'}'">
        <div style="display:flex;gap:10px;align-items:flex-start">
          <div style="font-size:18px;flex-shrink:0;margin-top:1px">${typeIcons[n.type] || '🔔'}</div>
          <div style="flex:1;min-width:0">
            <div style="font-size:13px;font-weight:${n.read ? '400' : '600'};color:var(--ink,#1a1a2e)">${n.title}</div>
            <div style="font-size:12px;color:var(--ink-faint,#9aa3af);margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${n.message}</div>
            <div style="font-size:11px;color:var(--ink-faint,#9aa3af);margin-top:4px">${AcadEx.formatDate(n.date)}</div>
          </div>
          ${!n.read ? '<div style="width:7px;height:7px;background:#1A3C6E;border-radius:50%;flex-shrink:0;margin-top:6px"></div>' : ''}
        </div>
      </div>
    `).join('');
  },

  _updateBadge() {
    const badge = document.getElementById('notifBadge');
    if (!badge) return;
    if (this._unreadCount > 0) {
      badge.style.display = 'flex';
      badge.textContent = this._unreadCount > 9 ? '9+' : this._unreadCount;
    } else {
      badge.style.display = 'none';
    }
  },

  destroy() {
    if (this._unsubscribe) this._unsubscribe();
  }
};

window.Notifications = Notifications;
