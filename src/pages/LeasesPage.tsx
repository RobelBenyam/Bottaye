import React, { useEffect, useMemo, useState } from 'react';
import { Plus, Search, Filter, Calendar, FileText, AlertCircle, Clock, CheckCircle, User, MapPin, DollarSign, Download, Edit, Eye, X, Home } from 'lucide-react';
import { formatCurrency } from '../utils/currency';
import { useTenants } from '../hooks/useFirestore';
import { unitService, tenantService } from '../services/database';
import { localUnitService, localLeaseService } from '../services/localStorage';


interface Lease {
  id: string;
  tenantName: string;
  tenantEmail: string;
  tenantPhone: string;
  unitNumber: string;
  propertyName: string;
  startDate: string;
  endDate: string;
  monthlyRent: number;
  securityDeposit: number;
  leaseType: 'fixed' | 'month_to_month' | 'yearly';
  status: 'active' | 'expiring_soon' | 'expired' | 'terminated' | 'renewed';
  renewalOption: boolean;
  specialTerms?: string;
  documentUrl?: string;
  lastRenewalDate?: string;
  renewalNoticeDate?: string;
  petPolicy?: 'no_pets' | 'cats_allowed' | 'dogs_allowed' | 'all_pets';
  smokingPolicy?: 'no_smoking' | 'smoking_allowed';
  utilitiesIncluded?: string[];
  parkingSpaces?: number;
  lateFeePenalty?: number;
  earlyTerminationFee?: number;
  maintenanceResponsibility?: 'landlord' | 'tenant' | 'shared';
  emergencyContact?: { name: string; phone: string; relationship: string };
}

