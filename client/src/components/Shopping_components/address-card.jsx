import { useTranslation } from "react-i18next";
import { Button } from "../ui/button";
import { Card, CardContent, CardFooter } from "../ui/card";
import { Label } from "../ui/label";

const AddressCard = ({
  addressInfo,
  handleDeleteAddress,
  handleEditAddress,
  setCurrentSelectedAddress,
  selectedId,
}) => {
  const { t } = useTranslation();
  return (
    <Card
      onClick={
        setCurrentSelectedAddress
          ? () => setCurrentSelectedAddress(addressInfo)
          : null
      }
      className={`cursor-pointer border-red-700 ${
        selectedId?._id === addressInfo?._id
          ? "border-green-900 border-4"
          : "border-black"
      }`}
      variant="submit"
    >
      <CardContent className="grid p-4 gap-4">
        <Label> {t("address.name")}: {addressInfo?.name}</Label>
        <Label>{t("address.fulladdress")}: {addressInfo?.fullAddress}</Label>
        <Label>{t("address.thana")}: {addressInfo?.thana}</Label>
        <Label>{t("address.district")}: {addressInfo?.district}</Label>
        <Label>{t("address.phone")}: {addressInfo?.phone}</Label>
        <Label>{t("address.notes")}: {addressInfo?.notes}</Label>
      </CardContent>
      <div className="p-3 flex justify-between">
        <Button
          className="w-1/3 mx-auto"
          variant="submit"
          onClick={() => handleEditAddress(addressInfo)}
        >
         {t("btn.edit")}
        </Button>
        <Button
          className="w-1/3 mx-auto"
          variant="submit"
          onClick={() => handleDeleteAddress(addressInfo)}
        >
          {t("btn.delete")}
        </Button>
      </div>
      <CardFooter>
        <Button className="w-full" variant="submit">
          {t("btn.select")}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default AddressCard;
