import { useState } from 'react';
import {
  Table, Button, Tag, Typography, Modal, Form, Input,
  Row, Col, Space, message, Card, Select, DatePicker, Popconfirm, Steps
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, CarOutlined } from '@ant-design/icons';
import { useCollection } from '@/hooks/useCollection';
import { orderBy } from 'firebase/firestore';
import { useSelector } from 'react-redux';
import { selectAuth } from '@/redux/auth/selectors';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;
const NAVY = '#0a1628';
const GOLD = '#c9a84c';
const STATUS_COLORS = {
  Preparing: 'orange', Dispatched: 'blue', 'Out for Delivery': 'purple',
  Delivered: 'green', Failed: 'red', Returned: 'default'
};
const STAGES = ['Preparing', 'Dispatched', 'Out for Delivery', 'Delivered'];

export default function ShipmentsPage() {
  const { data: shipments, loading, add, update, remove } = useCollection('shipments', [orderBy('createdAt', 'desc')]);
  const { data: schools } = useCollection('schools');
  const { data: orders } = useCollection('salesOrders');
  const { current: user } = useSelector(selectAuth);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form] = Form.useForm();

  const openCreate = () => { setEditingItem(null); form.resetFields(); setModalOpen(true); };
  const openEdit = (s) => {
    setEditingItem(s);
    form.setFieldsValue({ ...s, scheduledDate: s.scheduledDate ? dayjs(s.scheduledDate) : null });
    setModalOpen(true);
  };

  const handleSubmit = async (values) => {
    const school = schools.find(s => s.id === values.schoolId);
    const payload = {
      ...values,
      schoolName: school?.schoolName || '',
      scheduledDate: values.scheduledDate ? values.scheduledDate.toISOString() : null,
      createdBy: user?.email || '',
    };
    if (editingItem) { await update(editingItem.id, payload); message.success('Shipment updated'); }
    else { await add({ ...payload, status: 'Preparing' }); message.success('Shipment created'); }
    setModalOpen(false);
  };

  const advanceStage = async (shipment) => {
    const currentIdx = STAGES.indexOf(shipment.status);
    if (currentIdx < STAGES.length - 1) {
      const nextStatus = STAGES[currentIdx + 1];
      await update(shipment.id, {
        status: nextStatus,
        ...(nextStatus === 'Delivered' ? { deliveredAt: new Date().toISOString() } : {}),
      });
      message.success(`Shipment moved to: ${nextStatus}`);
    }
  };

  const columns = [
    { title: 'School', dataIndex: 'schoolName', key: 'schoolName', render: v => <Text strong>{v}</Text> },
    {
      title: 'Tracking',
      key: 'tracking',
      render: (_, r) => (
        <div>
          <Text style={{ fontSize: 12, display: 'block' }}>{r.trackingNumber || '—'}</Text>
          <Text style={{ fontSize: 11, color: '#888' }}>{r.carrier || '—'}</Text>
        </div>
      ),
    },
    { title: 'Status', dataIndex: 'status', key: 'status', render: v => <Tag color={STATUS_COLORS[v] || 'default'}>{v}</Tag> },
    { title: 'Boxes / Units', dataIndex: 'boxes', key: 'boxes', render: (v, r) => `${v || 0} boxes · ${r.units || 0} units` },
    { title: 'Scheduled', dataIndex: 'scheduledDate', key: 'scheduledDate', render: v => v ? dayjs(v).format('D MMM YYYY') : '—' },
    {
      title: 'Actions', key: 'actions',
      render: (_, r) => (
        <Space>
          <Button icon={<EditOutlined />} size="small" onClick={() => openEdit(r)} />
          {STAGES.includes(r.status) && STAGES.indexOf(r.status) < STAGES.length - 1 && (
            <Button size="small" icon={<CarOutlined />} type="primary" style={{ background: '#1890ff' }} onClick={() => advanceStage(r)}>
              Next Stage
            </Button>
          )}
          <Popconfirm title="Delete?" onConfirm={() => remove(r.id)}>
            <Button icon={<DeleteOutlined />} size="small" danger />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const dispatched = shipments.filter(s => s.status === 'Dispatched' || s.status === 'Out for Delivery').length;
  const delivered = shipments.filter(s => s.status === 'Delivered').length;

  return (
    <div>
      <Row gutter={16} style={{ marginBottom: 20 }}>
        {[
          { title: 'In Transit', value: dispatched, color: '#1890ff' },
          { title: 'Delivered', value: delivered, color: '#52c41a' },
          { title: 'Total Shipments', value: shipments.length, color: NAVY },
        ].map(s => (
          <Col span={8} key={s.title}>
            <Card style={{ borderRadius: 12, border: 'none', boxShadow: '0 2px 12px rgba(10,22,40,0.08)' }} styles={{ body: { padding: 20 } }}>
              <div><Text style={{ color: '#888', fontSize: 13 }}>{s.title}</Text><br />
                <Text style={{ color: s.color, fontSize: 28, fontWeight: 700 }}>{s.value}</Text>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Title level={3} style={{ color: NAVY, margin: 0 }}>Logistics — Shipments</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate} style={{ background: NAVY, borderColor: GOLD }}>New Shipment</Button>
      </Row>

      <Card style={{ borderRadius: 12, border: 'none', boxShadow: '0 2px 12px rgba(10,22,40,0.08)' }}>
        <Table
          dataSource={shipments} columns={columns} rowKey="id" loading={loading} pagination={{ pageSize: 15 }}
          expandable={{
            expandedRowRender: r => {
              const stageIdx = STAGES.indexOf(r.status);
              return (
                <Steps
                  current={stageIdx >= 0 ? stageIdx : 0}
                  size="small"
                  style={{ padding: '12px 24px' }}
                  items={STAGES.map(s => ({ title: s }))}
                />
              );
            },
          }}
        />
      </Card>

      <Modal title={editingItem ? 'Edit Shipment' : 'New Shipment'} open={modalOpen} onCancel={() => setModalOpen(false)} footer={null} width={560}>
        <Form form={form} layout="vertical" onFinish={handleSubmit} style={{ marginTop: 16 }}>
          <Row gutter={16}>
            <Col span={24}><Form.Item label="School" name="schoolId" rules={[{ required: true }]}><Select placeholder="Select school" showSearch optionFilterProp="children">{schools.map(s => <Option key={s.id} value={s.id}>{s.schoolName}</Option>)}</Select></Form.Item></Col>
            <Col span={12}><Form.Item label="Carrier / Courier" name="carrier"><Input placeholder="e.g. Delhivery, DTDC" /></Form.Item></Col>
            <Col span={12}><Form.Item label="Tracking Number" name="trackingNumber"><Input placeholder="AWB / Tracking No." /></Form.Item></Col>
            <Col span={12}><Form.Item label="No. of Boxes" name="boxes"><Input type="number" min={1} /></Form.Item></Col>
            <Col span={12}><Form.Item label="Total Units" name="units"><Input type="number" min={1} /></Form.Item></Col>
            <Col span={12}><Form.Item label="Scheduled Date" name="scheduledDate"><DatePicker style={{ width: '100%' }} /></Form.Item></Col>
            <Col span={12}><Form.Item label="Delivery Address" name="deliveryAddress"><Input placeholder="Full delivery address" /></Form.Item></Col>
            <Col span={24}><Form.Item label="Notes" name="notes"><Input.TextArea rows={2} /></Form.Item></Col>
          </Row>
          <div style={{ textAlign: 'right' }}>
            <Button onClick={() => setModalOpen(false)} style={{ marginRight: 8 }}>Cancel</Button>
            <Button type="primary" htmlType="submit" style={{ background: NAVY, borderColor: GOLD }}>{editingItem ? 'Update' : 'Create Shipment'}</Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
