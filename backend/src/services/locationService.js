// Pharmacy Store Details
export const STORE_LOCATION = {
  name: "WellMeds Pharmacy",
  address: "Shop No 3, Echelon Apartment, Baner - Pashan Link Rd, Baner",
  city: "Pune",
  state: "Maharashtra",
  pincode: "411021",
  country: "India",
  phone: "+91 7798795353",
  email: "info@wellmeds.in",
  workingHours: "08:00 AM - 11:00 PM (Mon - Sun)",
};

export const getStoreInfo = () => {
  return {
    ...STORE_LOCATION,
    panIndiaDelivery: true,
  };
};

export const validateDeliveryRadius = () => {
  return {
    isEligible: true,
    message: "Pan-India Express Delivery Available. We deliver nationwide!",
  };
};
