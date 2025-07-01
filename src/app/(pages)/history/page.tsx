import PageContentWrapper from "@/components/PageWrapper";
import HistoryTable from "./components/historyTable";
import styles from "./history.module.scss";

export default function HistoryPage({ searchValue }: { searchValue: string }) {
  return (
    <>
      <PageContentWrapper>
        <div className={styles.tableWrapper}>
          <HistoryTable search={searchValue} />
        </div>
      </PageContentWrapper>
    </>
  );
}
