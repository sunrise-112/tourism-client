const formatDate = (date) => {
  const y = date.getFullYear();
  const m = date.getMonth() + 1;
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}/${m}/${d}`;
};

const getCurrentMonthRange = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth(); // 0-indexed

  const start = new Date(year, month, 1);
  const end = new Date(year, month + 1, 0);

  return {
    start: formatDate(start),
    end: formatDate(end),
  };
};

export default getCurrentMonthRange;
