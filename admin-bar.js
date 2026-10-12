/**
 * CreationCue Global Admin Bar
 * Single shared navigation bar & drawer sync for Creation Cue admin panel
 */

(function () {
  'use strict';

  // Allowed admin identities
  const ADMIN_EMAILS = ['sotsor@gmail.com', 'sotirios.liontos@gmail.com'];
  const ADMIN_UIDS = ['D5ghoWWOojW4JcAlhZKtcj02E6U2', 'JKq9NWxPshRbCEXjV2eTUVV6A992'];

  // Dedicated admin tool pages
  const ADMIN_PAGES = [
    '/manage-coupons', '/manage-coupons.html',
    '/reddit-generator', '/reddit-generator.html',
    '/social-generator', '/social-generator.html',
    '/month-planner', '/month-planner.html',
    '/play-versions', '/play-versions.html',
    '/play-deploy', '/play-deploy.html',
    '/batchUpdates', '/batchUpdates.html',
    '/admin', '/admin.html',
    '/watch-recorder', '/watch-recorder.html',
    '/live', '/live.html',
    '/promo-details', '/promo-details.html',
    '/tax', '/tax.html'
  ];

  // Master definition of Admin Menu Navigation Links
  const ADMIN_MENU_CONFIG = [
    {
      id: 'earnings',
      label: 'Earnings',
      href: 'https://cue-earnings.sotsor.workers.dev/',
      target: '_blank',
      icon: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>',
      slideIcon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>'
    },
    {
      id: 'analytics',
      label: 'Analytics',
      href: 'https://cue-earnings.sotsor.workers.dev/analytics',
      target: '_blank',
      icon: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>',
      slideIcon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>'
    },
    {
      id: 'coupons',
      label: 'Coupons',
      href: '/manage-coupons.html',
      icon: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>',
      slideIcon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>'
    },
    {
      id: 'reddit',
      label: 'Reddit',
      href: '/reddit-generator.html',
      icon: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M8 14s1.5 2 4 2 4-2 4-2"></path><line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="15" y1="9" x2="15.01" y2="9"></line></svg>',
      slideIcon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M8 14s1.5 2 4 2 4-2 4-2"></path><line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="15" y1="9" x2="15.01" y2="9"></line></svg>'
    },
    {
      id: 'socials',
      label: 'Socials',
      href: '/social-generator.html',
      icon: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="9" x2="20" y2="9"></line><line x1="4" y1="15" x2="20" y2="15"></line><line x1="10" y1="3" x2="8" y2="21"></line><line x1="16" y1="3" x2="14" y2="21"></line></svg>',
      slideIcon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>'
    },
    {
      id: 'batch',
      label: 'Batch Update',
      href: '/batchUpdates.html',
      icon: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>',
      slideIcon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>'
    },
    {
      id: 'planner',
      label: 'Planner',
      href: '/month-planner.html',
      icon: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>',
      slideIcon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>'
    },
    {
      id: 'versions',
      label: 'Versions',
      href: '/play-versions.html',
      icon: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect><rect x="9" y="9" width="11" height="11" rx="2" ry="2"></rect></svg>',
      slideIcon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect><rect x="9" y="9" width="11" height="11" rx="2" ry="2"></rect></svg>'
    },
    {
      id: 'deploy',
      label: 'Deploy',
      href: '/play-deploy.html',
      icon: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12,4 L19,9 L19,16 L12,20 L5,16 L5,9 Z"></path></svg>',
      slideIcon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12,4 L19,9 L19,16 L12,20 L5,16 L5,9 Z"></path></svg>'
    },
    {
      id: 'blog',
      label: 'Blog',
      href: '/admin.html',
      icon: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>',
      slideIcon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>'
    },
    {
      id: 'watch-recorder',
      label: 'Watch Recorder',
      href: '/watch-recorder.html',
      icon: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>',
      slideIcon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>'
    }
  ];

  window.ADMIN_MENU_CONFIG = ADMIN_MENU_CONFIG;

  function isUserAdmin(user) {
    if (!user) return false;
    const email = (user.email || '').toLowerCase();
    return ADMIN_EMAILS.includes(email) || ADMIN_UIDS.includes(user.uid);
  }

  function isCurrentAdminPage() {
    const p = window.location.pathname.toLowerCase();
    return ADMIN_PAGES.some(function(page) {
      return p === page.toLowerCase() || p.endsWith(page.toLowerCase());
    });
  }

  function isCurrentPath(href) {
    const cur = window.location.pathname.toLowerCase().replace(/\/$/, '');
    const cleanHref = href.split('?')[0].split('#')[0].toLowerCase().replace(/\/$/, '');
    if ((cur === '' || cur === '/index.html') && (cleanHref === '' || cleanHref === '/index.html')) return true;
    if (cleanHref !== '' && cleanHref !== '/index.html') {
      const curBase = cur.replace(/\.html$/, '');
      const hrefBase = cleanHref.replace(/\.html$/, '');
      if (curBase === hrefBase) return true;
    }
    return false;
  }

  // Inject required styles for admin bar and page layout adjustment
  function injectStyles() {
    if (document.getElementById('admin-bar-styles')) return;
    const style = document.createElement('style');
    style.id = 'admin-bar-styles';
    style.textContent = `
      #admin-bar {
        display: none;
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        height: 40px;
        background: rgba(26, 26, 26, 0.96);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        z-index: 99999;
        align-items: center;
        justify-content: space-between;
        padding: 0 16px;
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        font-size: 12px;
        box-shadow: 0 4px 14px rgba(0,0,0,0.5);
        color: #ffffff;
        box-sizing: border-box;
      }

      body.admin-mode {
        padding-top: 40px !important;
      }

      body.admin-mode .header,
      body.admin-mode header.header,
      body.admin-mode .top-brand-header {
        top: 40px !important;
      }

      body.admin-mode .search-filter-row {
        top: 104px !important;
      }

      @media (min-width: 769px) {
        body.admin-mode .bottom-nav {
          top: 104px !important;
        }
      }

      .admin-bar-brand {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        color: #f5c518;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        text-decoration: none;
        flex-shrink: 0;
        font-size: 12px;
      }
      .admin-bar-brand:hover {
        opacity: 0.9;
      }

      .admin-bar-links {
        display: flex;
        gap: 16px;
        align-items: center;
        overflow-x: auto;
        white-space: nowrap;
        scrollbar-width: none;
        -ms-overflow-style: none;
        -webkit-overflow-scrolling: touch;
        margin: 0 12px;
      }
      .admin-bar-links::-webkit-scrollbar {
        display: none;
      }

      .admin-bar-links a,
      .admin-bar-links .admin-bar-btn {
        color: #e5e7eb;
        text-decoration: none;
        font-weight: 600;
        transition: color 0.15s, background-color 0.15s;
        display: inline-flex;
        align-items: center;
        gap: 5px;
        flex-shrink: 0;
        font-size: 12px;
        cursor: pointer;
        user-select: none;
        padding: 4px 6px;
        border-radius: 4px;
      }
      .admin-bar-links a:hover,
      .admin-bar-links .admin-bar-btn:hover {
        color: #f5c518;
      }
      .admin-bar-links a.active {
        color: #f5c518;
        background: rgba(245, 197, 24, 0.12);
        font-weight: 700;
      }

      .admin-bar-user {
        display: inline-flex;
        align-items: center;
        gap: 10px;
        flex-shrink: 0;
      }
      .admin-bar-user button {
        background: transparent;
        border: 1px solid rgba(255, 255, 255, 0.2);
        color: #9ca3af;
        padding: 3px 8px;
        border-radius: 4px;
        font-size: 11px;
        cursor: pointer;
        font-weight: 500;
        transition: all 0.15s;
      }
      .admin-bar-user button:hover {
        border-color: #f5c518;
        color: #ffffff;
      }

      @keyframes adminPulseDot {
        0% { opacity: 1; transform: scale(1); }
        50% { opacity: 0.4; transform: scale(0.85); }
        100% { opacity: 1; transform: scale(1); }
      }
      .admin-live-dot {
        display: inline-block;
        width: 6px;
        height: 6px;
        background: #4caf50;
        border-radius: 50%;
        margin: 0 4px;
        animation: adminPulseDot 1.2s infinite ease-in-out;
      }

      @media (max-width: 900px) {
        #admin-bar {
          padding: 0 10px !important;
        }
        .admin-bar-title-text {
          display: none !important;
        }
        .admin-bar-links {
          gap: 10px !important;
          margin: 0 8px;
          flex: 1;
          min-width: 0;
        }
        #admin-user-email {
          display: none !important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  // Create or refresh Admin Bar DOM
  function renderAdminBar() {
    injectStyles();

    let bar = document.getElementById('admin-bar');
    if (!bar) {
      bar = document.createElement('div');
      bar.id = 'admin-bar';
      document.body.insertAdjacentElement('afterbegin', bar);
    }

    // Build bar inner HTML
    const navLinksHtml = ADMIN_MENU_CONFIG.map(function (item) {
      const activeClass = isCurrentPath(item.href) ? ' active' : '';
      const targetAttr = item.target ? ` target="${item.target}"` : '';
      return `
        <a href="${item.href}" class="admin-bar-link${activeClass}"${targetAttr}>
          ${item.icon}
          <span>${item.label}</span>
        </a>
      `;
    }).join('');

    bar.innerHTML = `
      <a href="/index.html" class="admin-bar-brand" title="Creation Cue Admin Panel">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
        <span class="admin-bar-title-text">Admin Panel</span>
      </a>
      <div class="admin-bar-links">
        ${navLinksHtml}
        <span id="btn-subscribers-admin-bar" class="admin-bar-btn" onclick="window.openAdminSubscribers()" style="color: #f5c518;">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
          Subscribers 
          <span id="admin-subscribers-count" style="background: rgba(245, 197, 24, 0.18); border: 1px solid rgba(245, 197, 24, 0.4); padding: 1px 6px; border-radius: 10px; font-size: 10px; font-weight: bold; color: #f5c518; margin-left: 2px;">0</span>
        </span>
        <span id="btn-support-admin-bar" class="admin-bar-btn" onclick="window.handleAdminSupport()" style="color: #9ca3af;">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
          Support 
          <span id="admin-support-count" style="display: none; background: rgba(245, 197, 24, 0.18); border: 1px solid rgba(245, 197, 24, 0.4); padding: 1px 6px; border-radius: 10px; font-size: 10px; font-weight: bold; color: #f5c518; margin-left: 2px;">0</span>
        </span>
        <span id="btn-live-visitors" class="admin-bar-btn" onclick="window.openAdminLiveVisitors()" style="color: #4caf50;">
          Live <span class="admin-live-dot"></span> <span id="admin-live-count" style="background: rgba(76, 175, 80, 0.18); border: 1px solid rgba(76, 175, 80, 0.4); padding: 1px 6px; border-radius: 10px; font-size: 10px; font-weight: bold; color: #4caf50;">0</span>
        </span>
      </div>
      <div class="admin-bar-user">
        <span id="admin-user-email" style="color: #9ca3af; font-size: 11px;">${localStorage.getItem('cc_admin_email') || 'Admin'}</span>
        <button onclick="window.handleAdminLogout()">Logout</button>
      </div>
    `;

    // Also synchronize sliding side drawer (.app-slide-links) if present on the page
    syncSlideDrawer();
  }

  // Synchronize .app-slide-links across pages
  function syncSlideDrawer() {
    const slideContainers = document.querySelectorAll('.app-slide-links');
    if (!slideContainers || slideContainers.length === 0) return;

    slideContainers.forEach(function (container) {
      container.innerHTML = ADMIN_MENU_CONFIG.map(function (item) {
        const activeClass = isCurrentPath(item.href) ? ' active' : '';
        const targetAttr = item.target ? ` target="${item.target}"` : '';
        return `
          <a href="${item.href}" class="app-slide-link${activeClass}"${targetAttr}>
            ${item.slideIcon || item.icon}
            <span>${item.label}</span>
          </a>
        `;
      }).join('');
    });
  }

  // Show/Hide Admin Bar
  function showAdminBar(user) {
    injectStyles();
    document.body.classList.add('admin-mode');
    const bar = document.getElementById('admin-bar');
    if (bar) bar.style.display = 'flex';
    const emailEl = document.getElementById('admin-user-email');
    if (emailEl && user && user.email) {
      emailEl.textContent = user.email;
    }
    initDatabaseListeners();
  }

  function hideAdminBar() {
    document.body.classList.remove('admin-mode');
    const bar = document.getElementById('admin-bar');
    if (bar) bar.style.display = 'none';
  }

  // Global click actions for admin utilities
  window.openAdminSubscribers = function () {
    if (typeof window.openSubscribersModal === 'function') {
      window.openSubscribersModal();
    } else {
      window.location.href = '/manage-coupons.html?modal=subscribers';
    }
  };

  window.handleAdminSupport = function () {
    if (typeof window.handleSupportAdminClick === 'function') {
      window.handleSupportAdminClick();
    } else {
      window.location.href = '/index.html#support';
    }
  };

  window.openAdminLiveVisitors = function () {
    if (typeof window.openLiveVisitorsModal === 'function') {
      window.openLiveVisitorsModal();
    } else {
      window.location.href = '/live.html';
    }
  };

  window.handleAdminLogout = async function () {
    if (confirm("Log out of Admin Panel?")) {
      try {
        if (window.firebase && firebase.auth) {
          await firebase.auth().signOut();
        }
      } catch (err) {
        console.warn("Sign out error:", err);
      }
      localStorage.removeItem('cc_is_admin');
      localStorage.removeItem('cc_admin_email');
      window.location.href = '/index.html';
    }
  };

  // Optional badge listeners when firebase database is available
  function initDatabaseListeners() {
    if (!window.firebase || !firebase.database) return;
    try {
      const db = firebase.database();

      // Subscribers count
      const subEl = document.getElementById('admin-subscribers-count');
      if (subEl && !window._adminSubListenerStarted) {
        window._adminSubListenerStarted = true;
        db.ref('newsletter_subscribers').on('value', function (snap) {
          if (snap.exists()) {
            const count = snap.numChildren();
            subEl.textContent = count;
          }
        });
      }

      // Pending support requests count
      const supportEl = document.getElementById('admin-support-count');
      if (supportEl && !window._adminSupportListenerStarted) {
        window._adminSupportListenerStarted = true;
        db.ref('support_requests').on('value', function (snap) {
          if (snap.exists()) {
            let pending = 0;
            snap.forEach(function (child) {
              if (child.val() && child.val().status === 'pending') pending++;
            });
            if (pending > 0) {
              supportEl.textContent = pending;
              supportEl.style.display = 'inline-block';
            } else {
              supportEl.style.display = 'none';
            }
          }
        });
      }
    } catch (e) {
      console.warn("Admin bar DB listener skipped:", e);
    }
  }

  // Check auth state
  function setupAuth() {
    // If stored admin session exists or on a dedicated admin page, show bar immediately
    const storedAdmin = localStorage.getItem('cc_is_admin') === 'true';
    if (storedAdmin || isCurrentAdminPage()) {
      showAdminBar({ email: localStorage.getItem('cc_admin_email') || 'Admin' });
    }

    // Attach to Firebase auth if available, or poll briefly until ready
    let attempts = 0;
    const authInterval = setInterval(function () {
      attempts++;
      if (window.firebase && firebase.auth) {
        clearInterval(authInterval);
        try {
          firebase.auth().onAuthStateChanged(function (user) {
            if (isUserAdmin(user)) {
              localStorage.setItem('cc_is_admin', 'true');
              if (user.email) localStorage.setItem('cc_admin_email', user.email);
              showAdminBar(user);
            } else {
              // If not admin and not explicitly on a protected admin page with local admin flag
              if (!isCurrentAdminPage()) {
                localStorage.removeItem('cc_is_admin');
                localStorage.removeItem('cc_admin_email');
                hideAdminBar();
              }
            }
          });
        } catch (e) {
          console.warn("Firebase auth listener setup failed:", e);
        }
      } else if (attempts >= 25) {
        clearInterval(authInterval);
      }
    }, 100);
  }

  // Handle URL param ?modal=subscribers on pages that have openSubscribersModal
  function handleUrlParams() {
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get('modal') === 'subscribers') {
        let attempts = 0;
        const subInterval = setInterval(function () {
          attempts++;
          if (typeof window.openSubscribersModal === 'function') {
            clearInterval(subInterval);
            window.openSubscribersModal();
          } else if (attempts >= 30) {
            clearInterval(subInterval);
          }
        }, 100);
      }
    } catch (e) {}
  }

  // Initialize
  function init() {
    renderAdminBar();
    setupAuth();
    handleUrlParams();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
