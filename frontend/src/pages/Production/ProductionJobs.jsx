import { useState } from 'react';
import {
  Table, Button, Tag, Typography, Modal, Form, Input,
  Select, Row, Col, Space, message, Card, Popconfirm,
  Tooltip, Progress, Steps, InputNumber, Divider, Badge, Drawer
} from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined,
  CheckCircleOutlined, PlayCircleOutlined, EyeOutlined,
  ScissorOutlined, SkinOutlined, CheckSquareOutlined, InboxOutlined
} from '@ant-design/icons';
import { useCollection } from '@/hooks/useCollection';
import { orderBy } from 'firebase/firestore';
import { useSelector } from 'react-redux';
import { selectAuth } from '@/redux/auth/selectors';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const NAVY = '#0a1628';
const GOLD = '#c9a84c';

const STATUS_COLORS = {
  pending: 'default', active: 'blue', completed: 'green',
  paused: 'orange', cancelled: 'red',
};

const STAGES = [
  { key: 'cutting', label: 'Cutting', icon: <ScissorOutlined />, color: '#1890ff' },
  { key: 'stitching', label: 'Stitching', icon: <SkinOutlined />, color: '#722ed1' },
  { key: 'finishing', label: 'Finishing', icon: <CheckSquareOutlined />, color: '#fa8c16' },
  { key: 'packing', label: 'Packing', icon: <InboxOutlined />, color: '#52c41a' },
];

function StageProgress({ stages = {} }) {
  const done = STAGES.filter(s => stages[s.key]).length;
  const pct = Math.round((done / STAGES.length) * 100);
  return (
    <div>
      <Progress percent={pct} size="small" strokeColor={GOLD} style={{ marginBottom: 8 }} />
      <div style={{ display: 'flex', gap: 6 }}>
        {STAGES.map(s => (
          <Tag
            key={s.key}
            color={stages[s.key] ? 'success' : 'default'}
            style={{ margin: 0, fontSize: 11 }}
          >
            {stages[s.key] ? '✓' : '○'} {s.label}
          </Tag>
        ))}
      </div>
    </div>
  );
}

