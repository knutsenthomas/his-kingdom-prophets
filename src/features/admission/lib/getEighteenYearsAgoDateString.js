// Returns YYYY-MM-DD for exactly 18 years ago from today
const getEighteenYearsAgoDateString = () => {
  const d = new Date();
  d.setFullYear(d.getFullYear() - 18);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export { getEighteenYearsAgoDateString };
