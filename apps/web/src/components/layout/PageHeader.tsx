import { type ReactNode } from "react";

import classes from "./PageHeader.module.css";

type PageHeaderProps = {
  eyebrow?: string;
  title: string;
  description: string;
  actions?: ReactNode;
};

export function PageHeader({ eyebrow, title, description, actions }: PageHeaderProps) {
  return (
    <header className={classes.header}>
      <div className={classes.content}>
        {eyebrow ? <span className={classes.eyebrow}>{eyebrow}</span> : null}
        <h1 className={classes.title}>{title}</h1>
        <p className={classes.description}>{description}</p>
      </div>

      {actions}
    </header>
  );
}
