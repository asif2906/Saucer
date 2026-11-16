const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://xfqapdxeladfvivlwltp.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmcWFwZHhlbGFkZnZpdmx3bHRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQ4NDQ1MDksImV4cCI6MjExMDQyMDUwOX0.yksu5rQ8HVVyWcZcoWky5eH94cQCXqopsSJV8VEKbqo';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testSignIn() {
  console.log('Testing Supabase Auth signInWithPassword on xfqapdxeladfvivlwltp...');
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'lead.developer@saucer.app',
    password: 'SaucerSecretPassword2026!',
  });

  if (error) {
    console.error('Sign-in error:', error.message);
    process.exit(1);
  }

  console.log('Sign-in SUCCESSFUL!');
  console.log('User ID:', data.user.id);
  console.log('User Email:', data.user.email);
  console.log('Session Access Token exists:', !!data.session.access_token);
  console.log('Token Expiry:', new Date(data.session.expires_at * 1000).toISOString());

  // Test authenticated query: fetch Profile
  console.log('\nTesting RLS: Fetching profile with authenticated client...');
  const authenticatedClient = createClient(supabaseUrl, supabaseKey, {
    global: {
      headers: {
        Authorization: `Bearer ${data.session.access_token}`,
      },
    },
  });

  const { data: profileData, error: profileError } = await authenticatedClient
    .from('Profile')
    .select('*')
    .single();

  if (profileError) {
    console.error('Profile fetch error:', profileError);
  } else {
    console.log('Profile successfully retrieved under RLS:');
    console.log(profileData);
  }

  // Test data isolation: verify user CANNOT see other users' data
  console.log('\nTesting RLS Data Isolation: Fetching all profiles...');
  const { data: allProfiles, error: allProfilesError } = await authenticatedClient
    .from('Profile')
    .select('*');

  console.log(`Profiles visible to this user: ${allProfiles ? allProfiles.length : 0} (Expected: 1, only their own)`);
}

testSignIn();
