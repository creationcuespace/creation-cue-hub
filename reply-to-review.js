const { google } = require('googleapis');
const fs = require('fs');
const { execSync } = require('child_process');

function updateAndCommitReviews(reviewId, reason) {
  try {
    if (!fs.existsSync('reviews-data.json')) {
      console.log('reviews-data.json not found, skipping file update.');
      return;
    }

    const data = JSON.parse(fs.readFileSync('reviews-data.json', 'utf8'));
    if (data && Array.isArray(data.reviews)) {
      const initialCount = data.reviews.length;
      data.reviews = data.reviews.filter(r => r.reviewId !== reviewId);

      if (data.reviews.length < initialCount) {
        data.lastUpdated = new Date().toISOString();
        fs.writeFileSync('reviews-data.json', JSON.stringify(data, null, 2), 'utf8');
        console.log(`Removed review ${reviewId} from reviews-data.json (${reason}).`);

        // If running in GitHub Actions CI, commit and push changes back to repository
        if (process.env.GITHUB_ACTIONS === 'true') {
          console.log('Pushing updated reviews-data.json to GitHub repository...');
          try {
            execSync('git config user.name "github-actions[bot]"', { stdio: 'inherit' });
            execSync('git config user.email "github-actions[bot]@users.noreply.github.com"', { stdio: 'inherit' });
            execSync('git add reviews-data.json', { stdio: 'inherit' });
            execSync(`git commit -m "chore(reviews): remove review ${reviewId} (${reason}) [skip ci]"`, { stdio: 'inherit' });
            execSync('git pull --rebase origin main', { stdio: 'inherit' });
            execSync('git push origin main', { stdio: 'inherit' });
            console.log('Successfully pushed changes to GitHub.');
          } catch (gitErr) {
            console.warn('Git commit/push warning:', gitErr.message);
          }
        }
      } else {
        console.log(`Review ${reviewId} was not found in reviews-data.json.`);
      }
    }
  } catch (fsErr) {
    console.warn('Could not update reviews-data.json:', fsErr.message);
  }
}

async function main() {
  const packageName = process.env.PACKAGE_NAME;
  const reviewId = process.env.REVIEW_ID;
  let replyText = process.env.REPLY_TEXT;

  if (!packageName || !reviewId || !replyText) {
    console.error('Missing required environment variables (PACKAGE_NAME, REVIEW_ID, REPLY_TEXT).');
    process.exit(1);
  }

  replyText = replyText.trim();
  if (replyText.length > 350) {
    console.warn(`Reply text exceeds Google Play 350-character limit (${replyText.length} chars). Truncating to 350.`);
    replyText = replyText.slice(0, 350);
  }

  console.log(`Replying to review ${reviewId} for app ${packageName}...`);

  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: 'play-credentials.json',
      scopes: ['https://www.googleapis.com/auth/androidpublisher']
    });
    
    const authClient = await auth.getClient();
    const play = google.androidpublisher({ version: 'v3', auth: authClient });

    await play.reviews.reply({
      packageName: packageName,
      reviewId: reviewId,
      requestBody: {
        replyText: replyText
      }
    });

    console.log('Successfully replied to review via Google Play Developer API.');
    updateAndCommitReviews(reviewId, 'replied via API');

  } catch (error) {
    const status = error.status || (error.response && error.response.status) || (error.response && error.response.data && error.response.data.error && error.response.data.error.code);
    const message = error.message || (error.response && error.response.data && error.response.data.error && error.response.data.error.message);

    if (status === 404) {
      console.warn(`\n[Notice] Review ${reviewId} was not found on Google Play (404 Not Found).`);
      console.warn('The user may have deleted or retracted their review, or it has expired past Google Play\'s API retention window.');
      console.log('Cleaning up review from reviews-data.json so it will no longer appear on dashboard...');
      updateAndCommitReviews(reviewId, 'review removed/deleted on Play Store');
      console.log('Completed review cleanup successfully.');
      process.exit(0);
    }

    if (status === 403) {
      console.error('\n[Error 403 Forbidden] The service account does not have permission to reply to reviews.');
      console.error('Check Google Play Console > Users & permissions > Service accounts > App permissions > "Reply to reviews".');
      if (error.response && error.response.data) {
        console.error('API Response:', JSON.stringify(error.response.data, null, 2));
      }
      process.exit(1);
    }

    console.error('Error replying to review:', message);
    if (error.response && error.response.data) {
      console.error('API Response:', JSON.stringify(error.response.data, null, 2));
    }
    process.exit(1);
  }
}

main();
