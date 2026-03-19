import CardsTable from "../common/CardsTable";
import TableHeader from "../common/TableHeader";
import TableBody from "../common/TableBody";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";

const Table = ({
  data,
  columns,
  onSort,
  sortColumn,
  showCards = true,
  onSelectAll,
  selectAll,
}) => {
  const { i18n } = useTranslation();
  const [isRTL, setIsRTL] = useState(false);

  useEffect(() => {
    const lang = i18n.language || localStorage.getItem("i18nextLng");
    setIsRTL(lang === "ar");
  }, [i18n.language]);

  return (
    <div
      dir={isRTL ? "rtl" : "ltr"}
      className='w-full rounded-2xl border border-base-200 bg-base-100 shadow-sm overflow-hidden'
    >
      {/* Cards view — mobile/tablet *data,
  columns,
  onSort,
  sortColumn,
  showCards = true,
  onSelectAll,
  selectAll,/}
      {showCards && (
        <div className='block xl:hidden p-4'>
          <CardsTable items={data} columns={columns} />
        </div>
      )}

      {/* Table view — desktop */}
      <div
        className={
          showCards
            ? "hidden xl:block overflow-x-auto"
            : "block overflow-x-auto"
        }
      >
        <table className='table table-zebra w-full text-sm'>
          <TableHeader
            columns={columns}
            onSort={onSort}
            sortColumn={sortColumn}
            onSelectAll={onSelectAll}
            selectAll={selectAll}
          />
          <TableBody items={data} columns={columns} />
        </table>
      </div>
    </div>
  );
};

export default Table;
