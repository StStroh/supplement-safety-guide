#!/usr/bin/env node

const https = require('https');

function httpsRequest(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data, headers: res.headers }));
    }).on('error', reject);
  });
}

async function verifyDeployment(siteUrl = 'https://supplementsafetybible.com') {
  console.log('\n=== Deployment Verification ===\n');
  console.log(`Site: ${siteUrl}\n`);

  const tests = [];

  // Test 1: Pricing page loads
  console.log('✓ Testing /pricing page...');
  try {
    const pricing = await httpsRequest(`${siteUrl}/pricing`);
    if (pricing.status === 200) {
      tests.push({ name: 'Pricing page loads', status: 'PASS' });
      console.log('  ✓ Pricing page loads successfully');
    } else {
      tests.push({ name: 'Pricing page loads', status: `FAIL (${pricing.status})` });
      console.log(`  ✗ Pricing page returned ${pricing.status}`);
    }
  } catch (e) {
    tests.push({ name: 'Pricing page loads', status: 'ERROR' });
    console.log(`  ✗ Error: ${e.message}`);
  }

  // Test 2: Free signup page exists
  console.log('✓ Testing /signup-free page...');
  try {
    const signupFree = await httpsRequest(`${siteUrl}/signup-free`);
    if (signupFree.status === 200) {
      tests.push({ name: 'Free signup page exists', status: 'PASS' });
      console.log('  ✓ Free signup page accessible');
    } else {
      tests.push({ name: 'Free signup page exists', status: `FAIL (${signupFree.status})` });
      console.log(`  ✗ Free signup page returned ${signupFree.status}`);
    }
  } catch (e) {
    tests.push({ name: 'Free signup page exists', status: 'ERROR' });
    console.log(`  ✗ Error: ${e.message}`);
  }

  // Test 3: Netlify function exists
  console.log('✓ Testing Stripe checkout function...');
  try {
    const checkoutTest = await httpsRequest(`${siteUrl}/.netlify/functions/create-checkout-session`);
    // Should return 400 or 405 (bad request), not 404
    if (checkoutTest.status === 404) {
      tests.push({ name: 'Checkout function exists', status: 'FAIL (404)' });
      console.log('  ✗ Checkout function not found');
    } else {
      tests.push({ name: 'Checkout function exists', status: 'PASS' });
      console.log(`  ✓ Checkout function exists (status: ${checkoutTest.status})`);
    }
  } catch (e) {
    tests.push({ name: 'Checkout function exists', status: 'ERROR' });
    console.log(`  ✗ Error: ${e.message}`);
  }

  console.log('\n=== Test Summary ===\n');
  console.log('┌─────────────────────────────────────┬──────────┐');
  console.log('│ Test                                │ Status   │');
  console.log('├─────────────────────────────────────┼──────────┤');
  for (const test of tests) {
    const statusColor = test.status === 'PASS' ? '✓' : '✗';
    console.log(`│ ${test.name.padEnd(35)} │ ${statusColor} ${test.status.padEnd(6)} │`);
  }
  console.log('└─────────────────────────────────────┴──────────┘');

  const passed = tests.filter(t => t.status === 'PASS').length;
  const total = tests.length;

  console.log(`\n${passed}/${total} tests passed\n`);

  if (passed === total) {
    console.log('✅ All verification tests passed!');
    console.log('\nManual Verification Steps:');
    console.log('1. Visit https://supplementsafetybible.com/pricing');
    console.log('2. Click "Start Free" on Starter plan');
    console.log('   → Should redirect to /signup-free (no Stripe checkout)');
    console.log('3. Click "Upgrade to Pro" on Professional plan');
    console.log('   → Should open Stripe checkout with correct monthly price');
    console.log('4. Switch to Yearly toggle');
    console.log('5. Click "Upgrade to Pro - Yearly"');
    console.log('   → Should open Stripe checkout with correct annual price');
    console.log('6. Test Premium and Guide buttons similarly');
  } else {
    console.log('⚠️  Some tests failed. Please review above.');
  }
}

// Run if called directly
if (require.main === module) {
  const siteUrl = process.argv[2] || 'https://supplementsafetybible.com';
  verifyDeployment(siteUrl).catch(console.error);
}

module.exports = { verifyDeployment };
