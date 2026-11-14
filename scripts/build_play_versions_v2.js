const fs = require('fs');
const path = require('path');

const srcPath = path.join(__dirname, '../play-versions.html');
const destPath = path.join(__dirname, '../play-versions-v2.html');

let html = fs.readFileSync(srcPath, 'utf8');

// 1. Update Title and Add Inter / Plus Jakarta Sans fonts
html = html.replace('<title>Versions v2.1</title>', '<title>Play Versions - Executive Mission Control</title>');

// 2. Custom Styles
const customCss = `
  <!-- Executive Dark Neomorphic / Glassmorphic Design System (Pinterest Style) -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet">

  <style id="executive-theme-styles">
    :root {
      --bg-space: #070a13;
      --bg-card: rgba(14, 21, 37, 0.72);
      --bg-card-hover: rgba(18, 28, 50, 0.85);
      --border-card: rgba(255, 255, 255, 0.08);
      --border-card-hover: rgba(56, 189, 248, 0.4);
      --accent-blue: #2563eb;
      --accent-cyan: #38bdf8;
      --accent-orange: #f97316;
      --accent-purple: #8b5cf6;
      --accent-emerald: #10b981;
      --accent-pink: #ec4899;
      --text-white: #f8fafc;
      --text-muted: #94a3b8;
      --text-dim: #64748b;
      --glow-blue: rgba(37, 99, 235, 0.35);
      --glow-cyan: rgba(56, 189, 248, 0.3);
      --glow-orange: rgba(249, 115, 22, 0.25);
    }

    body {
      background-color: #070a13 !important;
      background-image: 
        radial-gradient(ellipse 700px 500px at 12% 15%, rgba(29, 78, 216, 0.18) 0%, transparent 70%),
        radial-gradient(ellipse 650px 600px at 98% 45%, rgba(249, 115, 22, 0.14) 0%, transparent 70%),
        radial-gradient(ellipse 500px 450px at 30% 90%, rgba(124, 58, 237, 0.10) 0%, transparent 70%) !important;
      background-attachment: fixed !important;
      background-size: cover !important;
      color: var(--text-white) !important;
      font-family: 'Plus Jakarta Sans', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
      min-height: 100vh;
      margin: 0;
      padding: 0;
      overflow-x: hidden;
    }

    /* Left Floating Dock */
    .side-dock {
      position: fixed;
      top: 24px;
      bottom: 24px;
      left: 20px;
      width: 68px;
      background: rgba(13, 20, 36, 0.82);
      backdrop-filter: blur(24px);
      -webkit-backdrop-filter: blur(24px);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 26px;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.12);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: space-between;
      padding: 20px 0;
      z-index: 9999;
    }

    .dock-group {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 14px;
      width: 100%;
    }

    .dock-btn {
      width: 44px;
      height: 44px;
      border-radius: 14px;
      background: transparent;
      border: none;
      color: #94a3b8;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      text-decoration: none;
    }

    .dock-btn:hover {
      color: #fff;
      background: rgba(255, 255, 255, 0.06);
      transform: translateY(-1px);
    }

    .dock-btn.active {
      background: #2563eb;
      color: #fff;
      box-shadow: 0 0 20px rgba(37, 99, 235, 0.6);
    }

    .dock-btn::after {
      content: attr(data-tooltip);
      position: absolute;
      left: calc(100% + 14px);
      top: 50%;
      transform: translateY(-50%) scale(0.9);
      background: #0f172a;
      color: #fff;
      font-size: 11px;
      font-weight: 600;
      padding: 6px 10px;
      border-radius: 6px;
      border: 1px solid rgba(255, 255, 255, 0.1);
      box-shadow: 0 4px 14px rgba(0,0,0,0.6);
      white-space: nowrap;
      opacity: 0;
      pointer-events: none;
      transition: all 0.15s ease;
      z-index: 10000;
    }

    .dock-btn:hover::after {
      opacity: 1;
      transform: translateY(-50%) scale(1);
    }

    .dock-badge {
      position: absolute;
      top: 2px;
      right: 2px;
      background: #ef4444;
      color: #fff;
      font-size: 9px;
      font-weight: 700;
      min-width: 16px;
      height: 16px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0 3px;
      box-shadow: 0 0 8px rgba(239, 68, 68, 0.6);
    }

    .main-canvas {
      margin-left: 104px;
      padding: 28px 36px 60px 36px;
      max-width: 1600px;
    }

    @media (max-width: 900px) {
      .side-dock {
        top: auto;
        bottom: 12px;
        left: 12px;
        right: 12px;
        width: auto;
        height: 58px;
        flex-direction: row;
        border-radius: 20px;
        padding: 0 16px;
      }
      .dock-group {
        flex-direction: row;
        justify-content: space-around;
        gap: 0;
      }
      .main-canvas {
        margin-left: 0 !important;
        padding: 16px 14px 80px 14px !important;
      }
      .dock-btn::after {
        display: none !important;
      }
    }

    /* Bento Grid */
    .bento-grid {
      display: grid;
      grid-template-columns: repeat(12, 1fr);
      gap: 16px;
      margin-bottom: 28px;
    }

    .bento-card {
      background: var(--bg-card);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1px solid var(--border-card);
      border-radius: 20px;
      padding: 20px 22px;
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08), 0 12px 30px -8px rgba(0, 0, 0, 0.55);
      transition: transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      position: relative;
      overflow: hidden;
    }

    .bento-card:hover {
      border-color: rgba(56, 189, 248, 0.35);
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.12), 0 16px 36px -6px rgba(0, 0, 0, 0.7), 0 0 20px rgba(56, 189, 248, 0.12);
    }

    .bento-header-label {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.6px;
      color: var(--text-muted);
      margin-bottom: 4px;
    }

    .bento-hero-title {
      font-size: 32px;
      font-weight: 800;
      letter-spacing: -0.5px;
      line-height: 1.1;
      color: #fff;
      margin-bottom: 6px;
    }

    /* Glowing Wave Animation */
    .glow-wave-svg {
      width: 100%;
      height: 44px;
      overflow: visible;
      filter: drop-shadow(0 0 8px rgba(56, 189, 248, 0.6));
    }

    /* Circular Progress Ring */
    .ring-container {
      position: relative;
      width: 88px;
      height: 88px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .ring-svg {
      width: 88px;
      height: 88px;
      transform: rotate(-90deg);
    }

    .ring-circle-bg {
      fill: none;
      stroke: rgba(255, 255, 255, 0.06);
      stroke-width: 8;
    }

    .ring-circle-val {
      fill: none;
      stroke-width: 8;
      stroke-linecap: round;
      stroke-dasharray: 226;
      stroke-dashoffset: 45;
      transition: stroke-dashoffset 0.8s ease;
    }

    .ring-text {
      position: absolute;
      text-align: center;
      font-weight: 800;
      font-size: 18px;
      color: #fff;
    }

    /* Shortcuts Grid */
    .shortcut-btn {
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 14px;
      padding: 12px 10px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 6px;
      color: #e2e8f0;
      font-size: 11px;
      font-weight: 600;
      cursor: pointer;
      text-decoration: none;
      transition: all 0.2s ease;
    }

    .shortcut-btn:hover {
      background: rgba(255, 255, 255, 0.07);
      border-color: rgba(56, 189, 248, 0.4);
      color: #38bdf8;
      transform: translateY(-2px);
    }

    .shortcut-icon {
      font-size: 18px;
    }

    /* Neon Pill Bars for Activity */
    .activity-bar-col {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
      flex: 1;
    }

    .activity-bar-track {
      width: 14px;
      height: 64px;
      background: rgba(255, 255, 255, 0.04);
      border-radius: 8px;
      position: relative;
      display: flex;
      align-items: flex-end;
      overflow: hidden;
    }

    .activity-bar-fill {
      width: 100%;
      border-radius: 8px;
      background: linear-gradient(180deg, #38bdf8, #2563eb);
      box-shadow: 0 0 10px rgba(56, 189, 248, 0.5);
      transition: height 0.5s ease;
    }

    .activity-bar-day {
      font-size: 10px;
      font-weight: 600;
      color: var(--text-dim);
    }

    /* Watch Face Cards Modern Overhaul */
    .card {
      background: rgba(14, 21, 37, 0.72) !important;
      backdrop-filter: blur(16px) !important;
      -webkit-backdrop-filter: blur(16px) !important;
      border: 1px solid rgba(255, 255, 255, 0.08) !important;
      border-radius: 18px !important;
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08), 0 10px 25px -5px rgba(0, 0, 0, 0.5) !important;
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1) !important;
      overflow: hidden !important;
    }

    .card:hover {
      transform: translateY(-4px) !important;
      border-color: rgba(56, 189, 248, 0.45) !important;
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.15), 0 18px 36px -5px rgba(0, 0, 0, 0.7), 0 0 20px rgba(56, 189, 248, 0.15) !important;
    }

    .card-preview {
      border-radius: 14px !important;
      box-shadow: 0 4px 12px rgba(0,0,0,0.4) !important;
    }

    /* Modern Search & Controls */
    .controls-row {
      background: rgba(14, 21, 37, 0.6) !important;
      backdrop-filter: blur(16px) !important;
      border: 1px solid rgba(255, 255, 255, 0.08) !important;
      border-radius: 16px !important;
      padding: 12px 16px !important;
      box-shadow: 0 10px 25px -5px rgba(0,0,0,0.4) !important;
      margin-bottom: 20px !important;
    }

    .search-input {
      background: rgba(255, 255, 255, 0.04) !important;
      border: 1px solid rgba(255, 255, 255, 0.1) !important;
      border-radius: 10px !important;
      color: #fff !important;
      padding: 8px 12px !important;
      transition: all 0.2s ease !important;
    }

    .search-input:focus {
      border-color: #38bdf8 !important;
      box-shadow: 0 0 12px rgba(56, 189, 248, 0.3) !important;
      background: rgba(255, 255, 255, 0.07) !important;
    }

    .filter-select {
      background: rgba(255, 255, 255, 0.04) !important;
      border: 1px solid rgba(255, 255, 255, 0.1) !important;
      border-radius: 10px !important;
      color: #cbd5e1 !important;
      padding: 7px 12px !important;
    }

    .header-btn {
      background: rgba(255, 255, 255, 0.04) !important;
      border: 1px solid rgba(255, 255, 255, 0.1) !important;
      border-radius: 10px !important;
      color: #e2e8f0 !important;
      transition: all 0.2s ease !important;
    }

    .header-btn:hover {
      background: rgba(255, 255, 255, 0.08) !important;
      border-color: rgba(56, 189, 248, 0.35) !important;
      color: #fff !important;
    }

    /* Drawers Modern Frosted Glass Overhaul */
    #roadmap-panel, #reviews-panel, #details-panel {
      background: rgba(10, 15, 28, 0.94) !important;
      backdrop-filter: blur(28px) !important;
      -webkit-backdrop-filter: blur(28px) !important;
      border-left: 1px solid rgba(255, 255, 255, 0.1) !important;
      box-shadow: -15px 0 40px rgba(0, 0, 0, 0.7) !important;
    }

    /* Hide standard legacy top header bar */
    header.header {
      display: none !important;
    }
  </style>
`;

