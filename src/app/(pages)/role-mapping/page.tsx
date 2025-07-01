"use client";
import PageContentWrapper from "@/components/PageWrapper";
import RoleMappingWrapper from "@/components/RoleMapping";
import { useState } from "react";
import { RoleMappingItem } from "@/app/(pages)/role-mapping/interface/index";

export default function RoleMapping() {
  const [mappings, setMappings] = useState<RoleMappingItem[]>([
    { role: "Admin", permissions: "Admin" },
    { role: "Editor", permissions: "Write" },
    { role: "User", permissions: "Read" },
  ]);

  const handleRoleChange = (
    index: number,
    key: keyof RoleMappingItem,
    value: string,
  ) => {
    const updated = [...mappings];
    updated[index][key] = value;
    setMappings(updated);
  };

  return (
    <div>
      <PageContentWrapper>
        <RoleMappingWrapper
          roleMappings={mappings}
          onChange={handleRoleChange}
        />
      </PageContentWrapper>
    </div>
  );
}
