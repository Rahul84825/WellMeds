import React, { useState } from "react";
import Modal from "../Modal";
import AddressCard from "./AddressCard";
import UniversalAddressForm from "./UniversalAddressForm";
import { useAddress } from "../../context/AddressContext";
import { Plus, MapPin, Check } from "lucide-react";

const AddressSelectorModal = ({ isOpen, onClose, onSelectAddress = null }) => {
  const {
    addresses,
    selectedAddressId,
    selectAddress,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
  } = useAddress();

  const [mode, setMode] = useState("list"); // "list" | "add" | "edit"
  const [editingAddress, setEditingAddress] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpenAdd = () => {
    setEditingAddress(null);
    setMode("add");
  };

  const handleOpenEdit = (addr) => {
    setEditingAddress(addr);
    setMode("edit");
  };

  const handleFormSubmit = async (formData) => {
    setIsSubmitting(true);
    try {
      if (mode === "add") {
        const newAddr = await addAddress(formData);
        if (onSelectAddress && newAddr) {
          onSelectAddress(newAddr._id || newAddr.id);
        }
      } else if (mode === "edit" && editingAddress) {
        const updated = await updateAddress(editingAddress._id || editingAddress.id, formData);
        if (onSelectAddress && updated) {
          onSelectAddress(updated._id || updated.id);
        }
      }
      setMode("list");
      setEditingAddress(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelect = (id) => {
    selectAddress(id);
    if (onSelectAddress) {
      onSelectAddress(id);
    }
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        mode === "add"
          ? "Add New Address"
          : mode === "edit"
          ? "Edit Address"
          : "Select Delivery Address"
      }
    >
      <div className="p-4 select-none">
        {mode === "list" && (
          <div className="space-y-md">
            {/* Add New Address Action Bar */}
            <button
              onClick={handleOpenAdd}
              className="w-full flex items-center justify-between p-3.5 rounded-2xl border-2 border-dashed border-[#038076]/40 dark:border-[#038076]/60 bg-teal-50/40 dark:bg-teal-950/20 text-[#038076] dark:text-[#84d6b9] font-bold text-xs hover:bg-teal-50 dark:hover:bg-teal-950/40 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#038076] text-white flex items-center justify-center">
                  <Plus size={14} />
                </span>
                <span>Add New Address</span>
              </div>
              <span className="text-[11px] font-semibold underline">Fill Form</span>
            </button>

            {/* List of Saved Addresses */}
            {addresses.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <MapPin size={36} className="mx-auto mb-2 opacity-50" />
                <p className="text-xs font-semibold">No saved addresses found.</p>
                <p className="text-[11px]">Click "Add New Address" above to save one.</p>
              </div>
            ) : (
              <div className="space-y-sm max-h-[60vh] overflow-y-auto pr-1">
                {addresses.map((addr) => {
                  const id = addr._id || addr.id;
                  const isSelected = id === selectedAddressId;
                  return (
                    <AddressCard
                      key={id}
                      address={addr}
                      isSelected={isSelected}
                      onSelect={() => handleSelect(id)}
                      onEdit={handleOpenEdit}
                      onDelete={deleteAddress}
                      onSetDefault={setDefaultAddress}
                    />
                  );
                })}
              </div>
            )}
          </div>
        )}

        {(mode === "add" || mode === "edit") && (
          <UniversalAddressForm
            initialValues={editingAddress}
            onSubmit={handleFormSubmit}
            onCancel={() => setMode("list")}
            submitLabel={mode === "add" ? "Save & Select Address" : "Update Address"}
            isSubmitting={isSubmitting}
          />
        )}
      </div>
    </Modal>
  );
};

export default AddressSelectorModal;
