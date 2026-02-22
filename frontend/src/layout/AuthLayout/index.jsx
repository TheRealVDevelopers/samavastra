import React from 'react';
import { Layout, Row, Col } from 'antd';

export default function AuthLayout({ sideContent, children }) {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Row style={{ minHeight: '100vh' }}>
        <Col
          xs={{ span: 0, order: 2 }}
          sm={{ span: 0, order: 2 }}
          md={{ span: 11, order: 1 }}
          lg={{ span: 12, order: 1 }}
          style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #1B2B65 0%, #121D47 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Subtle geometric overlay */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.05, backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            {sideContent}
          </div>
        </Col>
        <Col
          xs={{ span: 24, order: 1 }}
          sm={{ span: 24, order: 1 }}
          md={{ span: 13, order: 2 }}
          lg={{ span: 12, order: 2 }}
          style={{
            background: '#FFFFFF',
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {children}
          </div>
          <div style={{ padding: '24px', textAlign: 'center', color: '#6B7280', fontSize: '13px' }}>
            Samavastra — Uniform Manufacturing Control System
          </div>
        </Col>
      </Row>
    </Layout>
  );
}
