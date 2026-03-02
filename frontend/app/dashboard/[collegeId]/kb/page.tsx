"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";

type KBFile = {
  id: string;
  file_name: string;
  file_type: string;
  file_extension: string;
  file_size_kb: number;
  tags?: string;
  description?: string;
  uploaded_at: string;
  is_processed: boolean;
};

type User = {
  role_id: number;
};

export default function KnowledgeBasePage() {
  const params = useParams();
  const collegeId = params.collegeId as string;

  const token =
    typeof window !== "undefined" ? localStorage.getItem("vb_token") : "";

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [files, setFiles] = useState<KBFile[]>([]);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [isUploader, setIsUploader] = useState(false);
  const [loading, setLoading] = useState(false);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [tags, setTags] = useState("");
  const [description, setDescription] = useState("");

  // Expand description state
  const [expandedDesc, setExpandedDesc] = useState<Record<string, boolean>>({});

  // Expand tags state
  const [expandedTags, setExpandedTags] = useState<Record<string, boolean>>({});

  // Edit Modal State
  const [editFile, setEditFile] = useState<KBFile | null>(null);
  const [editName, setEditName] = useState("");
  const [editTags, setEditTags] = useState("");
  const [editDescription, setEditDescription] = useState("");

  const fetchFiles = async () => {
    const res = await fetch(`http://localhost:8000/api/v1/kb/${collegeId}`);
    const data = await res.json();
    setFiles(Array.isArray(data) ? data : []);
  };

  const fetchMe = async () => {
    const res = await fetch("http://localhost:8000/api/v1/users/me", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const me: User = await res.json();
    setIsUploader(me.role_id === 4 || me.role_id === 5);
  };

  useEffect(() => {
    fetchFiles();
    fetchMe();
  }, []);

  /* ================= DESCRIPTION TOGGLE ================= */

  const toggleDescription = (id: string) => {
    setExpandedDesc((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const toggleTags = (id: string) => {
    setExpandedTags((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleReprocess = async (id: string) => {
    await fetch(`http://localhost:8000/api/v1/kb/${id}/reprocess`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });

    fetchFiles();
  };

  /* ================= UPLOAD ================= */

  const handleUpload = async () => {
    if (!selectedFile) {
      alert("Please select a file again");
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("college_id", collegeId);

    if (tags) formData.append("tags", tags);
    if (description) formData.append("description", description);

    try {
      const res = await fetch(`http://localhost:8000/api/v1/kb/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      setLoading(false);

      if (!res.ok) {
        alert(await res.text());
        return;
      }

      setSelectedFile(null);
      setTags("");
      setDescription("");
      if (fileInputRef.current) fileInputRef.current.value = "";

      fetchFiles();
    } catch (err) {
      console.error("Upload failed:", err);
      alert("Upload failed — backend error");
      setLoading(false);
    }
  };

  /* ================= DELETE ================= */

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this file?")) return;

    await fetch(`http://localhost:8000/api/v1/kb/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    fetchFiles();
  };

  /* ================= EDIT ================= */

  const openEditModal = (file: KBFile) => {
    setEditFile(file);
    setEditName(file.file_name);
    setEditTags(file.tags || "");
    setEditDescription(file.description || "");
  };

  const saveEdit = async () => {
    if (!editFile) return;

    await fetch(
      `http://localhost:8000/api/v1/kb/${editFile.id}?new_name=${editName}&tags=${editTags}&description=${editDescription}`,
      {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    setEditFile(null);
    fetchFiles();
  };

  /* ================= FILTER ================= */

  const filtered = files.filter((f) => {
    const matchSearch = f.file_name
      .toLowerCase()
      .includes(search.toLowerCase());

    let matchType = true;

    if (typeFilter === "JPG") {
      matchType = ["JPG", "JPEG"].includes(f.file_type);
    } else if (typeFilter !== "ALL") {
      matchType = f.file_type === typeFilter;
    }

    return matchSearch && matchType;
  });

  /* ================= UI ================= */

  return (
    <div className="container py-4">

      <h2 className="display-5 fw-bold">Knowledge Base</h2>

      <p className="text-muted"> Automatically organize, search, and deliver information to users instantly.</p>

      <div className="d-flex gap-2 mb-3">
        <input
          className="form-control"
          placeholder="Search Files..."
          onChange={(e) => setSearch(e.target.value)}
        />

        <select className="form-select" onChange={(e) => setTypeFilter(e.target.value)}>
          <option value="ALL">All Types</option>
          <option value="PDF">PDF</option>
          <option value="DOCX">Word</option>
          <option value="XLSX">Excel</option>
          <option value="TXT">Text</option>
          <option value="PPTX">PPT</option>
          <option value="PNG">PNG</option>
          <option value="JPG">JPG / JPEG</option>
        </select>
      </div>

      {/* UPLOAD */}
      {isUploader && (
        <div className="card p-4 mb-4 shadow-sm text-center">
          <input
            ref={fileInputRef}
            type="file"
            className="form-control mb-2"
            onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
          />

          <input
            className="form-control mb-2"
            placeholder="Tags (optional)"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
          />

          <textarea
            className="form-control mb-3"
            placeholder="Description / Notes (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />

          <button className="btn btn-success" disabled={loading} onClick={handleUpload}>
            {loading ? "Uploading..." : "Import"}
          </button>
        </div>
      )}

      {/* TABLE */}
      <div className="card shadow-sm">
        <table className="table table-hover mb-0">
          <thead className="table-light">
            <tr>
              <th>Name</th>
              <th>Date</th>
              <th>Type</th>
              <th>Size</th>
              <th>Tags</th>
              <th>Description</th>
              <th>Status</th>
              <th className="text-end">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((f) => (
              <tr key={f.id}>
                <td>{f.file_name}</td>
                <td>{new Date(f.uploaded_at).toLocaleString()}</td>
                <td><span className="badge bg-secondary">{f.file_type}</span></td>
                <td>{f.file_size_kb} KB</td>
                <td className="text-muted small" style={{ maxWidth: "220px" }}>
                  {f.tags ? (
                    <>
                      <div style={{ whiteSpace: "pre-wrap" }}>
                        {expandedTags[f.id]
                          ? f.tags
                          : f.tags.length > 60
                          ? f.tags.slice(0, 60) + "..."
                          : f.tags}
                      </div>

                      {f.tags.length > 60 && (
                        <button
                          onClick={() => toggleTags(f.id)}
                          className="btn btn-link p-0 mt-1 small"
                        >
                          {expandedTags[f.id] ? "Less" : "More..."}
                        </button>
                      )}
                    </>
                  ) : (
                    "—"
                  )}
                </td>

                {/* EXPANDABLE DESCRIPTION */}
                <td className="text-muted small" style={{ maxWidth: "320px" }}>
                  {f.description ? (
                    <>
                      <div style={{ whiteSpace: "pre-wrap" }}>
                        {expandedDesc[f.id]
                          ? f.description
                          : f.description.length > 120
                          ? f.description.slice(0, 120) + "..."
                          : f.description}
                      </div>

                      {f.description.length > 120 && (
                        <button
                          onClick={() => toggleDescription(f.id)}
                          className="btn btn-link p-0 mt-1 small"
                        >
                          {expandedDesc[f.id] ? "Less" : "More..."}
                        </button>
                      )}
                    </>
                  ) : (
                    "—"
                  )}
                </td>

                <td>
                  {f.is_processed ? (
                    <span className="badge bg-success">Processed</span>
                  ) : (
                    <span className="badge bg-danger">Processing Failed</span>
                  )}
                </td>

                <td className="text-end d-flex justify-content-end gap-2">
                  <a
                    href={`http://localhost:8000/api/v1/kb/download/${f.id}`}
                    target="_blank"
                    className="btn btn-sm btn-outline-primary"
                  >
                    👁 Open
                  </a>

                  {isUploader && (
                    <button
                      className="btn btn-sm btn-outline-warning"
                      onClick={() => openEditModal(f)}
                    >
                      ✏ Edit
                    </button>
                  )}

                  {isUploader && !f.is_processed && (
                    <button
                      className="btn btn-sm btn-outline-secondary"
                      onClick={() => handleReprocess(f.id)}
                    >
                      🔁 Reprocess
                    </button>
                  )}

                  {isUploader && (
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => handleDelete(f.id)}
                    >
                      🗑 Delete
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* EDIT MODAL */}
      {editFile && (
        <div className="modal show fade d-block bg-dark bg-opacity-50">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content p-3">
              <h5>Edit File</h5>

              <input
                className="form-control my-2"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />

              <input
                className="form-control my-2"
                value={editTags}
                onChange={(e) => setEditTags(e.target.value)}
                placeholder="Tags"
              />

              <textarea
                className="form-control my-2"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="Description"
                rows={3}
              />

              <div className="text-end mt-3">
                <button
                  className="btn btn-secondary me-2"
                  onClick={() => setEditFile(null)}
                >
                  Cancel
                </button>

                <button className="btn btn-success" onClick={saveEdit}>
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
