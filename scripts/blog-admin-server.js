const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec, execSync } = require('child_process');

const PORT = 3000;
const REGISTRY_PATH = path.join(__dirname, '../blog/posts.json');
const POSTS_DIR = path.join(__dirname, '../blog/posts');
const MANAGER_PATH = path.join(__dirname, '../manager.json');
const UI_PATH = path.join(__dirname, 'admin-ui.html');

// Helper to slugify titles
function slugify(text) {
    return text.toString().toLowerCase().trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '');
}

// Git + Firebase sync
function runSync(commitMessage) {
    console.log('\n--- Starting Cloud Synchronization ---');
    try {
        console.log('1. Pulling latest...');
        execSync('git pull', { stdio: 'inherit' });
        console.log('2. Staging...');
        execSync('git add .', { stdio: 'inherit' });
        console.log('3. Committing...');
        execSync('git commit -m "' + commitMessage + '"', { stdio: 'inherit' });
        console.log('4. Pushing...');
        execSync('git push', { stdio: 'inherit' });
        console.log('5. Deploying...');
        execSync('npx firebase deploy --only hosting', { stdio: 'inherit' });
        console.log('--- Sync Completed ---\n');
        return { success: true };
    } catch (e) {
        console.error('\n[SYNC ERROR]:', e.message);
        return { success: false, error: e.message };
    }
}

