"use client";

import { useState } from "react";
import {
  Card,
  Descriptions,
  Tag,
  Avatar,
  Space,
  Button,
  Tabs,
  Table,
  Progress,
  Timeline,
  Input,
  Form,
  Select,
  message,
  Modal,
  Rate,
  Image,
} from "antd";
import {
  ArrowLeftOutlined,
  EditOutlined,
  MessageOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { useOrder } from "@/hooks/useOrders";
import { OrderStatus, OrderAssignmentStatus } from "@/generated/prisma";
import type {
  OrderAssignmentDto,
  ChatDto,
  OrderUpdateRequest,
  AssignmentUpdateRequest,
} from "@/types/order.dto";
import Link from "next/link";
import { Check } from "lucide-react";

const { TextArea } = Input;
const { Option } = Select;

const statusColors = {
  [OrderStatus.PENDING]: "orange",
  [OrderStatus.IN_PROGRESS]: "blue",
  [OrderStatus.COMPLETED]: "green",
  [OrderStatus.CANCELLED]: "red",
};

const assignmentStatusColors = {
  [OrderAssignmentStatus.PENDING]: "orange",
  [OrderAssignmentStatus.APPROVED]: "blue",
  [OrderAssignmentStatus.COMPLETED]: "green",
  [OrderAssignmentStatus.VERIFIED]: "purple",
  [OrderAssignmentStatus.REPLACED]: "red",
};

interface OrderDetailProps {
  orderId: string;
}

export default function OrderDetail({ orderId }: OrderDetailProps) {
  const { data: order, loading, error, refetch } = useOrder(orderId);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [completingOrder, setCompletingOrder] = useState(false);
  const [assignmentModalVisible, setAssignmentModalVisible] = useState(false);
  const [selectedAssignment, setSelectedAssignment] =
    useState<OrderAssignmentDto | null>(null);
  const [form] = Form.useForm();
  const [assignmentForm] = Form.useForm();

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!order) return <div>Order not found</div>;

  const handleUpdateOrder = async (values: OrderUpdateRequest) => {
    try {
      setCompletingOrder(true);
      // values.rerollsLeft = parseInt(
      //   values.rerollsLeft as unknown as string,
      //   10
      // );
      // values.requiredCount = parseInt(
      //   values.requiredCount as unknown as string,
      //   10
      // );
      console.log("----------------------------------");
      console.log("HADNLING REQUEST", JSON.stringify(values));
      console.log("----------------------------------");

      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const result = await response.json();

      if (result.success) {
        message.success("Order updated successfully");
        setEditModalVisible(false);
        refetch();
      } else {
        message.error(result.error || "Failed to update order");
      }
    } catch (err) {
      message.error("Network error occurred");
    } finally {
      setCompletingOrder(false);
    }
  };

  const handleUpdateAssignment = async (values: AssignmentUpdateRequest) => {
    if (!selectedAssignment) return;

    try {
      const response = await fetch(
        `/api/admin/orders/${orderId}/assignments/${selectedAssignment.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        }
      );

      const result = await response.json();

      if (result.success) {
        message.success("Assignment updated successfully");
        setAssignmentModalVisible(false);
        setSelectedAssignment(null);
        refetch();
      } else {
        message.error(result.error || "Failed to update assignment");
      }
    } catch (err) {
      message.error("Network error occurred");
    }
  };

  // @ts-ignore
  const assignmentColumns: ColumnsType<OrderAssignmentDto> = [
    {
      title: "Provider",
      key: "provider",
      render: (_, record: OrderAssignmentDto) => (
        <Space>
          <Avatar src={record.provider.profileImage} size="small">
            {record.provider.username[0].toUpperCase()}
          </Avatar>
          <div>
            <div>{record.provider.username}</div>
            <div style={{ fontSize: "12px", color: "#666" }}>
              {record.provider.email}
            </div>
          </div>
        </Space>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: OrderAssignmentStatus) => (
        <Tag color={assignmentStatusColors[status]}>
          {status.replace("_", " ")}
        </Tag>
      ),
    },
    {
      title: "Rating",
      dataIndex: "reviewRating",
      key: "reviewRating",
      render: (rating: number | undefined) =>
        rating ? <Rate disabled defaultValue={rating} /> : "-",
    },
    {
      title: "Review",
      key: "reviewtext",
      dataIndex: "reviewText",
      render: (reviewText: string, record: OrderAssignmentDto) =>
        reviewText ? (
          <p className="font-semibold text-gray-700 text-md">{reviewText}</p>
        ) : (
          "-"
        ),
    },
    ,
    {
      title: "Proof",
      key: "proofUrl",
      dataIndex: "proofUrl",
      render: (proofUrl: string) => {
        if (!proofUrl) {
          return "-";
        }
        return (
          <Image
            src={proofUrl} // This can be a thumbnail URL if you have one
            width={50}
            alt="Proof of completion"
            preview={{
              src: proofUrl, // The full-resolution image to show in the modal
              mask: (
                <div
                  style={{
                    background: "rgba(0, 0, 0, 0.5)",
                    color: "white",
                    height: "100%",
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <EyeOutlined />
                </div>
              ),
            }}
          />
        );
      },
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record: OrderAssignmentDto) => (
        <Space>
          <Button
            size="small"
            type="primary"
            disabled={record.status === OrderAssignmentStatus.VERIFIED}
            onClick={async () => {
              try {
                const response = await fetch(
                  `/api/provider-assignment/${record.id}/verify`,
                  {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                  }
                );
                const data = await response.json();
                if (!response.ok)
                  throw new Error(data.error || "Failed to verify assignment");
                message.success("Assignment marked as verified");
                refetch(); // Refresh the data
              } catch (error: any) {
                message.error(error.message || "Failed to verify assignment");
              }
            }}
          >
            {record.status === OrderAssignmentStatus.VERIFIED
              ? "Verified"
              : "Verify"}
          </Button>
        </Space>
      ),
    },
  ];
  const tabItems = [
    {
      key: "details",
      label: "Order Details",
      children: (
        <Card>
          <Descriptions column={2} bordered>
            <Descriptions.Item label="Order Number">
              #{order.orderNumber}
            </Descriptions.Item>
            <Descriptions.Item label="Status">
              <Tag color={statusColors[order.status]}>{order.status}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Customer">
              <Space>
                <Avatar src={order.customer.profileImage} size="small">
                  {order.customer.username[0].toUpperCase()}
                </Avatar>
                {order.customer.username} ({order.customer.email})
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="Price">
              ${order.price.toFixed(2)}
            </Descriptions.Item>
            <Descriptions.Item label="No. of Games">
              {(order as any).gamesCount || "-"}
            </Descriptions.Item>
            <Descriptions.Item label="Rank">
              {(order as any).rank?.name ? (
                <Space>
                  <span>{(order as any).rank.name}</span>
                  {(order as any).rank.additionalCost && (
                    <Tag color="blue">+${(order as any).rank.additionalCost}</Tag>
                  )}
                </Space>
              ) : (
                "-"
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Service">
              <Space>
                <Avatar
                  src={order.subpackage.service.game.image}
                  size="small"
                  shape="square"
                />
                {order.subpackage.name}
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="Duration">
              {order.subpackage.duration || "N/A"}
            </Descriptions.Item>
            <Descriptions.Item label="Progress">
              {order.approvedCount}/{order.requiredCount} providers approved
            </Descriptions.Item>
            <Descriptions.Item label="Rerolls Left">
              {order.rerollsLeft}
            </Descriptions.Item>
            <Descriptions.Item label="Created">
              {new Date(order.createdAt).toLocaleString()}
            </Descriptions.Item>
            <Descriptions.Item label="Updated">
              {new Date(order.updatedAt).toLocaleString()}
            </Descriptions.Item>
            {order.notes && (
              <Descriptions.Item label="Notes" span={2}>
                {order.notes}
              </Descriptions.Item>
            )}
            {order.status === "CANCELLED" && order.cancelReason && (
              <Descriptions.Item label="Cancellation Reason" span={2}>
                <div style={{
                  padding: '8px 12px',
                  backgroundColor: '#fff2f0',
                  border: '1px solid #ffccc7',
                  borderRadius: '6px',
                  color: '#a8071a'
                }}>
                  {order.cancelReason}
                </div>
              </Descriptions.Item>
            )}
          </Descriptions>
        </Card>
      ),
    },
    {
      key: "assignments",
      label: `Assignments (${order.assignments.length})`,
      children: (
        <Table
          columns={assignmentColumns}
          dataSource={order.assignments}
          rowKey="id"
          pagination={false}
        />
      ),
    },
    {
      key: "chat",
      label: `Chat (${order.chats.length})`,
      children: (
        <Card>
          <Timeline
            items={order.chats.map((chat: ChatDto) => ({
              dot: (
                <Avatar src={chat.sender.profileImage} size="small">
                  {chat.sender.username[0].toUpperCase()}
                </Avatar>
              ),
              children: (
                <div>
                  <div style={{ fontWeight: 500 }}>
                    {chat.sender.username}
                    <span
                      style={{ fontWeight: 400, color: "#666", marginLeft: 8 }}
                    >
                      {new Date(chat.sentAt).toLocaleString()}
                    </span>
                  </div>
                  <div style={{ marginTop: 4 }}>{chat.message}</div>
                </div>
              ),
            }))}
          />
        </Card>
      ),
    },
  ];

  return (
    <div>
      <div
        style={{
          marginBottom: 24,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Space>
          <Link href="/admin/orders">
            <Button icon={<ArrowLeftOutlined />}>Back to Orders</Button>
          </Link>
          <h1>Order #{order.orderNumber.slice(-8)}</h1>
        </Space>
        <Space>
          {order.status !== "COMPLETED" ? (
            <Button
              disabled={completingOrder}
              icon={<Check />}
              onClick={() => {
                // mark order as completed
                handleUpdateOrder({ status: "COMPLETED" });

                // form.setFieldsValue(order);
                // setEditModalVisible(true);
              }}
            >
              Mark Order As Verified
            </Button>
          ) : (
            <Button disabled={true}>Marked As Verified</Button>
          )}
        </Space>
      </div>

      <Tabs items={tabItems} />

      {/* Edit Order Modal */}
      <Modal
        title="Edit Order"
        open={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleUpdateOrder}>
          <Form.Item name="status" label="Status">
            <Select>
              {Object.values(OrderStatus).map((status) => (
                <Option key={status} value={status}>
                  {status}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="rerollsLeft" label="Rerolls Left">
            <Input type="number" min={0} />
          </Form.Item>
          <Form.Item name="requiredCount" label="Required Providers">
            <Input type="number" min={1} />
          </Form.Item>
          <Form.Item name="notes" label="Notes">
            <TextArea rows={4} />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                Update Order
              </Button>
              <Button onClick={() => setEditModalVisible(false)}>Cancel</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Edit Assignment Modal */}
      <Modal
        title="Edit Assignment"
        open={assignmentModalVisible}
        onCancel={() => {
          setAssignmentModalVisible(false);
          setSelectedAssignment(null);
        }}
        footer={null}
      >
        <Form
          form={assignmentForm}
          layout="vertical"
          onFinish={handleUpdateAssignment}
        >
          <Form.Item name="status" label="Status">
            <Select>
              {Object.values(OrderAssignmentStatus).map((status) => (
                <Option key={status} value={status}>
                  {status.replace("_", " ")}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="approved" label="Approved" valuePropName="checked">
            <Select>
              <Option value={true}>Yes</Option>
              <Option value={false}>No</Option>
            </Select>
          </Form.Item>
          <Form.Item name="completed" label="Completed" valuePropName="checked">
            <Select>
              <Option value={true}>Yes</Option>
              <Option value={false}>No</Option>
            </Select>
          </Form.Item>
          <Form.Item name="progress" label="Progress (%)">
            <Input type="number" min={0} max={100} />
          </Form.Item>
          <Form.Item name="proofUrl" label="Proof URL">
            <Input />
          </Form.Item>
          <Form.Item name="reviewRating" label="Rating">
            <Input type="number" min={1} max={5} />
          </Form.Item>
          <Form.Item name="reviewText" label="Review">
            <TextArea rows={3} />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                Update Assignment
              </Button>
              <Button
                onClick={() => {
                  setAssignmentModalVisible(false);
                  setSelectedAssignment(null);
                }}
              >
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
