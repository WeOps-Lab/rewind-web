'use client'
import { useState } from 'react';
import { Button, Form, Input, Typography, Space, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import Image from 'next/image';
import Collapse from "@/components/collapse/index"

const { Title } = Typography;

export default function LoginPage() {
  const [loading, setLoading] = useState(false);

  const onFinish = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      message.success('Login successful!');
    }, 2000);
  };

  return (
    <div className="flex items-center w-full justify-center min-h-screen bg-gray-100">
      <Collapse title={'hdhdhh'}><div>fff</div></Collapse>
      <div className='bg-green-300 w-40 h-40 p-4 m-4 text-xl' onPointerEnter={()=>{console.log('鼠标的进入')}}>000000</div>
      <div className="p-8 bg-white shadow rounded-md w-full max-w-md text-center">
        <div className="flex justify-center mb-6">
          <Image src="" alt="Logo" width={100} height={100} />
        </div>
        <Title level={3} className="text-center text-gray-700">登录</Title>
        <Form
          name="login"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          className="mt-4"
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: '请输入你的账号!' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="用户名" />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入你的密码!' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="密码" />
          </Form.Item>
          <Form.Item className="mb-0">
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <Button type="primary" htmlType="submit" loading={loading} block>
                登录页面
              </Button>
              <Button type="link">忘记密码?</Button>
              <Button type="link">创建一个用户</Button>
            </Space>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
}