// HTTP Server
const server = http.createServer(function(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');

    if (req.method === 'OPTIONS') { res.writeHead(200); res.end(); return; }

    // Serve dashboard UI
    if (req.url === '/' && req.method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(fs.readFileSync(UI_PATH, 'utf8'));
        return;
    }

    // GET all posts
    if (req.url.startsWith('/api/posts') && req.method === 'GET') {
        var posts = [];
        if (fs.existsSync(REGISTRY_PATH)) {
            try { posts = JSON.parse(fs.readFileSync(REGISTRY_PATH, 'utf8')); } catch(e) {}
        }
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(posts));
        return;
    }

    // GET post content (markdown)
    if (req.url.startsWith('/api/post-content') && req.method === 'GET') {
        var urlParams = new URL(req.url, 'http://localhost:' + PORT);
        var slug = urlParams.searchParams.get('slug');
        if (!slug) { res.writeHead(400); res.end(JSON.stringify({ error: 'Missing slug' })); return; }
        var mdPath = path.join(POSTS_DIR, slug + '.md');
        if (!fs.existsSync(mdPath)) { res.writeHead(404); res.end(JSON.stringify({ error: 'Not found' })); return; }
        res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end(fs.readFileSync(mdPath, 'utf8'));
        return;
    }

    // GET watch faces
    if (req.url === '/api/faces' && req.method === 'GET') {
        var faces = [];
        if (fs.existsSync(MANAGER_PATH)) {
            try {
                var manager = JSON.parse(fs.readFileSync(MANAGER_PATH, 'utf8'));
                faces = (manager.watch_faces || []).map(function(f) {
                    return { id: f.id, title: f.title || f.id, image_url: f.image_url };
                });
            } catch(e) {}
        }
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(faces));
        return;
    }

    // GET link metadata preview (scrape Open Graph headers)
    if (req.url.startsWith('/api/link-preview') && req.method === 'GET') {
        const urlParams = new URL(req.url, 'http://localhost:' + PORT);
        const targetUrl = urlParams.searchParams.get('url');
        if (!targetUrl) {
            res.writeHead(400);
            res.end(JSON.stringify({ error: 'Missing url parameter' }));
            return;
        }

        // Special handling for Google Play Store URLs - use google-play-scraper for reliable metadata
        if (targetUrl.includes('play.google.com/store/apps/details')) {
            try {
                const playUrl = new URL(targetUrl);
                const packageName = playUrl.searchParams.get('id');
                if (packageName) {
                    const gplay = require('google-play-scraper');
                    gplay.app({ appId: packageName }).then(appData => {
                        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
                        res.end(JSON.stringify({
                            title: (appData.title || packageName) + ' – Google Play',
                            description: appData.summary || appData.description || 'Available on Google Play Store.',
                            image: appData.icon || '',
                            url: targetUrl
                        }));
                    }).catch(err => {
                        // Fallback: return minimal data without image
                        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
                        res.end(JSON.stringify({
                            title: packageName + ' – Google Play',
                            description: 'Available on Google Play Store.',
                            image: '',
                            url: targetUrl
                        }));
                    });
                    return;
                }
            } catch(e) {}
        }

        const clientModule = targetUrl.startsWith('https') ? require('https') : require('http');
        
        // Options with User-Agent to avoid getting blocked by site firewalls
        const options = {
            timeout: 10000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5',
                'Cache-Control': 'no-cache'
            }
        };

        const clientReq = clientModule.get(targetUrl, options, (clientRes) => {
            // Handle redirects (e.g. 301, 302)
            if (clientRes.statusCode >= 300 && clientRes.statusCode < 400 && clientRes.headers.location) {
                const redirectUrl = clientRes.headers.location.startsWith('http') 
                    ? clientRes.headers.location 
                    : new URL(clientRes.headers.location, targetUrl).href;
                
                const redirectModule = redirectUrl.startsWith('https') ? require('https') : require('http');
                redirectModule.get(redirectUrl, options, (redRes) => {
                    handleResponseData(redRes, redirectUrl);
                }).on('error', (err) => {
                    sendErrorResponse(err);
                });
                return;
            }

            handleResponseData(clientRes, targetUrl);
        });

        // Timeout if no response in 10 seconds
        clientReq.setTimeout(10000, () => {
            clientReq.destroy();
            sendErrorResponse(new Error('Request timed out'));
        });

        clientReq.on('error', (err) => {
            sendErrorResponse(err);
        });

        function handleResponseData(response, urlSource) {
            let dataChunks = '';
            response.on('data', (chunk) => {
                dataChunks += chunk;
                if (dataChunks.length > 500000) {
                    response.destroy();
                }
            });

            response.on('end', () => {
                try {
                    const html = dataChunks;
                    
                    const getMetaTag = (propertyOrName) => {
                        const regex = new RegExp(`<meta[^>]*?(?:property|name)=["']${propertyOrName}["'][^>]*?content=["']([^"']*)["']`, 'i');
                        let match = html.match(regex);
                        if (!match) {
                            const regexFlipped = new RegExp(`<meta[^>]*?content=["']([^"']*)["'][^>]*?(?:property|name)=["']${propertyOrName}["']`, 'i');
                            match = html.match(regexFlipped);
                        }
                        return match ? match[1] : '';
                    };

                    const getTitleTag = () => {
                        const match = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
                        return match ? match[1].trim() : '';
                    };

                    const title = getMetaTag('og:title') || getMetaTag('twitter:title') || getTitleTag() || 'Link Preview';
                    const description = getMetaTag('og:description') || getMetaTag('twitter:description') || getMetaTag('description') || '';
                    let image = getMetaTag('og:image') || getMetaTag('twitter:image') || '';
                    
                    if (image && !image.startsWith('http') && !image.startsWith('//')) {
                        try {
                            image = new URL(image, urlSource).href;
                        } catch (e) {}
                    }

                    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
                    res.end(JSON.stringify({ title, description, image, url: urlSource }));
                } catch (e) {
                    sendErrorResponse(e);
                }
            });
        }

        function sendErrorResponse(err) {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ 
                title: 'External Link', 
                description: 'Visit page to view content.', 
                image: '', 
                url: targetUrl 
            }));
        }

        return;
    }

    // POST publish
    if (req.url === '/api/publish' && req.method === 'POST') {
        var body = '';
        req.on('data', function(chunk) { body += chunk; });
        req.on('end', function() {
            try {
                var data = JSON.parse(body);
                var title = data.title, excerpt = data.excerpt, thumbnail = data.thumbnail, content = data.content, originalSlug = data.originalSlug;
                if (!title || !excerpt || !content) {
                    res.writeHead(400); res.end(JSON.stringify({ error: 'Missing required fields' })); return;
                }

                var finalSlug = originalSlug || slugify(title);
                if (!fs.existsSync(POSTS_DIR)) fs.mkdirSync(POSTS_DIR, { recursive: true });

                var mdPath = path.join(POSTS_DIR, finalSlug + '.md');
                fs.writeFileSync(mdPath, content, 'utf8');

                var posts = [];
                if (fs.existsSync(REGISTRY_PATH)) {
                    try { posts = JSON.parse(fs.readFileSync(REGISTRY_PATH, 'utf8')); } catch(e) {}
                }

                var existing = posts.find(function(p) { return p.slug === finalSlug; });
                var dateStr = existing ? existing.date : new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                var wordCount = content.split(/\s+/).length;

                posts = posts.filter(function(p) { return p.slug !== finalSlug; });
                posts.unshift({
                    slug: finalSlug,
                    title: title,
                    date: dateStr,
                    readTime: Math.max(1, Math.ceil(wordCount / 200)) + ' min',
                    excerpt: excerpt,
                    thumbnail: thumbnail || 'https://raw.githubusercontent.com/creationcuespace/creation-cue-hub/main/images/ccBanner1.webp',
                    draft: false
                });

                fs.writeFileSync(REGISTRY_PATH, JSON.stringify(posts, null, 2), 'utf8');
                var syncResult = runSync('feat: published blog post: ' + title);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(syncResult));
            } catch(err) {
                res.writeHead(500); res.end(JSON.stringify({ error: err.message }));
            }
        });
        return;
    }

    // POST delete
    if (req.url === '/api/delete' && req.method === 'POST') {
        var body = '';
        req.on('data', function(chunk) { body += chunk; });
        req.on('end', function() {
            try {
                var data = JSON.parse(body);
                var slug = data.slug;
                if (!slug) { res.writeHead(400); res.end(JSON.stringify({ error: 'Missing slug' })); return; }

                var mdPath = path.join(POSTS_DIR, slug + '.md');
                if (fs.existsSync(mdPath)) fs.unlinkSync(mdPath);

                var posts = [];
                if (fs.existsSync(REGISTRY_PATH)) {
                    try { posts = JSON.parse(fs.readFileSync(REGISTRY_PATH, 'utf8')); } catch(e) {}
                }

                var target = posts.find(function(p) { return p.slug === slug; });
                var titleStr = target ? target.title : slug;
                posts = posts.filter(function(p) { return p.slug !== slug; });
                fs.writeFileSync(REGISTRY_PATH, JSON.stringify(posts, null, 2), 'utf8');

                var syncResult = runSync('chore: deleted blog post: ' + titleStr);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(syncResult));
            } catch(err) {
                res.writeHead(500); res.end(JSON.stringify({ error: err.message }));
            }
        });
        return;
    }

    res.writeHead(404); res.end('Not Found');
});

// Port fallback
function startServer(port) {
    server.once('error', function(err) {
        if (err.code === 'EADDRINUSE') {
            console.log('Port ' + port + ' in use, trying ' + (port + 1) + '...');
            startServer(port + 1);
        } else {
            console.error('Server error:', err);
        }
    });

    server.listen(port, function() {
        console.log('=============================================');
        console.log('  CreationCue Blog Admin Server Running');
        console.log('  URL: http://localhost:' + port);
        console.log('=============================================');
        var url = 'http://localhost:' + port;
        exec(process.platform === 'win32' ? 'start ' + url : 'open ' + url);
    });
}

// Pull latest drafts on startup
console.log('=== Checking for AI Drafts & Cloud Updates ===');
try {
    execSync('git pull', { stdio: 'inherit' });
} catch(e) {
    console.warn('Startup git pull skipped:', e.message);
}

startServer(PORT);
