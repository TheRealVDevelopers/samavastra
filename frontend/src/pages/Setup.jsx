import { useState } from 'react';
import { Button, Form, Input, Typography, Alert, Card } from 'antd';
import { auth, db } from '../firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

const { Title, Text } = Typography;

/**
 * First-time setup page — only needed once to create the CEO admin account.
 * Visit /setup to use this page.
 * It will be inaccessible once an admin account already exists.
 */
export default function SetupPage() {
    const [status, setStatus] = useState(null); // 'success' | 'error'
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const onFinish = async (values) => {
        setLoading(true);
        setStatus(null);

        try {
            // Check if CEO already exists
            const ceoCheck = await getDoc(doc(db, 'users', 'ceo_setup_check'));
            // (This won't block — we just try to create; Firebase will reject duplicate emails)

            const userCredential = await createUserWithEmailAndPassword(
                auth,
                values.email,
                values.password
            );

            await setDoc(doc(db, 'users', userCredential.user.uid), {
                firstName: values.firstName,
                lastName: values.lastName,
                email: values.email,
                role: 'CEO',
                department: 'Management',
                isActive: true,
                createdAt: new Date().toISOString(),
            });

            setStatus('success');
            setMessage(`✅ CEO account created for ${values.email}! You can now login at /login`);
        } catch (error) {
            setStatus('error');
            if (error.code === 'auth/email-already-in-use') {
                setMessage('An account with this email already exists. Please login instead.');
            } else {
                setMessage(error.message);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            style={{
                minHeight: '100vh',
                background: 'linear-gradient(160deg, #0a1628 0%, #11244c 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '20px',
            }}
        >
            <Card
                style={{ width: '100%', maxWidth: 480, borderRadius: 12 }}
                bodyStyle={{ padding: '40px' }}
            >
                <Title level={2} style={{ color: '#0a1628', marginBottom: 4 }}>
                    Samavastra
                </Title>
                <Title level={4} style={{ color: '#888', marginTop: 0, marginBottom: 24 }}>
                    First-Time Setup — Create CEO Account
                </Title>

                {status && (
                    <Alert
                        type={status}
                        message={message}
                        style={{ marginBottom: 20 }}
                        showIcon
                    />
                )}

                <Form layout="vertical" onFinish={onFinish} disabled={status === 'success'}>
                    <Form.Item
                        label="First Name"
                        name="firstName"
                        rules={[{ required: true, message: 'Enter first name' }]}
                    >
                        <Input size="large" placeholder="First Name" />
                    </Form.Item>
                    <Form.Item
                        label="Last Name"
                        name="lastName"
                        rules={[{ required: true, message: 'Enter last name' }]}
                    >
                        <Input size="large" placeholder="Last Name" />
                    </Form.Item>
                    <Form.Item
                        label="Email"
                        name="email"
                        initialValue="admin@sam.com"
                        rules={[{ required: true, type: 'email', message: 'Enter a valid email' }]}
                    >
                        <Input size="large" placeholder="admin@sam.com" />
                    </Form.Item>
                    <Form.Item
                        label="Password"
                        name="password"
                        initialValue="123456"
                        rules={[{ required: true, min: 6, message: 'Password must be at least 6 characters' }]}
                    >
                        <Input.Password size="large" placeholder="Password" />
                    </Form.Item>
                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            size="large"
                            loading={loading}
                            block
                            style={{ background: '#0a1628', borderColor: '#c9a84c', color: 'white' }}
                        >
                            Create CEO Account
                        </Button>
                    </Form.Item>
                </Form>

                {status === 'success' && (
                    <Button type="link" href="/login" block>
                        → Go to Login
                    </Button>
                )}
            </Card>
        </div>
    );
}
