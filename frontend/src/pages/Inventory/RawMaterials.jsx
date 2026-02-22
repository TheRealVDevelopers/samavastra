import { useState } from 'react';
import {
  Table, Button, Tag, Typography, Modal, Form, Input,
  Row, Col, Space, message, Card, Popconfirm, Tooltip, InputNumber, Select, Progress
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, WarningOutlined } from '@ant-design/icons';
import { useCollection } from '@/hooks/useCollection';
import { orderBy } from 'firebase/firestore';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;
const NAVY = '#0a1628';
const GOLD = '#c9a84c';

function StockBadge({ qty, reorderLevel, maxLevel }) {
  const pct = maxLevel > 0 ? Math.min(100, Math.round((qty / maxLevel) * 100)) : 0;
  let color = '#52c41a'; // green
  if (qty <= reorderLevel) color = '#ff4d4f'; // red
  else if (qty <= reorderLevel * 2) color = '#faad14'; // yellow

  return (
    <div style={{ minWidth: 120 }}>
      <Progress
        percent={pct}
        strokeColor={color}
        size="small"
        showInfo={false}
        style={{ marginBottom: 2 }}
      />
      <Text style={{ fontSize: 13, color, fontWeight: 600 }}>{qty}</Text>
      <Text style={{ fontSize: 11, color: '#aaa' }}> {maxLevel ? `/ ${maxLevel}` : 'units'}</Text>
      {qty <= reorderLevel && (
        <Tag color="red" style={{ marginLeft: 6, fontSize: 10 }}><WarningOutlined /> Reorder</Tag>
      )}
    </div>
  );
}

export default function RawMaterialsPage() {
  const { data: materials, loading, add, update, remove } = useCollection('rawMaterials', [orderBy('name', 'asc')]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form] = Form.useForm();

  const openCreate = () => { setEditingItem(null); form.resetFields(); setModalOpen(true); };
  const openEdit = (item) => { setEditingItem(item); form.setFieldsValue(item); setModalOpen(true); };

  const handleSubmit = async (values) => {
    if (editingItem) {
      await update(editingItem.id, values);
      message.success('Material updated');
    } else {
      await add(values);
      message.success('Material added');
    }
    setModalOpen(false);
  };

  const lowStockCount = materials.filter(m => m.currentQty <= (m.reorderLevel || 0)).length;

  const columns = [
    {
      title: 'Material Name',
      dataIndex: 'name',
      key: 'name',
      render: v => <Text strong>{v}</Text>,
    },
    { title: 'Category', dataIndex: 'category', key: 'category', render: v => <Tag color="blue">{v || '—'}</Tag> },
    { title: 'Unit', dataIndex: 'unit', key: 'unit', render: v => v || '—' },
    {
      title: 'Current Stock',
      key: 'stock',
      render: (_, r) => (
        <StockBadge
          qty={r.currentQty || 0}
          reorderLevel={r.reorderLevel || 0}
          maxLevel={r.maxLevel || 0}
        />
      ),
      width: 200,
    },
    { title: 'Reorder Level', dataIndex: 'reorderLevel', key: 'reorderLevel', render: v => v || '—' },
    {
      title: 'Last Updated',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      render: v => v ? dayjs(v).format('D MMM YYYY') : dayjs().format('D MMM YYYY'),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button icon={<EditOutlined />} size="small" onClick={() => openEdit(record)} />
          <Popconfirm title="Remove material?" onConfirm={() => remove(record.id).then(() => message.success('Removed'))}>
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
          <Title level={3} style={{ color: NAVY, marginBottom: 4 }}>Raw Materials</Title>
          <Text style={{ color: '#888' }}>
            {materials.length} materials ·{' '}
            {lowStockCount > 0 && <Text style={{ color: '#ff4d4f' }}>{lowStockCount} need reorder</Text>}
            {lowStockCount === 0 && <Text style={{ color: '#52c41a' }}>All stock levels OK</Text>}
          </Text>
        </Col>
        <Col>
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate} style={{ background: NAVY, borderColor: GOLD }}>
            Add Material
          </Button>
        </Col>
      </Row>

      <Card style={{ borderRadius: 12, border: 'none', boxShadow: '0 2px 12px rgba(10,22,40,0.08)' }}>
        <Table
          dataSource={materials}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 20 }}
          rowClassName={r => r.currentQty <= (r.reorderLevel || 0) ? 'row-danger' : ''}
        />
      </Card>

      <Modal
        title={editingItem ? 'Edit Material' : 'Add Raw Material'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        width={540}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit} style={{ marginTop: 16 }}>
          <Row gutter={16}>
            <Col span={16}>
              <Form.Item label="Material Name" name="name" rules={[{ required: true }]}>
                <Input placeholder="e.g. Cotton Fabric — White" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="Unit" name="unit" initialValue="meters">
                <Select>
                  <Option value="meters">meters</Option>
                  <Option value="kg">kg</Option>
                  <Option value="yards">yards</Option>
                  <Option value="pcs">pcs</Option>
                  <Option value="rolls">rolls</Option>
                  <Option value="liters">liters</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Category" name="category">
                <Select placeholder="Category">
                  <Option value="Fabric">Fabric</Option>
                  <Option value="Thread">Thread</Option>
                  <Option value="Buttons">Buttons</Option>
                  <Option value="Zippers">Zippers</Option>
                  <Option value="Accessories">Accessories</Option>
                  <Option value="Packaging">Packaging</Option>
                  <Option value="Other">Other</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Current Stock" name="currentQty" rules={[{ required: true }]}>
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Reorder Level (alert below this)" name="reorderLevel">
                <InputNumber min={0} style={{ width: '100%' }} placeholder="e.g. 50" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Max Level (for progress bar)" name="maxLevel">
                <InputNumber min={0} style={{ width: '100%' }} placeholder="e.g. 500" />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item label="Supplier / Notes" name="notes">
                <Input.TextArea rows={2} placeholder="Supplier name, notes..." />
              </Form.Item>
            </Col>
          </Row>
          <div style={{ textAlign: 'right' }}>
            <Button onClick={() => setModalOpen(false)} style={{ marginRight: 8 }}>Cancel</Button>
            <Button type="primary" htmlType="submit" style={{ background: NAVY, borderColor: GOLD }}>
              {editingItem ? 'Update' : 'Add Material'}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
