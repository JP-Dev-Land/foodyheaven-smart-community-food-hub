import React, { useState, useEffect } from 'react';
import { UserDetail, UpdateUserRequest, availableRoles, AppRole } from '../../types/api';
import Input from '../ui/Input';
import Button from '../ui/Button';
import Checkbox from '../ui/Checkbox';

interface UserEditFormProps {
  initialData: UserDetail;
  onSubmit: (data: UpdateUserRequest) => void;
  isSubmitting: boolean;
  error?: string | null;
}

const UserEditForm: React.FC<UserEditFormProps> = ({
  initialData,
  onSubmit,
  isSubmitting,
  error
}) => {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [roles, setRoles] = useState<Set<AppRole>>(new Set());
  const [enabled, setEnabled] = useState(true);

  // Populate form with initial data when it loads or changes
  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setUsername(initialData.username);
      // Ensure roles from initialData are valid AppRole types before setting
      const validInitialRoles = initialData.roles.filter(role => availableRoles.includes(role as AppRole));
      setRoles(new Set(validInitialRoles as AppRole[]));
      setEnabled(initialData.enabled);
    }
  }, [initialData]);

  const handleRoleChange = (role: AppRole, isChecked: boolean) => {
    setRoles(prevRoles => {
      const newRoles = new Set(prevRoles);
      if (isChecked) {
        newRoles.add(role);
      } else {
        // Prevent removing the last role or ROLE_USER if it's the only one
        if (newRoles.size > 1 || role !== 'ROLE_USER') {
             newRoles.delete(role);
        }
        // Ensure at least ROLE_USER remains if set becomes empty after deletion
        if (newRoles.size === 0) {
            newRoles.add('ROLE_USER');
        }
      }
      return newRoles;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
     if (roles.size === 0) {
        // This shouldn't happen due to logic in handleRoleChange, but as a safeguard
         alert("User must have at least one role (ROLE_USER recommended).");
         return;
     }

    const formData: UpdateUserRequest = {
      name,
      username,
      roles: Array.from(roles), // Convert Set back to Array for API
      enabled,
    };
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
         <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
            {error}
         </div>
       )}
      <Input
        label="Full Name"
        id="edit-user-name"
        name="name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        disabled={isSubmitting}
        autoComplete="name"
      />
       <Input
        label="Email (Login Username)"
        id="edit-user-username"
        name="username"
        type="email"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        required
        disabled={isSubmitting}
        autoComplete="email"
      />

      {/* Roles Selection */}
       <div className="my-4">
           <label className="block text-sm font-medium text-gray-700 mb-2">Assign Roles</label>
           <div className="grid grid-cols-2 gap-2"> {/* Layout roles */}
              {availableRoles.map(role => (
                  <Checkbox
                    key={role}
                    label={role.replace('ROLE_', '')} // Display friendly name
                    id={`edit-role-${role}`}
                    name="roles"
                    checked={roles.has(role)}
                    onChange={(e) => handleRoleChange(role, e.target.checked)}
                    // Disable unchecking ROLE_USER if it's the only role assigned
                    disabled={isSubmitting || (role === 'ROLE_USER' && roles.size === 1 && roles.has('ROLE_USER'))}
                    wrapperClassName="mb-0" // No bottom margin needed here
                  />
              ))}
           </div>
       </div>

       {/* Enabled Status */}
       <Checkbox
          label="Account Enabled"
          id="edit-user-enabled"
          name="enabled"
          checked={enabled}
          onChange={(e) => setEnabled(e.target.checked)}
          disabled={isSubmitting}
          wrapperClassName="my-4"
      />

      {/* TODO: Add password change section if needed */}

      <Button
        type="submit"
        variant="primary"
        className="w-full mt-6" // Add margin top
        isLoading={isSubmitting}
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Saving Changes...' : 'Update User'}
      </Button>
    </form>
  );
};

export default UserEditForm;