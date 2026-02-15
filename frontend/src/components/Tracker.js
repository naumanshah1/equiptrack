import React, { useState } from "react";
import AddRecord from "./AddRecord";

export default function Tracker({ mode }) {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const [records, setRecords] = useState([
    { id: 1, machine: "M1", engineer: "Alex", date: "2026-02-10", type: "Repair", remarks: "Bearing issue" },
    { id: 2, machine: "M2", engineer: "David", date: "2026-02-11", type: "Maintenance", remarks: "Oil change" },
    { id: 3, machine: "M1", engineer: "Alex", date: "2026-02-14", type: "Repair", remarks: "Sensor fault" }
  ]);

  const visibleRecords =
    mode === "weekly" && from && to
      ? records.filter(r => r.date >= from && r.date <= to)
      : records;

  return (
    <>
      {/* Header */}
      <div className="header">
        <h1>{mode === "daily" ? "Daily Maintenance Tracker" : "Weekly Maintenance Tracker"}</h1>
        <span className="url">
          URL: <b>/tracker/{mode}</b>
        </span>
      </div>

      {/* Weekly Calendar */}
      {mode === "weekly" && (
        <div className="filters">
          <label>
            From
            <input type="date" onChange={e => setFrom(e.target.value)} />
          </label>

          <label>
            To
            <input type="date" onChange={e => setTo(e.target.value)} />
          </label>
        </div>
      )}

      {/* Add Record */}
      <AddRecord records={records} setRecords={setRecords} />

      {/* Summary */}
      <div className="cards">
        <div className="card">
          <h3>Total Records</h3>
          <p>{visibleRecords.length}</p>
        </div>
        <div className="card">
          <h3>Repairs</h3>
          <p>{visibleRecords.filter(r => r.type === "Repair").length}</p>
        </div>
        <div className="card">
          <h3>Maintenance</h3>
          <p>{visibleRecords.filter(r => r.type === "Maintenance").length}</p>
        </div>
      </div>

      {/* Table */}
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Machine</th>
            <th>Engineer</th>
            <th>Date</th>
            <th>Type</th>
            <th>Remarks</th>
          </tr>
        </thead>
        <tbody>
          {visibleRecords.map(r => (
            <tr key={r.id}>
              <td>{r.id}</td>
              <td>{r.machine}</td>
              <td>{r.engineer}</td>
              <td>{r.date}</td>
              <td>{r.type}</td>
              <td>{r.remarks}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
