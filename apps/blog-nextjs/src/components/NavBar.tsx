import Link from "next/link";
import "./NavBar.css";

export function NavBar() {
  return (
    <nav>
      {/* logo */}
      <div>
        <span>
          <Link href="/">SuperBlog</Link>
        </span>
      </div>

      {/* links */}
      <div></div>

      {/* profile */}
      <div>
        <span>profile</span>
      </div>
    </nav>
  );
}
