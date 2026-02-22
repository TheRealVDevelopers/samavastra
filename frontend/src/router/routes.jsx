import { lazy } from 'react';
import { Navigate } from 'react-router-dom';
import PageTransition from '@/components/PageTransition';
import Login from '@/pages/Login';
import ProtectedRoute from '@/router/ProtectedRoute';

// Core
const Logout = lazy(() => import('@/pages/Logout.jsx'));
const NotFound = lazy(() => import('@/pages/NotFound.jsx'));
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const Profile = lazy(() => import('@/pages/Profile'));

// Sales
const Schools = lazy(() => import('@/pages/Sales/Schools'));
const Leads = lazy(() => import('@/pages/Sales/Leads'));
const Quotations = lazy(() => import('@/pages/Sales/Quotations'));
const SalesOrders = lazy(() => import('@/pages/Sales/SalesOrders'));

// Production
const ProductionJobs = lazy(() => import('@/pages/Production/ProductionJobs'));

// Inventory
const RawMaterials = lazy(() => import('@/pages/Inventory/RawMaterials'));
const FinishedGoods = lazy(() => import('@/pages/Inventory/FinishedGoods'));
const StockMovements = lazy(() => import('@/pages/Inventory/StockMovements'));

// Procurement
const PurchaseRequests = lazy(() => import('@/pages/Procurement/PurchaseRequests'));
const PurchaseOrders = lazy(() => import('@/pages/Procurement/PurchaseOrders'));
const Suppliers = lazy(() => import('@/pages/Procurement/Suppliers'));

// Logistics
const Shipments = lazy(() => import('@/pages/Logistics/Shipments'));

// Accounts
const Invoices = lazy(() => import('@/pages/Accounts/Invoices'));
const Payments = lazy(() => import('@/pages/Accounts/Payments'));
const Expenses = lazy(() => import('@/pages/Accounts/Expenses'));

// HR
const Employees = lazy(() => import('@/pages/HR/Employees'));
const Attendance = lazy(() => import('@/pages/HR/Attendance'));

// CSAT / CSER
const Feedback = lazy(() => import('@/pages/CSAT/Feedback'));
const Complaints = lazy(() => import('@/pages/CSER/Complaints'));

// Reports & Settings
const Reports = lazy(() => import('@/pages/Reports'));
const Settings = lazy(() => import('@/pages/Settings/SettingsPage'));
const UserManagement = lazy(() => import('@/pages/Settings/UserManagement'));

// Role sets
const ALL = ['CEO', 'Manager', 'Staff', 'Accountant'];
const MGR = ['CEO', 'Manager'];
const CEO = ['CEO'];
const ACCT = ['CEO', 'Accountant'];

const protect = (element, roles = ALL) => (
  <ProtectedRoute allowedRoles={roles}>
    <PageTransition>{element}</PageTransition>
  </ProtectedRoute>
);

let routes = {
  expense: [],
  default: [
    { path: '/login', element: <Navigate to="/" /> },
    { path: '/logout', element: <Logout /> },

    // ── All authenticated users ──────────────────
    { path: '/', element: protect(<Dashboard />) },
    { path: '/profile', element: protect(<Profile />) },

    // Sales — Staff+
    { path: '/schools', element: protect(<Schools />) },
    { path: '/leads', element: protect(<Leads />) },
    { path: '/quotations', element: protect(<Quotations />) },
    { path: '/sales-orders', element: protect(<SalesOrders />) },

    // Production — Staff+
    { path: '/production-jobs', element: protect(<ProductionJobs />) },

    // Inventory — Staff+
    { path: '/raw-materials', element: protect(<RawMaterials />) },
    { path: '/finished-goods', element: protect(<FinishedGoods />) },
    { path: '/stock-movements', element: protect(<StockMovements />) },

    // Procurement
    { path: '/suppliers', element: protect(<Suppliers />) },
    { path: '/purchase-requests', element: protect(<PurchaseRequests />) },
    { path: '/purchase-orders', element: protect(<PurchaseOrders />, MGR) },

    // Logistics
    { path: '/shipments', element: protect(<Shipments />) },

    // Accounts — CEO + Accountant only
    { path: '/invoices', element: protect(<Invoices />, ACCT) },
    { path: '/payments', element: protect(<Payments />, ACCT) },
    { path: '/expenses', element: protect(<Expenses />, ACCT) },

    // HR — Manager+
    { path: '/employees', element: protect(<Employees />, MGR) },
    { path: '/attendance', element: protect(<Attendance />, MGR) },

    // CSAT / CSER
    { path: '/feedback', element: protect(<Feedback />, MGR) },
    { path: '/complaints', element: protect(<Complaints />) },

    // Reports — Manager+
    { path: '/reports', element: protect(<Reports />, MGR) },

    // Settings — CEO only
    { path: '/settings', element: protect(<Settings />, CEO) },
    { path: '/user-management', element: protect(<UserManagement />, CEO) },

    { path: '*', element: <NotFound /> },
  ],
};

export default routes;
