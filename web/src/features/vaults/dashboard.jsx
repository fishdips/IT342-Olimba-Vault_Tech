import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { authFetch, getUsername, logout } from "../../auth";
import { pdfjs } from "react-pdf";
import "./dashboard.css";
import vaultLogo from "../../assets/vault-logo.png";

import Gear from "./components/gear";
import VaultCard from "./components/vaultCard";
import UnlockVaultModal from "./modals/unlockVaultModal";
import CreateVaultModal from "./modals/createVaultModal";
import EditVaultModal from "./modals/editVaultModal";
import TrustedContactsModal from "./modals/trustedContactsModal";
import VaultContentModal from "./modals/vaultContentModal";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

function Dashboard() {
  const navigate = useNavigate();
  const username = getUsername();

  const [vaults, setVaults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showContactsModal, setShowContactsModal] = useState(false);
  const [editingVault, setEditingVault] = useState(null);
  const [unlockingVault, setUnlockingVault] = useState(null);
  const [viewingVault, setViewingVault] = useState(null);

  const fetchVaults = useCallback(async () => {
    setLoading(true);
    try {
      const res = await authFetch(`/api/vaults?username=${username}`);
      if (res.status === 401 || res.status === 403) {
        logout();
        navigate("/");
        return;
      }
      const data = await res.json();
      setVaults(Array.isArray(data) ? data : []);
    } catch {
      setVaults([]);
    } finally {
      setLoading(false);
    }
  }, [username, navigate]);

  useEffect(() => {
    if (!username) {
      navigate("/");
      return;
    }
    fetchVaults();
  }, [username, navigate, fetchVaults]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this vault? This cannot be undone.")) return;
    try {
      const res = await authFetch(`/api/vaults/${id}?username=${username}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setVaults((prev) => prev.filter((v) => v.id !== id));
      } else {
        alert("Failed to delete vault.");
      }
    } catch {
      alert("Failed to delete vault.");
    }
  };

  const handleCreated = (newVault) => {
    setVaults((prev) => [...prev, newVault]);
  };

  const handleUpdated = (updatedVault) => {
    setVaults((prev) => prev.map(v => v.id === updatedVault.id ? updatedVault : v));
  };

  const handleVaultUnlocked = (vault) => {
    setUnlockingVault(null);
    setViewingVault(vault);
  };

  if (!username) return null;

  return (
    <div className="dashboard-page">
      <div className="gear-layer">
        <Gear teeth={12} r={56} strokeWidth={2.5} />
        <Gear teeth={7}  r={26} strokeWidth={2}   />
        <Gear teeth={16} r={72} strokeWidth={2.5} />
        <Gear teeth={9}  r={36} strokeWidth={2}   />
        <Gear teeth={14} r={62} strokeWidth={2.5} />
        <Gear teeth={6}  r={24} strokeWidth={2}   />
        <Gear teeth={10} r={48} strokeWidth={2.5} />
        <Gear teeth={5}  r={20} strokeWidth={2}   />
        <Gear teeth={8}  r={40} strokeWidth={2}   />
        <Gear teeth={6}  r={18} strokeWidth={1.8} />
      </div>

      <nav className="dash-nav">
        <div className="nav-brand">
          <div className="nav-logo-box">
            <img src={vaultLogo} alt="Vault-Tech Logo" className="vault-logo-image" />
          </div>
          <span className="nav-title">Vault-Tech</span>
        </div>
        <div className="nav-actions">
          <button className="nav-btn" onClick={() => navigate("/profile")}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
            Profile
          </button>
          <button className="nav-btn nav-btn-logout" onClick={handleLogout}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Logout
          </button>
        </div>
      </nav>

      <main className="dash-main">
        <div className="dash-actions">
          <button className="action-btn" onClick={() => setShowCreateModal(true)}>
            <span className="action-plus">+</span> Create New Vault
          </button>
          <button className="action-btn action-btn-secondary" onClick={() => setShowContactsModal(true)}>
            <span className="action-plus">+</span> Add Trusted Contacts
          </button>
        </div>

        <section className="vaults-section">
          <h2 className="section-title">Active Vaults</h2>

          {loading ? (
            <div className="empty-state">Loading your vaults…</div>
          ) : vaults.length === 0 ? (
            <div className="empty-state">
              No vaults yet.{" "}
              <span className="empty-cta" onClick={() => setShowCreateModal(true)}>
                Create your first vault
              </span>
            </div>
          ) : (
            <div className="vault-grid">
              {vaults.map((v) => (
                <VaultCard
                  key={v.id}
                  vault={v}
                  onDelete={handleDelete}
                  onEdit={setEditingVault}
                  onUnlockRequest={setUnlockingVault}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      {showCreateModal && (
        <CreateVaultModal username={username} onClose={() => setShowCreateModal(false)} onCreated={handleCreated} />
      )}
      {editingVault && (
        <EditVaultModal username={username} vault={editingVault} onClose={() => setEditingVault(null)} onUpdated={handleUpdated} />
      )}
      {unlockingVault && (
        <UnlockVaultModal username={username} vault={unlockingVault} onClose={() => setUnlockingVault(null)} onUnlocked={handleVaultUnlocked} />
      )}
      {viewingVault && (
        <VaultContentModal vault={viewingVault} onClose={() => setViewingVault(null)} />
      )}
      {showContactsModal && (
        <TrustedContactsModal username={username} onClose={() => setShowContactsModal(false)} />
      )}
    </div>
  );
}

export default Dashboard;