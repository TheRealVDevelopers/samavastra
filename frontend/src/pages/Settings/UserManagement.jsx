import { useState } from 'react';
import {
    Table, Button, Tag, Typography, Modal, Form, Input,
    Row, Col, Space, message, Card, Select, Avatar,
    Popconfirm, Tooltip, Switch, Divider
} from 'antd';
import {
    PlusOutlined, EditOutlined, DeleteOutlined,
    UserAddOutlined, CheckCircleOutlined, StopOutlined
} from '@ant-design/icons';
import { useCollection } from '@/hooks/useCollection';
import { orderBy } from 'firebase/firestore';
import { db } from '@/firebase';
import { doc, setDoc, updateDoc } from 'firebase/firestore';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;
const NAVY = '#0a1628';
const GOLD = '#c9a84c';

const ROLES = ['CEO', 'Manager', 'Staff', 'Accountant'];
const DEPARTMENTS = ['Management', 'Sales', 'Production', 'Accounts', 'Logistics', 'HR', 'Quality'];
const ROLE_COLORS = { CEO: '#722ed1', Manager: '#1890ff', Staff: '#52c41a', Accountant: '#fa8c16' };

export default function UserManagementPage() {
    const { data: users, loading, update, remove } = useCollection('users', [orderBy('createdAt', 'desc')]);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [creating, setCreating] = useState(false);
    const [form] = Form.useForm();

    const openCreate = () => { setEditingUser(null); form.resetFields(); setModalOpen(true); };
    const openEdit = (u) => {
        setEditingUser(u);
        form.setFieldsValue({ ...u });
        setModalOpen(true);
    };

    // Create new Firebase Auth user + Firestore profile
    const handleCreate = async (values) => {
        setCreating(true);
        try {
            const auth = getAuth();
            // Create in Firebase Auth
            const { user } = await createUserWithEmailAndPassword(auth, values.email, values.password);

            // Create Firestore profile
            await setDoc(doc(db, 'users', user.uid), {
                uid: user.uid,
                firstName: values.firstName,
                lastName: values.lastName,
                email: values.email,
                role: values.role,
                department: values.department,
                isActive: true,
                createdAt: new Date().toISOString(),
            });

            message.success(`✅ User ${values.firstName} ${values.lastName} created with role: ${values.role}`);
            setModalOpen(false);
        } catch (err) {
            if (err.code === 'auth/email-already-in-use') {
                message.error('This email is already registered.');
            } else {
                message.error('Error: ' + err.message);
            }
        } finally {
            setCreating(false);
        }
    };

    const handleEdit = async (values) => {
        try {
            await update(editingUser.id, {
                firstName: values.firstName,
                lastName: values.lastName,
                role: values.role,
                department: values.department,
            });
            message.success('User updated');
            setModalOpen(false);
        } catch (err) {
            message.error('Error: ' + err.message);
        }
    };

    const toggleActive = async (user, active) => {
        await update(user.id, { isActive: active });
        message.success(active ? 'User activated' : 'User deactivated');
    };

    const handleSubmit = (values) => {
        if (editingUser) handleEdit(values);
        else handleCreate(values);
    };

    const columns = [
        {
            title: 'User',
            key: 'user',
            render: (_, r) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Avatar style={{ background: NAVY, color: GOLD, fontWeight: 700 }}>
                        {r.firstName?.charAt(0)}{r.lastName?.charAt(0)}
                    </Avatar>
                    <div>
                        <Text strong style={{ display: 'block' }}>{r.firstName} {r.lastName}</Text>
                        <Text style={{ color: '#888', fontSize: 12 }}>{r.email}</Text>
                    </div>
                </div>
            ),
        },
        {
            title: 'Role',
            dataIndex: 'role',
            key: 'role',
            render: v => <Tag color={ROLE_COLORS[v] || 'default'}>{v || '—'}</Tag>,
        },
        {
            title: 'Department',
            dataIndex: 'department',
            key: 'department',
            render: v => <Tag color="blue">{v || '—'}</Tag>,
        },
        {
            title: 'Status',
            key: 'isActive',
            render: (_, r) => (
                <Switch
                    checked={r.isActive !== false}
                    checkedChildren="Active"
                    unCheckedChildren="Inactive"
                    onChange={v => toggleActive(r, v)}
                />
            ),
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
            render: (_, r) => (
                <Space>
                    <Tooltip title="Edit Role / Department">
                        <Button icon={<EditOutlined />} size="small" onClick={() => openEdit(r)} />
                    </Tooltip>
                </Space>
            ),
        },
    ];

    const activeCount = users.filter(u => u.isActive !== false).length;

    return (
        <div>
            <Row justify="space-between" align="middle" style={{ marginBottom: 20 }}>
                <Col>
                    <Title level={3} style={{ color: NAVY, marginBottom: 4 }}>User Management</Title>
                    <Text style={{ color: '#888' }}>
                        {activeCount} active user{activeCount !== 1 ? 's' : ''} · {users.length} total
                    </Text>
                </Col>
                <Col>
                    <Button
                        type="primary"
                        icon={<UserAddOutlined />}
                        onClick={openCreate}
                        style={{ background: NAVY, borderColor: GOLD }}
                    >
                        Invite User
                    </Button>
                </Col>
            </Row>

            {/* Role Legend */}
            <Card style={{ borderRadius: 12, border: 'none', boxShadow: '0 2px 12px rgba(10,22,40,0.08)', marginBottom: 16 }}>
                <Row gutter={16}>
                    {ROLES.map(role => {
                        const count = users.filter(u => u.role === role).length;
                        return (
                            <Col span={6} key={role} style={{ textAlign: 'center' }}>
                                <Tag color={ROLE_COLORS[role]} style={{ fontSize: 13, padding: '4px 12px' }}>{role}</Tag>
                                <Text style={{ display: 'block', fontSize: 20, fontWeight: 700, color: NAVY, marginTop: 4 }}>{count}</Text>
                            </Col>
                        );
                    })}
                </Row>
            </Card>

            <Card style={{ borderRadius: 12, border: 'none', boxShadow: '0 2px 12px rgba(10,22,40,0.08)' }}>
                <Table
                    dataSource={users}
                    columns={columns}
                    rowKey="id"
                    loading={loading}
                    pagination={{ pageSize: 15 }}
                />
            </Card>

            {/* Create / Edit Modal */}
            <Modal
                title={editingUser ? 'Edit User Role' : 'Invite New User'}
                open={modalOpen}
                onCancel={() => setModalOpen(false)}
                footer={null}
                width={500}
            >
                <Form form={form} layout="vertical" onFinish={handleSubmit} style={{ marginTop: 16 }}>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item label="First Name" name="firstName" rules={[{ required: true }]}>
                                <Input />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label="Last Name" name="lastName" rules={[{ required: true }]}>
                                <Input />
                            </Form.Item>
                        </Col>

                        {!editingUser && (
                            <>
                                <Col span={24}>
                                    <Form.Item label="Email Address" name="email" rules={[{ required: true, type: 'email' }]}>
                                        <Input placeholder="user@samavastra.com" />
                                    </Form.Item>
                                </Col>
                                <Col span={24}>
                                    <Form.Item
                                        label="Temporary Password"
                                        name="password"
                                        rules={[{ required: true, min: 6, message: 'Min 6 characters' }]}
                                    >
                                        <Input.Password placeholder="They can change it later" />
                                    </Form.Item>
                                </Col>
                            </>
                        )}

                        <Col span={12}>
                            <Form.Item label="Role" name="role" rules={[{ required: true }]}>
                                <Select placeholder="Select role">
                                    {ROLES.map(r => (
                                        <Option key={r} value={r}>
                                            <Tag color={ROLE_COLORS[r]}>{r}</Tag>
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label="Department" name="department" rules={[{ required: true }]}>
                                <Select placeholder="Select department">
                                    {DEPARTMENTS.map(d => <Option key={d} value={d}>{d}</Option>)}
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>

                    {!editingUser && (
                        <div style={{ background: '#fffbe6', border: '1px solid #ffe58f', borderRadius: 8, padding: '10px 14px', marginBottom: 16 }}>
                            <Text style={{ fontSize: 12, color: '#ad6800' }}>
                                ⚠️ An account will be created with the temporary password. Ask the user to change it after first login.
                            </Text>
                        </div>
                    )}

                    <div style={{ textAlign: 'right' }}>
                        <Button onClick={() => setModalOpen(false)} style={{ marginRight: 8 }}>Cancel</Button>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={creating}
                            style={{ background: NAVY, borderColor: GOLD }}
                        >
                            {editingUser ? 'Update User' : 'Create User'}
                        </Button>
                    </div>
                </Form>
            </Modal>
        </div>
    );
}
