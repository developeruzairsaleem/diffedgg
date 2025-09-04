"use client";
import "@ant-design/v5-patch-for-react-19";
import React, { useState } from "react";
import { Layout, Menu, theme, Button } from "antd";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import {
  DashboardOutlined,
  UserOutlined,
  StarOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  DollarOutlined,
} from "@ant-design/icons";
import Link from "next/link";
import { usePathname } from "next/navigation";

const { Header, Sider, Content } = Layout;
import "antd/dist/reset.css";
import { LuGamepad } from "react-icons/lu";
import { useRouter } from "next/navigation";
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const menuItems = [
    {
      key: "/admin",
      icon: <DashboardOutlined />,
      label: <Link href="/admin">Dashboard</Link>,
    },
    {
      key: "/admin/orders",
      icon: <DashboardOutlined />,
      label: <Link href="/admin/orders">Orders</Link>,
    },
    {
      key: "/admin/games",
      icon: <LuGamepad />,
      label: <Link href="/admin/games">Games</Link>,
    },
    {
      key: "/admin/services",
      icon: <UserOutlined />,
      label: <Link href="/admin/services">Services</Link>,
    },
    {
      key: "/admin/subpackages",
      icon: <StarOutlined />,
      label: <Link href="/admin/subpackages">SubPackages</Link>,
    },
    {
      key: "/admin/customers",
      icon: <StarOutlined />,
      label: <Link href="/admin/customers">Customers</Link>,
    },
    {
      key: "/admin/providers",
      icon: <StarOutlined />,
      label: <Link href="/admin/providers">Providers</Link>,
    },
    {
      key: "/admin/invites",
      icon: <UserOutlined />,
      label: <Link href="/admin/invites">Invites</Link>,
    },
    {
      key: "/admin/payout-requests",
      icon: <DollarOutlined />,
      label: <Link href="/admin/payout-requests">Payout Requests</Link>,
    },
  ];

  return (
    <AntdRegistry>
      <Layout style={{ minHeight: "100vh" }}>
        <Sider trigger={null} collapsible collapsed={collapsed}>
          <div className="demo-logo-vertical" />
          <div
            style={{
              height: 32,
              margin: 16,
              background: "rgba(255, 255, 255, 0.3)",
              borderRadius: 6,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontWeight: "bold",
            }}
          >
            {collapsed ? "DG" : "Diffed.gg Admin"}
          </div>
          <Menu
            theme="dark"
            mode="inline"
            selectedKeys={[pathname || "/admin"]}
            items={menuItems}
          />
        </Sider>
        <Layout>
          <Header style={{ padding: 0, background: colorBgContainer }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                height: "100%",
                paddingLeft: 16,
                justifyContent: "space-between",
              }}
            >
              {React.createElement(
                collapsed ? MenuUnfoldOutlined : MenuFoldOutlined,
                {
                  className: "trigger",
                  onClick: () => setCollapsed(!collapsed),
                  style: { fontSize: 18, cursor: "pointer" },
                }
              )}
              <div style={{ paddingRight: 16 }}>
                <Button
                  type="primary"
                  danger
                  loading={loggingOut}
                  onClick={async () => {
                    try {
                      setLoggingOut(true);
                      await fetch("/api/logout", { method: "POST" });
                      router.push("/");
                    } catch (e) {
                      // swallow
                      console.error("error logging out", e);
                    } finally {
                      setLoggingOut(false);
                    }
                  }}
                >
                  {loggingOut ? "Logging out..." : "Logout"}
                </Button>
              </div>
            </div>
          </Header>
          <Content
            style={{
              margin: "24px 16px",
              padding: 24,
              minHeight: 280,
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
            }}
          >
            {children}
          </Content>
        </Layout>
      </Layout>
    </AntdRegistry>
  );
}
