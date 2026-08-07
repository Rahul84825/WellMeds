import { Address } from "../models/Address.js";

// @desc    Get all saved addresses for current logged in user
// @route   GET /api/addresses
// @access  Private
export const getAddresses = async (req, res) => {
  try {
    const addresses = await Address.find({ user: req.user._id }).sort({ isDefault: -1, createdAt: -1 });
    res.json({
      success: true,
      count: addresses.length,
      addresses,
    });
  } catch (error) {
    console.error("Get addresses error:", error);
    res.status(500).json({ success: false, message: "Server error fetching addresses" });
  }
};

// @desc    Add a new address
// @route   POST /api/addresses
// @access  Private
export const addAddress = async (req, res) => {
  try {
    const {
      fullName,
      mobile,
      altMobile,
      houseNo,
      building,
      street,
      landmark,
      city,
      state,
      country,
      pincode,
      type,
      deliveryInstructions,
      isDefault,
      latitude,
      longitude,
      placeId,
      formattedAddress,
    } = req.body;

    // Check if user already has addresses
    const existingCount = await Address.countDocuments({ user: req.user._id });
    
    // If it's the user's first address, force isDefault to true
    const shouldBeDefault = existingCount === 0 ? true : Boolean(isDefault);

    if (shouldBeDefault) {
      // Clear previous defaults for this user
      await Address.updateMany({ user: req.user._id }, { isDefault: false });
    }

    const address = await Address.create({
      user: req.user._id,
      fullName,
      mobile,
      altMobile: altMobile || "",
      houseNo,
      building,
      street,
      landmark: landmark || "",
      city,
      state,
      country: country || "India",
      pincode,
      type: type || "Home",
      deliveryInstructions: deliveryInstructions || "",
      isDefault: shouldBeDefault,
      latitude: latitude ? Number(latitude) : null,
      longitude: longitude ? Number(longitude) : null,
      placeId: placeId || "",
      formattedAddress: formattedAddress || "",
    });

    res.status(201).json({
      success: true,
      message: "Address saved successfully",
      address,
    });
  } catch (error) {
    console.error("Add address error:", error);
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({ success: false, message: messages.join(", ") });
    }
    res.status(500).json({ success: false, message: "Server error creating address" });
  }
};

// @desc    Update existing address
// @route   PUT /api/addresses/:id
// @access  Private
export const updateAddress = async (req, res) => {
  try {
    const address = await Address.findOne({ _id: req.params.id, user: req.user._id });

    if (!address) {
      return res.status(404).json({ success: false, message: "Address not found" });
    }

    const {
      fullName,
      mobile,
      altMobile,
      houseNo,
      building,
      street,
      landmark,
      city,
      state,
      country,
      pincode,
      type,
      deliveryInstructions,
      isDefault,
      latitude,
      longitude,
      placeId,
      formattedAddress,
    } = req.body;

    if (isDefault && !address.isDefault) {
      await Address.updateMany({ user: req.user._id }, { isDefault: false });
    }

    address.fullName = fullName !== undefined ? fullName : address.fullName;
    address.mobile = mobile !== undefined ? mobile : address.mobile;
    address.altMobile = altMobile !== undefined ? altMobile : address.altMobile;
    address.houseNo = houseNo !== undefined ? houseNo : address.houseNo;
    address.building = building !== undefined ? building : address.building;
    address.street = street !== undefined ? street : address.street;
    address.landmark = landmark !== undefined ? landmark : address.landmark;
    address.city = city !== undefined ? city : address.city;
    address.state = state !== undefined ? state : address.state;
    address.country = country !== undefined ? country : address.country;
    address.pincode = pincode !== undefined ? pincode : address.pincode;
    address.type = type !== undefined ? type : address.type;
    address.deliveryInstructions = deliveryInstructions !== undefined ? deliveryInstructions : address.deliveryInstructions;
    if (latitude !== undefined) address.latitude = latitude ? Number(latitude) : null;
    if (longitude !== undefined) address.longitude = longitude ? Number(longitude) : null;
    if (placeId !== undefined) address.placeId = placeId;
    if (formattedAddress !== undefined) address.formattedAddress = formattedAddress;
    if (isDefault !== undefined) {
      address.isDefault = Boolean(isDefault);
    }

    const updatedAddress = await address.save();

    res.json({
      success: true,
      message: "Address updated successfully",
      address: updatedAddress,
    });
  } catch (error) {
    console.error("Update address error:", error);
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({ success: false, message: messages.join(", ") });
    }
    res.status(500).json({ success: false, message: "Server error updating address" });
  }
};

// @desc    Delete an address
// @route   DELETE /api/addresses/:id
// @access  Private
export const deleteAddress = async (req, res) => {
  try {
    const address = await Address.findOne({ _id: req.params.id, user: req.user._id });

    if (!address) {
      return res.status(404).json({ success: false, message: "Address not found" });
    }

    const wasDefault = address.isDefault;
    await address.deleteOne();

    // If default was deleted, promote another address to default if available
    if (wasDefault) {
      const nextAddress = await Address.findOne({ user: req.user._id }).sort({ createdAt: -1 });
      if (nextAddress) {
        nextAddress.isDefault = true;
        await nextAddress.save();
      }
    }

    res.json({
      success: true,
      message: "Address deleted successfully",
    });
  } catch (error) {
    console.error("Delete address error:", error);
    res.status(500).json({ success: false, message: "Server error deleting address" });
  }
};

// @desc    Set default address
// @route   PATCH /api/addresses/:id/default
// @access  Private
export const setDefaultAddress = async (req, res) => {
  try {
    const address = await Address.findOne({ _id: req.params.id, user: req.user._id });

    if (!address) {
      return res.status(404).json({ success: false, message: "Address not found" });
    }

    await Address.updateMany({ user: req.user._id }, { isDefault: false });
    address.isDefault = true;
    await address.save();

    res.json({
      success: true,
      message: "Address set as default successfully",
      address,
    });
  } catch (error) {
    console.error("Set default address error:", error);
    res.status(500).json({ success: false, message: "Server error setting default address" });
  }
};
