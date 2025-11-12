import { useRouter } from "next/router";

export default function UserProfile() {
  const router = useRouter();
  const { username } = router.query;

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
        <a href="/">← Back to home</a>
      </p>
    </div>
  );
}
