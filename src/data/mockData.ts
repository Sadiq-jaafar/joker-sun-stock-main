import { InventoryItem, User } from '@/types/inventory';

export const mockInventoryItems: InventoryItem[] = [
  {
    id: '1',
    name: 'Solar Panel 300W',
    category: 'Solar Panels',
    brand: 'SunPower',
    model: 'SP-300M',
    price: 250.00,
    cost: 180.00,
    quantity: 50,
    description: 'High-efficiency monocrystalline solar panel',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z'
  },
  {
    id: '2',
    name: 'Battery Storage 100Ah',
    category: 'Batteries',
    brand: 'Tesla',
    model: 'LFP-100',
    price: 800.00,
    cost: 600.00,
    quantity: 25,
    description: 'Lithium iron phosphate battery for solar storage',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z'
  },
  {
    id: '3',
    name: 'Inverter 5kW',
    category: 'Inverters',
    brand: 'Fronius',
    model: 'Primo-5K',
    price: 1200.00,
    cost: 900.00,
    quantity: 15,
    description: 'String inverter for residential solar systems',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z'
  },
  {
    id: '4',
    name: 'Charge Controller MPPT',
    category: 'Controllers',
    brand: 'Victron',
    model: 'SmartSolar-100/50',
    price: 300.00,
    cost: 220.00,
    quantity: 40,
    description: 'Maximum Power Point Tracking charge controller',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z'
  },
  {
    id: '5',
    name: 'LED Floodlight 50W',
    category: 'Lighting',
    brand: 'Philips',
    model: 'LED-50W-Solar',
    price: 80.00,
    cost: 55.00,
    quantity: 100,
    description: 'Solar-powered LED floodlight for outdoor use',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z'
  }
];

export const mockUsers: User[] = [
  {
    id: '1',
    name: 'John Admin',
    email: 'admin@jokersolar.com',
    role: 'admin',
    createdAt: '2024-01-01T10:00:00Z'
  },
  {
    id: '2',
    name: 'Sarah Sales',
    email: 'sarah@jokersolar.com',
    role: 'user',
    createdAt: '2024-01-05T10:00:00Z'
  },
  {
    id: '3',
    name: 'Mike Merchant',
    email: 'mike@jokersolar.com',
    role: 'user',
    createdAt: '2024-01-10T10:00:00Z'
  }
];