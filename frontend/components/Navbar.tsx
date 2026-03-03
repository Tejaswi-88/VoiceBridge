import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark border-bottom px-4">

      <Link href="/" className="navbar-brand fw-bold">
          <span className="brand-voice">Voice</span>
          <span className="brand-bridge">Bridge</span>
      </Link>
    

      <button
        className="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navMenu"
      >
        <span className="navbar-toggler-icon"></span>
      </button>

      <div className="collapse navbar-collapse" id="navMenu">
        <ul className="navbar-nav mx-auto mb-2 mb-lg-0">
          <li className="nav-item"><a href="#home" className="nav-link text-light">Home</a></li>
          <li className="nav-item"><a href="#about" className="nav-link text-light">About</a></li>
          <li className="nav-item"><a href="#how-it-works" className="nav-link text-light">How it Works</a></li>
          <li className="nav-item"><a href="#resources" className="nav-link text-light">Resources</a></li>
          <li className="nav-item"><a className="nav-link text-light">Contact</a></li>
        </ul>

        <div className="d-flex gap-2">
          <Link href="/login" className="btn btn-primary-custom btn-sm">
            Login
          </Link>
          {/*<Link href="/signup" className="btn btn-primary-custom btn-sm">
            Sign up
          </Link>*/}
        </div>
      </div>
    </nav>
  );
}
