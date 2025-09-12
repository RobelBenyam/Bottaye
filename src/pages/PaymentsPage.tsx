import React, { useState } from 'react';
import { Plus, Search, Filter, CheckCircle, Clock, AlertTriangle, CreditCard, Download, Eye, X, Calendar, User, MapPin, DollarSign } from 'lucide-react';
import { formatCurrency } from '../utils/currency';

interface Payment {
  id: string;
  tenantName: string;
  unitNumber: string;
  propertyName: string;
  amount: number;
  type: 'rent' | 'deposit' | 'late_fee' | 'maintenance' | 'utilities';
  method: 'mpesa' | 'bank_transfer' | 'cash' | 'cheque';
  referenceNumber: string;
  dueDate: string;
  paidDate: string | null;
  status: 'paid' | 'pending' | 'overdue' | 'partial';
  notes?: string;
}

export default function PaymentsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isRecordPaymentOpen, setIsRecordPaymentOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [isPaymentDetailsOpen, setIsPaymentDetailsOpen] = useState(false);

  const mockPayments: Payment[] = [
    {
      id: '1',
      tenantName: 'John Doe',
      unitNumber: '2A',
      propertyName: 'Westlands Plaza',
      amount: 45000,
      type: 'rent',
      method: 'mpesa',
      referenceNumber: 'QA12B345CD',
      dueDate: '2024-09-01',
      paidDate: '2024-09-02',
      status: 'paid'
    },
    {
      id: '2',
      tenantName: 'Jane Smith',
      unitNumber: '1B',
      propertyName: 'Kilimani Heights',
      amount: 30000,
      type: 'rent',
      method: 'bank_transfer',
      referenceNumber: 'BT789012',
      dueDate: '2024-09-15',
      paidDate: null,
      status: 'pending'
    },
    {
      id: '3',
      tenantName: 'Michael Johnson',
      unitNumber: 'A1',
      propertyName: 'Karen Residences',
      amount: 85000,
      type: 'rent',
      method: 'cheque',
      referenceNumber: 'CHQ001234',
      dueDate: '2024-08-01',
      paidDate: null,
      status: 'overdue'
    },
    {
      id: '4',
      tenantName: 'Alice Brown',
      unitNumber: '3C',
      propertyName: 'Karen Residences',
      amount: 65000,
      type: 'rent',
      method: 'mpesa',
      referenceNumber: 'QX98Y765ZW',
      dueDate: '2024-09-01',
      paidDate: '2024-08-31',
      status: 'paid'
    },
    {
      id: '5',
      tenantName: 'John Doe',
      unitNumber: '2A',
      propertyName: 'Westlands Plaza',
      amount: 90000,
      type: 'deposit',
      method: 'bank_transfer',
      referenceNumber: 'BT456789',
      dueDate: '2024-01-01',
      paidDate: '2024-01-01',
      status: 'paid'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'overdue': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'partial': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      default: return 'bg-secondary-100 text-secondary-800 dark:bg-secondary-700 dark:text-secondary-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'pending': return <Clock className="h-5 w-5 text-yellow-600" />;
      case 'overdue': return <AlertTriangle className="h-5 w-5 text-red-600" />;
      case 'partial': return <Clock className="h-5 w-5 text-blue-600" />;
      default: return <CreditCard className="h-5 w-5 text-secondary-400" />;
    }
  };

  const getTypeLabel = (type: string) => {
    const types = {
      'rent': 'Monthly Rent',
      'deposit': 'Security Deposit',
      'late_fee': 'Late Fee',
      'maintenance': 'Maintenance',
      'utilities': 'Utilities'
    };
    return types[type as keyof typeof types] || type;
  };

  const getDaysOverdue = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = today.getTime() - due.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const filteredPayments = mockPayments.filter(payment => {
    const matchesSearch = payment.tenantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.unitNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.propertyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.referenceNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || payment.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const totalReceived = mockPayments
    .filter(p => p.status === 'paid')
    .reduce((sum, p) => sum + p.amount, 0);

  const totalPending = mockPayments
    .filter(p => p.status === 'pending' || p.status === 'overdue')
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900 dark:text-secondary-100">
            Payment Management
          </h1>
          <p className="text-secondary-600 dark:text-secondary-400 mt-1">
            Track rent payments, deposits, and financial transactions
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="btn-secondary flex items-center">
            <Download className="h-5 w-5 mr-2" />
            Export Report
          </button>
          <button 
            onClick={() => setIsRecordPaymentOpen(true)}
            className="btn-primary flex items-center"
          >
            <Plus className="h-5 w-5 mr-2" />
            Record Payment
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-secondary-800 rounded-xl shadow-sm border border-secondary-200 dark:border-secondary-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-secondary-600 dark:text-secondary-400">Total Received</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {formatCurrency(totalReceived)}
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white dark:bg-secondary-800 rounded-xl shadow-sm border border-secondary-200 dark:border-secondary-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-secondary-600 dark:text-secondary-400">Total Pending</p>
              <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                {formatCurrency(totalPending)}
              </p>
            </div>
            <Clock className="h-8 w-8 text-yellow-600" />
          </div>
        </div>

        <div className="bg-white dark:bg-secondary-800 rounded-xl shadow-sm border border-secondary-200 dark:border-secondary-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-secondary-600 dark:text-secondary-400">Collection Rate</p>
              <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                {Math.round((totalReceived / (totalReceived + totalPending)) * 100)}%
              </p>
            </div>
            <CreditCard className="h-8 w-8 text-primary-600" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search payments, tenants, or references..."
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
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="overdue">Overdue</option>
            <option value="partial">Partial</option>
          </select>
        </div>
      </div>

      {/* Payments List */}
      <div className="grid grid-cols-1 gap-4">
        {filteredPayments.map((payment) => (
          <div
            key={payment.id}
            className="bg-white dark:bg-secondary-800 rounded-xl shadow-sm border border-secondary-200 dark:border-secondary-700 p-6 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => {
              setSelectedPayment(payment);
              setIsPaymentDetailsOpen(true);
            }}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  {getStatusIcon(payment.status)}
                  <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100">
                    {payment.tenantName}
                  </h3>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(payment.status)}`}>
                    {payment.status}
                  </span>
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-secondary-100 text-secondary-800 dark:bg-secondary-700 dark:text-secondary-300">
                    {getTypeLabel(payment.type)}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-secondary-400" />
                    <span className="text-secondary-600 dark:text-secondary-400">
                      Unit {payment.unitNumber}, {payment.propertyName}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-4 w-4 text-secondary-400" />
                    <span className="text-secondary-600 dark:text-secondary-400">
                      {formatCurrency(payment.amount)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-secondary-400" />
                    <span className="text-secondary-600 dark:text-secondary-400">
                      Due: {new Date(payment.dueDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CreditCard className="h-4 w-4 text-secondary-400" />
                    <span className="text-secondary-600 dark:text-secondary-400">
                      {payment.method.replace('_', ' ')} - {payment.referenceNumber}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col items-end space-y-2">
                <span className="text-lg font-semibold text-secondary-900 dark:text-secondary-100">
                  {formatCurrency(payment.amount)}
                </span>
                {payment.status === 'overdue' && (
                  <span className="text-sm text-red-600 dark:text-red-400">
                    {getDaysOverdue(payment.dueDate)} days overdue
                  </span>
                )}
                {payment.paidDate && (
                  <span className="text-sm text-green-600 dark:text-green-400">
                    Paid: {new Date(payment.paidDate).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
            
            {payment.notes && (
              <div className="pt-3 border-t border-secondary-200 dark:border-secondary-600">
                <p className="text-sm text-secondary-600 dark:text-secondary-400">
                  <span className="font-medium">Notes:</span> {payment.notes}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredPayments.length === 0 && (
        <div className="text-center py-12">
          <CreditCard className="h-16 w-16 text-secondary-300 dark:text-secondary-600 mx-auto mb-4" />
          <p className="text-lg font-medium text-secondary-900 dark:text-secondary-100 mb-2">
            No payments found
          </p>
          <p className="text-secondary-600 dark:text-secondary-400">
            {searchTerm || filterStatus !== 'all'
              ? 'Try adjusting your search or filter criteria'
              : 'Payment records will appear here'
            }
          </p>
        </div>
      )}

      {/* Record Payment Modal */}
      {isRecordPaymentOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-secondary-800 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-secondary-200 dark:border-secondary-600">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-secondary-900 dark:text-secondary-100">
                    Record New Payment
                  </h2>
                  <p className="text-sm text-secondary-600 dark:text-secondary-400">
                    Log a payment received from tenant
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsRecordPaymentOpen(false)}
                className="p-2 hover:bg-secondary-100 dark:hover:bg-secondary-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-secondary-500" />
              </button>
            </div>
            
            <div className="p-6">
              <p className="text-secondary-600 dark:text-secondary-400 text-center py-8">
                Payment recording form would go here...
                <br />
                <span className="text-sm">TODO: Implement payment form</span>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Payment Details Modal */}
      {selectedPayment && isPaymentDetailsOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-secondary-800 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-secondary-200 dark:border-secondary-600">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-secondary-900 dark:text-secondary-100">
                    Payment Details
                  </h2>
                  <p className="text-sm text-secondary-600 dark:text-secondary-400">
                    {selectedPayment.tenantName} - {getTypeLabel(selectedPayment.type)}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsPaymentDetailsOpen(false)}
                className="p-2 hover:bg-secondary-100 dark:hover:bg-secondary-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-secondary-500" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100">
                    Payment Information
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="text-secondary-600 dark:text-secondary-400">Amount:</span>
                      <p className="font-semibold text-xl text-secondary-900 dark:text-secondary-100">
                        {formatCurrency(selectedPayment.amount)}
                      </p>
                    </div>
                    <div>
                      <span className="text-secondary-600 dark:text-secondary-400">Type:</span>
                      <p className="font-medium text-secondary-900 dark:text-secondary-100">
                        {getTypeLabel(selectedPayment.type)}
                      </p>
                    </div>
                    <div>
                      <span className="text-secondary-600 dark:text-secondary-400">Method:</span>
                      <p className="font-medium text-secondary-900 dark:text-secondary-100">
                        {selectedPayment.method.replace('_', ' ')}
                      </p>
                    </div>
                    <div>
                      <span className="text-secondary-600 dark:text-secondary-400">Reference:</span>
                      <p className="font-medium text-secondary-900 dark:text-secondary-100">
                        {selectedPayment.referenceNumber}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100">
                    Actions
                  </h3>
                  <div className="space-y-2">
                    <button className="btn-primary w-full flex items-center justify-center">
                      <Download className="h-4 w-4 mr-2" />
                      Generate Receipt
                    </button>
                    <button className="btn-secondary w-full flex items-center justify-center">
                      <Eye className="h-4 w-4 mr-2" />
                      View Transaction History
                    </button>
                    {selectedPayment.status !== 'paid' && (
                      <button className="btn-secondary w-full flex items-center justify-center">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Mark as Paid
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 