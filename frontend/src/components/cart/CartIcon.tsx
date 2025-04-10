import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../hooks/useCart';
import { ShoppingCartIcon } from '@heroicons/react/24/outline';

const CartIcon: React.FC = () => {
  const { itemCount } = useCart();

  return (
    <Link to="/cart" className="relative p-2 text-gray-600 hover:text-indigo-600">
      <ShoppingCartIcon className="h-6 w-6" aria-hidden="true" />
      {itemCount > 0 && (
        <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
          {itemCount}
        </span>
      )}
      <span className="sr-only">View shopping cart</span>
    </Link>
  );
};

export default CartIcon;