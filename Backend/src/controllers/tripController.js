exports.createTrip = (req, res) => {
  const tripData = req.body
  console.log('Received trip:', tripData)

  // สมมุติแค่ echo กลับไปก่อน
  res.status(201).json({
    message: 'Trip received',
    data: tripData
  })
}
