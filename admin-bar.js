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

  const MAIN_ORIGIN = 'https://creationcue.web.app';

  // Master definition of Admin Menu Navigation Links
  const ADMIN_MENU_CONFIG = [
    {
      id: 'earnings',
      label: 'Earnings',
      href: 'https://cue-earnings.sotsor.workers.dev/',
      target: '_blank',
      color: '#34d399',
      bg: 'rgba(52, 211, 153, 0.14)',
      border: 'rgba(52, 211, 153, 0.32)',
      hoverBg: 'rgba(52, 211, 153, 0.25)',
      activeBg: 'rgba(52, 211, 153, 0.35)',
      icon: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>',
      slideIcon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>'
    },
    {
      id: 'analytics',
      label: 'Analytics',
      href: 'https://cue-earnings.sotsor.workers.dev/analytics',
      target: '_blank',
      color: '#38bdf8',
      bg: 'rgba(56, 189, 248, 0.14)',
      border: 'rgba(56, 189, 248, 0.32)',
      hoverBg: 'rgba(56, 189, 248, 0.25)',
      activeBg: 'rgba(56, 189, 248, 0.35)',
      icon: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>',
      slideIcon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>'
    },
    {
      id: 'planner',
      label: 'Planner',
      href: 'https://creationcue.web.app/month-planner.html',
      target: '_blank',
      color: '#fbbf24',
      bg: 'rgba(251, 191, 36, 0.14)',
      border: 'rgba(251, 191, 36, 0.32)',
      hoverBg: 'rgba(251, 191, 36, 0.25)',
      activeBg: 'rgba(251, 191, 36, 0.35)',
      icon: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>',
      slideIcon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>'
    },
    {
      id: 'versions',
      label: 'Versions',
      href: 'https://creationcue.web.app/play-versions.html',
      target: '_blank',
      color: '#60a5fa',
      bg: 'rgba(96, 165, 250, 0.14)',
      border: 'rgba(96, 165, 250, 0.32)',
      hoverBg: 'rgba(96, 165, 250, 0.25)',
      activeBg: 'rgba(96, 165, 250, 0.35)',
      icon: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect><rect x="9" y="9" width="11" height="11" rx="2" ry="2"></rect></svg>',
      slideIcon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect><rect x="9" y="9" width="11" height="11" rx="2" ry="2"></rect></svg>'
    },
    {
      id: 'coupons',
      label: 'Coupons',
      href: 'https://creationcue.web.app/manage-coupons.html',
      target: '_blank',
      color: '#4ade80',
      bg: 'rgba(74, 222, 128, 0.14)',
      border: 'rgba(74, 222, 128, 0.32)',
      hoverBg: 'rgba(74, 222, 128, 0.25)',
      activeBg: 'rgba(74, 222, 128, 0.35)',
      icon: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>',
      slideIcon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>'
    },
    {
      id: 'reddit',
      label: 'Reddit',
      href: 'https://creationcue.web.app/reddit-generator.html',
      target: '_blank',
      color: '#ff652f',
      bg: 'rgba(255, 101, 47, 0.14)',
      border: 'rgba(255, 101, 47, 0.32)',
      hoverBg: 'rgba(255, 101, 47, 0.25)',
      activeBg: 'rgba(255, 101, 47, 0.35)',
      icon: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M8 14s1.5 2 4 2 4-2 4-2"></path><line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="15" y1="9" x2="15.01" y2="9"></line></svg>',
      slideIcon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M8 14s1.5 2 4 2 4-2 4-2"></path><line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="15" y1="9" x2="15.01" y2="9"></line></svg>'
    },
    {
      id: 'socials',
      label: 'Socials',
      href: 'https://creationcue.web.app/social-generator.html',
      target: '_blank',
      color: '#f472b6',
      bg: 'rgba(244, 114, 182, 0.14)',
      border: 'rgba(244, 114, 182, 0.32)',
      hoverBg: 'rgba(244, 114, 182, 0.25)',
      activeBg: 'rgba(244, 114, 182, 0.35)',
      icon: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="9" x2="20" y2="9"></line><line x1="4" y1="15" x2="20" y2="15"></line><line x1="10" y1="3" x2="8" y2="21"></line><line x1="16" y1="3" x2="14" y2="21"></line></svg>',
      slideIcon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>'
    },
    {
      id: 'batch',
      label: 'Batch Update',
      href: 'https://creationcue.web.app/batchUpdates.html',
      target: '_blank',
      color: '#c084fc',
      bg: 'rgba(192, 132, 252, 0.14)',
      border: 'rgba(192, 132, 252, 0.32)',
      hoverBg: 'rgba(192, 132, 252, 0.25)',
      activeBg: 'rgba(192, 132, 252, 0.35)',
      icon: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>',
      slideIcon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>'
    },
    {
      id: 'deploy',
      label: 'Deploy',
      href: 'https://creationcue.web.app/play-deploy.html',
      target: '_blank',
      color: '#fb7185',
      bg: 'rgba(251, 113, 133, 0.14)',
      border: 'rgba(251, 113, 133, 0.32)',
      hoverBg: 'rgba(251, 113, 133, 0.25)',
      activeBg: 'rgba(251, 113, 133, 0.35)',
      icon: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12,4 L19,9 L19,16 L12,20 L5,16 L5,9 Z"></path></svg>',
      slideIcon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12,4 L19,9 L19,16 L12,20 L5,16 L5,9 Z"></path></svg>'
    },
    {
      id: 'blog',
      label: 'Blog',
      href: 'https://creationcue.web.app/admin.html',
      target: '_blank',
      color: '#a3e635',
      bg: 'rgba(163, 230, 53, 0.14)',
      border: 'rgba(163, 230, 53, 0.32)',
      hoverBg: 'rgba(163, 230, 53, 0.25)',
      activeBg: 'rgba(163, 230, 53, 0.35)',
      icon: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>',
      slideIcon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>'
    }
  ];

  window.ADMIN_MENU_CONFIG = ADMIN_MENU_CONFIG;

  function isUserAdmin(user) {
    if (!user) return false;
    const email = (user.email || '').toLowerCase();
    return ADMIN_EMAILS.includes(email) || ADMIN_UIDS.includes(user.uid);
  }

  function isCurrentAdminPage() {
    if (window.location.hostname.includes('workers.dev') || window.location.hostname.includes('cue-earnings')) {
      return true;
    }
    const p = window.location.pathname.toLowerCase();
    return ADMIN_PAGES.some(function(page) {
      return p === page.toLowerCase() || p.endsWith(page.toLowerCase());
    });
  }

  function resolveHref(href) {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      try {
        const u = new URL(href, window.location.origin);
        if (u.hostname === 'creationcue.web.app') {
          return u.pathname + u.search + u.hash;
        }
      } catch (e) {}
    }
    return href;
  }

  function getLinkTarget(item) {
    return (item && item.target) ? item.target : '_blank';
  }

  function isCurrentPath(href) {
    try {
      const targetUrl = new URL(href, window.location.origin);
      if (targetUrl.hostname.toLowerCase() !== window.location.hostname.toLowerCase()) {
        return false;
      }
      const curPath = window.location.pathname.toLowerCase().replace(/\/$/, '');
      const targetPath = targetUrl.pathname.toLowerCase().replace(/\/$/, '');

      const isCurHome = curPath === '' || curPath === '/index.html';
      const isTargetHome = targetPath === '' || targetPath === '/index.html';
      if (isCurHome && isTargetHome) return true;

      const curBase = curPath.replace(/\.html$/, '');
      const targetBase = targetPath.replace(/\.html$/, '');
      return curBase === targetBase;
    } catch (e) {
      return false;
    }
  }

  // Inject required styles for admin bar and page layout adjustment
  function injectStyles() {
    if (document.getElementById('admin-bar-styles')) return;
    const style = document.createElement('style');
    style.id = 'admin-bar-styles';
    style.textContent = `
      #admin-bar {
        display: none;
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        right: 0 !important;
        width: 100% !important;
        max-width: 100% !important;
        height: 40px !important;
        background: rgba(26, 26, 26, 0.96) !important;
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
        z-index: 99999 !important;
        align-items: center;
        justify-content: space-between;
        padding: 0 10px !important;
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        font-size: 12px;
        box-shadow: 0 4px 14px rgba(0,0,0,0.5);
        color: #ffffff;
        box-sizing: border-box !important;
      }

      body.admin-mode {
        padding-top: 40px !important;
      }

      body.admin-mode .header,
      body.admin-mode header.header,
      body.admin-mode .top-header,
      body.admin-mode .top-brand-header,
      body.admin-mode .sticky-header {
        top: 40px !important;
      }

      body.admin-mode .toast {
        top: 54px !important;
        bottom: auto !important;
        height: auto !important;
        max-width: 90vw !important;
        z-index: 100001 !important;
        pointer-events: none !important;
      }

      body.admin-mode .search-filter-row,
      body.admin-mode .deploy-tabs-nav {
        top: 104px !important;
      }

      @media (min-width: 901px) {
        body.admin-mode .bottom-nav {
          top: 104px !important;
        }
      }

      .admin-bar-left {
        display: inline-flex;
        align-items: center;
        flex-shrink: 0;
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
        font-size: 11.5px;
        padding: 4px 8px;
        border-radius: 6px;
        background: rgba(245, 197, 24, 0.10);
        border: 1px solid rgba(245, 197, 24, 0.25);
        transition: all 0.15s ease;
      }
      .admin-bar-brand:hover {
        background: rgba(245, 197, 24, 0.20);
        border-color: #f5c518;
      }

      .admin-bar-center {
        display: flex;
        align-items: center;
        flex: 1;
        min-width: 0;
        position: relative;
        margin: 0 8px;
      }
      .admin-bar-links {
        display: flex;
        gap: 6px;
        align-items: center;
        overflow-x: auto;
        white-space: nowrap;
        scrollbar-width: none;
        -ms-overflow-style: none;
        -webkit-overflow-scrolling: touch;
        flex: 1;
        min-width: 0;
        padding: 2px 0;
        touch-action: pan-x;
        overscroll-behavior-x: contain;
      }
      .admin-bar-links::-webkit-scrollbar {
        display: none;
      }

      .admin-nav-arrow {
        display: none;
        background: rgba(255, 255, 255, 0.08);
        border: 1px solid rgba(255, 255, 255, 0.18);
        color: #e5e7eb;
        width: 20px;
        height: 26px;
        border-radius: 4px;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        padding: 0;
        flex-shrink: 0;
        transition: all 0.15s ease;
        user-select: none;
        z-index: 2;
      }
      .admin-nav-arrow:hover {
        background: rgba(245, 197, 24, 0.2);
        border-color: #f5c518;
        color: #f5c518;
      }
      .admin-nav-arrow.disabled {
        opacity: 0.18;
        cursor: default;
        pointer-events: none;
      }
      .admin-nav-arrow.prev {
        margin-right: 4px;
      }
      .admin-nav-arrow.next {
        margin-left: 4px;
      }

      .admin-bar-links a {
        background: var(--tab-bg);
        border: 1px solid var(--tab-border);
        color: #f3f4f6;
        text-decoration: none;
        font-weight: 600;
        transition: all 0.15s ease;
        display: inline-flex;
        align-items: center;
        gap: 5px;
        flex-shrink: 0;
        font-size: 11.5px;
        cursor: pointer;
        user-select: none;
        -webkit-user-select: none;
        touch-action: pan-x;
        padding: 4px 8px;
        border-radius: 6px;
      }
      .admin-bar-links a svg {
        color: var(--tab-color);
        flex-shrink: 0;
        transition: transform 0.15s ease;
      }
      .admin-bar-links a:hover {
        background: var(--tab-hover-bg);
        border-color: var(--tab-color);
        color: #ffffff;
        transform: translateY(-1px);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
      }
      .admin-bar-links a:hover svg {
        transform: scale(1.12);
      }
      .admin-bar-links a.active {
        background: var(--tab-active-bg);
        border-color: var(--tab-color);
        color: var(--tab-color);
        font-weight: 700;
        box-shadow: 0 0 10px var(--tab-border);
      }

      .admin-bar-right {
        display: inline-flex;
        align-items: center;
        flex-shrink: 0;
        position: relative;
      }

      .admin-bar-right-desktop {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        flex-shrink: 0;
      }

      .admin-bar-right-mobile {
        display: none;
        align-items: center;
        flex-shrink: 0;
        position: relative;
      }

      .admin-bar-status {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        flex-shrink: 0;
      }

      .admin-bar-btn {
        text-decoration: none;
        font-weight: 600;
        transition: all 0.15s ease;
        display: inline-flex;
        align-items: center;
        gap: 5px;
        flex-shrink: 0;
        font-size: 11px;
        cursor: pointer;
        user-select: none;
        padding: 4px 8px;
        border-radius: 6px;
      }
      .admin-bar-btn:hover {
        transform: translateY(-1px);
        filter: brightness(1.2);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
      }

      .admin-mobile-menu-trigger {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        background: rgba(255, 255, 255, 0.08);
        border: 1px solid rgba(255, 255, 255, 0.18);
        color: #e5e7eb;
        height: 28px;
        padding: 0 8px;
        border-radius: 6px;
        cursor: pointer;
        font-size: 11px;
        font-weight: 600;
        transition: all 0.15s ease;
        user-select: none;
        -webkit-user-select: none;
        position: relative;
      }
      .admin-mobile-menu-trigger:active,
      .admin-mobile-menu-trigger.active {
        background: rgba(245, 197, 24, 0.2);
        border-color: #f5c518;
        color: #f5c518;
      }

      .admin-mobile-alert-dot {
        position: absolute;
        top: -2px;
        right: -2px;
        width: 7px;
        height: 7px;
        background: #ef4444;
        border: 1.5px solid #1a1a1a;
        border-radius: 50%;
      }

      .admin-mobile-popover {
        position: fixed;
        top: 44px;
        right: 8px;
        width: 250px;
        background: rgba(24, 24, 27, 0.98);
        backdrop-filter: blur(14px);
        -webkit-backdrop-filter: blur(14px);
        border: 1px solid rgba(255, 255, 255, 0.15);
        border-radius: 10px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.6);
        z-index: 100000;
        overflow: hidden;
        animation: adminPopoverFadeIn 0.15s ease-out;
        font-family: inherit;
      }
      @keyframes adminPopoverFadeIn {
        from { opacity: 0; transform: translateY(-6px) scale(0.98); }
        to { opacity: 1; transform: translateY(0) scale(1); }
      }

      .admin-popover-header {
        padding: 10px 12px 8px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        background: rgba(255, 255, 255, 0.03);
      }
      .admin-popover-title {
        font-size: 11px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        color: #f5c518;
      }
      .admin-popover-user {
        font-size: 10.5px;
        color: #9ca3af;
        margin-top: 2px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .admin-popover-items {
        padding: 6px 0;
      }
      .admin-popover-item {
        display: flex;
        width: 100%;
        align-items: center;
        justify-content: space-between;
        padding: 9px 12px;
        background: transparent;
        border: none;
        color: #f3f4f6;
        font-size: 11.5px;
        font-weight: 550;
        cursor: pointer;
        text-align: left;
        transition: background 0.15s ease;
      }
      .admin-popover-item:active {
        background: rgba(255, 255, 255, 0.08);
      }
      .admin-popover-item-left {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .admin-popover-badge {
        font-size: 10px;
        font-weight: 700;
        padding: 1px 6px;
        border-radius: 10px;
      }
      .admin-popover-badge.green {
        background: rgba(76, 175, 80, 0.2);
        color: #4caf50;
        border: 1px solid rgba(76, 175, 80, 0.4);
      }
      .admin-popover-badge.yellow {
        background: rgba(245, 197, 24, 0.2);
        color: #f5c518;
        border: 1px solid rgba(245, 197, 24, 0.4);
      }

      .admin-popover-footer {
        padding: 8px 12px;
        border-top: 1px solid rgba(255, 255, 255, 0.08);
        background: rgba(255, 255, 255, 0.02);
      }
      .admin-popover-logout {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        width: 100%;
        padding: 6px 10px;
        background: rgba(239, 68, 68, 0.12);
        border: 1px solid rgba(239, 68, 68, 0.3);
        color: #f87171;
        font-size: 11px;
        font-weight: 600;
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.15s ease;
      }
      .admin-popover-logout:active {
        background: rgba(239, 68, 68, 0.25);
        color: #ffffff;
      }

      .app-slide-link {
        transition: all 0.15s ease !important;
      }
      .app-slide-link .app-slide-icon {
        color: var(--tab-color);
        transition: transform 0.15s ease;
      }
      .app-slide-link:hover {
        background: var(--tab-bg) !important;
        border-left-color: var(--tab-color) !important;
        color: var(--tab-color) !important;
      }
      .app-slide-link:hover .app-slide-icon {
        transform: scale(1.1);
      }
      .app-slide-link.active {
        background: var(--tab-bg) !important;
        border-left-color: var(--tab-color) !important;
        color: var(--tab-color) !important;
        font-weight: 700 !important;
      }

      .admin-bar-user {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        flex-shrink: 0;
      }
      #admin-user-email {
        color: #9ca3af;
        font-size: 11px;
        max-width: 120px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .admin-bar-user button {
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.2);
        color: #9ca3af;
        padding: 4px 8px;
        border-radius: 5px;
        font-size: 11px;
        cursor: pointer;
        font-weight: 500;
        transition: all 0.15s;
        flex-shrink: 0;
      }
      .admin-bar-user button:hover {
        background: rgba(239, 68, 68, 0.15);
        border-color: #ef4444;
        color: #fca5a5;
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

      @media (max-width: 1380px) {
        .admin-btn-label {
          display: none !important;
        }
      }

      @media (max-width: 1100px) {
        #admin-user-email {
          display: none !important;
        }
        .admin-bar-title-text {
          display: none !important;
        }
      }

      @media (max-width: 900px) {
        #admin-bar {
          padding: 0 6px !important;
        }
        .admin-bar-brand {
          padding: 4px 6px !important;
        }
        .admin-bar-title-text {
          display: none !important;
        }
        .admin-nav-arrow {
          display: none !important;
        }
        .admin-bar-center {
          margin: 0 4px !important;
          flex: 1 !important;
          min-width: 0 !important;
        }
        .admin-bar-links {
          touch-action: pan-x !important;
          -webkit-overflow-scrolling: touch !important;
          overscroll-behavior-x: contain !important;
        }
        .admin-bar-links a {
          touch-action: pan-x !important;
          padding: 4px 8px !important;
          font-size: 11px !important;
        }
        .admin-bar-right-desktop {
          display: none !important;
        }
        .admin-bar-right-mobile {
          display: inline-flex !important;
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
    } else {
      // Clear obsolete inline styles that might linger from older markup
      bar.removeAttribute('style');
    }

    // Build bar inner HTML
    const navLinksHtml = ADMIN_MENU_CONFIG.map(function (item) {
      const activeClass = isCurrentPath(item.href) ? ' active' : '';
      const target = getLinkTarget(item);
      const targetAttr = target ? ` target="${target}" rel="noopener noreferrer"` : '';
      const href = resolveHref(item.href);
      const styleAttr = `style="--tab-color:${item.color}; --tab-bg:${item.bg}; --tab-border:${item.border}; --tab-hover-bg:${item.hoverBg}; --tab-active-bg:${item.activeBg};"`;
      return `
        <a href="${href}" class="admin-bar-link${activeClass}"${targetAttr} ${styleAttr}>
          ${item.icon}
          <span>${item.label}</span>
        </a>
      `;
    }).join('');

    const userEmail = localStorage.getItem('cc_admin_email') || 'Admin';

    bar.innerHTML = `
      <div class="admin-bar-left">
        <a href="${resolveHref('https://creationcue.web.app/index.html')}" class="admin-bar-brand" title="Creation Cue Admin Panel" target="_blank" rel="noopener noreferrer">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
          <span class="admin-bar-title-text">Admin Panel</span>
        </a>
      </div>

      <div class="admin-bar-center">
        <button type="button" class="admin-nav-arrow prev" id="admin-nav-prev" title="Scroll left" aria-label="Previous tabs">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
        </button>
        <div class="admin-bar-links" id="admin-bar-scroll-links">
          ${navLinksHtml}
        </div>
        <button type="button" class="admin-nav-arrow next" id="admin-nav-next" title="Scroll right" aria-label="Next tabs">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
        </button>
      </div>

      <div class="admin-bar-right">
        <!-- Desktop Dock (> 900px): Full status badges & logout -->
        <div class="admin-bar-right-desktop">
          <div class="admin-bar-status">
            <span id="btn-subscribers-admin-bar" class="admin-bar-btn" onclick="window.openAdminSubscribers()" title="Subscribers" style="color: #f5c518; background: rgba(245, 197, 24, 0.12); border: 1px solid rgba(245, 197, 24, 0.3);">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
              <span class="admin-btn-label">Subscribers</span> 
              <span id="admin-subscribers-count" class="admin-subscribers-count-target" style="background: rgba(245, 197, 24, 0.22); border: 1px solid rgba(245, 197, 24, 0.45); padding: 1px 6px; border-radius: 10px; font-size: 10px; font-weight: bold; color: #f5c518; margin-left: 2px;">0</span>
            </span>
            <span id="btn-support-admin-bar" class="admin-bar-btn" onclick="window.handleAdminSupport()" title="Support Requests" style="color: #cbd5e1; background: rgba(148, 163, 184, 0.12); border: 1px solid rgba(148, 163, 184, 0.25);">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
              <span class="admin-btn-label">Support</span> 
              <span id="admin-support-count" class="admin-support-count-target" style="display: none; background: rgba(245, 197, 24, 0.22); border: 1px solid rgba(245, 197, 24, 0.45); padding: 1px 6px; border-radius: 10px; font-size: 10px; font-weight: bold; color: #f5c518; margin-left: 2px;">0</span>
            </span>
            <span id="btn-live-visitors" class="admin-bar-btn" onclick="window.openAdminLiveVisitors()" title="Live Visitors" style="color: #4caf50; background: rgba(76, 175, 80, 0.12); border: 1px solid rgba(76, 175, 80, 0.3);">
              Live <span class="admin-live-dot"></span> <span id="admin-live-count" class="admin-live-count-target" style="background: rgba(76, 175, 80, 0.22); border: 1px solid rgba(76, 175, 80, 0.45); padding: 1px 6px; border-radius: 10px; font-size: 10px; font-weight: bold; color: #4caf50;">0</span>
            </span>
            <span id="btn-test-coupon-admin" class="admin-bar-btn" onclick="window.promptTestCoupon()" title="Test Google Play Coupon" style="color: #60a5fa; background: rgba(37, 99, 235, 0.12); border: 1px solid rgba(37, 99, 235, 0.3); cursor: pointer;">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              <span class="admin-btn-label">Test Code</span>
            </span>
          </div>
          <div class="admin-bar-user">
            <span id="admin-user-email" title="${userEmail}">${userEmail}</span>
            <button onclick="window.handleAdminLogout()">Logout</button>
          </div>
        </div>

        <!-- Mobile Quick-Menu Trigger (<= 900px): Leaves 80%+ width for menu tabs -->
        <div class="admin-bar-right-mobile">
          <button type="button" id="admin-mobile-menu-btn" class="admin-mobile-menu-trigger" onclick="window.toggleAdminMobilePopover(event)" title="Admin Controls & Status" aria-label="Open Admin Menu">
            <span class="admin-live-dot"></span>
            <span id="admin-mobile-live-count" class="admin-live-count-target">0</span>
            <span id="admin-mobile-badge" class="admin-mobile-alert-dot" style="display: none;"></span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="margin-left: 2px;"><circle cx="12" cy="12" r="1.5"></circle><circle cx="12" cy="5" r="1.5"></circle><circle cx="12" cy="19" r="1.5"></circle></svg>
          </button>

          <!-- Floating Popover on Mobile -->
          <div id="admin-mobile-popover" class="admin-mobile-popover" style="display: none;">
            <div class="admin-popover-header">
              <div class="admin-popover-title">Admin Controls</div>
              <div class="admin-popover-user" id="admin-popover-email">${userEmail}</div>
            </div>
            <div class="admin-popover-items">
              <button type="button" class="admin-popover-item" onclick="window.promptTestCoupon(); window.closeAdminMobilePopover();" style="color: #60a5fa;">
                <div class="admin-popover-item-left">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                  <span>Test Coupon on Play</span>
                </div>
                <span class="admin-popover-badge blue" style="background: rgba(37,99,235,0.18); color: #60a5fa; border: 1px solid rgba(37,99,235,0.35);">Play ↗</span>
              </button>
              <button type="button" class="admin-popover-item" onclick="window.openAdminLiveVisitors(); window.closeAdminMobilePopover();">
                <div class="admin-popover-item-left">
                  <span class="admin-live-dot" style="margin: 0 2px 0 0;"></span>
                  <span>Live Visitors</span>
                </div>
                <span class="admin-popover-badge green"><span class="admin-live-count-target">0</span> live</span>
              </button>
              <button type="button" class="admin-popover-item" onclick="window.openAdminSubscribers(); window.closeAdminMobilePopover();">
                <div class="admin-popover-item-left">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                  <span>Subscribers</span>
                </div>
                <span class="admin-popover-badge yellow" id="admin-popover-sub-count">0</span>
              </button>
              <button type="button" class="admin-popover-item" onclick="window.handleAdminSupport(); window.closeAdminMobilePopover();">
                <div class="admin-popover-item-left">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                  <span>Support Requests</span>
                </div>
                <span class="admin-popover-badge yellow" id="admin-popover-support-count" style="display:none;">0 pending</span>
              </button>
            </div>
            <div class="admin-popover-footer">
              <button type="button" class="admin-popover-logout" onclick="window.handleAdminLogout()">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    setupScrollControls(bar);

    // Also synchronize sliding side drawer (.app-slide-links) if present on the page
    syncSlideDrawer();
  }

  // Setup horizontal wheel scroll, arrow buttons, and active tab auto-scrolling
  function setupScrollControls(bar) {
    const scrollContainer = bar.querySelector('#admin-bar-scroll-links');
    const prevBtn = bar.querySelector('#admin-nav-prev');
    const nextBtn = bar.querySelector('#admin-nav-next');
    if (!scrollContainer || !prevBtn || !nextBtn) return;

    function updateArrows() {
      const hasOverflow = scrollContainer.scrollWidth > scrollContainer.clientWidth + 4;
      if (!hasOverflow) {
        prevBtn.style.display = 'none';
        nextBtn.style.display = 'none';
      } else {
        prevBtn.style.display = 'inline-flex';
        nextBtn.style.display = 'inline-flex';
        if (scrollContainer.scrollLeft <= 4) {
          prevBtn.classList.add('disabled');
        } else {
          prevBtn.classList.remove('disabled');
        }
        if (scrollContainer.scrollLeft + scrollContainer.clientWidth >= scrollContainer.scrollWidth - 4) {
          nextBtn.classList.add('disabled');
        } else {
          nextBtn.classList.remove('disabled');
        }
      }
    }

    // Prev / Next button clicks
    prevBtn.onclick = function () {
      scrollContainer.scrollBy({ left: -220, behavior: 'smooth' });
    };
    nextBtn.onclick = function () {
      scrollContainer.scrollBy({ left: 220, behavior: 'smooth' });
    };

    // Horizontal wheel scrolling with mouse on desktop
    scrollContainer.addEventListener('wheel', function (e) {
      if (e.deltaY !== 0) {
        e.preventDefault();
        scrollContainer.scrollLeft += e.deltaY;
        updateArrows();
      }
    }, { passive: false });

    // Touch dragging tracking on mobile: prevents accidental link navigation when swiping
    let isDragging = false;
    let startX = 0;
    let startY = 0;

    scrollContainer.addEventListener('touchstart', function (e) {
      if (e.touches && e.touches.length === 1) {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
        isDragging = false;
      }
    }, { passive: true });

    scrollContainer.addEventListener('touchmove', function (e) {
      if (e.touches && e.touches.length === 1) {
        const diffX = Math.abs(e.touches[0].clientX - startX);
        const diffY = Math.abs(e.touches[0].clientY - startY);
        if (diffX > 7 && diffX > diffY) {
          isDragging = true;
        }
      }
    }, { passive: true });

    scrollContainer.addEventListener('click', function (e) {
      if (isDragging) {
        e.preventDefault();
        e.stopPropagation();
        isDragging = false;
      }
    }, true);

    scrollContainer.addEventListener('touchend', function () {
      setTimeout(function () {
        isDragging = false;
      }, 250);
    }, { passive: true });

    scrollContainer.addEventListener('scroll', updateArrows, { passive: true });
    window.addEventListener('resize', updateArrows);

    // Initial check
    setTimeout(updateArrows, 100);

    // Auto-scroll to active tab on load
    const activeLink = scrollContainer.querySelector('.admin-bar-link.active');
    if (activeLink) {
      setTimeout(function () {
        activeLink.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
        updateArrows();
      }, 150);
    }
  }

  // Popover controls for mobile admin controls
  window.toggleAdminMobilePopover = function (e) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const popover = document.getElementById('admin-mobile-popover');
    const trigger = document.getElementById('admin-mobile-menu-btn');
    if (!popover) return;
    const isShown = popover.style.display === 'block';
    popover.style.display = isShown ? 'none' : 'block';
    if (trigger) {
      if (isShown) trigger.classList.remove('active');
      else trigger.classList.add('active');
    }
  };

  window.closeAdminMobilePopover = function () {
    const popover = document.getElementById('admin-mobile-popover');
    const trigger = document.getElementById('admin-mobile-menu-btn');
    if (popover) popover.style.display = 'none';
    if (trigger) trigger.classList.remove('active');
  };

  // Close popover when clicking anywhere outside
  document.addEventListener('click', function (e) {
    const popover = document.getElementById('admin-mobile-popover');
    const trigger = document.getElementById('admin-mobile-menu-btn');
    if (!popover || popover.style.display === 'none') return;
    if (trigger && (trigger === e.target || trigger.contains(e.target))) return;
    if (popover && (popover === e.target || popover.contains(e.target))) return;
    popover.style.display = 'none';
    if (trigger) trigger.classList.remove('active');
  });

  // Synchronize .app-slide-links across pages
  function syncSlideDrawer() {
    const slideContainers = document.querySelectorAll('.app-slide-links');
    if (!slideContainers || slideContainers.length === 0) return;

    slideContainers.forEach(function (container) {
      container.innerHTML = ADMIN_MENU_CONFIG.map(function (item) {
        const activeClass = isCurrentPath(item.href) ? ' active' : '';
        const target = getLinkTarget(item);
        const targetAttr = target ? ` target="${target}" rel="noopener noreferrer"` : '';
        const href = resolveHref(item.href);
        const styleAttr = `style="--tab-color:${item.color}; --tab-bg:${item.bg}; --tab-border:${item.border};"`;
        return `
          <a href="${href}" class="app-slide-link${activeClass}"${targetAttr} ${styleAttr}>
            <span class="app-slide-icon" style="display:flex; align-items:center;">${item.slideIcon || item.icon}</span>
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
    const email = (user && user.email) ? user.email : (localStorage.getItem('cc_admin_email') || 'Admin');
    const emailEl = document.getElementById('admin-user-email');
    if (emailEl) emailEl.textContent = email;
    const popoverEmailEl = document.getElementById('admin-popover-email');
    if (popoverEmailEl) popoverEmailEl.textContent = email;
    initDatabaseListeners();
  }

  function hideAdminBar() {
    document.body.classList.remove('admin-mode');
    const bar = document.getElementById('admin-bar');
    if (bar) bar.style.display = 'none';
    window.closeAdminMobilePopover();
  }

  // Global click actions for admin utilities
  window.promptTestCoupon = function () {
    const code = prompt("Enter Google Play coupon code or redeem link to test:");
    if (!code) return;
    let cleanCode = code.trim();
    if (cleanCode.includes('code=')) {
      const match = cleanCode.match(/code=([^&#\s]+)/i);
      if (match && match[1]) cleanCode = match[1];
    } else if (cleanCode.startsWith('http')) {
      const parts = cleanCode.split('/');
      cleanCode = parts[parts.length - 1];
    }
    cleanCode = cleanCode.replace(/["'`]/g, '').trim();
    if (cleanCode) {
      window.open("https://play.google.com/redeem?code=" + encodeURIComponent(cleanCode), "_blank");
    }
  };

  window.openAdminSubscribers = function () {
    if (typeof window.openSubscribersModal === 'function') {
      window.openSubscribersModal();
    } else {
      window.location.href = resolveHref('https://creationcue.web.app/manage-coupons.html?modal=subscribers');
    }
  };

  window.handleAdminSupport = function () {
    if (typeof window.handleSupportAdminClick === 'function') {
      window.handleSupportAdminClick();
    } else {
      window.location.href = resolveHref('https://creationcue.web.app/index.html#support');
    }
  };

  window.openAdminLiveVisitors = function () {
    if (typeof window.openLiveVisitorsModal === 'function') {
      window.openLiveVisitorsModal();
    } else {
      window.location.href = resolveHref('https://creationcue.web.app/live.html');
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
      window.location.href = resolveHref('https://creationcue.web.app/index.html');
    }
  };

  // Optional badge listeners when firebase database is available
  function initDatabaseListeners() {
    if (!window.firebase || !firebase.database || !firebase.apps || !firebase.apps.length) return;
    try {
      const db = firebase.database();

      // Subscribers count
      if (!window._adminSubListenerStarted) {
        window._adminSubListenerStarted = true;
        db.ref('newsletter_subscribers').on('value', function (snap) {
          if (snap.exists()) {
            const count = snap.numChildren();
            const subEl = document.getElementById('admin-subscribers-count');
            if (subEl) subEl.textContent = count;
            const popoverSubEl = document.getElementById('admin-popover-sub-count');
            if (popoverSubEl) popoverSubEl.textContent = count;
          }
        });
      }

      // Pending support requests count
      if (!window._adminSupportListenerStarted) {
        window._adminSupportListenerStarted = true;
        db.ref('support_requests').on('value', function (snap) {
          if (snap.exists()) {
            let pending = 0;
            snap.forEach(function (child) {
              if (child.val() && child.val().status === 'pending') pending++;
            });
            const supportEl = document.getElementById('admin-support-count');
            const popoverSupportEl = document.getElementById('admin-popover-support-count');
            const mobileBadge = document.getElementById('admin-mobile-badge');

            if (pending > 0) {
              if (supportEl) {
                supportEl.textContent = pending;
                supportEl.style.display = 'inline-block';
              }
              if (popoverSupportEl) {
                popoverSupportEl.textContent = pending + ' pending';
                popoverSupportEl.style.display = 'inline-block';
              }
              if (mobileBadge) mobileBadge.style.display = 'block';
            } else {
              if (supportEl) supportEl.style.display = 'none';
              if (popoverSupportEl) popoverSupportEl.style.display = 'none';
              if (mobileBadge) mobileBadge.style.display = 'none';
            }
          }
        });
      }

      // Active visitors count
      if (!window._adminLiveListenerStarted) {
        window._adminLiveListenerStarted = true;
        db.ref('active_visitors').on('value', function (snap) {
          const count = snap.exists() ? snap.numChildren() : 0;
          document.querySelectorAll('.admin-live-count-target').forEach(function (el) {
            el.textContent = count;
          });
        });
      }
    } catch (e) {
      console.warn("Admin bar DB listener skipped:", e);
    }
  }

  // Check auth state
  function setupAuth() {
    // If stored admin session exists or on dedicated admin page, show bar immediately for seamless navigation
    const storedAdmin = localStorage.getItem('cc_is_admin') === 'true' || isCurrentAdminPage();
    if (storedAdmin) {
      showAdminBar({ email: localStorage.getItem('cc_admin_email') || 'Admin' });
    }

    // Attach to Firebase auth if available, or poll briefly until ready
    let attempts = 0;
    const authInterval = setInterval(function () {
      attempts++;
      if (window.firebase && firebase.auth && firebase.apps && firebase.apps.length > 0) {
        clearInterval(authInterval);
        try {
          firebase.auth().onAuthStateChanged(function (user) {
            if (isUserAdmin(user)) {
              localStorage.setItem('cc_is_admin', 'true');
              if (user.email) localStorage.setItem('cc_admin_email', user.email);
              showAdminBar(user);
            } else {
              localStorage.removeItem('cc_is_admin');
              localStorage.removeItem('cc_admin_email');
              hideAdminBar();
            }
          });
        } catch (e) {
          console.warn("Firebase auth listener setup failed:", e);
        }
      } else if (attempts >= 30) {
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

  // Shared Single-Source-of-Truth Promotion Strategy Playbook
  // Automatically injected into any <div id="shared-promo-playbook"></div> on Planner & Reddit Generator
  const PROMO_PLAYBOOK_HTML = `
    <details id="cc-promo-playbook-details" style="margin: 10px 0 12px 0; border: 1px solid rgba(245, 197, 24, 0.35); border-radius: 8px; background: rgba(245, 197, 24, 0.04); padding: 8px 14px; font-size: 12px; color: #b0b0b8; cursor: pointer; font-family: 'Inter', sans-serif; box-shadow: 0 2px 10px rgba(0,0,0,0.2);">
      <summary style="font-weight: 700; color: #f5c518; display: flex; align-items: center; justify-content: space-between; gap: 8px; user-select: none; list-style: none;">
        <span style="display: inline-flex; align-items: center; gap: 7px;">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f5c518" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon></svg>
          <span>🎯 Promotion Strategy Playbook: Reddit Coupons vs. Google Play Discount Sales (Click to view)</span>
        </span>
        <span style="font-size: 10px; font-weight: 600; color: #9ca3af; background: rgba(255,255,255,0.06); padding: 2px 7px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.1); white-space: nowrap;">Shared Rulebook</span>
      </summary>
      <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid rgba(255, 255, 255, 0.08); line-height: 1.55; color: #e5e7eb; cursor: default; display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 12px;">
        
        <!-- Rule 1: New Watch Face Launch -->
        <div style="background: rgba(16, 185, 129, 0.06); border: 1px solid rgba(16, 185, 129, 0.28); border-radius: 6px; padding: 10px 12px;">
          <div style="font-weight: 700; color: #34d399; font-size: 12.5px; margin-bottom: 6px; display: flex; align-items: center; gap: 6px;">
            <span>🚀 1. New Watch Face Launch (&lt; 10 Ratings)</span>
          </div>
          <ul style="margin: 0; padding-left: 16px; display: flex; flex-direction: column; gap: 4px; font-size: 11.5px; color: #d1d5db;">
            <li><strong>Goal:</strong> Unlock the public ★ star rating badge on Google Play (requires first 5–8 reviews) &amp; build initial social proof.</li>
            <li><strong>Action:</strong> Post <strong>50–60 coupons</strong> on Reddit (creates fast scarcity in ~60–90 mins without cannibalizing late organic buyers).</li>
            <li><strong>Secret Weapon (Private DM Only):</strong> When users ask for a code after expiry, send <strong>5–8 extra codes privately in Reddit Chat/DM</strong>. <em>Never reply in public comments saying you sent a DM</em> (otherwise everyone keeps asking!). Personal DMs convert at ~50–80% into 5★ reviews.</li>
          </ul>
        </div>

        <!-- Rule 2: Existing / Best-Selling Faces -->
        <div style="background: rgba(59, 130, 246, 0.06); border: 1px solid rgba(59, 130, 246, 0.28); border-radius: 6px; padding: 10px 12px;">
          <div style="font-weight: 700; color: #60a5fa; font-size: 12.5px; margin-bottom: 6px; display: flex; align-items: center; gap: 6px;">
            <span>💰 2. Established Faces (10+ Ratings) — Run Play Store Sales</span>
          </div>
          <ul style="margin: 0; padding-left: 16px; display: flex; flex-direction: column; gap: 4px; font-size: 11.5px; color: #d1d5db;">
            <li><strong>Why Stop Free Coupons:</strong> Google Play's Top Paid algorithm ranks apps by <strong>paid revenue &amp; paid conversion velocity</strong>—<code>$0.00</code> promo codes do <strong>not</strong> boost Paid chart ranking and give away copies to buyers who would have paid.</li>
            <li><strong>Action:</strong> Run an official <strong>Google Play Discount Sale</strong> (<em>Play Console → Monetization → Promo codes / Sales</em>) dropping price e.g. <strong>€1.69 → €0.49 / €0.59</strong> for 5–7 days.</li>
            <li><strong>4x Algorithm Win:</strong> Shows strikethrough price badge (<s>€1.69</s> <strong>€0.49</strong>), triggers Google's <em>"Apps on Sale"</em> recommendations, counts 100% as a real paid purchase in the algorithm, and pays you on every download.</li>
          </ul>
        </div>

      </div>
    </details>
  `;

  function renderPromoPlaybook() {
    const containers = document.querySelectorAll('#shared-promo-playbook, .shared-promo-playbook');
    containers.forEach(function (el) {
      if (!el.dataset.playbookRendered) {
        el.innerHTML = PROMO_PLAYBOOK_HTML;
        el.dataset.playbookRendered = 'true';
      }
    });
  }

  window.renderPromoPlaybook = renderPromoPlaybook;

  // Initialize
  function init() {
    renderAdminBar();
    renderPromoPlaybook();
    setupAuth();
    handleUrlParams();
    console.log('[Creation Cue] Admin Bar v2.5 loaded');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
