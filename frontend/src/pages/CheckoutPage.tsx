import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { usePlaceOrder } from '../services/orderService';
import { PlaceOrderRequestDTO, CartItemDTO, ApiError, Coordinates } from '../types/api'; // Assuming LocationDTO exists in your types
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';
import { formatPrice } from '../utils/formatters';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet'; // Import Leaflet library itself for types if needed and icon fix
import 'leaflet/dist/leaflet.css';

// Fix Default Icon Issue with Leaflet + Webpack/React
// (See: https://github.com/PaulLeCam/react-leaflet/issues/453)
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
});
// --- End Icon Fix ---

// Define internal types or import if shared
interface LocationState {
  latitude: string | number; // Keep string for input flexibility, convert for usage
  longitude: string | number;
  street: string;
  city: string;
  postalCode: string;
}

interface GeocodingResponse {
  address: {
    road?: string;
    city?: string;
    town?: string;    // Added town/village as fallbacks
    village?: string;
    postcode?: string;
    // Add country, county etc. if needed
  };
  lat?: string; // Nominatim returns lat/lon as strings
  lon?: string;
  display_name?: string; // Useful for confirmation
}

const LocationPicker: React.FC<{ location: LocationState; setLocation: React.Dispatch<React.SetStateAction<LocationState>> }> = ({ location, setLocation }) => {

  useMapEvents({
    click: (e: L.LeafletMouseEvent) => { // Use Leaflet's type for the event
      const { lat, lng } = e.latlng;
      // Set numeric lat/lng immediately
      setLocation((prev) => ({ ...prev, latitude: lat, longitude: lng }));

      // Fetch address using Nominatim
      fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&addressdetails=1`) // Use jsonv2 for cleaner structure
        .then((response) => {
            if (!response.ok) {
                throw new Error(`Geocoding failed: ${response.statusText}`);
            }
            return response.json();
        })
        .then((data: GeocodingResponse) => {
          setLocation((prev: LocationState) => ({
            ...prev,
            street: data.address?.road || prev.street || '', // Keep existing if API doesn't provide
            city: data.address?.city || data.address?.town || data.address?.village || prev.city || '',
            postalCode: data.address?.postcode || prev.postalCode || '',
          }));
        })
        .catch((error: unknown) => {
            console.error('Error fetching address:', error);
            // Optionally: provide feedback to the user that geocoding failed
        });
    },
  });

  // Ensure latitude and longitude are valid numbers before rendering Marker
  const lat = Number(location.latitude);
  const lng = Number(location.longitude);
  const isValidPosition = !isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0; // Check if valid numbers and not default 0,0 (unless 0,0 is valid)


  return isValidPosition ? (
    <Marker position={[lat, lng]} />
  ) : null;
};

// SetView component is removed

const CheckoutPage: React.FC = () => {
  const { items, totalAmount, clearCart } = useCart();
  const navigate = useNavigate();
  const { mutate: placeOrder, isPending, error } = usePlaceOrder();
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  // Initial state with empty strings for input fields
  const initialLocationState: LocationState = { latitude: '', longitude: '', street: '', city: '', postalCode: '' };
  const [pickupLocation, setPickupLocation] = useState<LocationState>(initialLocationState);
  const [deliveryLocation, setDeliveryLocation] = useState<LocationState>(initialLocationState);

  const handleInputChange = (
    setter: React.Dispatch<React.SetStateAction<LocationState>>,
    field: keyof LocationState,
    value: string
  ) => {
    // No parsing here, keep as string for input flexibility
    setter((prev) => ({ ...prev, [field]: value }));
  };

  const handlePlaceOrder = () => {
    setCheckoutError(null);

    if (items.length === 0) {
        setCheckoutError("Your cart is empty.");
        return;
    }

    // Validation: Ensure all items are from the same cook
    if (items.length > 0) { // Check only if items exist
        const firstCookId = items[0].cookId;
        const allSameCook = items.every(item => item.cookId === firstCookId);
        if (!allSameCook) {
            setCheckoutError("Cannot checkout with items from multiple cooks in one order yet. Please create separate orders.");
            return;
        }
    }

    // Validate and parse locations
    const parsedPickupLat = parseFloat(String(pickupLocation.latitude));
    const parsedPickupLng = parseFloat(String(pickupLocation.longitude));
    const parsedDeliveryLat = parseFloat(String(deliveryLocation.latitude));
    const parsedDeliveryLng = parseFloat(String(deliveryLocation.longitude));

    if (isNaN(parsedPickupLat) || isNaN(parsedPickupLng) || isNaN(parsedDeliveryLat) || isNaN(parsedDeliveryLng)) {
      setCheckoutError("Please provide valid numeric coordinates for both pickup and delivery locations. You can click on the map to set them.");
      return;
    }
    if (!pickupLocation.street || !pickupLocation.city || !deliveryLocation.street || !deliveryLocation.city ) {
        setCheckoutError("Please provide street and city for both pickup and delivery addresses.");
        return;
    }

    const orderItems: CartItemDTO[] = items.map(item => ({
      foodItemId: item.id,
      quantity: item.quantity,
    }));

    // Use LocationDTO if defined, otherwise inline the structure
    const pickupLocationDTO: Coordinates = {
        latitude: parsedPickupLat,
        longitude: parsedPickupLng,
        street: pickupLocation.street,
        city: pickupLocation.city,
        postalCode: pickupLocation.postalCode, // Postal code is optional usually
    };

    const deliveryLocationDTO: Coordinates = {
        latitude: parsedDeliveryLat,
        longitude: parsedDeliveryLng,
        street: deliveryLocation.street,
        city: deliveryLocation.city,
        postalCode: deliveryLocation.postalCode, // Postal code is optional
    };

    const request: PlaceOrderRequestDTO = {
      items: orderItems,
      pickupLocation: pickupLocationDTO,
      deliveryLocation: deliveryLocationDTO
    };

    placeOrder(request, {
      onSuccess: (order) => {
        clearCart();
        navigate(`/order-details/${order.id}`);
      },
      onError: (err) => {
         // Improved error handling
         let message = 'An unexpected error occurred during checkout.';
         if (err instanceof Error) {
             message = (err as ApiError)?.message || err.message; // Prioritize ApiError message
         }
         // Check for specific response structure if available (common with axios errors)
         const responseData = (err as any)?.response?.data;
         if (responseData && responseData.message) {
             message = responseData.message;
         } else if (responseData && Array.isArray(responseData.errors)) {
             // Handle validation errors if backend returns them this way
             message = responseData.errors.map((e: any) => e.msg || e.message).join(', ');
         }
         setCheckoutError(message);
      },
    });
  };

  // Combine mutation error with local validation errors
   const displayError = checkoutError || (error ? ((error as ApiError)?.message || (error as any)?.response?.data?.message || (error as Error).message || 'An error occurred') : null);


  useEffect(() => {
      // Clear checkout error if cart becomes empty or mutation state changes
      if (items.length === 0 || !isPending) {
          // Don't clear if there's a persistent error from the mutation result
          if(!error) {
              setCheckoutError(null);
          }
      }
  }, [items, isPending, error]);


  if (items.length === 0 && !isPending && !displayError) {
      // Redirect or show message only if cart is empty AND no pending/error state
       return <div className="container mx-auto p-6 text-center">Your cart is empty. <a href="/food" className="text-indigo-600 hover:text-indigo-800">Go Shopping</a></div>;
  }

  const defaultCenter: L.LatLngExpression = [51.505, -0.09]; // Use Leaflet's LatLngExpression type
  const defaultZoom = 13;

  // Helper function to get map center based on location state
  const getMapCenter = (location: LocationState): L.LatLngExpression => {
    const lat = Number(location.latitude);
    const lng = Number(location.longitude);
    if (!isNaN(lat) && !isNaN(lng) && (lat !== 0 || lng !== 0)) {
      return [lat, lng];
    }
    return defaultCenter;
  };

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 max-w-4xl"> {/* Increased max-width */}
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Order Summary Column */}
          <div>
              <Card className="mb-8">
                 <h2 className="text-xl font-semibold mb-4 border-b pb-2 text-gray-800">Order Summary</h2>
                 {items.map(item => (
                     <div key={item.id} className="flex justify-between items-center text-sm py-2">
                        <span className="flex-grow pr-2">{item.name} <span className="text-gray-500">x {item.quantity}</span></span>
                        <span className="font-medium flex-shrink-0">{formatPrice(item.price * item.quantity)}</span>
                     </div>
                 ))}
                 <div className="flex justify-between mt-4 pt-4 border-t font-bold text-gray-900 text-base">
                    <span>Total</span>
                    <span>{formatPrice(totalAmount)}</span>
                 </div>
              </Card>

              <Card>
                  <h2 className="text-xl font-semibold mb-4 text-gray-800">Payment Method</h2>
                  {/* Placeholder for Payment */}
                  <div className="p-4 border border-dashed border-gray-300 rounded-md bg-gray-50 text-center">
                     <p className="text-sm text-gray-500">Payment integration (e.g., Stripe Elements) will be added here.</p>
                     {/* Example: Button to Proceed to Payment if needed */}
                     {/* <Button variant="secondary" className="mt-4">Proceed to Payment</Button> */}
                  </div>
              </Card>
          </div>

          {/* Location Column */}
          <div>
              <Card className="mb-8">
                  <h2 className="text-xl font-semibold mb-4 text-gray-800">Pickup Location</h2>
                   <p className="text-xs text-gray-500 mb-3">Enter address details or click on the map to set coordinates and fetch address.</p>

                   {/* Address Fields */}
                   <div className="mb-4">
                      <label htmlFor="pickup-street" className="block mb-1 text-sm font-medium text-gray-700">Street</label>
                      <input
                        id="pickup-street"
                        type="text"
                        value={pickupLocation.street}
                        onChange={(e) => handleInputChange(setPickupLocation, 'street', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md"
                        placeholder="e.g., 123 Main St"
                      />
                   </div>
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                       <div>
                         <label htmlFor="pickup-city" className="block mb-1 text-sm font-medium text-gray-700">City</label>
                         <input
                           id="pickup-city"
                           type="text"
                           value={pickupLocation.city}
                           onChange={(e) => handleInputChange(setPickupLocation, 'city', e.target.value)}
                           className="w-full p-2 border border-gray-300 rounded-md"
                           placeholder="e.g., London"
                         />
                       </div>
                       <div>
                         <label htmlFor="pickup-postal" className="block mb-1 text-sm font-medium text-gray-700">Postal Code</label>
                         <input
                           id="pickup-postal"
                           type="text"
                           value={pickupLocation.postalCode}
                           onChange={(e) => handleInputChange(setPickupLocation, 'postalCode', e.target.value)}
                           className="w-full p-2 border border-gray-300 rounded-md"
                           placeholder="e.g., SW1A 0AA"
                         />
                       </div>
                   </div>
                   {/* Lat/Lng Fields (Optional display/manual entry) */}
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                       <div>
                         <label htmlFor="pickup-lat" className="block mb-1 text-sm font-medium text-gray-700">Latitude</label>
                         <input
                           id="pickup-lat"
                           type="text" // Use text for easier input, parse on submit
                           value={pickupLocation.latitude}
                           onChange={(e) => handleInputChange(setPickupLocation, 'latitude', e.target.value)}
                           className="w-full p-2 border border-gray-300 rounded-md"
                           placeholder="Auto-filled by map click"
                         />
                       </div>
                       <div>
                         <label htmlFor="pickup-lng" className="block mb-1 text-sm font-medium text-gray-700">Longitude</label>
                         <input
                           id="pickup-lng"
                           type="text"
                           value={pickupLocation.longitude}
                           onChange={(e) => handleInputChange(setPickupLocation, 'longitude', e.target.value)}
                           className="w-full p-2 border border-gray-300 rounded-md"
                           placeholder="Auto-filled by map click"
                         />
                       </div>
                   </div>

                  {/* Pickup Map */}
                  <div className="h-64 w-full mb-4 rounded overflow-hidden border border-gray-300">
                      <MapContainer
                          key={`pickup-map-${getMapCenter(pickupLocation).toString()}`} // Add key to force remount if center changes significantly
                          style={{ height: '100%', width: '100%' }}
                          center={getMapCenter(pickupLocation)} // Use dynamic center
                          zoom={defaultZoom}
                          scrollWheelZoom={false} // Consider disabling scroll zoom
                          attributionControl={true}
                      >
                          <TileLayer
                          attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                          />
                          <LocationPicker location={pickupLocation} setLocation={setPickupLocation} />
                      </MapContainer>
                  </div>
              </Card>

              <Card>
                  <h2 className="text-xl font-semibold mb-4 text-gray-800">Delivery Location</h2>
                  <p className="text-xs text-gray-500 mb-3">Enter address details or click on the map.</p>

                  {/* Address Fields */}
                   <div className="mb-4">
                      <label htmlFor="delivery-street" className="block mb-1 text-sm font-medium text-gray-700">Street</label>
                      <input
                        id="delivery-street"
                        type="text"
                        value={deliveryLocation.street}
                        onChange={(e) => handleInputChange(setDeliveryLocation, 'street', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md"
                        placeholder="e.g., 456 Delivery Ave"
                      />
                   </div>
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                       <div>
                         <label htmlFor="delivery-city" className="block mb-1 text-sm font-medium text-gray-700">City</label>
                         <input
                           id="delivery-city"
                           type="text"
                           value={deliveryLocation.city}
                           onChange={(e) => handleInputChange(setDeliveryLocation, 'city', e.target.value)}
                           className="w-full p-2 border border-gray-300 rounded-md"
                           placeholder="e.g., Manchester"
                         />
                       </div>
                       <div>
                         <label htmlFor="delivery-postal" className="block mb-1 text-sm font-medium text-gray-700">Postal Code</label>
                         <input
                           id="delivery-postal"
                           type="text"
                           value={deliveryLocation.postalCode}
                           onChange={(e) => handleInputChange(setDeliveryLocation, 'postalCode', e.target.value)}
                           className="w-full p-2 border border-gray-300 rounded-md"
                           placeholder="e.g., M1 1AA"
                         />
                       </div>
                   </div>
                   {/* Lat/Lng Fields */}
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                       <div>
                         <label htmlFor="delivery-lat" className="block mb-1 text-sm font-medium text-gray-700">Latitude</label>
                         <input
                           id="delivery-lat"
                           type="text"
                           value={deliveryLocation.latitude}
                           onChange={(e) => handleInputChange(setDeliveryLocation, 'latitude', e.target.value)}
                           className="w-full p-2 border border-gray-300 rounded-md"
                           placeholder="Auto-filled by map click"
                         />
                       </div>
                       <div>
                         <label htmlFor="delivery-lng" className="block mb-1 text-sm font-medium text-gray-700">Longitude</label>
                         <input
                           id="delivery-lng"
                           type="text"
                           value={deliveryLocation.longitude}
                           onChange={(e) => handleInputChange(setDeliveryLocation, 'longitude', e.target.value)}
                           className="w-full p-2 border border-gray-300 rounded-md"
                           placeholder="Auto-filled by map click"
                         />
                       </div>
                   </div>

                   {/* Delivery Map */}
                  <div className="h-64 w-full mb-6 rounded overflow-hidden border border-gray-300">
                       <MapContainer
                          key={`delivery-map-${getMapCenter(deliveryLocation).toString()}`}
                          style={{ height: '100%', width: '100%' }}
                          center={getMapCenter(deliveryLocation)}
                          zoom={defaultZoom}
                          scrollWheelZoom={false}
                          attributionControl={true}
                      >
                          <TileLayer
                          attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                          />
                          <LocationPicker location={deliveryLocation} setLocation={setDeliveryLocation} />
                      </MapContainer>
                  </div>

                 <Button
                    variant="primary"
                    size="lg"
                    className="w-full"
                    onClick={handlePlaceOrder}
                    isLoading={isPending}
                    disabled={isPending || items.length === 0 || !!displayError } // Disable if pending, empty cart, or error exists
                 >
                    {isPending ? 'Processing...' : `Place Order (${formatPrice(totalAmount)})`}
                 </Button>
              </Card>
          </div>
      </div>
    </div>
  );
};

export default CheckoutPage;