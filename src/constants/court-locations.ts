/**
 * Hard-coded court locations (lat, long)
 * Key: court_id, Value: [latitude, longitude]
 */
export const COURT_LOCATIONS: Record<number, [number, number]> = {
  2: [21.0312223, 105.7701917],
  4: [21.0312223, 105.7701917],
  5: [21.0312223, 105.7701917],
  6: [21.0312223, 105.7701917],
  7: [21.0312223, 105.7701917],
  8: [21.0312223, 105.7701917],
  9: [21.0312223, 105.7701917],
  10: [21.0312223, 105.7701917],
  11: [21.0312223, 105.7701917],
  12: [21.0312223, 105.7701917],
} as const;

// Maximum allowed distance for check-in/check-out (in meters)
export const MAX_CHECKIN_DISTANCE = 1000; // 1km
