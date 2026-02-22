import { useState } from 'react';
import {
  Table, Button, Tag, Typography, Modal, Form, Input,
  Row, Col, Space, message, Card, Select, InputNumber,
  Popconfirm, Timeline, Divider
} from 'antd';
import { PlusOutlined, ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import { useCollection } from '@/hooks/useCollection';
import { orderBy } from 'firebase/firestore';
import { db } from '@/firebase';
import { doc, updateDoc, increment } from 'firebase/firestore';
import { useSelector } from 'react-redux';
import { selectAuth } from '@/redux/auth/selectors';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;
const NAVY = '#0a1628';
const GOLD = '#c9a84c';

export default function StockMovementsPage() {
  const { data: movements, loading, add } = useCollection('stockMovements', [orderBy('createdAt', 'desc')]);
  const { data: rawMaterials } = useCollection('rawMaterials');
  const { data: finishedGoods } = useCollection('finishedGoods');
  const { current: user } = useSelector(selectAuth);
  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [movementType, setMovementType] = useState('in');

  const allItems = [
    ...rawMaterials.map(m => ({ id: m.id, name: m.name, type: 'Raw Material', collection: 'rawMaterials', currentQty: m.currentQty || 0 })),
    ...finishedGoods.map(g => ({ id: g.id, name: g.productName, type: 'Finished Good', collection: 'finishedGoods', currentQty: g.qty || 0 })),
  ];

  const handleSubmit = async (values) => {
    const item = allItems.find(i => i.id === values.itemId);
    if (!item) { message.error('Item not found'); return; }

    const qty = values.qty || 0;
    const isIn = movementType === 'in';

    // Check sufficient stock for outgoing
    if (!isIn && item.currentQty < qty) {
      message.error(`Insufficient stock. Current: ${item.currentQty} ${item.type === 'Raw Material' ? 'units' : 'pcs'}`);
      return;
    }

    // Record movement
    await add({
      itemId: item.id,
      itemName: item.name,
      itemType: item.type,
      collection: item.collection,
      type: movementType,
      qty,
      reason: values.reason,
      reference: values.reference || '',
      recordedBy: user?.email || '',
      previousQty: item.currentQty,
      newQty: isIn ? item.currentQty + qty : item.currentQty - qty,
    });

    // Update item stock
    const fieldName = item.collection === 'rawMaterials' ? 'currentQty' : 'qty';
    await updateDoc(doc(db, item.collection, item.id), {
      [fieldName]: isIn ? item.currentQty + qty : item.currentQty - qty,
      updatedAt: new Date().toISOString(),
    });

    message.success(`✅ Stock ${isIn ? 'added' : 'deducted'}: ${qty} units of ${item.name}`);
    setModalOpen(false);
  };

  const columns = [
    {
      title: 'Movement',
      key: 'movement',
      render: (_, r) => (
        <Tag
          color={r.type === 'in' ? 'green' : 'red'}
          icon={r.type === 'in' ? <ArrowDownOutlined /> : <ArrowUpOutlined />}
          style={{ fontWeight: 600 }}
        >
          {r.type === 'in' ? 'IN' : 'OUT'}
        </Tag>
      ),
      width: 80,
    },
    { title: 'Item', dataIndex: 'itemName', key: 'itemName', render: v => <Text strong>{v}</Text> },
    { title: 'Type', dataIndex: 'itemType', key: 'itemType', render: v => <Tag color="blue">{v}</Tag> },
    { title: 'Qty', dataIndex: 'qty', key: 'qty', render: (v, r) => <Text style={{ color: r.type === 'in' ? '#52c41a' : '#ff4d4f', fontWeight: 700 }}>{r.type === 'in' ? '+' : '-'}{v}</Text> },
    {
      title: 'Stock Change',
      key: 'change',
      render: (_, r) => (
        <Text style={{ fontSize: 12, color: '#888' }}>
          {r.previousQty} → <Text strong style={{ color: NAVY }}>{r.newQty}</Text>
        </Text>
      ),
    },
    { title: 'Reason', dataIndex: 'reason', key: 'reason', ellipsis: true },
    { title: 'Reference', dataIndex: 'reference', key: 'reference', render: v => v || '—' },
    { title: 'By', dataIndex: 'recordedBy', key: 'recordedBy', render: v => v || '—', ellipsis: true },
    { title: 'Date', dataIndex: 'createdAt', key: 'createdAt', render: v => v ? dayjs(v).format('D MMM HH:mm') : '—' },
  ];

  const inCount = movements.filter(m => m.type === 'in').length;
  const outCount = movements.filter(m => m.type === 'out').length;

  return (
    <div>
      <Row justify="space-between" align="middle" style={{ marginBottom: 20 }}>
        <Col>
          <Title level={3} style={{ color: NAVY, marginBottom: 4 }}>Stock Movements</Title>
          <Text style={{ color: '#888' }}>
            <Text style={{ color: '#52c41a', fontWeight: 600 }}>↓ {inCount} IN</Text>
            {' · '}
            <Text style={{ color: '#ff4d4f', fontWeight: 600 }}>↑ {outCount} OUT</Text>
            {' · '}{movements.length} total movements
          </Text>
        </Col>
        <Col>
          <Space>
            <Button
              type="primary"
              icon={<ArrowDownOutlined />}
              onClick={() => { setMovementType('in'); form.resetFields(); setModalOpen(true); }}
              style={{ background: '#52c41a', borderColor: '#52c41a' }}
            >
              Stock In
            </Button>
            <Button
              type="primary"
              icon={<ArrowUpOutlined />}
              onClick={() => { setMovementType('out'); form.resetFields(); setModalOpen(true); }}
              danger
            >
              Stock Out
            </Button>
          </Space>
        </Col>
      </Row>

      <Card style={{ borderRadius: 12, border: 'none', boxShadow: '0 2px 12px rgba(10,22,40,0.08)' }}>
        <Table
          dataSource={movements}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 20 }}
          rowClassName={r => r.type === 'in' ? '' : ''}
        />
      </Card>

      <Modal
        title={
          <span style={{ color: movementType === 'in' ? '#52c41a' : '#ff4d4f' }}>
            {movementType === 'in' ? '↓ Stock IN — Add to Inventory' : '↑ Stock OUT — Remove from Inventory'}
          </span>
        }
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        width={480}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit} style={{ marginTop: 16 }}>
          <Form.Item label="Item" name="itemId" rules={[{ required: true }]}>
            <Select placeholder="Select material or finished good" showSearch optionFilterProp="children">
              <Select.OptGroup label="Raw Materials">
                {rawMaterials.map(m => (
                  <Option key={m.id} value={m.id}>
                    {m.name} <Text style={{ color: '#888', fontSize: 11 }}>(Stock: {m.currentQty || 0})</Text>
                  </Option>
                ))}
              </Select.OptGroup>
              <Select.OptGroup label="Finished Goods">
                {finishedGoods.map(g => (
                  <Option key={g.id} value={g.id}>
                    {g.productName} <Text style={{ color: '#888', fontSize: 11 }}>(Stock: {g.qty || 0})</Text>
                  </Option>
                ))}
              </Select.OptGroup>
            </Select>
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Quantity" name="qty" rules={[{ required: true }]}>
                <InputNumber min={1} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="Reason" name="reason" rules={[{ required: true }]}>
            <Select placeholder="Reason for movement">
              {movementType === 'in' ? (
                <>
                  <Option value="Purchase received">Purchase received</Option>
                  <Option value="Production return">Production return (unused)</Option>
                  <Option value="Transfer in">Transfer in</Option>
                  <Option value="Adjustment (audit)">Adjustment (audit)</Option>
                </>
              ) : (
                <>
                  <Option value="Production use">Production use</Option>
                  <Option value="Order dispatched">Order dispatched</Option>
                  <Option value="Damaged / scrapped">Damaged / scrapped</Option>
                  <Option value="Transfer out">Transfer out</Option>
                  <Option value="Adjustment (audit)">Adjustment (audit)</Option>
                </>
              )}
            </Select>
          </Form.Item>

          <Form.Item label="Reference / PO / Order No." name="reference">
            <Input placeholder="Optional reference number" />
          </Form.Item>

          <div style={{ textAlign: 'right' }}>
            <Button onClick={() => setModalOpen(false)} style={{ marginRight: 8 }}>Cancel</Button>
            <Button
              type="primary"
              htmlType="submit"
              style={movementType === 'in' ? { background: '#52c41a', borderColor: '#52c41a' } : { background: '#ff4d4f', borderColor: '#ff4d4f' }}
            >
              Confirm {movementType === 'in' ? 'Stock In' : 'Stock Out'}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
