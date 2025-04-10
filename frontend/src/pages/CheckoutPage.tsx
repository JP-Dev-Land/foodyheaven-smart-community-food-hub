import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { usePlaceOrder } from '../services/orderService';
import { PlaceOrderRequestDTO, CartItemDTO, ApiError } from '../types/api';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';
import { formatPrice } from '../utils/formatters';

const CheckoutPage: React.FC = () => {
  const { items, totalAmount, clearCart } = useCart();
  const navigate = useNavigate();
  const { mutate: placeOrder, isPending, error } = usePlaceOrder();
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const handlePlaceOrder = () => {
    setCheckoutError(null);

    if (items.length === 0) {
        setCheckoutError("Your cart is empty.");
        return;
    }

    // validation: Ensure all items are from the same cook
    if (items.length > 1) {
        const firstCookId = items[0].cookId;
        const allSameCook = items.every(item => item.cookId === firstCookId);
        if (!allSameCook) {
            setCheckoutError("Cannot checkout with items from multiple cooks in one order yet. Please create separate orders.");
            return;
        }
    }

    const orderItems: CartItemDTO[] = items.map(item => ({
      foodItemId: item.id,
      quantity: item.quantity,
    }));

    const request: PlaceOrderRequestDTO = { items: orderItems };

    placeOrder(request, {
      onSuccess: (order) => {
        clearCart();
        navigate(`/order-confirmation/${order.id}`);
        // Or navigate('/my-orders');
      },
      onError: (err) => {
         const apiError = err as ApiError;
         const message = apiError?.message || (err as any)?.response?.data?.message || 'An unexpected error occurred during checkout.';
         setCheckoutError(message);
      },
    });
  };

  // Combine mutation error with local validation errors
  const displayError = checkoutError || (error as ApiError)?.message || (error as any)?.response?.data?.message || null;

  if (items.length === 0 && !isPending) {
      // Redirect if cart becomes empty somehow, or show message
       return <div className="container mx-auto p-6 text-center">Cart is empty. <a href="/food" className="text-indigo-600">Go Shopping</a></div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 max-w-3xl">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

      {isPending && (
           <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex items-center justify-center z-50">
                <Spinner size="lg" color="text-white" />
                <span className="ml-3 text-white font-medium">Placing your order...</span>
           </div>
      )}

      {displayError && (
        <div className="mb-6 p-4 bg-red-100 border border-red-300 text-red-800 rounded-md shadow-sm">
          <p className="font-medium">Checkout Error:</p>
          <p className="text-sm">{displayError}</p>
        </div>
      )}

      <div className="md:flex md:gap-8">
          {/* Order Summary */}
          <div className="md:w-1/2 mb-8 md:mb-0">
              <Card>
                 <h2 className="text-lg font-semibold mb-4 border-b pb-2">Order Summary</h2>
                 {items.map(item => (
                     <div key={item.id} className="flex justify-between items-center text-sm py-2">
                        <span className="flex-grow pr-2">{item.name} x {item.quantity}</span>
                        <span className="font-medium flex-shrink-0">{formatPrice(item.price * item.quantity)}</span>
                     </div>
                 ))}
                 <div className="flex justify-between mt-4 pt-4 border-t font-bold text-gray-800">
                    <span>Total</span>
                    <span>{formatPrice(totalAmount)}</span>
                 </div>
              </Card>
          </div>

          {/* TODO: Delivery/Payment Section (Stubbed) */}
          <div className="md:w-1/2">
               <Card>
                  <h2 className="text-lg font-semibold mb-4">Delivery Address</h2>
                  <p className="text-sm text-gray-500 mb-4">Delivery address input will go here.</p>
                  {/* Add address form components */}

                  <h2 className="text-lg font-semibold mb-4 mt-6">Payment Method</h2>
                  <p className="text-sm text-gray-500 mb-6">Payment integration (Stripe, etc.) will go here.</p>
                  {/* Add payment components */}

                 <Button
                    variant="primary"
                    size="lg"
                    className="w-full"
                    onClick={handlePlaceOrder}
                    isLoading={isPending}
                    disabled={isPending || !!checkoutError}
                 >
                    {isPending ? 'Processing...' : 'Place Order'}
                 </Button>
              </Card>
          </div>
      </div>
    </div>
  );
};

export default CheckoutPage;