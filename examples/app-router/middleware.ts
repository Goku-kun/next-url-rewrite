import { rewrite, createMiddleware } from "@gokukun/next-url-rewrite-next";

// Using fluent builder API
const profileCertificates = rewrite()
  .match("/:username/certificates")
  .stripSegment("certificates")
  .name("profile-certificates")
  .description("Strip /certificates from username profile URLs")
  .build();

export default createMiddleware(profileCertificates, { debug: true });

export const config = {
  matcher: ["/:username+/certificates"],
};
