import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { api } from "../services/api";
import { useAuth } from "../hooks/useAuth";

const AddressContext = createContext();

export const AddressProvider = ({ children }) => {
  const { user } = useAuth();
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState(null);

  const fetchAddresses = useCallback(async () => {
    if (!user) {
      setAddresses([]);
      setSelectedAddressId(null);
      return;
    }
    setLoading(true);
    try {
      const list = await api.getAddresses();
      setAddresses(list);

      // Default selection logic: keep previously selected if valid, or default address, or first address
      setSelectedAddressId((prevId) => {
        if (prevId && list.some((a) => a._id === prevId || a.id === prevId)) {
          return prevId;
        }
        const defaultAddr = list.find((a) => a.isDefault);
        if (defaultAddr) return defaultAddr._id || defaultAddr.id;
        if (list.length > 0) return list[0]._id || list[0].id;
        return null;
      });
    } catch (err) {
      console.error("Failed to load user addresses:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    setAddresses([]);
    setSelectedAddressId(null);
    fetchAddresses();
  }, [user, fetchAddresses]);


  const defaultAddress = addresses.find((a) => a.isDefault) || addresses[0] || null;
  const selectedAddress = addresses.find((a) => a._id === selectedAddressId || a.id === selectedAddressId) || defaultAddress;

  const addAddress = async (addressData) => {
    try {
      const newAddress = await api.addAddress(addressData);
      await fetchAddresses();
      if (newAddress) {
        setSelectedAddressId(newAddress._id || newAddress.id);
      }
      return newAddress;
    } catch (err) {
      throw err;
    }
  };

  const updateAddress = async (id, addressData) => {
    try {
      const updated = await api.updateAddress(id, addressData);
      await fetchAddresses();
      return updated;
    } catch (err) {
      throw err;
    }
  };

  const deleteAddress = async (id) => {
    try {
      await api.deleteAddress(id);
      await fetchAddresses();
    } catch (err) {
      throw err;
    }
  };

  const setDefaultAddress = async (id) => {
    try {
      const updated = await api.setDefaultAddress(id);
      await fetchAddresses();
      setSelectedAddressId(id);
      return updated;
    } catch (err) {
      throw err;
    }
  };

  return (
    <AddressContext.Provider
      value={{
        addresses,
        loading,
        selectedAddressId,
        setSelectedAddressId,
        selectedAddress,
        defaultAddress,
        fetchAddresses,
        addAddress,
        updateAddress,
        deleteAddress,
        setDefaultAddress,
      }}
    >
      {children}
    </AddressContext.Provider>
  );
};

export const useAddress = () => {
  const context = useContext(AddressContext);
  if (!context) {
    throw new Error("useAddress must be used within an AddressProvider");
  }
  return context;
};

export default AddressContext;
