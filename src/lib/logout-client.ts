// Logout centralizado del lado cliente.
// Llama a /api/auth/logout, limpia el storage local y notifica
// a todas las pestañas abiertas para que también cierren sesión.

export async function cerrarSesionCliente(): Promise<void> {
  // Notificar a otras pestañas ANTES de navegar (el canal se cerraría al unmount)
  if (typeof BroadcastChannel !== 'undefined') {
    const ch = new BroadcastChannel('fwd_session_channel');
    ch.postMessage({ type: 'SESSION_ENDED' });
    ch.close();
  }

  await fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});

  localStorage.removeItem('fwd_perfil');
  localStorage.removeItem('fwd_dashboard');
  sessionStorage.removeItem('fwd_active');
}
