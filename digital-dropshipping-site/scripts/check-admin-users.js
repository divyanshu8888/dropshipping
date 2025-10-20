const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'your_supabase_url',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'your_service_role_key'
);

async function checkAdminUsers() {
  try {
    console.log('🔍 Checking admin users in database...\n');

    // Query all users with admin role
    const { data: adminUsers, error } = await supabase
      .from('users')
      .select('id, email, name, role, is_verified, is_active, created_at')
      .eq('role', 'admin');

    if (error) {
      console.error('❌ Error fetching admin users:', error);
      return;
    }

    if (!adminUsers || adminUsers.length === 0) {
      console.log('⚠️  No admin users found in the database!');
      console.log('\n📝 To create an admin user, you can:');
      console.log('1. Run the hash-password.js script to generate a hashed password');
      console.log('2. Execute the SQL INSERT statement in your database');
      console.log('3. Or use the advanced-schema.sql which includes a default admin user');
      return;
    }

    console.log(`✅ Found ${adminUsers.length} admin user(s):\n`);

    adminUsers.forEach((user, index) => {
      console.log(`${index + 1}. Admin User Details:`);
      console.log(`   📧 Email: ${user.email}`);
      console.log(`   👤 Name: ${user.name}`);
      console.log(`   🆔 ID: ${user.id}`);
      console.log(`   🔐 Role: ${user.role}`);
      console.log(`   ✅ Verified: ${user.is_verified ? 'Yes' : 'No'}`);
      console.log(`   🟢 Active: ${user.is_active ? 'Yes' : 'No'}`);
      console.log(`   📅 Created: ${new Date(user.created_at).toLocaleString()}`);
      console.log('');
    });

    console.log('🔑 Login Credentials:');
    console.log('   Email: admin@platform.com');
    console.log('   Password: [Check setup console output]');
    console.log('\n🌐 Admin Dashboard: http://localhost:3000/admin');
    console.log('🔧 Moderation Dashboard: http://localhost:3000/admin/moderation');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the check
checkAdminUsers();
