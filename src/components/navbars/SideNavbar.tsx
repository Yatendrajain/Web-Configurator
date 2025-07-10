import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import { Toolbar } from "@mui/material";
import styles from "@/components/navbars/navbars.module.scss";
import NavItem from "@/components/navbars/NavItem";
import Icon from "@/components/IconConfig";

const navItems = [
  {
    label: "Product Orders",
    href: "/productOrder",
    icon: <Icon name="note" size={20} />,
  },
  {
    label: "CF/CO Mapping",
    href: "/cfco",
    icon: <Icon name="workflowSquare" size={20} />,
  },
  {
    label: "History",
    href: "/history",
    icon: <Icon name="history" size={20} />,
  },
  // {
  //   label: "Role Mapping",
  //   href: "/role-mapping",
  //   icon: <Icon name="userSettings" size={20} />,
  //   disabled: false,
  // },
  {
    label: "Help",
    href: "/docs/coming_soon.pdf",
    icon: <Icon name="auditLogs" size={20} />,
    disabled: false,
  },
];

export default function SideNavbar() {
  return (
    <Drawer variant="permanent" className={styles.drawer}>
      <Toolbar />
      <List disablePadding className={styles.navList}>
        {navItems.map((item) => (
          <NavItem key={item.label} {...item} />
        ))}
      </List>
    </Drawer>
  );
}
