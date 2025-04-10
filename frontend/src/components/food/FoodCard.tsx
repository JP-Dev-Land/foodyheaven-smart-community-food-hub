import React from 'react';
import { Link } from 'react-router-dom';
import { FoodItem } from '../../types/api';
import Card from '../ui/Card';
// import Button from '../ui/Button';
import { formatPrice } from '../../utils/formatters';

interface FoodCardProps {
  item: FoodItem;
}

const FoodCard: React.FC<FoodCardProps> = ({ item }) => {
  const descriptionSnippet = item.description
    ? item.description.length > 80
      ? `${item.description.substring(0, 80)}...`
      : item.description
    : 'No description available.'; // Fallback text

  return (
    <Card className="flex flex-col h-full overflow-hidden transition-shadow duration-200 hover:shadow-lg">
      <Link to={`/food/${item.id}`} className="group flex flex-col flex-grow">
        {/* Image Section */}
        <div className="aspect-video overflow-hidden">
          {item.imageUrl ? (
            <img
              src={item.imageUrl}
              alt={item.name}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" // Subtle zoom on hover
              loading="lazy"
              onError={(e) => {
                  e.currentTarget.style.display = 'none'; // e.currentTarget.src = '/placeholder.jpg';
              }}
            />
          ) : (
            <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400 text-sm font-medium">
              No Image
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="p-4 flex flex-col flex-grow">
          {/* Name */}
          <h3 className="text-lg font-semibold mb-1 text-gray-800 group-hover:text-indigo-600 transition-colors">
            {item.name}
          </h3>

          {/* Description Snippet */}
          <p className="text-sm text-gray-600 mb-3 flex-grow min-h-[40px]">
            {descriptionSnippet}
          </p>

          {/* Tags */}
          {item.tags && item.tags.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-1">
              {item.tags.slice(0, 3).map(tag => (
                <span key={tag} className="text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full">
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Price and Availability */}
          <div className="mt-auto flex justify-between items-center">
            <span className="text-lg font-bold text-indigo-700">
              {formatPrice(item.price)}
            </span>
            {!item.available && (
                <span className="text-xs font-semibold text-orange-600 bg-orange-100 px-2 py-0.5 rounded-full">
                    Unavailable
                </span>
            )}
          </div>
        </div>
      </Link>

      {/* TODO : Add to Cart Button to be implemented in future while doing cart functionality */}
      {/*
      <div className="p-4 pt-0 border-t border-gray-100 mt-auto">
          <Button
              variant={item.available ? "secondary" : "secondary"} // Adjust variant as needed
              size="sm"
              className="w-full"
              disabled={!item.available}
              // onClick={(e) => { e.stopPropagation(); handleAddToCart(item.id); }} // Prevent link navigation
          >
              {item.available ? 'Add to Cart' : 'Unavailable'}
          </Button>
      </div>
      */}
    </Card>
  );
};

export default FoodCard;