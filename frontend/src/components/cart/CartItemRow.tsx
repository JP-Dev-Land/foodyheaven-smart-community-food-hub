import React from 'react';
import { Link } from 'react-router-dom';
import { CartItem } from '../../types/cart';
import { useCart } from '../../hooks/useCart';
import { formatPrice } from '../../utils/formatters';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { TrashIcon } from '@heroicons/react/24/outline';

interface CartItemRowProps {
  item: CartItem;
}

const CartItemRow: React.FC<CartItemRowProps> = ({ item }) => {
  const { updateItemQuantity, removeItem } = useCart();

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuantity = parseInt(e.target.value, 10);
    if (!isNaN(newQuantity)) {
        updateItemQuantity(item.id, newQuantity);
    }
  };

  const handleRemove = () => {
      if (window.confirm(`Remove ${item.name} from cart?`)) {
          removeItem(item.id);
      }
  };

  return (
    <div className="flex items-center justify-between py-4 border-b border-gray-200 last:border-b-0">
        <div className="flex items-center flex-grow mr-4">
            {/* Image */}
            <Link to={`/food/${item.id}`} className="flex-shrink-0">
                <img
                    src={item.imageUrl || '/placeholder.jpg'}
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded mr-4 border border-gray-100"
                    onError={(e) => { e.currentTarget.src = '/placeholder.jpg'; }}
                />
            </Link>
            {/* Name & Price */}
            <div className="flex-grow">
                <Link to={`/food/${item.id}`} className="text-sm font-medium text-gray-800 hover:text-indigo-600 line-clamp-2">
                    {item.name}
                </Link>
                <p className="text-xs text-gray-500">{formatPrice(item.price)} each</p>
            </div>
        </div>

        {/* Quantity Input */}
        <div className="w-20 mx-4">
            <Input
                type="number"
                id={`quantity-${item.id}`}
                name={`quantity-${item.id}`}
                value={item.quantity}
                onChange={handleQuantityChange}
                min="1"
                className="text-center px-1 py-1 text-sm"
                aria-label={`Quantity for ${item.name}`}
            />
        </div>

        {/* Total Price & Remove Button */}
        <div className="flex items-center ml-4">
             <p className="w-20 text-sm font-medium text-gray-800 text-right mr-4">
                {formatPrice(item.price * item.quantity)}
            </p>
            <Button
                variant="secondary"
                size="sm"
                onClick={handleRemove}
                className="p-1 text-gray-500 hover:text-red-600"
                aria-label={`Remove ${item.name}`}
            >
                <TrashIcon className="h-4 w-4" />
            </Button>
        </div>
    </div>
  );
};

export default CartItemRow;