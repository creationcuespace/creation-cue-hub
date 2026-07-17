const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

// Helper to extract the package name from market:// or play.google.com URLs
function getPackageName(urlStr) {
  if (!urlStr) return null;
  try {
    let checkUrl = urlStr.trim();
    if (checkUrl.startsWith('market://')) {
      checkUrl = checkUrl.replace('market://', 'https://play.google.com/');
    }
    const parsed = new URL(checkUrl);
    return parsed.searchParams.get('id');
  } catch (e) {
    // Fallback if URL parsing fails
    const match = urlStr.match(/[?&]id=([^&]+)/);
    return match ? match[1] : null;
  }
}

async function main() {
  const credentialsPath = path.join(__dirname, 'play-credentials.json');
  
  if (!fs.existsSync(credentialsPath)) {
    console.error('\x1b[31mError: play-credentials.json not found!\x1b[0m');
    console.log('\nTo run this script, please obtain a Google Play Developer Service Account key file, rename it to "play-credentials.json", and place it in the same directory as this script.');
    console.log('See the instructions in the Walkthrough for how to generate this key.');
    process.exit(1);
  }

  console.log('Authenticating with Google Play Developer API...');
  const auth = new google.auth.GoogleAuth({
    keyFile: credentialsPath,
    scopes: ['https://www.googleapis.com/auth/androidpublisher'],
  });

  const play = google.androidpublisher({
    version: 'v3',
    auth,
  });

  const managerPath = path.join(__dirname, 'manager.json');
  if (!fs.existsSync(managerPath)) {
    console.error(`\x1b[31mError: manager.json not found at ${managerPath}\x1b[0m`);
    process.exit(1);
  }

  const managerData = JSON.parse(fs.readFileSync(managerPath, 'utf8'));
  const watchFaces = managerData.watch_faces || [];
  
  // Parse command line arguments for target packages to scan
  let targetPackageNames = [];
  const args = process.argv.slice(2);
  for (const arg of args) {
    if (arg.startsWith('--packages=')) {
      targetPackageNames = arg.split('=')[1].split(',').map(p => p.trim()).filter(Boolean);
    }
  }

  let targetWatchFaces = watchFaces;
  if (targetPackageNames.length > 0) {
    targetWatchFaces = watchFaces.filter(wf => {
      const pkg = getPackageName(wf.play_store_url);
      return pkg && targetPackageNames.includes(pkg);
    });
    console.log(`Filtering scan to target packages: ${targetPackageNames.join(', ')} (${targetWatchFaces.length} matches).`);
  }

  const CONCURRENCY = 10;
  const results = [];
  const allReviews = [];

  console.log(`Found ${watchFaces.length} watch faces in manager.json.`);
  console.log(`Scanning ${targetWatchFaces.length} watch faces with concurrency level ${CONCURRENCY}...\n`);

  async function worker(wf, index, total) {
    const packageName = getPackageName(wf.play_store_url);
    if (!packageName) {
      console.log(`[${index}/${total}] Skipping ${wf.id || wf.title} - No package name found.`);
      return;
    }

    let companionVersion = 'N/A';
    let wearVersion = 'N/A';
    let lastUpdatedDate = 'N/A';
    let playStoreTitle = wf.title;

    try {
      const edit = await play.edits.insert({
        packageName,
      });
      const editId = edit.data.id;

      try {
        const track = await play.edits.tracks.get({
          packageName,
          editId,
          track: 'production',
        });
        if (track.data.releases && track.data.releases.length > 0) {
          const activeRelease = track.data.releases.find(r => r.status === 'completed' || r.status === 'inProgress');
          if (activeRelease) {
            companionVersion = activeRelease.name || (activeRelease.versionCodes ? activeRelease.versionCodes.join(', ') : 'N/A');
          }
        }
      } catch (e) {}

      try {
        const wearTrack = await play.edits.tracks.get({
          packageName,
          editId,
          track: 'wear:production',
        });
        if (wearTrack.data.releases && wearTrack.data.releases.length > 0) {
          const activeRelease = wearTrack.data.releases.find(r => r.status === 'completed' || r.status === 'inProgress');
          if (activeRelease) {
            wearVersion = activeRelease.name || (activeRelease.versionCodes ? activeRelease.versionCodes.join(', ') : 'N/A');
          }
        }
      } catch (e) {}

      await play.edits.delete({
        packageName,
        editId,
      });

    } catch (apiError) {
      companionVersion = `API Error: ${apiError.code || apiError.message}`;
      wearVersion = `API Error: ${apiError.code || apiError.message}`;
    }

    try {
      const playStoreUrl = `https://play.google.com/store/apps/details?id=${packageName}&hl=en`;
      const response = await axios.get(playStoreUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, fill=none; Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept-Language': 'en-US,en;q=0.9',
        },
        timeout: 5000
      });
      const html = response.data;
      
      const dateRegex = /Updated on<\/div><div class="[^"]+">([^<]+)<\/div>/i;
      const dateMatch = html.match(dateRegex);
      if (dateMatch) {
        lastUpdatedDate = dateMatch[1];
      }

      const titleRegex = /<title[^>]*>([^<]+)<\/title>/i;
      const titleMatch = html.match(titleRegex);
      if (titleMatch) {
        let parsedTitle = titleMatch[1].trim();
        parsedTitle = parsedTitle.replace(/\s*-\s*Apps on Google Play$/i, '');
        if (parsedTitle) {
          playStoreTitle = parsedTitle;
        }
      }
    } catch (scrapeError) {
      lastUpdatedDate = 'Fetch Failed';
    }

    console.log(`[${index}/${total}] Done: ${wf.id} (Companion: ${companionVersion}, Wear: ${wearVersion}, Updated: ${lastUpdatedDate}, Title: ${playStoreTitle})`);

    // Fetch Unreplied Reviews
    try {
      const reviewsResponse = await play.reviews.list({
        packageName,
        maxResults: 50 // Fetch recent reviews
      });
      
      if (reviewsResponse.data.reviews && reviewsResponse.data.reviews.length > 0) {
        for (const review of reviewsResponse.data.reviews) {
          const comments = review.comments || [];
          const userCommentObj = comments.find(c => c.userComment);
          const devReplyObj = comments.find(c => c.developerComment);
          
          if (userCommentObj && !devReplyObj) {
            const c = userCommentObj.userComment;
            allReviews.push({
              reviewId: review.reviewId,
              packageName,
              title: playStoreTitle || wf.title,
              wfId: wf.id,
              starRating: c.starRating,
              reviewerLanguage: c.reviewerLanguage,
              deviceMetadata: c.deviceMetadata ? c.deviceMetadata.productName : 'Unknown',
              text: c.text,
              lastModified: c.lastModified ? new Date(parseInt(c.lastModified.seconds, 10) * 1000).toISOString() : new Date().toISOString()
            });
          }
        }
      }
    } catch (reviewError) {
      // Ignore 403 errors (permissions) silently to not spam logs if some apps lack review access, 
      // but you can log them if needed. We'll just silently skip to not break version fetching.
    }

    results.push({
      id: wf.id,
      title: wf.title,
      playStoreTitle,
      packageName,
      companionVersion,
      wearVersion,
      lastUpdatedDate,
    });
  }

  let activeIndex = 0;
  const promises = [];
  
  async function next() {
    if (activeIndex >= targetWatchFaces.length) return;
    const currentIdx = activeIndex++;
    const wf = targetWatchFaces[currentIdx];
    await worker(wf, currentIdx + 1, targetWatchFaces.length);
    await next();
  }

  for (let i = 0; i < Math.min(CONCURRENCY, targetWatchFaces.length); i++) {
    promises.push(next());
  }

  await Promise.all(promises);

  // Generate markdown output
  console.log('\n\n================================================================');
  console.log('## Google Play Store App Versions and Dates');
  console.log('================================================================\n');
  console.log('| ID | Title | Package Name | Companion Version Code | Wear OS Version Code | Last Updated (Play Store) |');
  console.log('| :--- | :--- | :--- | :--- | :--- | :--- |');
  for (const res of results) {
    console.log(`| ${res.id} | ${res.title} | \`${res.packageName}\` | ${res.companionVersion} | ${res.wearVersion} | ${res.lastUpdatedDate} |`);
  }
  console.log('\n================================================================\n');

  // Save and merge results to versions-data.json
  const versionsDataPath = path.join(__dirname, 'versions-data.json');
  let finalResults = results;
  
  if (fs.existsSync(versionsDataPath)) {
    try {
      const existingData = JSON.parse(fs.readFileSync(versionsDataPath, 'utf8'));
      const existingResults = existingData.results || [];
      
      const mergedMap = new Map();
      for (const res of existingResults) {
        mergedMap.set(res.packageName, res);
      }
      for (const res of results) {
        mergedMap.set(res.packageName, res);
      }
      finalResults = Array.from(mergedMap.values());
    } catch (e) {
      console.warn("Could not merge with existing data, overwriting instead:", e.message);
    }
  }

  const outputData = {
    lastUpdated: new Date().toISOString(),
    results: finalResults
  };
  fs.writeFileSync(versionsDataPath, JSON.stringify(outputData, null, 2), 'utf8');
  console.log(`Saved version data to ${versionsDataPath}`);

  // Save and merge reviews data
  const reviewsDataPath = path.join(__dirname, 'reviews-data.json');
  let finalReviews = allReviews;

  if (fs.existsSync(reviewsDataPath)) {
    try {
      const existingReviewsData = JSON.parse(fs.readFileSync(reviewsDataPath, 'utf8'));
      const existingReviews = existingReviewsData.reviews || [];
      
      // Remove old reviews for the packages we just scanned
      const scannedPackages = new Set(targetWatchFaces.map(wf => getPackageName(wf.play_store_url)).filter(Boolean));
      const retainedReviews = existingReviews.filter(r => !scannedPackages.has(r.packageName));
      
      finalReviews = [...retainedReviews, ...allReviews];
      
      // Sort reviews by date descending
      finalReviews.sort((a, b) => new Date(b.lastModified) - new Date(a.lastModified));
    } catch (e) {
      console.warn("Could not merge with existing reviews data, overwriting instead:", e.message);
    }
  }

  const outputReviewsData = {
    lastUpdated: new Date().toISOString(),
    reviews: finalReviews
  };
  fs.writeFileSync(reviewsDataPath, JSON.stringify(outputReviewsData, null, 2), 'utf8');
  console.log(`Saved reviews data to ${reviewsDataPath} (${finalReviews.length} unreplied reviews)`);
}

main().catch(err => {
  console.error('Fatal Error:', err);
});
