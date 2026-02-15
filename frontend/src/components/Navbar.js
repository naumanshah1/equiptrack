export default function Navbar({ onLogout }) {
  const role = localStorage.getItem("role");

  return (
    <div
      style={{
        height: 60,
        background: "#1e293b",
        color: "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 20px"
      }}
    >
      <h3>EquipTrack</h3>

      <div>
        <span style={{ marginRight: 15 }}>
          Role: <b>{role}</b>
        </span>
        <button onClick={onLogout}>Logout</button>
      </div>
    </div>
  );
}
