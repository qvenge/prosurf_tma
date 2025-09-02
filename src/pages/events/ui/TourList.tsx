import styles from './TourList.module.scss';

import { TourCard } from './TourCard';

const data = {
  imgSrc: '/images/surfing1.jpg',
  dates: '1 мая – 6 июня',
  year: '2025 г',
  name: 'ProSurf Camp / Bali',
  location: 'Бали, Индонезия',
  price: '$ 1 690',
  remainingSeats: 3
 }


interface TourListProps {

}

export const TourList = ({

}: TourListProps) => {

  return (
    <div className={styles.wrapper}>
      <TourCard data={data} />
      <TourCard data={data} />
    </div>
  );
};