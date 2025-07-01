export enum DecodedOrderDataKeys {
  VOLTAGE = "Voltage",
  FREQUENCY = "Frequency",
  SYSTEM_TYPE = "System Type",
  VESSEL_SIZE = "Vessel Size",
  PROCESS_TYPE = "Process type",
  SEISMIC_OPTION = "Seismic Option",
  VESSEL_JACKET_DRAIN_KIT = "Vessel Jacket Drain Kit",
  PERSONAL_ELEVATION_ASSISTANCE_DEVICE = "Personal elevation assistance device",
}

export const STATUS_LABEL: Record<string, string> = {
  completed: "Completed",
  inProgress: "In progress",
  Failed: "Failed",
};
