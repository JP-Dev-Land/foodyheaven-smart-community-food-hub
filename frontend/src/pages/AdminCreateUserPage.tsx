import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCreateUser } from '../services/userService';
import { CreateUserRequest, ApiError } from '../types/api';
import UserCreateForm from '../components/admin/UserCreateForm';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const AdminCreateUserPage: React.FC = () => {
  const navigate = useNavigate();
  const { mutate: createUser, isPending, error } = useCreateUser();

  const handleSubmit = (formData: CreateUserRequest) => {
    createUser(formData, {
      onSuccess: () => {
        // TODO: Show success toast/notification
        alert('User created successfully!');
        navigate('/admin/users');
      },
      // onError is handled via the 'error' state
    });
  };

  // Extract user-friendly error message
  const creationErrorMessage =
     (error as ApiError)?.message ||
     (error as any)?.response?.data?.message ||
     (error ? 'Failed to create user. Please try again.' : null);

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 max-w-2xl">
        <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Create New User</h1>
             <Link to="/admin/users">
                <Button variant="secondary" size="sm" disabled={isPending}>Cancel</Button>
             </Link>
        </div>
        <Card>
            <UserCreateForm
                onSubmit={handleSubmit}
                isSubmitting={isPending}
                error={creationErrorMessage}
            />
        </Card>
    </div>
  );
};

export default AdminCreateUserPage;