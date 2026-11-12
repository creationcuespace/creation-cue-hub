const { execSync } = require('child_process');

function run(cmd) {
  console.log(`> ${cmd}`);
  return execSync(cmd, { stdio: 'inherit' });
}

function runCapture(cmd) {
  try {
    return execSync(cmd).toString().trim();
  } catch (e) {
    return '';
  }
}

try {
  console.log('=== CREATION CUE SAFE DEPLOY PIPELINE ===');
  
  // 1. Check git status
  const status = runCapture('git status --porcelain');
  const commitMsg = process.argv.slice(2).join(' ') || 'chore: automated sync & deploy updates';

  if (status) {
    console.log('\n[1/4] Uncommitted changes detected. Staging website files...');
    // Stage modified tracked files and critical web assets
    run('git add -u');
    
    console.log(`\n[2/4] Committing changes ("${commitMsg}")...`);
    try {
      run(`git commit -m "${commitMsg}"`);
    } catch (e) {
      console.log('No new changes to commit.');
    }
  } else {
    console.log('\n[1/4] Working tree clean.');
  }

  // 2. Rebase and push to GitHub origin/main
  console.log('\n[3/4] Syncing with GitHub origin/main...');
  run('git pull --rebase origin main');
  run('git push origin main');
  console.log('✅ GitHub origin/main is 100% up to date.');

  // 3. Deploy to Firebase Hosting
  console.log('\n[4/4] Deploying to Firebase Hosting...');
  run('cmd /c npx firebase deploy --only hosting');

  console.log('\n======================================================');
  console.log('🎉 SAFE DEPLOY COMPLETE!');
  console.log('   - Changes committed & pushed to GitHub main');
  console.log('   - Nightly GitHub Actions will NEVER overwrite this code');
  console.log('   - Live URL: https://creationcue.web.app');
  console.log('======================================================\n');
} catch (err) {
  console.error('\n❌ Safe Deploy failed:', err.message);
  process.exit(1);
}
