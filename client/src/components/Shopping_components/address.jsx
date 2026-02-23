// /* eslint-disable react-hooks/exhaustive-deps */
// import { useEffect, useState } from "react";
// import CommonForm from "../Common_components/form";
// import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
// import { addressFormControls } from "@/config";
// import { useDispatch, useSelector } from "react-redux";
// import {
//   addNewAddress,
//   deleteAddress,
//   editaAddress,
//   fetchAllAddresses,
// } from "@/store/shop/address-slice";
// import AddressCard from "./address-card";
// import { toast } from "sonner";

// const initialAddressFormData = {
//   name: "",
//   fullAddress: "",
//   district: "",
//   thana: "",
//   phone: "",
//   notes: "",
// };

// const Address = ({ setCurrentSelectedAddress, selectedId }) => {
//   const [formData, setFormData] = useState(initialAddressFormData);
//   const [currentEditedId, setCurrentEditedId] = useState(null);
//   const dispatch = useDispatch();
//   const { user } = useSelector((state) => state.auth);
//   const { addressList } = useSelector((state) => state.shopAddress);

//   const handleManageAddress = (event) => {
//     event.preventDefault();

//     if (addressList.length >= 3 && currentEditedId === null) {
//       setFormData(initialAddressFormData);
//       toast.error("You can add max 3 addresses");

//       return;
//     }

//     currentEditedId !== null
//       ? dispatch(
//           editaAddress({
//             userId: user?.id,
//             addressId: currentEditedId,
//             formData,
//           }),
//         ).then((data) => {
//           if (data?.payload?.success) {
//             dispatch(fetchAllAddresses(user?.id));
//             setCurrentEditedId(null);
//             setFormData(initialAddressFormData);
//             toast.success("Address updated successfully");
//           }
//         })
//       : dispatch(
//           addNewAddress({
//             ...formData,
//             userId: user?.id,
//           }),
//         ).then((data) => {
//           if (data?.payload?.success) {
//             dispatch(fetchAllAddresses(user?.id));
//             setFormData(initialAddressFormData);
//             toast.success("Address added successfully");
//           }
//         });
//   };

//   const handleDeleteAddress = (getCurrentAddress) => {
//     dispatch(
//       deleteAddress({ userId: user?.id, addressId: getCurrentAddress._id }),
//     ).then((data) => {
//       if (data?.payload?.success) {
//         dispatch(fetchAllAddresses(user?.id));
//         setFormData(initialAddressFormData);
//         toast.success("Address deleted successfully");
//       }
//     });
//   };

//   const handleEditAddress = (getCuurentAddress) => {
//     setCurrentEditedId(getCuurentAddress?._id);
//     setFormData({
//       ...formData,
//       fullAddress: getCuurentAddress?.fullAddress,
//       district: getCuurentAddress?.district,
//       thana: getCuurentAddress?.thana,
//       phone: getCuurentAddress?.phone,
//       notes: getCuurentAddress?.notes,
//     });
//   };

//   function isFormValid() {
//     return Object.keys(formData)
//       .map((key) => formData[key].trim() !== "")
//       .every((item) => item);
//   }

//   useEffect(() => {
//     dispatch(fetchAllAddresses(user?.id));
//   }, [dispatch]);

//   // console.log(addressList, "addressList");

//   return (
//     <Card>
//       <div className="mb-5 p-3 grid grid-cols-1 sm:grid-cols-2  gap-2">
//         {addressList && addressList.length > 0
//           ? addressList.map((singleAddressItem) => (
//               <AddressCard
//                 addressInfo={singleAddressItem}
//                 handleDeleteAddress={handleDeleteAddress}
//                 handleEditAddress={handleEditAddress}
//                 setCurrentSelectedAddress={setCurrentSelectedAddress}
//                 selectedId={selectedId}
//               />
//             ))
//           : null}
//       </div>
//       <CardHeader>
//         <CardTitle>
//           {currentEditedId !== null ? "Edit Address" : "Add New Address"}
//         </CardTitle>
//       </CardHeader>
//       <CardContent className="space-y-3">
//         <CommonForm
//           formControls={addressFormControls}
//           formData={formData}
//           setFormData={setFormData}
//           buttonText={currentEditedId !== null ? "Edit" : "Add"}
//           onSubmit={handleManageAddress}
//           isBtnDisabled={!isFormValid()}
//         />
//       </CardContent>
//     </Card>
//   );
// };

// export default Address;

/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import CommonForm from "../Common_components/form";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { addressFormControls } from "@/config";
import { useDispatch, useSelector } from "react-redux";
import {
  addNewAddress,
  deleteAddress,
  editaAddress,
  fetchAllAddresses,
  loadGuestAddresses,
  addGuestAddress,
  editGuestAddress,
  deleteGuestAddress,
} from "@/store/shop/address-slice";
import AddressCard from "./address-card";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

