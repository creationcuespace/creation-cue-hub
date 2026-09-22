const { google } = require('googleapis');
const fs = require('fs');

async function main() {
  const packageName = process.env.PACKAGE_NAME;
  const reviewId = process.env.REVIEW_ID;
  const replyText = process.env.REPLY_TEXT;

  if (!packageName || !reviewId || !replyText) {
    console.error('Missing required environment variables (PACKAGE_NAME, REVIEW_ID, REPLY_TEXT).');
    process.exit(1);
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

    // Remove the review from reviews-data.json
    try {
      const data = JSON.parse(fs.readFileSync('reviews-data.json', 'utf8'));
      if (data && data.reviews) {
        const initialCount = data.reviews.length;
        data.reviews = data.reviews.filter(r => r.reviewId !== reviewId);
        if (data.reviews.length < initialCount) {
          fs.writeFileSync('reviews-data.json', JSON.stringify(data, null, 2));
          console.log(`Removed review ${reviewId} from reviews-data.json.`);
        } else {
          console.log('Review not found in reviews-data.json, no changes made.');
        }
      }
    } catch (fsErr) {
      console.warn('Could not update reviews-data.json:', fsErr.message);
    }

  } catch (error) {
    console.error('Error replying to review:', error.message);
    if (error.response && error.response.data) {
      console.error('API Response:', JSON.stringify(error.response.data, null, 2));
    }
    process.exit(1);
  }
}

main();
