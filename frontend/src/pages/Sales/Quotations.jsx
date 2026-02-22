import { useState } from 'react';
import {
    Table, Button, Tag, Typography, Modal, Form, Input,
    Select, DatePicker, Row, Col, Space, message, Card,
    Popconfirm, Tooltip, InputNumber, Divider
} from 'antd';
import {
    PlusOutlined, EditOutlined, DeleteOutlined,
    EyeOutlined, CheckCircleOutlined, FilePdfOutlined
} from '@ant-design/icons';
import { useCollection } from '@/hooks/useCollection';
import { orderBy } from 'firebase/firestore';
import { useSelector } from 'react-redux';
import { selectAuth } from '@/redux/auth/selectors';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;

const NAVY = '#0a1628';
const GOLD = '#c9a84c';

const statusColors = {
    Draft: 'default', Sent: 'blue', Approved: 'green',
    Rejected: 'red', Expired: 'orange'
};

function ItemsEditor({ value = [], onChange }) {
    const addItem = () => onChange([...value, { description: '', qty: 1, unitPrice: 0, total: 0 }]);
    const removeItem = (idx) => onChange(value.filter((_, i) => i !== idx));
    const updateItem = (idx, field, val) => {
        const updated = value.map((item, i) => {
            if (i !== idx) return item;
            const newItem = { ...item, [field]: val };
            newItem.total = (newItem.qty || 0) * (newItem.unitPrice || 0);
            return newItem;
        });
        onChange(updated);
    };

    const grandTotal = value.reduce((s, i) => s + (i.total || 0), 0);

    return (
        <div>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr auto', gap: 8, marginBottom: 8 }}>
                <Text strong style={{ fontSize: 12 }}>Description</Text>
                <Text strong style={{ fontSize: 12 }}>Qty</Text>
                <Text strong style={{ fontSize: 12 }}>Unit Price ₹</Text>
                <Text strong style={{ fontSize: 12 }}>Total ₹</Text>
                <span />
            </div>
            {value.map((item, idx) => (
                <div key={idx} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr auto', gap: 8, marginBottom: 8 }}>
                    <Input
                        value={item.description}
                        onChange={e => updateItem(idx, 'description', e.target.value)}
                        placeholder="Item description"
                    />
                    <InputNumber
                        value={item.qty}
                        onChange={v => updateItem(idx, 'qty', v)}
                        min={1}
                        style={{ width: '100%' }}
                    />
                    <InputNumber
                        value={item.unitPrice}
                        onChange={v => updateItem(idx, 'unitPrice', v)}
                        min={0}
                        style={{ width: '100%' }}
                    />
                    <InputNumber value={item.total} readOnly style={{ width: '100%', background: '#f5f5f5' }} />
                    <Button danger size="small" onClick={() => removeItem(idx)}>✕</Button>
                </div>
            ))}
            <Button type="dashed" onClick={addItem} icon={<PlusOutlined />} block style={{ marginBottom: 8 }}>
                Add Item
            </Button>
            <div style={{ textAlign: 'right' }}>
                <Text strong>Grand Total: ₹{grandTotal.toLocaleString()}</Text>
            </div>
        </div>
    );
}

export default function QuotationsPage() {
    const { data: quotations, loading, add, update, remove } = useCollection('quotations', [orderBy('createdAt', 'desc')]);
    const { data: schools } = useCollection('schools');
    const { current: user } = useSelector(selectAuth);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingQuote, setEditingQuote] = useState(null);
    const [form] = Form.useForm();

    const openCreate = () => { setEditingQuote(null); form.resetFields(); setModalOpen(true); };
    const openEdit = (q) => {
        setEditingQuote(q);
        form.setFieldsValue({
            ...q,
            validUntil: q.validUntil ? dayjs(q.validUntil) : null,
        });
        setModalOpen(true);
    };

    const handleSubmit = async (values) => {
        const items = values.items || [];
        const totalAmount = items.reduce((s, i) => s + (i.total || 0), 0);
        const school = schools.find(s => s.id === values.schoolId);
        const payload = {
            ...values,
            schoolName: school?.schoolName || '',
            totalAmount,
            validUntil: values.validUntil ? values.validUntil.toISOString() : null,
            createdBy: user?.email || '',
        };
        if (editingQuote) {
            await update(editingQuote.id, payload);
            message.success('Quotation updated');
        } else {
            await add({ ...payload, status: 'Draft' });
            message.success('Quotation created');
        }
        setModalOpen(false);
    };

    const handleStatusChange = async (id, status) => {
        await update(id, { status });
        message.success(`Quotation marked as ${status}`);
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
            title: 'Valid Until',
            dataIndex: 'validUntil',
            key: 'validUntil',
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
                    <Tooltip title="Edit">
                        <Button icon={<EditOutlined />} size="small" onClick={() => openEdit(record)} />
                    </Tooltip>
                    <Tooltip title="Mark Approved">
                        <Button
                            icon={<CheckCircleOutlined />}
                            size="small"
                            style={{ color: 'green', borderColor: 'green' }}
                            onClick={() => handleStatusChange(record.id, 'Approved')}
                            disabled={record.status === 'Approved'}
                        />
                    </Tooltip>
                    <Popconfirm title="Delete this quotation?" onConfirm={() => remove(record.id).then(() => message.success('Deleted'))}>
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
                    <Title level={3} style={{ color: NAVY, marginBottom: 4 }}>Quotations</Title>
                    <Text style={{ color: '#888' }}>{quotations.length} quotation{quotations.length !== 1 ? 's' : ''}</Text>
                </Col>
                <Col>
                    <Button type="primary" icon={<PlusOutlined />} onClick={openCreate} style={{ background: NAVY, borderColor: GOLD }}>
                        New Quotation
                    </Button>
                </Col>
            </Row>

            <Card style={{ borderRadius: 12, border: 'none', boxShadow: '0 2px 12px rgba(10,22,40,0.08)' }}>
                <Table
                    dataSource={quotations}
                    columns={columns}
                    rowKey="id"
                    loading={loading}
                    pagination={{ pageSize: 15 }}
                />
            </Card>

            <Modal
                title={editingQuote ? 'Edit Quotation' : 'New Quotation'}
                open={modalOpen}
                onCancel={() => setModalOpen(false)}
                footer={null}
                width={780}
            >
                <Form form={form} layout="vertical" onFinish={handleSubmit} style={{ marginTop: 16 }}>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item label="School" name="schoolId" rules={[{ required: true }]}>
                                <Select placeholder="Select school" showSearch optionFilterProp="children">
                                    {schools.map(s => <Option key={s.id} value={s.id}>{s.schoolName}</Option>)}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label="Valid Until" name="validUntil">
                                <DatePicker style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                        <Col span={24}>
                            <Form.Item label="Notes" name="notes">
                                <Input.TextArea rows={2} placeholder="Add notes..." />
                            </Form.Item>
                        </Col>
                        <Col span={24}>
                            <Divider orientation="left">Line Items</Divider>
                            <Form.Item name="items" initialValue={[]}>
                                <ItemsEditor />
                            </Form.Item>
                        </Col>
                    </Row>
                    <div style={{ textAlign: 'right' }}>
                        <Button onClick={() => setModalOpen(false)} style={{ marginRight: 8 }}>Cancel</Button>
                        <Button type="primary" htmlType="submit" style={{ background: NAVY, borderColor: GOLD }}>
                            {editingQuote ? 'Update Quotation' : 'Create Quotation'}
                        </Button>
                    </div>
                </Form>
            </Modal>
        </div>
    );
}
