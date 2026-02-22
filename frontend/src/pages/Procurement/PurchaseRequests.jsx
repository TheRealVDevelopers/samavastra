import { useState } from 'react';
import {
  Table, Button, Tag, Typography, Modal, Form, Input,
  Row, Col, Space, message, Card, Select, DatePicker,
  InputNumber, Popconfirm
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useCollection } from '@/hooks/useCollection';
import { orderBy } from 'firebase/firestore';
import { useSelector } from 'react-redux';
import { selectAuth } from '@/redux/auth/selectors';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;
const NAVY = '#0a1628';
const GOLD = '#c9a84c';
const STATUS_COLORS = { Pending: 'orange', Approved: 'blue', Ordered: 'purple', Received: 'green', Rejected: 'red' };

export default function PurchaseRequestsPage() {
  const { data: requests, loading, add, update, remove } = useCollection('purchaseRequests', [orderBy('createdAt', 'desc')]);
  const { data: suppliers } = useCollection('suppliers');
  const { current: user } = useSelector(selectAuth);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form] = Form.useForm();

  const openCreate = () => { setEditingItem(null); form.resetFields(); setModalOpen(true); };
  const openEdit = (r) => { setEditingItem(r); form.setFieldsValue({ ...r, requiredDate: r.requiredDate ? dayjs(r.requiredDate) : null }); setModalOpen(true); };

  const handleSubmit = async (values) => {
    const payload = {
      ...values,
      requiredDate: values.requiredDate ? values.requiredDate.toISOString() : null,
      requestedBy: user?.email || '',
    };
    if (editingItem) { await update(editingItem.id, payload); message.success('Request updated'); }
    else { await add({ ...payload, status: 'Pending' }); message.success('Purchase request raised'); }
    setModalOpen(false);
  };

  const handleApprove = async (id) => {
    await update(id, { status: 'Approved', approvedBy: user?.email, approvedAt: new Date().toISOString() });
    message.success('Request approved');
  };

  const columns = [
    { title: 'Item', dataIndex: 'itemName', key: 'itemName', render: v => <Text strong>{v}</Text> },
    { title: 'Qty', dataIndex: 'qty', key: 'qty' },
    { title: 'Est. Cost ₹', dataIndex: 'estimatedCost', key: 'estimatedCost', render: v => v ? `₹${Number(v).toLocaleString()}` : '—' },
    { title: 'Status', dataIndex: 'status', key: 'status', render: v => <Tag color={STATUS_COLORS[v] || 'default'}>{v}</Tag> },
    { title: 'Requested By', dataIndex: 'requestedBy', key: 'requestedBy', render: v => v || '—' },
    { title: 'Required By', dataIndex: 'requiredDate', key: 'requiredDate', render: v => v ? dayjs(v).format('D MMM YYYY') : '—' },
    {
      title: 'Actions', key: 'actions',
      render: (_, r) => (
        <Space>
          <Button icon={<EditOutlined />} size="small" onClick={() => openEdit(r)} />
          {r.status === 'Pending' && (
            <Button size="small" style={{ color: '#52c41a', borderColor: '#52c41a' }} onClick={() => handleApprove(r.id)}>Approve</Button>
          )}
          <Popconfirm title="Delete?" onConfirm={() => remove(r.id)}>
            <Button icon={<DeleteOutlined />} size="small" danger />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Row justify="space-between" align="middle" style={{ marginBottom: 20 }}>
        <Col>
          <Title level={3} style={{ color: NAVY, marginBottom: 4 }}>Purchase Requests</Title>
          <Text style={{ color: '#888' }}>{requests.filter(r => r.status === 'Pending').length} pending approval</Text>
        </Col>
        <Col>
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate} style={{ background: NAVY, borderColor: GOLD }}>New Request</Button>
        </Col>
      </Row>
      <Card style={{ borderRadius: 12, border: 'none', boxShadow: '0 2px 12px rgba(10,22,40,0.08)' }}>
        <Table dataSource={requests} columns={columns} rowKey="id" loading={loading} pagination={{ pageSize: 15 }} />
      </Card>
      <Modal title={editingItem ? 'Edit Request' : 'New Purchase Request'} open={modalOpen} onCancel={() => setModalOpen(false)} footer={null} width={520}>
        <Form form={form} layout="vertical" onFinish={handleSubmit} style={{ marginTop: 16 }}>
          <Row gutter={16}>
            <Col span={16}><Form.Item label="Item / Material Name" name="itemName" rules={[{ required: true }]}><Input /></Form.Item></Col>
            <Col span={8}><Form.Item label="Quantity" name="qty" rules={[{ required: true }]}><InputNumber min={1} style={{ width: '100%' }} /></Form.Item></Col>
            <Col span={12}><Form.Item label="Unit" name="unit" initialValue="pcs"><Select><Option value="pcs">pcs</Option><Option value="meters">meters</Option><Option value="kg">kg</Option><Option value="rolls">rolls</Option><Option value="liters">liters</Option></Select></Form.Item></Col>
            <Col span={12}><Form.Item label="Estimated Cost ₹" name="estimatedCost"><InputNumber min={0} style={{ width: '100%' }} /></Form.Item></Col>
            <Col span={12}><Form.Item label="Required By Date" name="requiredDate"><DatePicker style={{ width: '100%' }} /></Form.Item></Col>
            <Col span={12}><Form.Item label="Department" name="department"><Select placeholder="Department"><Option value="Production">Production</Option><Option value="Logistics">Logistics</Option><Option value="Admin">Admin</Option><Option value="Other">Other</Option></Select></Form.Item></Col>
            <Col span={24}><Form.Item label="Justification" name="notes"><Input.TextArea rows={2} /></Form.Item></Col>
          </Row>
          <div style={{ textAlign: 'right' }}>
            <Button onClick={() => setModalOpen(false)} style={{ marginRight: 8 }}>Cancel</Button>
            <Button type="primary" htmlType="submit" style={{ background: NAVY, borderColor: GOLD }}>{editingItem ? 'Update' : 'Submit Request'}</Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
