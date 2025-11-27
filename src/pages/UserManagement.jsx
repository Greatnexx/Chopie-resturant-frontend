import { useState } from "react";
import { useGetAllUsersQuery, useToggleUserStatusMutation, useAwardStarMutation, useCreateUserMutation, useDeleteUserMutation, useResetUserPasswordMutation } from "../slices/restaurantSlice";
import { toast } from "sonner";
import { Users, Plus, Star, ToggleLeft, ToggleRight, Trash2, Eye, RefreshCw, Copy, Menu } from "lucide-react";
import RestaurantSidebar from "../components/RestaurantSidebar";
import { useNavigate } from "react-router-dom";

const UserManagement = () => {
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [newUser, setNewUser] = useState({ name: "", email: "", role: "SubUser" });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [showCredentialsModal, setShowCredentialsModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const { data: usersData, refetch } = useGetAllUsersQuery();
  const [toggleUserStatus] = useToggleUserStatusMutation();
  const [awardStar] = useAwardStarMutation();
  const [createUser, { isLoading: creating }] = useCreateUserMutation();
  const [deleteUser, { isLoading: deleting }] = useDeleteUserMutation();
  const [resetUserPassword, { isLoading: resetting }] = useResetUserPasswordMutation();

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
      const result = await createUser(newUser).unwrap();
      const password = result.data.temporaryPassword;
      toast.success(`User created! Password: ${password}`);
      setNewUser({ name: "", email: "", role: "SubUser" });
      setShowCreateUser(false);
      refetch();
    } catch (error) {
      toast.error(error?.data?.message || "Failed to create user");
    }
  };

  const handleDeleteUser = async () => {
    try {
      await deleteUser(userToDelete._id).unwrap();
      toast.success("User deleted successfully!");
      setShowDeleteModal(false);
      setUserToDelete(null);
      refetch();
    } catch (error) {
      toast.error(error?.data?.message || "Failed to delete user");
    }
  };

  const handleResetPassword = async (userId) => {
    try {
      const result = await resetUserPassword(userId).unwrap();
      toast.success(`Password reset! New password: ${result.data.defaultPassword}`);
      refetch();
    } catch (error) {
      toast.error(error?.data?.message || "Failed to reset password");
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const handleLogout = () => {
    sessionStorage.removeItem("restaurantUser");
    navigate("/restaurant/login");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <RestaurantSidebar 
        user={JSON.parse(sessionStorage.getItem("restaurantUser") || "{}")} 
        onLogout={handleLogout}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      
      <div className="flex-1 lg:ml-64 p-4 lg:p-6 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6 lg:mb-8">
            <div className="flex items-center gap-4 mb-2">
              {/* Mobile Menu Button */}
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 hover:bg-gray-200 rounded-lg"
              >
                <Menu className="w-6 h-6 text-gray-600" />
              </button>
              <div className="flex-1">
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">User Management</h1>
                <p className="text-gray-600 text-sm lg:text-base">Manage restaurant staff and permissions</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow">
            <div className="p-4 lg:p-6 border-b">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <h2 className="text-lg lg:text-xl font-semibold">Staff Members</h2>
                <button
                  onClick={() => setShowCreateUser(true)}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 flex items-center justify-center gap-2 text-sm lg:text-base"
                >
                  <Plus className="w-4 h-4" />
                  Add User
                </button>
              </div>
            </div>

            <div className="p-4 lg:p-6">
              {/* Desktop Table View */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3">Name</th>
                      <th className="text-left py-3">Email</th>
                      <th className="text-left py-3">Role</th>
                      <th className="text-left py-3">Password</th>
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
                          {user.isFirstLogin && user.defaultPassword ? (
                            <div className="flex items-center gap-2">
                              <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">
                                {user.defaultPassword}
                              </code>
                              <button
                                onClick={() => copyToClipboard(user.defaultPassword)}
                                className="text-gray-500 hover:text-gray-700"
                                title="Copy password"
                              >
                                <Copy className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <span className="text-gray-500 text-sm">Password changed</span>
                          )}
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
                              <>
                                <button
                                  onClick={() => handleAwardStar(user._id)}
                                  className="text-yellow-600 hover:text-yellow-800"
                                  title="Award star"
                                >
                                  <Star className="w-5 h-5" />
                                </button>
                                <button
                                  onClick={() => handleResetPassword(user._id)}
                                  className="text-green-600 hover:text-green-800"
                                  title="Reset password"
                                  disabled={resetting}
                                >
                                  <RefreshCw className="w-5 h-5" />
                                </button>
                                <button
                                  onClick={() => {
                                    setUserToDelete(user);
                                    setShowDeleteModal(true);
                                  }}
                                  className="text-red-600 hover:text-red-800"
                                  title="Delete user"
                                >
                                  <Trash2 className="w-5 h-5" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="lg:hidden space-y-4">
                {users.map((user) => (
                  <div key={user._id} className="bg-gray-50 rounded-lg p-4 border">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-900">{user.name}</h3>
                        <p className="text-sm text-gray-600">{user.email}</p>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs ${
                        user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Role</p>
                        <span className={`px-2 py-1 rounded text-xs ${
                          user.role === 'SuperAdmin' ? 'bg-purple-100 text-purple-800' :
                          user.role === 'TransactionAdmin' ? 'bg-blue-100 text-blue-800' :
                          user.role === 'MenuManager' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {user.role}
                        </span>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Stars</p>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500" />
                          <span className="text-sm">{user.stars || 0}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mb-3">
                      <p className="text-xs text-gray-500 mb-1">Password</p>
                      {user.isFirstLogin && user.defaultPassword ? (
                        <div className="flex items-center gap-2">
                          <code className="bg-white px-2 py-1 rounded text-sm font-mono border">
                            {user.defaultPassword}
                          </code>
                          <button
                            onClick={() => copyToClipboard(user.defaultPassword)}
                            className="text-gray-500 hover:text-gray-700 p-1"
                            title="Copy password"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-gray-500 text-sm">Password changed</span>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {user._id !== JSON.parse(sessionStorage.getItem("restaurantUser") || "{}")._id && (
                        <button
                          onClick={() => handleToggleStatus(user._id, user.isActive)}
                          className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200"
                        >
                          {user.isActive ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                          {user.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                      )}
                      {user.role !== 'SuperAdmin' && (
                        <>
                          <button
                            onClick={() => handleAwardStar(user._id)}
                            className="flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-700 rounded text-sm hover:bg-yellow-200"
                          >
                            <Star className="w-4 h-4" />
                            Award Star
                          </button>
                          <button
                            onClick={() => handleResetPassword(user._id)}
                            className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded text-sm hover:bg-green-200"
                            disabled={resetting}
                          >
                            <RefreshCw className="w-4 h-4" />
                            Reset Password
                          </button>
                          <button
                            onClick={() => {
                              setUserToDelete(user);
                              setShowDeleteModal(true);
                            }}
                            className="flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Create User Modal */}
          {showCreateUser && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg p-4 lg:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
                <h3 className="text-lg font-semibold mb-4">Create New User</h3>
                <form onSubmit={handleCreateUser} className="space-y-4">
                  <input
                    type="text"
                    placeholder="Name"
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm lg:text-base"
                    required
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm lg:text-base"
                    required
                  />
                  <div className="text-xs lg:text-sm text-gray-600 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="font-medium text-blue-800 mb-1">📋 Password Generation:</p>
                    <p>• Password will be the user's <strong>surname in UPPERCASE</strong></p>
                    <p>• Example: "John Smith" → Password: "SMITH"</p>
                    <p>• User must change password on first login</p>
                  </div>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm lg:text-base"
                  >
                    <option value="SubUser">Sub User</option>
                    <option value="TransactionAdmin">Transaction Admin</option>
                    <option value="MenuManager">Menu Manager</option>
                  </select>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      type="button"
                      onClick={() => setShowCreateUser(false)}
                      className="flex-1 px-4 py-2 border rounded-lg text-sm lg:text-base"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={creating}
                      className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 text-sm lg:text-base"
                    >
                      {creating ? "Creating..." : "Create"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Delete User Confirmation Modal */}
          {showDeleteModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg p-4 lg:p-6 w-full max-w-md">
                <h3 className="text-lg font-semibold mb-4 text-red-600">⚠️ Delete User</h3>
                <p className="text-gray-600 mb-6 text-sm lg:text-base">
                  Are you sure you want to delete <strong>{userToDelete?.name}</strong>? This action cannot be undone.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => {
                      setShowDeleteModal(false);
                      setUserToDelete(null);
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm lg:text-base"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteUser}
                    disabled={deleting}
                    className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 text-sm lg:text-base"
                  >
                    {deleting ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserManagement;