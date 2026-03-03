"use client";

import React from "react";

export default function SystemPreferencesPage() {
  return (
    <div className="container py-5">
      {/* Page Header */}
      <div className="mb-4">
        <h2 className="fw-bold">System Preferences</h2>
        <p className="text-muted">
          Manage your application settings and personalize your experience.
        </p>
      </div>

      {/* Preferences Sections */}
      <div className="row g-4">
        {/* General Settings */}
        <div className="col-md-6">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <h5 className="fw-bold mb-3">
                <i className="bi bi-gear me-2"></i> General
              </h5>
              <div className="form-check mb-2">
                <input className="form-check-input" type="checkbox" id="darkMode" />
                <label className="form-check-label" htmlFor="darkMode">
                  Enable Dark Mode
                </label>
              </div>
              <div className="form-check mb-2">
                <input className="form-check-input" type="checkbox" id="notifications" />
                <label className="form-check-label" htmlFor="notifications">
                  Enable Notifications
                </label>
              </div>
              <div className="mb-2">
                <label className="form-label">Language</label>
                <select className="form-select">
                  <option>English</option>
                  <option>Hindi</option>
                  <option>Telugu</option>
                  <option>Tamil</option>
                  <option>Korean</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Security Settings */}
        <div className="col-md-6">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <h5 className="fw-bold mb-3">
                <i className="bi bi-shield-lock me-2"></i> Security
              </h5>
              <div className="form-check mb-2">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="twoFactor"
                  defaultChecked
                />
                <label className="form-check-label" htmlFor="twoFactor">
                  Enable Two-Factor Authentication
                </label>
              </div>
              <div className="mb-2">
                <label className="form-label">Password Expiry (days)</label>
                <input type="number" className="form-control" defaultValue={90} />
              </div>
              <div className="form-check mb-2">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="autoLock"
                  defaultChecked
                />
                <label className="form-check-label" htmlFor="autoLock">
                  Auto-lock after inactivity
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Privacy Settings */}
        <div className="col-md-6">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <h5 className="fw-bold mb-3">
                <i className="bi bi-eye-slash me-2"></i> Privacy
              </h5>
              <div className="form-check mb-2">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="dataSharing"
                  defaultChecked
                />
                <label className="form-check-label" htmlFor="dataSharing">
                  Allow data sharing for analytics
                </label>
              </div>
              <div className="form-check mb-2">
                <input className="form-check-input" type="checkbox" id="adPersonalization" />
                <label className="form-check-label" htmlFor="adPersonalization">
                  Enable ad personalization
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Accessibility Settings */}
        <div className="col-md-6">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <h5 className="fw-bold mb-3">
                <i className="bi bi-universal-access me-2"></i> Accessibility
              </h5>
              <div className="form-check mb-2">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="highContrast"
                  defaultChecked
                />
                <label className="form-check-label" htmlFor="highContrast">
                  High Contrast Mode
                </label>
              </div>
              <div className="form-check mb-2">
                <input className="form-check-input" type="checkbox" id="textToSpeech" />
                <label className="form-check-label" htmlFor="textToSpeech">
                  Enable Text-to-Speech
                </label>
              </div>
              <div className="mb-2">
                <label className="form-label">Font Size</label>
                <select className="form-select">
                  <option>Small</option>
                  <option>Medium</option>
                  <option>Large</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="mt-4 text-end">
        <button className="btn btn-primary px-4">
          <i className="bi bi-check-circle me-2"></i> Save Preferences
        </button>
      </div>
    </div>
  );
}
