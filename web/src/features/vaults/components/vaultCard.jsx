function VaultCard({ vault, onDelete, onEdit, onUnlockRequest }) {
  let pct = 0;
  if (vault.daysRemaining != null && vault.createdDate && vault.expiryDate) {
    const created = new Date(vault.createdDate).getTime();
    const expiry = new Date(vault.expiryDate).getTime();
    const totalDaysSpan = Math.round((expiry - created) / (1000 * 60 * 60 * 24));
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
            title="Edit vault settings"
            onClick={(e) => { e.stopPropagation(); onEdit(vault); }}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', marginRight: '8px', fontSize: '14px' }}
          >
            ✎ Edit
          </button>
          <button
            className="vault-delete-btn"
            title="Delete vault"
            onClick={(e) => { e.stopPropagation(); onDelete(vault.id); }}
          >
            x
          </button>
        </div>
      </div>

      <div
        className="vault-card-body"
        onClick={() => onUnlockRequest(vault)}
        style={{ cursor: 'pointer' }}
        title="Click to unlock and view contents"
      >
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
            <div className={`vault-progress-fill ${urgencyClass}`} style={{ width: `${pct}%` }} />
          </div>
          <span className="vault-days">
            {vault.daysRemaining != null ? `${vault.daysRemaining} Days` : "—"}
          </span>
        </div>
      </div>
    </div>
  );
}

export default VaultCard;