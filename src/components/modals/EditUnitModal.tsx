import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  X,
  DoorOpen,
  Hash,
  DollarSign,
  Upload,
  Image,
  FileText,
  Trash2,
} from "lucide-react";
import { Unit } from "../../types";
import LoadingSpinner from "../LoadingSpinner";
import { uploadFileToCloudinary } from "@/lib/file";

const unitSchema = z.object({
  propertyId: z.string().min(1, "Property is required"),
  unitNumber: z.string().min(1, "Unit number is required"),
  type: z.enum([
    "studio",
    "1_bedroom",
    "2_bedroom",
    "3_bedroom",
    "4_bedroom",
    "office",
    "shop",
  ]),
  rent: z.number().min(1, "Rent amount is required"),
  deposit: z.number().min(1, "Deposit amount is required"),
  images: z.array(z.string()).optional(),
  floorPlan: z.string().optional(),
});

type UnitFormData = z.infer<typeof unitSchema>;

interface EditUnitModalProps {
  isOpen: boolean;
  onClose: () => void;
  unit: Unit;
  properties: Array<{ id: string; name: string }>;
  onUpdate: (data: UnitFormData) => Promise<void>;
}

export default function EditUnitModal({
  isOpen,
  onClose,
  unit,
  properties,
  onUpdate,
}: EditUnitModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImages, setSelectedImages] = useState<string[]>(
    unit.images || []
  );
  const [floorPlan, setFloorPlan] = useState<string>(unit.floorPlan || "");
  const [isDragging, setIsDragging] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<UnitFormData>({
    resolver: zodResolver(unitSchema),
    defaultValues: {
      propertyId: unit.propertyId,
      unitNumber: unit.unitNumber,
      type: unit.type,
      rent: unit.rent,
      deposit: unit.deposit,
    },
  });

  const rentValue = watch("rent");

  useEffect(() => {
    if (isOpen) {
      setSelectedImages(unit.images || []);
      setFloorPlan(unit.floorPlan || "");
      reset({
        propertyId: unit.propertyId,
        unitNumber: unit.unitNumber,
        type: unit.type,
        rent: unit.rent,
        deposit: unit.deposit,
      });
    }
  }, [isOpen, unit, reset]);

  const handleImageUpload = (files: FileList | null) => {
    if (!files) return;

    Array.from(files).forEach((file) => {
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          setSelectedImages((prev) => [...prev, result]);
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const handleFloorPlanUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0];
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setFloorPlan(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const removeFloorPlan = () => {
    setFloorPlan("");
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleImageUpload(e.dataTransfer.files);
  };

  const onSubmit = async (data: UnitFormData) => {
    setIsLoading(true);
    try {
      const uploadedImageUrls = await Promise.all(
        selectedImages.map(async (imageDataUrl, _index) => {
          // Convert data URL to Blob
          const res = await fetch(imageDataUrl);
          const blob = await res.blob();
          // Upload to Cloudinary
          const imageUrl = await uploadFileToCloudinary(blob, "unit");
          return imageUrl;
        })
      );
      let floorPlanUrl = "";
      if (floorPlan) {
        // Convert data URL to Blob
        const res = await fetch(floorPlan);
        const blob = await res.blob();
        // Upload to Cloudinary
        floorPlanUrl = await uploadFileToCloudinary(blob, "units");
      }

      await onUpdate({
        ...data,
        images: uploadedImageUrls,
        floorPlan: floorPlanUrl,
      });

      reset();
      setSelectedImages([]);
      setFloorPlan("");
      onClose();

      const toast = (await import("react-hot-toast")).default;
      toast.success("Unit updated successfully!");

      window.location.reload();
    } catch (error) {
      console.error("Error updating unit:", error);
      const toast = (await import("react-hot-toast")).default;
      toast.error("Failed to update unit. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    reset();
    setSelectedImages(unit.images || []);
    setFloorPlan(unit.floorPlan || "");
    onClose();
  };

  const calculateDeposit = (rent: number) => {
    if (rent > 0) {
      setValue("deposit", rent * 2);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-secondary-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-secondary-200 dark:border-secondary-600">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center">
              <DoorOpen className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-secondary-900 dark:text-secondary-100">
                Edit Unit
              </h2>
              <p className="text-sm text-secondary-600 dark:text-secondary-400">
                Update unit information and photos
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-secondary-100 dark:hover:bg-secondary-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-secondary-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Property Selection */}
          <div>
            <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
              Property
            </label>
            <select {...register("propertyId")} className="input-field">
              <option value="">Select a property</option>
              {properties.map((property) => (
                <option key={property.id} value={property.id}>
                  {property.name}
                </option>
              ))}
            </select>
            {errors.propertyId && (
              <p className="mt-1 text-sm text-red-600">
                {errors.propertyId.message}
              </p>
            )}
          </div>

          {/* Unit Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Unit Number */}
            <div>
              <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                <Hash className="w-4 h-4 inline mr-1" />
                Unit Number
              </label>
              <input
                type="text"
                {...register("unitNumber")}
                className="input-field"
                placeholder="e.g., 101, A1, etc."
              />
              {errors.unitNumber && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.unitNumber.message}
                </p>
              )}
            </div>

            {/* Unit Type */}
            <div>
              <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                <DoorOpen className="w-4 h-4 inline mr-1" />
                Unit Type
              </label>
              <select {...register("type")} className="input-field">
                <option value="">Select unit type</option>
                <option value="studio">Studio</option>
                <option value="1_bedroom">1 Bedroom</option>
                <option value="2_bedroom">2 Bedroom</option>
                <option value="3_bedroom">3 Bedroom</option>
                <option value="4_bedroom">4+ Bedroom</option>
                <option value="office">Office</option>
                <option value="shop">Shop/Retail</option>
              </select>
              {errors.type && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.type.message}
                </p>
              )}
            </div>

            {/* Monthly Rent */}
            <div>
              <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                <DollarSign className="w-4 h-4 inline mr-1" />
                Monthly Rent (KES)
              </label>
              <input
                type="number"
                {...register("rent", {
                  valueAsNumber: true,
                  onChange: (e) => calculateDeposit(Number(e.target.value)),
                })}
                className="input-field"
                placeholder="e.g., 25000"
                min="0"
                step="1"
              />
              {errors.rent && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.rent.message}
                </p>
              )}
            </div>

            {/* Security Deposit */}
            <div>
              <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                <DollarSign className="w-4 h-4 inline mr-1" />
                Security Deposit (KES)
              </label>
              <input
                type="number"
                {...register("deposit", { valueAsNumber: true })}
                className="input-field"
                placeholder="e.g., 50000"
                min="0"
                step="1"
              />
              {errors.deposit && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.deposit.message}
                </p>
              )}
              {rentValue > 0 && (
                <p className="mt-1 text-xs text-secondary-600 dark:text-secondary-400">
                  Suggested: KES {(rentValue * 2).toLocaleString()} (2 months
                  rent)
                </p>
              )}
            </div>
          </div>

          {/* Unit Photos Management */}
          <div>
            <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-3">
              <Image className="w-4 h-4 inline mr-1" />
              Unit Photos
            </label>

            {/* Current Images */}
            {selectedImages.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                {selectedImages.map((image, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={image}
                      alt={`Unit photo ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg border border-secondary-200 dark:border-secondary-600"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 p-1 bg-red-500 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Upload Area */}
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                isDragging
                  ? "border-primary-400 bg-primary-50 dark:bg-primary-900/20"
                  : "border-secondary-300 dark:border-secondary-600 hover:border-primary-400"
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => handleImageUpload(e.target.files)}
                className="hidden"
                id="unit-photos-edit"
              />
              <label htmlFor="unit-photos-edit" className="cursor-pointer">
                <Upload className="w-8 h-8 text-secondary-400 mx-auto mb-2" />
                <p className="text-sm text-secondary-600 dark:text-secondary-400">
                  <span className="text-primary-600 font-medium">
                    Click to upload
                  </span>{" "}
                  or drag photos
                </p>
                <p className="text-xs text-secondary-500 mt-1">
                  Room photos, interior views
                </p>
              </label>
            </div>
          </div>

          {/* Floor Plan */}
          <div>
            <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-3">
              <FileText className="w-4 h-4 inline mr-1" />
              Floor Plan
            </label>

            {/* Current Floor Plan */}
            {floorPlan && (
              <div className="relative group mb-4">
                <img
                  src={floorPlan}
                  alt="Unit floor plan"
                  className="w-full max-w-md h-48 object-contain rounded-lg border border-secondary-200 dark:border-secondary-600 bg-white"
                />
                <button
                  type="button"
                  onClick={removeFloorPlan}
                  className="absolute top-2 right-2 p-1 bg-red-500 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            )}

            {/* Upload Area */}
            <div className="border-2 border-dashed border-secondary-300 dark:border-secondary-600 rounded-lg p-4 text-center hover:border-primary-400 transition-colors">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFloorPlanUpload(e.target.files)}
                className="hidden"
                id="floor-plan-edit"
              />
              <label htmlFor="floor-plan-edit" className="cursor-pointer">
                <FileText className="w-6 h-6 text-secondary-400 mx-auto mb-2" />
                <p className="text-sm text-secondary-600 dark:text-secondary-400">
                  <span className="text-primary-600 font-medium">
                    Upload floor plan
                  </span>
                </p>
                <p className="text-xs text-secondary-500 mt-1">
                  Unit layout, measurements
                </p>
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-6 border-t border-secondary-200 dark:border-secondary-600">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 btn-secondary"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 btn-primary"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <LoadingSpinner size="sm" />
                  <span className="ml-2">Updating...</span>
                </div>
              ) : (
                "Update Unit"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
