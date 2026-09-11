import React, { useState } from 'react';
import {
  Users,
  Search,
  Mail,
  Phone,
  MapPin,
  ShoppingCart,
  Eye,
  Calendar,
  DollarSign
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { useAdmin } from '../../context/AdminContext';
import { Order } from '../../types';

interface CustomerSummary {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  totalOrders: number;
  totalSpent: number;
  status: 'active' | 'suspended';
  lastOrderDate: string;
  orders: Order[];
}

export const AdminCustomersPage: React.FC = () => {
  const { orders } = useStore();
  const { currentAdmin } = useAdmin();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerSummary | null>(null);

  // Aggregate unique customers from orders + demo accounts
  const customerMap: Record<string, CustomerSummary> = {
    'laila.mansoor@example.com': {
      id: 'cust-1',
      name: 'Laila Al-Mansoor',
      email: 'laila.mansoor@example.com',
      phone: '+1 (555) 389-4210',
      address: '742 Evergreen Crescent, Suite 4B, New York, NY 10021, USA',
      totalOrders: 0,
      totalSpent: 0,
      status: 'active',
      lastOrderDate: 'February 18, 2026',
      orders: []
    },
    'amira.tariq@example.com': {
      id: 'cust-2',
      name: 'Amira Tariq',
      email: 'amira.tariq@example.com',
      phone: '+1 (555) 674-8890',
      address: '120 Oxford Boulevard, Chicago, IL 60611, USA',
      totalOrders: 0,
      totalSpent: 0,
      status: 'active',
      lastOrderDate: 'March 2, 2026',
      orders: []
    }
  };

  // Populate orders into customer map
  orders.forEach(ord => {
    const email = ord.customer.email.toLowerCase();
    if (!customerMap[email]) {
      customerMap[email] = {
        id: `cust-${ord.id}`,
        name: ord.customer.name,
        email: ord.customer.email,
        phone: ord.customer.phone || '+1 (555) 000-0000',
        address: `${ord.shippingAddress.addressLine1}, ${ord.shippingAddress.city}, ${ord.shippingAddress.state}`,
        totalOrders: 0,
        totalSpent: 0,
        status: 'active',
        lastOrderDate: ord.date,
        orders: []
      };
    }
    customerMap[email].totalOrders += 1;
    customerMap[email].totalSpent += ord.total;
    customerMap[email].orders.push(ord);
  });

  const customerList = Object.values(customerMap);

  const filteredCustomers = customerList.filter(c => {
    const q = searchQuery.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.phone.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 animate-in fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif tracking-tight text-charcoal font-semibold">
            Customer Directory
          </h1>
          <p className="text-xs text-charcoal/60 mt-0.5">
            Document 02 Section 13 • Customer profiles, order histories and lifetime spend.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-plum/10 text-plum">
            {customerList.length} Registered Customers
          </span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-sand/60 shadow-xs">
        <div className="relative">
          <Search className="w-4 h-4 text-charcoal/40 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search customers by full name, email, or telephone number..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-sand/80 focus:outline-none focus:ring-2 focus:ring-plum/30 bg-sand/10"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-sand/60 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-charcoal">
            <thead className="bg-sand/20 text-charcoal/70 uppercase tracking-wider text-[10px] font-semibold border-b border-sand/40">
              <tr>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-3">Contact Email & Phone</th>
                <th className="py-3.5 px-3">Orders</th>
                <th className="py-3.5 px-3">Lifetime Spend</th>
                <th className="py-3.5 px-3">Account Status</th>
                <th className="py-3.5 px-3">Latest Order</th>
                <th className="py-3.5 px-4 text-right">Profile</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sand/30">
              {filteredCustomers.map(cust => (
                <tr key={cust.id} className="hover:bg-sand/10 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-plum/10 text-plum flex items-center justify-center font-serif font-bold text-xs">
                        {cust.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-semibold text-charcoal">{cust.name}</h4>
                        <span className="text-[11px] text-charcoal/50 font-mono">ID: {cust.id}</span>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-3 whitespace-nowrap">
                    <span className="text-charcoal block text-[11px]">{cust.email}</span>
                    <span className="text-charcoal/50 font-mono text-[10px] block">
                      {cust.phone}
                    </span>
                  </td>

                  <td className="py-3.5 px-3 whitespace-nowrap font-semibold text-charcoal">
                    {cust.totalOrders} order(s)
                  </td>

                  <td className="py-3.5 px-3 whitespace-nowrap font-serif font-bold text-plum">
                    ${cust.totalSpent.toFixed(2)}
                  </td>

                  <td className="py-3.5 px-3 whitespace-nowrap">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full">
                      {cust.status}
                    </span>
                  </td>

                  <td className="py-3.5 px-3 whitespace-nowrap text-charcoal/60 text-[11px]">
                    {cust.lastOrderDate}
                  </td>

                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <button
                      onClick={() => setSelectedCustomer(cust)}
                      className="px-3 py-1.5 bg-sand/30 hover:bg-sand/70 text-plum text-xs font-semibold rounded-lg transition-colors flex items-center gap-1 ml-auto cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Detail Drawer / Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-sand shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-sand/40">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-plum text-beige flex items-center justify-center font-serif font-bold">
                  {selectedCustomer.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-charcoal">{selectedCustomer.name}</h3>
                  <p className="text-[11px] text-charcoal/60">{selectedCustomer.email}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="text-charcoal/40 hover:text-charcoal"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-sand/20 rounded-xl space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-charcoal/60">Phone:</span>
                  <span className="font-mono font-medium">{selectedCustomer.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-charcoal/60">Shipping Address:</span>
                  <span className="text-right max-w-xs">{selectedCustomer.address}</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-sand/40">
                  <span className="text-charcoal/60">Lifetime Spend:</span>
                  <span className="font-serif font-bold text-plum">${selectedCustomer.totalSpent.toFixed(2)}</span>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-charcoal mb-2">Order History ({selectedCustomer.orders.length})</h4>
                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {selectedCustomer.orders.map(ord => (
                    <div
                      key={ord.id}
                      className="p-2.5 rounded-lg border border-sand/60 bg-sand/10 flex items-center justify-between"
                    >
                      <div>
                        <span className="font-mono font-bold text-plum block">{ord.orderNumber}</span>
                        <span className="text-[10px] text-charcoal/50">{ord.date}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold font-serif block">${ord.total.toFixed(2)}</span>
                        <span className="text-[10px] uppercase font-bold text-emerald-800">{ord.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-sand/40">
              <button
                onClick={() => setSelectedCustomer(null)}
                className="px-4 py-2 bg-sand/30 hover:bg-sand/60 text-xs font-semibold text-charcoal rounded-xl cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
