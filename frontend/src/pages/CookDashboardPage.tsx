import React from 'react';

const CookDashboardPage: React.FC = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold">Cook Dashboard</h1>
      <p className="mt-4 text-gray-600">
        This is where you will manage your food items, view incoming orders, and update order statuses. (Content coming soon!)
      </p>
      {/* TODO: To be added links to Add Item, View Orders etc. */}
    </div>
  );
};

export default CookDashboardPage;