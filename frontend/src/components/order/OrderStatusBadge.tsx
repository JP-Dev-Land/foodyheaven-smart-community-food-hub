import React from 'react';
import { OrderStatus } from '../../types/api';

interface StatusConfig {
  label: string;
  classes: string;
}

const STATUS_CONFIG: Record<OrderStatus, StatusConfig> = {
  PENDING:          { label: 'Pending',            classes: 'bg-yellow-100 text-yellow-800' },
  ACCEPTED:         { label: 'Accepted',           classes: 'bg-blue-100 text-blue-800'   },
  COOKING:          { label: 'Cooking',            classes: 'bg-orange-100 text-orange-800' },
  READY_FOR_PICKUP: { label: 'Ready for Pickup',   classes: 'bg-green-100 text-green-800'  },
  OUT_FOR_DELIVERY: { label: 'Out for Delivery',   classes:  'bg-yellow-100 text-black'    },
  CANCELLED:        { label: 'Cancelled',          classes: 'bg-red-100 text-red-800'      },
  DELIVERED:        { label: 'Delivered',          classes: 'bg-gray-100 text-gray-800'    },
};

type Props = {
  status: OrderStatus;
};

const OrderStatusBadge: React.FC<Props> = ({ status }) => {
  const { label, classes } = STATUS_CONFIG[status] || {
    label: status,
    classes: 'bg-gray-100 text-gray-800',
  };

  return (
    <span
      className={[
        'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold',
        classes,
      ].join(' ')}
      aria-label={`Order status: ${label}`}
      title={label}
    >
      {label}
    </span>
  );
};

export default OrderStatusBadge;
