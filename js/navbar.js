/**
 * Creation Cue™ - Universal Navigation Component
 * Self-contained custom element: <site-header active="..."></site-header>
 * Handles desktop navigation, mobile drawer, social channels, and theme switcher (Light / Dark / Auto).
 */
(function() {
  // Ensure early theme initialization before rendering to avoid flashes
  function getSystemTheme() {
    return (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) ? 'dark' : 'light';
  }

  function applyTheme(theme) {
    const root = document.documentElement;
    const metaTheme = document.getElementById('meta-theme-color');
    const effectiveTheme = (theme === 'auto' || !theme) ? getSystemTheme() : theme;

    root.classList.remove('dark-mode', 'light-mode');
    if (effectiveTheme === 'dark') {
      root.classList.add('dark-mode');
      if (metaTheme) metaTheme.setAttribute('content', '#090a0c');
    } else {
      root.classList.add('light-mode');
      if (metaTheme) metaTheme.setAttribute('content', '#ffffff');
    }

    const currentSetting = theme || 'auto';
    document.querySelectorAll('.mobile-theme-pill').forEach(pill => {
      pill.classList.toggle('active', pill.getAttribute('data-theme') === currentSetting);
    });

    const toggleBtn = document.getElementById('theme-toggle-btn');
    if (toggleBtn) {
      const nextMode = effectiveTheme === 'dark' ? 'light' : 'dark';
      toggleBtn.setAttribute('title', `Switch to ${nextMode} mode`);
      toggleBtn.setAttribute('aria-label', `Switch to ${nextMode} mode`);
    }
  }

  window.setThemePreference = function(pref) {
    if (pref === 'auto') {
      localStorage.removeItem('creationcue_theme');
    } else {
      localStorage.setItem('creationcue_theme', pref);
    }
    applyTheme(pref);
  };

  window.cycleThemeMode = function() {
    const current = localStorage.getItem('creationcue_theme');
    let effective = current || getSystemTheme();
    const nextTheme = (effective === 'dark') ? 'light' : 'dark';
    window.setThemePreference(nextTheme);
  };

  window.closeMobileMenu = function() {
    const nav = document.getElementById('nav-links');
    if (nav) nav.classList.remove('mobile-open');
    const toggleBtn = document.querySelector('.menu-toggle');
    if (toggleBtn) toggleBtn.setAttribute('aria-expanded', 'false');
  };

  window.toggleMobileMenu = function() {
    const nav = document.getElementById('nav-links');
    if (!nav) return;
    const isOpen = nav.classList.toggle('mobile-open');
    const toggleBtn = document.querySelector('.menu-toggle');
    if (toggleBtn) toggleBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  };

  class SiteHeader extends HTMLElement {
    connectedCallback() {
      const active = (this.getAttribute('active') || '').toLowerCase();
      const isHome = window.location.pathname === '/' || window.location.pathname.endsWith('/index.html') || window.location.pathname === '';

      // Determine correct anchor targets depending on whether we're on the home page or a sub-page
      const catalogHref = isHome ? '#catalog' : '/#catalog';
      const newsletterHref = isHome ? '#newsletter' : '/#newsletter';
      const contactHref = isHome ? '#contact' : '/#contact';

      const freeClick = isHome
        ? 'filterBy(\'free\', true); closeMobileMenu();'
        : 'closeMobileMenu();';

      const freeHref = isHome ? '#catalog' : '/#catalog';

      this.innerHTML = `
        <header class="header">
          <div class="container">
            <div class="header-inner">
              <!-- Brand Logo -->
              <a href="/" class="brand">
                <img src="/images/logo.webp" onerror="this.src='/images/logo.png'" width="36" height="36" class="brand-logo-img" alt="Creation Cue Logo">
                <div class="brand-name">Creation<span>Cue</span>™</div>
              </a>

              <!-- Navigation Menu -->
              <nav>
                <ul class="nav-links" id="nav-links">
                  <li><a href="${catalogHref}" class="${active === 'faces' ? 'active' : ''}" onclick="closeMobileMenu()">Watch Faces</a></li>
                  <li><a href="${freeHref}" class="${active === 'free' ? 'active' : ''}" onclick="${freeClick}">Free Faces</a></li>
                  <li>
                    <a href="/blog.html" class="nav-link-blog ${active === 'blog' ? 'active' : ''}" onclick="closeMobileMenu()">
                      Blog <span class="nav-badge-pill">NEW</span>
                    </a>
                  </li>
                  <li><a href="/install.html" class="${active === 'install' ? 'active' : ''}" onclick="closeMobileMenu()">Installation</a></li>
                  <li><a href="${newsletterHref}" class="${active === 'subscribe' ? 'active' : ''}" onclick="closeMobileMenu()">Subscribe</a></li>
                  <li><a href="${contactHref}" class="${active === 'contact' ? 'active' : ''}" onclick="closeMobileMenu()">Contact</a></li>
                  <li class="mobile-social-drawer">
                    <div class="mobile-theme-row">
                      <span class="mobile-theme-label">
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
                        Theme
                      </span>
                      <div class="mobile-theme-pills">
                        <button type="button" class="mobile-theme-pill" data-theme="light" onclick="setThemePreference('light')">Light</button>
                        <button type="button" class="mobile-theme-pill" data-theme="auto" onclick="setThemePreference('auto')">Auto</button>
                        <button type="button" class="mobile-theme-pill" data-theme="dark" onclick="setThemePreference('dark')">Dark</button>
                      </div>
                    </div>
                    <div class="mobile-social-title" style="margin-top: 14px;">Follow Creation Cue™</div>
                    <div class="mobile-social-pills">
                      <a href="https://www.youtube.com/@creationcue" target="_blank" rel="noopener" class="mobile-social-pill" aria-label="YouTube">
                        <svg viewBox="0 0 24 24" width="15" height="15" fill="#dc2626"><path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.518 3.545 12 3.545 12 3.545s-7.518 0-9.388.508a3.003 3.003 0 0 0-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 0 0 2.11 2.11c1.87.508 9.388.508 9.388.508s7.518 0 9.388-.508a3.003 3.003 0 0 0 2.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                        <span>YouTube</span>
                      </a>
                      <a href="https://www.instagram.com/creation.cue/" target="_blank" rel="noopener" class="mobile-social-pill" aria-label="Instagram">
                        <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="#cc2366" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                        <span>Instagram</span>
                      </a>
                      <a href="https://www.tiktok.com/@creationcue" target="_blank" rel="noopener" class="mobile-social-pill" aria-label="TikTok">
                        <svg viewBox="0 0 24 24" width="15" height="15" fill="#111114"><path d="M12.525.02c1.31-.03 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.17-2.86-.74-3.94-1.74-.22-.21-.42-.45-.6-.7v5.77c.06 1.77-.35 3.58-1.28 5.09-1.39 2.27-3.99 3.65-6.66 3.57-2.82-.09-5.54-1.72-6.75-4.28-1.46-3.08-1.01-7.1 1.25-9.67 1.83-2.09 4.67-3.05 7.42-2.5v4.07c-1.34-.41-2.91-.08-3.92.83-1.18 1.06-1.41 2.94-.65 4.36.78 1.45 2.51 2.3 4.15 2.12 1.61-.17 3.01-1.36 3.28-2.96.11-1.02.05-2.07.06-3.11V0z"/></svg>
                        <span>TikTok</span>
                      </a>
                      <a href="https://www.facebook.com/profile.php?id=100089647182787" target="_blank" rel="noopener" class="mobile-social-pill" aria-label="Facebook">
                        <svg viewBox="0 0 24 24" width="15" height="15" fill="#1877f2"><path d="M18.77 7.46H14.5v-1.9c0-.9.6-1.1 1-1.1h3V.5h-4.3c-4.6 0-5.7 3.4-5.7 5.5v1.4H5.4v3.7h3.1v10.8h4.5V11.2h4.3l.5-3.7z"/></svg>
                        <span>Facebook</span>
                      </a>
                    </div>
                  </li>
                </ul>
              </nav>

              <!-- Header Actions: Discrete Socials + Theme Toggle + Play Store + Mobile Toggle -->
              <div class="header-actions">
                <div class="header-desktop-socials" aria-label="Creation Cue Social Channels">
                  <a href="https://www.youtube.com/@creationcue" target="_blank" rel="noopener" class="header-social-link hsl-yt" title="YouTube (@creationcue)" aria-label="YouTube">
                    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.518 3.545 12 3.545 12 3.545s-7.518 0-9.388.508a3.003 3.003 0 0 0-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 0 0 2.11 2.11c1.87.508 9.388.508 9.388.508s7.518 0 9.388-.508a3.003 3.003 0 0 0 2.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                  </a>
                  <a href="https://www.instagram.com/creation.cue/" target="_blank" rel="noopener" class="header-social-link hsl-ig" title="Instagram (@creation.cue)" aria-label="Instagram">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                  </a>
                  <a href="https://www.tiktok.com/@creationcue" target="_blank" rel="noopener" class="header-social-link hsl-tt" title="TikTok (@creationcue)" aria-label="TikTok">
                    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12.525.02c1.31-.03 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.17-2.86-.74-3.94-1.74-.22-.21-.42-.45-.6-.7v5.77c.06 1.77-.35 3.58-1.28 5.09-1.39 2.27-3.99 3.65-6.66 3.57-2.82-.09-5.54-1.72-6.75-4.28-1.46-3.08-1.01-7.1 1.25-9.67 1.83-2.09 4.67-3.05 7.42-2.5v4.07c-1.34-.41-2.91-.08-3.92.83-1.18 1.06-1.41 2.94-.65 4.36.78 1.45 2.51 2.3 4.15 2.12 1.61-.17 3.01-1.36 3.28-2.96.11-1.02.05-2.07.06-3.11V0z"/></svg>
                  </a>
                  <a href="https://www.facebook.com/profile.php?id=100089647182787" target="_blank" rel="noopener" class="header-social-link hsl-fb" title="Facebook" aria-label="Facebook">
                    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.77 7.46H14.5v-1.9c0-.9.6-1.1 1-1.1h3V.5h-4.3c-4.6 0-5.7 3.4-5.7 5.5v1.4H5.4v3.7h3.1v10.8h4.5V11.2h4.3l.5-3.7z"/></svg>
                  </a>
                </div>

                <button type="button" class="theme-toggle-btn" id="theme-toggle-btn" onclick="cycleThemeMode()" aria-label="Toggle dark/light theme" title="Toggle dark/light theme">
                  <svg class="icon-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                  </svg>
                  <svg class="icon-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="5"></circle>
                    <line x1="12" y1="1" x2="12" y2="3"></line>
                    <line x1="12" y1="21" x2="12" y2="23"></line>
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                    <line x1="1" y1="12" x2="3" y2="12"></line>
                    <line x1="21" y1="12" x2="23" y2="12"></line>
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                  </svg>
                </button>

                <a href="https://play.google.com/store/apps/dev?id=7609098870161748513" target="_blank" class="btn btn-dark">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M3.609 1.814L13.792 12 3.61 22.186a2.385 2.385 0 0 1-.61-.954V2.768c.15-.36.368-.69.61-.954zm11.235 11.238l2.678 2.678-12.784 7.378 10.106-10.056zm0-2.104L4.738.892l12.784 7.378-2.678 2.678zm1.488 1.488l3.961-2.288a1.59 1.59 0 0 0 0-2.764l-3.961-2.288-1.745 1.745 1.745 1.745 3.961 3.85z"/></svg>
                  <span class="btn-play-text">Play Store</span>
                </a>

                <button type="button" class="menu-toggle" onclick="toggleMobileMenu()" aria-label="Toggle Navigation" aria-expanded="false">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
                </button>
              </div>
            </div>
          </div>
        </header>
      `;

      // Sync active theme state on render
      const savedTheme = localStorage.getItem('creationcue_theme') || 'auto';
      applyTheme(savedTheme);
    }
  }

  customElements.define('site-header', SiteHeader);

  // Global event listeners for mobile menu and theme listener
  document.addEventListener('click', (e) => {
    const nav = document.getElementById('nav-links');
    const toggleBtn = document.querySelector('.menu-toggle');
    if (nav && nav.classList.contains('mobile-open')) {
      if (!nav.contains(e.target) && (!toggleBtn || !toggleBtn.contains(e.target))) {
        window.closeMobileMenu();
      }
    }
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 900) {
      window.closeMobileMenu();
    }
  });

  if (window.matchMedia) {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const listener = () => {
      const userPref = localStorage.getItem('creationcue_theme');
      if (!userPref || userPref === 'auto') {
        applyTheme('auto');
      }
    };
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', listener);
    } else if (mediaQuery.addListener) {
      mediaQuery.addListener(listener);
    }
  }
})();
