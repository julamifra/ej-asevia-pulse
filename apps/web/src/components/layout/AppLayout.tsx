import { AppShell } from "@mantine/core";
import { NavLink, Outlet, type NavLinkRenderProps } from "react-router-dom";

import classes from "./AppLayout.module.css";

const navItems = [
  { label: "Asesorias", to: "/asesorias" },
  { label: "Red", to: "/red" }
];

export function AppLayout() {
  return (
    <AppShell className={classes.shell} header={{ height: 76 }} padding={0}>
      <AppShell.Header className={classes.header}>
        <div className={classes.inner}>
          <div className={classes.brand}>
            <span className={classes.brandEyebrow}>Asevia</span>
            <span className={classes.brandTitle}>Pulse</span>
          </div>

          <nav className={classes.nav} aria-label="Main navigation">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end
                className={({ isActive }: NavLinkRenderProps) =>
                  `${classes.navLink} ${isActive ? classes.navLinkActive : ""}`.trim()
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </AppShell.Header>

      <AppShell.Main className={classes.main}>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
}
