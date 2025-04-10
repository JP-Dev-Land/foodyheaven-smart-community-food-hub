import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useGetFoodItemById, useDeleteFoodItem } from '../services/foodItemService';
import { useAuth } from '../hooks/useAuth';
import { ApiError } from '../types/api';
import Spinner from '../components/ui/Spinner';
import Button from '../components/ui/Button';
import { formatDate, formatPrice } from '../utils/formatters';

const FoodDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const {
    data: item,
    isLoading: isLoadingItem,
    error: fetchError,
    isError: isFetchError,
  } = useGetFoodItemById(id);

  const {
    mutate: deleteItem,
    isPending: isDeleting,
    error: deleteError,
  } = useDeleteFoodItem();

  const isOwner = user && item && user.id === item.cookId;

  const handleDelete = () => {
    if (!id || !item) return; // Guard clause

    // Use window.confirm for simplicity, consider a modal component for better UX
    if (window.confirm(`Are you sure you want to delete "${item.name}"? This cannot be undone.`)) {
      deleteItem(id, {
        onSuccess: () => {
          navigate('/food'); // Redirect after successful deletion
          // Optional: Consider adding a global success notification/toast here
        },
        // onError: Error is handled via the deleteError state and displayed below
      });
    }
  };

  // Loading State
  if (isLoadingItem) {
    return (
      // Use calc() for height to account for potential header/footer height
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center">
        <Spinner size="lg" color="text-indigo-600" />
      </div>
    );
  }

  // Fetch Error State or Item Not Found
  if (isFetchError || !item) {
    const fetchErrorMessage = (fetchError as ApiError)?.message || 'Food item not found or could not be loaded.';
    return (
      <div className="container mx-auto p-4 py-12 text-center">
        <p className="text-red-600 mb-4">{fetchErrorMessage}</p>
        <Link to="/food" className="text-indigo-600 hover:underline">
          ← Back to Menu
        </Link>
      </div>
    );
  }

  // Delete Error Message Handling
  const deleteErrorMessage = (deleteError as ApiError)?.message || 'Failed to delete the item. Please try again.';

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      {/* Back Link */}
      <Link to="/food" className="text-sm text-indigo-600 hover:underline mb-6 inline-block">
        ← Back to Menu
      </Link>

      {/* Delete Error Display */}
      {deleteError && (
        <div className="mb-6 p-4 bg-red-100 border border-red-300 text-red-800 rounded-md shadow-sm">
          <p className="font-medium">Deletion Error:</p>
          <p className="text-sm">{deleteErrorMessage}</p>
        </div>
      )}

      {/* Main Content Area */}
      <div className="md:flex md:gap-8 lg:gap-12">
        {/* Image Column */}
        <div className="md:w-1/2 lg:w-5/12 mb-6 md:mb-0 flex-shrink-0">
          {item.imageUrl ? (
            <img
              src={item.imageUrl}
              alt={item.name}
              className="w-full h-auto max-h-[500px] object-contain rounded-lg shadow-md border border-gray-200 bg-white"
              loading="lazy" // Improve performance for images below the fold
              onError={(e) => {
                  // Optional: Replace with a placeholder or hide
                  e.currentTarget.style.display = 'none';
                  // Consider adding a sibling placeholder element revealed here
              }}
            />
          ) : (
            <div className="w-full h-64 md:h-80 lg:h-96 bg-gray-100 flex items-center justify-center text-gray-500 rounded-lg shadow-inner border border-gray-200">
              No Image Available
            </div>
          )}
        </div>

        {/* Details Column */}
        <div className="md:w-1/2 lg:w-7/12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">{item.name}</h1>
          <p className="text-sm text-gray-500 mb-4">
            Added by: <span className="font-medium text-gray-700">{item.cookName}</span>
          </p>
          <p className="text-gray-700 mb-5 leading-relaxed">{item.description || "No description provided."}</p>

          {/* Tags */}
          {item.tags && item.tags.length > 0 && (
            <div className="mb-5 flex flex-wrap gap-2 items-center">
              <span className="font-medium text-sm text-gray-600">Tags:</span>
              {item.tags.map(tag => (
                <span key={tag} className="text-xs bg-gray-200 text-gray-800 px-3 py-1 rounded-full font-medium">
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Price and Availability */}
          <div className="flex items-center gap-4 mb-6">
            <p className="text-2xl font-bold text-indigo-700">{formatPrice(item.price)}</p>
            {!item.available && (
              <span className="text-xs font-semibold text-orange-600 bg-orange-100 px-2 py-0.5 rounded-full">
                Unavailable
              </span>
            )}
          </div>

          {/* Add to Cart Button (Placeholder) */}
          <div className="mb-6">
             <Button
                 variant="primary"
                 size="lg"
                 className="w-full md:w-auto"
                 disabled={!item.available || isDeleting} // Also disable while deleting
                 // onClick={() => handleAddToCart(item.id)} // TODO: Implement cart logic
             >
                 {item.available ? 'Add to Cart' : 'Currently Unavailable'}
             </Button>
          </div>

          {/* Timestamps */}
          <p className="text-xs text-gray-500 mb-6">
            First Added: {formatDate(item.createdAt)} |
            Last Updated: {formatDate(item.updatedAt)}
          </p>

          {/* Owner Management Actions */}
          {isOwner && (
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Manage This Item:</h3>
              <div className="flex items-center gap-3">
                  <Link to={`/food/${item.id}/edit`}>
                    <Button variant="secondary" size="sm" disabled={isDeleting}>
                      Edit Item
                    </Button>
                  </Link>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={handleDelete}
                    isLoading={isDeleting}
                    disabled={isDeleting}
                  >
                    Delete Item
                  </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FoodDetailPage;