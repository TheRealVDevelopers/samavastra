import { useState } from 'react';
import {
    Table, Button, Tag, Typography, Modal, Form, Input,
    Select, DatePicker, Row, Col, Space, message, Card,
    Popconfirm, Tooltip, InputNumber, Divider, Steps, Timeline
} from 'antd';
import {
    PlusOutlined, EditOutlined, DeleteOutlined,
    CheckCircleOutlined, ClockCircleOutlined
} from '@ant-design/icons';
import { useCollection } from '@/hooks/useCollection';
import { orderBy } from 'firebase/firestore';
import { useSelector } from 'react-redux';
import { selectAuth } from '@/redux/auth/selectors';
import { db } from '../../firebase';
import { addDoc, collection } from 'firebase/firestore';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;
const NAVY = '#0a1628';
const GOLD = '#c9a84c';

const statusColors = {
    Pending: 'orange', Approved: 'blue', 'In Production': 'purple',
    Completed: 'green', Cancelled: 'red', Dispatched: 'cyan'
};

export default function SalesOrdersPage() {
    const { data: orders, loading, add, update, remove } = useCollection('salesOrders', [orderBy('createdAt', 'desc')]);
    const { data: quotations } = useCollection('quotations', []);
    const { data: schools } = useCollection('schools');
    const { current: user } = useSelector(selectAuth);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingOrder, setEditingOrder] = useState(null);
    const [form] = Form.useForm();

    const approvedQuotations = quotations.filter(q => q.status === 'Approved');

    const openCreate = () => { setEditingOrder(null); form.resetFields(); setModalOpen(true); };
    const openEdit = (o) => {
        setEditingOrder(o);
        form.setFieldsValue({
            ...o,
            deliveryDate: o.deliveryDate ? dayjs(o.deliveryDate) : null,
        });
        setModalOpen(true);
    };

    const handleSubmit = async (values) => {
        const school = schools.find(s => s.id === values.schoolId);
        const quotation = quotations.find(q => q.id === values.quotationId);
        const payload = {
            ...values,
            schoolName: school?.schoolName || quotation?.schoolName || '',
            items: quotation?.items || [],
            totalAmount: quotation?.totalAmount || 0,
            deliveryDate: values.deliveryDate ? values.deliveryDate.toISOString() : null,
            createdBy: user?.email || '',
        };

        if (editingOrder) {
            await update(editingOrder.id, payload);
            message.success('Sales order updated');
        } else {
            const newOrder = await add({ ...payload, status: 'Pending' });
            message.success('Sales order created');
        }
        setModalOpen(false);
    };

    const handleApprove = async (order) => {
        await update(order.id, {
            status: 'Approved',
            approvedBy: user?.email,
            approvedAt: new Date().toISOString(),
        });

        // Auto-create production job
        await addDoc(collection(db, 'productionJobs'), {
            salesOrderId: order.id,
            schoolId: order.schoolId,
            schoolName: order.schoolName,
            items: order.items || [],
            status: 'pending',
            stages: {
                cutting: false,
                stitching: false,
                finishing: false,
                packing: false,
            },
            plannedUnits: (order.items || []).reduce((s, i) => s + (i.qty || 0), 0),
            producedUnits: 0,
            defectUnits: 0,
            createdAt: new Date().toISOString(),
        });

        message.success('✅ Sales Order approved! Production job created automatically.');
    };

    const columns = [
        {
            title: 'School',
            dataIndex: 'schoolName',
            key: 'schoolName',
            render: v => <Text strong>{v}</Text>,
        },
        {
            title: 'Total Amount',
            dataIndex: 'totalAmount',
            key: 'totalAmount',
            render: v => `₹${(v || 0).toLocaleString()}`,
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: v => <Tag color={statusColors[v] || 'default'}>{v}</Tag>,
        },
        {
            title: 'Delivery Date',
            dataIndex: 'deliveryDate',
            key: 'deliveryDate',
            render: v => v ? dayjs(v).format('D MMM YYYY') : '—',
        },
        {
            title: 'Created',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: v => v ? dayjs(v).format('D MMM YYYY') : '—',
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <Space>
                    <Button icon={<EditOutlined />} size="small" onClick={() => openEdit(record)} />
                    {record.status === 'Pending' && (
                        <Tooltip title="Approve & Create Production Job">
                            <Button
                                icon={<CheckCircleOutlined />}
                                size="small"
                                type="primary"
                                style={{ background: 'green', borderColor: 'green' }}
                                onClick={() => handleApprove(record)}
                            >
                                Approve
                            </Button>
                        </Tooltip>
                    )}
                    <Popconfirm title="Delete this order?" onConfirm={() => remove(record.id).then(() => message.success('Deleted'))}>
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
                    <Title level={3} style={{ color: NAVY, marginBottom: 4 }}>Sales Orders</Title>
                    <Text style={{ color: '#888' }}>
                        {orders.filter(o => o.status === 'Pending').length} pending · {orders.filter(o => o.status === 'Approved').length} approved
                    </Text>
                </Col>
                <Col>
                    <Button type="primary" icon={<PlusOutlined />} onClick={openCreate} style={{ background: NAVY, borderColor: GOLD }}>
                        New Sales Order
                    </Button>
                </Col>
            </Row>

            <Card style={{ borderRadius: 12, border: 'none', boxShadow: '0 2px 12px rgba(10,22,40,0.08)' }}>
                <Table
                    dataSource={orders}
                    columns={columns}
                    rowKey="id"
                    loading={loading}
                    pagination={{ pageSize: 15 }}
                    expandable={{
                        expandedRowRender: record => (
                            <div style={{ padding: '8px 16px' }}>
                                <Text strong>Items:</Text>
                                {(record.items || []).length === 0 ? (
                                    <Text style={{ color: '#aaa' }}> No items</Text>
                                ) : (
                                    <Table
                                        dataSource={record.items}
                                        rowKey={(_, i) => i}
                                        pagination={false}
                                        size="small"
                                        style={{ marginTop: 8 }}
                                        columns={[
                                            { title: 'Description', dataIndex: 'description' },
                                            { title: 'Qty', dataIndex: 'qty' },
                                            { title: 'Unit Price', dataIndex: 'unitPrice', render: v => `₹${v}` },
                                            { title: 'Total', dataIndex: 'total', render: v => `₹${(v || 0).toLocaleString()}` },
                                        ]}
                                    />
                                )}
                            </div>
                        ),
                    }}
                />
            </Card>

            <Modal
                title={editingOrder ? 'Edit Sales Order' : 'Create Sales Order'}
                open={modalOpen}
                onCancel={() => setModalOpen(false)}
                footer={null}
                width={600}
            >
                <Form form={form} layout="vertical" onFinish={handleSubmit} style={{ marginTop: 16 }}>
                    <Row gutter={16}>
                        <Col span={24}>
                            <Form.Item label="Link to Approved Quotation" name="quotationId">
                                <Select placeholder="Select quotation (optional)" allowClear showSearch optionFilterProp="children">
                                    {approvedQuotations.map(q => (
                                        <Option key={q.id} value={q.id}>
                                            {q.schoolName} — ₹{(q.totalAmount || 0).toLocaleString()}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label="School" name="schoolId" rules={[{ required: true }]}>
                                <Select placeholder="Select school" showSearch optionFilterProp="children">
                                    {schools.map(s => <Option key={s.id} value={s.id}>{s.schoolName}</Option>)}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label="Delivery Date" name="deliveryDate">
                                <DatePicker style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                        <Col span={24}>
                            <Form.Item label="Notes" name="notes">
                                <Input.TextArea rows={2} placeholder="Add notes..." />
                            </Form.Item>
                        </Col>
                    </Row>
                    <div style={{ textAlign: 'right' }}>
                        <Button onClick={() => setModalOpen(false)} style={{ marginRight: 8 }}>Cancel</Button>
                        <Button type="primary" htmlType="submit" style={{ background: NAVY, borderColor: GOLD }}>
                            {editingOrder ? 'Update Order' : 'Create Order'}
                        </Button>
                    </div>
                </Form>
            </Modal>
        </div>
    );
}
