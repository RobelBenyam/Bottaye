import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Edit3, Camera, Plus, MapPin, Building2, DoorOpen } from 'lucide-react'
import { Property, Unit } from '../types'
import { propertyService, unitService } from '../services/database'
import { localPropertyService, localUnitService } from '../services/localStorage'
import { formatCurrency } from '../utils/currency'
import AddUnitModal from '../components/modals/AddUnitModal'

export default function PropertyDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [property, setProperty] = useState<Property | null>(null)
  const [units, setUnits] = useState<Unit[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddUnitModalOpen, setIsAddUnitModalOpen] = useState(false)

  useEffect(() => {
    const loadPropertyData = async () => {
      if (!id) return
      
      try {
        let propertyData, unitsData
        
        try {
          // Try Firebase first
          propertyData = await propertyService.getById(id)
          unitsData = await unitService.getByPropertyId(id)
        } catch (firebaseError) {
          // Fallback to localStorage
          propertyData = await localPropertyService.getById(id)
          unitsData = await localUnitService.getByPropertyId(id)
        }
        
        setProperty(propertyData)
        setUnits(unitsData)
      } catch (error) {
        console.error('Error loading property:', error)
      } finally {
        setLoading(false)
      }
    }

    loadPropertyData()
  }, [id])

  const handleUnitSubmit = async (data: any) => {
    try {
      // Try Firebase first, fallback to localStorage
      try {
        await unitService.create(data)
      } catch (firebaseError) {
        await localUnitService.create(data)
      }
      
      // Refresh units list
      const unitsData = id ? await unitService.getByPropertyId(id) : []
      setUnits(unitsData)
      setIsAddUnitModalOpen(false)
    } catch (error) {
      console.error('Error creating unit:', error)
      throw error
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-lg text-secondary-600 dark:text-secondary-400">Loading property...</div>
      </div>
    )
  }

  if (!property) {
    return (
      <div className="text-center py-12">
        <div className="text-lg text-secondary-900 dark:text-secondary-100 mb-2">Property not found</div>
        <button 
          onClick={() => navigate('/properties')}
          className="text-primary-600 hover:text-primary-700"
        >
          Back to Properties
        </button>
      </div>
    )
  }

  const occupiedUnits = units.filter(unit => unit.status === 'occupied').length
  const totalRevenue = units.reduce((sum, unit) => sum + (unit.rent || 0), 0)
  const occupancyRate = units.length > 0 ? (occupiedUnits / units.length) * 100 : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => navigate('/properties')}
            className="flex items-center text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Properties
          </button>
          <div>
            <h1 className="text-3xl font-bold text-secondary-900 dark:text-secondary-100">{property.name}</h1>
            <div className="flex items-center text-secondary-600 dark:text-secondary-400 mt-1">
              <MapPin className="h-4 w-4 mr-2" />
              <span>{property.address}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button className="btn-secondary flex items-center">
            <Edit3 className="h-4 w-4 mr-2" />
            Edit Property
          </button>
          <button 
            onClick={() => setIsAddUnitModalOpen(true)}
            className="btn-primary flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Unit
          </button>
        </div>
      </div>

      {/* Property Images Gallery */}
      <div className="bg-white dark:bg-secondary-800 rounded-xl shadow-sm border border-secondary-200 dark:border-secondary-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-secondary-900 dark:text-secondary-100">Property Images</h2>
          <button className="btn-secondary flex items-center text-sm">
            <Camera className="h-4 w-4 mr-2" />
            Add Photos
          </button>
        </div>
        
        {property.images && property.images.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {property.images.map((image, index) => (
              <div key={index} className="relative group">
                <img
                  src={image}
                  alt={`${property.name} - Photo ${index + 1}`}
                  className="w-full h-48 object-cover rounded-lg border border-secondary-200 dark:border-secondary-600"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all rounded-lg flex items-center justify-center">
                  <button className="opacity-0 group-hover:opacity-100 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-secondary-100 px-3 py-1 rounded-md text-sm font-medium transition-opacity">
                    View Full Size
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="border-2 border-dashed border-secondary-300 dark:border-secondary-600 rounded-lg p-8 text-center">
            <Camera className="h-12 w-12 text-secondary-400 mx-auto mb-4" />
            <p className="text-secondary-600 dark:text-secondary-400 mb-2">No images uploaded yet</p>
            <button className="btn-primary">Upload Property Photos</button>
          </div>
        )}
      </div>

      {/* Property Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-secondary-800 rounded-xl shadow-sm border border-secondary-200 dark:border-secondary-700 p-6">
          <div className="flex items-center">
            <Building2 className="h-8 w-8 text-primary-600 dark:text-primary-400 mr-3" />
            <div>
              <p className="text-sm text-secondary-600 dark:text-secondary-400">Total Units</p>
              <p className="text-2xl font-bold text-secondary-900 dark:text-secondary-100">{units.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-secondary-800 rounded-xl shadow-sm border border-secondary-200 dark:border-secondary-700 p-6">
          <div className="flex items-center">
            <DoorOpen className="h-8 w-8 text-success-600 mr-3" />
            <div>
              <p className="text-sm text-secondary-600 dark:text-secondary-400">Occupied</p>
              <p className="text-2xl font-bold text-secondary-900 dark:text-secondary-100">{occupiedUnits}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-secondary-800 rounded-xl shadow-sm border border-secondary-200 dark:border-secondary-700 p-6">
          <div>
            <p className="text-sm text-secondary-600 dark:text-secondary-400">Monthly Revenue</p>
            <p className="text-2xl font-bold text-secondary-900 dark:text-secondary-100">{formatCurrency(totalRevenue)}</p>
          </div>
        </div>
        
        <div className="bg-white dark:bg-secondary-800 rounded-xl shadow-sm border border-secondary-200 dark:border-secondary-700 p-6">
          <div>
            <p className="text-sm text-secondary-600 dark:text-secondary-400">Occupancy Rate</p>
            <p className="text-2xl font-bold text-secondary-900 dark:text-secondary-100">{occupancyRate.toFixed(1)}%</p>
          </div>
        </div>
      </div>

      {/* Units List */}
      <div className="bg-white dark:bg-secondary-800 rounded-xl shadow-sm border border-secondary-200 dark:border-secondary-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-secondary-900 dark:text-secondary-100">Units</h2>
          <button 
            onClick={() => setIsAddUnitModalOpen(true)}
            className="btn-secondary flex items-center text-sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Unit
          </button>
        </div>
        
        {units.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {units.map((unit) => (
              <div 
                key={unit.id} 
                className="border border-secondary-200 dark:border-secondary-600 rounded-lg p-4 hover:border-primary-300 dark:hover:border-primary-600 transition-colors cursor-pointer"
                onClick={() => navigate(`/units/${unit.id}`)}
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-secondary-900 dark:text-secondary-100">Unit {unit.unitNumber}</h3>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    unit.status === 'occupied' ? 'bg-success-100 text-success-800 dark:bg-success-900/20 dark:text-success-400' :
                    unit.status === 'vacant' ? 'bg-warning-100 text-warning-800 dark:bg-warning-900/20 dark:text-warning-400' :
                    'bg-error-100 text-error-800 dark:bg-error-900/20 dark:text-error-400'
                  }`}>
                    {unit.status}
                  </span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-secondary-600 dark:text-secondary-400">Type:</span>
                    <span className="text-secondary-900 dark:text-secondary-100">{unit.type.replace('_', ' ')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-secondary-600 dark:text-secondary-400">Rent:</span>
                    <span className="font-medium text-secondary-900 dark:text-secondary-100">{formatCurrency(unit.rent)}/month</span>
                  </div>
                  {unit.images && unit.images.length > 0 && (
                    <div className="flex justify-between">
                      <span className="text-secondary-600 dark:text-secondary-400">Photos:</span>
                      <span className="text-primary-600 dark:text-primary-400">{unit.images.length} image(s)</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <DoorOpen className="h-16 w-16 text-secondary-300 dark:text-secondary-600 mx-auto mb-4" />
            <p className="text-lg font-medium text-secondary-900 dark:text-secondary-100 mb-2">No units yet</p>
            <p className="text-secondary-600 dark:text-secondary-400 mb-4">Start by adding your first unit to this property</p>
            <button 
              onClick={() => setIsAddUnitModalOpen(true)}
              className="btn-primary"
            >
              Add First Unit
            </button>
          </div>
        )}
      </div>

      {/* Add Unit Modal */}
      <AddUnitModal
        isOpen={isAddUnitModalOpen}
        onClose={() => setIsAddUnitModalOpen(false)}
        onSubmit={handleUnitSubmit}
        properties={property ? [{ id: property.id, name: property.name }] : []}
      />
    </div>
  )
} 