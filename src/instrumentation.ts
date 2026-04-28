export async function register() {
  const { initSentry } = await import('@/lib/sentry')
  initSentry()
}
