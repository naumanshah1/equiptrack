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
  Upload,
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
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [darkMode, setDarkMode] = useState(true);
  const [loading, setLoading] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // ================= FETCH =================
  const fetchRecords = useCallback(async (currentPage = 1) => {
    try {
      setLoading(true);

      let url = `/tracker/${mode}?page=${currentPage}&search=${search}`;

      if ((mode === "weekly" || mode === "monthly") && fromDate && toDate) {
        url += `&from=${fromDate}&to=${toDate}`;
      }

      const data = await apiFetch(url);

      setRecords(data.records || []);
      setTotalPages(data.total_pages || 1);
      setPage(data.current_page || 1);

    } catch {
      toast.error("Failed to load records");
    } finally {
      setLoading(false);
    }
  }, [mode, search, fromDate, toDate]);

  useEffect(() => {
    fetchRecords(1);
  }, [fetchRecords]);

  // 🔥 Auto apply filter when date changes
  useEffect(() => {
    if ((mode === "weekly" || mode === "monthly") && fromDate && toDate) {
      fetchRecords(1);
    }
  }, [fromDate, toDate]);

  // ================= QUICK FILTERS =================
  function last7Days() {
    const today = new Date();
    const past = new Date();
    past.setDate(today.getDate() - 6);
    setFromDate(past.toISOString().slice(0, 10));
    setToDate(today.toISOString().slice(0, 10));
  }

  function last30Days() {
    const today = new Date();
    const past = new Date();
    past.setDate(today.getDate() - 29);
    setFromDate(past.toISOString().slice(0, 10));
    setToDate(today.toISOString().slice(0, 10));
  }

  function thisMonth() {
    const today = new Date();
    const first = new Date(today.getFullYear(), today.getMonth(), 1);
    setFromDate(first.toISOString().slice(0, 10));
    setToDate(today.toISOString().slice(0, 10));
  }

  function clearFilter() {
    setFromDate("");
    setToDate("");
    fetchRecords(1);
  }

  // ================= DELETE =================
  async function confirmDelete() {
    try {
      await apiFetch(`/tracker/delete/${deleteId}`, {
        method: "DELETE"
      });

      toast.success("Record deleted");
      setDeleteId(null);
      fetchRecords(page);

    } catch {
      toast.error("Delete failed");
    }
  }

  // ================= EXPORT =================
  async function exportTimeline() {

    if (!fromDate || !toDate) {
      toast.error("Select From and To dates");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/tracker/export?from=${fromDate}&to=${toDate}&search=${search}`,
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

  async function exportExcel() {
    try {
      const response = await fetch(
        `http://localhost:5000/tracker/export?search=${search}`,
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

  async function exportPDF() {
    try {
      const response = await fetch(
        "http://localhost:5000/tracker/export/pdf",
        { credentials: "include" }
      );

      const blob = await response.blob();
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = "equiptrack_report.pdf";
      link.click();

      toast.success("PDF downloaded");

    } catch {
      toast.error("PDF export failed");
    }
  }

  async function importExcel(event) {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    await fetch("http://localhost:5000/tracker/import", {
      method: "POST",
      credentials: "include",
      body: formData
    });

    toast.success("Import successful");
    fetchRecords(page);
  }

  async function handleLogout() {
    await apiFetch("/logout", { method: "GET" });
    localStorage.removeItem("role");
    onLogout();
  }

  return (
    <div className={darkMode ? "layout dark" : "layout light"}>

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
            <BarChart3 size={18} />
            Analytics
          </button>
        )}

        <button className="logout" onClick={handleLogout}>
          <LogOut size={18} />
          Logout
        </button>
      </aside>

      <motion.main className="content" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>

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

                <button onClick={last7Days}>7D</button>
                <button onClick={last30Days}>30D</button>
                <button onClick={thisMonth}>Month</button>
                <button className="clear-btn" onClick={clearFilter}>Clear</button>

                <button className="timeline-btn" onClick={exportTimeline}>
                  <Calendar size={16} />
                </button>

              </div>
            )}

            <button className="export-btn" onClick={exportExcel}>
              <Download size={16} /> Excel
            </button>

            <button className="export-btn" onClick={exportPDF}>
              <Download size={16} /> PDF
            </button>

            <label className="export-btn">
              <Upload size={16} /> Import
              <input type="file" hidden onChange={importExcel} />
            </label>

            <button className="theme-toggle" onClick={() => setDarkMode(!darkMode)}>
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            <div className="role-badge">{role}</div>

          </div>
        </div>

        <div className="search-box">
          <Search size={16} />
          <input
            placeholder="Search machine..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

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
                <tr><td colSpan="7">Loading...</td></tr>
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
                        <button className="icon-btn delete" onClick={() => setDeleteId(r.id)}>
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
