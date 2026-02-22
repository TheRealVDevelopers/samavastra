import { useState } from 'react';
import {
  Table, Button, Tag, Typography, Modal, Form, Input,
  Row, Col, Space, message, Card, Select, DatePicker,
  InputNumber, Popconfirm, Divider
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useCollection } from '@/hooks/useCollection';
import { orderBy } from 'firebase/firestore';
import { useSelector } from 'react-redux';
import { selectAuth } from '@/redux/auth/selectors';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;
const NAVY = '#0a1628';
const GOLD = '#c9a84c';
const STATUS_COLORS = { Draft: 'default', Sent: 'blue', Confirmed: 'purple', 'Partially Received': 'orange', Received: 'green', Cancelled: 'red' };

function ItemsEditor({ value = [], onChange }) {
  const add = () => onChange([...value, { description: '', qty: 1, unitPrice: 0 }]);
  const remove = (i) => onChange(value.filter((_, idx) => idx !== i));
  const updateItem = (i, field, val) => {
    const updated = value.map((item, idx) => idx === i ? { ...item, [field]: val } : item);
    onChange(updated);
  };
  const total = value.reduce((s, i) => s + ((i.qty || 0) * (i.unitPrice || 0)), 0);
  return (
    <div>
      {value.map((item, i) => (
        <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: 8, marginBottom: 8 }}>
          <Input value={item.description} onChange={e => updateItem(i, 'description', e.target.value)} placeholder="Item" />
          <InputNumber value={item.qty} onChange={v => updateItem(i, 'qty', v)} min={1} style={{ width: '100%' }} />
          <InputNumber value={item.unitPrice} onChange={v => updateItem(i, 'unitPrice', v)} min={0} style={{ width: '100%' }} placeholder="Price ₹" />
          <Button danger size="small" onClick={() => remove(i)}>✕</Button>
        </div>
      ))}
      <Button type="dashed" onClick={add} icon={<PlusOutlined />} block style={{ marginBottom: 8 }}>Add Item</Button>
      <div style={{ textAlign: 'right' }}><Text strong>Total: ₹{total.toLocaleString()}</Text></div>
    </div>
  );
}

export default function PurchaseOrdersPage() {
  const { data: orders, loading, add, update, remove } = useCollection('purchaseOrders', [orderBy('createdAt', 'desc')]);
  const { data: suppliers } = useCollection('suppliers');
  const { current: user } = useSelector(selectAuth);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form] = Form.useForm();

  const openCreate = () => { setEditingItem(null); form.resetFields(); setModalOpen(true); };
  const openEdit = (o) => {
    setEditingItem(o);
    form.setFieldsValue({ ...o, expectedDate: o.expectedDate ? dayjs(o.expectedDate) : null });
    setModalOpen(true);
  };

  const handleSubmit = async (values) => {
    const supplier = suppliers.find(s => s.id === values.supplierId);
    const items = values.items || [];
    const totalAmount = items.reduce((s, i) => s + ((i.qty || 0) * (i.unitPrice || 0)), 0);
    const payload = {
      ...values,
      supplierName: supplier?.name || '',
      totalAmount,
      expectedDate: values.expectedDate ? values.expectedDate.toISOString() : null,
      createdBy: user?.email || '',
    };
    if (editingItem) { await update(editingItem.id, payload); message.success('PO updated'); }
    else { await add({ ...payload, status: 'Draft' }); message.success('Purchase order created'); }
    setModalOpen(false);
  };

  const columns = [
    { title: 'Supplier', dataIndex: 'supplierName', key: 'supplierName', render: v => <Text strong>{v || '—'}</Text> },
    { title: 'Total ₹', dataIndex: 'totalAmount', key: 'totalAmount', render: v => `₹${(v || 0).toLocaleString()}` },
    { title: 'Status', dataIndex: 'status', key: 'status', render: v => <Tag color={STATUS_COLORS[v] || 'default'}>{v}</Tag> },
    { title: 'Expected', dataIndex: 'expectedDate', key: 'expectedDate', render: v => v ? dayjs(v).format('D MMM YYYY') : '—' },
    { title: 'Created', dataIndex: 'createdAt', key: 'createdAt', render: v => v ? dayjs(v).format('D MMM YYYY') : '—' },
    {
      title: 'Actions', key: 'actions',
      render: (_, r) => (
        <Space>
          <Button icon={<EditOutlined />} size="small" onClick={() => openEdit(r)} />
          {r.status === 'Draft' && (
            <Button size="small" style={{ color: '#1890ff', borderColor: '#1890ff' }} onClick={() => update(r.id, { status: 'Sent' }).then(() => message.success('PO sent'))}>
              Send
            </Button>
          )}
          {r.status === 'Sent' && (
            <Button size="small" style={{ color: '#52c41a', borderColor: '#52c41a' }} onClick={() => update(r.id, { status: 'Received', receivedAt: new Date().toISOString() }).then(() => message.success('Received'))}>
              Mark Received
            </Button>
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
          <Title level={3} style={{ color: NAVY, marginBottom: 4 }}>Purchase Orders</Title>
          <Text style={{ color: '#888' }}>{orders.filter(o => o.status === 'Draft').length} draft · {orders.filter(o => o.status === 'Sent').length} sent</Text>
        </Col>
        <Col>
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate} style={{ background: NAVY, borderColor: GOLD }}>New PO</Button>
        </Col>
      </Row>
      <Card style={{ borderRadius: 12, border: 'none', boxShadow: '0 2px 12px rgba(10,22,40,0.08)' }}>
        <Table dataSource={orders} columns={columns} rowKey="id" loading={loading} pagination={{ pageSize: 15 }} />
      </Card>
      <Modal title={editingItem ? 'Edit Purchase Order' : 'New Purchase Order'} open={modalOpen} onCancel={() => setModalOpen(false)} footer={null} width={700}>
        <Form form={form} layout="vertical" onFinish={handleSubmit} style={{ marginTop: 16 }}>
          <Row gutter={16}>
            <Col span={12}><Form.Item label="Supplier" name="supplierId" rules={[{ required: true }]}><Select placeholder="Select supplier" showSearch optionFilterProp="children">{suppliers.map(s => <Option key={s.id} value={s.id}>{s.name}</Option>)}</Select></Form.Item></Col>
            <Col span={12}><Form.Item label="Expected Delivery Date" name="expectedDate"><DatePicker style={{ width: '100%' }} /></Form.Item></Col>
            <Col span={24}><Divider orientation="left">Items</Divider><Form.Item name="items" initialValue={[]}><ItemsEditor /></Form.Item></Col>
            <Col span={24}><Form.Item label="Notes" name="notes"><Input.TextArea rows={2} /></Form.Item></Col>
          </Row>
          <div style={{ textAlign: 'right' }}>
            <Button onClick={() => setModalOpen(false)} style={{ marginRight: 8 }}>Cancel</Button>
            <Button type="primary" htmlType="submit" style={{ background: NAVY, borderColor: GOLD }}>{editingItem ? 'Update' : 'Create PO'}</Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
