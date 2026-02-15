import { useState } from "react";
import { apiFetch } from "../api";

export default function EditRecord({ record, onClose, onSaved }) {
  const [type, setType] = useState(record.type);
  const [remarks, setRemarks] = useState(record.remarks);
  const [error, setError] = useState("");

  async function save() {
    try {
      await apiFetch(`/record/edit/${record.record_id}`, {
        method: "PUT",
        body: JSON.stringify({ type, remarks })
      });
      onSaved();
      onClose();
    } catch {
      setError("Failed to update record");
    }
  }

  return (
    <div style={{ border: "1px solid #999", padding: 15, marginTop: 10 }}>
      <h4>Edit Record #{record.record_id}</h4>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <select value={type} onChange={e => setType(e.target.value)}>
        <option value="Maintenance">Maintenance</option>
        <option value="Repair">Repair</option>
      </select>

      <br /><br />

      <textarea
        value={remarks}
        onChange={e => setRemarks(e.target.value)}
      />

      <br /><br />

      <button onClick={save}>Save</button>
      <button onClick={onClose} style={{ marginLeft: 10 }}>
        Cancel
      </button>
    </div>
  );
}
