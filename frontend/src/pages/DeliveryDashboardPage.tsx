import React from 'react';

const DeliveryDashboardPage: React.FC = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold">Delivery Dashboard</h1>
      <p className="mt-4 text-gray-600">
        This is where you will see available deliveries to accept, manage your current deliveries, and view your delivery history. (Content coming soon!)
      </p>      
      {/* TODO: To be listed available deliveries, current delivery, etc. */}
    </div>
  );
};

export default DeliveryDashboardPage;