import ReactStars from 'react-rating-stars-component';

export default function ProductRatingStars({ rating }) {
  return (
    <ReactStars
      count={5}
      size={20}
      isHalf={true}
      edit={false}
      value={rating}
      activeColor="#facc15"
    />
  );
}
