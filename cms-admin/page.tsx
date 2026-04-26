import type { Metadata } from 'next';
import LoginForm from '@/components/auth/LoginForm';
import styles from './login.module.css';

export const metadata: Metadata = {
  title: 'Iniciar sesión',
};

export default function LoginPage() {
  return (
    <main className={styles.main}>

      {/* ── Panel izquierdo: Brand ─────────────────────────── */}
      <aside className={styles.brandPanel} aria-hidden="true">
        <div className={styles.brandContent}>

          {/* Logo */}
          <div className={styles.logo}>
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none" aria-hidden="true">
              <rect width="36" height="36" rx="10" fill="#4f46e5"/>
              <rect x="9" y="10" width="12" height="3" rx="1.5" fill="white"/>
              <rect x="9" y="16.5" width="18" height="3" rx="1.5" fill="white"/>
              <rect x="9" y="23" width="7" height="3" rx="1.5" fill="white"/>
            </svg>
            <span className={styles.logoName}>
              {process.env.NEXT_PUBLIC_APP_NAME ?? 'CMS Admin'}
            </span>
          </div>

          {/* Tagline */}
          <div className={styles.tagline}>
            <h1 className={styles.taglineTitle}>
              Tu agencia,<br />tu control.
            </h1>
            <p className={styles.taglineSubtitle}>
              Gestioná el contenido de tus clientes desde un único panel,
              seguro, rápido y diseñado para escalar.
            </p>
          </div>

          {/* Feature bullets */}
          <ul className={styles.features}>
            {[
              { icon: '⚡', text: 'Actualizaciones en tiempo real' },
              { icon: '🔒', text: 'Acceso seguro por cliente' },
              { icon: '📦', text: 'Módulos extensibles a medida' },
            ].map(({ icon, text }) => (
              <li key={text} className={styles.featureItem}>
                <span className={styles.featureIcon}>{icon}</span>
                <span>{text}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Decoración de fondo: dot grid */}
        <div className={styles.decoration} aria-hidden="true" />
      </aside>

      {/* ── Panel derecho: Formulario ──────────────────────── */}
      <section className={styles.formPanel}>
        <div className={styles.formWrapper}>
          <header className={styles.formHeader}>
            <h2 className={styles.formTitle}>Bienvenido</h2>
            <p className={styles.formSubtitle}>
              Ingresá tus credenciales para acceder al panel
            </p>
          </header>

          <LoginForm />

          <footer className={styles.formFooter}>
            <p>
              ¿Problemas para acceder?{' '}
              <a href="mailto:soporte@tuagencia.com" className={styles.footerLink}>
                Contactar soporte
              </a>
            </p>
          </footer>
        </div>
      </section>

    </main>
  );
}
