import { useLayoutEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Layout } from 'antd';
import { useAppContext } from '@/context/appContext';
import Navigation from '@/apps/Navigation/NavigationContainer';
import HeaderContent from '@/apps/Header/HeaderContainer';
import PageLoader from '@/components/PageLoader';
import AppRouter from '@/router/AppRouter';
import useResponsive from '@/hooks/useResponsive';

export default function ErpCrmApp() {
  const { Content } = Layout;
  const { isMobile } = useResponsive();

  return (
    <Layout hasSider style={{ minHeight: '100vh' }}>
      <Navigation />
      {isMobile ? (
        <Layout style={{ marginLeft: 0, background: '#F4F6FB' }}>
          <HeaderContent />
          <Content
            style={{
              margin: '24px auto',
              overflow: 'initial',
              width: '100%',
              padding: '0 16px',
              maxWidth: 'none',
              background: '#F4F6FB'
            }}
          >
            <AppRouter />
          </Content>
        </Layout>
      ) : (
        <Layout style={{ background: '#F4F6FB' }}>
          <HeaderContent />
          <Content
            style={{
              margin: '32px auto 40px',
              overflow: 'initial',
              width: '100%',
              padding: '0 40px',
              maxWidth: 1600,
              background: '#F4F6FB'
            }}
          >
            <AppRouter />
          </Content>
        </Layout>
      )}
    </Layout>
  );
}
