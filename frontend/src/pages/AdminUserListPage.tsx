import React, { useState } from 'react';
import { useGetAllUsers, useDeleteUser } from '../services/userService';
import { ApiError } from '../types/api';
import UserTable from '../components/admin/UserTable'; // Import the table component
import Spinner from '../components/ui/Spinner';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';

const AdminUserListPage: React.FC = () => {
  const { data: users, isLoading, error, isError, refetch } = useGetAllUsers();
  const { mutate: deleteUserMutate, isPending: isDeleting } = useDeleteUser();
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleDeleteUser = (userId: number) => {
    if (window.confirm(`Are you sure you want to delete/disable user ID ${userId}? This action might be irreversible depending on backend implementation.`)) {
      setDeletingId(userId); // Set loading state for the specific button
      deleteUserMutate(userId, {
          onSuccess: () => {
              alert(`User ${userId} processed successfully.`);
          },
          onError: (err) => {
              alert(`Failed to process user ${userId}: ${(err as ApiError)?.message || 'Unknown error'}`);
          },
          onSettled: () => {
              setDeletingId(null); // Clear loading state regardless of outcome
          }
      });
    }
  };

  if (isLoading) {
    return <div className="min-h-[calc(100vh-200px)] flex items-center justify-center"><Spinner size="lg" /></div>;
  }

  if (isError) {
    const errorMessage = (error as ApiError)?.message || 'Could not load users.';
    return <div className="container mx-auto p-4 text-center text-red-600">{errorMessage}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
       <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
         <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Manage Users</h1>
         <div className="flex gap-2">
             <Button variant="secondary" size="sm" onClick={() => refetch()} disabled={isLoading}>
                 {isLoading ? <Spinner size="sm" /> : 'Refresh List'}
             </Button>
             <Link to="/admin/users/new"> {/* Link to the create page */}
                 <Button variant="primary" size="sm">Create New User</Button>
             </Link>
         </div>
       </div>

        {(!users || users.length === 0) ? (
            <p className="text-center text-gray-500 mt-10">No users found.</p>
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