export default function LeasesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [activeTab, setActiveTab] = useState<'active' | 'expiring' | 'history' | 'templates'>('active');
  const [isNewLeaseOpen, setIsNewLeaseOpen] = useState(false);
  const [isRenewLeaseOpen, setIsRenewLeaseOpen] = useState(false);
  const [selectedLease, setSelectedLease] = useState<Lease | null>(null);
  const [isEditLeaseOpen, setIsEditLeaseOpen] = useState(false);
  const { tenants, loading: tenantsLoading } = useTenants();
  const [availableUnits, setAvailableUnits] = useState<any[]>([]);

  // Debug tenant loading
  useEffect(() => {
    console.log('🔍 Tenants loaded:', tenants);
    console.log('🔍 Tenants loading:', tenantsLoading);
  }, [tenants, tenantsLoading]);
  
  // New lease form state
  const [newLeaseForm, setNewLeaseForm] = useState({
    tenantId: '',
    unitId: '',
    startDate: '',
    endDate: '',
    monthlyRent: '',
    securityDeposit: '',
    leaseType: 'yearly' as 'fixed' | 'month_to_month' | 'yearly',
    petPolicy: 'no_pets' as 'no_pets' | 'cats_allowed' | 'dogs_allowed' | 'all_pets',
    smokingPolicy: 'no_smoking' as 'no_smoking' | 'smoking_allowed',
    utilitiesIncluded: [] as string[],
    parkingSpaces: '0',
    lateFeePenalty: '',
    earlyTerminationFee: '',
    renewalOption: true,
    maintenanceResponsibility: 'landlord' as 'landlord' | 'tenant' | 'shared',
    specialTerms: '',
    emergencyContact: {
      name: '',
      phone: '',
      relationship: ''
    }
  });

  useEffect(() => {
    const loadUnits = async () => {
      try {
        let units;
        try { units = await unitService.getAll(); } catch { units = await localUnitService.getAll(); }
        setAvailableUnits(units.filter((u: any) => u.status === 'vacant'));
      } catch {}
    };
    loadUnits();
  }, []);

  const handleCreateLease = async () => {
    if (!newLeaseForm.tenantId || !newLeaseForm.unitId || !newLeaseForm.startDate || !newLeaseForm.endDate) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const selectedTenant = tenants.find(t => t.id === newLeaseForm.tenantId);
      const selectedUnit = availableUnits.find(u => u.id === newLeaseForm.unitId);
      
      if (selectedTenant && selectedUnit) {
        // Here you would normally save to database
        const newLease: Lease = {
          id: Math.random().toString(36).slice(2),
          tenantName: selectedTenant.name,
          tenantEmail: selectedTenant.email,
          tenantPhone: selectedTenant.phone,
          unitNumber: selectedUnit.unitNumber,
          propertyName: selectedUnit.propertyName,
          startDate: newLeaseForm.startDate,
          endDate: newLeaseForm.endDate,
          monthlyRent: Number(newLeaseForm.monthlyRent || selectedUnit.rent || 0),
          securityDeposit: Number(newLeaseForm.securityDeposit || selectedUnit.deposit || 0),
          leaseType: newLeaseForm.leaseType,
          status: 'active',
          renewalOption: true,
          specialTerms: newLeaseForm.specialTerms
        };
        setLeases(prev => [newLease, ...prev]);
        await localLeaseService.create(newLease);
        
        alert('Lease created successfully!');
        setIsNewLeaseOpen(false);
        setNewLeaseForm({
          tenantId: '',
          unitId: '',
          startDate: '',
          endDate: '',
          monthlyRent: '',
          securityDeposit: '',
          leaseType: 'yearly',
          petPolicy: 'no_pets',
          smokingPolicy: 'no_smoking',
          utilitiesIncluded: [],
          parkingSpaces: '0',
          lateFeePenalty: '',
          earlyTerminationFee: '',
          renewalOption: true,
          maintenanceResponsibility: 'landlord',
          specialTerms: '',
          emergencyContact: {
            name: '',
            phone: '',
            relationship: ''
          }
        });
      }
    } catch (error) {
      alert('Failed to create lease');
    }
  };

  const handleEditLease = (lease: Lease) => {
    setSelectedLease(lease);
    setIsEditLeaseOpen(true);
  };

  const handleUpdateLease = async () => {
    if (!selectedLease) return;
    const form = document.getElementById('edit-lease-form') as HTMLFormElement | null;
    if (!form) { setIsEditLeaseOpen(false); return; }

    const formData = new FormData(form);

    const updated: Partial<Lease> = {
      startDate: String(formData.get('startDate') || selectedLease.startDate),
      endDate: String(formData.get('endDate') || selectedLease.endDate),
      leaseType: String(formData.get('leaseType') || selectedLease.leaseType) as any,
      monthlyRent: Number(formData.get('monthlyRent') as string) || selectedLease.monthlyRent,
      securityDeposit: Number(formData.get('securityDeposit') as string) || selectedLease.securityDeposit,
      petPolicy: String(formData.get('petPolicy') || selectedLease.petPolicy) as any,
      smokingPolicy: String(formData.get('smokingPolicy') || selectedLease.smokingPolicy) as any,
      parkingSpaces: Number(formData.get('parkingSpaces') as string) || selectedLease.parkingSpaces,
      lateFeePenalty: Number(formData.get('lateFeePenalty') as string) || selectedLease.lateFeePenalty,
      earlyTerminationFee: Number(formData.get('earlyTerminationFee') as string) || selectedLease.earlyTerminationFee,
      maintenanceResponsibility: String(formData.get('maintenanceResponsibility') || selectedLease.maintenanceResponsibility) as any,
      emergencyContact: {
        name: String(formData.get('ecName') || selectedLease.emergencyContact?.name || ''),
        phone: String(formData.get('ecPhone') || selectedLease.emergencyContact?.phone || ''),
        relationship: String(formData.get('ecRelationship') || selectedLease.emergencyContact?.relationship || ''),
      },
      renewalOption: Boolean(formData.get('renewalOption')),
      specialTerms: String(formData.get('specialTerms') || selectedLease.specialTerms || '')
    };

    setLeases(prev => prev.map(l => l.id === selectedLease.id ? { ...l, ...updated } : l));
         localLeaseService.update(selectedLease.id, updated).catch(console.error);
    setIsEditLeaseOpen(false);
  };

  // Leases state
  const [leases, setLeases] = useState<Lease[]>([]);

  // Load leases from localStorage
  useEffect(() => {
    const loadLeases = async () => {
      try {
        const existingLeases = await localLeaseService.getAll();
        if (existingLeases.length > 0) {
          setLeases(existingLeases);
        } else {
          // Initialize with sample leases if none exist
          const sampleLeases: Lease[] = [
            {
              id: '1',
              tenantName: 'John Doe',
              tenantEmail: 'john.doe@email.com',
              tenantPhone: '+254712345678',
              unitNumber: '2A',
              propertyName: 'Westlands Plaza',
              startDate: '2024-01-01',
              endDate: '2024-12-31',
              monthlyRent: 45000,
              securityDeposit: 90000,
              leaseType: 'yearly',
              status: 'active',
              renewalOption: true,
              specialTerms: 'Pet allowed with additional deposit',
              documentUrl: '/leases/john-doe-2024.pdf'
            },
            {
              id: '2',
              tenantName: 'Jane Smith',
              tenantEmail: 'jane.smith@email.com',
              tenantPhone: '+254798765432',
              unitNumber: '1B',
              propertyName: 'Kilimani Heights Apartments',
              startDate: '2024-03-01',
              endDate: '2024-11-30',
              monthlyRent: 35000,
              securityDeposit: 70000,
              leaseType: 'fixed',
              status: 'expiring_soon',
              renewalOption: true,
              renewalNoticeDate: '2024-09-30'
            },
            {
              id: '3',
              tenantName: 'Alice Brown',
              tenantEmail: 'alice.brown@email.com',
              tenantPhone: '+254734567890',
              unitNumber: '3C',
              propertyName: 'Karen Residences',
              startDate: '2023-06-01',
              endDate: '2024-05-31',
              monthlyRent: 65000,
              securityDeposit: 130000,
              leaseType: 'yearly',
              status: 'renewed',
              renewalOption: false,
              lastRenewalDate: '2024-06-01',
              specialTerms: 'Commercial use permitted'
            }
          ];
          // Save sample data to localStorage
          for (const lease of sampleLeases) {
            await localLeaseService.create(lease);
          }
          setLeases(sampleLeases);
        }
      } catch (error) {
        console.error('Failed to load leases:', error);
      }
    };
    loadLeases();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'expiring_soon': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'expired': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'terminated': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
      case 'renewed': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      default: return 'bg-secondary-100 text-secondary-800 dark:bg-secondary-700 dark:text-secondary-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'expiring_soon': return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      case 'expired': return <Clock className="h-5 w-5 text-red-600" />;
      case 'renewed': return <CheckCircle className="h-5 w-5 text-blue-600" />;
      default: return <FileText className="h-5 w-5 text-secondary-400" />;
    }
  };

  const getDaysUntilExpiry = (endDate: string) => {
    const today = new Date();
    const expiry = new Date(endDate);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const filteredLeases = leases.filter(lease => {
    const matchesSearch = lease.tenantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lease.unitNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lease.propertyName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || lease.status === filterStatus;
    const matchesType = filterType === 'all' || lease.leaseType === filterType;
    
    // Filter by tab
    if (activeTab === 'active') {
      return matchesSearch && matchesStatus && matchesType && lease.status === 'active';
    } else if (activeTab === 'expiring') {
      return matchesSearch && matchesStatus && matchesType && 
             (lease.status === 'expiring_soon' || getDaysUntilExpiry(lease.endDate) <= 90);
    } else if (activeTab === 'history') {
      return matchesSearch && matchesStatus && matchesType && 
             (lease.status === 'expired' || lease.status === 'terminated' || lease.status === 'renewed');
    }
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const getTabCount = (tab: string) => {
    switch (tab) {
      case 'active': return leases.filter(l => l.status === 'active').length;
      case 'expiring': return leases.filter(l => l.status === 'expiring_soon' || getDaysUntilExpiry(l.endDate) <= 90).length;
      case 'history': return leases.filter(l => ['expired', 'terminated', 'renewed'].includes(l.status)).length;
      default: return 0;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900 dark:text-secondary-100">
            Lease Management
          </h1>
          <p className="text-secondary-600 dark:text-secondary-400 mt-1">
            Manage lease agreements, renewals, and contract documentation
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="btn-secondary flex items-center">
            <Download className="h-5 w-5 mr-2" />
            Export
          </button>
          <button 
            onClick={() => setIsNewLeaseOpen(true)}
            className="btn-primary flex items-center"
          >
            <Plus className="h-5 w-5 mr-2" />
            New Lease
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-secondary-200 dark:border-secondary-700">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'active', name: 'Active Leases', count: getTabCount('active') },
            { id: 'expiring', name: 'Expiring Soon', count: getTabCount('expiring') },
            { id: 'history', name: 'Lease History', count: getTabCount('history') },
            { id: 'templates', name: 'Templates', count: 0 }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-secondary-500 hover:text-secondary-700 hover:border-secondary-300 dark:text-secondary-400 dark:hover:text-secondary-300'
              }`}
            >
              <span>{tab.name}</span>
              {tab.count > 0 && (
                <span className="bg-secondary-100 dark:bg-secondary-700 text-secondary-600 dark:text-secondary-300 py-0.5 px-2 rounded-full text-xs">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Filters */}
      {activeTab !== 'templates' && (
        <div className="flex items-center space-x-4">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search leases, tenants, or properties..."
                className="input-field pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-secondary-400" />
            <select
              className="input-field"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="expiring_soon">Expiring Soon</option>
              <option value="expired">Expired</option>
              <option value="terminated">Terminated</option>
              <option value="renewed">Renewed</option>
            </select>
            
            <select
              className="input-field"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="all">All Types</option>
              <option value="yearly">Yearly</option>
              <option value="fixed">Fixed Term</option>
              <option value="month_to_month">Month to Month</option>
            </select>
          </div>
        </div>
      )}

      {/* Content */}
      {activeTab === 'templates' ? (
        /* Lease Templates */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-secondary-800 rounded-xl shadow-sm border border-secondary-200 dark:border-secondary-700 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <FileText className="h-8 w-8 text-primary-600 dark:text-primary-400" />
              <div>
                <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100">
                  Residential Lease Template
                </h3>
                <p className="text-sm text-secondary-600 dark:text-secondary-400">
                  Standard residential lease agreement
                </p>
              </div>
            </div>
            <div className="flex space-x-2">
              <button className="btn-secondary flex-1 text-sm">
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </button>
              <button className="btn-primary flex-1 text-sm">
                <Plus className="h-4 w-4 mr-2" />
                Use Template
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-secondary-800 rounded-xl shadow-sm border border-secondary-200 dark:border-secondary-700 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <FileText className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              <div>
                <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100">
                  Commercial Lease Template
                </h3>
                <p className="text-sm text-secondary-600 dark:text-secondary-400">
                  Commercial property lease agreement
                </p>
              </div>
            </div>
            <div className="flex space-x-2">
              <button className="btn-secondary flex-1 text-sm">
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </button>
              <button className="btn-primary flex-1 text-sm">
                <Plus className="h-4 w-4 mr-2" />
                Use Template
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-secondary-800 rounded-xl shadow-sm border border-secondary-200 dark:border-secondary-700 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <FileText className="h-8 w-8 text-green-600 dark:text-green-400" />
              <div>
                <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100">
                  Month-to-Month Template
                </h3>
                <p className="text-sm text-secondary-600 dark:text-secondary-400">
                  Flexible monthly rental agreement
                </p>
              </div>
            </div>
            <div className="flex space-x-2">
              <button className="btn-secondary flex-1 text-sm">
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </button>
              <button className="btn-primary flex-1 text-sm">
                <Plus className="h-4 w-4 mr-2" />
                Use Template
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Lease List */
        <div className="grid grid-cols-1 gap-6">
          {filteredLeases.map((lease) => (
            <div
              key={lease.id}
              className="bg-white dark:bg-secondary-800 rounded-xl shadow-sm border border-secondary-200 dark:border-secondary-700 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    {getStatusIcon(lease.status)}
                    <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100">
                      {lease.tenantName}
                    </h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(lease.status)}`}>
                      {lease.status.replace('_', ' ')}
                    </span>
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-secondary-100 text-secondary-800 dark:bg-secondary-700 dark:text-secondary-300">
                      {lease.leaseType.replace('_', ' ')}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm mb-3">
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-secondary-400" />
                      <span className="text-secondary-600 dark:text-secondary-400">
                        Unit {lease.unitNumber}, {lease.propertyName}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-secondary-400" />
                      <span className="text-secondary-600 dark:text-secondary-400">
                        {new Date(lease.startDate).toLocaleDateString()} - {new Date(lease.endDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <DollarSign className="h-4 w-4 text-secondary-400" />
                      <span className="text-secondary-600 dark:text-secondary-400">
                        {formatCurrency(lease.monthlyRent)}/month
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-secondary-400" />
                      <span className="text-secondary-600 dark:text-secondary-400">
                        {lease.tenantPhone}
                      </span>
                    </div>
                  </div>

                  {lease.specialTerms && (
                    <p className="text-sm text-secondary-600 dark:text-secondary-400 mb-3">
                      <span className="font-medium">Special Terms:</span> {lease.specialTerms}
                    </p>
                  )}
                </div>
                
                <div className="flex flex-col items-end space-y-2">
                  {lease.status === 'expiring_soon' || getDaysUntilExpiry(lease.endDate) <= 90 ? (
                    <div className="text-right">
                      <span className="text-sm font-medium text-yellow-600 dark:text-yellow-400">
                        Expires in {getDaysUntilExpiry(lease.endDate)} days
                      </span>
                      {lease.renewalOption && (
                        <p className="text-xs text-secondary-500">Renewal option available</p>
                      )}
                    </div>
                  ) : (
                    <span className="text-sm text-secondary-500">
                      {getDaysUntilExpiry(lease.endDate)} days remaining
                    </span>
                  )}
                </div>
              </div>
              
              <div className="flex items-center justify-between pt-3 border-t border-secondary-200 dark:border-secondary-600">
                <div className="flex items-center space-x-4 text-sm text-secondary-600 dark:text-secondary-400">
                  <span>Deposit: {formatCurrency(lease.securityDeposit)}</span>
                  {lease.lastRenewalDate && (
                    <span>Last Renewed: {new Date(lease.lastRenewalDate).toLocaleDateString()}</span>
                  )}
                  {lease.renewalNoticeDate && (
                    <span>Notice Date: {new Date(lease.renewalNoticeDate).toLocaleDateString()}</span>
                  )}
                </div>
                
                <div className="flex items-center space-x-2">
                  {lease.documentUrl && (
                    <button className="btn-secondary text-sm py-1 px-3">
                      <Download className="h-3 w-3 mr-1" />
                      Document
                    </button>
                  )}
                  <button 
                    onClick={() => handleEditLease(lease)}
                    className="btn-secondary text-sm py-1 px-3"
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Edit
                  </button>
                  {lease.status === 'expiring_soon' && lease.renewalOption && (
                    <button 
                      onClick={() => { setSelectedLease(lease); setIsRenewLeaseOpen(true); }}
                      className="btn-primary text-sm py-1 px-3"
                    >
                      Renew Lease
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {filteredLeases.length === 0 && activeTab !== 'templates' && (
        <div className="text-center py-12">
          <FileText className="h-16 w-16 text-secondary-300 dark:text-secondary-600 mx-auto mb-4" />
          <p className="text-lg font-medium text-secondary-900 dark:text-secondary-100 mb-2">
            No leases found
          </p>
          <p className="text-secondary-600 dark:text-secondary-400">
            {searchTerm || filterStatus !== 'all' || filterType !== 'all'
              ? 'Try adjusting your search or filter criteria'
              : `No ${activeTab} leases at the moment`
            }
          </p>
        </div>
      )}
      {/* New Lease Modal */}
      {isNewLeaseOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-secondary-800 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-secondary-200 dark:border-secondary-600">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-secondary-900 dark:text-secondary-100">Create New Lease</h2>
                  <p className="text-sm text-secondary-600 dark:text-secondary-400">Assign a tenant to a vacant unit</p>
                </div>
              </div>
              <button onClick={() => setIsNewLeaseOpen(false)} className="p-2 hover:bg-secondary-100 dark:hover:bg-secondary-700 rounded-lg transition-colors">
                <X className="w-5 h-5 text-secondary-500" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <label className="text-sm text-secondary-600 dark:text-secondary-400">Select Tenant</label>
                <select 
                  className="input-field"
                  value={newLeaseForm.tenantId}
                  onChange={(e) => setNewLeaseForm(prev => ({ ...prev, tenantId: e.target.value }))}
                >
                  <option value="">Select tenant</option>
                  {tenants.map((t: any) => (
                    <option key={t.id} value={t.id}>{t.name} ({t.email})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm text-secondary-600 dark:text-secondary-400">Select Vacant Unit</label>
                <div className="relative">
                  <Home className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-400 h-4 w-4" />
                  <select 
                    className="input-field pl-9"
                    value={newLeaseForm.unitId}
                    onChange={(e) => setNewLeaseForm(prev => ({ ...prev, unitId: e.target.value }))}
                  >
                    <option value="">Select unit</option>
                    {availableUnits.map((u: any) => (
                      <option key={u.id} value={u.id}>{u.propertyName} - Unit {u.unitNumber} ({u.rent.toLocaleString()})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-secondary-600 dark:text-secondary-400">Lease Start Date</label>
                  <input 
                    type="date" 
                    className="input-field"
                    value={newLeaseForm.startDate}
                    onChange={(e) => setNewLeaseForm(prev => ({ ...prev, startDate: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-sm text-secondary-600 dark:text-secondary-400">Lease End Date</label>
                  <input 
                    type="date" 
                    className="input-field"
                    value={newLeaseForm.endDate}
                    onChange={(e) => setNewLeaseForm(prev => ({ ...prev, endDate: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-secondary-600 dark:text-secondary-400">Monthly Rent (KSH)</label>
                  <input 
                    type="number" 
                    className="input-field"
                    value={newLeaseForm.monthlyRent}
                    onChange={(e) => setNewLeaseForm(prev => ({ ...prev, monthlyRent: e.target.value }))}
                    placeholder="45000"
                  />
                </div>
                <div>
                  <label className="text-sm text-secondary-600 dark:text-secondary-400">Security Deposit (KSH)</label>
                  <input 
                    type="number" 
                    className="input-field"
                    value={newLeaseForm.securityDeposit}
                    onChange={(e) => setNewLeaseForm(prev => ({ ...prev, securityDeposit: e.target.value }))}
                    placeholder="90000"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm text-secondary-600 dark:text-secondary-400">Lease Type</label>
                  <select 
                    className="input-field"
                    value={newLeaseForm.leaseType}
                    onChange={(e) => setNewLeaseForm(prev => ({ ...prev, leaseType: e.target.value as any }))}
                  >
                    <option value="yearly">Yearly</option>
                    <option value="fixed">Fixed Term</option>
                    <option value="month_to_month">Month to Month</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm text-secondary-600 dark:text-secondary-400">Pet Policy</label>
                  <select 
                    className="input-field"
                    value={newLeaseForm.petPolicy}
                    onChange={(e) => setNewLeaseForm(prev => ({ ...prev, petPolicy: e.target.value as any }))}
                  >
                    <option value="no_pets">No Pets</option>
                    <option value="cats_allowed">Cats Allowed</option>
                    <option value="dogs_allowed">Dogs Allowed</option>
                    <option value="all_pets">All Pets Allowed</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm text-secondary-600 dark:text-secondary-400">Smoking Policy</label>
                  <select 
                    className="input-field"
                    value={newLeaseForm.smokingPolicy}
                    onChange={(e) => setNewLeaseForm(prev => ({ ...prev, smokingPolicy: e.target.value as any }))}
                  >
                    <option value="no_smoking">No Smoking</option>
                    <option value="smoking_allowed">Smoking Allowed</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-secondary-600 dark:text-secondary-400">Parking Spaces</label>
                  <input 
                    type="number" 
                    className="input-field"
                    value={newLeaseForm.parkingSpaces}
                    onChange={(e) => setNewLeaseForm(prev => ({ ...prev, parkingSpaces: e.target.value }))}
                    min="0"
                    placeholder="1"
                  />
                </div>
                <div>
                  <label className="text-sm text-secondary-600 dark:text-secondary-400">Late Fee Penalty (KSH)</label>
                  <input 
                    type="number" 
                    className="input-field"
                    value={newLeaseForm.lateFeePenalty}
                    onChange={(e) => setNewLeaseForm(prev => ({ ...prev, lateFeePenalty: e.target.value }))}
                    placeholder="5000"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm text-secondary-600 dark:text-secondary-400">Emergency Contact</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-2">
                  <input 
                    type="text" 
                    className="input-field"
                    value={newLeaseForm.emergencyContact.name}
                    onChange={(e) => setNewLeaseForm(prev => ({ ...prev, emergencyContact: { ...prev.emergencyContact, name: e.target.value } }))}
                    placeholder="Contact Name"
                  />
                  <input 
                    type="tel" 
                    className="input-field"
                    value={newLeaseForm.emergencyContact.phone}
                    onChange={(e) => setNewLeaseForm(prev => ({ ...prev, emergencyContact: { ...prev.emergencyContact, phone: e.target.value } }))}
                    placeholder="+254712345678"
                  />
                  <input 
                    type="text" 
                    className="input-field"
                    value={newLeaseForm.emergencyContact.relationship}
                    onChange={(e) => setNewLeaseForm(prev => ({ ...prev, emergencyContact: { ...prev.emergencyContact, relationship: e.target.value } }))}
                    placeholder="Relationship"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm text-secondary-600 dark:text-secondary-400">Special Terms & Conditions</label>
                <textarea 
                  className="input-field" 
                  rows={4}
                  value={newLeaseForm.specialTerms}
                  onChange={(e) => setNewLeaseForm(prev => ({ ...prev, specialTerms: e.target.value }))}
                  placeholder="Any special terms, conditions, or agreements..."
                ></textarea>
              </div>

              <div className="flex space-x-3 pt-3">
                <button className="flex-1 btn-secondary" onClick={() => setIsNewLeaseOpen(false)}>Cancel</button>
                <button className="flex-1 btn-primary" onClick={handleCreateLease}>Create Lease</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Renew Lease Modal */}
      {isRenewLeaseOpen && selectedLease && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-secondary-800 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-secondary-200 dark:border-secondary-600">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-secondary-900 dark:text-secondary-100">Renew Lease</h2>
                  <p className="text-sm text-secondary-600 dark:text-secondary-400">{selectedLease.tenantName} - Unit {selectedLease.unitNumber}</p>
                </div>
              </div>
              <button onClick={() => setIsRenewLeaseOpen(false)} className="p-2 hover:bg-secondary-100 dark:hover:bg-secondary-700 rounded-lg transition-colors">
                <X className="w-5 h-5 text-secondary-500" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-secondary-600 dark:text-secondary-400">New Start Date</label>
                  <input type="date" className="input-field" />
                </div>
                <div>
                  <label className="text-sm text-secondary-600 dark:text-secondary-400">New End Date</label>
                  <input type="date" className="input-field" />
                </div>
              </div>

              <div>
                <label className="text-sm text-secondary-600 dark:text-secondary-400">Special Terms</label>
                <textarea className="input-field" rows={3} placeholder="Add any renewal terms"></textarea>
              </div>

              <div className="flex space-x-3 pt-3">
                <button className="flex-1 btn-secondary" onClick={() => setIsRenewLeaseOpen(false)}>Cancel</button>
                <button className="flex-1 btn-primary">Confirm Renewal</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Lease Modal */}
      {isEditLeaseOpen && selectedLease && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-secondary-800 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-secondary-200 dark:border-secondary-600">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center">
                  <Edit className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-secondary-900 dark:text-secondary-100">Edit Lease</h2>
                  <p className="text-sm text-secondary-600 dark:text-secondary-400">{selectedLease.tenantName} - Unit {selectedLease.unitNumber}</p>
                </div>
              </div>
              <button onClick={() => setIsEditLeaseOpen(false)} className="p-2 hover:bg-secondary-100 dark:hover:bg-secondary-700 rounded-lg transition-colors">
                <X className="w-5 h-5 text-secondary-500" />
              </button>
            </div>

                        <form id="edit-lease-form" className="p-6 space-y-6" onSubmit={(e) => { e.preventDefault(); handleUpdateLease(); }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-secondary-600 dark:text-secondary-400">Lease Start Date</label>
                  <input name="startDate" type="date" className="input-field" defaultValue={selectedLease.startDate} />
                </div>
                <div>
                  <label className="text-sm text-secondary-600 dark:text-secondary-400">Lease End Date</label>
                  <input name="endDate" type="date" className="input-field" defaultValue={selectedLease.endDate} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-secondary-600 dark:text-secondary-400">Monthly Rent</label>
                  <input name="monthlyRent" type="number" className="input-field" defaultValue={selectedLease.monthlyRent} />
                </div>
                <div>
                  <label className="text-sm text-secondary-600 dark:text-secondary-400">Security Deposit</label>
                  <input name="securityDeposit" type="number" className="input-field" defaultValue={selectedLease.securityDeposit} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm text-secondary-600 dark:text-secondary-400">Lease Type</label>
                  <select name="leaseType" className="input-field" defaultValue={selectedLease.leaseType}>
                    <option value="yearly">Yearly</option>
                    <option value="fixed">Fixed Term</option>
                    <option value="month_to_month">Month to Month</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm text-secondary-600 dark:text-secondary-400">Pet Policy</label>
                  <select name="petPolicy" className="input-field" defaultValue={selectedLease.petPolicy || 'no_pets'}>
                    <option value="no_pets">No Pets</option>
                    <option value="cats_allowed">Cats Allowed</option>
                    <option value="dogs_allowed">Dogs Allowed</option>
                    <option value="all_pets">All Pets Allowed</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm text-secondary-600 dark:text-secondary-400">Smoking Policy</label>
                  <select name="smokingPolicy" className="input-field" defaultValue={selectedLease.smokingPolicy || 'no_smoking'}>
                    <option value="no_smoking">No Smoking</option>
                    <option value="smoking_allowed">Smoking Allowed</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm text-secondary-600 dark:text-secondary-400">Parking Spaces</label>
                  <input name="parkingSpaces" type="number" className="input-field" defaultValue={selectedLease.parkingSpaces || 0} />
                </div>
                <div>
                  <label className="text-sm text-secondary-600 dark:text-secondary-400">Late Fee Penalty (KSH)</label>
                  <input name="lateFeePenalty" type="number" className="input-field" defaultValue={selectedLease.lateFeePenalty || 0} />
                </div>
                <div>
                  <label className="text-sm text-secondary-600 dark:text-secondary-400">Early Termination Fee (KSH)</label>
                  <input name="earlyTerminationFee" type="number" className="input-field" defaultValue={selectedLease.earlyTerminationFee || 0} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-secondary-600 dark:text-secondary-400">Maintenance Responsibility</label>
                  <select name="maintenanceResponsibility" className="input-field" defaultValue={selectedLease.maintenanceResponsibility || 'landlord'}>
                    <option value="landlord">Landlord</option>
                    <option value="tenant">Tenant</option>
                    <option value="shared">Shared</option>
                  </select>
                </div>
                <div className="flex items-center space-x-2">
                  <input id="renewalOption" name="renewalOption" type="checkbox" className="h-4 w-4" defaultChecked={selectedLease.renewalOption} />
                  <label htmlFor="renewalOption" className="text-sm text-secondary-600 dark:text-secondary-400">Renewal Option Available</label>
                </div>
              </div>

              <div>
                <label className="text-sm text-secondary-600 dark:text-secondary-400">Emergency Contact</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-2">
                  <input name="ecName" type="text" className="input-field" defaultValue={selectedLease.emergencyContact?.name || ''} placeholder="Contact Name" />
                  <input name="ecPhone" type="tel" className="input-field" defaultValue={selectedLease.emergencyContact?.phone || ''} placeholder="+254712345678" />
                  <input name="ecRelationship" type="text" className="input-field" defaultValue={selectedLease.emergencyContact?.relationship || ''} placeholder="Relationship" />
                </div>
              </div>

              <div>
                <label className="text-sm text-secondary-600 dark:text-secondary-400">Special Terms</label>
                <textarea name="specialTerms" className="input-field" rows={3} defaultValue={selectedLease.specialTerms}></textarea>
              </div>

              <div className="flex space-x-3 pt-3">
                <button type="button" className="flex-1 btn-secondary" onClick={() => setIsEditLeaseOpen(false)}>Cancel</button>
                <button type="submit" className="flex-1 btn-primary">Update Lease</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 