import { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, getDocs, query, orderBy, limit, where, Timestamp } from 'firebase/firestore';
import {
  Row, Col, Card, Statistic, Typography, List, Avatar, Tag, Spin, Badge
} from 'antd';
import {
  DollarOutlined, TeamOutlined, ToolOutlined, AlertOutlined,
  ShopOutlined, ClockCircleOutlined, RiseOutlined, FallOutlined,
} from '@ant-design/icons';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

// Color palette
const NAVY = '#0a1628';
const GOLD = '#c9a84c';
const GREEN = '#52c41a';
const RED = '#ff4d4f';
const BLUE = '#1890ff';

function MetricCard({ title, value, prefix, icon, color, suffix, loading }) {
  // Mocking a trend indicator for the new design
  const isUp = Math.random() > 0.5;
  const trendColor = isUp ? GREEN : RED;
  const trendIcon = isUp ? '↑' : '↓';
  const trendValue = Math.floor(Math.random() * 15) + 1;

  return (
    <Card
      styles={{ body: { padding: '24px', display: 'flex', flexDirection: 'column', position: 'relative' } }}
      style={{
        borderRadius: 16,
        border: 'none',
        boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
        height: '100%',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Left Accent Bar */}
      <div style={{ position: 'absolute', left: 0, top: '24px', bottom: '24px', width: '4px', background: color, borderRadius: '0 4px 4px 0' }} />

      <div style={{ paddingLeft: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <Text style={{ color: '#6B7280', fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 8 }}>{title.toUpperCase()}</Text>
          {loading ? (
            <Spin size="small" />
          ) : (
            <div style={{ display: 'flex', alignItems: 'baseline' }}>
              {prefix && <span style={{ fontSize: 20, fontWeight: 700, color: NAVY, marginRight: 4 }}>{prefix}</span>}
              <span style={{ fontSize: 32, fontWeight: 800, color: NAVY }}>{typeof value === 'number' && !prefix ? value.toLocaleString() : value}</span>
              {suffix && <span style={{ fontSize: 14, fontWeight: 600, color: '#6B7280', marginLeft: 4 }}>{suffix}</span>}
            </div>
          )}
        </div>
        <div
          style={{
            width: 48, height: 48, borderRadius: '50%',
            background: `${color}15`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <span style={{ fontSize: 24, color }}>{icon}</span>
        </div>
      </div>

      <div style={{ paddingLeft: '8px', marginTop: 16, display: 'flex', alignItems: 'center' }}>
        <Text style={{ color: trendColor, fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
          {trendIcon} {trendValue}%
        </Text>
        <Text style={{ color: '#9CA3AF', fontSize: 13, marginLeft: 8 }}>vs last month</Text>
      </div>
    </Card>
  );
}

export default function CEODashboard() {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    activeSchools: 0,
    productionUnits: 0,
    pendingPayments: 0,
    openComplaints: 0,
    activeOrders: 0,
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [revenueChart, setRevenueChart] = useState([]);
  const [topSchools, setTopSchools] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  async function fetchDashboardData() {
    setLoading(true);
    try {
      // Fetch all collections in parallel
      const [
        schoolsSnap, ordersSnap, complaintsSnap,
        invoicesSnap, paymentsSnap, productionSnap,
      ] = await Promise.all([
        getDocs(query(collection(db, 'schools'), where('status', '==', 'active'))),
        getDocs(query(collection(db, 'salesOrders'), orderBy('createdAt', 'desc'), limit(50))),
        getDocs(query(collection(db, 'complaints'), where('status', '!=', 'closed'))),
        getDocs(query(collection(db, 'invoices'), orderBy('createdAt', 'desc'), limit(50))),
        getDocs(query(collection(db, 'payments'), orderBy('date', 'desc'), limit(20))),
        getDocs(query(collection(db, 'productionJobs'), where('status', '==', 'active'))),
      ]);

      // Total revenue this month
      const now = dayjs();
      const monthStart = now.startOf('month').toISOString();
      const monthRevenue = paymentsSnap.docs
        .filter(d => d.data().date >= monthStart)
        .reduce((sum, d) => sum + (d.data().amount || 0), 0);

      // Pending payments (open invoices balance)
      const pendingAmt = invoicesSnap.docs
        .filter(d => d.data().status !== 'paid')
        .reduce((sum, d) => sum + (d.data().balanceAmount || 0), 0);

      // Production units this month
      const prodUnits = productionSnap.docs
        .reduce((sum, d) => sum + (d.data().producedUnits || 0), 0);

      // Revenue chart - last 6 months
      const months = [];
      for (let i = 5; i >= 0; i--) {
        const m = now.subtract(i, 'month');
        const mStart = m.startOf('month').toISOString();
        const mEnd = m.endOf('month').toISOString();
        const rev = paymentsSnap.docs
          .filter(d => d.data().date >= mStart && d.data().date <= mEnd)
          .reduce((sum, d) => sum + (d.data().amount || 0), 0);
        months.push({ month: m.format('MMM YY'), revenue: rev });
      }

      // Top 5 schools by order value
      const schoolOrderMap = {};
      ordersSnap.docs.forEach(d => {
        const data = d.data();
        if (data.schoolId) {
          schoolOrderMap[data.schoolId] = {
            name: data.schoolName || data.schoolId,
            total: (schoolOrderMap[data.schoolId]?.total || 0) + (data.totalAmount || 0),
          };
        }
      });
      const topSch = Object.values(schoolOrderMap)
        .sort((a, b) => b.total - a.total)
        .slice(0, 5);

      // Recent activity - latest orders + payments
      const activity = [
        ...ordersSnap.docs.slice(0, 5).map(d => ({
          key: d.id,
          type: 'order',
          text: `Sales Order for ${d.data().schoolName || 'School'}`,
          amount: d.data().totalAmount,
          time: d.data().createdAt,
          status: d.data().status,
        })),
        ...paymentsSnap.docs.slice(0, 5).map(d => ({
          key: d.id,
          type: 'payment',
          text: `Payment received`,
          amount: d.data().amount,
          time: d.data().date,
          status: 'paid',
        })),
      ]
        .sort((a, b) => (b.time || '').localeCompare(a.time || ''))
        .slice(0, 10);

      setStats({
        totalRevenue: monthRevenue,
        activeSchools: schoolsSnap.size,
        productionUnits: prodUnits,
        pendingPayments: pendingAmt,
        openComplaints: complaintsSnap.size,
        activeOrders: productionSnap.size,
      });
      setRevenueChart(months);
      setTopSchools(topSch);
      setRecentActivity(activity);
    } catch (err) {
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  }

  const statusColor = {
    pending: 'orange', approved: 'blue', active: 'green',
    completed: 'green', paid: 'green', cancelled: 'red',
  };

  return (
    <div style={{ padding: '0 0 40px' }}>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <Title level={3} style={{ color: NAVY, marginBottom: 4 }}>
          CEO Dashboard
        </Title>
        <Text style={{ color: '#888' }}>
          {dayjs().format('dddd, D MMMM YYYY')} · Live overview of Samavastra operations
        </Text>
      </div>

      {/* Metric Cards */}
      <Row gutter={[24, 24]}>
        <Col xs={24} sm={12} xl={6}>
          <MetricCard
            title="Revenue This Month"
            value={stats.totalRevenue}
            prefix="₹"
            icon={<DollarOutlined />}
            color={GREEN}
            loading={loading}
          />
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <MetricCard
            title="Active Schools"
            value={stats.activeSchools}
            icon={<ShopOutlined />}
            color={BLUE}
            loading={loading}
          />
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <MetricCard
            title="Active Jobs"
            value={stats.activeOrders}
            icon={<RiseOutlined />}
            color={NAVY}
            loading={loading}
          />
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <MetricCard
            title="Pending Payments"
            value={stats.pendingPayments}
            prefix="₹"
            icon={<ClockCircleOutlined />}
            color="#faad14"
            loading={loading}
          />
        </Col>
      </Row>

      {/* Revenue Chart + Top Schools */}
      <Row gutter={[16, 16]} style={{ marginTop: 20 }}>
        <Col xs={24} lg={16}>
          <Card
            title={<span style={{ fontWeight: 600 }}>Revenue Trend — Last 6 Months</span>}
            style={{ borderRadius: 12, border: 'none', boxShadow: '0 2px 12px rgba(10,22,40,0.08)' }}
            styles={{ body: { paddingTop: 8 } }}
          >
            {loading ? (
              <div style={{ textAlign: 'center', padding: 60 }}><Spin /></div>
            ) : revenueChart.every(m => m.revenue === 0) ? (
              <div style={{ textAlign: 'center', padding: 60, color: '#aaa' }}>
                No payment data yet. Revenue will appear here once payments are recorded.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={revenueChart} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={v => [`₹${v.toLocaleString()}`, 'Revenue']} />
                  <Bar dataKey="revenue" fill={NAVY} radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card
            title={<span style={{ fontWeight: 600 }}>Top Schools by Order Value</span>}
            style={{ borderRadius: 12, border: 'none', boxShadow: '0 2px 12px rgba(10,22,40,0.08)', height: '100%' }}
            styles={{ body: { paddingTop: 8 } }}
          >
            {loading ? (
              <div style={{ textAlign: 'center', padding: 40 }}><Spin /></div>
            ) : topSchools.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 40, color: '#aaa' }}>
                No orders yet. Schools will appear here once orders are placed.
              </div>
            ) : (
              <List
                dataSource={topSchools}
                renderItem={(school, idx) => (
                  <List.Item style={{ padding: '10px 0', borderBottom: '1px solid #f5f5f5' }}>
                    <div style={{ display: 'flex', alignItems: 'center', width: '100%', gap: 12 }}>
                      <Avatar style={{ background: NAVY, color: GOLD, fontWeight: 700 }}>
                        {idx + 1}
                      </Avatar>
                      <div style={{ flex: 1 }}>
                        <Text strong style={{ fontSize: 13, display: 'block' }}>{school.name}</Text>
                        <Text style={{ color: '#888', fontSize: 12 }}>₹{school.total.toLocaleString()}</Text>
                      </div>
                    </div>
                  </List.Item>
                )}
              />
            )}
          </Card>
        </Col>
      </Row>

      {/* Recent Activity */}
      <Row gutter={[16, 16]} style={{ marginTop: 20 }}>
        <Col xs={24}>
          <Card
            title={<span style={{ fontWeight: 600 }}>Recent Activity</span>}
            style={{ borderRadius: 12, border: 'none', boxShadow: '0 2px 12px rgba(10,22,40,0.08)' }}
            styles={{ body: { paddingTop: 0 } }}
          >
            {loading ? (
              <div style={{ textAlign: 'center', padding: 40 }}><Spin /></div>
            ) : recentActivity.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 40, color: '#aaa' }}>
                No activity yet. Activity will appear here as your team starts using Samavastra.
              </div>
            ) : (
              <List
                dataSource={recentActivity}
                renderItem={item => (
                  <List.Item style={{ padding: '12px 0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', width: '100%', gap: 12 }}>
                      <Avatar
                        style={{
                          background: item.type === 'payment' ? '#f6ffed' : '#e6f7ff',
                          color: item.type === 'payment' ? GREEN : BLUE,
                        }}
                      >
                        {item.type === 'payment' ? '₹' : '📋'}
                      </Avatar>
                      <div style={{ flex: 1 }}>
                        <Text style={{ fontSize: 14 }}>{item.text}</Text>
                        {item.time && (
                          <Text style={{ color: '#aaa', fontSize: 12, display: 'block' }}>
                            {dayjs(item.time).format('D MMM YYYY, h:mm A')}
                          </Text>
                        )}
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        {item.amount > 0 && (
                          <Text strong style={{ color: NAVY }}>₹{item.amount.toLocaleString()}</Text>
                        )}
                        <br />
                        <Tag color={statusColor[item.status] || 'default'} style={{ margin: 0, marginTop: 4 }}>
                          {item.status}
                        </Tag>
                      </div>
                    </div>
                  </List.Item>
                )}
              />
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
}
