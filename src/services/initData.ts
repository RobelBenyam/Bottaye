import { initializeFirestore } from './initializeFirestore';

// Run this once to set up your database
export const setupDatabase = async () => {
  console.log('🔥 Setting up Firestore database...');
  
  try {
    await initializeFirestore();
    console.log('✅ Database setup complete!');
    console.log('🎯 Your Bottaye system is ready to use!');
    
    // Show what was created
    console.log(`
📊 Sample Data Created:
- 🏢 Kilimani Heights Apartments (3 units)
- 🏬 Westlands Plaza (2 units) 
- 📋 Ready for tenants and payments!

🚀 Next Steps:
1. Add Property → Creates new buildings
2. Add Unit → Creates rentable spaces
3. Add Tenant → Assigns people to units
4. View Reports → See analytics
    `);
    
  } catch (error) {
    console.error('❌ Database setup failed:', error);
  }
};

// Check if this is the first time running
export const checkFirstRun = async () => {
  const { propertyService } = await import('./database');
  
  try {
    const properties = await propertyService.getAll();
    
    if (properties.length === 0) {
      console.log('🎉 Welcome to Bottaye! Setting up sample data...');
      await setupDatabase();
      return true; // First run
    }
    
    console.log(`✅ Found ${properties.length} properties in database`);
    return false; // Not first run
  } catch (error) {
    console.log('🔄 Database not ready yet, will try again...');
    return null; // Database not ready
  }
}; 