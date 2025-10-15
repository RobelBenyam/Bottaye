import { useState } from "react";
import { X, Edit2, Mail, User as UserIcon, Shield } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { User } from "../../types";
import { userService } from "../../services/database";
import toast from "react-hot-toast";

const userSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  role: z.enum(["super_admin", "admin"]),
});

type UserForm = z.infer<typeof userSchema>;

interface EditUserModalProps {
  isOpen: boolean;
  user: User;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditUserModal({
  user,
  onClose,
  onSuccess,
}: EditUserModalProps) {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UserForm>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });

  const onSubmit = async (data: UserForm) => {
    try {
      setLoading(true);

      await userService.update(user.id, {
        name: data.name,
        email: data.email,
        role: data.role,
      });

      toast.success("User updated successfully");
      onSuccess();
    } catch (error: any) {
      console.error("Error updating user:", error);
      toast.error("Failed to update user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center">
              <Edit2 className="w-5 h-5 text-primary-600" />
            </div>
            <h2 className="text-xl font-semibold text-secondary-900">
              Edit User
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-secondary-400 hover:text-secondary-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">
              <UserIcon className="w-4 h-4 inline mr-1" />
              Full Name
            </label>
            <input
              {...register("name")}
              type="text"
              className="input-field"
              placeholder="Enter full name"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-error-600">
                {errors.name.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">
              <Mail className="w-4 h-4 inline mr-1" />
              Email Address
            </label>
            <input
              {...register("email")}
              type="email"
              className="input-field"
              placeholder="user@example.com"
              disabled
            />
            <p className="mt-1 text-xs text-secondary-500">
              Email cannot be changed after creation
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">
              <Shield className="w-4 h-4 inline mr-1" />
              Role
            </label>
            <select {...register("role")} className="input-field">
              <option value="admin">Admin</option>
              <option value="super_admin">Super Admin</option>
            </select>
            {errors.role && (
              <p className="mt-1 text-sm text-error-600">
                {errors.role.message}
              </p>
            )}
            <p className="mt-1 text-xs text-secondary-500">
              Admins can only manage assigned properties. Super Admins have full
              access.
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary flex-1"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary flex-1"
              disabled={loading}
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
