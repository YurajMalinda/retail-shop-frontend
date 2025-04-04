// src/components/admin/AnalyticsPanel.tsx
import React from "react";

interface Analytics {
  totalSales: number;
  orderCount: number;
  topProducts: { id: string; name: string; sales: number }[];
}

interface AnalyticsPanelProps {
  analytics: Analytics | null;
}

const AnalyticsPanel: React.FC<AnalyticsPanelProps> = ({ analytics }) => {
  if (!analytics) return <div>No analytics data available.</div>;

  return (
    <div className="mb-8">
      <h3 className="text-xl font-semibold mb-4">Analytics</h3>
      <div className="bg-white p-4 rounded-lg shadow-md">
        <p>Total Sales: ${analytics.totalSales.toFixed(2)}</p>
        <p>Order Count: {analytics.orderCount}</p>
        <h4 className="mt-2 font-medium">Top Products:</h4>
        <ul>
          {analytics.topProducts.map((prod) => (
            <li key={prod.id}>
              {prod.name} - ${prod.sales.toFixed(2)}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default AnalyticsPanel;