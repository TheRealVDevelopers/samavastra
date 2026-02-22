import { useState } from 'react';
import {
    Card, Button, Tag, Typography, Modal, Form, Input,
    Select, DatePicker, Row, Col, Space, message, Tooltip,
    Badge
} from 'antd';
import {
    PlusOutlined, EditOutlined, DeleteOutlined,
    UserOutlined, PhoneOutlined, CalendarOutlined
} from '@ant-design/icons';
import { useCollection } from '@/hooks/useCollection';
import { orderBy } from 'firebase/firestore';
import { useSelector } from 'react-redux';
import { selectAuth } from '@/redux/auth/selectors';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const NAVY = '#0a1628';
const GOLD = '#c9a84c';

const STAGES = [
    { key: 'New', color: '#1890ff', bg: '#e6f7ff' },
    { key: 'Contacted', color: '#722ed1', bg: '#f9f0ff' },
    { key: 'Quotation Sent', color: '#fa8c16', bg: '#fff7e6' },
    { key: 'Negotiation', color: '#eb2f96', bg: '#fff0f6' },
    { key: 'Won', color: '#52c41a', bg: '#f6ffed' },
    { key: 'Lost', color: '#ff4d4f', bg: '#fff1f0' },
];

function LeadCard({ lead, onEdit, onDelete, onMove }) {
    return (
        <Card
            size="small"
            style={{
                marginBottom: 10,
                borderRadius: 10,
                border: '1px solid #f0f0f0',
                cursor: 'grab',
                boxShadow: '0 1px 4px rgba(10,22,40,0.06)',
            }}
            styles={{ body: { padding: '12px 14px' } }}
        >
            <Text strong style={{ fontSize: 13, display: 'block', marginBottom: 4 }}>
                {lead.schoolName}
            </Text>
            {lead.contactPerson && (
                <Text style={{ color: '#888', fontSize: 12 }}>
                    <UserOutlined style={{ marginRight: 4 }} />{lead.contactPerson}
                </Text>
            )}
            {lead.phone && (
                <Text style={{ color: '#888', fontSize: 12, display: 'block' }}>
                    <PhoneOutlined style={{ marginRight: 4 }} />{lead.phone}
                </Text>
            )}
            {lead.followUpDate && (
                <Text style={{ color: '#faad14', fontSize: 12, display: 'block', marginTop: 4 }}>
                    <CalendarOutlined style={{ marginRight: 4 }} />
                    Follow-up: {dayjs(lead.followUpDate).format('D MMM YYYY')}
                </Text>
            )}
            {lead.notes && (
                <Text style={{ color: '#aaa', fontSize: 11, display: 'block', marginTop: 4 }}>
                    {lead.notes.length > 60 ? lead.notes.slice(0, 60) + '…' : lead.notes}
                </Text>
            )}
            <div style={{ marginTop: 8, display: 'flex', justifyContent: 'flex-end', gap: 4 }}>
                <Button icon={<EditOutlined />} size="small" onClick={() => onEdit(lead)} />
                <Button icon={<DeleteOutlined />} size="small" danger onClick={() => onDelete(lead.id)} />
            </div>
        </Card>
    );
}

