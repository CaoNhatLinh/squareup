import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useAppStore from '@/store/useAppStore';
import * as customersApi from "@/api/customers";
import {
  HiOutlineUser,
  HiOutlineDownload,
  HiOutlineExternalLink,
} from "react-icons/hi";
import PageHeader from "@/components/common/PageHeader";
import SearchBar from "@/components/common/SearchBar";
import { Input, Button, DatePicker, Avatar, Table } from "@/components/ui";
export default function Customers() {
  const restaurantId = useAppStore(s => s.restaurantId);
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [total, setTotal] = useState(0);
  const [debouncedQ, setDebouncedQ] = useState(q);
  const [minOrders, setMinOrders] = useState("");
  const [minSpent, setMinSpent] = useState("");
  const [dateFrom, setDateFrom] = useState(null);
  const [dateTo, setDateTo] = useState(null);
  const [appliedMinOrders, setAppliedMinOrders] = useState("");
  const [appliedMinSpent, setAppliedMinSpent] = useState("");
  const [appliedDateFrom, setAppliedDateFrom] = useState(null);
  const [appliedDateTo, setAppliedDateTo] = useState(null);
  const [sortBy, setSortBy] = useState("last_order_date");
  const [sortDir, setSortDir] = useState("desc");
  useEffect(() => {
    const id = setTimeout(() => setDebouncedQ(q), 500);
    return () => clearTimeout(id);
  }, [q]);

  const totalSpent = customers.reduce((s, c) => s + (c.total_spent || 0), 0);
  const totalOrders = customers.reduce((s, c) => s + (c.order_count || 0), 0);
  const avgOrderValue = totalOrders ? Math.round(totalSpent / totalOrders) : 0;

  const handleRowClick = (r) => {
    if (!r) return;
    navigate(`${encodeURIComponent(r.email)}/orders`);
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await customersApi.fetchCustomers(restaurantId, {
          q: debouncedQ || undefined,
          page,
          limit,
          minOrders: appliedMinOrders || undefined,
          minSpent: appliedMinSpent || undefined,
          dateFrom: appliedDateFrom ? appliedDateFrom.getTime() : undefined,
          dateTo: appliedDateTo ? appliedDateTo.getTime() : undefined,
          sortBy,
          sortDir,
        });

        setCustomers(data.customers || []);
        setTotal((data.meta && data.meta.total) || 0);
      } catch (err) {
        console.error("Error loading customers", err);
        setCustomers([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [
    restaurantId,
    debouncedQ,
    page,
    limit,
    appliedMinOrders,
    appliedMinSpent,
    appliedDateFrom,
    appliedDateTo,
    sortBy,
    sortDir,
  ]);

  return (
    <div className="p-8 pb-24 bg-gray-50 min-h-screen">
      <PageHeader
        title="Customers"
        SearchBarComponent={SearchBar}
        searchBarProps={{
          value: q,
          onChange: (v) => {
            setQ(v);
            setPage(1);
          },
          placeholder: "Search email or name...",
          className: "w-72",
        }}
        rightChildren={
          <div className="flex items-center gap-2">
            <Button
              variant="primary"
              onClick={async () => {
                try {
                  const blob = await customersApi.fetchCustomersCSV(
                    restaurantId,
                    {
                      q: debouncedQ || undefined,
                      dateFrom: appliedDateFrom
                        ? appliedDateFrom.getTime()
                        : undefined,
                      dateTo: appliedDateTo
                        ? appliedDateTo.getTime()
                        : undefined,
                      minOrders: appliedMinOrders || undefined,
                    }
                  );
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `customers_${restaurantId}.csv`;
                  document.body.appendChild(a);
                  a.click();
                  a.remove();
                } catch (err) {
                  console.error("Failed to export CSV", err);
                }
              }}
            >
              <HiOutlineDownload className="w-4 h-4 mr-2" /> Export CSV
            </Button>
          </div>
        }
      />

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex items-center gap-3 flex-wrap">
            <Input
              type="number"
              value={minOrders}
              onChange={(e) => setMinOrders(e.target.value)}
              placeholder="Min orders"
              fullWidth={false}
              containerClassName="w-36"
              className="border rounded px-3 py-2"
            />
            <Input
              type="number"
              value={minSpent}
              onChange={(e) => setMinSpent(e.target.value)}
              placeholder="Min spent"
              fullWidth={false}
              containerClassName="w-36"
              className="border rounded px-3 py-2"
            />
            <div className="flex items-center gap-2">
              <DatePicker
                selected={dateFrom}
                onChange={(d) => {
                  setDateFrom(d);
                }}
                placeholderText="From"
                isClearable
                className="border rounded px-3 py-2 text-sm"
              />
              <DatePicker
                selected={dateTo}
                onChange={(d) => {
                  setDateTo(d);
                }}
                placeholderText="To"
                isClearable
                className="border rounded px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              onClick={() => {
                setDateFrom(null);
                setDateTo(null);
                setMinOrders("");
                setMinSpent("");
                setQ("");
                setDebouncedQ("");
                setAppliedDateFrom(null);
                setAppliedDateTo(null);
                setAppliedMinOrders("");
                setAppliedMinSpent("");
                setPage(1);
              }}
            >
              Reset
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                setAppliedMinOrders(minOrders ? parseInt(minOrders, 10) : "");
                setAppliedMinSpent(minSpent ? parseInt(minSpent, 10) : "");
                setAppliedDateFrom(dateFrom);
                setAppliedDateTo(dateTo);
                setPage(1);
              }}
              className="border rounded px-3 py-2"
            >
              Apply
            </Button>
          </div>
        </div>
      </div>
      <div className="mb-6 bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4">
          <div className="bg-red-50 border border-red-100 p-4 rounded-lg flex items-center justify-between">
            <div>
              <div className="text-sm text-red-600 font-semibold">Customers</div>
              <div className="text-2xl font-extrabold text-gray-900">{total}</div>
            </div>
            <HiOutlineUser className="w-7 h-7 text-red-600" />
          </div>
          <div className="bg-white border border-gray-100 p-4 rounded-lg flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600 font-semibold">
                Total Spent
              </div>
              <div className="text-2xl font-extrabold text-gray-900">
                {totalSpent.toLocaleString(undefined, {
                  style: "currency",
                  currency: (customers[0] && customers[0].currency) || "USD",
                })}
              </div>
            </div>
            <div className="text-sm text-gray-400">
              Avg orders:{" "}
              {(
                customers.reduce((s, c) => s + (c.order_count || 0), 0) /
                (customers.length || 1)
              ).toFixed(1)}
            </div>
          </div>
          <div className="bg-white border border-gray-100 p-4 rounded-lg flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600 font-semibold">
                Avg Order Value
              </div>
              <div className="text-2xl font-extrabold text-gray-900">
                {avgOrderValue.toLocaleString(undefined, {
                  style: "currency",
                  currency: (customers[0] && customers[0].currency) || "USD",
                })}
              </div>
            </div>
            <div className="text-sm text-gray-400">Since 30 days</div>
          </div>
        </div>
      </div>
      <div className="flex gap-2 items-center sm:hidden">
        <div className="flex items-center gap-2">
          <Input
            type="number"
            placeholder="Min orders"
            value={minOrders}
            onChange={(e) => {
              setMinOrders(e.target.value);
            }}
            fullWidth={false}
            containerClassName="w-36"
            className="border rounded px-3 py-2"
          />
          <Input
            type="number"
            placeholder="Min spent"
            value={minSpent}
            onChange={(e) => {
              setMinSpent(e.target.value);
            }}
            fullWidth={false}
            containerClassName="w-36"
            className="border rounded px-3 py-2"
          />
        </div>
        <div className="flex items-center gap-2">
          <DatePicker
            selected={dateFrom}
            onChange={(d) => {
              setDateFrom(d);
              setPage(1);
            }}
            placeholderText="From"
            isClearable
          />
          <DatePicker
            selected={dateTo}
            onChange={(d) => {
              setDateTo(d);
            }}
            placeholderText="To"
            isClearable
          />
        </div>
        <button
          className="bg-black text-white px-4 py-2 rounded-lg"
          onClick={async () => {
            try {
              const blob = await customersApi.fetchCustomersCSV(
                restaurantId,
                {
                  q: debouncedQ || undefined,
                  dateFrom: dateFrom ? dateFrom.getTime() : undefined,
                  dateTo: dateTo ? dateTo.getTime() : undefined,
                  minOrders: minOrders || undefined,
                }
              );
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `customers_${restaurantId}.csv`;
              document.body.appendChild(a);
              a.click();
              a.remove();
            } catch (err) {
              console.error("Failed to export CSV", err);
            }
          }}
        >
          Export CSV
        </button>
        <div className="text-sm text-slate-500">{total} customers</div>
      </div>

      <Table
        columns={[
          {
            key: "avatar",
            title: "",
            render: (r) => <Avatar name={r.name || r.email} size="small" />,
          },
          {
            key: "email",
            title: "Email",
            sortable: true,
            render: (r) => (
              <div>
                <div className="font-semibold text-gray-900">{r.email}</div>
                <div className="text-xs text-gray-500">{r.name || "-"}</div>
              </div>
            ),
          },
          {
            key: "order_count",
            title: "Orders",
            align: "right",
            sortable: true,
            render: (r) => (
              <span className="px-2 py-1 rounded-full bg-gray-100 text-sm font-semibold text-gray-700">
                {r.order_count}
              </span>
            ),
          },
          {
            key: "total_spent",
            title: "Total Spent",
            align: "right",
            sortable: true,
            render: (r) =>
              (r.total_spent || 0).toLocaleString(undefined, {
                style: "currency",
                currency: r.currency || "USD",
              }),
          },
          {
            key: "last_order_date",
            title: "Last Order",
            render: (r) =>
              r.last_order_date
                ? new Date(r.last_order_date).toLocaleString()
                : "-",
            sortable: true,
          },
          {
            key: "actions",
            title: "Actions",
            render: (r) => (
              <Button
                variant="secondary"
                className="inline-flex items-center gap-2 px-2 py-1 bg-white border border-gray-200 rounded text-sm text-gray-700"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`${encodeURIComponent(r.email)}/orders`);
                }}
              >
                <HiOutlineExternalLink className="w-4 h-4" /> View
              </Button>
            ),
          },
        ]}
        data={customers}
        loading={loading}
        rowKey={"email"}
        onRowClick={(r) => handleRowClick(r)}
        pagination={{ page, limit, total }}
        onPageChange={(p) => setPage(p)}
        onLimitChange={(l) => setLimit(l)}
        sortBy={sortBy}
        sortDir={sortDir}
        onSortChange={(key) => {
          if (key === sortBy) {
            setSortDir((d) => (d === "asc" ? "desc" : "asc"));
          } else {
            setSortBy(key);
            setSortDir("asc");
          }
          setPage(1);
        }}
      />
    </div>
  );
}
