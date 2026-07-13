const fs = require('fs');
const path = require('path');
const https = require('https');

// Configuration
const FEEDS = [
    'https://www.wareable.com/feeds/news',
    'https://www.reddit.com/r/WatchFaces/.rss',
    'https://www.reddit.com/r/GalaxyWatch/.rss',
    'https://android-developers.googleblog.com/feeds/posts/default/-/Wear%20OS',
    'https://9to5google.com/guides/wear-os/feed/'
];

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Entry point
async function main() {
    console.log('--- Starting Wear OS Blog Generator ---');
    
    // 1. Fetch news from RSS sources
    console.log('Fetching RSS feeds...');
    const newsItems = [];
    for (const feedUrl of FEEDS) {
        try {
            const xml = await fetchUrl(feedUrl);
            const items = parseRss(xml);
            console.log(`Successfully fetched ${items.length} items from: ${feedUrl}`);
            newsItems.push(...items);
        } catch (err) {
            console.warn(`Failed to fetch feed ${feedUrl}:`, err.message);
        }
    }

    if (newsItems.length === 0) {
        console.warn('No news articles found. Using fallback mock topics...');
    }

    // Sort or filter recent items (Reddit feeds can contain a lot of noise, so prioritize titles)
    const filteredNews = newsItems
        .filter(item => item.title && !item.title.toLowerCase().includes('removed') && !item.title.toLowerCase().includes('deleted'))
        .slice(0, 15); // Top 15 articles to feed Gemini

    console.log(`Selected ${filteredNews.length} articles for synthesis.`);

    // 2. Draft content using Google Gemini API or Mock Fallback
    let blogData;
    if (GEMINI_API_KEY) {
        try {
            console.log('Generating article content using Gemini API...');
            blogData = await generateArticleWithGemini(filteredNews);
        } catch (err) {
            console.error('Gemini API call failed, falling back to mock generator:', err.message);
            blogData = generateMockArticle();
        }
    } else {
        console.log('GEMINI_API_KEY environment variable not found. Generating mock draft...');
        blogData = generateMockArticle();
    }

    // 3. Prepare article metadata
    const dateObj = new Date();
    const dateStr = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const slug = slugify(blogData.title);
    
    // 4. Build Sources HTML
    let sourcesHtml = '';
    if (blogData.sourcesUsed && blogData.sourcesUsed.length > 0) {
        sourcesHtml = blogData.sourcesUsed.map(src => {
            const url = src.url || 'https://wearos.google.com';
            const domain = extractDomain(url);
            return `<a href="${url}" target="_blank">${src.title || domain} (${domain})</a>`;
        }).join(', ');
    } else {
        // Fallback references if API didn't list explicit sources
        const sourceLinks = filteredNews.slice(0, 2);
        if (sourceLinks.length > 0) {
            sourcesHtml = sourceLinks.map(s => `<a href="${s.link}" target="_blank">${s.title}</a>`).join(', ');
        } else {
            sourcesHtml = '<a href="https://android-developers.googleblog.com" target="_blank">Android Developers Blog</a>';
        }
    }

    // 5. Load Template and inject values
    const templatePath = path.join(__dirname, '../blog/blog-template.html');
    if (!fs.existsSync(templatePath)) {
        throw new Error(`Base template not found at: ${templatePath}`);
    }
    
    let templateHtml = fs.readFileSync(templatePath, 'utf8');
    
    const placeholders = {
        '{{BLOG_META_TITLE}}': `${blogData.title} | CreationCue™ Blog`,
        '{{BLOG_META_DESCRIPTION}}': blogData.excerpt,
        '{{BLOG_CANONICAL_URL}}': `https://creationcuespace.github.io/creation-cue-hub/blog/${slug}.html`,
        '{{BLOG_OG_TITLE}}': blogData.title,
        '{{BLOG_OG_DESCRIPTION}}': blogData.excerpt,
        '{{BLOG_OG_IMAGE}}': 'https://raw.githubusercontent.com/creationcuespace/creation-cue-hub/main/images/ccBanner1.webp',
        '{{BLOG_DATE}}': dateStr,
        '{{BLOG_READ_TIME}}': blogData.readTime || '3 min',
        '{{BLOG_TITLE}}': blogData.title,
        '{{BLOG_CONTENT}}': blogData.content,
        '{{BLOG_SOURCES}}': sourcesHtml
    };

    for (const [token, value] of Object.entries(placeholders)) {
        templateHtml = templateHtml.replaceAll(token, value);
    }

    // 6. Write article HTML file
    const outputDir = path.join(__dirname, '../blog');
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }
    
    const outputPath = path.join(outputDir, `${slug}.html`);
    fs.writeFileSync(outputPath, templateHtml, 'utf8');
    console.log(`Successfully generated article file at: ${outputPath}`);

    // 7. Update posts.json registry list
    const registryPath = path.join(outputDir, 'posts.json');
    let posts = [];
    if (fs.existsSync(registryPath)) {
        try {
            posts = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
        } catch (e) {
            console.warn('Registry posts.json was corrupted. Resetting...');
            posts = [];
        }
    }

    // Avoid duplicating entry
    posts = posts.filter(p => p.slug !== slug);
    posts.unshift({
        slug: slug,
        title: blogData.title,
        date: dateStr,
        readTime: blogData.readTime || '3 min',
        excerpt: blogData.excerpt,
        thumbnail: 'https://raw.githubusercontent.com/creationcuespace/creation-cue-hub/main/images/ccBanner1.webp'
    });

    fs.writeFileSync(registryPath, JSON.stringify(posts, null, 2), 'utf8');
    console.log(`Successfully updated posts registry index: ${registryPath}`);
    console.log('--- Blog Generation Complete ---');
}

