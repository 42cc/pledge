const pad = n => n < 10 ? `0${n}` : n;

export const formatDate = date => {
  var jsDate = date instanceof Date ? date : new Date(date);

  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  return `${jsDate.getDate()} ${months[jsDate.getMonth()]} at ${pad(jsDate.getHours())}:${pad(jsDate.getMinutes())}`;
};
