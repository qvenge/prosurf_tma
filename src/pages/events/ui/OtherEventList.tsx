import styles from './OtherEventList.module.scss';

import { OtherEventCard } from './OtherEventCard';

const data = {
  imgSrc: '/images/surfing1.jpg',
  time: '21:30',
  name: 'SurfSkate Встреча',
  location: 'Flow Moscow Ставропольская, ул. 43, Москва',
  price: '2 000 ₽',
  remainingSeats: 3
 }


interface OtherEventListProps {

}

export const OtherEventList = ({

}: OtherEventListProps) => {

  return (
    <div className={styles.wrapper}>
      <div className={styles.eventsBlock}>
        <div className={styles.day}>3 июля • четверг</div>
        <OtherEventCard data={data} />
      </div>
      <div className={styles.eventsBlock}>
        <div className={styles.day}>4 июля • пятница</div>
        <OtherEventCard data={data} />
        <OtherEventCard data={data} />
      </div>
    </div>
  );
};
