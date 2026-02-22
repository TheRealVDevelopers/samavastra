import { useState } from 'react';
import {
  Table, Button, Tag, Typography, Modal, Form, Input,
  Row, Col, Space, message, Card, Select, Rate, DatePicker, Popconfirm, Statistic
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, StarOutlined } from '@ant-design/icons';
import { useCollection } from '@/hooks/useCollection';
import { orderBy } from 'firebase/firestore';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;
const NAVY = '#0a1628';
const GOLD = '#c9a84c';

export default function FeedbackPage() {
  const { data: feedbacks, loading, add, remove } = useCollection('feedback', [orderBy('createdAt', 'desc')]);
  const { data: schools } = useCollection('schools');
  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm();

  const handleSubmit = async (values) => {
    const school = schools.find(s => s.id === values.schoolId);
    await add({
      ...values,
      schoolName: school?.schoolName || '',
      date: new Date().toISOString(),
    });
    message.success('Feedback recorded');
    setModalOpen(false);
  };

  const avgRating = feedbacks.length
    ? (feedbacks.reduce((s, f) => s + (f.rating || 0), 0) / feedbacks.length).toFixed(1)
    : 0;

  const columns = [
    { title: 'School', dataIndex: 'schoolName', key: 'schoolName', render: v => <Text strong>{v}</Text> },
    { title: 'Order / Ref', dataIndex: 'orderId', key: 'orderId', render: v => v || '—' },
    {
      title: 'Rating',
      dataIndex: 'rating',
      key: 'rating',
      render: v => <Rate disabled defaultValue={v} style={{ fontSize: 14 }} />,
    },
    { title: 'Feedback', dataIndex: 'comments', key: 'comments', render: v => v || '—', ellipsis: true },
    { title: 'Date', dataIndex: 'date', key: 'date', render: v => v ? dayjs(v).format('D MMM YYYY') : '—' },
    {
      title: 'Actions', key: 'actions',
      render: (_, r) => (
        <Popconfirm title="Delete feedback?" onConfirm={() => remove(r.id).then(() => message.success('Deleted'))}>
          <Button icon={<DeleteOutlined />} size="small" danger />
        </Popconfirm>
      ),
    },
  ];

  const fiveStars = feedbacks.filter(f => f.rating === 5).length;
  const lowRatings = feedbacks.filter(f => f.rating <= 2).length;

  return (
    <div>
      <Row gutter={16} style={{ marginBottom: 20 }}>
        {[
          { title: 'Average Rating', value: avgRating, suffix: '/ 5', color: GOLD },
          { title: '5-Star Ratings', value: fiveStars, color: '#52c41a' },
          { title: 'Low Ratings (1-2★)', value: lowRatings, color: lowRatings > 0 ? '#ff4d4f' : '#52c41a' },
        ].map(s => (
          <Col span={8} key={s.title}>
            <Card style={{ borderRadius: 12, border: 'none', boxShadow: '0 2px 12px rgba(10,22,40,0.08)' }} styles={{ body: { padding: 20 } }}>
              <Statistic title={s.title} value={s.value} suffix={s.suffix} valueStyle={{ color: s.color, fontWeight: 700 }} />
            </Card>
          </Col>
        ))}
      </Row>

      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Col>
          <Title level={3} style={{ color: NAVY, margin: 0 }}>CSAT — Customer Feedback</Title>
        </Col>
        <Col>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => { form.resetFields(); setModalOpen(true); }} style={{ background: NAVY, borderColor: GOLD }}>
            Add Feedback
          </Button>
        </Col>
      </Row>

      <Card style={{ borderRadius: 12, border: 'none', boxShadow: '0 2px 12px rgba(10,22,40,0.08)' }}>
        <Table dataSource={feedbacks} columns={columns} rowKey="id" loading={loading} pagination={{ pageSize: 15 }} />
      </Card>

      <Modal title="Record Customer Feedback" open={modalOpen} onCancel={() => setModalOpen(false)} footer={null} width={520}>
        <Form form={form} layout="vertical" onFinish={handleSubmit} style={{ marginTop: 16 }}>
          <Form.Item label="School" name="schoolId" rules={[{ required: true }]}>
            <Select placeholder="Select school" showSearch optionFilterProp="children">
              {schools.map(s => <Option key={s.id} value={s.id}>{s.schoolName}</Option>)}
            </Select>
          </Form.Item>
          <Form.Item label="Order / Reference" name="orderId">
            <Input placeholder="Sales Order ID (optional)" />
          </Form.Item>
          <Form.Item label="Rating (1-5 Stars)" name="rating" rules={[{ required: true }]}>
            <Rate allowHalf />
          </Form.Item>
          <Form.Item label="Comments" name="comments">
            <TextArea rows={3} placeholder="Customer feedback comments..." />
          </Form.Item>
          <Form.Item label="Collected By" name="collectedBy">
            <Input placeholder="Your name" />
          </Form.Item>
          <div style={{ textAlign: 'right' }}>
            <Button onClick={() => setModalOpen(false)} style={{ marginRight: 8 }}>Cancel</Button>
            <Button type="primary" htmlType="submit" style={{ background: NAVY, borderColor: GOLD }}>Save Feedback</Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
