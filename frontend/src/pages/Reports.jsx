import { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { Row, Col, Card, Typography, Spin, Select, Statistic } from 'antd';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend
} from 'recharts';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;

const NAVY = '#0a1628';
const GOLD = '#c9a84c';
const COLORS = [NAVY, GOLD, '#52c41a', '#1890ff', '#722ed1', '#fa8c16'];

export default function ReportsPage() {
  const [loading, setLoading] = useState(true);
  const [revenueData, setRevenueData] = useState([]);
  const [productionData, setProductionData] = useState([]);
  const [complaintData, setComplaintData] = useState([]);
  const [schoolData, setSchoolData] = useState([]);

  useEffect(() => {
    fetchAll();
  }, []);

  async function fetchAll() {
    setLoading(true);
    try {
      const [paymentsSnap, jobsSnap, complaintsSnap, ordersSnap] = await Promise.all([
        getDocs(query(collection(db, 'payments'), orderBy('date', 'desc'))),
        getDocs(collection(db, 'productionJobs')),
        getDocs(collection(db, 'complaints')),
        getDocs(query(collection(db, 'salesOrders'), orderBy('createdAt', 'desc'))),
      ]);

      // Revenue last 6 months
      const now = dayjs();
      const months = [];
      for (let i = 5; i >= 0; i--) {
        const m = now.subtract(i, 'month');
        const mStart = m.startOf('month').toISOString();
        const mEnd = m.endOf('month').toISOString();
        const rev = paymentsSnap.docs
          .filter(d => d.data().date >= mStart && d.data().date <= mEnd)
          .reduce((s, d) => s + (d.data().amount || 0), 0);
        months.push({ month: m.format('MMM'), revenue: rev });
      }
      setRevenueData(months);

      // Production efficiency
      const prodStats = jobsSnap.docs.map(d => {
        const data = d.data();
        const planned = data.plannedUnits || 0;
        const produced = data.producedUnits || 0;
        const efficiency = planned > 0 ? Math.round((produced / planned) * 100) : 0;
        return { name: data.schoolName?.split(' ')[0] || 'Job', produced, planned, efficiency };
      }).slice(0, 8);
      setProductionData(prodStats);

      // Complaint breakdown
      const statusCount = {};
      complaintsSnap.docs.forEach(d => {
        const s = d.data().status || 'Open';
        statusCount[s] = (statusCount[s] || 0) + 1;
      });
      setComplaintData(Object.entries(statusCount).map(([name, value]) => ({ name, value })));

      // Top schools by order value
      const schoolMap = {};
      ordersSnap.docs.forEach(d => {
        const data = d.data();
        if (data.schoolName) {
          schoolMap[data.schoolName] = (schoolMap[data.schoolName] || 0) + (data.totalAmount || 0);
        }
      });
      const schoolArr = Object.entries(schoolMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6)
        .map(([name, value]) => ({ name: name.split(' ')[0], value }));
      setSchoolData(schoolArr);

    } catch (err) {
      console.error('Reports fetch error:', err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div style={{ textAlign: 'center', padding: 60 }}><Spin size="large" /></div>;

  return (
    <div>
      <Title level={3} style={{ color: NAVY, marginBottom: 4 }}>Reports & Analytics</Title>
      <Text style={{ color: '#888', display: 'block', marginBottom: 24 }}>
        {dayjs().format('MMMM YYYY')} · Business intelligence overview
      </Text>

      <Row gutter={[16, 16]}>
        {/* Revenue Trend */}
        <Col xs={24} lg={16}>
          <Card title={<Text strong>Revenue Trend — Last 6 Months</Text>}
            style={{ borderRadius: 12, border: 'none', boxShadow: '0 2px 12px rgba(10,22,40,0.08)' }}
            styles={{ body: { paddingTop: 8 } }}>
            {revenueData.every(m => m.revenue === 0) ? (
              <div style={{ textAlign: 'center', padding: 40, color: '#aaa' }}>No payment data yet.</div>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={v => [`₹${v.toLocaleString()}`, 'Revenue']} />
                  <Bar dataKey="revenue" fill={NAVY} radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </Card>
        </Col>

        {/* Complaint Breakdown */}
        <Col xs={24} lg={8}>
          <Card title={<Text strong>Complaint Status</Text>}
            style={{ borderRadius: 12, border: 'none', boxShadow: '0 2px 12px rgba(10,22,40,0.08)', height: '100%' }}
            styles={{ body: { paddingTop: 8 } }}>
            {complaintData.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 40, color: '#aaa' }}>No complaint data yet.</div>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={complaintData} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                    {complaintData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </Card>
        </Col>

        {/* Production Efficiency */}
        <Col xs={24} lg={12}>
          <Card title={<Text strong>Production Efficiency by Job</Text>}
            style={{ borderRadius: 12, border: 'none', boxShadow: '0 2px 12px rgba(10,22,40,0.08)' }}
            styles={{ body: { paddingTop: 8 } }}>
            {productionData.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 40, color: '#aaa' }}>No production data yet.</div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={productionData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="planned" fill="#e0e0e0" name="Planned" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="produced" fill={GOLD} name="Produced" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </Card>
        </Col>

        {/* Top Schools */}
        <Col xs={24} lg={12}>
          <Card title={<Text strong>Top Schools by Order Value</Text>}
            style={{ borderRadius: 12, border: 'none', boxShadow: '0 2px 12px rgba(10,22,40,0.08)' }}
            styles={{ body: { paddingTop: 8 } }}>
            {schoolData.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 40, color: '#aaa' }}>No sales order data yet.</div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={schoolData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
                  <YAxis dataKey="name" type="category" width={70} />
                  <Tooltip formatter={v => [`₹${v.toLocaleString()}`, 'Order Value']} />
                  <Bar dataKey="value" fill={NAVY} radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
}
