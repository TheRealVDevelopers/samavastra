import { Layout, Typography } from 'antd';

const { Content } = Layout;
const { Title, Text } = Typography;

export default function SideContent() {
  return (
    <Content
      style={{
        padding: '0 30px',
        width: '100%',
        maxWidth: '450px',
        margin: '0 auto',
        textAlign: 'center'
      }}
      className="sideContent"
    >
      <div style={{ width: '100%' }}>
        <Title level={1} style={{ fontSize: 64, color: '#F5A623', letterSpacing: 2, marginBottom: 8 }}>
          Samavastra
        </Title>

        <Text style={{ color: '#FFFFFF', fontSize: 18, opacity: 0.8, letterSpacing: 1 }}>
          Operations Control System
        </Text>
      </div>
    </Content>
  );
}
