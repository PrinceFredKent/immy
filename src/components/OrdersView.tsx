import React, { useState } from 'react';
import { 
  Clock, 
  RotateCcw, 
  Receipt, 
  ReceiptText,
  Compass, 
  ShoppingBag, 
  ArrowRight,
  CheckCircle2,
  PackageCheck,
  Truck,
  Phone,
  User,
  MapPin,
  Search,
  ChevronDown,
  ChevronUp,
  Mail,
  ShieldCheck,
  TrendingUp,
  Users,
  XCircle,
  AlertTriangle,
  Layers,
  X,
  MessageSquare,
  Ban
} from 'lucide-react';
import { Order, UserRole, DeliveryStatus } from '../types';
import { formatCurrency } from '../utils/formatters';
import { getWhatsAppOrderLink, getAdminDispatchSettings } from '../lib/dispatchService';

interface OrdersViewProps {
  orders: Order[];
  activeOrder: Order | null;
  userRole?: UserRole;
  onTrackOrder: (order: Order) => void;
  onViewReceipt: (order: Order) => void;
  onReorder: (order: Order) => void;
  onBrowseMenu: () => void;
  onUpdateOrderStatus?: (orderId: string, newStatus: DeliveryStatus) => void;
  onCancelOrder?: (orderId: string) => void;
}

interface CustomerGroup {
  name: string;
  phone: string;
  email: string;
  address: string;
  totalSpend: number;
  orders: Order[];
}

