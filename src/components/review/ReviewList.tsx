import { useState } from 'react';
import { mockReviews } from '../../mock/reviews';
import { Review } from '../../types/review';
import './ReviewList.css';

interface Props {
  bakeryId: string;
}

export default function ReviewList({ bakeryId }: Props) {
  const [reviews, setReviews] = useState<Review[]>(
    mockReviews.filter(r => r.bakeryId === bakeryId)
  );
  const [showForm, setShowForm] = useState(false);
  const [newReview, setNewReview] = useState({ userName: '', rating: 5, content: '' });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!newReview.userName.trim() || !newReview.content.trim()) return;
    const review: Review = {
      id: `r-new-${Date.now()}`,
      bakeryId,
      userName: newReview.userName,
      rating: newReview.rating,
      content: newReview.content,
      date: new Date().toISOString().split('T')[0],
      helpful: 0,
    };
    setReviews(prev => [review, ...prev]);
    setNewReview({ userName: '', rating: 5, content: '' });
    setShowForm(false);
  }

  return (
    <div className="review-list">
      <div className="review-header">
        <h3 className="section-title">💬 리뷰 ({reviews.length})</h3>
        <button className="review-write-btn" onClick={() => setShowForm(!showForm)}>
          {showForm ? '취소' : '리뷰 작성'}
        </button>
      </div>

      {showForm && (
        <form className="review-form" onSubmit={handleSubmit}>
          <input
            className="review-input"
            placeholder="닉네임"
            value={newReview.userName}
            onChange={e => setNewReview(p => ({ ...p, userName: e.target.value }))}
          />
          <div className="review-stars-input">
            {[1,2,3,4,5].map(n => (
              <button
                key={n}
                type="button"
                className={`star-btn ${n <= newReview.rating ? 'active' : ''}`}
                onClick={() => setNewReview(p => ({ ...p, rating: n }))}
              >★</button>
            ))}
          </div>
          <textarea
            className="review-textarea"
            placeholder="솔직한 리뷰를 남겨주세요..."
            rows={3}
            value={newReview.content}
            onChange={e => setNewReview(p => ({ ...p, content: e.target.value }))}
          />
          <button type="submit" className="review-submit">등록</button>
        </form>
      )}

      <div className="reviews">
        {reviews.map(review => (
          <div key={review.id} className="review-card">
            <div className="review-top">
              <span className="review-user">{review.userName}</span>
              <span className="review-stars">
                {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
              </span>
              <span className="review-date">{review.date}</span>
            </div>
            <p className="review-content">{review.content}</p>
            <span className="review-helpful">👍 {review.helpful}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
