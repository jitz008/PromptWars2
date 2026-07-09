# SECURITY POLICY - BALLIT

This document outlines the security architecture and defensive-in-depth measures implemented for **BALLIT** (the Stadium Living Organism dashboard for the FIFA World Cup 2026 operations challenge).

## 1. Credentials & API Key Handling
* **Server-Only Execution:** The Gemini API key (`GEMINI_API_KEY`) is stored strictly in server-side environment variables and is never exposed to the client bundle or compiled into client assets.
* **Leak Mitigation:** All communication with the Google GenAI SDK is handled through a thin backend proxy on the custom Express server. The browser client never downloads `@google/genai` or references the secret directly.
* **Diagnostic Guards:** The `GEMINI_API_KEY` is not logged or written to standard error streams. If missing, it fails fast with a clean out-of-band error.

## 2. Input Sanitization & Injection Defenses
* **Strict Character Whitelisting:** User typed inputs and voice transcripts are scrutinized using a strict allow-list regex (`src/lib/sanitize.ts`). Unapproved characters (e.g., characters commonly used for command injection or script tag breakout) are stripped.
* **Malicious Keyword Detection:** Inputs are scanned against a blacklist of prompt-injection keywords (such as "ignore previous instructions", "developer mode", etc.). If flagged, the input is immediately replaced with a harmless, safe placeholder request before interpolation.
* **Length Bounds:** Inputs are strictly truncated to a maximum of 300 characters to prevent high-token buffer-overflow attacks.

## 3. Rate-Limiting Engine
* **Token-Bucket Throttling:** Requests to the server-side Gemini proxy are rate-limited via an in-memory token-bucket controller (`src/lib/rateLimiter.ts`). 
* **Abuse Protection:** Unauthenticated clients are throttled at a burst capacity of 8 tokens refilling at 1 token every 3 seconds to protect operations and prevent cost blowout.

## 4. Defensively Left Out of Scope (Assumptions)
* **Authentication:** Since this is a hackathon proof-of-concept, full user authentication (e.g., JWT, OAuth 2.0) is omitted. Under production conditions, a secure authentication middleware (such as Firebase Auth or Auth0) would sit ahead of the proxy.
* **HTTPS/TLS:** Deployed container TLS is assumed to be handled at the ingress/reverse-proxy layer.
