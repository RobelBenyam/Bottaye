// Fallback: Initialize with localStorage when Firebase isn't working
import { localPropertyService, localUnitService, localTenantService } from './localStorage';

export const initializeLocalData = async () => {
  try {
    console.log('🔄 Initializing with local storage...');
    
    // Create sample property
    const property1Id = await localPropertyService.create({
      name: 'Kilimani Heights Apartments',
      address: 'Kilimani Road, Nairobi',
      type: 'residential',
      description: 'Modern residential apartments in the heart of Kilimani',
      totalUnits: 3,
      managerId: 'demo-admin',
      managerName: 'Demo Admin'
    });

    // Create units for this property
    await localUnitService.create({
      propertyId: property1Id,
      propertyName: 'Kilimani Heights Apartments',
      unitNumber: '1A',
      type: '1_bedroom',
      rent: 35000,
      deposit: 70000,
      status: 'vacant'
    });

    await localUnitService.create({
      propertyId: property1Id,
      propertyName: 'Kilimani Heights Apartments',
      unitNumber: '2A',
      type: '2_bedroom',
      rent: 45000,
      deposit: 90000,
      status: 'vacant'
    });

    await localUnitService.create({
      propertyId: property1Id,
      propertyName: 'Kilimani Heights Apartments',
      unitNumber: '3A',
      type: '3_bedroom',
      rent: 65000,
      deposit: 130000,
      status: 'vacant'
    });

    // Create second property
    const property2Id = await localPropertyService.create({
      name: 'Westlands Plaza',
      address: 'Westlands Road, Nairobi',
      type: 'commercial',
      description: 'Premium office and retail spaces in Westlands',
      totalUnits: 2,
      managerId: 'demo-admin',
      managerName: 'Demo Admin'
    });

    await localUnitService.create({
      propertyId: property2Id,
      propertyName: 'Westlands Plaza',
      unitNumber: 'Shop 1',
      type: 'shop',
      rent: 80000,
      deposit: 160000,
      status: 'vacant'
    });

    await localUnitService.create({
      propertyId: property2Id,
      propertyName: 'Westlands Plaza',
      unitNumber: 'Office 201',
      type: 'office',
      rent: 120000,
      deposit: 240000,
      status: 'vacant'
    });

    // Create sample tenants
    await localTenantService.create({
      name: 'John Doe',
      email: 'john.doe@email.com',
      phone: '+254712345678',
      unitId: null,
      leaseStartDate: null,
      leaseEndDate: null,
      monthlyRent: 0,
      securityDeposit: 0,
      emergencyContact: {
        name: 'Jane Doe',
        phone: '+254798765432',
        relationship: 'Sister'
      }
    } as any);

    await localTenantService.create({
      name: 'Mary Smith',
      email: 'mary.smith@email.com',
      phone: '+254798765432',
      unitId: null,
      leaseStartDate: null,
      leaseEndDate: null,
      monthlyRent: 0,
      securityDeposit: 0,
      emergencyContact: {
        name: 'Peter Smith',
        phone: '+254712345678',
        relationship: 'Brother'
      }
    } as any);

    await localTenantService.create({
      name: 'Alice Johnson',
      email: 'alice.johnson@email.com',
      phone: '+254734567890',
      unitId: null,
      leaseStartDate: null,
      leaseEndDate: null,
      monthlyRent: 0,
      securityDeposit: 0,
      emergencyContact: {
        name: 'Bob Johnson',
        phone: '+254756789012',
        relationship: 'Husband'
      }
    } as any);

    console.log('✅ Local data initialized successfully!');
    return true;
  } catch (error) {
    console.error('❌ Failed to initialize local data:', error);
    return false;
  }
}; 