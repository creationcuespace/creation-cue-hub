const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec, execSync } = require('child_process');

const PORT = 3000;
const REGISTRY_PATH = path.join(__dirname, '../blog/posts.json');
const POSTS_DIR = path.join(__dirname, '../blog/posts');
const MANAGER_PATH = path.join(__dirname, '../manager.json');

// Helper to slugify titles
function slugify(text) {
    return text.toString().toLowerCase().trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '');
}

// Function to run Git & Firebase sync commands
function runSync(commitMessage) {
    console.log('\n--- Starting Cloud Synchronization ---');
    try {
        console.log('1. Pulling latest repository changes...');
        execSync('git pull', { stdio: 'inherit' });

        console.log('2. Staging files...');
        execSync('git add .', { stdio: 'inherit' });

        console.log('3. Committing changes...');
        execSync(`git commit -m "${commitMessage}"`, { stdio: 'inherit' });

        console.log('4. Pushing to GitHub...');
        execSync('git push', { stdio: 'inherit' });

        console.log('5. Deploying to Firebase Hosting...');
        execSync('npx firebase deploy --only hosting', { stdio: 'inherit' });

        console.log('--- Sync Completed Successfully ---\n');
        return { success: true };
    } catch (e) {
        console.error('\n[SYNC ERROR]:', e.message);
        return { success: false, error: e.message };
    }
}

// Create the local HTTP server
const server = http.createServer((req, res) => {
    // Enable CORS for localhost development
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');

    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    // Serve admin UI page
    if (req.url === '/' && req.method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(getAdminHtml());
        return;
    }

    // API: Get all posts
    if (req.url === '/api/posts' && req.method === 'GET') {
        let posts = [];
        if (fs.existsSync(REGISTRY_PATH)) {
            try {
                posts = JSON.parse(fs.readFileSync(REGISTRY_PATH, 'utf8'));
            } catch (e) {
                posts = [];
            }
        }
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(posts));
        return;
    }

    // API: Get specific post content
    if (req.url.startsWith('/api/post-content') && req.method === 'GET') {
        const urlParams = new URL(req.url, `http://localhost:${PORT}`);
        const slug = urlParams.searchParams.get('slug');
        if (!slug) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Missing slug' }));
            return;
        }

        const mdPath = path.join(POSTS_DIR, `${slug}.md`);
        if (!fs.existsSync(mdPath)) {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Markdown file not found' }));
            return;
        }

        try {
            const content = fs.readFileSync(mdPath, 'utf8');
            res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
            res.end(content);
        } catch (e) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: e.message }));
        }
        return;
    }

    // API: Get watch faces
    if (req.url === '/api/faces' && req.method === 'GET') {
        let faces = [];
        if (fs.existsSync(MANAGER_PATH)) {
            try {
                const manager = JSON.parse(fs.readFileSync(MANAGER_PATH, 'utf8'));
                faces = (manager.watch_faces || []).map(f => ({
                    id: f.id,
                    title: f.title || f.id,
                    image_url: f.image_url
                }));
            } catch (e) {
                faces = [];
            }
        }
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(faces));
        return;
    }

    // API: Publish/Update post (sets draft to false)
    if (req.url === '/api/publish' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            try {
                const { title, excerpt, thumbnail, content, originalSlug } = JSON.parse(body);
                if (!title || !excerpt || !content) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Missing required fields' }));
                    return;
                }

                const slug = originalSlug || slugify(title);
                if (!fs.existsSync(POSTS_DIR)) {
                    fs.mkdirSync(POSTS_DIR, { recursive: true });
                }

                // If editing and title changed the slug, delete the old file
                if (originalSlug && originalSlug !== slugify(title)) {
                    const oldPath = path.join(POSTS_DIR, `${originalSlug}.md`);
                    if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
                }

                const finalSlug = originalSlug || slug;
                const mdPath = path.join(POSTS_DIR, `${finalSlug}.md`);
                fs.writeFileSync(mdPath, content, 'utf8');

                // Update posts.json registry
                let posts = [];
                if (fs.existsSync(REGISTRY_PATH)) {
                    try {
                        posts = JSON.parse(fs.readFileSync(REGISTRY_PATH, 'utf8'));
                    } catch (e) {
                        posts = [];
                    }
                }

                // Find if post exists to preserve details
                const existingPost = posts.find(p => p.slug === finalSlug);
                const postDate = existingPost ? existingPost.date : new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

                posts = posts.filter(p => p.slug !== finalSlug);
                posts.unshift({
                    slug: finalSlug,
                    title,
                    date: postDate,
                    readTime: `${Math.max(1, Math.ceil(content.split(/\s+/).length / 200))} min`,
                    excerpt,
                    thumbnail: thumbnail || 'https://raw.githubusercontent.com/creationcuespace/creation-cue-hub/main/images/ccBanner1.webp',
                    draft: false // Explicitly published, not draft!
                });

                fs.writeFileSync(REGISTRY_PATH, JSON.stringify(posts, null, 2), 'utf8');

                // Deploy and sync
                const syncResult = runSync(`feat: published blog post: ${title}`);

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(syncResult));
            } catch (err) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: err.message }));
            }
        });
        return;
    }

    // API: Delete post
    if (req.url === '/api/delete' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            try {
                const { slug } = JSON.parse(body);
                if (!slug) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Missing slug' }));
                    return;
                }

                // Remove markdown file
                const mdPath = path.join(POSTS_DIR, `${slug}.md`);
                if (fs.existsSync(mdPath)) {
                    fs.unlinkSync(mdPath);
                }

                // Update registry posts.json
                let posts = [];
                if (fs.existsSync(REGISTRY_PATH)) {
                    try {
                        posts = JSON.parse(fs.readFileSync(REGISTRY_PATH, 'utf8'));
                    } catch (e) {
                        posts = [];
                    }
                }

                const targetPost = posts.find(p => p.slug === slug);
                const titleStr = targetPost ? targetPost.title : slug;

                posts = posts.filter(p => p.slug !== slug);
                fs.writeFileSync(REGISTRY_PATH, JSON.stringify(posts, null, 2), 'utf8');

                // Deploy and sync
                const syncResult = runSync(`chore: deleted blog post: ${titleStr}`);

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(syncResult));
            } catch (err) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: err.message }));
            }
        });
        return;
    }

    // Default 404
    res.writeHead(404);
    res.end('Not Found');
});

