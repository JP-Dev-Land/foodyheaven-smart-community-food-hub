import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useGetUserById, useUpdateUser } from '../services/userService';
import { UpdateUserRequest, ApiError } from '../types/api';
import UserEditForm from '../components/admin/UserEditForm';
import Card from '../components/ui/Card';
import Spinner from '../components/ui/Spinner';
import Button from '../components/ui/Button';

const AdminUserEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: initialData, isLoading: isLoadingData, error: fetchError } = useGetUserById(id);
  const { mutate: updateUser, isPending: isUpdating, error: updateError } = useUpdateUser();

  const handleSubmit = (formData: UpdateUserRequest) => {
    if (!id) return;
    updateUser({ id, data: formData }, {
      onSuccess: () => {
        // TODO: Consider a success notification
        navigate('/admin/users'); // Going back to list after successful update
      },
      // onError handled by 'updateError' state
    });
  };

  const fetchErrorMessage = (fetchError as ApiError)?.message || 'Could not load user data.';
  const updateErrorMessage = (updateError as ApiError)?.message || (updateError as any)?.response?.data?.message || 'Failed to update user.';
  const displayError = updateError ? updateErrorMessage : null;

  if (isLoadingData) {
    return <div className="min-h-screen flex items-center justify-center"><Spinner size="lg" /></div>;
  }

  if (fetchError || !initialData) {
    return (
      <div className="container mx-auto p-4 text-center text-red-600">
        <p>{fetchErrorMessage}</p>
        <Link to="/admin/users" className="text-indigo-600 hover:underline mt-2 inline-block">
          ← Back to User List
        </Link>
      </div>
    );
  }

  return (
     <div className="container mx-auto p-4 max-w-2xl">
      <div className="flex justify-between items-center mb-6">
         <h1 className="text-2xl font-bold">Edit User: {initialData.name}</h1>
         <Link to="/admin/users">
             <Button variant="secondary" size="sm" disabled={isUpdating}>Cancel</Button>
         </Link>
      </div>
      <Card>
        <UserEditForm
          initialData={initialData}
          onSubmit={handleSubmit}
          isSubmitting={isUpdating}
          error={displayError}
        />
      </Card>
    </div>
  );
};

export default AdminUserEditPage;