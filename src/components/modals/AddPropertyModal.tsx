import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X, Building2, Upload, Camera, Image } from "lucide-react";
import { uploadFileToCloudinary } from "@/lib/file";
import { useAuthStore } from "@/stores/authStore";

const propertySchema = z.object({
  name: z.string().min(1, "Property name is required"),
  address: z.string().min(1, "Address is required"),
  type: z.enum(["residential", "commercial", "mixed"], {
    required_error: "Property type is required",
  }),
  description: z.string().optional(),
  images: z.array(z.string()).optional(),
});

type PropertyFormData = z.infer<typeof propertySchema>;

interface AddPropertyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddPropertyModal({
  isOpen,
  onClose,
}: AddPropertyModalProps) {
  const [isLoading, setIsLoading] = React.useState(false);
  const [selectedImages, setSelectedImages] = React.useState<string[]>([]);
  const [isDragging, setIsDragging] = React.useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<PropertyFormData>({
    resolver: zodResolver(propertySchema),
  });

  const { user } = useAuthStore();

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

  const removeImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
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

  const onSubmit = async (data: PropertyFormData) => {
    setIsLoading(true);
    try {
      const { propertyService } = await import("../../services/database");
      // Upload images to Cloudinary and get URLs
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

      // Create property with image URLs
      const currUser = user || { id: "demo-admin", name: "Demo Admin" }; // Fallback to demo user if not logged in

      await propertyService.create({
        ...data,
        images: uploadedImageUrls,
        totalUnits: 0, // Will be updated as units are added
        managerId: currUser.id, // TODO: Get from auth context
        managerName: currUser.name, // TODO: Get from auth context
      });

      reset();
      onClose();

      // Show success message
      const toast = (await import("react-hot-toast")).default;
      toast.success("Property created successfully!");

      // Refresh the page to show new property
      window.location.reload();
    } catch (error) {
      console.error("Error creating property:", error);
      const toast = (await import("react-hot-toast")).default;
      toast.error("Failed to create property. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div
          className="fixed inset-0 transition-opacity bg-secondary-500 bg-opacity-75"
          onClick={handleClose}
        />

        <div className="inline-block w-full max-w-2xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white dark:bg-secondary-800 shadow-xl rounded-2xl">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary-100 dark:bg-primary-900/20 rounded-lg">
                <Building2 className="h-6 w-6 text-primary-600 dark:text-primary-400" />
              </div>
              <h3 className="text-xl font-semibold text-secondary-900 dark:text-secondary-100">
                Add New Property
              </h3>
            </div>
            <button
              onClick={handleClose}
              className="text-secondary-400 hover:text-secondary-600 dark:hover:text-secondary-200"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                  Property Name *
                </label>
                <input
                  {...register("name")}
                  type="text"
                  placeholder="e.g., Kilimani Heights"
                  className="input-field"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                  Property Type *
                </label>
                <select {...register("type")} className="input-field">
                  <option value="">Select type</option>
                  <option value="residential">Residential</option>
                  <option value="commercial">Commercial</option>
                  <option value="mixed">Mixed Use</option>
                </select>
                {errors.type && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.type.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                Address *
              </label>
              <input
                {...register("address")}
                type="text"
                placeholder="e.g., Kilimani Road, Nairobi"
                className="input-field"
              />
              {errors.address && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.address.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                Description
              </label>
              <textarea
                {...register("description")}
                rows={3}
                placeholder="Optional description of the property..."
                className="input-field resize-none"
              />
            </div>

            {/* Image Upload Section */}
            <div>
              <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                Property Images
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
                  id="property-images"
                />
                <label htmlFor="property-images" className="cursor-pointer">
                  <Upload className="h-8 w-8 text-secondary-400 mx-auto mb-2" />
                  <p className="text-sm text-secondary-600 dark:text-secondary-400">
                    <span className="text-primary-600 font-medium">
                      Click to upload
                    </span>{" "}
                    or drag and drop
                  </p>
                  <p className="text-xs text-secondary-500 dark:text-secondary-500 mt-1">
                    PNG, JPG, GIF up to 10MB each
                  </p>
                </label>
              </div>

              {/* Image Preview */}
              {selectedImages.length > 0 && (
                <div className="mt-4 grid grid-cols-2 gap-4">
                  {selectedImages.map((image, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={image}
                        alt={`Property ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg border border-secondary-200 dark:border-secondary-600"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3 pt-6 border-t border-secondary-200 dark:border-secondary-600">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-sm font-medium text-secondary-700 dark:text-secondary-300 bg-white dark:bg-secondary-700 border border-secondary-300 dark:border-secondary-600 rounded-md hover:bg-secondary-50 dark:hover:bg-secondary-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary"
              >
                {isLoading ? "Creating..." : "Create Property"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
