import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { formatPrice } from '../utils/formatters';
import CartItemRow from '../components/cart/CartItemRow';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const CartPage: React.FC = () => {
  const { items, itemCount, totalAmount, clearCart } = useCart();
  const navigate = useNavigate();

  const handleClearCart = () => {
    if (window.confirm('Are you sure you want to empty your cart?')) {
      clearCart();
    }
  };

  const handleCheckout = () => {
      // TODO: Add checks (e.g., minimum order amount, user logged in)
      navigate('/checkout');
  };

  if (itemCount === 0) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-semibold mb-4">Your Shopping Cart</h1>
        <p className="text-gray-600 mb-6">Your cart is currently empty.</p>
        <Link to="/food">
          <Button variant="primary">Continue Shopping</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8">Your Shopping Cart</h1>

      <div className="lg:flex lg:gap-8">
        {/* Cart Items List */}
        <div className="lg:w-2/3 mb-8 lg:mb-0">
           <Card className="!p-0">
              <div className="divide-y divide-gray-200 px-4 md:px-6">
                 {items.map((item) => (
                    <CartItemRow key={item.id} item={item} />
                 ))}
              </div>
           </Card>
           <div className="mt-4 text-right">
                <Button variant="secondary" size="sm" onClick={handleClearCart}>
                   Clear Cart
                </Button>
           </div>
        </div>

        {/* Order Summary */}
        <div className="lg:w-1/3">
          <Card>
            <h2 className="text-lg font-semibold mb-4 border-b pb-2">Order Summary</h2>
            <div className="flex justify-between mb-2 text-sm text-gray-600">
              <span>Subtotal ({itemCount} items)</span>
              <span>{formatPrice(totalAmount)}</span>
            </div>
            {/* TODO: to be added lines for estimated tax, delivery fee later */}
            <div className="flex justify-between mt-4 pt-4 border-t font-bold text-gray-800">
              <span>Total</span>
              <span>{formatPrice(totalAmount)}</span>
            </div>
            <Button
                variant="primary"
                size="lg"
                className="w-full mt-6"
                onClick={handleCheckout}
            >
              Proceed to Checkout
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CartPage;