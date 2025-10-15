import React, { useState } from "react";
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
} from "lucide-react";
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

type UnitForm = z.infer<typeof unitSchema>;

interface AddUnitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: UnitForm) => Promise<void>;
  properties: Array<{ id: string; name: string }>;
}

export default function AddUnitModal({
  isOpen,
  onClose,
  onSubmit,
  properties,
}: AddUnitModalProps) {
  const [loading, setLoading] = useState(false);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [floorPlan, setFloorPlan] = useState<string>("");
  const [isDragging, setIsDragging] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<UnitForm>({
    resolver: zodResolver(unitSchema),
  });

  const rentValue = watch("rent");

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

  const handleFormSubmit = async (data: UnitForm) => {
    setLoading(true);
    try {
      const { unitService, propertyService } = await import(
        "../../services/database"
      );

      // Get property details
      const property = await propertyService.getById(data.propertyId);
      if (!property) {
        throw new Error("Property not found");
      }
      const uploadedImageUrls = await Promise.all(
        selectedImages.map(async (imageDataUrl, index) => {
          // Convert data URL to Blob
          const res = await fetch(imageDataUrl);
          const blob = await res.blob();
          // Upload to Cloudinary
          const imageUrl = await uploadFileToCloudinary(blob, "properties");
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

      // Create unit
      await unitService.create({
        ...data,
        propertyName: property.name,
        status: "vacant",
        images: uploadedImageUrls,
        floorPlan: floorPlanUrl,
      });

      reset();
      setSelectedImages([]);
      setFloorPlan("");
      onClose();

      // Show success message
      const toast = (await import("react-hot-toast")).default;
      toast.success("Unit created successfully!");

      // Refresh the page to show new unit
      window.location.reload();
    } catch (error) {
      console.error("Error adding unit:", error);
      const toast = (await import("react-hot-toast")).default;
      toast.error("Failed to create unit. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const calculateDeposit = (rent: number) => {
    if (rent > 0) {
      setValue("deposit", rent * 2); // Standard 2 months deposit
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div
          className="fixed inset-0 transition-opacity bg-secondary-900 bg-opacity-50"
          onClick={handleClose}
        />

        <div className="inline-block w-full max-w-2xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white dark:bg-secondary-800 shadow-xl rounded-xl">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary-100 dark:bg-primary-900/20 rounded-lg">
                <DoorOpen className="h-6 w-6 text-primary-600 dark:text-primary-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100">
                  Add New Unit
                </h3>
                <p className="text-sm text-secondary-600 dark:text-secondary-400">
                  Create a new unit in your property
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-2 text-secondary-400 hover:text-secondary-600 dark:text-secondary-500 dark:hover:text-secondary-300 rounded-lg hover:bg-secondary-100 dark:hover:bg-secondary-700"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                  Property
                </label>
                <select {...register("propertyId")} className="input-field">
                  <option value="">Select property</option>
                  {properties.map((property) => (
                    <option key={property.id} value={property.id}>
                      {property.name}
                    </option>
                  ))}
                </select>
                {errors.propertyId && (
                  <p className="mt-1 text-sm text-error-600">
                    {errors.propertyId.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  <Hash className="inline h-4 w-4 mr-1" />
                  Unit Number
                </label>
                <input
                  {...register("unitNumber")}
                  type="text"
                  className="input-field"
                  placeholder="e.g., 2A, Shop 5"
                />
                {errors.unitNumber && (
                  <p className="mt-1 text-sm text-error-600">
                    {errors.unitNumber.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Unit Type
                </label>
                <select {...register("type")} className="input-field">
                  <option value="">Select type</option>
                  <option value="studio">Studio</option>
                  <option value="1_bedroom">1 Bedroom</option>
                  <option value="2_bedroom">2 Bedroom</option>
                  <option value="3_bedroom">3 Bedroom</option>
                  <option value="4_bedroom">4 Bedroom</option>
                  <option value="office">Office</option>
                  <option value="shop">Shop</option>
                </select>
                {errors.type && (
                  <p className="mt-1 text-sm text-error-600">
                    {errors.type.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  <DollarSign className="inline h-4 w-4 mr-1" />
                  Monthly Rent (KES)
                </label>
                <input
                  {...register("rent", {
                    valueAsNumber: true,
                    onChange: (e) => calculateDeposit(Number(e.target.value)),
                  })}
                  type="number"
                  className="input-field"
                  placeholder="45000"
                  min="0"
                />
                {errors.rent && (
                  <p className="mt-1 text-sm text-error-600">
                    {errors.rent.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Security Deposit (KES)
                </label>
                <input
                  {...register("deposit", { valueAsNumber: true })}
                  type="number"
                  className="input-field"
                  placeholder="90000"
                  min="0"
                />
                {errors.deposit && (
                  <p className="mt-1 text-sm text-error-600">
                    {errors.deposit.message}
                  </p>
                )}
                <p className="mt-1 text-xs text-secondary-500">
                  Typically 2x monthly rent (auto-calculated)
                </p>
              </div>
            </div>

            {/* Unit Photos Upload */}
            <div>
              <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                Unit Photos
              </label>
              <div
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                  isDragging
                    ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20"
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
                  id="unit-photos"
                />
                <label htmlFor="unit-photos" className="cursor-pointer">
                  <Image className="h-8 w-8 text-secondary-400 mx-auto mb-2" />
                  <p className="text-sm text-secondary-600 dark:text-secondary-400">
                    <span className="text-primary-600 font-medium">
                      Click to upload
                    </span>{" "}
                    or drag photos
                  </p>
                  <p className="text-xs text-secondary-500 dark:text-secondary-500 mt-1">
                    Room photos, interior views
                  </p>
                </label>
              </div>

              {/* Photos Preview */}
              {selectedImages.length > 0 && (
                <div className="mt-4 grid grid-cols-3 gap-3">
                  {selectedImages.map((image, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={image}
                        alt={`Unit photo ${index + 1}`}
                        className="w-full h-20 object-cover rounded-lg border border-secondary-200 dark:border-secondary-600"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Floor Plan Upload */}
            <div>
              <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                Floor Plan / Blueprint
              </label>
              <div className="border-2 border-dashed border-secondary-300 dark:border-secondary-600 rounded-lg p-6 text-center hover:border-primary-400 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFloorPlanUpload(e.target.files)}
                  className="hidden"
                  id="floor-plan"
                />
                <label htmlFor="floor-plan" className="cursor-pointer">
                  <FileText className="h-8 w-8 text-secondary-400 mx-auto mb-2" />
                  <p className="text-sm text-secondary-600 dark:text-secondary-400">
                    <span className="text-primary-600 font-medium">
                      Upload floor plan
                    </span>
                  </p>
                  <p className="text-xs text-secondary-500 dark:text-secondary-500 mt-1">
                    Layout, blueprint, or floor plan
                  </p>
                </label>
              </div>

              {/* Floor Plan Preview */}
              {floorPlan && (
                <div className="mt-4">
                  <div className="relative group">
                    <img
                      src={floorPlan}
                      alt="Floor plan"
                      className="w-full h-32 object-cover rounded-lg border border-secondary-200 dark:border-secondary-600"
                    />
                    <button
                      type="button"
                      onClick={removeFloorPlan}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
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
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Adding...
                  </>
                ) : (
                  "Add Unit"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
