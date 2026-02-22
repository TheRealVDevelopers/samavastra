import { useState } from 'react';
import {
  Table, Button, Tag, Typography, Modal, Form, Input,
  Row, Col, Space, message, Card, InputNumber, Select
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useCollection } from '@/hooks/useCollection';
import { orderBy } from 'firebase/firestore';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;
const NAVY = '#0a1628';
const GOLD = '#c9a84c';

export default function FinishedGoodsPage() {
  const { data: goods, loading, add, update, remove } = useCollection('finishedGoods', [orderBy('createdAt', 'desc')]);
  const { data: schools } = useCollection('schools');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form] = Form.useForm();

  const openCreate = () => { setEditingItem(null); form.resetFields(); setModalOpen(true); };
  const openEdit = (item) => { setEditingItem(item); form.setFieldsValue(item); setModalOpen(true); };

  const handleSubmit = async (values) => {
    const school = schools.find(s => s.id === values.schoolId);
    const payload = { ...values, schoolName: school?.schoolName || '' };
    if (editingItem) { await update(editingItem.id, payload); message.success('Updated'); }
    else { await add(payload); message.success('Added'); }
    setModalOpen(false);
  };

  const columns = [
    { title: 'Product', dataIndex: 'productName', key: 'productName', render: v => <Text strong>{v}</Text> },
    { title: 'School', dataIndex: 'schoolName', key: 'schoolName' },
    { title: 'Size', dataIndex: 'size', key: 'size', render: v => <Tag color="blue">{v || '—'}</Tag> },
    { title: 'Qty in Stock', dataIndex: 'qty', key: 'qty', render: v => <Text strong style={{ color: '#0a1628' }}>{v || 0}</Text> },
    { title: 'Unit Price', dataIndex: 'unitPrice', key: 'unitPrice', render: v => v ? `₹${v}` : '—' },
    { title: 'Last Updated', dataIndex: 'updatedAt', key: 'updatedAt', render: v => v ? dayjs(v).format('D MMM YYYY') : '—' },
    {
      title: 'Actions', key: 'actions',
      render: (_, r) => (
        <Space>
          <Button icon={<EditOutlined />} size="small" onClick={() => openEdit(r)} />
          <Button icon={<DeleteOutlined />} size="small" danger onClick={() => remove(r.id).then(() => message.success('Removed'))} />
        </Space>
      ),
    },
  ];

  const totalValue = goods.reduce((s, g) => s + ((g.qty || 0) * (g.unitPrice || 0)), 0);

  return (
    <div>
      <Row justify="space-between" align="middle" style={{ marginBottom: 20 }}>
        <Col>
          <Title level={3} style={{ color: NAVY, marginBottom: 4 }}>Finished Goods</Title>
          <Text style={{ color: '#888' }}>
            {goods.length} SKUs · Inventory value: <Text strong>₹{totalValue.toLocaleString()}</Text>
          </Text>
        </Col>
        <Col>
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate} style={{ background: NAVY, borderColor: GOLD }}>Add Stock</Button>
        </Col>
      </Row>

      <Card style={{ borderRadius: 12, border: 'none', boxShadow: '0 2px 12px rgba(10,22,40,0.08)' }}>
        <Table dataSource={goods} columns={columns} rowKey="id" loading={loading} pagination={{ pageSize: 20 }} />
      </Card>

      <Modal title={editingItem ? 'Edit Stock' : 'Add Finished Goods'} open={modalOpen} onCancel={() => setModalOpen(false)} footer={null} width={540}>
        <Form form={form} layout="vertical" onFinish={handleSubmit} style={{ marginTop: 16 }}>
          <Row gutter={16}>
            <Col span={16}><Form.Item label="Product Name" name="productName" rules={[{ required: true }]}><Input placeholder="e.g. School Shirt — Boys" /></Form.Item></Col>
            <Col span={8}><Form.Item label="Size" name="size"><Input placeholder="S / M / L / XL" /></Form.Item></Col>
            <Col span={12}><Form.Item label="School" name="schoolId"><Select placeholder="Select school" allowClear showSearch optionFilterProp="children">{schools.map(s => <Option key={s.id} value={s.id}>{s.schoolName}</Option>)}</Select></Form.Item></Col>
            <Col span={12}><Form.Item label="Qty in Stock" name="qty" rules={[{ required: true }]}><InputNumber min={0} style={{ width: '100%' }} /></Form.Item></Col>
            <Col span={12}><Form.Item label="Unit Price ₹" name="unitPrice"><InputNumber min={0} style={{ width: '100%' }} /></Form.Item></Col>
            <Col span={12}><Form.Item label="Colour" name="colour"><Input placeholder="e.g. White" /></Form.Item></Col>
          </Row>
          <div style={{ textAlign: 'right' }}>
            <Button onClick={() => setModalOpen(false)} style={{ marginRight: 8 }}>Cancel</Button>
            <Button type="primary" htmlType="submit" style={{ background: NAVY, borderColor: GOLD }}>{editingItem ? 'Update' : 'Add Stock'}</Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
