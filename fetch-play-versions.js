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
  
  console.log(`Found ${watchFaces.length} watch faces in manager.json.`);
  console.log('Fetching active version codes and last updated dates...\n');

  const results = [];

  for (let i = 0; i < watchFaces.length; i++) {
    const wf = watchFaces[i];
    const packageName = getPackageName(wf.play_store_url);
    if (!packageName) {
      console.log(`[${i + 1}/${watchFaces.length}] Skipping ${wf.id || wf.title} - No package name found.`);
      continue;
    }

    process.stdout.write(`[${i + 1}/${watchFaces.length}] Fetching ${wf.id} (${packageName})... `);

    let companionVersion = 'N/A';
    let wearVersion = 'N/A';
    let lastUpdatedDate = 'N/A';

    try {
      // Create a edit transaction for the Google Play Developer API
      const edit = await play.edits.insert({
        packageName,
      });
      const editId = edit.data.id;

      try {
        // Query phone companion app version (production track)
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
      } catch (e) {
        // Track might not exist or contain active releases
      }

      try {
        // Query Wear OS app version (wear:production track)
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
      } catch (e) {
        // Wear track might not exist or contain active releases
      }

      // Cleanup edit transaction
      await play.edits.delete({
        packageName,
        editId,
      });

    } catch (apiError) {
      // If service account lacks permission for this package, or API is disabled
      companionVersion = `API Error: ${apiError.code || apiError.message}`;
      wearVersion = `API Error: ${apiError.code || apiError.message}`;
    }

    // Scrape last updated date from Play Store
    try {
      const playStoreUrl = `https://play.google.com/store/apps/details?id=${packageName}&hl=en`;
      const response = await axios.get(playStoreUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept-Language': 'en-US,en;q=0.9',
        },
        timeout: 5000
      });
      const html = response.data;
      const regex = /Updated on<\/div><div class="[^"]+">([^<]+)<\/div>/i;
      const match = html.match(regex);
      if (match) {
        lastUpdatedDate = match[1];
      }
    } catch (scrapeError) {
      lastUpdatedDate = 'Fetch Failed';
    }

    console.log(`Done (Companion: ${companionVersion}, Wear: ${wearVersion}, Updated: ${lastUpdatedDate})`);

    results.push({
      id: wf.id,
      title: wf.title,
      packageName,
      companionVersion,
      wearVersion,
      lastUpdatedDate,
    });
  }

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

  // Save results to versions-data.json
  const versionsDataPath = path.join(__dirname, 'versions-data.json');
  const outputData = {
    lastUpdated: new Date().toISOString(),
    results: results
  };
  fs.writeFileSync(versionsDataPath, JSON.stringify(outputData, null, 2), 'utf8');
  console.log(`Saved version data to ${versionsDataPath}`);
}

main().catch(err => {
  console.error('Fatal Error:', err);
});