function JobDetailDrawer({ job, open, onClose, onUpdate }) {
  const [updating, setUpdating] = useState(false);

  const toggleStage = async (stageKey) => {
    setUpdating(true);
    const newStages = { ...job.stages, [stageKey]: !job.stages?.[stageKey] };
    const allDone = STAGES.every(s => newStages[s.key]);
    await onUpdate(job.id, {
      stages: newStages,
      status: allDone ? 'completed' : 'active',
    });
    setUpdating(false);
    message.success(allDone ? '🎉 Job completed!' : `Stage updated`);
  };

  const handleOutputUpdate = async (values) => {
    await onUpdate(job.id, {
      producedUnits: (job.producedUnits || 0) + (values.units || 0),
      defectUnits: (job.defectUnits || 0) + (values.defects || 0),
      lastOutputEntry: new Date().toISOString(),
    });
    message.success('Daily output recorded');
  };

  return (
    <Drawer
      title={
        <div>
          <Text strong style={{ fontSize: 16 }}>Production Job</Text>
          <br />
          <Text style={{ color: '#888', fontSize: 13 }}>{job?.schoolName}</Text>
        </div>
      }
      open={open}
      onClose={onClose}
      width={520}
    >
      {job && (
        <div>
          {/* Stats */}
          <Row gutter={16} style={{ marginBottom: 20 }}>
            <Col span={8}>
              <Card size="small" style={{ textAlign: 'center', borderRadius: 8 }}>
                <Text style={{ color: '#888', fontSize: 12 }}>Planned</Text>
                <Title level={4} style={{ margin: 0, color: NAVY }}>{job.plannedUnits || 0}</Title>
                <Text style={{ fontSize: 11, color: '#aaa' }}>units</Text>
              </Card>
            </Col>
            <Col span={8}>
              <Card size="small" style={{ textAlign: 'center', borderRadius: 8 }}>
                <Text style={{ color: '#888', fontSize: 12 }}>Produced</Text>
                <Title level={4} style={{ margin: 0, color: '#52c41a' }}>{job.producedUnits || 0}</Title>
                <Text style={{ fontSize: 11, color: '#aaa' }}>units</Text>
              </Card>
            </Col>
            <Col span={8}>
              <Card size="small" style={{ textAlign: 'center', borderRadius: 8 }}>
                <Text style={{ color: '#888', fontSize: 12 }}>Defects</Text>
                <Title level={4} style={{ margin: 0, color: '#ff4d4f' }}>{job.defectUnits || 0}</Title>
                <Text style={{ fontSize: 11, color: '#aaa' }}>units</Text>
              </Card>
            </Col>
          </Row>

          {/* Stage Tracker */}
          <Divider orientation="left">Production Stages</Divider>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {STAGES.map(stage => {
              const done = job.stages?.[stage.key] || false;
              return (
                <div
                  key={stage.key}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '12px 16px',
                    background: done ? '#f6ffed' : '#fafafa',
                    borderRadius: 8,
                    border: `1px solid ${done ? '#b7eb8f' : '#f0f0f0'}`,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ color: done ? '#52c41a' : stage.color, fontSize: 18 }}>
                      {stage.icon}
                    </span>
                    <Text strong style={{ color: done ? '#52c41a' : NAVY }}>{stage.label}</Text>
                  </div>
                  <Button
                    type={done ? 'default' : 'primary'}
                    size="small"
                    loading={updating}
                    onClick={() => toggleStage(stage.key)}
                    style={done ? { borderColor: '#52c41a', color: '#52c41a' } : { background: stage.color, borderColor: stage.color }}
                  >
                    {done ? '✓ Done' : 'Mark Done'}
                  </Button>
                </div>
              );
            })}
          </div>

          {/* Daily Output Entry */}
          <Divider orientation="left">Record Today's Output</Divider>
          <Form layout="inline" onFinish={handleOutputUpdate}>
            <Form.Item name="units" label="Units Produced">
              <InputNumber min={0} placeholder="0" style={{ width: 100 }} />
            </Form.Item>
            <Form.Item name="defects" label="Defects">
              <InputNumber min={0} placeholder="0" style={{ width: 80 }} />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" style={{ background: NAVY }}>
                Save Output
              </Button>
            </Form.Item>
          </Form>

          {/* Line Items */}
          {(job.items || []).length > 0 && (
            <>
              <Divider orientation="left">Order Items</Divider>
              <Table
                dataSource={job.items}
                rowKey={(_, i) => i}
                pagination={false}
                size="small"
                columns={[
                  { title: 'Description', dataIndex: 'description' },
                  { title: 'Qty', dataIndex: 'qty' },
                  { title: 'Unit Price', dataIndex: 'unitPrice', render: v => `₹${v || 0}` },
                ]}
              />
            </>
          )}
        </div>
      )}
    </Drawer>
  );
}

