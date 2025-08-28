"use client";

import { useState } from "react";
import {
  Table,
  Tag,
  Button,
  Space,
  Avatar,
  Tooltip,
  Input,
  Select,
  DatePicker,
  Card,
  message,
  Modal,
} from "antd";
import {
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  FilterOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import type { OrderListDto, OrdersListRequest } from "@/types/order.dto";
import { OrderStatus } from "@/generated/prisma";
import { useOrders } from "@/hooks/useOrders";
import Link from "next/link";

const { Search } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;

const statusColors = {
  [OrderStatus.PENDING]: "orange",
  [OrderStatus.IN_PROGRESS]: "blue",
  [OrderStatus.COMPLETED]: "green",
  [OrderStatus.CANCELLED]: "red",
};

const statusLabels = {
  [OrderStatus.PENDING]: "Pending",
  [OrderStatus.IN_PROGRESS]: "In Progress",
  [OrderStatus.COMPLETED]: "Completed",
  [OrderStatus.CANCELLED]: "Cancelled",
};

export default function OrdersTable() {
  const [params, setParams] = useState<OrdersListRequest>({
    page: 1,
    limit: 10,
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  const { data, loading, error, refetch } = useOrders(params);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // deleting an order
  const handleDeleteOrder = async ({ orderId }: { orderId: string }) => {
    Modal.confirm({
      title: "Are you sure you want to delete this order?",
      okText: "Yes, delete",
      cancelText: "Cancel",
      onOk: async () => {
        setDeletingId(orderId);
        try {
          const res = await fetch(`/api/admin/orders/${orderId}`, {
            method: "DELETE",
          });

          if (!res.ok) throw new Error("Failed to delete");
          else {
            await refetch();
            message.success("Order deleted");
          }
          // refetch data if needed
        } catch (err) {
          message.error("Error deleting order");
        } finally {
          setDeletingId(null);
        }
      },
    });
  };

  const columns: ColumnsType<OrderListDto> = [
    {
      title: "Order #",
      dataIndex: "orderNumber",
      key: "orderNumber",
      width: 120,
      render: (orderNumber: string, record: OrderListDto) => (
        <Link href={`/admin/orders/${record.id}`}>
          <Button type="link" size="small">
            #{orderNumber.slice(-8)}
          </Button>
        </Link>
      ),
    },
    {
      title: "Customer",
      key: "customer",
      width: 200,
      render: (_, record: OrderListDto) => (
        <Space>
          <Avatar src={record.customer.profileImage} size="small">
            {record.customer.username[0].toUpperCase()}
          </Avatar>
          <div>
            <div style={{ fontWeight: 500 }}>{record.customer.username}</div>
            <div style={{ fontSize: "12px", color: "#666" }}>
              {record.customer.email}
            </div>
          </div>
        </Space>
      ),
    },
    {
      title: "Providers",
      key: "providers",
      width: 200,
      render: (_, record: OrderListDto) => {
        const usernames = record.assignments
          ?.map((a: { provider?: { username?: string } }) => a.provider?.username)
          .filter(Boolean)
          .join(", ");
        return <span>{usernames || "-"}</span>;
      },
    },
    {
      title: "No. of Games",
      key: "gamesCount",
      width: 120,
      render: (_, record: OrderListDto) => {
        return <span>{(record as any).gamesCount || "-"}</span>;
      },
    },
    {
      title: "Service",
      key: "service",
      width: 250,
      render: (_, record: OrderListDto) => (
        <Space>
          <Avatar
            src={record.subpackage.service.game.image}
            size="small"
            shape="square"
          />
          <div>
            <div style={{ fontWeight: 500 }}>{record.subpackage.name}</div>
            <div style={{ fontSize: "12px", color: "#666" }}>
              {record.subpackage.service.game.name} •{" "}
              {record.subpackage.service.name}
            </div>
          </div>
        </Space>
      ),
    },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
      width: 100,
      render: (price: number) => `$${price.toFixed(2)}`,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status: OrderStatus) => (
        <Tag color={statusColors[status]}>{statusLabels[status]}</Tag>
      ),
    },
    {
      title: "Progress",
      key: "progress",
      width: 120,
      render: (_, record: OrderListDto) => (
        <div>
          <div style={{ fontSize: "12px" }}>
            {record.approvedCount}/{record.requiredCount} providers
          </div>
          <div style={{ fontSize: "12px", color: "#666" }}>
            {record.assignmentsCount} assignments
          </div>
        </div>
      ),
    },
    {
      title: "Created",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 120,
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: "Actions",
      key: "actions",
      width: 120,
      render: (_, record: OrderListDto) => (
        <Space size="small">
          <Tooltip title="View Details">
            <Link href={`/admin/orders/${record.id}`}>
              <Button type="text" icon={<EyeOutlined />} size="small" />
            </Link>
          </Tooltip>

          <Button
            danger
            icon={<DeleteOutlined />}
            loading={deletingId === record.id}
            onClick={() => handleDeleteOrder({ orderId: record.id })}
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  const handleTableChange = (pagination: any, filters: any, sorter: any) => {
    setParams((prev) => ({
      ...prev,
      page: pagination.current,
      limit: pagination.pageSize,
      sortBy: sorter.field || "createdAt",
      sortOrder: sorter.order === "ascend" ? "asc" : "desc",
    }));
  };

  const handleSearch = (value: string) => {
    setParams((prev) => ({
      ...prev,
      search: value || undefined,
      page: 1,
    }));
  };

  const handleStatusFilter = (status: OrderStatus | undefined) => {
    setParams((prev) => ({
      ...prev,
      status,
      page: 1,
    }));
  };

  return (
    <Card>
      <div style={{ marginBottom: 16 }}>
        <Space wrap>
          <Search
            placeholder="Search orders, customers..."
            allowClear
            onSearch={handleSearch}
            style={{ width: 300 }}
            prefix={<SearchOutlined />}
          />
          <Select
            placeholder="Filter by status"
            allowClear
            style={{ width: 150 }}
            onChange={handleStatusFilter}
          >
            {Object.entries(statusLabels).map(([value, label]) => (
              <Option key={value} value={value}>
                {label}
              </Option>
            ))}
          </Select>
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={data?.orders || []}
        rowKey="id"
        loading={loading}
        pagination={{
          current: data?.page || 1,
          pageSize: data?.limit || 10,
          total: data?.total || 0,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} of ${total} orders`,
        }}
        onChange={handleTableChange}
        scroll={{ x: 1200 }}
      />
    </Card>
  );
}
