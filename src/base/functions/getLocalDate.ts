export function getLocalDate() {
  const d = new Date();
  const localTime = d.getTime();
  const localOffset = d.getTimezoneOffset() * 60000;
  const utc = localTime + localOffset;
  const offset = -5; // UTC of USA Eastern Time Zone is -05.00
  const usa = utc + 3600000 * offset;
  const date = new Date(usa).toLocaleDateString("en-CA"); // en-CA for Canada YYYY-MM-DD format
  return date;
}
