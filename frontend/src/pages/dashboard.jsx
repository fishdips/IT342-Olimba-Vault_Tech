import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../css/dashboard.css";

function Gear({ teeth = 8, r = 38, stroke = "#ffffff", strokeWidth = 2 }) {
  const ri = r * 0.72;
  const toothH = r * 0.22;
  let d = "";
  for (let i = 0; i < teeth; i++) {
    const a1 = (i / teeth) * Math.PI * 2 + 0.12;
    const a2 = (i / teeth) * Math.PI * 2 + Math.PI / teeth - 0.12;
    const a3 = (i / teeth) * Math.PI * 2 + Math.PI / teeth + 0.12;
    const a4 = ((i + 1) / teeth) * Math.PI * 2 - 0.12;
    const c = Math.cos, s = Math.sin;
    if (!i) d += `M ${ri * c(a1)} ${ri * s(a1)} `;
    d += `L ${(r + toothH) * c(a1)} ${(r + toothH) * s(a1)} `;
    d += `L ${(r + toothH) * c(a2)} ${(r + toothH) * s(a2)} `;
    d += `L ${ri * c(a3)} ${ri * s(a3)} `;
    d += `L ${ri * c(a4)} ${ri * s(a4)} `;
  }
  d += "Z";
  const cx = r + toothH + 4;
  return (
    <svg viewBox={`${-cx} ${-cx} ${cx * 2} ${cx * 2}`} xmlns="http://www.w3.org/2000/svg">
      <path d={d} stroke={stroke} strokeWidth={strokeWidth} fill="none" strokeLinejoin="round" />
      <circle cx="0" cy="0" r={ri * 0.35} stroke={stroke} strokeWidth={strokeWidth} fill="none" />
    </svg>
  );
}


function VaultCard({ vault, onDelete, onEdit }) {
  
  // Calculate the percentage dynamically based on the vault's total lifespan
  let pct = 0;
  if (vault.daysRemaining != null && vault.createdDate && vault.expiryDate) {
    const created = new Date(vault.createdDate).getTime();
    const expiry = new Date(vault.expiryDate).getTime();
    
    // Convert the difference in milliseconds to total days
    const totalDaysSpan = Math.round((expiry - created) / (1000 * 60 * 60 * 24));
    
    // Prevent division by zero if someone creates a vault that expires on the exact same day
    if (totalDaysSpan > 0) {
      pct = Math.max(0, Math.min((vault.daysRemaining / totalDaysSpan) * 100, 100));
    }
  }

  const urgencyClass =
    vault.daysRemaining <= 7  ? "bar-urgent"
    : vault.daysRemaining <= 30 ? "bar-warning"
    : "bar-ok";

  return (
    <div className="vault-card" style={{ "--accent": vault.thumbnailColor || "#0066b1" }}>
      <div className="vault-card-header">
        <span className="vault-type-badge">{vault.vaultType || "Vault"}</span>
        <div className="vault-card-actions">
          <button 
            className="vault-edit-btn" 
            title="Edit vault & upload files" 
            onClick={() => onEdit(vault)}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', marginRight: '8px', fontSize: '14px'}}
          >
            ✎ Edit
          </button>
          <button
            className="vault-delete-btn"
            title="Delete vault"
            onClick={() => onDelete(vault.id)}
          >
            x
          </button>
        </div>
      </div>

      <div className="vault-card-body">
        <h3 className="vault-name">{vault.name}</h3>
        <div className="vault-icon-box">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
            stroke="var(--accent)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            <circle cx="12" cy="16" r="1" fill="var(--accent)"/>
          </svg>
        </div>
      </div>

      <div className="vault-card-footer">
        <span className="vault-date">
          {vault.createdDate
            ? new Date(vault.createdDate).toLocaleDateString("en-US", {
                month: "short", day: "numeric", year: "numeric"
              })
            : "—"}
        </span>
        <div className="vault-progress-row">
          <div className="vault-progress-track">
            <div
              className={`vault-progress-fill ${urgencyClass}`}
              style={{ width: `${pct}%` }}
            />
          </div>
          <span className="vault-days">
            {vault.daysRemaining != null ? `${vault.daysRemaining} Days` : "—"}
          </span>
        </div>
      </div>
    </div>
  );
}

