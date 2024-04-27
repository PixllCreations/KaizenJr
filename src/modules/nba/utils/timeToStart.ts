export default function getTimeToStart(startTime: Date) {
  const now = new Date(); // Current date and time in UTC
  const timeDifference = startTime.getTime() - now.getTime(); // Time difference in milliseconds

  return timeDifference;
}
