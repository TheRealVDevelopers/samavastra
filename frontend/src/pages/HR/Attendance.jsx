import { useState } from 'react';
import {
  Table, Button, Tag, Typography, Modal, Form,
  Row, Col, Space, message, Card, Select, DatePicker, Statistic
} from 'antd';
import { PlusOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { useCollection } from '@/hooks/useCollection';
import { orderBy } from 'firebase/firestore';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;
const NAVY = '#0a1628';
const GOLD = '#c9a84c';

export default function AttendancePage() {
  const { data: records, loading, add } = useCollection('attendance', [orderBy('date', 'desc')]);
  const { data: employees } = useCollection('employees');
  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm();
  const today = dayjs().format('YYYY-MM-DD');

  const handleSubmit = async (values) => {
    const emp = employees.find(e => e.id === values.employeeId);
    const entries = values.employeeIds.map(eid => {
      const e = employees.find(x => x.id === eid);
      return {
        employeeId: eid,
        employeeName: e ? `${e.firstName} ${e.lastName}` : eid,
        date: values.date ? values.date.format('YYYY-MM-DD') : today,
        status: values.status,
      };
    });
    await Promise.all(entries.map(e => add(e)));
    message.success(`Attendance marked for ${entries.length} employees`);
    setModalOpen(false);
  };

  const todayPresent = records.filter(r => r.date === today && r.status === 'Present').length;
  const todayAbsent = records.filter(r => r.date === today && r.status === 'Absent').length;

  const columns = [
    { title: 'Employee', dataIndex: 'employeeName', key: 'employeeName', render: v => <Text strong>{v}</Text> },
    { title: 'Date', dataIndex: 'date', key: 'date', render: v => dayjs(v).format('D MMM YYYY') },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: v => (
        <Tag color={v === 'Present' ? 'green' : v === 'Absent' ? 'red' : 'orange'} icon={v === 'Present' ? <CheckOutlined /> : <CloseOutlined />}>
          {v}
        </Tag>
      ),
    },
  ];

  return (
    <div>
      <Row gutter={16} style={{ marginBottom: 20 }}>
        {[
          { title: "Today's Present", value: todayPresent, color: '#52c41a' },
          { title: "Today's Absent", value: todayAbsent, color: '#ff4d4f' },
          { title: 'Total Employees', value: employees.length, color: NAVY },
        ].map(s => (
          <Col span={8} key={s.title}>
            <Card style={{ borderRadius: 12, border: 'none', boxShadow: '0 2px 12px rgba(10,22,40,0.08)' }} styles={{ body: { padding: 20 } }}>
              <Statistic title={s.title} value={s.value} valueStyle={{ color: s.color, fontWeight: 700 }} />
            </Card>
          </Col>
        ))}
      </Row>

      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Col>
          <Title level={3} style={{ color: NAVY, margin: 0 }}>Attendance</Title>
        </Col>
        <Col>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => { form.resetFields(); setModalOpen(true); }} style={{ background: NAVY, borderColor: GOLD }}>
            Mark Attendance
          </Button>
        </Col>
      </Row>

      <Card style={{ borderRadius: 12, border: 'none', boxShadow: '0 2px 12px rgba(10,22,40,0.08)' }}>
        <Table dataSource={records} columns={columns} rowKey="id" loading={loading} pagination={{ pageSize: 20 }} />
      </Card>

      <Modal title="Mark Attendance" open={modalOpen} onCancel={() => setModalOpen(false)} footer={null} width={480}>
        <Form form={form} layout="vertical" onFinish={handleSubmit} style={{ marginTop: 16 }}>
          <Form.Item label="Date" name="date" initialValue={dayjs()} rules={[{ required: true }]}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item label="Employees" name="employeeIds" rules={[{ required: true }]}>
            <Select mode="multiple" placeholder="Select employees" optionFilterProp="children" showSearch>
              {employees.map(e => <Option key={e.id} value={e.id}>{e.firstName} {e.lastName}</Option>)}
            </Select>
          </Form.Item>
          <Form.Item label="Status" name="status" initialValue="Present" rules={[{ required: true }]}>
            <Select>
              <Option value="Present">Present</Option>
              <Option value="Absent">Absent</Option>
              <Option value="Half Day">Half Day</Option>
              <Option value="Leave">Leave</Option>
            </Select>
          </Form.Item>
          <div style={{ textAlign: 'right' }}>
            <Button onClick={() => setModalOpen(false)} style={{ marginRight: 8 }}>Cancel</Button>
            <Button type="primary" htmlType="submit" style={{ background: NAVY, borderColor: GOLD }}>Mark Attendance</Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
