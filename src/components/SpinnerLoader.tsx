"use client";

import { Backdrop, CircularProgress } from "@mui/material";

type SpinnerLoaderProps = {
  open: boolean;
};

export default function SpinnerLoader({ open }: SpinnerLoaderProps) {
  return (
    <Backdrop
      open={open}
      sx={{
        color: "#fff",
        background: "rgb(181 171 171 / 50%)",
        zIndex: 99999,
      }}
    >
      <CircularProgress
        size={"5rem"}
        sx={{ color: "#00886F", zIndex: 9999999 }}
      />
    </Backdrop>
  );
}
