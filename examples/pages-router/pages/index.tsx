export default function Home() {
  return (
    <div style={{ padding: "2rem" }}>
      <h1>Pages Router Example</h1>
      <p>Testing URL rewrites with @gokukun/next-url-rewrite-next</p>

      <h2>Test Links:</h2>
      <ul>
        <li>
          <a href="/alice">Alice Profile</a>
        </li>
        <li>
          <a href="/alice/certificates">
            Alice Certificates (rewrites to /alice)
          </a>
        </li>
        <li>
          <a href="/bob/certificates">Bob Certificates (rewrites to /bob)</a>
        </li>
      </ul>
    </div>
  );
}
