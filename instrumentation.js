export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { default: dbConnect } = await import('./lib/mongodb');
    dbConnect().catch((err) => {
      console.warn('MongoDB warm-up deferred:', err.message);
    });
  }
}
