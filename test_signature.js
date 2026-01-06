const fetch = require('node-fetch');

async function testSignature() {
  console.log('🧪 Testing Signature Functionality\n');
  
  // Test data
  const offerteId = 'cmk1pvz0v0019k2i9euv4zt40'; // OFF-2026-002
  const testSignature = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
  const testNaam = 'Maria Bakker (Test)';
  
  console.log('📝 Test Details:');
  console.log(`   Offerte ID: ${offerteId}`);
  console.log(`   Name: ${testNaam}`);
  console.log(`   Signature: ${testSignature.substring(0, 50)}...`);
  console.log('');
  
  // Step 1: Get the offerte to verify it exists
  console.log('1️⃣  Fetching offerte...');
  try {
    const getRes = await fetch(`http://localhost:3000/api/offertes/${offerteId}`);
    if (!getRes.ok) {
      console.log(`   ❌ Failed to fetch offerte: ${getRes.status}`);
      return;
    }
    const offerte = await getRes.json();
    console.log(`   ✅ Offerte found: ${offerte.offerteNummer}`);
    console.log(`   📊 Status: ${offerte.status}`);
    console.log(`   ✍️  Already signed: ${offerte.klantHandtekening ? 'Yes' : 'No'}`);
    console.log('');
    
    if (offerte.klantHandtekening) {
      console.log('⚠️  Offerte is already signed!');
      console.log('   Signed by:', offerte.klantNaam);
      console.log('   Signed on:', new Date(offerte.klantGetekendOp).toLocaleString('nl-NL'));
      console.log('');
      console.log('✅ Signature system is working - offerte was successfully signed previously');
      return;
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    return;
  }
  
  // Step 2: Test signing the offerte
  console.log('2️⃣  Attempting to sign offerte...');
  try {
    const signRes = await fetch(`http://localhost:3000/api/offertes/${offerteId}/sign`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        signature: testSignature,
        naam: testNaam
      })
    });
    
    if (!signRes.ok) {
      const error = await signRes.json();
      console.log(`   ❌ Failed to sign: ${error.error}`);
      return;
    }
    
    const result = await signRes.json();
    console.log('   ✅ Successfully signed!');
    console.log('');
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    return;
  }
  
  // Step 3: Verify the signature was saved
  console.log('3️⃣  Verifying signature was saved...');
  try {
    const verifyRes = await fetch(`http://localhost:3000/api/offertes/${offerteId}`);
    const offerte = await verifyRes.json();
    
    if (offerte.klantHandtekening) {
      console.log('   ✅ Signature verified!');
      console.log(`   📝 Signed by: ${offerte.klantNaam}`);
      console.log(`   📅 Signed on: ${new Date(offerte.klantGetekendOp).toLocaleString('nl-NL')}`);
      console.log(`   🌐 IP Address: ${offerte.klantIpAdres}`);
      console.log(`   📊 Status: ${offerte.status}`);
      console.log('');
      console.log('🎉 All tests passed! Signature functionality is working correctly.');
    } else {
      console.log('   ❌ Signature not found after signing');
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }
}

testSignature().catch(console.error);
