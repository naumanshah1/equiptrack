import React, { useState } from "react";

export default function AddRecord({ records, setRecords }) {
  const [machine, setMachine] = useState("");
  const [engineer, setEngineer] = useState("");
  const [type, setType] = useState("Repair");
  const [remarks, setRemarks] = useState("");

  function add() {
    if (!machine || !engineer) return;

    setRecords([
      ...records,
      {
        id: records.length + 1,
        machine,
        engineer,
        date: new Date().toISOString().slice(0, 10),
        type,
        remarks
      }
    ]);

    setMachine("");
    setEngineer("");
    setRemarks("");
  }

  return (
    <div className="add-box">
      <input placeholder="Machine ID" value={machine} onChange={e => setMachine(e.target.value)} />
      <input placeholder="Engineer" value={engineer} onChange={e => setEngineer(e.target.value)} />
      <select value={type} onChange={e => setType(e.target.value)}>
        <option>Repair</option>
        <option>Maintenance</option>
      </select>
      <input placeholder="Remarks" value={remarks} onChange={e => setRemarks(e.target.value)} />
      <button onClick={add}>Add Record</button>
    </div>
  );
}
