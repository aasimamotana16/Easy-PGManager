// Backend URL for serving static files (images)
const BACKEND_URL = "http://localhost:5000";

/**
 * Helper function to get the full image URL
 * Handles both relative paths (from backend) and full URLs
 * @param {string} imagePath - The image path from the database (e.g., "/uploads/pgImages/filename.jpg")
 * @param {string} defaultImage - Optional default image if path is empty/null
 * @returns {string} - Full URL to the image
 */
export const getImageUrl = (imagePath, defaultImage = null) => {
  // If no image path provided, return default or a placeholder
  if (!imagePath) {
    return defaultImage || "https://images.unsplash.com/photo-1600585154340-be6161a56a0c";
  }

  // If already a full URL (starts with http:// or https://), return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }

  // If it's a relative path (starts with /), prepend backend URL
  if (imagePath.startsWith('/')) {
    return `${BACKEND_URL}${imagePath}`;
  }

  // Otherwise, assume it's a relative path and prepend backend URL
  return `${BACKEND_URL}/${imagePath}`;
};

/**
 * Helper function to get profile image URL
 * @param {string} imagePath - The profile image path from the database
 * @returns {string} - Full URL to the image
 */
export const getProfileImageUrl = (imagePath) => {
  return getImageUrl(imagePath, "/images/profileImages/profile1.jpg");
};

/**
 * Helper function to get PG image URL
 * @param {string} imagePath - The PG image path from the database
 * @returns {string} - Full URL to the image
 */
export const getPgImageUrl = (imagePath) => {
  return getImageUrl(imagePath, "https://images.unsplash.com/photo-1600585154340-be6161a56a0c");
};

export default getImageUrl;
