import Link from "next/link";

export default async function UserProfile({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const resolvedParams = await params;
  const { username } = resolvedParams;
  return (
    <div style={{ padding: "2rem" }}>
      <h1>Profile: {username}</h1>
      <p>This page handles both:</p>
      <ul>
        <li>/{username}</li>
        <li>
          /{username}/certificates (rewritten to /{username})
        </li>
      </ul>

      <p>
        <Link href="/">← Back to home</Link>
      </p>
    </div>
  );
}
