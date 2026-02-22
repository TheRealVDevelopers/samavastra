import React from 'react';
import { useSelector } from 'react-redux';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Avatar, Dropdown, Layout, Button, Typography, Badge, Drawer } from 'antd';
import { LogoutOutlined, ToolOutlined, UserOutlined, BellOutlined } from '@ant-design/icons';
import { selectAuth } from '@/redux/auth/selectors';

const { Text, Title } = Typography;

export default function HeaderContent() {
  const { current: user } = useSelector(selectAuth);
  const { Header } = Layout;
  const navigate = useNavigate();
  const location = useLocation();

  const getPageTitle = (path) => {
    if (path === '/') return 'Dashboard';
    const parts = path.split('/').filter(Boolean);
    if (!parts.length) return 'Dashboard';
    return parts[0].split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  const initials = user
    ? `${user.firstName?.charAt(0) || ''}${user.lastName?.charAt(0) || ''}`.toUpperCase() || user.email?.charAt(0).toUpperCase()
    : 'U';

  const ProfileDropdown = () => (
    <div className="profileDropdown" onClick={() => navigate('/profile')} style={{ padding: '8px 4px', cursor: 'pointer' }}>
      <Avatar
        size="large"
        style={{ background: '#1B2B65', color: '#F5A623', fontWeight: 700 }}
      >
        {initials}
      </Avatar>
      <div className="profileDropdownInfo" style={{ marginLeft: 12, display: 'inline-block', verticalAlign: 'middle' }}>
        <Text strong style={{ display: 'block', fontSize: 14 }}>
          {user?.firstName} {user?.lastName}
        </Text>
        <Text style={{ color: '#888', fontSize: 12 }}>{user?.email}</Text>
        <Text style={{ color: '#F5A623', fontSize: 11, display: 'block', fontWeight: 700 }}>{user?.role}</Text>
      </div>
    </div>
  );

  const items = [
    {
      label: <ProfileDropdown />,
      key: 'ProfileDropdown',
    },
    { type: 'divider' },
    {
      icon: <UserOutlined />,
      key: 'settingProfile',
      label: <Link to="/profile">Profile Settings</Link>,
    },
    {
      icon: <ToolOutlined />,
      key: 'settingApp',
      label: <Link to="/settings">App Settings</Link>,
    },
    { type: 'divider' },
    {
      icon: <LogoutOutlined />,
      key: 'logout',
      label: <Link to="/logout">Logout</Link>,
    },
  ];

  const [notificationsOpen, setNotificationsOpen] = React.useState(false);

  return (
    <Header
      style={{
        padding: '0 32px',
        background: '#ffffff',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid #E5E7EB',
        boxShadow: 'none',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        height: 72,
      }}
    >
      <div>
        <Title level={4} style={{ margin: 0, color: '#1A1A2E' }}>
          {getPageTitle(location.pathname)}
        </Title>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
        <Badge count={3} size="small" offset={[-4, 4]}>
          <Button
            type="text"
            icon={<BellOutlined style={{ fontSize: 20, color: '#6B7280' }} />}
            onClick={() => setNotificationsOpen(true)}
            style={{ width: 40, height: 40, borderRadius: '50%' }}
          />
        </Badge>

        <Dropdown menu={{ items }} trigger={['click']} placement="bottomRight" arrow>
          <Avatar
            style={{
              background: '#1B2B65',
              color: '#F5A623',
              fontWeight: 700,
              cursor: 'pointer',
              border: '2px solid #F5A623'
            }}
            size="large"
          >
            {initials}
          </Avatar>
        </Dropdown>
      </div>

      <Drawer
        title={<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Notifications</span>
          <Button type="link" style={{ fontSize: 13, padding: 0, color: '#1B2B65' }}>Mark all read</Button>
        </div>}
        placement="right"
        onClose={() => setNotificationsOpen(false)}
        open={notificationsOpen}
        width={380}
        bodyStyle={{ background: '#F4F6FB', padding: 16 }}
      >
        <div style={{ background: '#fff', padding: 16, borderRadius: 12, marginBottom: 12, borderLeft: '4px solid #F5A623', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#FFF7E6', color: '#F5A623', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><BellOutlined /></div>
            <div>
              <Text strong style={{ display: 'block', fontSize: 14 }}>New production job created</Text>
              <Text style={{ color: '#6B7280', fontSize: 13 }}>Job #0102 for 500 units has been added to the queue.</Text>
              <Text style={{ color: '#9CA3AF', fontSize: 11, display: 'block', marginTop: 4 }}>10 minutes ago</Text>
            </div>
          </div>
        </div>

        <div style={{ background: '#fff', padding: 16, borderRadius: 12, marginBottom: 12, borderLeft: '4px solid #1B2B65', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#F0F4FF', color: '#1B2B65', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><UserOutlined /></div>
            <div>
              <Text strong style={{ display: 'block', fontSize: 14 }}>New user registered</Text>
              <Text style={{ color: '#6B7280', fontSize: 13 }}>Sarah from accounts team just logged in.</Text>
              <Text style={{ color: '#9CA3AF', fontSize: 11, display: 'block', marginTop: 4 }}>2 hours ago</Text>
            </div>
          </div>
        </div>
      </Drawer>
    </Header>
  );
}
