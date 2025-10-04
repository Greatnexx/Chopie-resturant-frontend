import { useState } from "react";
import { useGetAllUsersQuery, useToggleUserStatusMutation, useAwardStarMutation, useCreateUserMutation } from "../slices/restaurantSlice";
import { toast } from "sonner";
import { Users, Plus, Star, ToggleLeft, ToggleRight } from "lucide-react";
import RestaurantSidebar from "../components/RestaurantSidebar";
import { useNavigate } from "react-router-dom";

const UserManagement = () => {
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [newUser, setNewUser] = useState({ name: "", email: "", role: "SubUser" });
  const navigate = useNavigate();

  const { data: usersData, refetch } = useGetAllUsersQuery();
  const [toggleUserStatus] = useToggleUserStatusMutation();
  const [awardStar] = useAwardStarMutation();
  const [createUser, { isLoading: creating }] = useCreateUserMutation();

  const users = usersData?.data || [];

  const handleToggleStatus = async (userId, currentStatus) => {
    try {
      await toggleUserStatus({ userId, isActive: !currentStatus }).unwrap();
      toast.success("User status updated!");
      refetch();
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const handleAwardStar = async (userId) => {
    try {
      await awardStar(userId).unwrap();
      toast.success("Star awarded!");
      refetch();
    } catch (error) {
      toast.error("Failed to award star");
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      await createUser(newUser).unwrap();
      toast.success("User created successfully!");
      setNewUser({ name: "", email: "", role: "SubUser" });
      setShowCreateUser(false);
      refetch();
    } catch (error) {
      toast.error(error?.data?.message || "Failed to create user");
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("restaurantUser");
    navigate("/restaurant/login");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <RestaurantSidebar user={JSON.parse(sessionStorage.getItem("restaurantUser") || "{}")} onLogout={handleLogout} />
      
      <div className="flex-1 ml-64 p-6 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
            <p className="text-gray-600">Manage restaurant staff and permissions</p>
          </div>

          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Staff Members</h2>
                <button
                  onClick={() => setShowCreateUser(true)}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add User
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3">Name</th>
                      <th className="text-left py-3">Email</th>
                      <th className="text-left py-3">Role</th>
                      <th className="text-left py-3">Stars</th>
                      <th className="text-left py-3">Status</th>
                      <th className="text-left py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user._id} className="border-b">
                        <td className="py-3">{user.name}</td>
                        <td className="py-3">{user.email}</td>
                        <td className="py-3">
                          <span className={`px-2 py-1 rounded text-xs ${
                            user.role === 'SuperAdmin' ? 'bg-purple-100 text-purple-800' :
                            user.role === 'TransactionAdmin' ? 'bg-blue-100 text-blue-800' :
                            user.role === 'MenuManager' ? 'bg-green-100 text-green-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="py-3">
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-500" />
                            <span>{user.stars || 0}</span>
                          </div>
                        </td>
                        <td className="py-3">
                          <span className={`px-2 py-1 rounded text-xs ${
                            user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {user.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="py-3">
                          <div className="flex gap-2">
                            {user._id !== JSON.parse(sessionStorage.getItem("restaurantUser") || "{}")._id && (
                              <button
                                onClick={() => handleToggleStatus(user._id, user.isActive)}
                                className="text-blue-600 hover:text-blue-800"
                              >
                                {user.isActive ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                              </button>
                            )}
                            {user.role !== 'SuperAdmin' && (
                              <button
                                onClick={() => handleAwardStar(user._id)}
                                className="text-yellow-600 hover:text-yellow-800"
                              >
                                <Star className="w-5 h-5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Create User Modal */}
          {showCreateUser && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <h3 className="text-lg font-semibold mb-4">Create New User</h3>
                <form onSubmit={handleCreateUser} className="space-y-4">
                  <input
                    type="text"
                    placeholder="Name"
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  />
                  <p className="text-sm text-gray-600 p-3 bg-gray-50 rounded-lg">
                    A password will be generated and sent to the user's email
                  </p>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="SubUser">Sub User</option>
                    <option value="TransactionAdmin">Transaction Admin</option>
                    <option value="MenuManager">Menu Manager</option>
                  </select>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setShowCreateUser(false)}
                      className="flex-1 px-4 py-2 border rounded-lg"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={creating}
                      className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50"
                    >
                      {creating ? "Creating..." : "Create"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserManagement;