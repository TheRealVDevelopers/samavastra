import { Card, Typography, Row, Col, Tag, Divider } from 'antd';
import { Link } from 'react-router-dom';
import {
    UserOutlined, SafetyOutlined, BellOutlined, DatabaseOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;
const NAVY = '#0a1628';
const GOLD = '#c9a84c';

const settingItems = [
    {
        title: 'User Management',
        description: 'Invite staff, assign roles (CEO, Manager, Staff, Accountant), deactivate users.',
        icon: <UserOutlined />,
        link: '/user-management',
        color: '#722ed1',
    },
    {
        title: 'Firestore Security Rules',
        description: 'Role-based data access rules are deployed via Firebase Console → Firestore → Rules.',
        icon: <SafetyOutlined />,
        link: null,
        color: '#52c41a',
        badge: 'Active',
    },
    {
        title: 'Notifications',
        description: 'Configure email alerts for low stock, complaint escalations, and overdue invoices.',
        icon: <BellOutlined />,
        link: null,
        color: '#1890ff',
        badge: 'Coming soon',
    },
    {
        title: 'Data & Backup',
        description: 'All data is stored in Firebase Firestore with automatic daily backups.',
        icon: <DatabaseOutlined />,
        link: null,
        color: '#fa8c16',
        badge: 'Firebase managed',
    },
];

export default function SettingsPage() {
    return (
        <div>
            <Title level={3} style={{ color: NAVY, marginBottom: 4 }}>Settings</Title>
            <Text style={{ color: '#888', display: 'block', marginBottom: 28 }}>
                Application configuration — only visible to CEO
            </Text>

            <Row gutter={[16, 16]}>
                {settingItems.map(item => (
                    <Col xs={24} md={12} key={item.title}>
                        {item.link ? (
                            <Link to={item.link}>
                                <SettingCard item={item} />
                            </Link>
                        ) : (
                            <SettingCard item={item} />
                        )}
                    </Col>
                ))}
            </Row>
        </div>
    );
}

function SettingCard({ item }) {
    return (
        <Card
            hoverable={!!item.link}
            style={{
                borderRadius: 12,
                border: 'none',
                boxShadow: '0 2px 12px rgba(10,22,40,0.08)',
                cursor: item.link ? 'pointer' : 'default',
            }}
            styles={{ body: { padding: '20px 24px' } }}
        >
            <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                <div style={{
                    width: 44, height: 44, borderRadius: 10,
                    background: `${item.color}18`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 20, color: item.color, flexShrink: 0,
                }}>
                    {item.icon}
                </div>
                <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <Text strong style={{ fontSize: 15 }}>{item.title}</Text>
                        {item.badge && <Tag color={item.badge === 'Active' ? 'green' : 'default'}>{item.badge}</Tag>}
                        {item.link && <Tag color="blue">→ Open</Tag>}
                    </div>
                    <Text style={{ color: '#888', fontSize: 13 }}>{item.description}</Text>
                </div>
            </div>
        </Card>
    );
}
