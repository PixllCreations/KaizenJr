export function extractTimeIfUtc(status: string) {
  console.log(status);
  // Regular expression to check if status is in ISO 8601 Zulu time format
  const zuluTimeRegex = /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z/;

  if (zuluTimeRegex.test(status)) {
    // Convert status to a Date object
    const date = new Date(status);

    return date;
  } else {
    // Return null or any suitable fallback if status is not in Zulu time format
    return null;
  }
}
