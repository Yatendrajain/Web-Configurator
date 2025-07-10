import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { SvgIconProps } from "@mui/material";

export const CustomDropdownIcon: React.FC<SvgIconProps> = (props) => (
  <ExpandMoreIcon
    {...props}
    sx={{
      color: "#475466",
      fontSize: "1.2rem",
      pointerEvents: "none", // let the parent handle the click
      ...props.sx,
    }}
  />
);
