import dayjs from 'dayjs';

export const formatDate = (date) => {
  if (!date) return '';
  return dayjs(date).format('MMM DD, YYYY');
};

export const formatDateTime = (date) => {
  if (!date) return '';
  return dayjs(date).format('MMM DD, YYYY hh:mm A');
};

export const formatPercentage = (value, total) => {
  if (!total) return '0%';
  return `${((value / total) * 100).toFixed(1)}%`;
};

export const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};
