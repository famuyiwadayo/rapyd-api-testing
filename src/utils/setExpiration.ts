const setExpiration = (nDays: number): number => {
  // sets defaults to 7days
  !nDays && (nDays = 7);
  const expiration = new Date().setTime(
    new Date().getTime() + 3600000 * 24 * nDays
  );
  return expiration;
};

export default setExpiration;
