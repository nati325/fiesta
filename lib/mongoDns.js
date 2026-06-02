import dns from 'dns';

/** Fix querySrv ECONNREFUSED when local/corporate DNS blocks MongoDB SRV records. */
export function configureMongoDns(uri) {
  if (typeof window !== 'undefined') return;
  const connectionUri = uri || '';
  if (!connectionUri.startsWith('mongodb+srv://')) return;
  if (process.env.MONGODB_USE_PUBLIC_DNS === 'false') return;

  try {
    dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
  } catch {
    // ignore
  }
}
