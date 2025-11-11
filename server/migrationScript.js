/**
 * Firebase Data Migration Script
 * 
 * Purpose: Migrate from single restaurant per user to multi-restaurant system
 * 
 * OLD STRUCTURE:
 * users/{userId}/
 *   email, name, etc.
 * 
 * restaurants/{restaurantId}/  // restaurantId === userId
 *   name, items, orders, etc.
 * 
 * NEW STRUCTURE:
 * users/{userId}/
 *   email, name, etc.
 *   restaurants/
 *     {restaurantId}: true
 * 
 * restaurants/{restaurantId}/  // Generated unique ID
 *   ownerId: userId
 *   name, items, orders, etc.
 * 
 * userRestaurants/{userId}/
 *   {restaurantId}:
 *     name, role, createdAt
 * 
 * Usage:
 * 1. Make sure Firebase Admin SDK is properly configured
 * 2. Run: node migrationScript.js
 * 3. Check the logs for migration progress
 */

const admin = require('firebase-admin');
const serviceAccount = require('./src/config/serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://your-project-id.firebaseio.com" // Update with your database URL
});

const db = admin.database();

async function migrateData() {
  console.log('🚀 Starting Firebase data migration...\n');

  try {
    console.log('📊 Step 1: Fetching all users...');
    const usersSnapshot = await db.ref('users').once('value');
    const users = usersSnapshot.val() || {};
    const userIds = Object.keys(users);
    console.log(`Found ${userIds.length} users to migrate\n`);

    if (userIds.length === 0) {
      console.log('No users found. Migration complete.');
      return;
    }

    let migratedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    for (const userId of userIds) {
      try {
        console.log(`\n👤 Processing user: ${userId}`);
        const user = users[userId];

        if (user.restaurants) {
          console.log(`  ⏭️  User already migrated, skipping...`);
          skippedCount++;
          continue;
        }

        const oldRestaurantSnapshot = await db.ref(`restaurants/${userId}`).once('value');        if (!oldRestaurantSnapshot.exists()) {
          console.log(`  ⚠️  No restaurant found for user, creating default...`);

          const newRestaurantId = db.ref('restaurants').push().key;
          const restaurantData = {
            id: newRestaurantId,
            ownerId: userId,
            name: `${user.displayName || user.email?.split('@')[0] || 'User'}'s Restaurant`,
            description: '',
            address: '',
            phone: '',
            email: '',
            website: '',
            logo: '',
            coverImage: '',
            hours: {},
            socialMedia: {},
            settings: {},
            items: {},
            categories: {},
            modifiers: {},
            discounts: {},
            specialClosures: [],
            createdAt: Date.now(),
            updatedAt: Date.now(),
          };
          
          await db.ref(`restaurants/${newRestaurantId}`).set(restaurantData);
          await db.ref(`users/${userId}/restaurants/${newRestaurantId}`).set(true);
          await db.ref(`userRestaurants/${userId}/${newRestaurantId}`).set({
            name: restaurantData.name,
            role: 'owner',
            createdAt: Date.now()
          });
          
          console.log(`  ✅ Created default restaurant: ${newRestaurantId}`);
          migratedCount++;
          continue;
        }

        console.log(`  📦 Found existing restaurant, migrating...`);
        const oldRestaurant = oldRestaurantSnapshot.val();
        const newRestaurantId = db.ref('restaurants').push().key;

        const newRestaurantData = {
          ...oldRestaurant,
          id: newRestaurantId,
          ownerId: userId,
          updatedAt: Date.now()
        };

        await db.ref(`restaurants/${newRestaurantId}`).set(newRestaurantData);
        console.log(`  ✅ Created new restaurant: ${newRestaurantId}`);

        await db.ref(`users/${userId}/restaurants/${newRestaurantId}`).set(true);
        console.log(`  ✅ Linked restaurant to user`);

        await db.ref(`userRestaurants/${userId}/${newRestaurantId}`).set({
          name: oldRestaurant.name || 'My Restaurant',
          role: 'owner',
          createdAt: oldRestaurant.createdAt || Date.now()
        });
        console.log(`  ✅ Created restaurant index`);

        console.log(`  ✨ Migration complete for user ${userId}`);
        migratedCount++;
        
      } catch (error) {
        console.error(`  ❌ Error migrating user ${userId}:`, error.message);
        errorCount++;
      }
    }

    console.log('\n' + '='.repeat(50));
    console.log('📊 Migration Summary:');
    console.log(`  ✅ Successfully migrated: ${migratedCount}`);
    console.log(`  ⏭️  Skipped (already migrated): ${skippedCount}`);
    console.log(`  ❌ Errors: ${errorCount}`);
    console.log(`  📈 Total processed: ${userIds.length}`);
    console.log('='.repeat(50));
    
    console.log('\n⚠️  IMPORTANT: Old restaurant entries (with userId as key) are NOT deleted for safety.');
    console.log('   After verifying the migration, you can manually delete them from Firebase Console.');
    console.log('\n✅ Migration complete!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await admin.app().delete();
    console.log('\n👋 Firebase connection closed.');
  }
}

migrateData().catch(console.error);
