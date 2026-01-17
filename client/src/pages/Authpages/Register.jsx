import CommonForm from "@/components/Common_components/Form";
import { registerFormControls } from "@/config";
import { registerUser } from "@/store/auth_slice";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

const initialState = {
  userName: "",
  phoneNumber: "",
  password: "",
};

const AuthRegister = () => {
  const [formData, setFormData] = useState(initialState);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const onSubmit = (event) => {
    event.preventDefault();
    dispatch(registerUser(formData)).then((data) => {
      if (data?.payload?.success) {
        toast.success(data?.payload?.message || "Registered successfully");
        navigate("/auth/login");
      } else {
        toast.error(data?.payload?.message || "Registration failed");
      }
    });
  };

  console.log(formData);

  return (
    <div className="mx-auto w-full max-w-md space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          {t("reg.text1")}
        </h1>
        <p className="mt-2">
         {t("reg.text2")}
          <Link
            className="font-medium ml-2 text-primary hover:underline text-blue-800"
            to="/auth/login"
          >
           {t("reg.text3")}
          </Link>
        </p>
      </div>
      <CommonForm
        formControls={registerFormControls}
        buttonText={"Sign Up"}
        formData={formData}
        setFormData={setFormData}
        onSubmit={onSubmit}
      />
    </div>
  );
};

export default AuthRegister;
