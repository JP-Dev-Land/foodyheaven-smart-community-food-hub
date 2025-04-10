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

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setUsername(initialData.username);
      setRoles(new Set(initialData.roles as AppRole[]));
      setEnabled(initialData.enabled);
    }
  }, [initialData]);

  const handleRoleChange = (role: AppRole, isChecked: boolean) => {
    setRoles(prevRoles => {
      const newRoles = new Set(prevRoles);
      if (isChecked) {
        newRoles.add(role);
      } else {
        // Prevent removing the last role? Or ensure ROLE_USER is always added if empty?
        if (newRoles.size > 1 || role !== 'ROLE_USER') {
             newRoles.delete(role);
        }
        // Ensure at least ROLE_USER remains if set becomes empty
        if (newRoles.size === 0) {
            newRoles.add('ROLE_USER');
        }
      }
      return newRoles;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData: UpdateUserRequest = {
      name,
      username,
      roles: Array.from(roles), // Convert Set back to Array for API
      enabled,
    };
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && (
         <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
         </div>
       )}
      <Input
        label="Name"
        id="user-name"
        name="name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        disabled={isSubmitting}
      />
       <Input
        label="Email (Username)"
        id="user-username"
        name="username"
        type="email"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        required
        disabled={isSubmitting}
      />

      {/* Roles Selection */}
       <div className="my-4">
           <label className="block text-sm font-medium text-gray-700 mb-2">Roles</label>
           <div className="space-y-2">
              {availableRoles.map(role => (
                  <Checkbox
                    key={role}
                    label={role.replace('ROLE_', '')} // Display friendly name
                    id={`role-${role}`}
                    name="roles"
                    checked={roles.has(role)}
                    onChange={(e) => handleRoleChange(role, e.target.checked)}
                    disabled={isSubmitting || (role === 'ROLE_USER' && roles.size === 1 && roles.has('ROLE_USER'))} // Prevent unchecking last ROLE_USER
                    wrapperClassName="mb-1"
                  />
              ))}
           </div>
       </div>

       {/* Enabled Status */}
       <Checkbox
          label="Account Enabled"
          id="user-enabled"
          name="enabled"
          checked={enabled}
          onChange={(e) => setEnabled(e.target.checked)}
          disabled={isSubmitting}
          wrapperClassName="my-4"
      />

      <Button
        type="submit"
        variant="primary"
        className="w-full mt-4"
        isLoading={isSubmitting}
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Saving...' : 'Update User'}
      </Button>
    </form>
  );
};

export default UserEditForm;