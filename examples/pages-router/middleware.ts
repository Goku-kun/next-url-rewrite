import { createMiddleware } from "@gokukun/next-url-rewrite-next";
import rewrites from "./rewrites.config.js";

export default createMiddleware(rewrites, { debug: true });

export const config = {
  matcher: ["/:username+/certificates"],
};
