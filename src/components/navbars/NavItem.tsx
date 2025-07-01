"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Tooltip,
  Typography,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import styles from "@/components/navbars/navbars.module.scss";
import { NavItemProps } from "@/components/navbars/interfaces";

const NavItem = ({ label, href, icon, disabled }: NavItemProps) => {
  const pathname = usePathname();
  const selected = pathname.startsWith(href);

  const item = (
    <ListItemButton
      component={href.endsWith(".pdf") ? "a" : !disabled ? Link : "div"}
      href={!disabled ? href : undefined}
      target={href.endsWith(".pdf") ? "_blank" : undefined}
      rel={href.endsWith(".pdf") ? "noopener noreferrer" : undefined}
      selected={selected}
      disabled={disabled}
      className={`${styles.navItem} ${disabled ? styles.disabled : ""}`}
    >
      <ListItemIcon
        sx={{ minWidth: "36px", color: disabled ? "#B0B0B0" : "#475466" }}
      >
        {icon}
      </ListItemIcon>
      <ListItemText
        primary={
          <Typography
            sx={{
              color: disabled ? "#B0B0B0" : "#475466",
              fontWeight: 600,
              fontSize: "14px",
            }}
          >
            {label}
          </Typography>
        }
      />
    </ListItemButton>
  );

  return disabled ? (
    <Tooltip title="Coming soon">
      <span>{item}</span>
    </Tooltip>
  ) : (
    item
  );
};

export default NavItem;