const initialAddressFormData = {
  name: "",
  fullAddress: "",
  district: "",
  thana: "",
  phone: "",
  notes: "",
};

const Address = ({ setCurrentSelectedAddress, selectedId }) => {
   const { t } = useTranslation();
  const [formData, setFormData] = useState(initialAddressFormData);
  const [currentEditedId, setCurrentEditedId] = useState(null);

  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { addressList, guestAddressList } = useSelector((state) => state.shopAddress);

  const isLoggedIn = Boolean(user?.id);

  const effectiveAddressList = isLoggedIn ? addressList : guestAddressList;

  const handleManageAddress = (event) => {
    event.preventDefault();

    if (effectiveAddressList.length >= 3 && currentEditedId === null) {
      setFormData(initialAddressFormData);
      toast.error("You can add max 3 addresses");
      return;
    }

    // =========================
    // ✅ GUEST FLOW (localStorage)
    // =========================
    if (!isLoggedIn) {
      if (currentEditedId !== null) {
        dispatch(editGuestAddress({ addressId: currentEditedId, formData }));
        setCurrentEditedId(null);
        setFormData(initialAddressFormData);
        toast.success("Address updated successfully");
      } else {
        dispatch(addGuestAddress(formData));
        setFormData(initialAddressFormData);
        toast.success("Address added successfully");
      }
      return;
    }

    // =========================
    // ✅ LOGGED-IN FLOW (backend)
    // =========================
    if (currentEditedId !== null) {
      dispatch(
        editaAddress({
          userId: user.id,
          addressId: currentEditedId,
          formData,
        })
      ).then((data) => {
        if (data?.payload?.success) {
          dispatch(fetchAllAddresses(user.id));
          setCurrentEditedId(null);
          setFormData(initialAddressFormData);
          toast.success("Address updated successfully");
        }
      });
    } else {
      dispatch(
        addNewAddress({
          ...formData,
          userId: user.id,
        })
      ).then((data) => {
        if (data?.payload?.success) {
          dispatch(fetchAllAddresses(user.id));
          setFormData(initialAddressFormData);
          toast.success("Address added successfully");
        }
      });
    }
  };

  const handleDeleteAddress = (getCurrentAddress) => {
    // ✅ Guest
    if (!isLoggedIn) {
      dispatch(deleteGuestAddress({ addressId: getCurrentAddress._id }));
      setFormData(initialAddressFormData);
      toast.success("Address deleted successfully");
      return;
    }

    // ✅ Logged-in
    dispatch(
      deleteAddress({ userId: user.id, addressId: getCurrentAddress._id })
    ).then((data) => {
      if (data?.payload?.success) {
        dispatch(fetchAllAddresses(user.id));
        setFormData(initialAddressFormData);
        toast.success("Address deleted successfully");
      }
    });
  };

  const handleEditAddress = (getCurrentAddress) => {
    setCurrentEditedId(getCurrentAddress?._id);
    setFormData({
      name: getCurrentAddress?.name || "",
      fullAddress: getCurrentAddress?.fullAddress || "",
      district: getCurrentAddress?.district || "",
      thana: getCurrentAddress?.thana || "",
      phone: getCurrentAddress?.phone || "",
      notes: getCurrentAddress?.notes || "",
    });
  };

  function isFormValid() {
    return Object.keys(formData)
      .map((key) => String(formData[key] || "").trim() !== "")
      .every((item) => item);
  }

  useEffect(() => {
    if (isLoggedIn) dispatch(fetchAllAddresses(user.id));
    else dispatch(loadGuestAddresses());
  }, [dispatch, isLoggedIn, user?.id]);

  return (
    <Card>
      <div className="mb-5 p-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
        {effectiveAddressList && effectiveAddressList.length > 0
          ? effectiveAddressList.map((singleAddressItem) => (
              <AddressCard
                key={singleAddressItem._id}
                addressInfo={singleAddressItem}
                handleDeleteAddress={handleDeleteAddress}
                handleEditAddress={handleEditAddress}
                setCurrentSelectedAddress={setCurrentSelectedAddress}
                selectedId={selectedId}
              />
            ))
          : null}
      </div>

      <CardHeader>
        <CardTitle>
          {currentEditedId !== null ? t("address.text2") : t("address.text1")}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">
        <CommonForm
          formControls={addressFormControls}
          formData={formData}
          setFormData={setFormData}
          buttonText={currentEditedId !== null ? t("btn.edit") : t("btn.add")}
          onSubmit={handleManageAddress}
          isBtnDisabled={!isFormValid()}
        />
      </CardContent>
    </Card>
  );
};

export default Address;
