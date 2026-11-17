const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://xfqapdxeladfvivlwltp.supabase.co';
const supabaseKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmcWFwZHhlbGFkZnZpdmx3bHRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQ4NDQ1MDksImV4cCI6MjExMDQyMDUwOX0.yksu5rQ8HVVyWcZcoWky5eH94cQCXqopsSJV8VEKbqo';

async function runEndToEndVerification() {
  console.log('================================================================');
  console.log('   SAUCER END-TO-END MULTI-TENANT AUTHENTICATION VERIFICATION   ');
  console.log('================================================================\n');

  // --- USER A ---
  console.log('[STEP 1] Authenticating User A (lead.developer@saucer.app)...');
  const clientA = createClient(supabaseUrl, supabaseKey);
  const { data: authA, error: errA } = await clientA.auth.signInWithPassword({
    email: 'lead.developer@saucer.app',
    password: 'SaucerSecretPassword2026!',
  });
  if (errA) throw new Error(`User A login failed: ${errA.message}`);

  const userA = authA.user;
  console.log(`✓ User A Auth ID:       ${userA.id}`);
  console.log(`✓ User A Email:         ${userA.email}`);

  // Fetch Profile A
  const { data: profileA, error: pErrA } = await clientA
    .from('Profile')
    .select('id, supabaseUserId, email, fullName')
    .eq('supabaseUserId', userA.id)
    .single();

  if (pErrA) throw new Error(`Failed to fetch Profile A: ${pErrA.message}`);
  console.log(`✓ User A Profile ID:    ${profileA.id}`);
  console.log(`✓ User A Profile Name:  ${profileA.fullName}`);
  console.log(`✓ User A Mapping Match: ${profileA.supabaseUserId === userA.id ? 'YES (1:1 Exact Match)' : 'NO'}`);

  // Fetch Org A
  const { data: orgMembersA } = await clientA
    .from('OrganizationMember')
    .select('role, Organization(id, name, slug)')
    .eq('profileId', profileA.id);

  const orgA = orgMembersA?.[0]?.Organization;
  console.log(`✓ User A Org ID:        ${orgA?.id}`);
  console.log(`✓ User A Org Name:      ${orgA?.name}`);

  // Fetch Workspace A
  const { data: wsA } = await clientA
    .from('Workspace')
    .select('id, name, slug')
    .eq('organizationId', orgA?.id);

  console.log(`✓ User A Workspace ID:  ${wsA?.[0]?.id}`);
  console.log(`✓ User A Workspace Name:${wsA?.[0]?.name}\n`);

  // --- USER B ---
  console.log('[STEP 2] Authenticating User B (user_b@competitor.io)...');
  const clientB = createClient(supabaseUrl, supabaseKey);
  const { data: authB, error: errB } = await clientB.auth.signInWithPassword({
    email: 'user_b@competitor.io',
    password: 'CompetitorPass123!',
  });
  if (errB) throw new Error(`User B login failed: ${errB.message}`);

  const userB = authB.user;
  console.log(`✓ User B Auth ID:       ${userB.id}`);
  console.log(`✓ User B Email:         ${userB.email}`);

  // Fetch Profile B
  const { data: profileB, error: pErrB } = await clientB
    .from('Profile')
    .select('id, supabaseUserId, email, fullName')
    .eq('supabaseUserId', userB.id)
    .single();

  if (pErrB) throw new Error(`Failed to fetch Profile B: ${pErrB.message}`);
  console.log(`✓ User B Profile ID:    ${profileB.id}`);
  console.log(`✓ User B Profile Name:  ${profileB.fullName}`);
  console.log(`✓ User B Mapping Match: ${profileB.supabaseUserId === userB.id ? 'YES (1:1 Exact Match)' : 'NO'}`);

  // Fetch Org B
  const { data: orgMembersB } = await clientB
    .from('OrganizationMember')
    .select('role, Organization(id, name, slug)')
    .eq('profileId', profileB.id);

  const orgB = orgMembersB?.[0]?.Organization;
  console.log(`✓ User B Org ID:        ${orgB?.id}`);
  console.log(`✓ User B Org Name:      ${orgB?.name}`);

  // Fetch Workspace B
  const { data: wsB } = await clientB
    .from('Workspace')
    .select('id, name, slug')
    .eq('organizationId', orgB?.id);

  console.log(`✓ User B Workspace ID:  ${wsB?.[0]?.id}`);
  console.log(`✓ User B Workspace Name:${wsB?.[0]?.name}\n`);

  // --- CROSS-TENANT ISOLATION ASSERTIONS ---
  console.log('[STEP 3] Verifying Multi-Tenant Data Isolation...');

  if (userA.id === userB.id) throw new Error('VIOLATION: User A and User B share the same Auth ID!');
  if (profileA.id === profileB.id) throw new Error('VIOLATION: User A and User B share the same Profile ID!');
  if (orgA.id === orgB.id) throw new Error('VIOLATION: User A and User B share the same Organization ID!');
  if (wsA[0].id === wsB[0].id) throw new Error('VIOLATION: User A and User B share the same Workspace ID!');
  console.log('✓ All UUIDs are strictly distinct across tenants.');

  // User B attempts to access User A's profile directly
  const { data: leakedProfile } = await clientB
    .from('Profile')
    .select('*')
    .eq('id', profileA.id);

  if (leakedProfile && leakedProfile.length > 0) {
    throw new Error('SECURITY VIOLATION: User B was able to read User A profile!');
  }
  console.log('✓ User B cannot read User A Profile (0 rows returned via RLS).');

  // User B attempts to access User A's workspace directly
  const { data: leakedWs } = await clientB
    .from('Workspace')
    .select('*')
    .eq('id', wsA[0].id);

  if (leakedWs && leakedWs.length > 0) {
    throw new Error('SECURITY VIOLATION: User B was able to read User A Workspace!');
  }
  console.log('✓ User B cannot read User A Workspace (0 rows returned via RLS).');

  // --- SESSION REFRESH VERIFICATION ---
  console.log('\n[STEP 4] Verifying Session Refresh & Longevity...');
  const { data: refreshedSessionA, error: refreshErrA } = await clientA.auth.refreshSession();
  if (refreshErrA) throw new Error(`User A session refresh failed: ${refreshErrA.message}`);
  console.log(`✓ User A session refreshed successfully. New expires_at: ${new Date(refreshedSessionA.session.expires_at * 1000).toISOString()}`);

  const { data: refreshedSessionB, error: refreshErrB } = await clientB.auth.refreshSession();
  if (refreshErrB) throw new Error(`User B session refresh failed: ${refreshErrB.message}`);
  console.log(`✓ User B session refreshed successfully. New expires_at: ${new Date(refreshedSessionB.session.expires_at * 1000).toISOString()}`);

  console.log('\n================================================================');
  console.log('   RESULT: 100% OF MULTI-TENANT & AUTHENTICATION TESTS PASSED   ');
  console.log('================================================================');
}

runEndToEndVerification().catch((err) => {
  console.error('\n❌ VERIFICATION TEST FAILED:', err.message);
  process.exit(1);
});
