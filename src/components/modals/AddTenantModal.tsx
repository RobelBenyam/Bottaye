import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X, User, Phone, Mail, CreditCard, Calendar, Home } from 'lucide-react'
import LoadingSpinner from '../LoadingSpinner'

const tenantSchema = z.object({
  name: z.string().min(1, 'Full name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().min(10, 'Valid phone number is required'),
  idNumber: z.string().min(1, 'ID number is required'),
  unitId: z.string().min(1, 'Unit selection is required'),
  leaseStartDate: z.string().min(1, 'Lease start date is required'),
  leaseEndDate: z.string().min(1, 'Lease end date is required'),
  emergencyContactName: z.string().min(1, 'Emergency contact name is required'),
  emergencyContactPhone: z.string().min(10, 'Emergency contact phone is required'),
  emergencyContactRelationship: z.string().min(1, 'Relationship is required'),
})

type TenantForm = z.infer<typeof tenantSchema>

interface AddTenantModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: TenantForm) => Promise<void>
  availableUnits: Array<{ id: string; unitNumber: string; propertyName: string; rent: number }>
}

export default function AddTenantModal({ isOpen, onClose, onSubmit, availableUnits }: AddTenantModalProps) {
  const [loading, setLoading] = useState(false)
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<TenantForm>({
    resolver: zodResolver(tenantSchema)
  })

  const handleFormSubmit = async (data: TenantForm) => {
    setLoading(true)
    try {
      await onSubmit(data)
      reset()
      onClose()
    } catch (error) {
      console.error('Error adding tenant:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-secondary-900 bg-opacity-50" onClick={handleClose} />
        
        <div className="inline-block w-full max-w-3xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white dark:bg-secondary-800 shadow-xl rounded-xl">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary-100 dark:bg-primary-900 rounded-lg">
                <User className="h-6 w-6 text-primary-600 dark:text-primary-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100">Add New Tenant</h3>
                <p className="text-sm text-secondary-600 dark:text-secondary-400">Register a new tenant and assign to unit</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-2 text-secondary-400 hover:text-secondary-600 dark:hover:text-secondary-300 rounded-lg hover:bg-secondary-100 dark:hover:bg-secondary-700"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8">
            {/* Personal Information */}
            <div>
              <h4 className="text-md font-medium text-secondary-900 dark:text-secondary-100 mb-4 flex items-center">
                <User className="h-4 w-4 mr-2" />
                Personal Information
              </h4>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                    Full Name
                  </label>
                  <input
                    {...register('name')}
                    type="text"
                    className="input-field"
                    placeholder="John Doe"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-error-600">{errors.name.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                    ID Number
                  </label>
                  <input
                    {...register('idNumber')}
                    type="text"
                    className="input-field"
                    placeholder="12345678"
                  />
                  {errors.idNumber && (
                    <p className="mt-1 text-sm text-error-600">{errors.idNumber.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                    Email Address
                  </label>
                  <input
                    {...register('email')}
                    type="email"
                    className="input-field"
                    placeholder="john@example.com"
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-error-600">{errors.email.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                    Phone Number
                  </label>
                  <input
                    {...register('phone')}
                    type="tel"
                    className="input-field"
                    placeholder="+254712345678"
                  />
                  {errors.phone && (
                    <p className="mt-1 text-sm text-error-600">{errors.phone.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Unit Assignment & Lease */}
            <div>
              <h4 className="text-md font-medium text-secondary-900 dark:text-secondary-100 mb-4 flex items-center">
                <Home className="h-4 w-4 mr-2" />
                Unit Assignment & Lease
              </h4>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                    Available Unit
                  </label>
                  <select {...register('unitId')} className="input-field">
                    <option value="">Select unit</option>
                    {availableUnits.map(u => (
                      <option key={u.id} value={u.id}>{u.propertyName} - Unit {u.unitNumber} ({u.rent.toLocaleString()})</option>
                    ))}
                  </select>
                  {errors.unitId && (
                    <p className="mt-1 text-sm text-error-600">{errors.unitId.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                    Lease Start Date
                  </label>
                  <input
                    {...register('leaseStartDate')}
                    type="date"
                    className="input-field"
                  />
                  {errors.leaseStartDate && (
                    <p className="mt-1 text-sm text-error-600">{errors.leaseStartDate.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                    Lease End Date
                  </label>
                  <input
                    {...register('leaseEndDate')}
                    type="date"
                    className="input-field"
                  />
                  {errors.leaseEndDate && (
                    <p className="mt-1 text-sm text-error-600">{errors.leaseEndDate.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Emergency Contact */}
            <div>
              <h4 className="text-md font-medium text-secondary-900 dark:text-secondary-100 mb-4 flex items-center">
                <Phone className="h-4 w-4 mr-2" />
                Emergency Contact
              </h4>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                    Contact Name
                  </label>
                  <input
                    {...register('emergencyContactName')}
                    type="text"
                    className="input-field"
                    placeholder="Mary Doe"
                  />
                  {errors.emergencyContactName && (
                    <p className="mt-1 text-sm text-error-600">{errors.emergencyContactName.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                    Contact Phone
                  </label>
                  <input
                    {...register('emergencyContactPhone')}
                    type="tel"
                    className="input-field"
                    placeholder="+254787654321"
                  />
                  {errors.emergencyContactPhone && (
                    <p className="mt-1 text-sm text-error-600">{errors.emergencyContactPhone.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                    Relationship
                  </label>
                  <select {...register('emergencyContactRelationship')} className="input-field">
                    <option value="">Select relationship</option>
                    <option value="spouse">Spouse</option>
                    <option value="parent">Parent</option>
                    <option value="sibling">Sibling</option>
                    <option value="child">Child</option>
                    <option value="friend">Friend</option>
                    <option value="other">Other</option>
                  </select>
                  {errors.emergencyContactRelationship && (
                    <p className="mt-1 text-sm text-error-600">{errors.emergencyContactRelationship.message}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-6 border-t border-secondary-200 dark:border-secondary-600">
              <button
                type="button"
                onClick={handleClose}
                className="btn-secondary"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Adding...
                  </>
                ) : (
                  'Add Tenant'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
} 