export default function ProductionJobsPage() {
  const { data: jobs, loading, add, update, remove } = useCollection('productionJobs', [orderBy('createdAt', 'desc')]);
  const { data: schools } = useCollection('schools');
  const { current: user } = useSelector(selectAuth);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [form] = Form.useForm();

  const openJob = (job) => { setSelectedJob(job); setDrawerOpen(true); };
  const openCreate = () => { form.resetFields(); setModalOpen(true); };

  const handleCreate = async (values) => {
    const school = schools.find(s => s.id === values.schoolId);
    await add({
      schoolId: values.schoolId,
      schoolName: school?.schoolName || '',
      plannedUnits: values.plannedUnits || 0,
      assignedWorkers: values.assignedWorkers || '',
      notes: values.notes || '',
      stages: { cutting: false, stitching: false, finishing: false, packing: false },
      producedUnits: 0,
      defectUnits: 0,
      status: 'active',
    });
    message.success('Production job created');
    setModalOpen(false);
  };

  const columns = [
    {
      title: 'School',
      dataIndex: 'schoolName',
      key: 'schoolName',
      render: v => <Text strong>{v}</Text>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: v => <Tag color={STATUS_COLORS[v] || 'default'}>{v || 'pending'}</Tag>,
    },
    {
      title: 'Stage Progress',
      key: 'stages',
      render: (_, r) => <StageProgress stages={r.stages} />,
      width: 300,
    },
    {
      title: 'Produced',
      key: 'units',
      render: (_, r) => (
        <div>
          <Text style={{ color: '#52c41a' }}>{r.producedUnits || 0}</Text>
          <Text style={{ color: '#aaa' }}> / {r.plannedUnits || 0}</Text>
        </div>
      ),
    },
    {
      title: 'Started',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: v => v ? dayjs(v).format('D MMM YYYY') : '—',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Tooltip title="Open Job">
            <Button
              icon={<EyeOutlined />}
              size="small"
              type="primary"
              style={{ background: NAVY }}
              onClick={() => openJob(record)}
            />
          </Tooltip>
          <Popconfirm title="Delete this job?" onConfirm={() => remove(record.id).then(() => message.success('Deleted'))}>
            <Button icon={<DeleteOutlined />} size="small" danger />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const activeJobs = jobs.filter(j => j.status === 'active' || j.status === 'pending');
  const completedJobs = jobs.filter(j => j.status === 'completed');

  return (
    <div>
      <Row justify="space-between" align="middle" style={{ marginBottom: 20 }}>
        <Col>
          <Title level={3} style={{ color: NAVY, marginBottom: 4 }}>Production Jobs</Title>
          <Text style={{ color: '#888' }}>
            {activeJobs.length} active · {completedJobs.length} completed
          </Text>
        </Col>
        <Col>
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate} style={{ background: NAVY, borderColor: GOLD }}>
            New Job
          </Button>
        </Col>
      </Row>

      <Card style={{ borderRadius: 12, border: 'none', boxShadow: '0 2px 12px rgba(10,22,40,0.08)' }}>
        <Table
          dataSource={jobs}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 15 }}
          rowClassName={r => r.status === 'completed' ? '' : ''}
        />
      </Card>

      {/* Job Detail Drawer */}
      <JobDetailDrawer
        job={selectedJob}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onUpdate={async (id, data) => {
          await update(id, data);
          // Refresh selected job
          setSelectedJob(prev => prev ? { ...prev, ...data } : prev);
        }}
      />

      {/* Create Job Modal */}
      <Modal
        title="Create Production Job"
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        width={520}
      >
        <Form form={form} layout="vertical" onFinish={handleCreate} style={{ marginTop: 16 }}>
          <Form.Item label="School" name="schoolId" rules={[{ required: true }]}>
            <Select placeholder="Select school" showSearch optionFilterProp="children">
              {schools.map(s => <Option key={s.id} value={s.id}>{s.schoolName}</Option>)}
            </Select>
          </Form.Item>
          <Form.Item label="Planned Units" name="plannedUnits" rules={[{ required: true }]}>
            <InputNumber min={1} style={{ width: '100%' }} placeholder="Total units to produce" />
          </Form.Item>
          <Form.Item label="Assigned Workers" name="assignedWorkers">
            <Input placeholder="e.g. Ravi, Suresh, Meena" />
          </Form.Item>
          <Form.Item label="Notes" name="notes">
            <Input.TextArea rows={2} placeholder="Additional notes..." />
          </Form.Item>
          <div style={{ textAlign: 'right' }}>
            <Button onClick={() => setModalOpen(false)} style={{ marginRight: 8 }}>Cancel</Button>
            <Button type="primary" htmlType="submit" style={{ background: NAVY, borderColor: GOLD }}>
              Create Job
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