html = html.replace('</head>', `${customCss}\n</head>`);

// 3. Construct Left Floating Dock
const leftDockHtml = `
  <!-- Floating Vertical Navigation Dock (Pinterest Style) -->
  <aside class="side-dock">
    <div class="dock-group">
      <!-- Active App Icon -->
      <a href="#top" class="dock-btn active" data-tooltip="Mission Control" title="Mission Control">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
          <polyline points="9 22 9 12 15 12 15 22"></polyline>
        </svg>
      </a>

      <!-- Watch Faces Catalog -->
      <a href="#catalog-section" class="dock-btn" data-tooltip="Watch Faces Catalog (115+)" title="Watch Faces">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="7"></circle>
          <polyline points="12 9 12 12 13.5 13.5"></polyline>
          <path d="M16.51 17.35l-.35 3.83a2 2 0 0 1-2 1.82H9.83a2 2 0 0 1-2-1.82l-.35-3.83"></path>
          <path d="M7.49 6.65l.35-3.83a2 2 0 0 1 2-1.82h4.34a2 2 0 0 1 2 1.82l.35 3.83"></path>
        </svg>
      </a>

      <!-- Roadmap & Operations Tasks -->
      <button type="button" class="dock-btn" onclick="openRoadmapPanel()" data-tooltip="Roadmap &amp; Operations" title="Roadmap">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M9 11l3 3L22 4"></path>
          <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
        </svg>
        <span class="dock-badge" id="dock-roadmap-badge" style="display:none;">0</span>
      </button>

      <!-- Reviews & Feedback -->
      <button type="button" class="dock-btn" onclick="openReviewsPanel()" data-tooltip="Reviews &amp; Feedback" title="Reviews">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
        </svg>
        <span class="dock-badge" id="dock-reviews-badge" style="display:none;">0</span>
      </button>

      <!-- Titles Optimizer (New tool) -->
      <a href="/titles.html" target="_blank" class="dock-btn" data-tooltip="Category Titles Checklist" title="Titles Checklist">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
          <line x1="7" y1="7" x2="7.01" y2="7"></line>
        </svg>
      </a>

      <!-- Play Console -->
      <a href="https://play.google.com/console/u/0/developers/7609098870161748513/app-list" target="_blank" class="dock-btn" data-tooltip="Google Play Console" title="Play Console">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="5 3 19 12 5 21 5 3"></polygon>
        </svg>
      </a>
    </div>

    <!-- Bottom Profile & Status -->
    <div class="dock-group">
      <div style="display: flex; flex-direction: column; align-items: center; gap: 4px;">
        <div style="width: 8px; height: 8px; border-radius: 50%; background: #10B981; box-shadow: 0 0 8px #10B981;" title="Firebase Live"></div>
        <span style="font-size: 8px; font-weight: 700; color: #64748b; letter-spacing: 0.5px;">LIVE</span>
      </div>

      <div style="width: 38px; height: 38px; border-radius: 12px; background: linear-gradient(135deg, #1e293b, #0f172a); border: 1px solid rgba(255,255,255,0.1); display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 13px; color: #38bdf8;" title="Creation Cue">
        CC
      </div>
    </div>
  </aside>
`;

