import { useGlobalLoader } from "@/app/context/GlobalLoaderContext";
import { Backdrop, CircularProgress } from "@mui/material";

const GlobalLoader = () => {
  const { loading } = useGlobalLoader();

  return (
    <Backdrop open={loading} sx={{ zIndex: 1301, color: "#fff" }}>
      <CircularProgress color="inherit" />
    </Backdrop>
  );
};

export default GlobalLoader;
