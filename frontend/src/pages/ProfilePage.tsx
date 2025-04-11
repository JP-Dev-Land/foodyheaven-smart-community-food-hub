import React from 'react';
import { useGetUserProfile, useUpdateUserProfile } from '../services/userService';
import { UpdateProfileRequest, ApiError } from '../types/api';
import Card from '../components/ui/Card';
import Spinner from '../components/ui/Spinner';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { Link } from 'react-router-dom';

const ProfilePage: React.FC = () => {
  const { data: profile, isLoading, error: fetchError } = useGetUserProfile();
  const { mutate: updateProfile, isPending: isUpdating, error: updateError } = useUpdateUserProfile();

  const [name, setName] = React.useState('');

  React.useEffect(() => {
      if (profile) {
          setName(profile.name);
      }
  }, [profile]);

  const handleProfileUpdate = (e: React.FormEvent) => {
      e.preventDefault();
      const request: UpdateProfileRequest = { name };
      updateProfile(request, {
          onSuccess: () => {
              // TODO: Show success message/toast
              alert('Profile updated successfully!');
          }
      });
  };

  const fetchErrorMessage = (fetchError as ApiError)?.message || 'Could not load profile.';
  const updateErrorMessage = (updateError as ApiError)?.message || 'Failed to update profile.';
  const displayError = updateError ? updateErrorMessage : null;

  if (isLoading) {
      return <div className="min-h-screen flex items-center justify-center"><Spinner size="lg" /></div>;
  }

  if (fetchError || !profile) {
      return <div className="container mx-auto p-4 text-center text-red-600">{fetchErrorMessage}</div>;
  }

  return (
    <div className="container mx-auto p-4 max-w-xl">
        <h1 className="text-2xl font-bold mb-6">Your Profile</h1>

        <Card className="mb-8">
             <h2 className="text-lg font-semibold mb-4">Account Details</h2>
             <p className="text-sm mb-1"><span className="font-medium text-gray-600">ID:</span> {profile.id}</p>
             <p className="text-sm mb-1"><span className="font-medium text-gray-600">Email:</span> {profile.username}</p>
             <p className="text-sm mb-4"><span className="font-medium text-gray-600">Roles:</span> {profile.roles.map(r => r.replace('ROLE_', '')).join(', ')}</p>

             <form onSubmit={handleProfileUpdate}>
                 <h3 className="text-md font-semibold mb-2 border-t pt-4">Update Your Name</h3>
                 {displayError && (
                    <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
                        {displayError}
                    </div>
                 )}
                 <Input
                     label="Name"
                     id="profile-name"
                     value={name}
                     onChange={(e) => setName(e.target.value)}
                     required
                     disabled={isUpdating}
                     wrapperClassName="mb-2"
                 />
                 <Button type="submit" isLoading={isUpdating} disabled={isUpdating}>
                     Save Name Changes
                 </Button>
             </form>
        </Card>

        <div className="mt-6 text-center">
            <Link to="/order-history" className="text-indigo-600 hover:underline">
                View Your Order History
            </Link>
        </div>

        {/* TODO: Placeholder for Change Password Form */}
        <Card>
            <h2 className="text-lg font-semibold mb-4">Change Password</h2>
            <p className="text-sm text-gray-500">Password change form will go here.</p>
            {/* Add ChangePasswordForm component here */}
        </Card>
    </div>
  );
};

export default ProfilePage;