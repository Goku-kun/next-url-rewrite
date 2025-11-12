import Link from "next/link";

export default function Home() {
  return (
    <div style={{ padding: "2rem" }}>
      <h1>App Router Example</h1>
      <p>Testing URL rewrites with @next-url-rewrite/next</p>

      <h2>Test Links:</h2>
      <ul>
        <li>
          <Link href="/alice">Alice Profile</Link>
        </li>
        <li>
          <Link href="/alice/certificates">
            Alice Certificates (rewrites to /alice)
          </Link>
        </li>
        <li>
          <Link href="/bob/certificates">
            Bob Certificates (rewrites to /bob)
          </Link>
        </li>
      </ul>
    </div>
  );
}
