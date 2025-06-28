// ✅ /src/components/ScoreStars.js (demi-étoiles, animations, bonus UX)
import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa';

export default function ScoreStars({ value = 0 }) {
  const stars = [];
  let v = Math.round(value * 2) / 2;
  for (let i = 1; i <= 5; i++) {
    if (v >= i) stars.push(<FaStar key={i} className="inline text-yellow-500" />);
    else if (v >= i - 0.5) stars.push(<FaStarHalfAlt key={i} className="inline text-yellow-400" />);
    else stars.push(<FaRegStar key={i} className="inline text-gray-300" />);
  }
  return <span className="space-x-0.5">{stars}</span>;
}
