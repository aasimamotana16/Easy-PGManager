import React, { useEffect, useMemo, useState } from 'react';
import CRUDTable from '../components/CRUDTable';
import { reviewsAPI } from '../services/api';

const Reviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await reviewsAPI.getReviewsAdmin();
      setReviews(response.data.reviews || []);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch reviews');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleStatusChange = async (review, nextStatus) => {
    if (!review || !nextStatus || nextStatus === review.moderationStatus) return;
    try {
      setUpdatingId(review.id);
      await reviewsAPI.updateReviewStatus(review.id, nextStatus);
      setReviews((prev) =>
        prev.map((item) =>
          item.id === review.id
            ? {
                ...item,
                moderationStatus: nextStatus,
                isActive: nextStatus === 'accepted'
              }
            : item
        )
      );
    } catch (err) {
      window.alert(err.response?.data?.message || 'Failed to update review status');
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredReviews = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return reviews;
    return reviews.filter((review) =>
      [review.comment, review.userRole, review.reviewerName]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(q))
    );
  }, [reviews, searchTerm]);

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'comment', label: 'Comment' },
    {
      key: 'userRole',
      label: 'User Role',
      render: (role) => (
        <span className="inline-flex rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700">
          {role || 'N/A'}
        </span>
      )
    },
    {
      key: 'moderationStatus',
      label: 'Review Status',
      render: (status, row) => (
        <select
          value={status || 'accepted'}
          disabled={updatingId === row.id}
          onChange={(e) => handleStatusChange(row, e.target.value)}
          className="rounded-md border border-gray-300 px-2 py-1 text-xs font-medium text-gray-700 focus:outline-none focus:ring-1 focus:ring-orange-500"
        >
          <option value="accepted">Accepted</option>
          <option value="rejected">Rejected</option>
        </select>
      )
    }
  ];

  return (
    <div className="p-4 sm:p-6">
      <CRUDTable
        data={filteredReviews}
        columns={columns}
        loading={loading}
        error={error}
        onPageChange={() => {}}
        onSearch={setSearchTerm}
        onAdd={() => {}}
        onEdit={() => {}}
        onDelete={() => {}}
        showAddButton={false}
        showActions={false}
        searchPlaceholder="Search by comment or role..."
        title="Reviews"
      />
    </div>
  );
};

export default Reviews;
