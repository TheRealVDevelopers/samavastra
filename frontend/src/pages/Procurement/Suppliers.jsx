import { useState } from 'react';
import {
  Table, Button, Tag, Typography, Modal, Form, Input,
  Row, Col, Space, message, Card, Select, Popconfirm
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, PhoneOutlined, MailOutlined } from '@ant-design/icons';
import { useCollection } from '@/hooks/useCollection';
import { orderBy } from 'firebase/firestore';

const { Title, Text } = Typography;
const { Option } = Select;
const NAVY = '#0a1628';
const GOLD = '#c9a84c';

export default function SuppliersPage() {
  const { data: suppliers, loading, add, update, remove } = useCollection('suppliers', [orderBy('name', 'asc')]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form] = Form.useForm();

  const openCreate = () => { setEditingItem(null); form.resetFields(); setModalOpen(true); };
  const openEdit = (s) => { setEditingItem(s); form.setFieldsValue(s); setModalOpen(true); };

  const handleSubmit = async (values) => {
    if (editingItem) { await update(editingItem.id, values); message.success('Supplier updated'); }
    else { await add(values); message.success('Supplier added'); }
    setModalOpen(false);
  };

  const columns = [
    { title: 'Supplier Name', dataIndex: 'name', key: 'name', render: v => <Text strong>{v}</Text> },
    { title: 'Category', dataIndex: 'category', key: 'category', render: v => <Tag color="blue">{v || '—'}</Tag> },
    {
      title: 'Contact',
      key: 'contact',
      render: (_, r) => (
        <div>
          {r.contactPerson && <Text style={{ fontSize: 12, display: 'block' }}>{r.contactPerson}</Text>}
          {r.phone && <Text style={{ fontSize: 12 }}><PhoneOutlined /> {r.phone}</Text>}
        </div>
      ),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      render: v => v ? <a href={`mailto:${v}`}>{v}</a> : '—',
    },
    { title: 'City', dataIndex: 'city', key: 'city', render: v => v || '—' },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: v => <Tag color={v === 'active' ? 'green' : 'red'}>{v || 'active'}</Tag>,
    },
    {
      title: 'Actions', key: 'actions',
      render: (_, r) => (
        <Space>
          <Button icon={<EditOutlined />} size="small" onClick={() => openEdit(r)} />
          <Popconfirm title="Remove supplier?" onConfirm={() => remove(r.id).then(() => message.success('Removed'))}>
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
          <Title level={3} style={{ color: NAVY, marginBottom: 4 }}>Suppliers</Title>
          <Text style={{ color: '#888' }}>{suppliers.length} supplier{suppliers.length !== 1 ? 's' : ''}</Text>
        </Col>
        <Col>
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate} style={{ background: NAVY, borderColor: GOLD }}>Add Supplier</Button>
        </Col>
      </Row>
      <Card style={{ borderRadius: 12, border: 'none', boxShadow: '0 2px 12px rgba(10,22,40,0.08)' }}>
        <Table dataSource={suppliers} columns={columns} rowKey="id" loading={loading} pagination={{ pageSize: 20 }} />
      </Card>
      <Modal title={editingItem ? 'Edit Supplier' : 'Add Supplier'} open={modalOpen} onCancel={() => setModalOpen(false)} footer={null} width={560}>
        <Form form={form} layout="vertical" onFinish={handleSubmit} style={{ marginTop: 16 }}>
          <Row gutter={16}>
            <Col span={16}><Form.Item label="Supplier Name" name="name" rules={[{ required: true }]}><Input /></Form.Item></Col>
            <Col span={8}>
              <Form.Item label="Category" name="category">
                <Select placeholder="Category">
                  <Option value="Fabric">Fabric</Option>
                  <Option value="Thread">Thread</Option>
                  <Option value="Accessories">Accessories</Option>
                  <Option value="Packaging">Packaging</Option>
                  <Option value="Machinery">Machinery</Option>
                  <Option value="Other">Other</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}><Form.Item label="Contact Person" name="contactPerson"><Input /></Form.Item></Col>
            <Col span={12}><Form.Item label="Phone" name="phone"><Input /></Form.Item></Col>
            <Col span={12}><Form.Item label="Email" name="email"><Input /></Form.Item></Col>
            <Col span={12}><Form.Item label="GSTIN" name="gstin"><Input /></Form.Item></Col>
            <Col span={12}><Form.Item label="City" name="city"><Input /></Form.Item></Col>
            <Col span={12}><Form.Item label="Status" name="status" initialValue="active"><Select><Option value="active">Active</Option><Option value="inactive">Inactive</Option></Select></Form.Item></Col>
            <Col span={24}><Form.Item label="Address" name="address"><Input.TextArea rows={2} /></Form.Item></Col>
          </Row>
          <div style={{ textAlign: 'right' }}>
            <Button onClick={() => setModalOpen(false)} style={{ marginRight: 8 }}>Cancel</Button>
            <Button type="primary" htmlType="submit" style={{ background: NAVY, borderColor: GOLD }}>{editingItem ? 'Update' : 'Add Supplier'}</Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
