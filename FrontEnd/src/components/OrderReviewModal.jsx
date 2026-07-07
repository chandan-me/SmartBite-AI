import React, { useState, useContext } from 'react';
import { GlobalStateContext } from '../context/GlobalStateContext';
import './CSS/OrderReviewModal.css';

const OrderReviewModal = ({ order, foodItem, onClose, onReviewSubmitted }) => {
  const { addReview, hasUserReviewedOrder } = useContext(GlobalStateContext);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (rating === 0) {
      alert('Please select a rating');
      return;
    }

    setIsSubmitting(true);
    const result = await addReview(
      order.id,
      rating,
      reviewText,
      foodItem.id || foodItem.FoodID,
      foodItem.name || foodItem.FoodName
    );
    setIsSubmitting(false);

    if (result.success) {
      onReviewSubmitted && onReviewSubmitted();
      onClose();
    }
  };

  return (
    <div className="review-modal-overlay" onClick={onClose}>
      <div className="review-modal" onClick={(e) => e.stopPropagation()}>
        <button className="review-modal-close" onClick={onClose}>✕</button>
        
        <h3>⭐ Rate & Review</h3>
        <p className="review-food-name">{foodItem.name || foodItem.FoodName}</p>
        
        <div className="review-rating-container">
          <div className="review-stars">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                className={`review-star ${star <= (hoverRating || rating) ? 'active' : ''}`}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(star)}
              >
                ★
              </button>
            ))}
          </div>
          <span className="review-rating-label">
            {rating > 0 ? `${rating} / 5` : 'Tap a star to rate'}
          </span>
        </div>

        <div className="review-text-area">
          <label htmlFor="review-text">Tell us about your experience (optional)</label>
          <textarea
            id="review-text"
            rows="4"
            placeholder="What did you think of this dish? We'd love to hear your feedback!"
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
          />
        </div>

        <div className="review-actions">
          <button className="review-cancel-btn" onClick={onClose}>
            Cancel
          </button>
          <button 
            className="review-submit-btn" 
            onClick={handleSubmit}
            disabled={isSubmitting || rating === 0}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Review ⭐'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderReviewModal;