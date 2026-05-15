import { useState } from "react";
import { authFetch } from "../../../auth";

function UnlockVaultModal({ username, vault, onClose, onUnlocked }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleUnlock = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authFetch(`/api/vaults/${vault.id}/verify`, {
        method: "POST",
        body: JSON.stringify({ username, password }),
      });
      if (res.ok) {
        onUnlocked(vault);
      } else {
        try {
          const errorData = await res.json();
          setError(errorData.message || errorData.error || "Incorrect vault password.");
        } catch {
          const errorText = await res.text();
          setError(errorText || "Incorrect vault password.");
        }
      }
    } catch {
      setError("Server error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Unlock Vault</h2>
          <button className="modal-close" onClick={onClose}>x</button>
        </div>
        <p className="modal-subtitle" style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
          Enter the password for '{vault.name}'
        </p>
        <form onSubmit={handleUnlock} className="modal-form">
          <div className="field-group">
            <label>Vault Password</label>
            <input type="password" required autoFocus
              value={password} onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {error && <p className="modal-error">{error}</p>}
          <button type="submit" className="modal-btn" disabled={loading}>
            {loading ? "Unlocking…" : "Access Vault"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default UnlockVaultModal;