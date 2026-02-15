export default function Sidebar() {
  const role = localStorage.getItem("role");

  return (
    <div
      style={{
        width: 220,
        background: "#0f172a",
        color: "white",
        padding: 20
      }}
    >
      <h4>Menu</h4>

      <p>Dashboard</p>

      {(role === "engineer" || role === "admin") && (
        <p>Add Record</p>
      )}

      {role === "admin" && (
        <>
          <p>Reports</p>
          <p>Manage Records</p>
        </>
      )}
    </div>
  );
}
