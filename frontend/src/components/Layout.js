import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

export default function Layout({ children, onLogout }) {
  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <Sidebar />
      <div style={{ flex: 1 }}>
        <Navbar onLogout={onLogout} />
        <div style={{ padding: 20 }}>{children}</div>
      </div>
    </div>
  );
}
