import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Result, Button, Input, Alert } from 'antd';
import { auth } from '../firebase';
import { sendPasswordResetEmail } from 'firebase/auth';
import useLanguage from '@/locale/useLanguage';
import AuthModule from '@/modules/AuthModule';

const ForgetPassword = () => {
  const translate = useLanguage();
  const navigate = useNavigate();
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const onFinish = async (values) => {
    setIsLoading(true);
    setError('');
    try {
      await sendPasswordResetEmail(auth, values.email);
      setIsSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const FormContainer = () => (
    <Form
      name="forgetpassword"
      className="login-form"
      onFinish={onFinish}
    >
      {error && <Alert type="error" message={error} style={{ marginBottom: 16 }} />}
      <Form.Item
        name="email"
        rules={[{ required: true, type: 'email', message: 'Please enter a valid email' }]}
      >
        <Input size="large" placeholder="Your email address" />
      </Form.Item>
      <Form.Item>
        <Button
          type="primary"
          htmlType="submit"
          className="login-form-button"
          size="large"
          loading={isLoading}
          style={{ background: '#0a1628', borderColor: '#c9a84c', width: '100%' }}
        >
          {translate('Request new Password')}
        </Button>
        <div style={{ marginTop: 12 }}>
          {translate('Or')} <a href="/login">{translate('already have account Login')}</a>
        </div>
      </Form.Item>
    </Form>
  );

  if (!isSuccess) {
    return <AuthModule authContent={<FormContainer />} AUTH_TITLE="Forget Password" />;
  } else {
    return (
      <Result
        status="success"
        title={translate('Check your email address to reset your password')}
        subTitle={translate('Password Reset in progress')}
        style={{ maxWidth: '450px', margin: 'auto' }}
        extra={
          <Button
            type="primary"
            onClick={() => navigate('/login')}
            style={{ background: '#0a1628', borderColor: '#c9a84c' }}
          >
            {translate('Login')}
          </Button>
        }
      />
    );
  }
};

export default ForgetPassword;
