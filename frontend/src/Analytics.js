import React, { useEffect, useState } from "react";
import { apiFetch } from "./api";
import {
  BarChart, Bar,
  LineChart, Line,
  XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from "recharts";
import "./dashboard.css";

export default function Analytics() {

  const [data, setData] = useState(null);

  useEffect(() => {
    async function fetchData() {
      const res = await apiFetch("/analytics/summary");
      setData(res);
    }
    fetchData();
  }, []);

  if (!data) return <div style={{ padding: 40 }}>Loading Analytics...</div>;

  return (
    <div className="analytics-container">

      <h2>📊 EquipTrack Analytics Dashboard</h2>

      {/* KPI CARDS */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <h3>Total Records</h3>
          <p>{data.total}</p>
        </div>

        <div className="kpi-card">
          <h3>Repairs</h3>
          <p>{data.repairs}</p>
        </div>

        <div className="kpi-card">
          <h3>Maintenance</h3>
          <p>{data.maintenance}</p>
        </div>
      </div>

      {/* BAR CHART */}
      <div className="chart-box">
        <h3>Repair vs Maintenance</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={[
              { name: "Repair", value: data.repairs },
              { name: "Maintenance", value: data.maintenance }
            ]}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* DAILY TREND */}
      <div className="chart-box">
        <h3>Daily Trend</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data.daily}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="count" stroke="#22c55e" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* ENGINEER PERFORMANCE */}
      <div className="chart-box">
        <h3>Engineer Performance</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data.engineers}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="engineer" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#f59e0b" />
          </BarChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
}
