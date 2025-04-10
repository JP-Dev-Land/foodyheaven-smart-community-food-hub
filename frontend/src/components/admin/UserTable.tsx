import React from 'react';
import { Link } from 'react-router-dom';
import { UserSummary } from '../../types/api';
import Button from '../ui/Button';
import { PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';

interface UserTableProps {
  users: UserSummary[];
  onDelete: (userId: number) => void; // Callback for delete action
  isDeletingId: number | null; // To show loading state on delete button
  isDeleting: boolean;
}

const UserTable: React.FC<UserTableProps> = ({ users, onDelete, isDeletingId, isDeleting }) => {
  return (
    <div className="overflow-x-auto shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
      <table className="min-w-full divide-y divide-gray-300">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Name</th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Email</th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Roles</th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
            <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {users.map((user) => (
            <tr key={user.id}>
              <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">{user.name}</td>
              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{user.username}</td>
              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                {user.roles.map(role => role.replace('ROLE_', '')).join(', ')}
              </td>
              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  user.enabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {user.enabled ? 'Enabled' : 'Disabled'}
                </span>
              </td>
              <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6 space-x-2">
                <Link to={`/admin/users/${user.id}/edit`} className="text-indigo-600 hover:text-indigo-900 inline-flex items-center">
                   <PencilSquareIcon className="h-4 w-4 mr-1" /> Edit
                </Link>
                 <Button
                    variant="danger"
                    size="sm"
                    onClick={() => onDelete(user.id)}
                    isLoading={isDeletingId === user.id}
                    disabled={isDeletingId === user.id || isDeleting}
                    className="p-1 text-red-600 hover:text-red-900"
                 >
                    <TrashIcon className="h-4 w-4" />
                    <span className="sr-only">Delete</span>
                 </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserTable;