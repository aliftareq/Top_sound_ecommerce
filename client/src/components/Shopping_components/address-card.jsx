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
        <Label>Full-Address: {addressInfo?.fullAddress}</Label>
        <Label>District: {addressInfo?.district}</Label>
        <Label>Thana: {addressInfo?.thana}</Label>
        <Label>Phone: {addressInfo?.phone}</Label>
        <Label>Notes: {addressInfo?.notes}</Label>
      </CardContent>
      <div className="p-3 flex justify-between">
        <Button
          className="w-1/3 mx-auto"
          variant="submit"
          onClick={() => handleEditAddress(addressInfo)}
        >
          Edit
        </Button>
        <Button
          className="w-1/3 mx-auto"
          variant="submit"
          onClick={() => handleDeleteAddress(addressInfo)}
        >
          Delete
        </Button>
      </div>
      <CardFooter>
        <Button className="w-full" variant="submit">
          Select
        </Button>
      </CardFooter>
    </Card>
  );
};

export default AddressCard;
