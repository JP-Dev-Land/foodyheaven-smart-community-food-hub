import React, { useState, useEffect } from 'react';
import { FoodItem, CreateFoodItemRequest, UpdateFoodItemRequest } from '../../types/api';
import Input from '../ui/Input';
import Button from '../ui/Button';
import Textarea from '../ui/Textarea';
import Checkbox from '../ui/Checkbox';

interface FoodItemFormProps {
  initialData?: FoodItem;
  onSubmit: (data: CreateFoodItemRequest | UpdateFoodItemRequest) => void;
  isSubmitting: boolean;
  submitButtonText?: string;
  error?: string | null;
}

const FoodItemForm: React.FC<FoodItemFormProps> = ({
  initialData,
  onSubmit,
  isSubmitting,
  submitButtonText = 'Submit',
  error
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<string>('');
  const [imageUrl, setImageUrl] = useState('');
  const [tags, setTags] = useState<string>('');
  const [available, setAvailable] = useState(true);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setDescription(initialData.description || '');
      setPrice(initialData.price.toString());
      setImageUrl(initialData.imageUrl || '');
      setTags(initialData.tags?.join(', ') || '');
      setAvailable(initialData.available);
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const priceNumber = parseFloat(price);
    if (isNaN(priceNumber) || priceNumber <= 0) {
        alert('Please enter a valid positive price.');
        return;
    }

    const tagsArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag !== '');

    const formData: CreateFoodItemRequest | UpdateFoodItemRequest = {
      name,
      description,
      price: priceNumber,
      imageUrl: imageUrl || undefined,
      tags: tagsArray.length > 0 ? tagsArray : undefined,
      available,
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
        id="food-name"
        name="name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        disabled={isSubmitting}
      />
       <Textarea
        label="Description"
        id="food-description"
        name="description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={4}
        disabled={isSubmitting}
      />
      <Input
        label="Price"
        id="food-price"
        name="price"
        type="number"
        step="0.01"
        min="0.01"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        required
        disabled={isSubmitting}
      />
      <Input
        label="Image URL (Optional)"
        id="food-imageUrl"
        name="imageUrl"
        type="url"
        value={imageUrl}
        onChange={(e) => setImageUrl(e.target.value)}
        disabled={isSubmitting}
      />
       <Input
        label="Tags (Comma-separated, Optional)"
        id="food-tags"
        name="tags"
        value={tags}
        onChange={(e) => setTags(e.target.value)}
        disabled={isSubmitting}
      />
      <Checkbox
          label="Available for Ordering"
          id="food-available"
          name="available"
          checked={available}
          onChange={(e) => setAvailable(e.target.checked)}
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
        {isSubmitting ? 'Saving...' : submitButtonText}
      </Button>
    </form>
  );
};

export default FoodItemForm;