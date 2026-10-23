// Helper to calculate applicant age in whole years without timezone shift
const calculateAge = (birthDateString) => {
  if (!birthDateString) return 0;
  const parts = birthDateString.split("-");
  if (parts.length !== 3) return 0;
  const birthYear = parseInt(parts[0], 10);
  const birthMonth = parseInt(parts[1], 10) - 1;
  const birthDay = parseInt(parts[2], 10);
  if (isNaN(birthYear) || isNaN(birthMonth) || isNaN(birthDay)) return 0;

  const today = new Date();
  let age = today.getFullYear() - birthYear;
  const monthDiff = today.getMonth() - birthMonth;
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDay)) {
    age--;
  }
  return age;
};

export { calculateAge };
