"use client";

import PageContentWrapper from "@/components/PageWrapper";
import ProductOrdersTable from "./components/ProductOrdersTable";
import styles from "./productOrders.module.scss";

export default function ProductOrderPage() {
  return (
    <>
      <PageContentWrapper>
        <div className={styles.tableWrapper}>
          <ProductOrdersTable />
        </div>
      </PageContentWrapper>
    </>
  );
}
