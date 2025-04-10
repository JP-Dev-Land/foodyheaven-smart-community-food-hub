import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useGetFoodItemById, useUpdateFoodItem } from '../services/foodItemService';
import FoodItemForm from '../components/food/FoodItemForm';
import Card from '../components/ui/Card';
import Spinner from '../components/ui/Spinner';
import { UpdateFoodItemRequest, CreateFoodItemRequest, ApiError } from '../types/api';

const EditFoodItemPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: initialData, isLoading: isLoadingData, error: fetchError } = useGetFoodItemById(id);
  const { mutate: updateItem, isPending: isUpdating, error: updateError } = useUpdateFoodItem();

  const handleSubmit = (formData: CreateFoodItemRequest | UpdateFoodItemRequest) => {
    if (!id) return;

    updateItem({ id, data: formData as UpdateFoodItemRequest }, {
      onSuccess: (updatedItem) => {
        navigate(`/food/${updatedItem.id}`);
      },
      // onError handled by 'updateError' state
    });
  };

  const fetchErrorMessage = (fetchError as ApiError)?.message || 'Could not load item data.';
  const updateErrorMessage = (updateError as ApiError)?.message || (updateError as any)?.response?.data?.message || 'Failed to update item.';
  const displayError = updateError ? updateErrorMessage : null;

  if (isLoadingData) {
    return <div className="min-h-screen flex items-center justify-center"><Spinner size="lg" /></div>;
  }

  if (fetchError || !initialData) {
    return (
      <div className="container mx-auto p-4 text-center text-red-600">
        <p>{fetchErrorMessage}</p>
        <Link to="/food" className="text-indigo-600 hover:underline mt-2 inline-block">
          ← Back to Menu
        </Link>
      </div>
    );
  }

  return (
     <div className="container mx-auto p-4 max-w-2xl">
      <h1 className="text-2xl font-bold mb-4">Edit Food Item: {initialData.name}</h1>
      <Card>
        <FoodItemForm
          initialData={initialData}
          onSubmit={handleSubmit}
          isSubmitting={isUpdating}
          submitButtonText="Update Item"
          error={displayError}
        />
      </Card>
    </div>
  );
};

export default EditFoodItemPage;