// Insert Left Dock right after <body> tag
html = html.replace(/<body[^>]*>/i, `$& \n ${leftDockHtml}`);

// 4. Construct Top Executive Bento Grid HTML
const bentoGridHtml = `
    <!-- Executive Bento Dashboard (Pinterest Style) -->
    <div class="bento-grid" id="top">
      
      <!-- Card 1: Hero Greeting (7 cols) -->
      <div class="bento-card" style="grid-column: span 7; min-height: 200px;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
          <div>
            <div class="bento-header-label" id="bento-greeting-time">Good Afternoon,</div>
            <div class="bento-hero-title">Creation Cue</div>
            <div style="font-size: 13px; color: #94a3b8; font-weight: 500;">
              Designing timeless digital craftsmanship for Wear OS · 115+ Live Watch Faces
            </div>
          </div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <div style="background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); padding: 5px 12px; border-radius: 20px; font-size: 12px; font-weight: 700; color: #e2e8f0; display: flex; align-items: center; gap: 6px;">
              <span style="display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: #10B981; box-shadow: 0 0 6px #10B981;"></span>
              <span id="bento-clock">--:-- --</span>
            </div>
          </div>
        </div>

        <!-- Glowing Sine Wave Sparkline SVG -->
        <div style="margin-top: 10px;">
          <svg class="glow-wave-svg" viewBox="0 0 500 50" fill="none" preserveAspectRatio="none">
            <defs>
              <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.2"/>
                <stop offset="50%" stop-color="#38bdf8" stop-opacity="1"/>
                <stop offset="100%" stop-color="#818cf8" stop-opacity="0.8"/>
              </linearGradient>
            </defs>
            <path d="M 0 35 Q 70 5 140 30 T 280 20 T 420 10 T 500 25" stroke="url(#waveGradient)" stroke-width="3" stroke-linecap="round" fill="none"/>
            <circle cx="280" cy="20" r="4" fill="#38bdf8" filter="drop-shadow(0 0 6px #38bdf8)"/>
            <circle cx="420" cy="10" r="4" fill="#818cf8" filter="drop-shadow(0 0 6px #818cf8)"/>
          </svg>
        </div>
      </div>

      <!-- Card 2: Date & System Health (5 cols) -->
      <div class="bento-card" style="grid-column: span 5; min-height: 200px;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
          <div>
            <div class="bento-hero-title" style="font-size: 20px; margin-bottom: 2px;" id="bento-date-str">November 14, 2026</div>
            <div style="font-size: 12px; color: #94a3b8; font-weight: 600;" id="bento-day-str">Saturday</div>
          </div>
          <div style="width: 36px; height: 36px; border-radius: 10px; background: rgba(56, 189, 248, 0.12); border: 1px solid rgba(56, 189, 248, 0.3); display: flex; align-items: center; justify-content: center; color: #38bdf8; font-size: 16px;">
            🛡️
          </div>
        </div>

        <div style="margin-top: 14px; display: flex; align-items: baseline; gap: 8px;">
          <div style="font-size: 38px; font-weight: 800; color: #34d399; line-height: 1;" id="stat-vitals-issues">0.00%</div>
          <div style="font-size: 12px; color: #34d399; font-weight: 700; background: rgba(16, 185, 129, 0.12); padding: 2px 8px; border-radius: 6px; border: 1px solid rgba(16, 185, 129, 0.3);">
            Optimal Health
          </div>
        </div>

        <div style="font-size: 11px; color: #94a3b8; margin-top: 6px; display: flex; justify-content: space-between;">
          <span>Zero Bad Behavior (Google Play &lt; 1.09%)</span>
          <span style="color: #e2e8f0; font-weight: 600;">Crash: 0.0% · ANR: 0.0%</span>
        </div>
      </div>

      <!-- Card 3: Productivity & Architecture (6 cols) -->
      <div class="bento-card" style="grid-column: span 6;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
          <div class="bento-header-label">Catalog &amp; Wear OS 5 Architecture</div>
          <div style="font-size: 11px; color: #94a3b8;">100% WFS</div>
        </div>
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <div>
            <div class="stat-value" id="stat-total" style="font-size: 38px; font-weight: 800; color: #fff; line-height: 1;">115</div>
            <div style="font-size: 13px; color: #38bdf8; font-weight: 700; margin-top: 4px;">Wear OS 5 &amp; SDK 35 Ready</div>
            <div style="font-size: 11px; color: #94a3b8; margin-top: 2px;" id="stat-total-sub">0 paid · 0 free (0%)</div>
          </div>

          <!-- Circular Conic Ring -->
          <div class="ring-container">
            <svg class="ring-svg" viewBox="0 0 90 90">
              <defs>
                <linearGradient id="ringGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stop-color="#38bdf8"/>
                  <stop offset="100%" stop-color="#8b5cf6"/>
                </linearGradient>
              </defs>
              <circle class="ring-circle-bg" cx="45" cy="45" r="36"/>
              <circle class="ring-circle-val" cx="45" cy="45" r="36" stroke="url(#ringGrad1)"/>
            </svg>
            <div class="ring-text">100%</div>
          </div>
        </div>
      </div>

      <!-- Card 4: Focus Timer / Campaign (6 cols) -->
      <div class="bento-card" style="grid-column: span 6;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
          <div class="bento-header-label">Promotional Campaign Timer</div>
          <div style="font-size: 11px; color: #fbbf24; font-weight: 600;">€0.49 Rotation</div>
        </div>
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <div>
            <div style="font-size: 28px; font-weight: 800; color: #fff; line-height: 1;">Black Friday 2026</div>
            <div style="font-size: 13px; color: #fbbf24; font-weight: 600; margin-top: 4px;">7-Day Staggered Discount Wave</div>
            <div style="margin-top: 10px;">
              <button type="button" onclick="openRoadmapPanel()" style="background: rgba(245, 158, 11, 0.15); border: 1px solid rgba(245, 158, 11, 0.35); color: #fbbf24; padding: 5px 12px; border-radius: 8px; font-size: 11px; font-weight: 700; cursor: pointer; display: inline-flex; align-items: center; gap: 5px;">
                <span>▶ View Roadmap Schedule</span>
              </button>
            </div>
          </div>

          <!-- Circular Orange Ring -->
          <div class="ring-container">
            <svg class="ring-svg" viewBox="0 0 90 90">
              <defs>
                <linearGradient id="ringGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stop-color="#f97316"/>
                  <stop offset="100%" stop-color="#ec4899"/>
                </linearGradient>
              </defs>
              <circle class="ring-circle-bg" cx="45" cy="45" r="36"/>
              <circle class="ring-circle-val" cx="45" cy="45" r="36" stroke="url(#ringGrad2)" style="stroke-dashoffset: 70;"/>
            </svg>
            <div class="ring-text" style="font-size: 15px; color: #f97316;">12d</div>
          </div>
        </div>
      </div>

      <!-- Card 5: Operations Tasks Preview (6 cols) -->
      <div class="bento-card" style="grid-column: span 6;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
          <div class="bento-header-label">Active Operations &amp; Explore Playbook</div>
          <button type="button" onclick="openRoadmapPanel()" style="background: none; border: none; color: #38bdf8; font-size: 16px; cursor: pointer; padding: 0 4px;" title="Open Roadmap Drawer">+</button>
        </div>
        <div style="display: flex; flex-direction: column; gap: 8px;">
          
          <div style="display: flex; align-items: center; justify-content: space-between; background: rgba(255,255,255,0.02); padding: 8px 12px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.05);">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="color: #34d399; font-size: 13px;">✔</span>
              <span style="font-size: 12px; color: #fff; font-weight: 500;">Category Carousel Titles (20 Faces)</span>
            </div>
            <span style="font-size: 10px; font-weight: 700; color: #34d399; background: rgba(16, 185, 129, 0.12); padding: 2px 6px; border-radius: 4px;">Completed</span>
          </div>

          <div style="display: flex; align-items: center; justify-content: space-between; background: rgba(255,255,255,0.02); padding: 8px 12px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.05);">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="color: #38bdf8; font-size: 13px;">⚡</span>
              <span style="font-size: 12px; color: #fff; font-weight: 500;">Free "Trojan Horse" Reddit Funnel</span>
            </div>
            <span style="font-size: 10px; font-weight: 700; color: #38bdf8; background: rgba(56, 189, 248, 0.12); padding: 2px 6px; border-radius: 4px;">In Progress</span>
          </div>

          <div style="display: flex; align-items: center; justify-content: space-between; background: rgba(255,255,255,0.02); padding: 8px 12px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.05);">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="color: #94a3b8; font-size: 13px;">○</span>
              <span style="font-size: 12px; color: #cbd5e1; font-weight: 500;">Staggered €0.49 Sales Rotation</span>
            </div>
            <span style="font-size: 10px; font-weight: 700; color: #94a3b8; background: rgba(255, 255, 255, 0.06); padding: 2px 6px; border-radius: 4px;">Planned</span>
          </div>

        </div>
      </div>

      <!-- Card 6: Catalog Quality & Rating Pulse (6 cols) -->
      <div class="bento-card" style="grid-column: span 6;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <div class="bento-header-label">Algorithm Pulse &amp; Store Rating</div>
          <div style="font-size: 11px; color: #34d399; font-weight: 600;">Explore Qualified</div>
        </div>
        
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <div>
            <div class="stat-value" id="stat-avg-rating" style="font-size: 38px; font-weight: 800; color: #f5c518; line-height: 1;">4.89★</div>
            <div style="font-size: 12px; color: #94a3b8; margin-top: 4px;">Based on public store reviews</div>
          </div>
          <div id="rating-sparkline-box" onclick="event.stopPropagation(); openRatingHistoryModal()" style="cursor: pointer; width: 140px;" title="View Rating History">
            <div id="rating-sparkline-svg" style="height: 38px; width: 100%;"></div>
          </div>
        </div>

        <div style="margin-top: 10px;">
          <svg style="width: 100%; height: 28px; overflow: visible; filter: drop-shadow(0 0 6px rgba(139, 92, 246, 0.5));" viewBox="0 0 400 30" fill="none">
            <path d="M 0 15 Q 100 0 200 15 T 400 15" stroke="url(#purpleWaveGrad)" stroke-width="2.5" fill="none"/>
            <defs>
              <linearGradient id="purpleWaveGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stop-color="#38bdf8"/>
                <stop offset="60%" stop-color="#8b5cf6"/>
                <stop offset="100%" stop-color="#ec4899"/>
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>

      <!-- Card 7: Download Distribution & Activity (6 cols) -->
      <div class="bento-card" style="grid-column: span 6;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <div class="bento-header-label">Download Distribution &amp; Traffic</div>
          <div style="font-size: 11px; color: #38bdf8; font-weight: 600;" id="card-downloads-box" onclick="onDownloadsCardClick()">100K+ Net</div>
        </div>

        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
          <div>
            <div class="stat-value" id="stat-downloads" style="font-size: 36px; font-weight: 800; color: #38bdf8; line-height: 1;">100K+</div>
            <div style="font-size: 11px; color: #94a3b8; margin-top: 4px;">Real Google Play store installs</div>
          </div>

          <!-- Weekly Mini Activity Bars -->
          <div style="display: flex; gap: 8px; align-items: flex-end;">
            <div class="activity-bar-col"><div class="activity-bar-track"><div class="activity-bar-fill" style="height: 40%;"></div></div><span class="activity-bar-day">M</span></div>
            <div class="activity-bar-col"><div class="activity-bar-track"><div class="activity-bar-fill" style="height: 55%;"></div></div><span class="activity-bar-day">T</span></div>
            <div class="activity-bar-col"><div class="activity-bar-track"><div class="activity-bar-fill" style="height: 70%;"></div></div><span class="activity-bar-day">W</span></div>
            <div class="activity-bar-col"><div class="activity-bar-track"><div class="activity-bar-fill" style="height: 50%;"></div></div><span class="activity-bar-day">T</span></div>
            <div class="activity-bar-col"><div class="activity-bar-track"><div class="activity-bar-fill" style="height: 85%;"></div></div><span class="activity-bar-day">F</span></div>
            <div class="activity-bar-col"><div class="activity-bar-track"><div class="activity-bar-fill" style="height: 100%; box-shadow: 0 0 12px #38bdf8;"></div></div><span class="activity-bar-day" style="color: #38bdf8;">S</span></div>
            <div class="activity-bar-col"><div class="activity-bar-track"><div class="activity-bar-fill" style="height: 75%;"></div></div><span class="activity-bar-day">S</span></div>
          </div>
        </div>

        <!-- Hidden container that original JS updates, styled cleanly -->
        <div id="stat-dl-breakdown-container" style="display: block; margin-top: 6px;">
          <div style="display: flex; height: 6px; border-radius: 3px; overflow: hidden; background: rgba(255,255,255,0.06); margin-bottom: 6px;">
            <div id="stat-paid-bar" style="background: #38bdf8; width: 35%; transition: width 0.3s ease;"></div>
            <div id="stat-free-bar" style="background: #10b981; width: 65%; transition: width 0.3s ease;"></div>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 11px;">
            <span id="stat-paid-dl-box" class="dl-sub-box"><strong style="color: #38bdf8;" id="stat-paid-downloads">0</strong> <span id="stat-paid-count" style="color: #94a3b8;">Paid</span></span>
            <span id="stat-free-dl-box" class="dl-sub-box"><strong style="color: #10b981;" id="stat-free-downloads">0</strong> <span id="stat-free-count" style="color: #94a3b8;">Free</span></span>
          </div>
        </div>
      </div>

      <!-- Card 8: Shortcuts Grid (6 cols) -->
      <div class="bento-card" style="grid-column: span 6;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
          <div class="bento-header-label">Mission Control Shortcuts</div>
          <div style="font-size: 11px; color: #94a3b8;">1-Click Tools</div>
        </div>

        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px;">
          <a href="/titles.html" target="_blank" class="shortcut-btn">
            <span class="shortcut-icon">🏷️</span>
            <span>Titles Checklist</span>
          </a>
          <a href="https://play.google.com/console/u/0/developers/7609098870161748513/app-list" target="_blank" class="shortcut-btn">
            <span class="shortcut-icon">📊</span>
            <span>Play Console</span>
          </a>
          <button type="button" onclick="openRoadmapPanel()" class="shortcut-btn">
            <span class="shortcut-icon">📋</span>
            <span>Roadmap Tasks</span>
          </button>
          <button type="button" onclick="openReviewsPanel()" class="shortcut-btn">
            <span class="shortcut-icon">🔔</span>
            <span>Review Replies</span>
          </button>
          <a href="https://creationcue.web.app/privacy.html" target="_blank" class="shortcut-btn">
            <span class="shortcut-icon">🛡️</span>
            <span>Privacy Policy</span>
          </a>
          <button type="button" onclick="openReleaseNotesModal()" class="shortcut-btn">
            <span class="shortcut-icon">📱</span>
            <span>Companion App</span>
          </button>
        </div>
      </div>

    </div>

    <!-- Watch Faces Catalog Header & Anchor -->
    <div id="catalog-section" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
      <div>
        <div style="font-size: 24px; font-weight: 800; color: #fff; letter-spacing: -0.3px;">Watch Faces Catalog</div>
        <div style="font-size: 12px; color: #94a3b8;">All Wear OS watch faces with live status, versions, and ratings</div>
      </div>
    </div>
`;

