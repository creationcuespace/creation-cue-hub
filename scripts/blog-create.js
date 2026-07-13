const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { execSync } = require('child_process');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function question(query) {
    return new Promise(resolve => rl.question(query, resolve));
}

function slugify(text) {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')           // Replace spaces with -
        .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
        .replace(/\-\-+/g, '-')         // Replace multiple - with single -
        .replace(/^-+/, '')             // Trim - from start
        .replace(/-+$/, '');            // Trim - from end
}

async function main() {
    console.log('=== CreationCue Blog Post Creator ===\n');

    const title = await question('1. Enter article title: ');
    if (!title.trim()) {
        console.error('Error: Title is required.');
        process.exit(1);
    }

    const excerpt = await question('2. Enter short summary (excerpt): ');
    if (!excerpt.trim()) {
        console.error('Error: Excerpt is required.');
        process.exit(1);
    }

    const faceId = await question('3. Enter featured watch face ID (e.g. cue178, leave empty for default): ');
    
    // Look up watch face cover in manager.json
    let thumbnail = 'https://raw.githubusercontent.com/creationcuespace/creation-cue-hub/main/images/ccBanner1.webp';
    const managerPath = path.join(__dirname, '../manager.json');
    if (fs.existsSync(managerPath)) {
        try {
            const manager = JSON.parse(fs.readFileSync(managerPath, 'utf8'));
            const faces = manager.watch_faces || [];
            const matched = faces.find(f => f.id.toLowerCase() === faceId.trim().toLowerCase());
            if (matched && matched.image_url) {
                thumbnail = matched.image_url;
                console.log(`Matched watch face: ${matched.title} (${thumbnail})`);
            } else if (faceId.trim()) {
                console.log(`No match for watch face ID "${faceId}". Using default thumbnail.`);
            }
        } catch (e) {
            console.warn('Could not read manager.json for thumbnail selection:', e.message);
        }
    }

    const slug = slugify(title);
    const postDir = path.join(__dirname, '../blog/posts');
    if (!fs.existsSync(postDir)) {
        fs.mkdirSync(postDir, { recursive: true });
    }

    const mdPath = path.join(postDir, `${slug}.md`);
    
    // Write default markdown skeleton
    const defaultContent = `# ${title}\n\nWrite your article content here in plain text. You can use standard formatting like:\n\n## Subheading\n- Bullet items\n- More items\n\n**Bold text** or *italic text*\n\n> This is a quote block if you need one.\n`;
    fs.writeFileSync(mdPath, defaultContent, 'utf8');

    console.log(`\nDraft created at: ${mdPath}`);
    console.log('Notepad will now open. Write your article, save it, and CLOSE Notepad when done.');
    
    await question('\nPress [Enter] to open Notepad...');

    // Open Notepad and block until it is closed
    try {
        execSync(`notepad "${mdPath}"`, { stdio: 'inherit' });
    } catch (err) {
        console.error('Failed to open Notepad automatically. Please open and edit the file manually, then return here.');
        await question('Press [Enter] after you finish editing the file...');
    }

    // Verify user actually wrote something
    const editedContent = fs.readFileSync(mdPath, 'utf8');
    if (editedContent.trim() === defaultContent.trim()) {
        console.log('\nPublish cancelled: No changes made to the draft.');
        rl.close();
        return;
    }

    console.log('\nArticle finalized. Updating registry index...');

    // Update posts.json registry
    const registryPath = path.join(__dirname, '../blog/posts.json');
    let posts = [];
    if (fs.existsSync(registryPath)) {
        try {
            posts = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
        } catch (e) {
            posts = [];
        }
    }

    const dateObj = new Date();
    const dateStr = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    // Remove existing post with same slug to avoid duplicate
    posts = posts.filter(p => p.slug !== slug);
    
    // Add new post to top of array
    posts.unshift({
        slug,
        title,
        date: dateStr,
        readTime: '3 min', // Default estimation
        excerpt,
        thumbnail
    });

    fs.writeFileSync(registryPath, JSON.stringify(posts, null, 2), 'utf8');
    console.log('Registry index updated successfully.');

    // Auto deploy and sync
    console.log('\n=============================================');
    console.log('   PUBLISHING LIVE TO GITHUB AND FIREBASE    ');
    console.log('=============================================\n');

    try {
        console.log('1. Pulling latest remote changes...');
        execSync('git pull', { stdio: 'inherit' });

        console.log('\n2. Committing changes...');
        execSync('git add .', { stdio: 'inherit' });
        execSync(`git commit -m "feat: manually published blog post: ${title}"`, { stdio: 'inherit' });

        console.log('\n3. Pushing to GitHub repository...');
        execSync('git push', { stdio: 'inherit' });

        console.log('\n4. Deploying to Firebase Hosting...');
        execSync('npx firebase deploy --only hosting', { stdio: 'inherit' });

        console.log('\nSUCCESS! Your article is live at:');
        console.log(`https://creationcue.web.app/blog/post.html?id=${slug}`);
    } catch (err) {
        console.error('\n[ERROR] An error occurred during git sync or firebase deploy:', err.message);
        console.log('Your local draft has been saved. You can deploy it manually later.');
    }

    rl.close();
}

main();
