import { useState, useEffect } from "react";

const CurrentDate = () => {
 const [currentDate, setCurrentDate] = useState(new Date());

 useEffect(() => {
  const setMidnightTimer = () => {
   const now = new Date();
   const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
   const timeToMidnight = tomorrow - now;

   return setTimeout(() => {
    setCurrentDate(new Date());
    clearTimeout(setMidnightTimer());
   }, timeToMidnight);
  };

  setMidnightTimer();

  // Очистите таймер при размонтировании
  return () => {
   clearTimeout(setMidnightTimer());
  };
 }, []);

 return <b>{currentDate.toLocaleDateString("ru")}</b>;
};

export default CurrentDate;
