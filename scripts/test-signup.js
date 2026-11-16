const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://xfqapdxeladfvivlwltp.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmcWFwZHhlbGFkZnZpdmx3bHRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQ4NDQ1MDksImV4cCI6MjExMDQyMDUwOX0.yksu5rQ8HVVyWcZcoWky5eH94cQCXqopsSJV8VEKbqo';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testAuth() {
  console.log('Testing Supabase Auth signup on xfqapdxeladfvivlwltp...');
  const testEmail = `developer_${Date.now()}@saucer.app`;
  const testPassword = 'SaucerSecretPassword2026!';

  const { data, error } = await supabase.auth.signUp({
    email: testEmail,
    password: testPassword,
    options: {
      data: {
        full_name: 'Lead Developer',
        organization_name: 'Saucer HQ',
      },
    },
  });

  if (error) {
    console.error('Signup error:', error);
    process.exit(1);
  }

  console.log('Signup succeeded!');
  console.log('User ID:', data.user ? data.user.id : 'null');
  console.log('Email:', data.user ? data.user.email : 'null');
  console.log('Session active:', !!data.session);

  // Now test signing in
  console.log('\nTesting signInWithPassword...');
  const signInRes = await supabase.auth.signInWithPassword({
    email: testEmail,
    password: testPassword,
  });

  if (signInRes.error) {
    console.log('Sign in response:', signInRes.error.message);
  } else {
    console.log('Sign in succeeded! Token generated:', !!signInRes.data.session);
  }
}

testAuth();
