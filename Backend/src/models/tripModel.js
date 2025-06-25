const db = require('../utils/db');

exports.saveTrip = async (tripData, userId) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // Insert into trips
    const [tripResult] = await conn.execute(
      `INSERT INTO trips (user_id, trip_name, start_date, end_date, total_budget, currency, total_trip_cost)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [userId, tripData.trip_name, tripData.start_date, tripData.end_date, tripData.total_budget, tripData.currency, tripData.total_trip_cost]
    );
    const tripId = tripResult.insertId;

    // Insert into trip_days
    for (let i = 0; i < tripData.days.length; i++) {
      const day = tripData.days[i];
      const tips = Array.isArray(day.tips) ? day.tips.join('; ') : '';
      const [dayResult] = await conn.execute(
        `INSERT INTO trip_days (trip_id, day_order, title, date, description, total_day_cost, tips)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [tripId, i + 1, day.title, day.date, day.description, day.total_day_cost || 0, tips]
      );
      const dayId = dayResult.insertId;

      // Insert into trip_locations
      for (const loc of day.locations || []) {
        await conn.execute(
          `INSERT INTO trip_locations
            (day_id, name, time, transport, estimated_cost, currency, category, google_maps_url, lat, lng)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            dayId,
            loc.name,
            loc.time,
            loc.transport || loc.transport_to_next || '',
            loc.estimated_cost || 0,
            loc.currency || tripData.currency,
            loc.category || '',
            loc.google_maps_url || '',
            loc.lat || 0,
            loc.lng || 0,
          ]
        );
      }
    }

    await conn.commit();
    return { tripId };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};
