import React, { useMemo, useState } from "react";
import {
  Avatar,
  Menu,
  MenuItem,
  Typography,
  Divider,
  Box,
  Button,
} from "@mui/material";
import KeyboardArrowDown from "@mui/icons-material/KeyboardArrowDown";
import { signOut, useSession } from "next-auth/react";
import { useGlobalLoader } from "@/app/context/GlobalLoaderContext";

const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

const getRandomColor = () => {
  const colors = [
    "#F44336", // red
    "#E91E63", // pink
    "#9C27B0", // purple
    "#3F51B5", // indigo
    "#03A9F4", // light blue
    "#009688", // teal
    "#4CAF50", // green
    "#FF9800", // orange
    "#795548", // brown
    "#607D8B", // blue grey
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

const UserAvatarDropdown = ({ onLogout }: { onLogout: () => void }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const { data: session } = useSession();
  const userName: string = session?.user?.name || "John Doe";
  const initials = useMemo(() => getInitials(userName), [userName]);
  const bgColor = useMemo(() => getRandomColor(), []); // only once on mount

  const { setLoading } = useGlobalLoader();

  const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  //   const handleLogout = () => {
  //     handleClose();
  //     onLogout();
  //   };

  const handleLogout = () => {
    const tenantId = process.env.AZURE_AD_TENANT_ID;
    setLoading(true);
    signOut({
      redirect: false,
    });
    window.location.href = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/logout?post_logout_redirect_uri=${encodeURIComponent(window.location.origin)}`;
    handleClose();
    onLogout();
  };

  return (
    <>
      <Button
        onClick={handleOpen}
        startIcon={
          session?.user.image ? (
            <Avatar
              sx={{
                width: 30,
                height: 30,
              }}
              alt={userName}
              src={session.user.image}
            />
          ) : (
            <Avatar
              sx={{
                bgcolor: bgColor,
                width: 30,
                height: 30,
                fontSize: "12px !important",
              }}
            >
              {initials}
            </Avatar>
          )
        }
        endIcon={
          <KeyboardArrowDown sx={{ fontSize: 20, marginLeft: "-12px" }} />
        }
        sx={{
          textTransform: "none",
          padding: "4px 8px",
          borderRadius: "24px",
          color: "#333",
        }}
      >
        {/* <Typography variant="body2" fontWeight={500}>
          {userName}
        </Typography> */}
      </Button>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          elevation: 4,
          sx: {
            mt: 1.5,
            minWidth: 180,
            overflow: "visible",
            filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.1))",
            "&:before": {
              content: '""',
              display: "block",
              position: "absolute",
              top: 0,
              right: 20,
              width: 10,
              height: 10,
              bgcolor: "background.paper",
              transform: "translateY(-50%) rotate(45deg)",
              zIndex: 0,
            },
          },
        }}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Box px={2} pt={1}>
          <Typography variant="subtitle1">{userName}</Typography>
        </Box>
        <Divider />
        <MenuItem onClick={handleLogout}>Logout</MenuItem>
      </Menu>
    </>
  );
};

export default UserAvatarDropdown;
