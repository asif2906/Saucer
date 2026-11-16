const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://xfqapdxeladfvivlwltp.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmcWFwZHhlbGFkZnZpdmx3bHRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQ4NDQ1MDksImV4cCI6MjExMDQyMDUwOX0.yksu5rQ8HVVyWcZcoWky5eH94cQCXqopsSJV8VEKbqo';

async function verifyIsolation() {
  console.log('=== SAUCER MULTI-TENANT ROW LEVEL SECURITY VERIFICATION ===\n');

  // 1. Sign in User A (Alex Mercer)
  const clientA = createClient(supabaseUrl, supabaseKey);
  const { data: authA, error: errA } = await clientA.auth.signInWithPassword({
    email: 'lead.developer@saucer.app',
    password: 'SaucerSecretPassword2026!',
  });
  if (errA) throw new Error(`User A login failed: ${errA.message}`);
  console.log(`[AUTH] User A logged in: ${authA.user.email} (ID: ${authA.user.id})`);

  // 2. Sign in User B (Bob Vance)
  const clientB = createClient(supabaseUrl, supabaseKey);
  const { data: authB, error: errB } = await clientB.auth.signInWithPassword({
    email: 'user_b@competitor.io',
    password: 'CompetitorPass123!',
  });
  if (errB) throw new Error(`User B login failed: ${errB.message}`);
  console.log(`[AUTH] User B logged in: ${authB.user.email} (ID: ${authB.user.id})\n`);

  // --- TEST 1: PROFILE ISOLATION ---
  console.log('[TEST 1] Testing Profile Isolation:');
  const { data: profilesA } = await clientA.from('Profile').select('*');
  console.log(`- User A queries all profiles: got ${profilesA.length} row(s) [Expected: 1, email: ${profilesA[0]?.email}]`);
  if (profilesA.length !== 1 || profilesA[0]?.email !== 'lead.developer@saucer.app') {
    throw new Error('FAIL: User A saw data outside their profile!');
  }

  const { data: profilesB } = await clientB.from('Profile').select('*');
  console.log(`- User B queries all profiles: got ${profilesB.length} row(s) [Expected: 1, email: ${profilesB[0]?.email}]`);
  if (profilesB.length !== 1 || profilesB[0]?.email !== 'user_b@competitor.io') {
    throw new Error('FAIL: User B saw data outside their profile!');
  }
  console.log('=> PASSED: Profiles are completely isolated per user.\n');

  // --- TEST 2: ORGANIZATION ISOLATION ---
  console.log('[TEST 2] Testing Organization Isolation:');
  const { data: orgsA, error: orgErrA } = await clientA.from('Organization').select('*');
  if (orgErrA) console.error('orgErrA:', orgErrA);
  console.log(`- User A queries organizations: got ${orgsA ? orgsA.length : 0} org(s) [Name: "${orgsA?.[0]?.name}"]`);

  const { data: orgsB, error: orgErrB } = await clientB.from('Organization').select('*');
  if (orgErrB) console.error('orgErrB:', orgErrB);
  console.log(`- User B queries organizations: got ${orgsB ? orgsB.length : 0} org(s) [Name: "${orgsB?.[0]?.name}"]`);
  if (orgsB.length !== 1 || !orgsB[0]?.name.includes('Vance Refrigeration')) {
    throw new Error('FAIL: User B organization leaked!');
  }
  console.log('=> PASSED: Organizations are strictly isolated between tenants.\n');

  // --- TEST 3: WORKSPACE ISOLATION ---
  console.log('[TEST 3] Testing Workspace Isolation:');
  const { data: wsA } = await clientA.from('Workspace').select('*');
  console.log(`- User A queries workspaces: got ${wsA.length} workspace(s) for Org: ${wsA[0]?.organizationId}`);
  if (wsA.some(w => w.organizationId === orgsB[0].id)) {
    throw new Error('FAIL: User A saw User B workspaces!');
  }

  const { data: wsB } = await clientB.from('Workspace').select('*');
  console.log(`- User B queries workspaces: got ${wsB.length} workspace(s) for Org: ${wsB[0]?.organizationId}`);
  if (wsB.some(w => w.organizationId === orgsA[0].id)) {
    throw new Error('FAIL: User B saw User A workspaces!');
  }
  console.log('=> PASSED: Workspaces are strictly isolated between tenants.\n');

  // --- TEST 4: UNAUTHORIZED MUTATION ATTEMPT ---
  console.log('[TEST 4] Testing Cross-Tenant Tampering Prevention:');
  // User B attempts to malicious update User A's organization name
  const { data: updateRes, error: updateErr } = await clientB
    .from('Organization')
    .update({ name: 'HACKED BY USER B' })
    .eq('id', orgsA[0].id)
    .select();

  console.log(`- User B attempts to rename User A org: updated ${updateRes ? updateRes.length : 0} rows.`);
  if (updateRes && updateRes.length > 0) {
    throw new Error('SECURITY VIOLATION: User B was able to modify User A organization!');
  }
  console.log('=> PASSED: Cross-tenant update blocked by Row Level Security.\n');

  console.log('===========================================================');
  console.log('ALL SUPABASE AUTH & RLS VERIFICATION TESTS PASSED (100%)');
  console.log('===========================================================');
}

verifyIsolation().catch(err => {
  console.error('\nTEST FAILED:', err);
  process.exit(1);
});
