import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Polyline, Marker } from 'react-leaflet';
import { useWebSocket } from '../../contexts/WebSocketProvider';
import { OrderDTO, OrderStatus } from '../../types/api'; // Adjust path if needed
import Spinner from '../ui/Spinner'; // Adjust path if needed
import OrderStatusBadge from './OrderStatusBadge'; // Adjust path if needed
import { getOptimalRoute } from '../../services/orderService'; // Adjust path if needed
import L from 'leaflet'; // Import Leaflet library
import 'leaflet/dist/leaflet.css';

// Fix for default Leaflet marker icon issue with bundlers like Vite/Webpack
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl; // Delete the broken default URL getter

L.Icon.Default.mergeOptions({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
});
// --- End of Leaflet Icon Fix ---

interface OrderTrackerProps {
  orderId: number;
}

const OrderTracker: React.FC<OrderTrackerProps> = ({ orderId }) => {
  const { isConnected, subscribe, unsubscribe } = useWebSocket();
  const [order, setOrder] = useState<OrderDTO | null>(null);
  const [agentLocation, setAgentLocation] = useState<[number, number] | null>(null);
  const [routePath, setRoutePath] = useState<[number, number][]>([]);
  const [isLoading, setIsLoading] = useState(true); // Start loading initially
  const [error, setError] = useState<string | null>(null); // Optional: Add error state

  // Use refs to store the subscription identifiers (destination strings)
  const statusSubscriptionId = useRef<string | null>(null);
  const locationSubscriptionId = useRef<string | null>(null);

  // Effect for managing subscriptions
  useEffect(() => {
    // Reset state when orderId changes
    setOrder(null);
    setAgentLocation(null);
    setRoutePath([]);
    setError(null);
    setIsLoading(true);
    statusSubscriptionId.current = null; // Clear refs too
    locationSubscriptionId.current = null;

    if (!isConnected) {
        console.warn("OrderTracker: WebSocket not connected. Cannot subscribe.");
        // Optionally set an error state here
        // setError("Connection lost. Trying to reconnect...");
        // Keep loading true or set to false depending on desired UX
        setIsLoading(true); // Keep loading until connection resumes
        return; // Don't try to subscribe if not connected
    }

    console.log(`OrderTracker: Subscribing for Order ID: ${orderId}`);

    // Subscribe to Status
    const statusDest = `/topic/orders/${orderId}/status`;
    statusSubscriptionId.current = subscribe(statusDest, (message) => {
      try {
        const updatedOrder: OrderDTO = JSON.parse(message.body);
        console.log('Received Order Status Update:', updatedOrder);
        setOrder(updatedOrder);
        setError(null); // Clear error on successful message
        setIsLoading(false); // Stop loading once we have the main order data
      } catch (e) {
        console.error("Failed to parse order status message:", e, message.body);
        setError("Error processing order status update.");
        setIsLoading(false);
      }
    });

    // Subscribe to Location
    const locationDest = `/topic/orders/${orderId}/location`;
    locationSubscriptionId.current = subscribe(locationDest, (message) => {
       try {
          const location = JSON.parse(message.body);
          console.log('Received Agent Location Update:', location);
          if (location && typeof location.lat === 'number' && typeof location.lng === 'number') {
              setAgentLocation([location.lat, location.lng]);
              setError(null);
          } else {
              console.warn("Received invalid location data:", location);
          }
       } catch (e) {
          console.error("Failed to parse location message:", e, message.body);
          setError("Error processing location update.");
       }
    });

    // Cleanup function
    return () => {
      console.log(`OrderTracker Cleanup: Unsubscribing for Order ID: ${orderId}`);
      // Use the stored IDs (destination strings) from the refs
      if (statusSubscriptionId.current) {
        unsubscribe(statusSubscriptionId.current);
        statusSubscriptionId.current = null;
      }
      if (locationSubscriptionId.current) {
        unsubscribe(locationSubscriptionId.current);
        locationSubscriptionId.current = null;
      }
    };
    // Depend on orderId and the stable subscribe/unsubscribe functions, and connection status
  }, [orderId, isConnected, subscribe, unsubscribe]);

  // Effect for fetching the route (depends only on the order data)
  useEffect(() => {
    if (!order || !order.pickupLocation || !order.deliveryLocation) {
        setRoutePath([]); // Clear route if order or locations are missing
        return;
    }

    // Avoid refetching if route already exists for the current order
    if (routePath.length > 0) {
        return;
    }

    const fetchRoute = async () => {
      console.log('Fetching optimal route...');
      try {
        const pickupCoords = order.pickupLocation
          ? `${order.pickupLocation.latitude},${order.pickupLocation.longitude}`
          : '';
        const deliveryCoords = order.deliveryLocation
          ? `${order.deliveryLocation.latitude},${order.deliveryLocation.longitude}`
          : '';

        const result = await getOptimalRoute(pickupCoords, deliveryCoords);

        if (result?.routes?.[0]?.geometry?.coordinates) {
          // OSRM returns [longitude, latitude], Leaflet needs [latitude, longitude]
          const path = result.routes[0].geometry.coordinates.map((coord: [number, number]) => [coord[1], coord[0]]);
          setRoutePath(path);
          console.log('Route fetched successfully.');
        } else {
             console.warn('Received no valid route geometry:', result);
             setRoutePath([]); // Ensure route is empty if fetch fails
        }
      } catch (fetchError) {
        console.error('Failed to fetch route:', fetchError);
        setError('Could not load the delivery route.');
        setRoutePath([]); // Ensure route is empty on error
      }
    };

    fetchRoute();
    // Re-run only if the order object changes (specifically location data potentially)
  }, [order]); // Depend on the order state

  // --- Render Logic ---

  if (isLoading) {
      return <Spinner />;
  }

  if (error) {
      // Display error message if something went wrong (optional)
      return <div className="text-red-600 p-4">{error}</div>;
  }

  if (!order) {
      // This case might be hit briefly or if the first status message hasn't arrived
      return <Spinner />;
  }

  // Determine map center and zoom
  const mapCenter: [number, number] = agentLocation
        ? agentLocation
        : order.deliveryLocation
        ? [order.deliveryLocation.latitude, order.deliveryLocation.longitude]
        : order.pickupLocation
        ? [order.pickupLocation.latitude, order.pickupLocation.longitude]
        : [0, 0]; // Absolute fallback

   const mapZoom = agentLocation || order.deliveryLocation || order.pickupLocation ? 13 : 2;

  return (
    <div className="order-tracker p-4 border rounded shadow-md">
      <h2 className="text-xl font-semibold mb-4">Order Tracker</h2>
      <div className="mb-4 space-y-1">
        <p><span className="font-medium">Order ID:</span> {order.id}</p>
        <div><span className="font-medium">Status:</span> <OrderStatusBadge status={order.status} /></div>
        {/* Add more details as needed */}
        {/* <p><span className="font-medium">Agent:</span> {order.deliveryAgentName || 'N/A'}</p> */}
      </div>

      {/* Map Container */}
      <div className="map-container border" style={{ height: '400px', width: '100%' }}>
        <MapContainer
           key={orderId} // Force remount when orderId changes to reset map state
           center={mapCenter}
           zoom={mapZoom}
           style={{ height: '100%', width: '100%' }}
           scrollWheelZoom={true} // Enable scroll wheel zoom
         >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />

          {/* Marker for Pickup Location */}
          {order.pickupLocation && (
              <Marker position={[order.pickupLocation.latitude, order.pickupLocation.longitude]}>
                  {/* Add a popup or tooltip */}
                  {/* <Popup>Pickup: {order.pickupAddress || 'Location'}</Popup> */}
              </Marker>
          )}

          {/* Marker for Delivery Location */}
          {order.deliveryLocation && (
              <Marker position={[order.deliveryLocation.latitude, order.deliveryLocation.longitude]}>
                   {/* <Popup>Delivery: {order.deliveryAddress || 'Location'}</Popup> */}
              </Marker>
          )}

          {/* Marker for Agent Location */}
          {agentLocation && (
             <Marker
                position={agentLocation}
                // Optional: Use a different icon for the agent
                // icon={yourCustomAgentIcon}
             >
                 {/* <Popup>Agent Location</Popup> */}
             </Marker>
          )}

          {/* Polyline for the Route */}
          {routePath.length > 0 && (
            <Polyline positions={routePath} pathOptions={{ color: 'blue', weight: 5, opacity: 0.7 }} />
          )}
        </MapContainer>
      </div>
    </div>
  );
};

export default OrderTracker;