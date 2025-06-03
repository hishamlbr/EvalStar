// src/utils/helpers.js
/**
 * Format date to readable format
 * @param {string} dateString - The date string to format
 * @returns {string} - Formatted date string
 */
export const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };
  
  /**
   * Generate random password
   * @param {number} length - The length of the password
   * @returns {string} - Random password
   */
  export const generateRandomPassword = (length = 8) => {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let password = '';
    
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      password += charset[randomIndex];
    }
    
    return password;
  };
  
  /**
   * Format class name from level and group
   * @param {object} level - The level object
   * @param {object} group - The group object
   * @returns {string} - Formatted class name
   */
  export const formatClassName = (level, group) => {
    if (!level || !group) return 'N/A';
    return `${level.name}/${group.group_number}`;
  };
  
  /**
   * Get class label from level ID and group ID
   * @param {number} levelId - The level ID
   * @param {number} groupId - The group ID
   * @param {array} levels - Array of levels
   * @param {array} groups - Array of groups
   * @returns {string} - Class label
   */
  export const getClassLabel = (levelId, groupId, levels, groups) => {
    const level = levels.find(l => l.id === levelId);
    const group = groups.find(g => g.id === groupId);
    
    if (!level || !group) return 'Unknown';
    
    return `${level.name}/${group.group_number}`;
  };
  
  /**
   * Get star icons based on count
   * @param {number} count - Number of stars
   * @param {number} max - Maximum stars
   * @returns {JSX.Element[]} - Array of star icons
   */
  export const getStarIcons = (count, max = 5) => {
    const stars = [];
    
    for (let i = 0; i < max; i++) {
      const filled = i < count;
      stars.push(
        <span key={i} className={`star ${filled ? 'filled' : 'empty'}`}>
          {filled ? '★' : '☆'}
        </span>
      );
    }
    
    return stars;
  };