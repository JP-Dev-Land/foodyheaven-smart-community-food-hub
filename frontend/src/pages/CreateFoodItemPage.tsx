import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateFoodItem } from '../services/foodItemService';
import { CreateFoodItemRequest, UpdateFoodItemRequest, ApiError } from '../types/api';
import FoodItemForm from '../components/food/FoodItemForm';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button'; 
import { Link } from 'react-router-dom';

const CreateFoodItemPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    mutate: createItem,
    isPending: isCreating,
    error: createError,
  } = useCreateFoodItem();

  const handleSubmit = (formData: CreateFoodItemRequest | UpdateFoodItemRequest) => {
    createItem(formData as CreateFoodItemRequest, {
      onSuccess: (newItem) => {
        navigate(`/food/${newItem.id}`); // Navigate to the newly created item's detail page
        // TODO: implement global success notification/toast
      },
      // onError handled via createError state
    });
  };

  // Extract user-friendly error message
  const creationErrorMessage =
    (createError as ApiError)?.message ||
    (createError as any)?.response?.data?.message ||
    'Failed to create item. Please check the details and try again.';

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 max-w-2xl">
      <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Add New Food Item</h1>
          <Link to="/food">
              <Button variant="secondary" size="sm" disabled={isCreating}>Cancel</Button>
          </Link>
      </div>

      {/* Display Creation Error */}
      {createError && (
        <div className="mb-6 p-4 bg-red-100 border border-red-300 text-red-800 rounded-md shadow-sm">
          <p className="font-medium">Creation Error:</p>
          <p className="text-sm">{creationErrorMessage}</p>
        </div>
      )}

      <Card>
        <FoodItemForm
          onSubmit={handleSubmit}
          isSubmitting={isCreating}
          submitButtonText="Create Item"
          error={createError ? creationErrorMessage : null} // Alternative: pass to form
        />
      </Card>
    </div>
  );
};

export default CreateFoodItemPage;