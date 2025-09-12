import { collection, addDoc, doc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { SAMPLE_PROPERTY_IMAGES, getUnitImages, getFloorPlan } from './sampleImages';

// Initialize Firestore collections with sample data
export const initializeFirestore = async () => {
  try {
    console.log('🔄 Starting Firestore initialization...');
    
    // Test connection first
    const testRef = collection(db, 'properties');
    console.log('✅ Firestore connection successful');
    
    // Create sample property
    console.log('📝 Creating sample property...');
    const propertyRef = await addDoc(collection(db, 'properties'), {
      name: 'Kilimani Heights Apartments',
      address: 'Kilimani Road, Nairobi',
      type: 'residential',
      description: 'Modern residential apartments in the heart of Kilimani',
      images: SAMPLE_PROPERTY_IMAGES.residential,
      totalUnits: 24,
      managerId: 'demo-admin',
      managerName: 'Demo Admin',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Create sample units for this property
    const units = [
      {
        propertyId: propertyRef.id,
        propertyName: 'Kilimani Heights Apartments',
        unitNumber: '1A',
        type: '1_bedroom',
        rent: 35000,
        deposit: 70000,
        status: 'vacant',
        images: getUnitImages('1_bedroom'),
        floorPlan: getFloorPlan('1_bedroom')
      },
      {
        propertyId: propertyRef.id,
        propertyName: 'Kilimani Heights Apartments',
        unitNumber: '2A',
        type: '2_bedroom',
        rent: 45000,
        deposit: 90000,
        status: 'vacant',
        images: getUnitImages('2_bedroom'),
        floorPlan: getFloorPlan('2_bedroom')
      },
      {
        propertyId: propertyRef.id,
        propertyName: 'Kilimani Heights Apartments',
        unitNumber: '3A',
        type: '3_bedroom',
        rent: 65000,
        deposit: 130000,
        status: 'vacant',
        images: getUnitImages('3_bedroom'),
        floorPlan: getFloorPlan('3_bedroom')
      }
    ];

    for (const unit of units) {
      await addDoc(collection(db, 'units'), {
        ...unit,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    // Create another sample property
    const property2Ref = await addDoc(collection(db, 'properties'), {
      name: 'Westlands Plaza',
      address: 'Westlands Road, Nairobi',
      type: 'commercial',
      description: 'Premium office and retail spaces in Westlands',
      totalUnits: 18,
      managerId: 'demo-admin',
      managerName: 'Demo Admin',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Create commercial units
    const commercialUnits = [
      {
        propertyId: property2Ref.id,
        propertyName: 'Westlands Plaza',
        unitNumber: 'Shop 1',
        type: 'shop',
        rent: 80000,
        deposit: 160000,
        status: 'vacant'
      },
      {
        propertyId: property2Ref.id,
        propertyName: 'Westlands Plaza',
        unitNumber: 'Office 201',
        type: 'office',
        rent: 120000,
        deposit: 240000,
        status: 'vacant'
      }
    ];

    for (const unit of commercialUnits) {
      await addDoc(collection(db, 'units'), {
        ...unit,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    console.log('✅ Firestore initialized with sample data');
    return true;
  } catch (error) {
    console.error('❌ Error initializing Firestore:', error);
    return false;
  }
};

// Set up Firestore security rules (you'll need to copy this to Firebase Console)
export const getSecurityRules = () => `
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow authenticated users to read/write their data
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
    
    // Properties: authenticated users can manage
    match /properties/{propertyId} {
      allow read, write: if request.auth != null;
    }
    
    // Units: authenticated users can manage
    match /units/{unitId} {
      allow read, write: if request.auth != null;
    }
    
    // Tenants: authenticated users can manage
    match /tenants/{tenantId} {
      allow read, write: if request.auth != null;
    }
    
    // Payments: authenticated users can manage
    match /payments/{paymentId} {
      allow read, write: if request.auth != null;
    }
    
    // Maintenance: authenticated users can manage
    match /maintenance/{maintenanceId} {
      allow read, write: if request.auth != null;
    }
    
    // Users: users can read/write their own profile
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}`;

// Create initial admin user
export const createAdminUser = async (uid: string, email: string, name: string) => {
  try {
    await setDoc(doc(db, 'users', uid), {
      email,
      name,
      role: 'super_admin',
      createdAt: new Date(),
      updatedAt: new Date()
    });
    console.log('✅ Admin user created');
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  }
}; 