/**
 * proof-server.ts — fail fast when the proof server on the configured URL is
 * not the version pinned in SDK-VERSION-MATRIX.md.
 *
 * WHY THIS EXISTS: pre-deploy-check.sh caught a different project's
 * proof-server 8.0.3 squatting on :6300 (2026-10-04), but the TS scripts
 * default to :6300 and never looked at the version — running them directly
 * would fail deep inside proving with an opaque error. Same check, at the
 * point of use. Set SKIP_PROOF_SERVER_VERSION_CHECK=1 to bypass.
 */
export const EXPECTED_PROOF_SERVER_VERSION = '7.0.0'; // keep in sync with pre-deploy-check.sh

export async function assertProofServerVersion(url: string): Promise<void> {
  if (process.env.SKIP_PROOF_SERVER_VERSION_CHECK === '1') return;
  let version: string;
  try {
    const res = await fetch(`${url}/version`, { signal: AbortSignal.timeout(3000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    version = (await res.text()).trim();
  } catch (err) {
    console.error(`Proof server not reachable on ${url} (${(err as Error).message}).`);
    console.error(`Start: docker run midnightntwrk/proof-server:${EXPECTED_PROOF_SERVER_VERSION}`);
    process.exit(1);
  }
  if (version !== EXPECTED_PROOF_SERVER_VERSION) {
    console.error(`Proof server on ${url} is version '${version}', expected ${EXPECTED_PROOF_SERVER_VERSION}.`);
    console.error('Likely another project\'s container on the port — check `docker ps --filter publish=6300`,');
    console.error(`or point PROOF_SERVER_URL at a ${EXPECTED_PROOF_SERVER_VERSION} server (e.g. http://127.0.0.1:6301).`);
    process.exit(1);
  }
  console.log(`  Proof server version ${version} OK`);
}
