"use client";

export default function SecurityPage() {
  return (
    <div className="container py-5">
      <h2 className="fw-bold mb-4">Security Settings</h2>

      {/* Change Password */}
      <div className="card mb-4">
        <div className="card-body">
          <h5 className="fw-bold mb-3">Change Password</h5>

          <div className="mb-3">
            <label className="form-label">Old Password</label>
            <div className="input-group">
              <input
                type="password"
                className="form-control"
                placeholder="Enter old password"
              />
              <span className="input-group-text">
                <i className="bi bi-eye"></i>
              </span>
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label">New Password</label>
            <div className="input-group">
              <input
                type="password"
                className="form-control"
                placeholder="Enter new password"
              />
              <span className="input-group-text">
                <i className="bi bi-eye-slash"></i>
              </span>
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label">Confirm Password</label>
            <div className="input-group">
              <input
                type="password"
                className="form-control"
                placeholder="Confirm new password"
              />
              <span className="input-group-text">
                <i className="bi bi-eye-slash"></i>
              </span>
            </div>
          </div>

          <button className="btn btn-dark">Update Password</button>
        </div>
      </div>

      {/* Two-Factor Authentication */}
      <div className="card mb-4">
        <div className="card-body">
          <h5 className="fw-bold mb-3">Two-Factor Authentication</h5>
          <p className="text-muted">
            Add an extra layer of security to your account.
          </p>
          <button className="btn btn-outline-primary">Enable 2FA</button>
        </div>
      </div>

      {/* Recovery Options */}
      <div className="card mb-4">
        <div className="card-body">
          <h5 className="fw-bold mb-3">Recovery Options</h5>
          <form>
            <div className="mb-3">
              <label className="form-label">Recovery Email</label>
              <input
                type="email"
                className="form-control"
                placeholder="Enter recovery email"
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Recovery Phone</label>
              <input
                type="tel"
                className="form-control"
                placeholder="Enter recovery phone"
              />
            </div>
            <button className="btn btn-dark">Save Recovery Options</button>
          </form>
        </div>
      </div>

      {/* Session Management */}
      <div className="card">
        <div className="card-body">
          <h5 className="fw-bold mb-3">Active Sessions</h5>
          <ul className="list-group">
            <li className="list-group-item d-flex justify-content-between align-items-center">
              Chrome - Windows 11
              <button className="btn btn-sm btn-outline-danger">Logout</button>
            </li>
            <li className="list-group-item d-flex justify-content-between align-items-center">
              Safari - iPhone
              <button className="btn btn-sm btn-outline-danger">Logout</button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
