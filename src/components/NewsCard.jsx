import { Link } from 'react-router-dom';
import Icon from './Icon.jsx';
import { fmtNewsDate, newsBadge, outageWhen, isActiveOutage } from '../lib/news.js';

function NewsCard({ item }) {
  const badge = newsBadge(item);
  const when = isActiveOutage(item) ? outageWhen(item) : '';
  return (
    <Link className="news" to={`/news/${item.id}`}>
      <div className="news__media">
        {item.image
          ? <img src={item.image} alt="" loading="lazy" />
          : <div className={`ph ${badge.tile}`} style={{ height: '100%' }}><Icon name={badge.icon} size="lg" />{badge.label}</div>}
      </div>
      <div className="news__body">
        <div className="news__meta">
          <span className={badge.cls}>{badge.label}</span>
          {item.createdAt && <span className="t-small">{fmtNewsDate(item.createdAt)}</span>}
        </div>
        <p className="t-h3 news__title">{item.title}</p>
        <p className="news__text">{item.summary}</p>
        {(item.where || when) && (
          <p className="t-small news__where">
            <Icon name={when ? 'clock' : 'pin'} size="sm" />{[item.where, when].filter(Boolean).join(' · ')}
          </p>
        )}
      </div>
    </Link>
  );
}

export default NewsCard;
