import React, { useState } from 'react';
import { Plus, Search, Filter, Calendar, Wrench, CheckCircle, Clock, AlertCircle, User, MapPin, DollarSign } from 'lucide-react';

interface MaintenanceRequest {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  unitNumber: string;
  propertyName: string;
  tenantName: string;
  reportedDate: string;
  scheduledDate?: string;
  completedDate?: string;
  assignedTo?: string;
  estimatedCost?: number;
  actualCost?: number;
  category: 'plumbing' | 'electrical' | 'hvac' | 'appliance' | 'structural' | 'cleaning' | 'other';
}

export default function MaintenancePage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');

  // Mock data
  const maintenanceRequests: MaintenanceRequest[] = [
    {
      id: '1',
      title: 'Leaking Kitchen Faucet',
      description: 'Kitchen faucet has been dripping constantly for the past week',
      priority: 'medium',
      status: 'pending',
      unitNumber: '2A',
      propertyName: 'Westlands Plaza',
      tenantName: 'John Doe',
      reportedDate: '2024-09-10',
      category: 'plumbing',
      estimatedCost: 5000
    },
    {
      id: '2',
      title: 'Air Conditioning Not Working',
      description: 'AC unit stopped working yesterday. Room is getting very hot.',
      priority: 'high',
      status: 'in_progress',
      unitNumber: '1B',
      propertyName: 'Kilimani Heights Apartments',
      tenantName: 'Jane Smith',
      reportedDate: '2024-09-08',
      scheduledDate: '2024-09-11',
      assignedTo: 'Mike Johnson - HVAC Tech',
      category: 'hvac',
      estimatedCost: 15000
    },
    {
      id: '3',
      title: 'Broken Ceiling Light',
      description: 'Main bedroom ceiling light fixture fell down',
      priority: 'urgent',
      status: 'completed',
      unitNumber: '3C',
      propertyName: 'Karen Residences',
      tenantName: 'Alice Brown',
      reportedDate: '2024-09-05',
      completedDate: '2024-09-06',
      assignedTo: 'David Wilson - Electrician',
      category: 'electrical',
      estimatedCost: 8000,
      actualCost: 7500
    },
    {
      id: '4',
      title: 'Clogged Bathroom Drain',
      description: 'Bathroom sink drain is completely blocked',
      priority: 'medium',
      status: 'pending',
      unitNumber: '1A',
      propertyName: 'Kilimani Heights Apartments',
      tenantName: 'Michael Johnson',
      reportedDate: '2024-09-09',
      category: 'plumbing',
      estimatedCost: 3000
    }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'high': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      default: return 'bg-secondary-100 text-secondary-800 dark:bg-secondary-700 dark:text-secondary-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'in_progress': return <Clock className="h-5 w-5 text-blue-600" />;
      case 'pending': return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      default: return <Wrench className="h-5 w-5 text-secondary-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'in_progress': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default: return 'bg-secondary-100 text-secondary-800 dark:bg-secondary-700 dark:text-secondary-300';
    }
  };

  const filteredRequests = maintenanceRequests.filter(request => {
    const matchesSearch = request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.unitNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.propertyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.tenantName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || request.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || request.priority === filterPriority;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900 dark:text-secondary-100">
            Maintenance Requests
          </h1>
          <p className="text-secondary-600 dark:text-secondary-400 mt-1">
            Track and manage property maintenance requests and schedules
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="btn-secondary flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Schedule
          </button>
          <button className="btn-primary flex items-center">
            <Plus className="h-5 w-5 mr-2" />
            New Request
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search requests, units, or tenants..."
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
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          
          <select
            className="input-field"
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
          >
            <option value="all">All Priority</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* Maintenance Requests Grid */}
      <div className="grid grid-cols-1 gap-6">
        {filteredRequests.map((request) => (
          <div
            key={request.id}
            className="bg-white dark:bg-secondary-800 rounded-xl shadow-sm border border-secondary-200 dark:border-secondary-700 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  {getStatusIcon(request.status)}
                  <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100">
                    {request.title}
                  </h3>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(request.priority)}`}>
                    {request.priority}
                  </span>
                </div>
                <p className="text-secondary-600 dark:text-secondary-400 mb-3">
                  {request.description}
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-secondary-400" />
                    <span className="text-secondary-600 dark:text-secondary-400">
                      Unit {request.unitNumber}, {request.propertyName}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-secondary-400" />
                    <span className="text-secondary-600 dark:text-secondary-400">
                      {request.tenantName}
                    </span>
                  </div>
                  {request.estimatedCost && (
                    <div className="flex items-center space-x-2">
                      <DollarSign className="h-4 w-4 text-secondary-400" />
                      <span className="text-secondary-600 dark:text-secondary-400">
                        Est. KES {request.estimatedCost.toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex flex-col items-end space-y-2">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(request.status)}`}>
                  {request.status.replace('_', ' ')}
                </span>
                <span className="text-xs text-secondary-500">
                  Reported: {new Date(request.reportedDate).toLocaleDateString()}
                </span>
                {request.scheduledDate && (
                  <span className="text-xs text-blue-600 dark:text-blue-400">
                    Scheduled: {new Date(request.scheduledDate).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
            
            {request.assignedTo && (
              <div className="flex items-center justify-between pt-3 border-t border-secondary-200 dark:border-secondary-600">
                <span className="text-sm text-secondary-600 dark:text-secondary-400">
                  Assigned to: <span className="font-medium">{request.assignedTo}</span>
                </span>
                {request.actualCost && (
                  <span className="text-sm font-medium text-green-600 dark:text-green-400">
                    Actual: KES {request.actualCost.toLocaleString()}
                  </span>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredRequests.length === 0 && (
        <div className="text-center py-12">
          <Wrench className="h-16 w-16 text-secondary-300 dark:text-secondary-600 mx-auto mb-4" />
          <p className="text-lg font-medium text-secondary-900 dark:text-secondary-100 mb-2">
            No maintenance requests found
          </p>
          <p className="text-secondary-600 dark:text-secondary-400">
            {searchTerm || filterStatus !== 'all' || filterPriority !== 'all'
              ? 'Try adjusting your search or filter criteria'
              : 'All maintenance requests will appear here'
            }
          </p>
        </div>
      )}
    </div>
  );
} 