/* ── Create Vault Modal ── */
function CreateVaultModal({ username, onClose, onCreated }) {
  const [name, setName] = useState("");
  const [vaultType, setVaultType] = useState("General");
  const [expiryDate, setExpiryDate] = useState("");
  const [color, setColor] = useState("#0066b1");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const colors = ["#0066b1", "#8b5c29", "#1a6b4a", "#7b3fa0", "#b84a2e"];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) { setError("Vault name is required."); return; }
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8080/api/vaults", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name, vaultType, expiryDate: expiryDate || null,
          ownerUsername: username, thumbnailColor: color,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data || "Failed to create vault."); }
      else { onCreated(data); onClose(); }
    } catch {
      setError("Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>New Vault</h2>
          <button className="modal-close" onClick={onClose}>x</button>
        </div>
        
        {/* NEW: Added Subtitle Here */}
        <p className="modal-subtitle">Set up a new secure vault with custom release triggers</p>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="field-group">
            <label>Vault Name</label>
            <input
              type="text" required
              value={name} onChange={(e) => setName(e.target.value)}
              placeholder="e.g. My Will"
            />
          </div>
          <div className="field-group">
            <label>Type</label>
            <select value={vaultType} onChange={(e) => setVaultType(e.target.value)}>
              {["General","Will","Documents","Photos","Letters","Financial"].map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div className="field-group">
            <label>Expiry Date <span className="optional">(optional)</span></label>
            <input
              type="date" value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
            />
          </div>
          <div className="field-group">
            <label>Accent Color</label>
            <div className="color-row">
              {colors.map(c => (
                <button
                  key={c} type="button"
                  className={`color-dot ${color === c ? "selected" : ""}`}
                  style={{ background: c }}
                  onClick={() => setColor(c)}
                />
              ))}
            </div>
          </div>
          {error && <p className="modal-error">{error}</p>}
          <button type="submit" className="modal-btn" disabled={loading}>
            {loading ? "Creating…" : "Create Vault"}
          </button>
        </form>
      </div>
    </div>
  );
}

function TrustedContactsModal({ username, onClose }) {
  const [email, setEmail] = useState("");
  const [contacts, setContacts] = useState([]);
  const [message, setMessage] = useState("");

  const handleAdd = (e) => {
    e.preventDefault();
    if (!email.trim() || contacts.includes(email)) return;
    setContacts([...contacts, email]);
    setEmail("");
  };

  const handleSave = async () => {
    try {
      await fetch(`http://localhost:8080/api/users/${username}/trusted-contacts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contacts }),
      });
      setMessage("Contacts saved successfully.");
      setTimeout(onClose, 1200);
    } catch {
      setMessage("Server error. Please try again.");
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Trusted Contacts</h2>
          <button className="modal-close" onClick={onClose}>x</button>
        </div>
        <form onSubmit={handleAdd} className="modal-form">
          <div className="field-group">
            <label>Add by Email</label>
            <div className="input-row">
              <input
                type="email" value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="contact@example.com"
              />
              <button type="submit" className="add-btn">Add</button>
            </div>
          </div>
          {contacts.length > 0 && (
            <ul className="contact-list">
              {contacts.map((c) => (
                <li key={c}>
                  <span>{c}</span>
                  <button
                    type="button"
                    className="remove-btn"
                    onClick={() => setContacts(contacts.filter(x => x !== c))}
                  >x</button>
                </li>
              ))}
            </ul>
          )}
          {message && <p className="modal-success">{message}</p>}
          {contacts.length > 0 && (
            <button type="button" className="modal-btn" onClick={handleSave}>
              Save Contacts
            </button>
          )}
        </form>
      </div>
    </div>
  );
}

/* â”€â”€ Dashboard (main page) â”€â”€ */
function Dashboard() {
  const navigate = useNavigate();
  const username = localStorage.getItem("username") || "guest";

  const [vaults, setVaults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showContactsModal, setShowContactsModal] = useState(false);

  useEffect(() => {
    fetchVaults();
  }, []);

  const fetchVaults = async () => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:8080/api/vaults?username=${username}`);
      const data = await res.json();
      setVaults(Array.isArray(data) ? data : []);
    } catch {
      setVaults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("username");
    navigate("/");
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this vault? This cannot be undone.")) return;
    try {
      await fetch(`http://localhost:8080/api/vaults/${id}?username=${username}`, {
        method: "DELETE",
      });
      setVaults((prev) => prev.filter((v) => v.id !== id));
    } catch {
      alert("Failed to delete vault.");
    }
  };

  const handleCreated = (newVault) => {
    setVaults((prev) => [...prev, newVault]);
  };

  return (
    <div className="dashboard-page">

      {/* Gear layer */}
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

      {/* Navbar */}
      <nav className="dash-nav">
        <div className="nav-brand">
          <div className="nav-logo-box" />
          <span className="nav-title">Vault-Tech</span>
        </div>
        <div className="nav-actions">
          <button className="nav-btn" onClick={() => navigate("/profile")}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
            Profile
          </button>
          <button className="nav-btn nav-btn-logout" onClick={handleLogout}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Logout
          </button>
        </div>
      </nav>

      {/* Main content */}
      <main className="dash-main">

        {/* Action buttons */}
        <div className="dash-actions">
          <button className="action-btn" onClick={() => setShowCreateModal(true)}>
            <span className="action-plus">+</span> Create New Vault
          </button>
          <button className="action-btn action-btn-secondary"
            onClick={() => setShowContactsModal(true)}>
            <span className="action-plus">+</span> Add Trusted Contacts
          </button>
        </div>

        {/* Active Vaults */}
        <section className="vaults-section">
          <h2 className="section-title">Active Vaults</h2>

          {loading ? (
            <div className="empty-state">Loading your vaultsâ€¦</div>
          ) : vaults.length === 0 ? (
            <div className="empty-state">
              No vaults yet.{" "}
              <span
                className="empty-cta"
                onClick={() => setShowCreateModal(true)}
              >
                Create your first vault
              </span>
            </div>
          ) : (
            <div className="vault-grid">
              {vaults.map((v) => (
                <VaultCard key={v.id} vault={v} onDelete={handleDelete} />
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Modals */}
      {showCreateModal && (
        <CreateVaultModal
          username={username}
          onClose={() => setShowCreateModal(false)}
          onCreated={handleCreated}
        />
      )}
      {showContactsModal && (
        <TrustedContactsModal
          username={username}
          onClose={() => setShowContactsModal(false)}
        />
      )}
    </div>
  );
}

export default Dashboard;
