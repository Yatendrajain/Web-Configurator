import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
// import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
// import { KeyboardArrowDown } from "@mui/icons-material";
import Icon from "@/components/IconConfig";
import styles from "@/components/navbars/navbars.module.scss";
import UserAvatarDropdown from "./UserAvatarDropdown";

export default function TopNavbar() {
  return (
    <div>
      <AppBar position="fixed" className={styles.topNavAppbar} elevation={0}>
        <Toolbar>
          <Box className={styles.topNavFlexBetween}>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Icon name="logo" height={35} width={120} />
            </Box>

            <Box className={styles.topNavFlexCenter}>
              <UserAvatarDropdown onLogout={() => console.log("Logged out")} />
            </Box>
          </Box>
        </Toolbar>
      </AppBar>
    </div>
  );
}