// Start the server with automatic port-finding fallback
function startServer(port) {
    server.once('error', (err) => {
        if (err.code === 'EADDRINUSE') {
            console.log(`Port ${port} is already in use. Trying port ${port + 1}...`);
            startServer(port + 1);
        } else {
            console.error('Server error:', err);
        }
    });

    server.listen(port, () => {
        console.log(`=============================================`);
        console.log(`   CreationCue Blog Admin Server Running     `);
        console.log(`   URL: http://localhost:${port}             `);
        console.log(`=============================================`);
        console.log(`\nLaunching dashboard in your browser...`);
        
        const url = `http://localhost:${port}`;
        const startCmd = process.platform === 'win32' ? `start ${url}` : `open ${url}`;
        exec(startCmd);
    });
}

// 1. Fetch latest changes on startup (so drafts are always downloaded)
console.log('=== Checking for Cloud Updates & AI Drafts ===');
try {
    execSync('git pull', { stdio: 'inherit' });
} catch (e) {
    console.warn('Startup git pull skipped/failed:', e.message);
}

startServer(PORT);

// Serve HTML contents
function getAdminHtml() {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CreationCue Blog Admin Dashboard</title>
    
    <!-- EasyMDE Markdown Editor -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/easymde/dist/easymde.min.css">
    <script src="https://cdn.jsdelivr.net/npm/easymde/dist/easymde.min.js"></script>

    <!-- Google Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;800&family=Inter:wght@400;600;700&display=swap" rel="stylesheet">

    <style>
        :root {
            --bg-color: #0b0c10;
            --surface: #1f2833;
            --surface-accent: #2e3a47;
            --primary: #f1b31c;
            --text-main: #ffffff;
            --text-secondary: #c5a059;
            --text-muted: #8b9bb4;
            --border: rgba(255,255,255,0.08);
            --radius: 12px;
        }

        * { box-sizing: border-box; margin: 0; padding: 0; }

        body {
            background-color: var(--bg-color);
            color: var(--text-main);
            font-family: 'Inter', sans-serif;
            padding: 40px 20px;
            max-width: 1200px;
            margin: 0 auto;
        }

        header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid var(--border);
            padding-bottom: 20px;
            margin-bottom: 30px;
        }

        h1 {
            font-family: 'Outfit', sans-serif;
            font-size: 28px;
            font-weight: 800;
        }
        h1 span { color: var(--primary); }

        .dashboard-grid {
            display: grid;
            grid-template-columns: 1.8fr 1.2fr;
            gap: 30px;
        }

        @media (max-width: 900px) {
            .dashboard-grid { grid-template-columns: 1fr; }
        }

        .panel {
            background: var(--surface);
            border: 1px solid var(--border);
            border-radius: var(--radius);
            padding: 24px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.5);
            margin-bottom: 24px;
        }

        .panel-title {
            font-family: 'Outfit', sans-serif;
            font-size: 18px;
            margin-bottom: 20px;
            color: var(--primary);
            font-weight: 700;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .badge-draft {
            background: rgba(241,179,28,0.15);
            color: var(--primary);
            border: 1px solid rgba(241,179,28,0.3);
            font-size: 10px;
            font-weight: bold;
            padding: 2px 8px;
            border-radius: 20px;
            text-transform: uppercase;
        }

        .form-group {
            margin-bottom: 20px;
        }

        label {
            display: block;
            font-size: 11px;
            font-weight: 600;
            color: var(--text-muted);
            margin-bottom: 6px;
            text-transform: uppercase;
        }

        input, textarea, select {
            width: 100%;
            padding: 12px;
            background: rgba(0,0,0,0.2);
            border: 1px solid var(--border);
            border-radius: 8px;
            color: #fff;
            font-family: inherit;
            font-size: 14px;
            transition: border-color 0.2s;
        }

        input:focus, textarea:focus, select:focus {
            outline: none;
            border-color: var(--primary);
        }

        /* EasyMDE dark overrides */
        .editor-toolbar {
            background: #2b3a4a !important;
            border-color: var(--border) !important;
            border-radius: 8px 8px 0 0 !important;
        }
        .editor-toolbar button { color: #fff !important; }
        .editor-toolbar button.active, .editor-toolbar button:hover { background: var(--surface) !important; }
        .CodeMirror {
            background: rgba(0,0,0,0.3) !important;
            color: #fff !important;
            border-color: var(--border) !important;
            border-radius: 0 0 8px 8px !important;
        }

        .btn {
            background: var(--primary);
            color: #000;
            border: none;
            border-radius: 8px;
            padding: 14px 28px;
            font-family: 'Outfit', sans-serif;
            font-weight: 700;
            font-size: 15px;
            cursor: pointer;
            width: 100%;
            transition: opacity 0.2s;
        }

        .btn:hover { opacity: 0.9; }

        .btn-edit {
            background: #4a90e2;
            color: #fff;
            border: none;
            border-radius: 4px;
            padding: 6px 12px;
            font-size: 11px;
            font-weight: 700;
            cursor: pointer;
            margin-right: 6px;
        }
        .btn-edit:hover { background: #357abd; }

        .btn-delete {
            background: #ff4a4a;
            color: #fff;
            border: none;
            border-radius: 4px;
            padding: 6px 12px;
            font-size: 11px;
            font-weight: 700;
            cursor: pointer;
        }
        .btn-delete:hover { background: #d93838; }

        /* Listing styles */
        .post-list-section {
            margin-bottom: 24px;
        }
        .section-subtitle {
            font-size: 12px;
            font-weight: 700;
            color: var(--text-muted);
            text-transform: uppercase;
            border-bottom: 1px solid var(--border);
            padding-bottom: 6px;
            margin-bottom: 12px;
        }

        .post-list-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px 0;
            border-bottom: 1px dashed var(--border);
        }
        .post-list-item:last-child { border-bottom: none; }

        .post-list-info {
            display: flex;
            align-items: center;
            gap: 12px;
            flex: 1;
            overflow: hidden;
        }

        .post-list-thumb {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            object-fit: cover;
            border: 1px solid var(--border);
        }

        .post-list-title {
            font-weight: 600;
            font-size: 14px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        .post-list-date {
            font-size: 11px;
            color: var(--text-muted);
        }

        .actions-wrap {
            display: flex;
            align-items: center;
        }

        /* Overlay/status styles */
        #status-overlay {
            display: none;
            position: fixed;
            top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.85);
            z-index: 1000;
            align-items: center;
            justify-content: center;
            flex-direction: column;
            gap: 20px;
        }

        .spinner {
            border: 4px solid rgba(255,255,255,0.1);
            width: 50px;
            height: 50px;
            border-radius: 50%;
            border-left-color: var(--primary);
            animation: spin 1s linear infinite;
        }

        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    </style>
</head>
<body>

    <header>
        <h1>Creation<span>Cue</span> Blog Dashboard</h1>
        <div style="font-size:12px; color:var(--text-muted); text-align:right;">Local CMS Publisher</div>
    </header>

    <div class="dashboard-grid">
        <!-- Main editor panel -->
        <div class="panel">
            <div class="panel-title" id="editor-panel-title">
                Create Custom Article 
            </div>
            
            <!-- Hidden field to track if we are editing an existing slug -->
            <input type="hidden" id="original-slug" value="">

            <div class="form-group">
                <label>1. Post Title</label>
                <input type="text" id="post-title" placeholder="e.g. New Wear OS Customization Upgrades">
            </div>

            <div class="form-group">
                <label>2. Excerpt / Listing Summary</label>
                <input type="text" id="post-excerpt" placeholder="A short 1-2 sentence preview for listings.">
            </div>

            <div class="form-group">
                <label>3. Select Watch Face to Feature</label>
                <select id="post-face-select">
                    <option value="">Default Banner (ccBanner1.webp)</option>
                    <!-- Faces loaded dynamically -->
                </select>
            </div>

            <div class="form-group">
                <label>4. Article Content (Rich Formatting Toolbar)</label>
                <textarea id="post-editor"></textarea>
            </div>

            <div style="display:flex; gap:12px;">
                <button class="btn" style="flex:1;" onclick="publishPost()">Publish Live</button>
                <button class="btn" id="btn-cancel-edit" style="background:#495057; color:#fff; display:none; width:auto;" onclick="cancelEditing()">Cancel</button>
            </div>
        </div>

        <!-- Sidebar lists of posts -->
        <div class="panel" style="height: fit-content;">
            
            <!-- AI Drafts Queue -->
            <div class="post-list-section">
                <div class="section-subtitle" style="color: var(--primary); display:flex; justify-content:space-between; align-items:center;">
                    <span>Pending AI Drafts</span>
                    <span id="drafts-count" class="badge-draft" style="display:none;">0</span>
                </div>
                <div id="drafts-list-container">
                    <div style="color:var(--text-muted); font-size:13px; padding: 10px 0;">No drafts pending.</div>
                </div>
            </div>

            <!-- Published Articles -->
            <div class="post-list-section">
                <div class="section-subtitle">Published Articles</div>
                <div id="posts-list-container">
                    <div style="color:var(--text-muted); font-size:13px; padding: 10px 0;">Loading posts...</div>
                </div>
            </div>
        </div>
    </div>

    <!-- Status overlay -->
    <div id="status-overlay">
        <div class="spinner"></div>
        <div id="status-message" style="font-size:18px; font-weight:700; font-family:'Outfit', sans-serif;">Deploying to Firebase Hosting...</div>
        <div style="font-size:12px; color:var(--text-muted);">Please keep this page open. This takes around 20-30 seconds.</div>
    </div>

    <script>
        let easyMDE;

        document.addEventListener('DOMContentLoaded', () => {
            // Initialize EasyMDE rich editor
            easyMDE = new EasyMDE({
                element: document.getElementById('post-editor'),
                spellChecker: false,
                autosave: { enabled: false },
                placeholder: "Write your blog post content here... You can use headings, lists, bold text, etc.",
                toolbar: ["bold", "italic", "heading", "|", "quote", "unordered-list", "ordered-list", "|", "link", "preview", "side-by-side", "fullscreen"]
            });

            loadCatalogFaces();
            loadExistingPosts();
        });

        // Load watch faces dropdown
        async function loadCatalogFaces() {
            try {
                const res = await fetch('/api/faces');
                const faces = await res.json();
                const select = document.getElementById('post-face-select');
                faces.forEach(f => {
                    const opt = document.createElement('option');
                    opt.value = f.image_url;
                    opt.textContent = \`\underline{\${f.title}} (\${f.id})\`;
                    select.appendChild(opt);
                });
            } catch (e) {
                console.error('Error loading faces:', e);
            }
        }

        // Load existing articles and drafts
        async function loadExistingPosts() {
            try {
                const res = await fetch('/api/posts?v=' + Date.now());
                const posts = await res.json();
                
                const draftsContainer = document.getElementById('drafts-list-container');
                const postsContainer = document.getElementById('posts-list-container');
                
                draftsContainer.innerHTML = '';
                postsContainer.innerHTML = '';

                const drafts = posts.filter(p => p.draft === true);
                const published = posts.filter(p => p.draft !== true);

                // Update Drafts Count Badge
                const countBadge = document.getElementById('drafts-count');
                if (drafts.length > 0) {
                    countBadge.textContent = drafts.length;
                    countBadge.style.display = 'inline-block';
                } else {
                    countBadge.style.display = 'none';
                }

                // Render Drafts
                if (drafts.length === 0) {
                    draftsContainer.innerHTML = '<div style="color:var(--text-muted); font-size:12px; padding:6px 0;">No AI drafts pending approval.</div>';
                } else {
                    drafts.forEach(p => {
                        draftsContainer.appendChild(createPostListItem(p, true));
                    });
                }

                // Render Published
                if (published.length === 0) {
                    postsContainer.innerHTML = '<div style="color:var(--text-muted); font-size:12px; padding:6px 0;">No articles published yet.</div>';
                } else {
                    published.forEach(p => {
                        postsContainer.appendChild(createPostListItem(p, false));
                    });
                }
            } catch (e) {
                console.error('Error loading posts:', e);
            }
        }

        // Helper to construct list items
        function createPostListItem(p, isDraft) {
            const item = document.createElement('div');
            item.className = 'post-list-item';
            item.innerHTML = \`
                <div class="post-list-info">
                    <img class="post-list-thumb" src="\${p.thumbnail || 'https://raw.githubusercontent.com/creationcuespace/creation-cue-hub/main/images/ccBanner1.webp'}" alt="Thumb">
                    <div style="overflow:hidden;">
                        <div class="post-list-title" title="\${p.title}">\${p.title}</div>
                        <div class="post-list-date">\${isDraft ? '⏳ Pending Draft' : p.date}</div>
                    </div>
                </div>
                <div class="actions-wrap">
                    <button class="btn-edit" onclick="editPost('\${p.slug}', '\${p.title.replace(/'/g, "\\\\'")}', '\${p.excerpt.replace(/'/g, "\\\\'")}', '\${p.thumbnail || ''}', \${isDraft})">Edit</button>
                    <button class="btn-delete" onclick="deletePost('\${p.slug}')">\${isDraft ? 'Discard' : 'Delete'}</button>
                </div>
            \`;
            return item;
        }

        // Edit Action: Load data into form inputs
        async function editPost(slug, title, excerpt, thumbnail, isDraft) {
            showStatus('Loading article content...');
            try {
                const res = await fetch(\`/api/post-content?slug=\${slug}&v=\` + Date.now());
                if (!res.ok) throw new Error('Could not load markdown content');
                const content = await res.text();
                hideStatus();

                // Set input values
                document.getElementById('original-slug').value = slug;
                document.getElementById('post-title').value = title;
                document.getElementById('post-excerpt').value = excerpt;
                document.getElementById('post-face-select').value = thumbnail;
                easyMDE.value(content);

                // Update UI titles and buttons
                document.getElementById('editor-panel-title').innerHTML = isDraft 
                    ? \`Review AI Draft: <span class="badge-draft">Draft</span>\` 
                    : 'Edit Published Article';
                document.getElementById('btn-cancel-edit').style.display = 'block';

                // Scroll editor panel into view
                document.getElementById('editor-panel-title').scrollIntoView({ behavior: 'smooth' });
            } catch (e) {
                hideStatus();
                alert('Error loading article content: ' + e.message);
            }
        }

        // Cancel Edit Action
        function cancelEditing() {
            document.getElementById('original-slug').value = '';
            document.getElementById('post-title').value = '';
            document.getElementById('post-excerpt').value = '';
            document.getElementById('post-face-select').value = '';
            easyMDE.value('');

            document.getElementById('editor-panel-title').textContent = 'Create Custom Article';
            document.getElementById('btn-cancel-edit').style.display = 'none';
        }

        // Publish/Update Action
        async function publishPost() {
            const originalSlug = document.getElementById('original-slug').value;
            const title = document.getElementById('post-title').value.trim();
            const excerpt = document.getElementById('post-excerpt').value.trim();
            const thumbnail = document.getElementById('post-face-select').value;
            const content = easyMDE.value().trim();

            if (!title || !excerpt || !content) {
                alert('Please fill out all fields before publishing!');
                return;
            }

            showStatus('Publishing and Deploying Cloud updates...');

            try {
                const res = await fetch('/api/publish', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ title, excerpt, thumbnail, content, originalSlug })
                });
                const result = await res.json();
                hideStatus();

                if (result.success) {
                    alert('SUCCESS! Article published live to Firebase Hosting!');
                    cancelEditing();
                    loadExistingPosts();
                } else {
                    alert('Error deploying updates: ' + result.error);
                }
            } catch (e) {
                hideStatus();
                alert('An error occurred during publishing: ' + e.message);
            }
        }

        // Delete Action
        async function deletePost(slug) {
            if (!confirm('Are you absolutely sure you want to delete/discard this article? This removes it from the website permanently.')) {
                return;
            }

            showStatus('Deleting and Deploying Cloud updates...');

            try {
                const res = await fetch('/api/delete', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ slug })
                });
                const result = await res.json();
                hideStatus();

                if (result.success) {
                    alert('SUCCESS! Article deleted/discarded successfully!');
                    cancelEditing();
                    loadExistingPosts();
                } else {
                    alert('Error deploying updates: ' + result.error);
                }
            } catch (e) {
                hideStatus();
                alert('An error occurred during deletion: ' + e.message);
            }
        }

        function showStatus(msg) {
            document.getElementById('status-message').textContent = msg;
            document.getElementById('status-overlay').style.display = 'flex';
        }

        function hideStatus() {
            document.getElementById('status-overlay').style.display = 'none';
        }
    </script>
</body>
</html>`;
}