// Replace original <div class="stats-container">...</div> with Bento Grid
const statsContainerStart = html.indexOf('<div class="stats-container">');
const statsContainerEnd = html.indexOf('<div class="controls-row">');

if (statsContainerStart !== -1 && statsContainerEnd !== -1) {
  html = html.slice(0, statsContainerStart) + bentoGridHtml + html.slice(statsContainerEnd);
  console.log('Replaced legacy stats container with Pinterest Bento Grid.');
} else {
  console.warn('Could not find stats container boundary!');
}

// Wrap <div class="main"> with <div class="main-canvas">
html = html.replace('<div class="main">', '<div class="main-canvas"><div class="main" style="max-width: 100%; margin: 0; padding: 0;">');
// Close it before </body>
html = html.replace('</body>', '</div></div>\n</body>');

// 5. Add Live Clock and Greeting Updater Script
const clockScript = `
  <script>
    function initExecutiveDashboard() {
      function updateClock() {
        const now = new Date();
        const hours = now.getHours();
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const displayHours = hours % 12 || 12;
        
        const clockEl = document.getElementById('bento-clock');
        if (clockEl) {
          clockEl.textContent = displayHours + ':' + minutes + ' ' + ampm;
        }

        const greetingEl = document.getElementById('bento-greeting-time');
        if (greetingEl) {
          if (hours < 12) greetingEl.textContent = 'Good Morning,';
          else if (hours < 18) greetingEl.textContent = 'Good Afternoon,';
          else greetingEl.textContent = 'Good Evening,';
        }

        const dateStrEl = document.getElementById('bento-date-str');
        const dayStrEl = document.getElementById('bento-day-str');
        if (dateStrEl) {
          const options = { month: 'long', day: 'numeric', year: 'numeric' };
          dateStrEl.textContent = now.toLocaleDateString('en-US', options);
        }
        if (dayStrEl) {
          dayStrEl.textContent = now.toLocaleDateString('en-US', { weekday: 'long' });
        }
      }

      updateClock();
      setInterval(updateClock, 30000);

      // Sync dock badges with roadmap and reviews badges
      const syncBadges = () => {
        const origRoadmapBadge = document.getElementById('roadmap-badge');
        const dockRoadmapBadge = document.getElementById('dock-roadmap-badge');
        if (origRoadmapBadge && dockRoadmapBadge) {
          dockRoadmapBadge.textContent = origRoadmapBadge.textContent;
          dockRoadmapBadge.style.display = origRoadmapBadge.style.display;
        }

        const origReviewsBadge = document.getElementById('badge-new-reviews');
        const dockReviewsBadge = document.getElementById('dock-reviews-badge');
        if (origReviewsBadge && dockReviewsBadge) {
          dockReviewsBadge.textContent = origReviewsBadge.textContent;
          dockReviewsBadge.style.display = origReviewsBadge.style.display;
        }
      };

      setInterval(syncBadges, 2000);
      syncBadges();
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initExecutiveDashboard);
    } else {
      initExecutiveDashboard();
    }
  </script>
`;

html = html.replace('</body>', `${clockScript}\n</body>`);

fs.writeFileSync(destPath, html, 'utf8');
console.log('Successfully generated play-versions-v2.html! Size:', html.length);