export const OrdersView: React.FC<OrdersViewProps> = ({
  orders,
  activeOrder,
  userRole = 'customer',
  onTrackOrder,
  onViewReceipt,
  onReorder,
  onBrowseMenu,
  onUpdateOrderStatus,
  onCancelOrder,
}) => {
  const [adminTab, setAdminTab] = useState<'pending' | 'delivered' | 'canceled' | 'all'>('pending');
  const [customerTab, setCustomerTab] = useState<'all' | 'pending' | 'delivered' | 'canceled'>('all');
  const [adminSearch, setAdminSearch] = useState('');
  const [orderToCancel, setOrderToCancel] = useState<Order | null>(null);
  const [expandedCustomers, setExpandedCustomers] = useState<Record<string, boolean>>({});

  const pendingOrders = orders.filter((o) => o.status !== 'delivered' && o.status !== 'cancelled');
  const deliveredOrders = orders.filter((o) => o.status === 'delivered');
  const cancelledOrders = orders.filter((o) => o.status === 'cancelled');

  // Filter orders for Admin View according to active adminTab
  const ordersForAdmin = orders.filter((order) => {
    if (adminTab === 'pending') {
      return order.status !== 'delivered' && order.status !== 'cancelled';
    }
    if (adminTab === 'delivered') {
      return order.status === 'delivered';
    }
    if (adminTab === 'canceled') {
      return order.status === 'cancelled';
    }
    return true;
  });

  // Group orders by customer for the Admin Side
  const customerMap = new Map<string, CustomerGroup>();

  ordersForAdmin.forEach((order) => {
    const custName = (order.customerName && order.customerName.trim()) || 'Guest Customer';
    const custPhone = order.customerPhone || 'N/A';
    const custEmail = order.customerEmail || '';
    const custAddr = order.deliveryAddress?.street || 'Pick up / Local Delivery';

    if (!customerMap.has(custName)) {
      customerMap.set(custName, {
        name: custName,
        phone: custPhone,
        email: custEmail,
        address: custAddr,
        totalSpend: 0,
        orders: [],
      });
    }

    const group = customerMap.get(custName)!;
    group.orders.push(order);
    group.totalSpend += order.total;
    // Always keep phone/address up to date
    if (order.customerPhone) group.phone = order.customerPhone;
    if (order.customerEmail) group.email = order.customerEmail;
    if (order.deliveryAddress?.street) group.address = order.deliveryAddress.street;
  });

  const customerList = Array.from(customerMap.values());

  const filteredCustomers = customerList.filter((c) => {
    const q = adminSearch.toLowerCase().trim();
    if (!q) return true;
    return (
      c.name.toLowerCase().includes(q) ||
      c.phone.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.orders.some((o) => o.orderNumber.toLowerCase().includes(q))
    );
  });

  const toggleCustomerExpand = (name: string) => {
    setExpandedCustomers((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));
  };

  const getStatusBadge = (status: DeliveryStatus) => {
    switch (status) {
      case 'placed':
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold">
            Order Placed
          </span>
        );
      case 'brewing':
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[10px] font-bold">
            Preparing
          </span>
        );
      case 'packaged':
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 text-[10px] font-bold flex items-center gap-1">
            <PackageCheck className="w-3 h-3" />
            <span>Packaged & Sealed</span>
          </span>
        );
      case 'on_the_way':
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-bold flex items-center gap-1">
            <Truck className="w-3 h-3" />
            <span>On The Way</span>
          </span>
        );
      case 'delivered':
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>Delivered</span>
          </span>
        );
      case 'cancelled':
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-bold flex items-center gap-1">
            <XCircle className="w-3 h-3" />
            <span>Cancelled</span>
          </span>
        );
    }
  };

  // ==========================================
  // ADMIN VIEW: CUSTOMERS WITH ORDER HISTORIES
  // ==========================================
  if (userRole === 'admin') {
    const totalOrdersCount = orders.length;

    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        
        {/* Admin Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center gap-1.5">
                <ShieldCheck className="w-3 h-3 text-amber-400" />
                Admin Orders Management
              </span>
            </div>
            <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-white tracking-tight">
              Customers & Order History
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">
              Review customer records, track active dispatches, and manage canceled orders
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs flex-wrap">
            <div className="px-3 py-2 rounded-2xl bg-white/5 border border-white/10 text-center">
              <span className="text-zinc-400 block text-[10px] uppercase">Customers</span>
              <span className="font-bold text-white text-sm">{customerList.length}</span>
            </div>
            <button 
              type="button"
              onClick={() => setAdminTab('pending')}
              className={`px-3 py-2 rounded-2xl border text-center transition-all ${
                adminTab === 'pending'
                  ? 'bg-amber-500/20 border-amber-500/50 shadow-md shadow-amber-500/10'
                  : 'bg-white/5 border-white/10 hover:border-amber-500/30'
              }`}
            >
              <span className="text-zinc-400 block text-[10px] uppercase">Pending</span>
              <span className="font-bold text-amber-400 text-sm">{pendingOrders.length}</span>
            </button>
            <button 
              type="button"
              onClick={() => setAdminTab('delivered')}
              className={`px-3 py-2 rounded-2xl border text-center transition-all ${
                adminTab === 'delivered'
                  ? 'bg-emerald-500/20 border-emerald-500/50 shadow-md shadow-emerald-500/10'
                  : 'bg-white/5 border-white/10 hover:border-emerald-500/30'
              }`}
            >
              <span className="text-zinc-400 block text-[10px] uppercase">Delivered</span>
              <span className="font-bold text-emerald-400 text-sm">{deliveredOrders.length}</span>
            </button>
            <button 
              type="button"
              onClick={() => setAdminTab('canceled')}
              className={`px-3 py-2 rounded-2xl border text-center transition-all ${
                adminTab === 'canceled'
                  ? 'bg-rose-500/20 border-rose-500/50 shadow-md shadow-rose-500/10'
                  : cancelledOrders.length > 0
                  ? 'bg-rose-500/10 border-rose-500/30 hover:border-rose-500/50'
                  : 'bg-white/5 border-white/10'
              }`}
            >
              <span className="text-zinc-400 block text-[10px] uppercase">Canceled</span>
              <span className="font-bold text-rose-400 text-sm">{cancelledOrders.length}</span>
            </button>
          </div>
        </div>

        {/* Primary Tabs for Admin Orders: Pending, Delivered, Canceled, All */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-1.5 rounded-2xl bg-[#13161c] border border-white/10 shadow-lg">
          {/* Tab 1: Pending */}
          <button
            type="button"
            id="admin-tab-pending"
            onClick={() => setAdminTab('pending')}
            className={`relative px-4 py-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
              adminTab === 'pending'
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-black shadow-lg shadow-amber-500/25 font-black'
                : 'text-zinc-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Clock className="w-4 h-4 shrink-0" />
            <span>Pending</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[11px] font-black ${
                adminTab === 'pending'
                  ? 'bg-black/25 text-black'
                  : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
              }`}
            >
              {pendingOrders.length}
            </span>
            {pendingOrders.some((o) => o.status === 'placed') && (
              <span className="absolute top-2 right-2 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500" />
              </span>
            )}
          </button>

          {/* Tab 2: Delivered */}
          <button
            type="button"
            id="admin-tab-delivered"
            onClick={() => setAdminTab('delivered')}
            className={`px-4 py-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
              adminTab === 'delivered'
                ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-black shadow-lg shadow-emerald-500/25 font-black'
                : 'text-zinc-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Delivered</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[11px] font-black ${
                adminTab === 'delivered'
                  ? 'bg-black/25 text-black'
                  : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
              }`}
            >
              {deliveredOrders.length}
            </span>
          </button>

          {/* Tab 3: Canceled */}
          <button
            type="button"
            id="admin-tab-canceled"
            onClick={() => setAdminTab('canceled')}
            className={`relative px-4 py-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
              adminTab === 'canceled'
                ? 'bg-gradient-to-r from-rose-500 to-rose-600 text-white shadow-lg shadow-rose-500/25 font-black'
                : 'text-zinc-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <XCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>Canceled</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[11px] font-black ${
                adminTab === 'canceled'
                  ? 'bg-black/40 text-white'
                  : cancelledOrders.length > 0
                  ? 'bg-rose-500/25 text-rose-300 border border-rose-500/40'
                  : 'bg-white/5 text-zinc-400'
              }`}
            >
              {cancelledOrders.length}
            </span>
            {cancelledOrders.length > 0 && adminTab !== 'canceled' && (
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            )}
          </button>

          {/* Tab 4: All Orders */}
          <button
            type="button"
            id="admin-tab-all"
            onClick={() => setAdminTab('all')}
            className={`px-4 py-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
              adminTab === 'all'
                ? 'bg-white text-black shadow-lg font-black'
                : 'text-zinc-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Layers className="w-4 h-4 shrink-0" />
            <span>All Orders</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[11px] font-black ${
                adminTab === 'all'
                  ? 'bg-black/20 text-black'
                  : 'bg-white/5 text-zinc-400 border border-white/10'
              }`}
            >
              {totalOrdersCount}
            </span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search customer name, phone number (e.g. 0752619129), or order number..."
            value={adminSearch}
            onChange={(e) => setAdminSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                (e.target as HTMLInputElement).blur();
              }
            }}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-black/40 border border-white/10 text-white placeholder:text-zinc-500 text-xs focus:outline-none focus:border-amber-500 transition-colors"
          />
        </div>

        {/* Customer Groups */}
        {filteredCustomers.length === 0 ? (
          <div className="p-10 rounded-3xl bg-[#13161e] border border-white/10 text-center space-y-3">
            {adminTab === 'canceled' ? (
              <>
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-white text-base">No Canceled Orders</h3>
                <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                  All customer orders are currently active or successfully fulfilled. Canceled orders will appear here automatically.
                </p>
              </>
            ) : adminTab === 'pending' ? (
              <>
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
                  <Clock className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-white text-base">No Pending Orders</h3>
                <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                  Kitchen is all caught up! When a customer places a new order, it will appear here in real-time.
                </p>
              </>
            ) : adminTab === 'delivered' ? (
              <>
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                  <PackageCheck className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-white text-base">No Delivered Orders Yet</h3>
                <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                  Orders marked as delivered will be archived here.
                </p>
              </>
            ) : (
              <>
                <User className="w-10 h-10 text-zinc-600 mx-auto" />
                <h3 className="font-bold text-white text-base">No Customers Found</h3>
                <p className="text-xs text-zinc-400">No customer matches the search term "{adminSearch}".</p>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {filteredCustomers.map((customer, custIdx) => {
              const isExpanded = expandedCustomers[customer.name] !== false;
              const pendingCount = customer.orders.filter((o) => o.status !== 'delivered' && o.status !== 'cancelled').length;
              const canceledCount = customer.orders.filter((o) => o.status === 'cancelled').length;

              return (
                <div
                  key={customer.name}
                  id={`admin-customer-group-${custIdx}`}
                  className="rounded-3xl bg-[#13161e] border border-white/10 overflow-hidden shadow-2xl transition-all"
                >
                  {/* Customer Header Bar */}
                  <div
                    onClick={() => toggleCustomerExpand(customer.name)}
                    className="p-5 bg-gradient-to-r from-white/[0.04] to-transparent flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:bg-white/[0.06] transition-colors"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-300 font-display font-extrabold text-lg shrink-0 shadow-lg shadow-amber-500/10">
                        {customer.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-display font-bold text-base sm:text-lg text-white">
                            {customer.name}
                          </h3>
                          <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-white/10 text-zinc-300 font-semibold">
                            {customer.orders.length} {customer.orders.length === 1 ? 'order' : 'orders'}
                          </span>
                          {pendingCount > 0 && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold animate-pulse">
                              {pendingCount} active
                            </span>
                          )}
                          {canceledCount > 0 && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold">
                              {canceledCount} canceled
                            </span>
                          )}
                        </div>

                        {/* Customer Contact & Address Details */}
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-zinc-400">
                          <a
                            href={`tel:${customer.phone}`}
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-mono font-bold hover:underline"
                            title="Call Customer"
                          >
                            <Phone className="w-3 h-3 text-emerald-400" />
                            <span>{customer.phone}</span>
                          </a>

                          <span className="hidden sm:inline text-zinc-600">·</span>

                          <span className="inline-flex items-center gap-1 text-zinc-300">
                            <Mail className="w-3 h-3 text-zinc-400" />
                            <span>{customer.email}</span>
                          </span>

                          <span className="hidden sm:inline text-zinc-600">·</span>

                          <span className="inline-flex items-center gap-1 text-zinc-400">
                            <MapPin className="w-3 h-3 text-amber-400" />
                            <span>{customer.address}</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
                      <div className="text-left sm:text-right">
                        <span className="text-[10px] text-zinc-400 uppercase tracking-wider block">
                          Total Value
                        </span>
                        <span className="font-display font-extrabold text-amber-400 text-base sm:text-lg">
                          {formatCurrency(customer.totalSpend)}
                        </span>
                      </div>

                      <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-zinc-400">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    </div>
                  </div>

                  {/* Customer Order History List */}
                  {isExpanded && (
                    <div className="p-4 sm:p-5 border-t border-white/10 space-y-3 bg-black/20">
                      <div className="flex items-center justify-between text-xs text-zinc-400 px-1 pb-1">
                        <span className="font-semibold text-zinc-300">
                          {adminTab === 'canceled'
                            ? `Canceled Orders (${customer.orders.length})`
                            : adminTab === 'pending'
                            ? `Pending Orders (${customer.orders.length})`
                            : adminTab === 'delivered'
                            ? `Delivered Orders (${customer.orders.length})`
                            : `Order History (${customer.orders.length} records)`}
                        </span>
                        <span className="text-[11px] text-zinc-500">
                          Click receipt for tax & customer invoice
                        </span>
                      </div>

                      {customer.orders.map((order) => {
                        const isCancelled = order.status === 'cancelled';
                        const isDelivered = order.status === 'delivered';

                        return (
                          <div
                            key={order.id}
                            className={`p-4 rounded-2xl border space-y-3 transition-all ${
                              isCancelled
                                ? 'bg-rose-950/20 border-rose-500/30 hover:border-rose-500/50'
                                : 'bg-white/5 border-white/5 hover:border-white/15'
                            }`}
                          >
                            {/* Cancellation Alert Banner */}
                            {isCancelled && (
                              <div className="flex items-center justify-between flex-wrap gap-2.5 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-200">
                                <div className="flex items-center gap-2">
                                  <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                                  <div>
                                    <span className="font-bold text-xs uppercase tracking-wide">
                                      Order Cancelled by Customer
                                    </span>
                                    <p className="text-[11px] text-rose-300/80">
                                      Kitchen preparation and courier dispatch have been stopped.
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  {order.customerPhone && (
                                    <a
                                      href={`tel:${order.customerPhone}`}
                                      className="px-2.5 py-1 rounded-lg bg-rose-500/25 hover:bg-rose-500/35 text-rose-100 text-[11px] font-bold flex items-center gap-1 transition-colors"
                                    >
                                      <Phone className="w-3 h-3" />
                                      <span>Call Customer</span>
                                    </a>
                                  )}
                                  {onUpdateOrderStatus && (
                                    <button
                                      type="button"
                                      onClick={() => onUpdateOrderStatus(order.id, 'placed')}
                                      className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[11px] font-bold flex items-center gap-1 transition-colors"
                                      title="Reactivate this order back into placed queue"
                                    >
                                      <RotateCcw className="w-3 h-3" />
                                      <span>Reactivate</span>
                                    </button>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Order sub-header */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-bold text-white text-xs sm:text-sm">
                                  #{order.orderNumber}
                                </span>
                                <span className="text-xs text-zinc-400">· {order.createdAt}</span>
                                <span className="text-[11px] text-zinc-500">
                                  ({order.items.reduce((s, i) => s + i.quantity, 0)} items)
                                </span>
                              </div>

                              <div className="flex items-center gap-2">
                                <div>{getStatusBadge(order.status)}</div>
                                <span className="font-display font-bold text-amber-400 text-sm">
                                  {formatCurrency(order.total)}
                                </span>
                              </div>
                            </div>

                            {/* Items breakdown */}
                            <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 space-y-2">
                              {order.items.map((it, iIdx) => (
                                <div key={iIdx} className="flex items-center justify-between gap-3 text-xs">
                                  <div className="flex items-center gap-2.5">
                                    <img
                                      src={it.drink.image}
                                      alt={it.drink.name}
                                      className="w-8 h-8 rounded-lg object-cover border border-white/10"
                                      referrerPolicy="no-referrer"
                                    />
                                    <div>
                                      <span className="font-semibold text-zinc-200">
                                        {it.quantity}x {it.drink.name}
                                      </span>
                                      <span className="text-[10px] text-amber-300 ml-1.5 capitalize">
                                        ({it.customization.size === 'large' ? '500mls' : '400mls'}
                                        {it.customization.selectedFlavor ? `, ${it.customization.selectedFlavor}` : ''})
                                      </span>
                                      {it.customization.specialInstructions && (
                                        <p className="text-[10px] text-zinc-400 italic">
                                          "{it.customization.specialInstructions}"
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                  <span className="font-semibold text-zinc-300">
                                    {formatCurrency(it.totalPrice)}
                                  </span>
                                </div>
                              ))}
                            </div>

                            {/* Actions & Status buttons */}
                            <div className="pt-2 border-t border-white/5 flex flex-wrap items-center justify-between gap-2 text-xs">
                              <div className="flex items-center gap-2 flex-wrap">
                                <button
                                  type="button"
                                  onClick={() => onViewReceipt(order)}
                                  className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white font-medium flex items-center gap-1.5 transition-colors border border-white/5"
                                >
                                  <Receipt className="w-3.5 h-3.5 text-zinc-400" />
                                  <span>Invoice Receipt</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => onReorder(order)}
                                  className="px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 font-medium flex items-center gap-1.5 transition-colors border border-amber-500/20"
                                >
                                  <RotateCcw className="w-3 h-3" />
                                  <span>Re-Order for Customer</span>
                                </button>

                                {/* WhatsApp Dispatch Link */}
                                <a
                                  href={getWhatsAppOrderLink(
                                    order.customerPhone || getAdminDispatchSettings().whatsapp.phoneNumber || '256752619129',
                                    order
                                  )}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 font-semibold text-xs border border-emerald-500/30 flex items-center gap-1.5 transition-colors"
                                  title="Dispatch order details to rider or kitchen via WhatsApp"
                                >
                                  <MessageSquare className="w-3.5 h-3.5" />
                                  <span>WhatsApp</span>
                                </a>
                              </div>

                              {/* Status Advancement / Reactivation / Admin Cancel */}
                              <div className="flex items-center gap-1.5 flex-wrap">
                                {isCancelled ? (
                                  onUpdateOrderStatus && (
                                    <button
                                      type="button"
                                      onClick={() => onUpdateOrderStatus(order.id, 'placed')}
                                      className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-bold text-xs flex items-center gap-1.5 transition-colors"
                                      title="Reactivate order"
                                    >
                                      <RotateCcw className="w-3.5 h-3.5" />
                                      <span>Reactivate Order</span>
                                    </button>
                                  )
                                ) : !isDelivered && (
                                  <>
                                    {onUpdateOrderStatus && (
                                      <>
                                        {(order.status === 'placed' || order.status === 'brewing') && (
                                          <button
                                            type="button"
                                            onClick={() => onUpdateOrderStatus(order.id, 'packaged')}
                                            className="px-2.5 py-1 rounded-lg bg-teal-500 hover:bg-teal-600 text-white font-bold text-[11px] transition-all"
                                          >
                                            Mark Packaged ➔
                                          </button>
                                        )}
                                        {order.status === 'packaged' && (
                                          <button
                                            type="button"
                                            onClick={() => onUpdateOrderStatus(order.id, 'on_the_way')}
                                            className="px-2.5 py-1 rounded-lg bg-purple-500 hover:bg-purple-600 text-white font-bold text-[11px] transition-all"
                                          >
                                            Dispatch Courier ➔
                                          </button>
                                        )}
                                        {order.status === 'on_the_way' && (
                                          <button
                                            type="button"
                                            onClick={() => onUpdateOrderStatus(order.id, 'delivered')}
                                            className="px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-[11px] transition-all"
                                          >
                                            Mark Delivered ✓
                                          </button>
                                        )}
                                      </>
                                    )}

                                    {onCancelOrder && (
                                      <button
                                        type="button"
                                        onClick={() => setOrderToCancel(order)}
                                        className="px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 font-semibold text-[11px] flex items-center gap-1 transition-colors"
                                        title="Cancel order"
                                      >
                                        <XCircle className="w-3 h-3 text-rose-400" />
                                        <span>Cancel</span>
                                      </button>
                                    )}
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

      </div>
    );
  }

  // ==========================================
  // CUSTOMER VIEW: MY PERSONAL ORDERS
  // ==========================================
  const displayedCustomerOrders = orders.filter((order) => {
    if (customerTab === 'pending') {
      return order.status !== 'delivered' && order.status !== 'cancelled';
    }
    if (customerTab === 'delivered') {
      return order.status === 'delivered';
    }
    if (customerTab === 'canceled') {
      return order.status === 'cancelled';
    }
    return true;
  });

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      
      {/* Page Header */}
      <div className="flex items-center justify-between pb-2 border-b border-white/10">
        <div>
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-white tracking-tight">
            Your Orders
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">
            Track active deliveries, review past drinks, and manage orders
          </p>
        </div>
        <span className="text-xs px-3 py-1 rounded-full bg-white/5 border border-white/10 text-zinc-300 font-semibold">
          {orders.length} {orders.length === 1 ? 'order' : 'orders'}
        </span>
      </div>

      {/* Customer Category Tabs: All, In Progress, Delivered, Canceled */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-1.5 rounded-2xl bg-[#13161c] border border-white/10 shadow-lg">
        {/* All Tab */}
        <button
          type="button"
          id="customer-tab-all"
          onClick={() => setCustomerTab('all')}
          className={`px-3 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
            customerTab === 'all'
              ? 'bg-white text-black shadow-md font-black'
              : 'text-zinc-300 hover:text-white hover:bg-white/5'
          }`}
        >
          <Layers className="w-4 h-4 shrink-0" />
          <span>All</span>
          <span className={`px-2 py-0.5 rounded-full text-[11px] font-black ${
            customerTab === 'all' ? 'bg-black/20 text-black' : 'bg-white/5 text-zinc-400'
          }`}>
            {orders.length}
          </span>
        </button>

        {/* Pending / In Progress Tab */}
        <button
          type="button"
          id="customer-tab-pending"
          onClick={() => setCustomerTab('pending')}
          className={`relative px-3 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
            customerTab === 'pending'
              ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-black shadow-md font-black'
              : 'text-zinc-300 hover:text-white hover:bg-white/5'
          }`}
        >
          <Clock className="w-4 h-4 shrink-0" />
          <span>In Progress</span>
          <span className={`px-2 py-0.5 rounded-full text-[11px] font-black ${
            customerTab === 'pending' ? 'bg-black/25 text-black' : 'bg-amber-500/15 text-amber-300'
          }`}>
            {pendingOrders.length}
          </span>
          {pendingOrders.length > 0 && customerTab !== 'pending' && (
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          )}
        </button>

        {/* Delivered Tab */}
        <button
          type="button"
          id="customer-tab-delivered"
          onClick={() => setCustomerTab('delivered')}
          className={`px-3 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
            customerTab === 'delivered'
              ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-black shadow-md font-black'
              : 'text-zinc-300 hover:text-white hover:bg-white/5'
          }`}
        >
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Delivered</span>
          <span className={`px-2 py-0.5 rounded-full text-[11px] font-black ${
            customerTab === 'delivered' ? 'bg-black/25 text-black' : 'bg-emerald-500/15 text-emerald-300'
          }`}>
            {deliveredOrders.length}
          </span>
        </button>

        {/* Canceled Tab */}
        <button
          type="button"
          id="customer-tab-canceled"
          onClick={() => setCustomerTab('canceled')}
          className={`px-3 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
            customerTab === 'canceled'
              ? 'bg-gradient-to-r from-rose-500 to-rose-600 text-white shadow-md font-black'
              : 'text-zinc-300 hover:text-white hover:bg-white/5'
          }`}
        >
          <XCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>Canceled</span>
          <span className={`px-2 py-0.5 rounded-full text-[11px] font-black ${
            customerTab === 'canceled'
              ? 'bg-black/40 text-white'
              : cancelledOrders.length > 0
              ? 'bg-rose-500/20 text-rose-300'
              : 'bg-white/5 text-zinc-400'
          }`}>
            {cancelledOrders.length}
          </span>
        </button>
      </div>

      {/* Active Order Highlight Card (if active and in all or pending tab) */}
      {activeOrder && activeOrder.status !== 'delivered' && activeOrder.status !== 'cancelled' && (customerTab === 'all' || customerTab === 'pending') && (
        <div className="p-5 rounded-3xl bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-transparent border border-amber-500/40 shadow-xl relative overflow-hidden space-y-3 animate-in fade-in">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold uppercase tracking-wider mb-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Active Delivery in Progress
              </div>
              <h3 className="font-bold text-base sm:text-lg text-white">
                Order #{activeOrder.orderNumber}
              </h3>
              <p className="text-xs text-zinc-300 mt-0.5">
                Estimated arrival: <strong className="text-amber-400">{activeOrder.estimatedDeliveryTime}</strong> · Destination: {activeOrder.deliveryAddress.street}
              </p>
            </div>
            <span className="font-display font-bold text-amber-400 text-lg">
              {formatCurrency(activeOrder.total)}
            </span>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              id="track-active-order-btn"
              onClick={() => onTrackOrder(activeOrder)}
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all active:scale-95"
            >
              <Compass className="w-4 h-4" />
              <span>Track Delivery Status</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => onViewReceipt(activeOrder)}
              className="px-3.5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white border border-white/10 font-semibold text-xs flex items-center gap-1.5 transition-colors"
            >
              <Receipt className="w-3.5 h-3.5" />
              <span>Receipt</span>
            </button>
          </div>
        </div>
      )}

      {/* Customer Orders List */}
      {displayedCustomerOrders.length === 0 ? (
        <div className="p-10 rounded-3xl bg-[#13161e] border border-white/10 text-center space-y-4 shadow-xl">
          {customerTab === 'canceled' ? (
            <>
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h3 className="font-display font-bold text-lg text-white">No Canceled Orders</h3>
                <p className="text-xs text-zinc-400 max-w-sm mx-auto mt-1">
                  You have not cancelled any orders. All your orders are either in progress or successfully delivered.
                </p>
              </div>
            </>
          ) : customerTab === 'pending' ? (
            <>
              <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mx-auto">
                <Clock className="w-8 h-8" />
              </div>
              <div>
                <h3 className="font-display font-bold text-lg text-white">No Active Deliveries</h3>
                <p className="text-xs text-zinc-400 max-w-sm mx-auto mt-1">
                  You have no pending orders in the kitchen right now. Ready for fresh cold-pressed drinks?
                </p>
              </div>
              <button
                onClick={onBrowseMenu}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs transition-colors shadow-md"
              >
                Order Fresh Drinks Now
              </button>
            </>
          ) : customerTab === 'delivered' ? (
            <>
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mx-auto">
                <PackageCheck className="w-8 h-8" />
              </div>
              <div>
                <h3 className="font-display font-bold text-lg text-white">No Delivered Orders Yet</h3>
                <p className="text-xs text-zinc-400 max-w-sm mx-auto mt-1">
                  Your fulfilled doorstep deliveries will show up here for easy reordering and invoices.
                </p>
              </div>
              <button
                onClick={onBrowseMenu}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs transition-colors shadow-md"
              >
                Explore Drinks Menu
              </button>
            </>
          ) : (
            <>
              <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-zinc-500 mx-auto">
                <ReceiptText className="w-8 h-8 text-amber-400/80 stroke-[1.8]" />
              </div>
              <div>
                <h3 className="font-display font-bold text-lg text-white">No Orders Yet</h3>
                <p className="text-xs text-zinc-400 max-w-sm mx-auto mt-1">
                  Explore our handcrafted fresh juices, smoothies, and refreshments to place your first doorstep order.
                </p>
              </div>
              <button
                id="empty-orders-browse-menu-btn"
                onClick={onBrowseMenu}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs transition-colors shadow-md"
              >
                Explore Drinks Menu
              </button>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {displayedCustomerOrders.map((order) => {
            const isActive = activeOrder?.id === order.id && order.status !== 'delivered' && order.status !== 'cancelled';
            const isCancelled = order.status === 'cancelled';

            return (
              <div
                key={order.id}
                id={`customer-order-card-${order.id}`}
                className={`p-5 rounded-3xl bg-[#13161e] border transition-all space-y-4 shadow-xl ${
                  isCancelled
                    ? 'border-rose-500/30 bg-rose-950/10'
                    : isActive
                    ? 'border-amber-500/50'
                    : 'border-white/10 hover:border-white/20'
                }`}
              >
                {/* Cancellation Banner on Customer Card */}
                {isCancelled && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-200">
                    <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    <p className="text-xs font-semibold">
                      This order was cancelled. Preparation was halted and no courier will be dispatched.
                    </p>
                  </div>
                )}

                {/* Header info */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-white/10">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-white text-sm sm:text-base">
                        #{order.orderNumber}
                      </span>
                      <span className="text-xs text-zinc-400">· {order.createdAt}</span>
                      {order.status === 'delivered' ? (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                          Delivered
                        </span>
                      ) : order.status === 'cancelled' ? (
                        <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-bold">
                          Cancelled
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold animate-pulse">
                          In Progress ({order.status === 'on_the_way' ? 'On The Way' : 'Preparing'})
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-zinc-400 mt-1">
                      Delivered to {order.deliveryAddress.label} · {order.deliveryAddress.street}
                    </p>
                  </div>

                  <div className="text-left sm:text-right">
                    <span className="font-display font-extrabold text-amber-400 text-base sm:text-lg">
                      {formatCurrency(order.total)}
                    </span>
                    <p className="text-[11px] text-zinc-400">Cash on Delivery</p>
                  </div>
                </div>

                {/* Items in this order */}
                <div className="space-y-2.5">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between gap-3 text-xs bg-black/30 p-2.5 rounded-xl border border-white/5">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.drink.image}
                          alt={item.drink.name}
                          className="w-11 h-11 rounded-lg object-cover border border-white/10"
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <p className="font-bold text-white text-xs sm:text-sm">
                            {item.quantity}x {item.drink.name}
                          </p>
                          <p className="text-[11px] text-amber-300 capitalize font-medium mt-0.5 flex items-center gap-1.5 flex-wrap">
                            <span>Size: {item.customization.size === 'large' ? 'Large (500mls)' : 'Standard (400mls)'}</span>
                            {item.customization.selectedFlavor && (
                              <>
                                <span className="text-zinc-500">•</span>
                                <span className="text-white font-semibold">Flavor: {item.customization.selectedFlavor}</span>
                              </>
                            )}
                          </p>
                        </div>
                      </div>

                      <span className="font-bold text-zinc-200">
                        {formatCurrency(item.totalPrice)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Action buttons (Reorder, Receipt, Track, Cancel) */}
                <div className="pt-2 border-t border-white/10 flex flex-wrap items-center justify-between gap-2.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      id={`reorder-btn-${order.id}`}
                      onClick={() => onReorder(order)}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-xs flex items-center gap-1.5 transition-all shadow-md active:scale-95"
                    >
                      <RotateCcw className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>Re-order Drink(s)</span>
                    </button>

                    <button
                      onClick={() => onViewReceipt(order)}
                      className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white font-semibold text-xs border border-white/10 flex items-center gap-1.5 transition-colors"
                    >
                      <Receipt className="w-3.5 h-3.5" />
                      <span>View Receipt</span>
                    </button>

                    {/* Customer cancel order button */}
                    {onCancelOrder && order.status !== 'delivered' && order.status !== 'cancelled' && (
                      order.status === 'on_the_way' ? (
                        <button
                          disabled
                          title="Order is already on the way and cannot be cancelled"
                          className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-zinc-600 cursor-not-allowed text-xs font-medium flex items-center gap-1.5 opacity-40"
                        >
                          <XCircle className="w-3.5 h-3.5 text-zinc-600" />
                          <span>Cancel Order (Disabled: On Way)</span>
                        </button>
                      ) : (
                        <button
                          id={`cancel-order-btn-${order.id}`}
                          onClick={() => setOrderToCancel(order)}
                          className="px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                        >
                          <XCircle className="w-3.5 h-3.5 text-rose-400" />
                          <span>Cancel Order</span>
                        </button>
                      )
                    )}
                  </div>

                  {isActive && (
                    <button
                      onClick={() => onTrackOrder(order)}
                      className="px-3.5 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 text-xs font-bold flex items-center gap-1.5 transition-all"
                    >
                      <Compass className="w-3.5 h-3.5" />
                      <span>Track Status</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Cancel Order Confirmation Modal */}
      {orderToCancel && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#161a23] border border-white/15 rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="font-display font-bold text-lg text-white">
                Cancel Order #{orderToCancel.orderNumber}?
              </h3>
              <p className="text-xs text-zinc-400">
                Are you sure you want to cancel this order? This action will stop preparation and delivery immediately.
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setOrderToCancel(null)}
                className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 font-semibold text-xs border border-white/10 transition-colors"
              >
                Keep Order
              </button>
              <button
                id="confirm-cancel-order-btn"
                onClick={() => {
                  if (onCancelOrder) {
                    onCancelOrder(orderToCancel.id);
                  }
                  setOrderToCancel(null);
                }}
                className="flex-1 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs transition-colors shadow-lg shadow-rose-500/20"
              >
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
