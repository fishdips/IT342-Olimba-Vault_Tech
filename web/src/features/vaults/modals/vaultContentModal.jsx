import { useState, useEffect } from "react";
import { Document, Page } from "react-pdf";
import { authFetch } from "../../../auth";

function VaultContentModal({ vault, onClose }) {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const res = await authFetch(`/api/documents/vault/${vault.id}`);
        if (res.ok) {
          const data = await res.json();
          setDocuments(data);
        }
      } catch (err) {
        console.error("Failed to fetch documents", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDocuments();
  }, [vault.id]);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '800px', width: '90%' }}>
        <div className="modal-header">
          <h2>{vault.name} - Contents</h2>
          <button className="modal-close" onClick={onClose}>x</button>
        </div>

        {loading ? (
          <p style={{ color: 'var(--text-secondary)' }}>Decrypting contents...</p>
        ) : documents.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '40px 0' }}>This vault is empty.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '20px', marginTop: '20px' }}>
            {documents.map((doc) => (
              <a
                key={doc.id}
                href={doc.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'var(--bg-input)', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', transition: 'transform 0.2s', cursor: 'pointer' }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                <div style={{ width: '120px', height: '160px', overflow: 'hidden', background: '#fff', borderRadius: '4px', display: 'flex', justifyContent: 'center', border: '1px solid #ccc' }}>
                  <Document file={doc.fileUrl} loading={<span style={{ color: '#333', fontSize: '10px', marginTop: '70px' }}>Loading PDF...</span>}>
                    <Page pageNumber={1} width={120} renderTextLayer={false} renderAnnotationLayer={false} />
                  </Document>
                </div>
                <span style={{ marginTop: '12px', fontSize: '12px', color: 'var(--brown-light)', textAlign: 'center', wordBreak: 'break-all', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {doc.fileName}
                </span>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default VaultContentModal;