// REST HTTPS GET wrapper
function fetchUrl(url) {
    return new Promise((resolve, reject) => {
        https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, (res) => {
            if (res.statusCode < 200 || res.statusCode >= 300) {
                return reject(new Error(`Status Code: ${res.statusCode}`));
            }
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(data));
        }).on('error', err => reject(err));
    });
}

// Zero-dependency XML RSS/Atom parser
function parseRss(xmlText) {
    const items = [];
    // Match both RSS <item> and Atom <entry>
    const matches = xmlText.match(/<item>([\s\S]*?)<\/item>|<entry>([\s\S]*?)<\/entry>/g) || [];
    
    for (const match of matches) {
        const titleMatch = match.match(/<title[^>]*>([\s\S]*?)<\/title>/);
        const linkMatch = match.match(/<link[^>]*href=["']([\s\S]*?)["']|<link[^>]*>([\s\S]*?)<\/link>/);
        const descMatch = match.match(/<description[^>]*>([\s\S]*?)<\/description>|<summary[^>]*>([\s\S]*?)<\/summary>|<content[^>]*>([\s\S]*?)<\/content>/);
        
        let title = titleMatch ? titleMatch[1] : '';
        let link = linkMatch ? (linkMatch[1] || linkMatch[2]) : '';
        let description = descMatch ? descMatch[1] : '';
        
        // Clean CDATA and tags
        title = cleanXmlText(title);
        link = cleanXmlLink(link);
        description = cleanXmlText(description);

        if (title && link) {
            items.push({ title, link, description });
        }
    }
    return items;
}

function cleanXmlText(text) {
    if (!text) return '';
    return text
        .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1') // Remove CDATA tags
        .replace(/<\/?[^>]+(>|$)/g, "") // Remove HTML tags
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .trim();
}

function cleanXmlLink(link) {
    if (!link) return '';
    return link.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').trim();
}

// Gemini REST request
function generateArticleWithGemini(newsItems) {
    return new Promise((resolve, reject) => {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;
        
        const contextHeadlines = newsItems.map((n, i) => `[${i+1}] Title: "${n.title}"\nUrl: "${n.link}"`).join('\n\n');
        
        const prompt = `You are a professional technology journalist writing for CreationCue, a premium Wear OS watch face design studio.
Review the following recent Wear OS news headlines and forum topics:

${contextHeadlines}

Write a highly engaging, professional blog article (around 350-450 words) that discusses 1-2 major announcements, trends, or community issues from the topics above. 
Provide a clear analysis of what these news updates mean for smartwatch users and smartwatch styling/personalization. 

Your response MUST be a structured JSON object with the following keys:
- "title": A catchy, SEO-friendly headline.
- "excerpt": A 2-sentence summary of the article for listings.
- "readTime": Estimated read time (e.g. "3 min").
- "content": The body content of the article formatted strictly in clean HTML paragraphs (<p>), subheadings (<h2>), and blockquotes (<blockquote>) if needed. Do NOT wrap in markdown formatting (such as triple backticks html).
- "sourcesUsed": An array of objects representing the sources you discussed, with keys "title" and "url" matching the exact URLs provided in the list.

Respond ONLY with the JSON object. Do not include markdown code block syntax.`;

        const requestBody = JSON.stringify({
            contents: [{
                parts: [{ text: prompt }]
            }],
            generationConfig: {
                responseMimeType: 'application/json'
            }
        });

        const req = https.request(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                if (res.statusCode < 200 || res.statusCode >= 300) {
                    return reject(new Error(`Gemini API Error (status ${res.statusCode}): ${data}`));
                }
                try {
                    const parsedResponse = JSON.parse(data);
                    const responseText = parsedResponse.candidates[0].content.parts[0].text;
                    const blogJSON = JSON.parse(responseText);
                    resolve(blogJSON);
                } catch (err) {
                    reject(new Error(`Failed to parse Gemini response payload: ${err.message}`));
                }
            });
        });

        req.on('error', err => reject(err));
        req.write(requestBody);
        req.end();
    });
}

