import React, { useState, useEffect } from "react";
import { User, Property } from "@/types";
import { propertyService, userService } from "@/services/database";

interface EditUserModalProps {
  user: User;
  open: boolean;
  onClose: () => void;
  onSave: (updatedUser: User) => void;
}

export default function EditUserModal({
  user,
  open,
  onClose,
  onSave,
}: EditUserModalProps) {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [role, setRole] = useState(user.role);
  const [assignedProperties, setAssignedProperties] = useState<string[]>(
    user.propertyIds || []
  );
  const [properties, setProperties] = useState<Property[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setName(user.name);
    setEmail(user.email);
    setRole(user.role);
    setAssignedProperties(user.propertyIds || []);
  }, [user]);

  useEffect(() => {
    propertyService.getAll().then(setProperties);
  }, []);

  const handlePropertyChange = (
    propertyId: string,
    checked: boolean,
    disabled: boolean
  ) => {
    if (disabled) return;
    setAssignedProperties((prev) =>
      checked ? [...prev, propertyId] : prev.filter((id) => id !== propertyId)
    );
  };

  const handleSave = async () => {
    setSaving(true);
    const updatedUser: User = {
      ...user,
      name,
      email,
      role,
      propertyIds: assignedProperties,
    };
    await userService.update(user.id, updatedUser);
    setSaving(false);
    onSave(updatedUser);
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white p-6 rounded shadow-lg max-w-lg w-full relative">
        <h2 className="text-xl font-bold mb-4">Edit User</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Name</label>
            <input
              type="text"
              className="input w-full"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Email</label>
            <input
              type="email"
              className="input w-full"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Role</label>
            <select
              className="input w-full"
              value={role}
              onChange={(e) => setRole(e.target.value as User["role"])}
            >
              <option value="property_manager">Property Manager</option>
              <option value="super_admin">Super Admin</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              Assigned Properties
            </label>
            <div className="space-y-1">
              {properties.map((property) => {
                const isCreatedByUser = property.managerId === user.id;
                const checked =
                  assignedProperties.includes(property.id) || isCreatedByUser;
                return (
                  <div key={property.id} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={checked}
                      disabled={isCreatedByUser}
                      onChange={(e) =>
                        handlePropertyChange(
                          property.id,
                          e.target.checked,
                          isCreatedByUser
                        )
                      }
                      className="mr-2"
                    />
                    <span className={isCreatedByUser ? "text-gray-400" : ""}>
                      {property.name}
                    </span>
                    {isCreatedByUser && (
                      <span className="ml-2 text-xs text-primary-600">
                        (Created by user)
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <div className="mt-6 flex justify-end space-x-2">
          <button
            className="btn btn-secondary"
            onClick={onClose}
            disabled={saving}
          >
            Cancel
          </button>
          <button
            className="btn btn-primary"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
