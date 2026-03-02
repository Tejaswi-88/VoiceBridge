"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function RegistrationSuccessAlert() {
  const searchParams = useSearchParams();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (searchParams.get("registered") === "true") {
      setShow(true);

      const timer = setTimeout(() => setShow(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  if (!show) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: "20px",
        right: "20px",
        zIndex: 9999,
        minWidth: "300px",
      }}
      className="alert alert-success shadow-lg d-flex align-items-center justify-content-between"
    >
      <span>✅ Registration successful! You can now log in.</span>
      <button
        type="button"
        className="btn-close ms-3"
        onClick={() => setShow(false)}
      />
    </div>
  );
}