export default function LeadsPage() {
    const { data: leads, loading, add, update, remove } = useCollection('leads', [orderBy('createdAt', 'desc')]);
    const { current: user } = useSelector(selectAuth);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingLead, setEditingLead] = useState(null);
    const [form] = Form.useForm();

    const openCreate = () => { setEditingLead(null); form.resetFields(); setModalOpen(true); };
    const openEdit = (lead) => {
        setEditingLead(lead);
        form.setFieldsValue({
            ...lead,
            followUpDate: lead.followUpDate ? dayjs(lead.followUpDate) : null,
        });
        setModalOpen(true);
    };

    const handleDelete = async (id) => {
        await remove(id);
        message.success('Lead removed');
    };

    const handleMove = async (lead, newStage) => {
        await update(lead.id, { status: newStage });
    };

    const handleSubmit = async (values) => {
        const payload = {
            ...values,
            followUpDate: values.followUpDate ? values.followUpDate.toISOString() : null,
            assignedTo: user?.email || '',
        };
        if (editingLead) {
            await update(editingLead.id, payload);
            message.success('Lead updated');
        } else {
            await add({ ...payload, status: 'New' });
            message.success('Lead added');
        }
        setModalOpen(false);
    };

    return (
        <div>
            {/* Header */}
            <Row justify="space-between" align="middle" style={{ marginBottom: 20 }}>
                <Col>
                    <Title level={3} style={{ color: NAVY, marginBottom: 4 }}>Lead Pipeline</Title>
                    <Text style={{ color: '#888' }}>{leads.length} total leads · Drag to move stages</Text>
                </Col>
                <Col>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={openCreate}
                        style={{ background: NAVY, borderColor: GOLD }}
                    >
                        Add Lead
                    </Button>
                </Col>
            </Row>

            {/* Kanban Board */}
            <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 16 }}>
                {STAGES.map(stage => {
                    const stageLeads = leads.filter(l => (l.status || 'New') === stage.key);
                    return (
                        <div
                            key={stage.key}
                            style={{
                                minWidth: 240,
                                width: 240,
                                background: stage.bg,
                                borderRadius: 12,
                                padding: 12,
                                flexShrink: 0,
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                                <Text strong style={{ color: stage.color, fontSize: 13 }}>{stage.key}</Text>
                                <Badge count={stageLeads.length} style={{ background: stage.color }} />
                            </div>

                            {stageLeads.map(lead => (
                                <LeadCard
                                    key={lead.id}
                                    lead={lead}
                                    onEdit={openEdit}
                                    onDelete={handleDelete}
                                    onMove={handleMove}
                                />
                            ))}

                            {stageLeads.length === 0 && (
                                <div style={{ textAlign: 'center', padding: '20px 0', color: '#bbb', fontSize: 12 }}>
                                    No leads here
                                </div>
                            )}

                            {/* Move to next stage button shortcut */}
                            <Button
                                size="small"
                                type="dashed"
                                block
                                icon={<PlusOutlined />}
                                onClick={openCreate}
                                style={{ marginTop: 8, borderColor: stage.color, color: stage.color }}
                            >
                                Add to {stage.key}
                            </Button>
                        </div>
                    );
                })}
            </div>

            {/* Add/Edit Modal */}
            <Modal
                title={editingLead ? 'Edit Lead' : 'Add New Lead'}
                open={modalOpen}
                onCancel={() => setModalOpen(false)}
                footer={null}
                width={580}
            >
                <Form form={form} layout="vertical" onFinish={handleSubmit} style={{ marginTop: 16 }}>
                    <Row gutter={16}>
                        <Col span={24}>
                            <Form.Item label="School Name" name="schoolName" rules={[{ required: true }]}>
                                <Input placeholder="School name" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label="Contact Person" name="contactPerson">
                                <Input placeholder="Contact person name" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label="Phone" name="phone">
                                <Input placeholder="+91 98765 43210" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label="Email" name="email">
                                <Input placeholder="email@school.com" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label="Status / Stage" name="status" initialValue="New">
                                <Select>
                                    {STAGES.map(s => <Option key={s.key} value={s.key}>{s.key}</Option>)}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label="Follow-up Date" name="followUpDate">
                                <DatePicker style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                        <Col span={24}>
                            <Form.Item label="Notes" name="notes">
                                <TextArea rows={3} placeholder="Add notes about this lead..." />
                            </Form.Item>
                        </Col>
                    </Row>
                    <div style={{ textAlign: 'right' }}>
                        <Button onClick={() => setModalOpen(false)} style={{ marginRight: 8 }}>Cancel</Button>
                        <Button type="primary" htmlType="submit" style={{ background: NAVY, borderColor: GOLD }}>
                            {editingLead ? 'Update Lead' : 'Add Lead'}
                        </Button>
                    </div>
                </Form>
            </Modal>
        </div>
    );
}
