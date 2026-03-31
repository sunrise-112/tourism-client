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
      className='w-full rounded-2xl bg-white shadow-sm border border-gray-200 overflow-hidden'
    >
      <div className='overflow-x-auto w-full'>
        <table className='w-full border-collapse'>
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
