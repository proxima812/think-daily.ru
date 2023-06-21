import { useEffect, useState } from "react";

function isMarch8() {
 const [isMarch9, setIsMarch9] = useState(false);

 useEffect(() => {
  const checkDate = () => {
   const date = new Date();
   // 5 - месяц | 22 - день
   if (date.getMonth() === 3 && date.getDate() === 8) {
    setIsMarch9(true);
   } else {
    setIsMarch9(false);
   }
  };

  checkDate();

  const intervalId = setInterval(checkDate, 1000 * 60 * 60 * 24); // проверка каждые 24 часа

  return () => {
   clearInterval(intervalId);
  };
 }, []);

 return <>{isMarch9 && <span>8 марта!</span>}</>;
}

export default isMarch8;
