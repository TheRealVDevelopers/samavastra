import { useState } from 'react';
import {
  Table, Button, Tag, Typography, Modal, Form, Input,
  Row, Col, Space, message, Card, InputNumber, Select, DatePicker,
  Statistic, Popconfirm, Timeline, Badge
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ExclamationCircleOutlined, ArrowUpOutlined } from '@ant-design/icons';
import { useCollection } from '@/hooks/useCollection';
import { orderBy } from 'firebase/firestore';
import { useSelector } from 'react-redux';
import { selectAuth } from '@/redux/auth/selectors';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;
const NAVY = '#0a1628';
const GOLD = '#c9a84c';

const PRIORITY = { Low: 'default', Medium: 'orange', High: 'red', Critical: 'purple' };
const STATUS_COLORS = { Open: 'red', 'In Progress': 'orange', Resolved: 'green', Closed: 'default', Escalated: 'purple' };

export default function ComplaintsPage() {
  const { data: complaints, loading, add, update, remove } = useCollection('complaints', [orderBy('createdAt', 'desc')]);
  const { data: schools } = useCollection('schools');
  const { current: user } = useSelector(selectAuth);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form] = Form.useForm();

  const openCreate = () => { setEditingItem(null); form.resetFields(); setModalOpen(true); };
  const openEdit = (item) => {
    setEditingItem(item);
    form.setFieldsValue({ ...item, date: item.date ? dayjs(item.date) : null });
    setModalOpen(true);
  };

  const handleSubmit = async (values) => {
    const school = schools.find(s => s.id === values.schoolId);
    const payload = {
      ...values,
      schoolName: school?.schoolName || '',
      date: values.date ? values.date.toISOString() : new Date().toISOString(),
    };
    if (editingItem) { await update(editingItem.id, payload); message.success('Complaint updated'); }
    else { await add({ ...payload, status: 'Open' }); message.success('Complaint registered'); }
    setModalOpen(false);
  };

  const handleEscalate = async (id) => {
    await update(id, { status: 'Escalated', escalatedAt: new Date().toISOString() });
    message.warning('Complaint escalated');
  };

  const handleResolve = async (id) => {
    await update(id, { status: 'Resolved', resolvedAt: new Date().toISOString() });
    message.success('Complaint resolved');
  };

  const openCount = complaints.filter(c => c.status === 'Open').length;
  const escalatedCount = complaints.filter(c => c.status === 'Escalated').length;

  const columns = [
    { title: 'School', dataIndex: 'schoolName', key: 'schoolName', render: v => <Text strong>{v}</Text> },
    { title: 'Subject', dataIndex: 'subject', key: 'subject', render: v => <Text>{v}</Text> },
    { title: 'Priority', dataIndex: 'priority', key: 'priority', render: v => <Tag color={PRIORITY[v] || 'default'}>{v || 'Medium'}</Tag> },
    { title: 'Status', dataIndex: 'status', key: 'status', render: v => <Tag color={STATUS_COLORS[v] || 'default'}>{v}</Tag> },
    { title: 'Raised On', dataIndex: 'date', key: 'date', render: v => v ? dayjs(v).format('D MMM YYYY') : '—' },
    {
      title: 'Actions', key: 'actions',
      render: (_, r) => (
        <Space>
          <Button icon={<EditOutlined />} size="small" onClick={() => openEdit(r)} />
          {r.status === 'Open' && <Button size="small" onClick={() => handleEscalate(r.id)} type="default" danger>Escalate</Button>}
          {(r.status === 'Open' || r.status === 'In Progress' || r.status === 'Escalated') && (
            <Button size="small" onClick={() => handleResolve(r.id)} style={{ color: '#52c41a', borderColor: '#52c41a' }}>Resolve</Button>
          )}
          <Popconfirm title="Delete complaint?" onConfirm={() => remove(r.id)}>
            <Button icon={<DeleteOutlined />} size="small" danger />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Row gutter={16} style={{ marginBottom: 20 }}>
        {[
          { title: 'Open Complaints', value: openCount, color: openCount > 0 ? '#ff4d4f' : '#52c41a' },
          { title: 'Escalated', value: escalatedCount, color: escalatedCount > 0 ? '#722ed1' : '#52c41a' },
          { title: 'Total Resolved', value: complaints.filter(c => c.status === 'Resolved').length, color: '#52c41a' },
        ].map(stat => (
          <Col span={8} key={stat.title}>
            <Card style={{ borderRadius: 12, border: 'none', boxShadow: '0 2px 12px rgba(10,22,40,0.08)' }} styles={{ body: { padding: 20 } }}>
              <Statistic title={stat.title} value={stat.value} valueStyle={{ color: stat.color, fontWeight: 700 }} />
            </Card>
          </Col>
        ))}
      </Row>

      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Title level={3} style={{ color: NAVY, margin: 0 }}>CSER — Complaints & Escalations</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate} style={{ background: NAVY, borderColor: GOLD }}>New Complaint</Button>
      </Row>

      <Card style={{ borderRadius: 12, border: 'none', boxShadow: '0 2px 12px rgba(10,22,40,0.08)' }}>
        <Table dataSource={complaints} columns={columns} rowKey="id" loading={loading} pagination={{ pageSize: 15 }} />
      </Card>

      <Modal title={editingItem ? 'Edit Complaint' : 'Register Complaint'} open={modalOpen} onCancel={() => setModalOpen(false)} footer={null} width={560}>
        <Form form={form} layout="vertical" onFinish={handleSubmit} style={{ marginTop: 16 }}>
          <Row gutter={16}>
            <Col span={24}><Form.Item label="School" name="schoolId" rules={[{ required: true }]}><Select placeholder="Select school" showSearch optionFilterProp="children">{schools.map(s => <Option key={s.id} value={s.id}>{s.schoolName}</Option>)}</Select></Form.Item></Col>
            <Col span={24}><Form.Item label="Subject" name="subject" rules={[{ required: true }]}><Input placeholder="Brief description of the complaint" /></Form.Item></Col>
            <Col span={12}><Form.Item label="Priority" name="priority" initialValue="Medium"><Select><Option value="Low">Low</Option><Option value="Medium">Medium</Option><Option value="High">High</Option><Option value="Critical">Critical</Option></Select></Form.Item></Col>
            <Col span={12}><Form.Item label="Category" name="category"><Select placeholder="Category"><Option value="Quality">Quality Issue</Option><Option value="Delivery">Delivery Delay</Option><Option value="Payment">Payment Dispute</Option><Option value="Design">Design Error</Option><Option value="Other">Other</Option></Select></Form.Item></Col>
            <Col span={12}><Form.Item label="Date Raised" name="date"><DatePicker style={{ width: '100%' }} /></Form.Item></Col>
            <Col span={24}><Form.Item label="Full Description" name="description"><Input.TextArea rows={3} /></Form.Item></Col>
            <Col span={24}><Form.Item label="Root Cause (if known)" name="rootCause"><Input placeholder="Root cause analysis..." /></Form.Item></Col>
          </Row>
          <div style={{ textAlign: 'right' }}>
            <Button onClick={() => setModalOpen(false)} style={{ marginRight: 8 }}>Cancel</Button>
            <Button type="primary" htmlType="submit" style={{ background: NAVY, borderColor: GOLD }}>{editingItem ? 'Update' : 'Register'}</Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
