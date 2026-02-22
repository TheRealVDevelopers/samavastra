import { useState } from 'react';
import {
    Table, Button, Modal, Form, Input, Select, Tag, Space,
    Typography, Card, Row, Col, Popconfirm, message, Tooltip
} from 'antd';
import {
    PlusOutlined, EditOutlined, DeleteOutlined,
    PhoneOutlined, MailOutlined, SearchOutlined
} from '@ant-design/icons';
import { useCollection } from '@/hooks/useCollection';
import { orderBy } from 'firebase/firestore';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;

const NAVY = '#0a1628';
const GOLD = '#c9a84c';

const statusColors = {
    active: 'green', inactive: 'red', prospect: 'blue', default: 'default'
};

export default function SchoolsPage() {
    const { data: schools, loading, add, update, remove } = useCollection('schools', [orderBy('createdAt', 'desc')]);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingSchool, setEditingSchool] = useState(null);
    const [search, setSearch] = useState('');
    const [form] = Form.useForm();

    const filtered = schools.filter(s =>
        s.schoolName?.toLowerCase().includes(search.toLowerCase()) ||
        s.city?.toLowerCase().includes(search.toLowerCase())
    );

    const openCreate = () => { setEditingSchool(null); form.resetFields(); setModalOpen(true); };
    const openEdit = (school) => { setEditingSchool(school); form.setFieldsValue(school); setModalOpen(true); };

    const handleSubmit = async (values) => {
        try {
            if (editingSchool) {
                await update(editingSchool.id, values);
                message.success('School updated successfully');
            } else {
                await add({ ...values, status: values.status || 'active' });
                message.success('School added successfully');
            }
            setModalOpen(false);
        } catch (e) {
            message.error('Error: ' + e.message);
        }
    };

    const handleDelete = async (id) => {
        try {
            await remove(id);
            message.success('School removed');
        } catch (e) {
            message.error('Error: ' + e.message);
        }
    };

    const columns = [
        {
            title: 'School Name',
            dataIndex: 'schoolName',
            key: 'schoolName',
            render: (v) => <Text strong>{v}</Text>,
        },
        { title: 'Contact Person', dataIndex: 'contactPerson', key: 'contactPerson' },
        {
            title: 'Phone',
            dataIndex: 'phone',
            key: 'phone',
            render: v => v ? <a href={`tel:${v}`}><PhoneOutlined /> {v}</a> : '—',
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
            render: v => v ? <a href={`mailto:${v}`}><MailOutlined /> {v}</a> : '—',
        },
        { title: 'City', dataIndex: 'city', key: 'city' },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: v => <Tag color={statusColors[v] || 'default'}>{v || 'active'}</Tag>,
        },
        {
            title: 'Added',
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
                    <Popconfirm title="Remove this school?" onConfirm={() => handleDelete(record.id)}>
                        <Button icon={<DeleteOutlined />} size="small" danger />
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div>
            {/* Header */}
            <Row justify="space-between" align="middle" style={{ marginBottom: 20 }}>
                <Col>
                    <Title level={3} style={{ color: NAVY, marginBottom: 4 }}>School Clients</Title>
                    <Text style={{ color: '#888' }}>{schools.length} school{schools.length !== 1 ? 's' : ''} total</Text>
                </Col>
                <Col>
                    <Space>
                        <Input
                            placeholder="Search schools..."
                            prefix={<SearchOutlined />}
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            style={{ width: 220 }}
                        />
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={openCreate}
                            style={{ background: NAVY, borderColor: GOLD }}
                        >
                            Add School
                        </Button>
                    </Space>
                </Col>
            </Row>

            {/* Table */}
            <Card style={{ borderRadius: 12, border: 'none', boxShadow: '0 2px 12px rgba(10,22,40,0.08)' }}>
                <Table
                    dataSource={filtered}
                    columns={columns}
                    rowKey="id"
                    loading={loading}
                    pagination={{ pageSize: 15, showTotal: (t) => `${t} schools` }}
                />
            </Card>

            {/* Add/Edit Modal */}
            <Modal
                title={editingSchool ? 'Edit School' : 'Add New School'}
                open={modalOpen}
                onCancel={() => setModalOpen(false)}
                footer={null}
                width={600}
            >
                <Form form={form} layout="vertical" onFinish={handleSubmit} style={{ marginTop: 16 }}>
                    <Row gutter={16}>
                        <Col span={24}>
                            <Form.Item label="School Name" name="schoolName" rules={[{ required: true, message: 'School name is required' }]}>
                                <Input placeholder="e.g. St. Mary's School" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label="Contact Person" name="contactPerson">
                                <Input placeholder="Principal / Coordinator name" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label="Phone" name="phone">
                                <Input placeholder="+91 98765 43210" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label="Email" name="email" rules={[{ type: 'email', message: 'Invalid email' }]}>
                                <Input placeholder="school@example.com" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label="GSTIN" name="gstin">
                                <Input placeholder="22AAAAA0000A1Z5" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label="City" name="city">
                                <Input placeholder="City" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label="State" name="state">
                                <Input placeholder="State" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label="Pincode" name="pincode">
                                <Input placeholder="560001" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label="Status" name="status" initialValue="active">
                                <Select>
                                    <Option value="active">Active</Option>
                                    <Option value="inactive">Inactive</Option>
                                    <Option value="prospect">Prospect</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={24}>
                            <Form.Item label="Address" name="address">
                                <Input.TextArea rows={2} placeholder="Full address" />
                            </Form.Item>
                        </Col>
                    </Row>
                    <div style={{ textAlign: 'right' }}>
                        <Button onClick={() => setModalOpen(false)} style={{ marginRight: 8 }}>Cancel</Button>
                        <Button type="primary" htmlType="submit" style={{ background: NAVY, borderColor: GOLD }}>
                            {editingSchool ? 'Update School' : 'Add School'}
                        </Button>
                    </div>
                </Form>
            </Modal>
        </div>
    );
}