// Fallback Mock Article Generator
function generateMockArticle() {
    return {
        title: 'New Wear OS Upgrades focus on Battery & Design customization',
        excerpt: 'Google just announced major refinements to the Watch Face Format, offering designers and users much better battery life and richer complication options.',
        readTime: '3 min',
        content: `
            <p>Google has officially introduced new updates for Wear OS smartwatch customization. The new features focus heavily on performance optimizations and streamlining how complication layout metrics are delivered to watch displays.</p>
            <h2>Richer Complications & Dynamic Customization</h2>
            <p>Under the hood, the updated Watch Face Format allows designers to build animations and dynamic status meters that consume significantly less standby battery. Instead of refreshing the entire screen, smartwatches will run localized updates on specific indicators, keeping watch face widgets alive without compromising hardware efficiency.</p>
            <blockquote>This transition represents a major leap forward for smartwatch designers, opening up new creative options for deep customization while preserving critical battery life.</blockquote>
            <h2>What it means for CreationCue Watch Faces</h2>
            <p>As active designers, these upgrades enable us to build watch faces with richer customized widgets, custom icons, and smoother digital complications. In the coming weeks, we will be updating our flagship watch face catalogs to take full advantage of these system improvements, ensuring a premium, optimized experience on your wrist.</p>
        `,
        sourcesUsed: [
            { title: 'Android Developers Blog', url: 'https://android-developers.googleblog.com/feeds/posts/default/-/Wear%20OS' }
        ]
    };
}

// Slugify utility
function slugify(text) {
    return text
        .toString()
        .toLowerCase()
        .replace(/\s+/g, '-')           // Replace spaces with -
        .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
        .replace(/\-\-+/g, '-')         // Replace multiple - with single -
        .replace(/^-+/, '')             // Trim - from start
        .replace(/-+$/, '');            // Trim - from end
}

function extractDomain(url) {
    try {
        const hostname = new URL(url).hostname;
        return hostname.replace('www.', '');
    } catch (e) {
        return 'source';
    }
}

// Run script
main().catch(err => {
    console.error('Critical Script Execution Error:', err);
    process.exit(1);
});
