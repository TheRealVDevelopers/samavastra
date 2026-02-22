import { useState } from 'react';
import {
  Table, Button, Tag, Typography, Modal, Form, Input,
  Row, Col, Space, message, Card, InputNumber, Select,
  DatePicker, Statistic, Popconfirm
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useCollection } from '@/hooks/useCollection';
import { orderBy } from 'firebase/firestore';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;
const NAVY = '#0a1628';
const GOLD = '#c9a84c';

const statusColors = { Unpaid: 'red', 'Partially Paid': 'orange', Paid: 'green', Cancelled: 'default' };

export default function InvoicesPage() {
  const { data: invoices, loading, add, update, remove } = useCollection('invoices', [orderBy('createdAt', 'desc')]);
  const { data: schools } = useCollection('schools');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [form] = Form.useForm();

  const openCreate = () => { setEditingInvoice(null); form.resetFields(); setModalOpen(true); };
  const openEdit = (inv) => {
    setEditingInvoice(inv);
    form.setFieldsValue({ ...inv, dueDate: inv.dueDate ? dayjs(inv.dueDate) : null });
    setModalOpen(true);
  };

  const handleSubmit = async (values) => {
    const school = schools.find(s => s.id === values.schoolId);
    const payload = {
      ...values,
      schoolName: school?.schoolName || '',
      dueDate: values.dueDate ? values.dueDate.toISOString() : null,
      balanceAmount: values.totalAmount - (values.paidAmount || 0),
      status: (values.paidAmount || 0) >= values.totalAmount ? 'Paid'
        : (values.paidAmount || 0) > 0 ? 'Partially Paid' : 'Unpaid',
    };
    if (editingInvoice) { await update(editingInvoice.id, payload); message.success('Invoice updated'); }
    else { await add(payload); message.success('Invoice created'); }
    setModalOpen(false);
  };

  const totalOutstanding = invoices
    .filter(i => i.status !== 'Paid')
    .reduce((s, i) => s + (i.balanceAmount || 0), 0);
  const totalCollected = invoices.reduce((s, i) => s + (i.paidAmount || 0), 0);

  const columns = [
    { title: 'School', dataIndex: 'schoolName', key: 'schoolName', render: v => <Text strong>{v}</Text> },
    { title: 'Total', dataIndex: 'totalAmount', key: 'totalAmount', render: v => `₹${(v || 0).toLocaleString()}` },
    { title: 'Paid', dataIndex: 'paidAmount', key: 'paidAmount', render: v => <Text style={{ color: '#52c41a' }}>₹{(v || 0).toLocaleString()}</Text> },
    { title: 'Balance', dataIndex: 'balanceAmount', key: 'balanceAmount', render: v => <Text style={{ color: v > 0 ? '#ff4d4f' : '#52c41a' }}>₹{(v || 0).toLocaleString()}</Text> },
    { title: 'Status', dataIndex: 'status', key: 'status', render: v => <Tag color={statusColors[v] || 'default'}>{v || 'Unpaid'}</Tag> },
    { title: 'Due Date', dataIndex: 'dueDate', key: 'dueDate', render: v => v ? dayjs(v).format('D MMM YYYY') : '—' },
    {
      title: 'Actions', key: 'actions',
      render: (_, r) => (
        <Space>
          <Button icon={<EditOutlined />} size="small" onClick={() => openEdit(r)} />
          <Popconfirm title="Delete invoice?" onConfirm={() => remove(r.id).then(() => message.success('Deleted'))}>
            <Button icon={<DeleteOutlined />} size="small" danger />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      {/* Summary Cards */}
      <Row gutter={16} style={{ marginBottom: 20 }}>
        <Col span={8}>
          <Card style={{ borderRadius: 12, border: 'none', boxShadow: '0 2px 12px rgba(10,22,40,0.08)' }} styles={{ body: { padding: 20 } }}>
            <Statistic title="Total Invoiced" value={invoices.reduce((s, i) => s + (i.totalAmount || 0), 0)} prefix="₹" valueStyle={{ color: NAVY, fontWeight: 700 }} />
          </Card>
        </Col>
        <Col span={8}>
          <Card style={{ borderRadius: 12, border: 'none', boxShadow: '0 2px 12px rgba(10,22,40,0.08)' }} styles={{ body: { padding: 20 } }}>
            <Statistic title="Total Collected" value={totalCollected} prefix="₹" valueStyle={{ color: '#52c41a', fontWeight: 700 }} />
          </Card>
        </Col>
        <Col span={8}>
          <Card style={{ borderRadius: 12, border: 'none', boxShadow: '0 2px 12px rgba(10,22,40,0.08)' }} styles={{ body: { padding: 20 } }}>
            <Statistic title="Outstanding" value={totalOutstanding} prefix="₹" valueStyle={{ color: totalOutstanding > 0 ? '#ff4d4f' : '#52c41a', fontWeight: 700 }} />
          </Card>
        </Col>
      </Row>

      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Title level={3} style={{ color: NAVY, margin: 0 }}>Invoices</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate} style={{ background: NAVY, borderColor: GOLD }}>New Invoice</Button>
      </Row>

      <Card style={{ borderRadius: 12, border: 'none', boxShadow: '0 2px 12px rgba(10,22,40,0.08)' }}>
        <Table dataSource={invoices} columns={columns} rowKey="id" loading={loading} pagination={{ pageSize: 15 }} />
      </Card>

      <Modal title={editingInvoice ? 'Edit Invoice' : 'New Invoice'} open={modalOpen} onCancel={() => setModalOpen(false)} footer={null} width={520}>
        <Form form={form} layout="vertical" onFinish={handleSubmit} style={{ marginTop: 16 }}>
          <Row gutter={16}>
            <Col span={24}><Form.Item label="School" name="schoolId" rules={[{ required: true }]}><Select placeholder="Select school" showSearch optionFilterProp="children">{schools.map(s => <Option key={s.id} value={s.id}>{s.schoolName}</Option>)}</Select></Form.Item></Col>
            <Col span={12}><Form.Item label="Total Amount" name="totalAmount" rules={[{ required: true }]}><InputNumber min={0} style={{ width: '100%' }} prefix="₹" /></Form.Item></Col>
            <Col span={12}><Form.Item label="Amount Paid" name="paidAmount" initialValue={0}><InputNumber min={0} style={{ width: '100%' }} prefix="₹" /></Form.Item></Col>
            <Col span={12}><Form.Item label="Due Date" name="dueDate"><DatePicker style={{ width: '100%' }} /></Form.Item></Col>
          </Row>
          <div style={{ textAlign: 'right' }}>
            <Button onClick={() => setModalOpen(false)} style={{ marginRight: 8 }}>Cancel</Button>
            <Button type="primary" htmlType="submit" style={{ background: NAVY, borderColor: GOLD }}>{editingInvoice ? 'Update' : 'Create'}</Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
