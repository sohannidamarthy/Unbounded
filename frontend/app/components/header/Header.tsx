import Image from "next/image";
import Link from "next/link";
import styles from "./Header.module.css";

const NAV_LINKS = [
  {
    label: "Home",
    href: "/",
  },
  {
    label: "Arbitrage",
    href: "/arbitrage",
  },
  {
    label: "Value Bets",
    href: "/positive-ev",
  },
  {
    label: "Pricing",
    href: "/billing",
  },
  {
    label: "Tutorials",
    href: "/tutorials",
  },
];

const Header = () => {
  return (
    <header className={styles.siteHeader}>
      <div className={styles.brand}>
        <Link href="/" className={styles.brandHomeLink}>
          <Image
            src="/unbounded.jpeg"
            alt="Unbounded logo"
            width={56}
            height={56}
            priority
          />

          <span className={styles.brandText}>Unbounded</span>
        </Link>
      </div>

      <nav className={styles.navLinks}>
        {NAV_LINKS.map((item) => (
          <Link key={item.href} href={item.href}>
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
};

export default Header;