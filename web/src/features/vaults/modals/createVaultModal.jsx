import { useState } from "react";
import { authFetch } from "../../../auth";

function CreateVaultModal({ username, onClose, onCreated }) {
  const [name, setName] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [color, setColor] = useState("#0066b1");
  const [vaultPassword, setVaultPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const colors = ["#0066b1", "#8b5c29", "#1a6b4a", "#7b3fa0", "#b84a2e"];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) { setError("Vault name is required."); return; }
    if (!vaultPassword.trim()) { setError("Vault password is required."); return; }
    setLoading(true);
    try {
      const res = await authFetch("/api/vaults", {
        method: "POST",
        body: JSON.stringify({
          name,
          vaultType: "Secure Vault",
          expiryDate: expiryDate || null,
          ownerUsername: username,
          thumbnailColor: color,
          vaultPassword
        }),
      });

      if (!res.ok) {
        try {
          const errorData = await res.json();
          setError(errorData.message || errorData.error || "Failed to create vault.");
        } catch {
          const errorText = await res.text();
          setError(errorText || "Failed to create vault.");
        }
        setLoading(false);
        return;
      }

      const data = await res.json();
      onCreated(data);
      onClose();
    } catch {
      setError("Server error. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxHeight: '90vh', overflowY: 'auto' }}>
        <div className="modal-header">
          <h2>New Vault</h2>
          <button className="modal-close" onClick={onClose}>x</button>
        </div>
        <p className="modal-subtitle" style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '-10px', marginBottom: '24px' }}>
          Set up a new secure vault with custom release triggers
        </p>
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="field-group">
            <label>Vault Name</label>
            <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. My Will" />
          </div>
          <div className="field-group">
            <label>Vault Password</label>
            <input type="password" required value={vaultPassword} onChange={(e) => setVaultPassword(e.target.value)} placeholder="Secure password" />
          </div>
          <div style={{ display: 'flex', gap: '16px' }}>
            <div className="field-group" style={{ flex: 1 }}>
              <label>Expiry Date</label>
              <input type="date" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} />
            </div>
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

export default CreateVaultModal;