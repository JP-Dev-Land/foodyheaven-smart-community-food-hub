import React, { useState } from 'react';
import { useGetAllUsers, useDeleteUser } from '../services/userService';
import { ApiError } from '../types/api';
import UserTable from '../components/admin/UserTable';
import Spinner from '../components/ui/Spinner';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';

const AdminUserListPage: React.FC = () => {
  const { data: users, isLoading, error, isError } = useGetAllUsers();
  const { mutate: deleteUserMutate, isPending: isDeleting } = useDeleteUser();
  const [deletingId, setDeletingId] = useState<number | null>(null); // Track which ID is being deleted

  const handleDeleteUser = (userId: number) => {
    if (window.confirm(`Are you sure you want to delete/disable user ID ${userId}?`)) {
      setDeletingId(userId); // for loading state
      deleteUserMutate(userId, {
          onSettled: () => {
              setDeletingId(null); // Clear loading state regardless of outcome
          }
          // onSuccess/onError handled by hook
      });
    }
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center"><Spinner size="lg" /></div>;
  }

  if (isError) {
    const errorMessage = (error as ApiError)?.message || 'Could not load users.';
    return <div className="container mx-auto p-4 text-center text-red-600">{errorMessage}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
       <div className="flex justify-between items-center mb-6">
         <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Manage Users</h1>
         <Link to="/admin/users/new"><Button>Create User</Button></Link>
       </div>

        {(!users || users.length === 0) ? (
            <p className="text-center text-gray-500">No users found.</p>
        ) : (
            <UserTable
                users={users}
                onDelete={handleDeleteUser}
                isDeletingId={deletingId}
                isDeleting={isDeleting}
            />
        )}
    </div>
  );
};

export default AdminUserListPage;