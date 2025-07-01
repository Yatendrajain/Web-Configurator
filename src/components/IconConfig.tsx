import React from "react";
import Image, { ImageProps } from "next/image";

const iconMap = {
  history: "assets/icons/history.svg",
  info: "assets/icons/Info.svg",
  note: "assets/icons/note.svg",
  notification: "assets/icons/notification.svg",
  refresh: "assets/icons/refresh.svg",
  search: "assets/icons/Search.svg",
  sorting: "assets/icons/sorting.svg",
  success: "assets/icons/Success.svg",
  taskDone: "assets/icons/task-done.svg",
  uploadCloud: "assets/icons/upload-cloud.svg",
  userSettings: "assets/icons/user-settings.svg",
  view: "assets/icons/view.svg",
  workflowSquare: "assets/icons/workflow-square.svg",
  add: "assets/icons/add.svg",
  arrowDown: "assets/icons/arrow-down.svg",
  auditLogs: "assets/icons/audit-logs.svg",
  breadcrumb: "assets/icons/breadcrumb.svg",
  calendar: "assets/icons/calendar.svg",
  clock: "assets/icons/clock.svg",
  clone: "assets/icons/clone.svg",
  close: "assets/icons/close.svg",
  configuration: "assets/icons/configuration.svg",
  connect: "assets/icons/connect.svg",
  dashboard: "assets/icons/dashboard.svg",
  delete: "assets/icons/delete.svg",
  edit: "assets/icons/edit.svg",
  ellipse: "assets/icons/ellipse.svg",
  logo: "assets/icons/logo.svg",
  fileType: "assets/icons/file-type.svg",
  chevronRight: "assets/icons/chevron-right.svg",
} as const;

export type IconName = keyof typeof iconMap;

interface IconProps
  extends Omit<ImageProps, "src" | "width" | "height" | "alt"> {
  name: IconName;
  size?: number;
  width?: number;
  height?: number;
  className?: string;
  alt?: string;
}

const Icon: React.FC<IconProps> = ({
  name,
  size = 24,
  className = "",
  alt,
  ...rest
}) => {
  const src = iconMap[name];

  if (!src) {
    console.warn(`Icon "${name}" not found in iconMap.`);
    return null;
  }

  return (
    <Image
      src={`/${src}`}
      priority={false}
      width={size}
      height={size}
      alt={alt ?? name}
      className={className}
      {...rest}
    />
  );
};

export default Icon;
