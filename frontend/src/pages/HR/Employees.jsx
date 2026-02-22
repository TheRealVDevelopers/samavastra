import { useState } from 'react';
import {
  Table, Button, Tag, Typography, Modal, Form, Input,
  Row, Col, Space, message, Card, Select, DatePicker,
  Avatar, Popconfirm, Tooltip, Divider
} from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined,
  UserOutlined, PhoneOutlined, MailOutlined
} from '@ant-design/icons';
import { useCollection } from '@/hooks/useCollection';
import { orderBy } from 'firebase/firestore';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;
const NAVY = '#0a1628';
const GOLD = '#c9a84c';

const DEPARTMENTS = ['Management', 'Sales', 'Production', 'Accounts', 'Logistics', 'HR', 'Quality'];
const ROLES = ['CEO', 'Manager', 'Staff', 'Accountant'];

const ROLE_COLORS = { CEO: '#722ed1', Manager: '#1890ff', Staff: '#52c41a', Accountant: '#fa8c16' };

export default function EmployeesPage() {
  const { data: employees, loading, add, update, remove } = useCollection('employees', [orderBy('createdAt', 'desc')]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEmp, setEditingEmp] = useState(null);
  const [form] = Form.useForm();

  const openCreate = () => { setEditingEmp(null); form.resetFields(); setModalOpen(true); };
  const openEdit = (emp) => {
    setEditingEmp(emp);
    form.setFieldsValue({
      ...emp,
      joiningDate: emp.joiningDate ? dayjs(emp.joiningDate) : null,
      dob: emp.dob ? dayjs(emp.dob) : null,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (values) => {
    const payload = {
      ...values,
      joiningDate: values.joiningDate ? values.joiningDate.toISOString() : null,
      dob: values.dob ? values.dob.toISOString() : null,
    };
    if (editingEmp) {
      await update(editingEmp.id, payload);
      message.success('Employee updated');
    } else {
      await add({ ...payload, isActive: true });
      message.success('Employee added');
    }
    setModalOpen(false);
  };

  const columns = [
    {
      title: 'Employee',
      key: 'employee',
      render: (_, r) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Avatar style={{ background: NAVY, color: GOLD, fontWeight: 700 }}>
            {r.firstName?.charAt(0)}{r.lastName?.charAt(0)}
          </Avatar>
          <div>
            <Text strong style={{ display: 'block' }}>{r.firstName} {r.lastName}</Text>
            <Text style={{ color: '#888', fontSize: 12 }}>{r.empId || '—'}</Text>
          </div>
        </div>
      ),
    },
    { title: 'Department', dataIndex: 'department', key: 'department', render: v => <Tag color="blue">{v || '—'}</Tag> },
    { title: 'Role', dataIndex: 'role', key: 'role', render: v => <Tag color={ROLE_COLORS[v] || 'default'}>{v || '—'}</Tag> },
    {
      title: 'Contact',
      key: 'contact',
      render: (_, r) => (
        <div>
          {r.phone && <Text style={{ fontSize: 12 }}><PhoneOutlined /> {r.phone}</Text>}
          {r.email && <Text style={{ fontSize: 12, display: 'block' }}><MailOutlined /> {r.email}</Text>}
        </div>
      ),
    },
    {
      title: 'Joining Date',
      dataIndex: 'joiningDate',
      key: 'joiningDate',
      render: v => v ? dayjs(v).format('D MMM YYYY') : '—',
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'isActive',
      render: v => <Tag color={v !== false ? 'green' : 'red'}>{v !== false ? 'Active' : 'Inactive'}</Tag>,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, r) => (
        <Space>
          <Button icon={<EditOutlined />} size="small" onClick={() => openEdit(r)} />
          <Popconfirm title="Remove employee?" onConfirm={() => remove(r.id).then(() => message.success('Removed'))}>
            <Button icon={<DeleteOutlined />} size="small" danger />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const activeCount = employees.filter(e => e.isActive !== false).length;

  return (
    <div>
      <Row justify="space-between" align="middle" style={{ marginBottom: 20 }}>
        <Col>
          <Title level={3} style={{ color: NAVY, marginBottom: 4 }}>Employees</Title>
          <Text style={{ color: '#888' }}>{activeCount} active · {employees.length} total</Text>
        </Col>
        <Col>
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate} style={{ background: NAVY, borderColor: GOLD }}>
            Add Employee
          </Button>
        </Col>
      </Row>

      <Card style={{ borderRadius: 12, border: 'none', boxShadow: '0 2px 12px rgba(10,22,40,0.08)' }}>
        <Table dataSource={employees} columns={columns} rowKey="id" loading={loading} pagination={{ pageSize: 15 }} />
      </Card>

      <Modal
        title={editingEmp ? 'Edit Employee' : 'Add Employee'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        width={620}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit} style={{ marginTop: 16 }}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="First Name" name="firstName" rules={[{ required: true }]}>
                <Input placeholder="First name" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Last Name" name="lastName" rules={[{ required: true }]}>
                <Input placeholder="Last name" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Employee ID" name="empId">
                <Input placeholder="e.g. SAM-001" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Department" name="department" rules={[{ required: true }]}>
                <Select placeholder="Select department">
                  {DEPARTMENTS.map(d => <Option key={d} value={d}>{d}</Option>)}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Role / Designation" name="role" rules={[{ required: true }]}>
                <Select placeholder="Select role">
                  {ROLES.map(r => <Option key={r} value={r}>{r}</Option>)}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Phone" name="phone">
                <Input placeholder="+91 98765 43210" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Email" name="email">
                <Input placeholder="emp@samavastra.com" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Joining Date" name="joiningDate">
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Date of Birth" name="dob">
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Monthly Salary (₹)" name="salary">
                <Input type="number" placeholder="e.g. 25000" />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item label="Address" name="address">
                <Input.TextArea rows={2} placeholder="Home address" />
              </Form.Item>
            </Col>
          </Row>
          <div style={{ textAlign: 'right' }}>
            <Button onClick={() => setModalOpen(false)} style={{ marginRight: 8 }}>Cancel</Button>
            <Button type="primary" htmlType="submit" style={{ background: NAVY, borderColor: GOLD }}>
              {editingEmp ? 'Update Employee' : 'Add Employee'}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
