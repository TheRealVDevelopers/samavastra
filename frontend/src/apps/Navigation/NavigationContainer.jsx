import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button, Drawer, Layout, Menu, Typography } from 'antd';
import { useAppContext } from '@/context/appContext';
import useResponsive from '@/hooks/useResponsive';
import { useSelector } from 'react-redux';
import { selectAuth } from '@/redux/auth/selectors';

import {
  DashboardOutlined,
  ShopOutlined,
  ToolOutlined,
  InboxOutlined,
  ShoppingCartOutlined,
  CarOutlined,
  AccountBookOutlined,
  TeamOutlined,
  StarOutlined,
  AlertOutlined,
  BarChartOutlined,
  SettingOutlined,
  MenuOutlined,
  LogoutOutlined,
} from '@ant-design/icons';

const { Sider } = Layout;
const { Text } = Typography;

export default function Navigation() {
  const { isMobile } = useResponsive();
  return isMobile ? <MobileSidebar /> : <Sidebar collapsible={true} />;
}

function Sidebar({ collapsible, isMobile = false }) {
  let location = useLocation();
  const { state: stateApp, appContextAction } = useAppContext();
  const { isNavMenuClose } = stateApp;
  const { navMenu } = appContextAction;
  const [showLogoApp, setLogoApp] = useState(isNavMenuClose);
  const [currentPath, setCurrentPath] = useState(location.pathname.slice(1));
  const navigate = useNavigate();
  const { current: user } = useSelector(selectAuth);
  const role = user?.role || 'CEO';

  const groupLabel = (label) => (
    <Text style={{ color: '#888', fontSize: 10, letterSpacing: 1, fontWeight: 700 }}>
      {label}
    </Text>
  );

  const allItems = [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: <Link to={'/'}>Dashboard</Link>,
      roles: ['CEO', 'Manager', 'Staff', 'Accountant'],
    },
    { type: 'divider' },
    {
      type: 'group',
      label: groupLabel('OPERATIONS'),
      children: [
        {
          key: 'sales',
          icon: <ShopOutlined />,
          label: 'Sales',
          roles: ['CEO', 'Manager', 'Staff'],
          children: [
            { key: 'leads', label: <Link to={'/leads'}>Leads</Link> },
            { key: 'schools', label: <Link to={'/schools'}>Schools</Link> },
            { key: 'quotations', label: <Link to={'/quotations'}>Quotations</Link> },
            { key: 'salesorders', label: <Link to={'/sales-orders'}>Sales Orders</Link> },
          ],
        },
        {
          key: 'production',
          icon: <ToolOutlined />,
          label: 'Production',
          roles: ['CEO', 'Manager', 'Staff'],
          children: [
            { key: 'production-jobs', label: <Link to={'/production-jobs'}>Production Jobs</Link> },
          ],
        },
        {
          key: 'inventory',
          icon: <InboxOutlined />,
          label: 'Inventory',
          roles: ['CEO', 'Manager', 'Staff'],
          children: [
            { key: 'raw-materials', label: <Link to={'/raw-materials'}>Raw Materials</Link> },
            { key: 'finished-goods', label: <Link to={'/finished-goods'}>Finished Goods</Link> },
            { key: 'stock-movements', label: <Link to={'/stock-movements'}>Stock Movements</Link> },
          ],
        },
      ]
    },
    { type: 'divider' },
    {
      type: 'group',
      label: groupLabel('SUPPLY CHAIN'),
      children: [
        {
          key: 'procurement',
          icon: <ShoppingCartOutlined />,
          label: 'Procurement',
          roles: ['CEO', 'Manager', 'Staff'],
          children: [
            { key: 'purchase-requests', label: <Link to={'/purchase-requests'}>Purchase Request</Link> },
            { key: 'purchase-orders', label: <Link to={'/purchase-orders'}>Purchase Orders</Link> },
            { key: 'suppliers', label: <Link to={'/suppliers'}>Suppliers</Link> },
          ],
        },
        {
          key: 'logistics',
          icon: <CarOutlined />,
          label: 'Logistics',
          roles: ['CEO', 'Manager', 'Staff'],
          children: [
            { key: 'shipments', label: <Link to={'/shipments'}>Shipments</Link> },
          ],
        },
      ]
    },
    { type: 'divider' },
    {
      type: 'group',
      label: groupLabel('FINANCE & HR'),
      children: [
        {
          key: 'accounts',
          icon: <AccountBookOutlined />,
          label: 'Accounts',
          roles: ['CEO', 'Accountant'],
          children: [
            { key: 'invoices', label: <Link to={'/invoices'}>Invoices</Link> },
            { key: 'payments', label: <Link to={'/payments'}>Payments</Link> },
            { key: 'expenses', label: <Link to={'/expenses'}>Expenses</Link> },
          ],
        },
        {
          key: 'hr',
          icon: <TeamOutlined />,
          label: 'HR',
          roles: ['CEO', 'Manager'],
          children: [
            { key: 'employees', label: <Link to={'/employees'}>Employees</Link> },
            { key: 'attendance', label: <Link to={'/attendance'}>Attendance</Link> },
          ],
        },
      ]
    },
    { type: 'divider' },
    {
      type: 'group',
      label: groupLabel('SUPPORT & DATA'),
      children: [
        {
          key: 'csat',
          icon: <StarOutlined />,
          label: <Link to={'/feedback'}>CSAT / Feedback</Link>,
          roles: ['CEO', 'Manager'],
        },
        {
          key: 'cser',
          icon: <AlertOutlined />,
          label: <Link to={'/complaints'}>CSER / Complaints</Link>,
          roles: ['CEO', 'Manager', 'Staff'],
        },
        {
          key: 'reports',
          icon: <BarChartOutlined />,
          label: <Link to={'/reports'}>Reports</Link>,
          roles: ['CEO', 'Manager', 'Accountant'],
        },
      ]
    },
    { type: 'divider' },
    {
      type: 'group',
      label: groupLabel('ADMIN'),
      children: [
        {
          key: 'settings',
          icon: <SettingOutlined />,
          label: <Link to={'/settings'}>Settings</Link>,
          roles: ['CEO'],
        },
        {
          key: 'user-management',
          icon: <TeamOutlined />,
          label: <Link to={'/user-management'}>User Management</Link>,
          roles: ['CEO'],
        },
      ]
    }
  ];

  // Show all items — role restriction only hides if role is explicitly set and doesn't match
  const filterByRole = (itemsList) => {
    return itemsList.filter(item => {
      if (item.roles && !item.roles.includes(role)) return false;
      if (item.children) {
        item.children = filterByRole(item.children);
        if (item.children.length === 0) return false;
      }
      return true;
    });
  };

  const items = filterByRole(allItems);

  useEffect(() => {
    if (location) {
      if (currentPath !== location.pathname) {
        if (location.pathname === '/') {
          setCurrentPath('dashboard');
        } else setCurrentPath(location.pathname.slice(1));
      }
    }
  }, [location, currentPath]);

  useEffect(() => {
    if (isNavMenuClose) setLogoApp(isNavMenuClose);
    const timer = setTimeout(() => {
      if (!isNavMenuClose) setLogoApp(isNavMenuClose);
    }, 200);
    return () => clearTimeout(timer);
  }, [isNavMenuClose]);

  const onCollapse = () => {
    if (navMenu) {
      navMenu.collapse();
    }
  };

  return (
    <Sider
      collapsible={collapsible}
      collapsed={collapsible ? isNavMenuClose : collapsible}
      onCollapse={onCollapse}
      className="navigation"
      width={240}
      collapsedWidth={60}
      style={{
        overflow: 'auto',
        height: '100vh',
        position: isMobile ? 'absolute' : 'sticky',
        top: 0,
        left: 0,
        background: '#1B2B65',
        transition: 'all 0.2s',
      }}
      theme="dark"
    >
      <div
        onClick={() => navigate('/')}
        style={{
          cursor: 'pointer',
          padding: isNavMenuClose ? '20px 0' : '20px 24px 16px',
          textAlign: isNavMenuClose ? 'center' : 'left',
          marginBottom: 8,
          transition: 'all 0.2s',
        }}
      >
        <Text style={{ color: '#F5A623', fontSize: isNavMenuClose ? 18 : 22, fontWeight: 800, letterSpacing: 1 }}>
          {isNavMenuClose ? 'S' : 'Samavastra'}
        </Text>
      </div>

      <Menu
        items={items}
        mode="inline"
        theme="dark"
        selectedKeys={[currentPath]}
        style={{
          background: 'transparent',
          border: 'none',
          paddingBottom: 60,
        }}
      />

      <div style={{ position: 'fixed', bottom: 0, width: isNavMenuClose ? 60 : 240, padding: isNavMenuClose ? '16px 0' : '16px 20px', textAlign: isNavMenuClose ? 'center' : 'left', background: '#1B2B65', borderTop: '1px solid rgba(255,255,255,0.05)', transition: 'all 0.2s' }}>
        <Link to="/logout" style={{ color: 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center', justifyContent: isNavMenuClose ? 'center' : 'flex-start', gap: 12, fontSize: 13, fontWeight: 600 }}>
          <LogoutOutlined style={{ fontSize: 16 }} /> {!isNavMenuClose && 'Logout'}
        </Link>
      </div>
    </Sider>
  );
}

function MobileSidebar() {
  const [visible, setVisible] = useState(false);
  return (
    <>
      <Button
        type="text"
        size="large"
        onClick={() => setVisible(true)}
        className="mobile-sidebar-btn"
        style={{ marginLeft: 25 }}
      >
        <MenuOutlined style={{ fontSize: 18, color: '#1B2B65' }} />
      </Button>
      <Drawer
        width={240}
        placement="left"
        closable={false}
        onClose={() => setVisible(false)}
        open={visible}
        bodyStyle={{ padding: 0, background: '#1B2B65' }}
      >
        <Sidebar collapsible={false} isMobile={true} />
      </Drawer>
    </>
  );
}
