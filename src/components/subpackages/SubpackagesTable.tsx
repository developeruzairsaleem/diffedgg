"use client";

import { useEffect, useState } from "react";
import {
  Table,
  Tag,
  Button,
  Space,
  Avatar,
  Tooltip,
  Input,
  Select,
  Card,
  Row,
  Col,
  Modal,
  Form,
  InputNumber,
  Switch,
  message,
  Divider,
  Radio,
} from "antd";
import {
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  FilterOutlined,
  PlusOutlined,
  CalculatorOutlined,
} from "@ant-design/icons";
import { LuGamepad2 } from "react-icons/lu";
import type { ColumnsType } from "antd/es/table";
import { useSubpackages } from "@/hooks/useSubpackages";
import type { SubpackageCreateRequest } from "@/types/game.dto";
import Link from "next/link";

const { Search } = Input;
const { Option } = Select;
const { TextArea } = Input;

export default function SubpackagesTable() {
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [currentGameId, setCurrentGameId] = useState("");
  const [currentService, setCurrentService] = useState("");
  const [createLoading, setCreateLoading] = useState(false);
  const { data, loading, error, refetch, params, setParams } = useSubpackages({
    page: 1,
    limit: 10,
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  const [searchText, setSearchText] = useState("");
  useEffect(() => {
    const id = setTimeout(() => {
      setParams((p) => ({ ...p, page: 1, search: searchText || undefined }));
    }, 400);
    return () => clearTimeout(id);
  }, [searchText, setParams]);

  const handleCreateSubpackage = async (values: any) => {
    console.log('SHABIR VALUES: ', values);
    try {
      setCreateLoading(true);
    console.log('SHABIR VALUES: ', values);
    
      // Extract form-specific fields for internal use and exclude them from API payload
      const { providerType, enableRanks, ranks, ...apiValues } = values;

      // Process the form values
      const processedValues: any = {
        ...apiValues,
        // Set type based on provider configuration
        type: providerType === "static" ? "pergame" : "perteammate",
      };

      // Only include ranks if they exist and are not empty
      if (enableRanks && ranks && ranks.length > 0) {
        processedValues.ranks = ranks;
      }

      // For dynamic type (perteammate), remove requiredProviders as it's not needed
      if (processedValues.type === "perteammate") {
        delete processedValues.requiredProviders;
      }

      const response = await fetch("/api/admin/subpackages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(processedValues),
      });

      const result = await response.json();

      if (result.success) {
        message.success("Subpackage created successfully");
        setCreateModalVisible(false);
        form.resetFields();
        refetch();
        setCreateLoading(false);
      } else {
        setCreateLoading(false);
        form.resetFields();
        message.error(result.error || "Failed to create subpackage");
      }
    } catch (err) {
      message.error("Network error occurred");
      setCreateLoading(false);
      form.resetFields();
    }
  };

  const handleDeleteSubpackage = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/subpackages/${id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (result.success) {
        message.success("Subpackage deleted successfully");
        refetch();
      } else {
        message.error(result.error || "Failed to delete subpackage");
      }
    } catch (err) {
      message.error("Network error occurred");
    }
  };

  const columns: ColumnsType<any> = [
    {
      title: "Package",
      key: "package",
      dataIndex: "name",
      width: 300,
      sorter: true,
      render: (_, record: any) => (
        <Space>
          <Avatar
            src={record.service.game.image}
            size="default"
            shape="square"
            icon={<LuGamepad2 />}
          >
            {record.service.game.name[0].toUpperCase()}
          </Avatar>
          <div>
            <div style={{ fontWeight: 500 }}>{record.name}</div>
            <div style={{ fontSize: "12px", color: "#666" }}>
              {record.description.length > 50
                ? `${record.description.slice(0, 50)}...`
                : record.description}
            </div>
          </div>
        </Space>
      ),
    },
    {
      title: "Service",
      key: "service",
      width: 150,
      render: (_, record: any) => (
        <div>
          <Link href={`/admin/services/${record.serviceId}`}>
            <Button type="link" size="small">
              {record.service.name}
            </Button>
          </Link>
          <div style={{ fontSize: "12px", color: "#666" }}>
            {record.service.game.name}
          </div>
        </div>
      ),
    },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
      width: 100,
      sorter: true,
      render: (price: number) => (
        <span style={{ fontWeight: 500, color: "#52c41a" }}>
          ${price.toFixed(2)}
        </span>
      ),
    },
    {
      title: "Pricing",
      dataIndex: "dynamicPricing",
      key: "dynamicPricing",
      width: 100,
      render: (dynamic: boolean, record: any) => (
        <div>
          <Tag color={dynamic ? "blue" : "default"}>
            {dynamic ? "Dynamic" : "Fixed"}
          </Tag>
          {dynamic && record.basePricePerELO && (
            <div style={{ fontSize: "11px", color: "#666" }}>
              +${record.basePricePerELO}/ELO
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Duration",
      dataIndex: "duration",
      key: "duration",
      width: 100,
      render: (duration: string | undefined) => duration || "-",
    },
    {
      title: "Orders",
      dataIndex: "ordersCount",
      key: "ordersCount",
      width: 80,
      render: (count: number) => (
        <span
          style={{
            fontWeight: count > 0 ? 500 : 400,
            color: count > 0 ? "#722ed1" : "#999",
          }}
        >
          {count}
        </span>
      ),
    },
    {
      title: "Revenue",
      dataIndex: "totalRevenue",
      key: "totalRevenue",
      width: 100,
      render: (amount: number) => (
        <span
          style={{ fontWeight: 500, color: amount > 0 ? "#52c41a" : "#999" }}
        >
          ${amount.toFixed(2)}
        </span>
      ),
    },

    {
      title: "Created",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 100,
      sorter: true,
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: "Actions",
      key: "actions",
      width: 150,
      render: (_, record: any) => (
        <Space size="small">
          <Tooltip title="View Details">
            <Link href={`/admin/subpackages/${record.id}`}>
              <Button type="text" icon={<EyeOutlined />} size="small" />
            </Link>
          </Tooltip>

          <Tooltip title="Delete">
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              size="small"
              onClick={() => {
                Modal.confirm({
                  title: "Delete Subpackage",
                  content: `Are you sure you want to delete "${record.name}"?`,
                  onOk: () => handleDeleteSubpackage(record.id),
                });
              }}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card>
        <div
          style={{
            marginBottom: 16,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Space wrap>
            <Search
              placeholder="Search subpackages..."
              allowClear
              style={{ width: 300 }}
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
            <Select
              placeholder="Filter by pricing"
              allowClear
              style={{ width: 150 }}
              value={params.dynamicPricing as any}
              onChange={(value) =>
                setParams((p) => ({
                  ...p,
                  page: 1,
                  dynamicPricing: (value as boolean | undefined) ?? undefined,
                }))
              }
            >
              <Option value={true}>Dynamic Pricing</Option>
              <Option value={false}>Fixed Pricing</Option>
            </Select>
          </Space>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setCreateModalVisible(true)}
          >
            Add Subpackage
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={data?.subpackages || []}
          rowKey="id"
          loading={loading}
          pagination={{
            current: data?.page ?? params.page,
            pageSize: params.limit,
            total: data?.total ?? 0,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} subpackages`,
          }}
          onChange={(pagination, _filters, sorter) => {
            const s = Array.isArray(sorter) ? sorter[0] : sorter;
            const sortField = (s?.field as string | undefined) ?? undefined;
            const sortOrder = s?.order as "ascend" | "descend" | undefined;
            setParams((p) => ({
              ...p,
              page: pagination.current ?? 1,
              limit: pagination.pageSize ?? p.limit,
              sortBy:
                sortField === "price"
                  ? "price"
                  : sortField === "name"
                  ? "name"
                  : sortField === "createdAt"
                  ? "createdAt"
                  : p.sortBy,
              sortOrder:
                sortOrder === "ascend"
                  ? "asc"
                  : sortOrder === "descend"
                  ? "desc"
                  : p.sortOrder,
            }));
          }}
          scroll={{ x: 1400 }}
        />
      </Card>

      {/* Create Subpackage Modal */}
      <Modal
        title="Create New Subpackage"
        open={createModalVisible}
        onCancel={() => setCreateModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={(data)=>handleCreateSubpackage(data)}
          onFinishFailed={(errorInfo) => {
            console.log('Form validation failed:', errorInfo);
          }}
        >
          <Form.Item
            name="name"
            label="Package Name"
            rules={[{ required: true, message: "Package name is required" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: "Description is required" }]}
          >
            <TextArea rows={3} />
          </Form.Item>
          <Form.Item
            label="Game"
            rules={[{ required: true, message: "Game is required" }]}
          >
            <Select onChange={setCurrentGameId} placeholder="Select a Game">
              {data?.allGames.map((game) => (
                <Option value={game.id} key={game.id}>
                  {game.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="serviceId"
            label="Service"
            rules={[{ required: true, message: "Service is required" }]}
          >
            <Select onChange={setCurrentService} placeholder="Select a Service">
              {data?.allGames
                ?.filter((g) => g.id === currentGameId)[0]
                ?.services.map((service) => (
                  <Option value={service.id} key={service.id}>
                    {service.name}
                  </Option>
                ))}
            </Select>
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="price"
                label="Base Price"
                rules={[{ required: true, message: "Price is required" }]}
              >
                <InputNumber
                  min={0}
                  step={0.01}
                  style={{ width: "100%" }}
                  prefix="$"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="duration" label="Duration">
                <Input placeholder="e.g., 2-3 days" />
              </Form.Item>
            </Col>
          </Row>
          
          <Form.Item
            name="providerType"
            label="Provider Configuration"
            rules={[
              {
                required: true,
                message: "Provider configuration is required",
              },
            ]}
            initialValue="static"
          >
            <Radio.Group>
              <Radio value="static">Static</Radio>
              <Radio value="dynamic">Dynamic</Radio>
            </Radio.Group>
          </Form.Item>

          <Form.Item dependencies={["providerType"]} noStyle>
            {({ getFieldValue }) =>
              getFieldValue("providerType") === "static" ? (
                <Form.Item
                  name="requiredProviders"
                  label="Required Providers"
                  rules={[
                    {
                      required: true,
                      message: "No of Providers is required",
                    },
                  ]}
                >
                  <InputNumber min={1} style={{ width: "100%" }} />
                </Form.Item>
              ) : (
                <div style={{
                  padding: "12px 16px",
                  backgroundColor: "#f6f8fa",
                  border: "1px solid #d1d9e0",
                  borderRadius: "6px",
                  marginBottom: "16px"
                }}>
                  <p style={{ margin: 0, color: "#656d76" }}>
                    This allows the customer to choose more than 1 teammates for a subpackage
                  </p>
                </div>
              )
            }
          </Form.Item>

          <Form.Item
            name="enableRanks"
            label="Enable Ranks"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Form.Item dependencies={["enableRanks"]} noStyle>
            {({ getFieldValue }) =>
              getFieldValue("enableRanks") && (
                <>
                  <Divider orientation="left">Ranks</Divider>
                  <Form.List name="ranks">
                    {(fields, { add, remove }) => (
                      <>
                        {fields.map(({ key, name, ...restField }) => (
                          <Row key={key} gutter={16} align="middle">
                            <Col span={10}>
                              <Form.Item
                                {...restField}
                                name={[name, "name"]}
                                label={key === 0 ? "Rank Name" : ""}
                                rules={[{ required: true, message: "Rank name is required" }]}
                              >
                                <Input placeholder="e.g., Silver, Gold, Platinum" />
                              </Form.Item>
                            </Col>
                            <Col span={10}>
                              <Form.Item
                                {...restField}
                                name={[name, "additionalCost"]}
                                label={key === 0 ? "Additional Cost ($)" : ""}
                                rules={[{ required: true, message: "Additional cost is required" }]}
                              >
                                <InputNumber
                                  min={0}
                                  step={0.01}
                                  style={{ width: "100%" }}
                                  placeholder="0.00"
                                />
                              </Form.Item>
                            </Col>
                            <Col span={4}>
                              {key === 0 ? (
                                <div style={{ height: "32px" }} />
                              ) : null}
                              <Button
                                type="text"
                                danger
                                onClick={() => remove(name)}
                                style={{ marginTop: key === 0 ? "24px" : "0" }}
                              >
                                Remove
                              </Button>
                            </Col>
                          </Row>
                        ))}
                        <Form.Item>
                          <Button
                            type="dashed"
                            onClick={() => add()}
                            style={{ width: "100%" }}
                            icon={<PlusOutlined />}
                          >
                            Add Rank
                          </Button>
                        </Form.Item>
                      </>
                    )}
                  </Form.List>
                </>
              )
            }
          </Form.Item>
          <Form.Item
            name="dynamicPricing"
            label="Enable Dynamic Pricing"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
          <Form.Item dependencies={["dynamicPricing"]} noStyle>
            {({ getFieldValue }) =>
              getFieldValue("dynamicPricing") && (
                <>
                  <Row gutter={16}>
                    {/* <Col span={8}>
                      <Form.Item name="basePricePerELO" label="Price per ELO">
                        <InputNumber
                          min={0}
                          step={0.01}
                          style={{ width: "100%" }}
                          prefix="$"
                        />
                      </Form.Item>
                    </Col> */}
                    <Col span={8}>
                      <Form.Item name="minELO" label="Min ELO">
                        <InputNumber min={0} style={{ width: "100%" }} />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item name="maxELO" label="Max ELO">
                        <InputNumber min={0} style={{ width: "100%" }} />
                      </Form.Item>
                    </Col>
                  </Row>
                </>
              )
            }
          </Form.Item>
          <Form.Item>
            <Space>
              <Button disabled={createLoading} type="primary" htmlType="submit">
                {createLoading ? "Creating..." : " Create Subpackage"}
              </Button>
              <Button onClick={() => setCreateModalVisible(false)}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
