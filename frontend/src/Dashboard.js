import React, { useState, useEffect, useCallback } from "react";
import { apiFetch } from "./api";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  BarChart3,
  LogOut,
  Trash2,
  Search,
  Moon,
  Sun,
  Download,
  Calendar
} from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import "./dashboard.css";

export default function Dashboard({ onLogout }) {

  const navigate = useNavigate();
  const role = localStorage.getItem("role");

  const [mode, setMode] = useState("daily");
  const [records, setRecords] = useState([]);
  const [search, setSearch] = useState("");
  const [darkMode, setDarkMode] = useState(true);
  const [loading, setLoading] = useState(false);

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // ================= FETCH RECORDS =================
  const fetchRecords = useCallback(async () => {
    try {
      setLoading(true);

      let url = `/tracker/${mode}?search=${search}`;

      if ((mode === "weekly" || mode === "monthly") && fromDate && toDate) {
        url += `&from=${fromDate}&to=${toDate}`;
      }

      const data = await apiFetch(url);
      setRecords(data.records || data || []);

    } catch {
      toast.error("Failed to load records");
    } finally {
      setLoading(false);
    }
  }, [mode, search, fromDate, toDate]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  // ================= DELETE =================
  async function deleteRecord(id) {
    try {
      await apiFetch(`/tracker/delete/${id}`, {
        method: "DELETE"
      });

      toast.success("Record deleted");
      fetchRecords();

    } catch {
      toast.error("Delete failed");
    }
  }

  // ================= EXPORT =================
  async function exportExcel() {
    try {
      const response = await fetch(
        `/tracker/export?search=${search}`,
        { credentials: "include" }
      );

      const blob = await response.blob();
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = "equiptrack_export.xlsx";
      link.click();

      toast.success("Excel downloaded");

    } catch {
      toast.error("Export failed");
    }
  }

  async function exportTimeline() {
    if (!fromDate || !toDate) {
      toast.error("Select From and To dates");
      return;
    }

    try {
      const response = await fetch(
        `/tracker/export?from=${fromDate}&to=${toDate}&search=${search}`,
        { credentials: "include" }
      );

      const blob = await response.blob();
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = "equiptrack_timeline_export.xlsx";
      link.click();

      toast.success("Timeline export downloaded");

    } catch {
      toast.error("Timeline export failed");
    }
  }

  async function handleLogout() {
    try {
      await apiFetch("/logout", { method: "GET" });
    } catch {}

    localStorage.removeItem("role");
    onLogout();
  }

  return (
    <div className={darkMode ? "layout dark" : "layout light"}>

      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="logo">
          <LayoutDashboard size={20} />
          EquipTrack
        </div>

        <button className="menu" onClick={() => setMode("daily")}>Daily</button>
        <button className="menu" onClick={() => setMode("weekly")}>Weekly</button>
        <button className="menu" onClick={() => setMode("monthly")}>Monthly</button>

        {role === "admin" && (
          <button className="menu" onClick={() => navigate("/analytics")}>
            <BarChart3 size={18} /> Analytics
          </button>
        )}

        <button className="logout" onClick={handleLogout}>
          <LogOut size={18} /> Logout
        </button>
      </aside>

      {/* MAIN */}
      <motion.main className="content"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >

        <div className="topbar">
          <h2>{mode.toUpperCase()} TRACKER</h2>

          <div className="topbar-right">

            {(mode === "weekly" || mode === "monthly") && (
              <div className="filter-bar">
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                />
                <span>to</span>
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                />
                <button onClick={exportTimeline}>
                  <Calendar size={16} />
                </button>
              </div>
            )}

            <button className="export-btn" onClick={exportExcel}>
              <Download size={16} /> Excel
            </button>

            <button
              className="theme-toggle"
              onClick={() => setDarkMode(!darkMode)}
            >
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            <div className="role-badge">{role}</div>

          </div>
        </div>

        {/* SEARCH */}
        <div className="search-box">
          <Search size={16} />
          <input
            placeholder="Search machine..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* TABLE */}
        <div className="table-card glass">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Machine</th>
                <th>Engineer</th>
                <th>Date</th>
                <th>Type</th>
                <th>Remarks</th>
                {role === "admin" && <th>Actions</th>}
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7">Loading...</td>
                </tr>
              ) : (
                records.map((r) => (
                  <tr key={r.id}>
                    <td>{r.id}</td>
                    <td>{r.machine}</td>
                    <td>{r.engineer}</td>
                    <td>{r.date}</td>
                    <td>{r.type}</td>
                    <td>{r.remarks}</td>

                    {role === "admin" && (
                      <td>
                        <button
                          className="icon-btn delete"
                          onClick={() => deleteRecord(r.id)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </motion.main>
    </div>
  );
}
