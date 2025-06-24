exports.carRenterDashboard = async (req, res) => {
  res.status(200).json({
    message: `Welcome Car Renter: ${req.user.email}`,
    data: {
      bookings: [],
      recommendedCars: [],
    },
  });
};
