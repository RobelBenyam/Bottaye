import { useUsers } from "../hooks/usersHook";
import { useAuthStore } from "../stores/authStore";
import EditUserModal from "../components/modals/EditUserModal";
import { useEffect, useState } from "react";
import { User } from "@/types";
export default function UsersPage() {
  const { users, loading, error } = useUsers();
  const [usersState, setUsersState] = useState<User[]>([]);
  const { user: currentUser } = useAuthStore();
  const [editUser, setEditUser] = useState<User | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    setUsersState(users);
  }, [users]);

  const handleEditClick = (user: User) => {
    setEditUser(user);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setEditUser(null);
  };

  const handleUserSave = (updatedUser: User) => {
    setUsersState((prev) =>
      prev.map((u) => (u.id === updatedUser.id ? updatedUser : u))
    );
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-secondary-900">Users</h1>
      <div className="card">
        {loading ? (
          <p className="text-secondary-600">Loading users...</p>
        ) : error ? (
          <p className="text-red-600">Error loading users</p>
        ) : users.length === 0 ? (
          <p className="text-secondary-600">No users found.</p>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Name
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Role
                </th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {usersState.map((user) => {
                const isCurrentUser = currentUser && user.id === currentUser.id;
                return (
                  <tr key={user.id} className="bg-white">
                    <td className="px-4 py-2 text-secondary-900">
                      {user.name}{" "}
                      {isCurrentUser && (
                        <span className="ml-2 text-xs text-primary-600 font-semibold">
                          (You)
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2 text-secondary-700">
                      {user.role === "super_admin"
                        ? "Super Admin"
                        : "Property Manager"}
                    </td>
                    <td className="px-4 py-2">
                      <button
                        className="btn btn-sm btn-primary"
                        disabled={!!isCurrentUser}
                        style={
                          isCurrentUser
                            ? { opacity: 0.5, cursor: "not-allowed" }
                            : {}
                        }
                        onClick={() => handleEditClick(user)}
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
        {editUser && (
          <EditUserModal
            user={editUser}
            open={modalOpen}
            onClose={handleModalClose}
            onSave={handleUserSave}
          />
        )}
      </div>
    </div>
  );
}
