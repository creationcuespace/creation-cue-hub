document.addEventListener('DOMContentLoaded', () => {
    initBlogCarousel();
});

async function initBlogCarousel() {
    const container = document.getElementById('blog-carousel-slider');
    if (!container) return;

    try {
        // Fetch files from the parent directory relative to this blog post
        const [managerResponse, versionsResponse] = await Promise.all([
            fetch('../manager.json'),
            fetch('../versions-data.json')
        ]);

        if (!managerResponse.ok || !versionsResponse.ok) {
            throw new Error('Failed to load catalog or versions data.');
        }

        const managerData = await managerResponse.json();
        const versionsData = await versionsResponse.json();

        const watchFaces = managerData.watch_faces || [];
        const versions = versionsData.results || [];

        // 1. Identify Fresh Releases (NEW badge/filter)
        const freshReleases = watchFaces.filter(face => {
            const badgeText = (face.badge_text || '').toUpperCase();
            const filters = face.filters || [];
            return badgeText === 'NEW' || filters.includes('NEW');
        });

        // 2. Identify Recently Updated (Sort versions by date desc)
        const sortedVersions = [...versions].sort((a, b) => {
            const dateA = new Date(a.lastUpdatedDate || 0);
            const dateB = new Date(b.lastUpdatedDate || 0);
            return dateB - dateA;
        });

        // 3. Select items ensuring no duplicates
        const selectedIds = new Set();
        const carouselItems = [];

        // Add up to 2 Fresh Releases
        for (const face of freshReleases) {
            if (carouselItems.length >= 2) break;
            const cleanId = face.id.toLowerCase();
            if (!selectedIds.has(cleanId)) {
                selectedIds.add(cleanId);
                carouselItems.push({
                    face: face,
                    badge: 'new',
                    badgeText: 'New'
                });
            }
        }

        // Add Recently Updated faces to fill up to 10 items total
        for (const ver of sortedVersions) {
            if (carouselItems.length >= 10) break;
            const cleanId = ver.id.toLowerCase();
            
            // Check if already added
            if (selectedIds.has(cleanId)) continue;

            // Find full watch face details in manager.json catalog
            const face = watchFaces.find(f => f.id.toLowerCase() === cleanId);
            if (face) {
                selectedIds.add(cleanId);
                carouselItems.push({
                    face: face,
                    badge: 'updated',
                    badgeText: 'Updated'
                });
            }
        }

        // Render HTML for selected carousel items
        if (carouselItems.length === 0) {
            container.innerHTML = '<p style="color:var(--text-muted); font-size:12px; padding:10px 0;">Check back later for fresh designs.</p>';
            return;
        }

        container.innerHTML = '';
        carouselItems.forEach(item => {
            const face = item.face;
            const playStoreWebUrl = getWebPlayStoreUrl(face.play_store_url);
            
            // Create optimized image URL
            const optimizedImg = `https://wsrv.nl/?url=${encodeURIComponent(face.image_url)}&w=150&output=webp&q=80`;

            const card = document.createElement('a');
            card.className = 'related-card';
            card.href = playStoreWebUrl;
            card.target = '_blank';
            card.innerHTML = `
                <img class="related-card-img" src="${optimizedImg}" alt="${face.title}" loading="lazy" onerror="this.src='https://cdn.jsdelivr.net/gh/creationcuespace/creation-cue-hub@main/images/logo.png'">
                <span class="related-card-badge ${item.badge}">${item.badgeText}</span>
                <div class="related-card-title">${face.title}</div>
            `;
            container.appendChild(card);
        });

    } catch (err) {
        console.error('Error loading blog carousel:', err);
        container.innerHTML = '<p style="color:var(--text-muted); font-size:12px; padding:10px 0;">Unable to load watch faces at this time.</p>';
    }
}

// Helper to convert market:// deep-link to standard Play Store web URL
function getWebPlayStoreUrl(marketUrl) {
    if (!marketUrl) return 'https://play.google.com/store/apps/developer?id=CreationCue';
    if (marketUrl.startsWith('market://details?id=')) {
        return marketUrl.replace('market://details?id=', 'https://play.google.com/store/apps/details?id=');
    }
    return marketUrl;
}
