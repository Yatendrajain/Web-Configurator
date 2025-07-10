"use client";

import { Box, Typography, Divider, Checkbox } from "@mui/material";
import CustomDropdown from "../customDropdown";
import SystemFields from "./SystemFields";
import { Props } from "@/interfaces/editProduct";

const EditProductOrder: React.FC<Props> = ({
  orderFields,
  systemFields,
  paxVersion,
  onChange,
  onPaxChange,
  mode,
  onValidityChange,
  handleOrderFieldChange,
}) => {
  return (
    <Box sx={{ backgroundColor: "white", borderRadius: 2, padding: 2 }}>
      <Typography gutterBottom fontSize={"1rem"} fontWeight={"600"}>
        Edit Product Order
      </Typography>

      <Divider sx={{ mb: 2 }} />

      <Box display="flex" flexDirection="column" gap={2}>
        {/* Table-like layout */}
        <Box display="flex" flexDirection="column">
          <Box display="flex">
            <Typography
              flexBasis="33.33%"
              variant="subtitle2"
              fontWeight={600}
              fontSize="0.8rem"
              color="text.secondary"
            >
              Field
            </Typography>
            <Typography
              flexBasis="33.33%"
              variant="subtitle2"
              fontWeight={600}
              fontSize="0.8rem"
              color="text.secondary"
            >
              Original Value{" "}
            </Typography>
            <Typography
              flexBasis="33.33%"
              variant="subtitle2"
              fontWeight={600}
              fontSize="0.8rem"
              color="text.secondary"
            >
              {mode === "edit" ? "New Value" : "Submitted Value"}
            </Typography>
          </Box>

          {orderFields.map((field) => (
            <Box
              key={field.key}
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 2,
                my: 1,
              }}
            >
              <Typography
                flexBasis="33.33%"
                variant="subtitle1"
                fontSize="0.8rem"
                color="#334053"
                fontWeight={500}
              >
                {field.label}{" "}
              </Typography>

              <Typography
                flexBasis={mode === "view" ? "33.33%" : "30.33%"}
                variant="subtitle2"
                fontSize="0.8rem"
                fontWeight={500}
                color="text.secondary"
              >
                {field.original || "-"}
              </Typography>
              <Box flexBasis={mode === "view" ? "33.33%" : "36.33%"}>
                {field.options ? (
                  <CustomDropdown
                    width={280}
                    defaultOption={field.value}
                    allOptions={field.options}
                    disabled={field.disabled}
                    onChange={(newValue: string) =>
                      handleOrderFieldChange(field.key!, newValue)
                    }
                  />
                ) : (
                  <Typography
                    variant="subtitle1"
                    fontSize="0.8rem"
                    color="#00886F"
                    fontWeight={500}
                  >
                    {field.value}
                  </Typography>
                )}
              </Box>
            </Box>
          ))}
        </Box>

        {mode === "edit" && (
          <>
            <Box display="flex" alignItems="center" gap={1}>
              <Typography variant="subtitle1" fontWeight={600}>
                System Fields
              </Typography>
              <Checkbox checked />
            </Box>

            <Divider sx={{ mb: 2, mt: -2 }} />

            <SystemFields
              systemFields={systemFields}
              paxVersion={paxVersion}
              onChange={onChange}
              onValidityChange={onValidityChange}
              mode={mode}
              onPaxChange={onPaxChange}
            />
          </>
        )}
      </Box>
    </Box>
  );
};

export default EditProductOrder;
