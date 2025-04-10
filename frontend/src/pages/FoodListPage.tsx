import React from 'react';
import { Link } from 'react-router-dom';
import { useGetAllFoodItems } from '../services/foodItemService';
import { useAuth } from '../hooks/useAuth';
import { ApiError } from '../types/api';
import FoodCard from '../components/food/FoodCard';
import Spinner from '../components/ui/Spinner';
import Button from '../components/ui/Button';

const FoodListPage: React.FC = () => {
  const {
    data: foodItems,
    isLoading: isLoadingItems,
    error: fetchError,
    isError: isFetchError,
  } = useGetAllFoodItems();

//   const { isAuthenticated, user } = useAuth();
  const { isAuthenticated } = useAuth();

  // Determine if the user has permission to create items
  // const canCreate = isAuthenticated && user?.roles?.includes('ROLE_COOK'); // TODO: (backend update needed)
  const canCreate = isAuthenticated;

  // Loading State
  if (isLoadingItems) {
    return (
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center">
        <Spinner size="lg" color="text-indigo-600" />
      </div>
    );
  }

  // Fetch Error State
  if (isFetchError) {
    const fetchErrorMessage = (fetchError as ApiError)?.message || 'Could not load food items.';
    return (
      <div className="container mx-auto p-4 py-12 text-center">
        <p className="text-red-600 mb-4">{fetchErrorMessage}</p>
        {/* Optional: Add a retry button */}
      </div>
    );
  }

  // Empty State (Data loaded successfully, but array is empty)
  if (!foodItems || foodItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Our Menu</h1>
          {canCreate && (
            <Link to="/food/new">
              <Button variant="primary">Add First Item</Button>
            </Link>
          )}
        </div>
        <div className="text-center py-16 bg-gray-50 rounded-lg border border-gray-200">
             <p className="text-gray-600">No delicious items found at the moment.</p>
             {!canCreate && <p className="text-sm text-gray-500 mt-2">Check back soon!</p> }
             {canCreate && <p className="text-sm text-gray-500 mt-2">Click the button above to add the first item to the menu!</p> }
        </div>
      </div>
    );
  }

  // Success State (Data available)
  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Explore Our Delicious Food</h1>
        {/* Conditionally show Create button */}
        {canCreate && (
          <Link to="/food/new">
            <Button variant="primary">Add New Item</Button>
          </Link>
        )}
      </div>

      {/* Food Item Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {foodItems.map((item) => (
          <FoodCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
};

export default FoodListPage;