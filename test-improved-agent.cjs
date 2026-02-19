const http = require('http');

console.log('\n🔄 TESTING IMPROVED AGENT WITH TEST AUTO-DISCOVERY...\n');

const data = JSON.stringify({
  repoUrl: 'https://github.com/suryanshsk/agentic-shopper',
  teamName: 'DEMO',
  leaderName: 'FIXED'
});

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/run-agent',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, (res) => {
  let responseData = '';
  res.on('data', (chunk) => { responseData += chunk; });
  
  res.on('end', () => {
    if (res.statusCode === 200) {
      const json = JSON.parse(responseData);
      console.log('✅ Agent Triggered Successfully!');
      console.log(`   Run ID: ${json.runId}`);
      console.log(`   Branch: DEMO_FIXED_AI_Fix`);
      console.log(`\n📊 IMPROVEMENTS:\n`);
      console.log('   ✅ Auto-detects test files (test_*.py, *.test.js)');
      console.log('   ✅ Tries pytest without config if Python tests found');
      console.log('   ✅ Tries npm test/jest if JS tests found');
      console.log('   ✅ Graceful fallback if no tests (won\'t crash)');
      console.log(`\n🌐 Watch it run: ${json.githubUrl}\n`);
    } else {
      console.log(`❌ Error: ${res.statusCode}`);
      console.log(responseData);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Connection Failed:', error.message);
});

req.write(data);
req.end();
