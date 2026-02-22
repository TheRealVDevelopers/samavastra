import { useState } from 'react';
import {
  Table, Button, Tag, Typography, Modal, Form, Input,
  Row, Col, Space, message, Card, Select, DatePicker,
  InputNumber, Popconfirm, Statistic
} from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { useCollection } from '@/hooks/useCollection';
import { orderBy } from 'firebase/firestore';
import { useSelector } from 'react-redux';
import { selectAuth } from '@/redux/auth/selectors';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;
const NAVY = '#0a1628';
const GOLD = '#c9a84c';

const EXPENSE_CATEGORIES = [
  'Utilities', 'Rent', 'Salaries', 'Transport', 'Raw Materials',
  'Maintenance', 'Marketing', 'Office Supplies', 'Travel', 'Other'
];

export default function ExpensesPage() {
  const { data: expenses, loading, add, remove } = useCollection('expenses', [orderBy('date', 'desc')]);
  const { current: user } = useSelector(selectAuth);
  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm();

  const handleSubmit = async (values) => {
    await add({
      ...values,
      date: values.date ? values.date.toISOString() : new Date().toISOString(),
      addedBy: user?.email || '',
    });
    message.success('Expense recorded');
    setModalOpen(false);
  };

  const thisMonth = dayjs().format('YYYY-MM');
  const thisMonthTotal = expenses
    .filter(e => e.date && e.date.startsWith(thisMonth))
    .reduce((s, e) => s + (e.amount || 0), 0);

  const totalExpenses = expenses.reduce((s, e) => s + (e.amount || 0), 0);

  // Category breakdown
  const categoryMap = {};
  expenses.forEach(e => {
    categoryMap[e.category] = (categoryMap[e.category] || 0) + (e.amount || 0);
  });
  const topCategory = Object.entries(categoryMap).sort((a, b) => b[1] - a[1])[0];

  const columns = [
    { title: 'Description', dataIndex: 'description', key: 'description', render: v => <Text strong>{v}</Text> },
    { title: 'Category', dataIndex: 'category', key: 'category', render: v => <Tag color="blue">{v || '—'}</Tag> },
    { title: 'Amount', dataIndex: 'amount', key: 'amount', render: v => <Text strong style={{ color: '#ff4d4f' }}>₹{(v || 0).toLocaleString()}</Text> },
    { title: 'Date', dataIndex: 'date', key: 'date', render: v => v ? dayjs(v).format('D MMM YYYY') : '—' },
    { title: 'Added By', dataIndex: 'addedBy', key: 'addedBy', render: v => v || '—' },
    { title: 'Notes', dataIndex: 'notes', key: 'notes', render: v => v || '—', ellipsis: true },
    {
      title: 'Actions', key: 'actions',
      render: (_, r) => (
        <Popconfirm title="Delete expense?" onConfirm={() => remove(r.id).then(() => message.success('Deleted'))}>
          <Button icon={<DeleteOutlined />} size="small" danger />
        </Popconfirm>
      ),
    },
  ];

  return (
    <div>
      <Row gutter={16} style={{ marginBottom: 20 }}>
        {[
          { title: 'This Month', value: thisMonthTotal, prefix: '₹', color: '#ff4d4f' },
          { title: 'Total Expenses', value: totalExpenses, prefix: '₹', color: NAVY },
          { title: 'Top Category', value: topCategory?.[0] || '—', color: '#fa8c16' },
        ].map(s => (
          <Col span={8} key={s.title}>
            <Card style={{ borderRadius: 12, border: 'none', boxShadow: '0 2px 12px rgba(10,22,40,0.08)' }} styles={{ body: { padding: 20 } }}>
              <Statistic title={s.title} value={s.value} prefix={s.prefix} valueStyle={{ color: s.color, fontWeight: 700 }} />
            </Card>
          </Col>
        ))}
      </Row>

      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Title level={3} style={{ color: NAVY, margin: 0 }}>Expenses</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => { form.resetFields(); setModalOpen(true); }} style={{ background: NAVY, borderColor: GOLD }}>Add Expense</Button>
      </Row>

      <Card style={{ borderRadius: 12, border: 'none', boxShadow: '0 2px 12px rgba(10,22,40,0.08)' }}>
        <Table dataSource={expenses} columns={columns} rowKey="id" loading={loading} pagination={{ pageSize: 15 }} />
      </Card>

      <Modal title="Record Expense" open={modalOpen} onCancel={() => setModalOpen(false)} footer={null} width={480}>
        <Form form={form} layout="vertical" onFinish={handleSubmit} style={{ marginTop: 16 }}>
          <Form.Item label="Description" name="description" rules={[{ required: true }]}>
            <Input placeholder="e.g. Monthly rent — Factory" />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}><Form.Item label="Category" name="category" rules={[{ required: true }]}><Select placeholder="Category">{EXPENSE_CATEGORIES.map(c => <Option key={c} value={c}>{c}</Option>)}</Select></Form.Item></Col>
            <Col span={12}><Form.Item label="Amount ₹" name="amount" rules={[{ required: true }]}><InputNumber min={0} style={{ width: '100%' }} /></Form.Item></Col>
            <Col span={12}><Form.Item label="Date" name="date" rules={[{ required: true }]}><DatePicker style={{ width: '100%' }} /></Form.Item></Col>
          </Row>
          <Form.Item label="Notes" name="notes"><Input.TextArea rows={2} /></Form.Item>
          <div style={{ textAlign: 'right' }}>
            <Button onClick={() => setModalOpen(false)} style={{ marginRight: 8 }}>Cancel</Button>
            <Button type="primary" htmlType="submit" style={{ background: NAVY, borderColor: GOLD }}>Save Expense</Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
