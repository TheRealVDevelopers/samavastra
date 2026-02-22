import { useState } from 'react';
import {
  Table, Button, Tag, Typography, Modal, Form, Input,
  Row, Col, Space, message, Card, InputNumber, Select,
  DatePicker, Statistic, Popconfirm
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useCollection } from '@/hooks/useCollection';
import { orderBy } from 'firebase/firestore';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;
const NAVY = '#0a1628';
const GOLD = '#c9a84c';

const modeColors = { Cash: 'green', 'Bank Transfer': 'blue', Cheque: 'orange', UPI: 'purple', Other: 'default' };

export default function PaymentsPage() {
  const { data: payments, loading, add, update, remove } = useCollection('payments', [orderBy('date', 'desc')]);
  const { data: schools } = useCollection('schools');
  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm();

  const handleSubmit = async (values) => {
    const school = schools.find(s => s.id === values.schoolId);
    await add({
      ...values,
      schoolName: school?.schoolName || '',
      date: values.date ? values.date.toISOString() : new Date().toISOString(),
    });
    message.success('Payment recorded');
    setModalOpen(false);
  };

  const totalThisMonth = payments
    .filter(p => dayjs(p.date).month() === dayjs().month() && dayjs(p.date).year() === dayjs().year())
    .reduce((s, p) => s + (p.amount || 0), 0);

  const columns = [
    { title: 'School', dataIndex: 'schoolName', key: 'schoolName', render: v => <Text strong>{v}</Text> },
    { title: 'Amount', dataIndex: 'amount', key: 'amount', render: v => <Text strong style={{ color: '#52c41a' }}>₹{(v || 0).toLocaleString()}</Text> },
    { title: 'Mode', dataIndex: 'paymentMode', key: 'paymentMode', render: v => <Tag color={modeColors[v] || 'default'}>{v || '—'}</Tag> },
    { title: 'Reference', dataIndex: 'reference', key: 'reference', render: v => v || '—' },
    { title: 'Date', dataIndex: 'date', key: 'date', render: v => v ? dayjs(v).format('D MMM YYYY') : '—' },
    { title: 'Notes', dataIndex: 'notes', key: 'notes', render: v => v || '—' },
    {
      title: 'Actions', key: 'actions',
      render: (_, r) => (
        <Popconfirm title="Delete this payment?" onConfirm={() => remove(r.id).then(() => message.success('Deleted'))}>
          <Button icon={<DeleteOutlined />} size="small" danger />
        </Popconfirm>
      ),
    },
  ];

  return (
    <div>
      <Row gutter={16} style={{ marginBottom: 20 }}>
        <Col span={8}>
          <Card style={{ borderRadius: 12, border: 'none', boxShadow: '0 2px 12px rgba(10,22,40,0.08)' }} styles={{ body: { padding: 20 } }}>
            <Statistic title="Total Payments" value={payments.reduce((s, p) => s + (p.amount || 0), 0)} prefix="₹" valueStyle={{ color: NAVY, fontWeight: 700 }} />
          </Card>
        </Col>
        <Col span={8}>
          <Card style={{ borderRadius: 12, border: 'none', boxShadow: '0 2px 12px rgba(10,22,40,0.08)' }} styles={{ body: { padding: 20 } }}>
            <Statistic title="This Month" value={totalThisMonth} prefix="₹" valueStyle={{ color: '#52c41a', fontWeight: 700 }} />
          </Card>
        </Col>
        <Col span={8}>
          <Card style={{ borderRadius: 12, border: 'none', boxShadow: '0 2px 12px rgba(10,22,40,0.08)' }} styles={{ body: { padding: 20 } }}>
            <Statistic title="Total Transactions" value={payments.length} valueStyle={{ color: NAVY, fontWeight: 700 }} />
          </Card>
        </Col>
      </Row>

      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Title level={3} style={{ color: NAVY, margin: 0 }}>Payments</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => { form.resetFields(); setModalOpen(true); }} style={{ background: NAVY, borderColor: GOLD }}>Record Payment</Button>
      </Row>

      <Card style={{ borderRadius: 12, border: 'none', boxShadow: '0 2px 12px rgba(10,22,40,0.08)' }}>
        <Table dataSource={payments} columns={columns} rowKey="id" loading={loading} pagination={{ pageSize: 15 }} />
      </Card>

      <Modal title="Record Payment" open={modalOpen} onCancel={() => setModalOpen(false)} footer={null} width={480}>
        <Form form={form} layout="vertical" onFinish={handleSubmit} style={{ marginTop: 16 }}>
          <Row gutter={16}>
            <Col span={24}><Form.Item label="School" name="schoolId" rules={[{ required: true }]}><Select placeholder="Select school" showSearch optionFilterProp="children">{schools.map(s => <Option key={s.id} value={s.id}>{s.schoolName}</Option>)}</Select></Form.Item></Col>
            <Col span={12}><Form.Item label="Amount (₹)" name="amount" rules={[{ required: true }]}><InputNumber min={1} style={{ width: '100%' }} /></Form.Item></Col>
            <Col span={12}><Form.Item label="Payment Date" name="date" rules={[{ required: true }]}><DatePicker style={{ width: '100%' }} /></Form.Item></Col>
            <Col span={12}><Form.Item label="Payment Mode" name="paymentMode" initialValue="Bank Transfer"><Select><Option value="Cash">Cash</Option><Option value="Bank Transfer">Bank Transfer</Option><Option value="Cheque">Cheque</Option><Option value="UPI">UPI</Option><Option value="Other">Other</Option></Select></Form.Item></Col>
            <Col span={12}><Form.Item label="Reference No." name="reference"><Input placeholder="Cheque / UTR no." /></Form.Item></Col>
            <Col span={24}><Form.Item label="Notes" name="notes"><Input.TextArea rows={2} placeholder="Notes..." /></Form.Item></Col>
          </Row>
          <div style={{ textAlign: 'right' }}>
            <Button onClick={() => setModalOpen(false)} style={{ marginRight: 8 }}>Cancel</Button>
            <Button type="primary" htmlType="submit" style={{ background: NAVY, borderColor: GOLD }}>Record Payment</Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
