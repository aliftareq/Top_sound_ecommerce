import { Keyboard } from "lucide-react";

export const registerFormControls = [
  {
    name: "userName",
    label: "User Name",
    placeholder: "Enter your user name",
    componentType: "input",
    type: "text",
  },
  {
    name: "email",
    label: "Email",
    placeholder: "Enter your email",
    componentType: "input",
    type: "email",
  },
  {
    name: "password",
    label: "Password",
    placeholder: "Enter your password",
    componentType: "input",
    type: "password",
  },
];

export const loginFormControls = [
  {
    name: "email",
    label: "Email",
    placeholder: "Enter your email",
    componentType: "input",
    type: "email",
  },
  {
    name: "password",
    label: "Password",
    placeholder: "Enter your password",
    componentType: "input",
    type: "password",
  },
];

export const addProductFormElements = [
  {
    label: "Title",
    name: "title",
    componentType: "input",
    type: "text",
    placeholder: "Enter product title",
  },
  {
    label: "Description",
    name: "description",
    componentType: "textarea",
    placeholder: "Enter product description",
  },
  {
    label: "Category",
    name: "category",
    componentType: "select",
    options: [
      { id: "sounbox", label: "Sound-Box" },
      { id: "headphone", label: "Head-Phone" },
      { id: "Keyboard", label: "Keyboard" },
      { id: "smartwatch", label: "Smartwatch" },
      { id: "accessories", label: "Accessories" },
    ],
  },
  {
    label: "Brand",
    name: "brand",
    componentType: "select",
    options: [
      { id: "kbroad", label: "Kbroad" },
      { id: "oraimo", label: "Oraimo" },
      { id: "logitech", label: "Logitech" },
      { id: "apple", label: "Apple" },
      { id: "xiaomi", label: "Xiaomi" },
      { id: "others", label: "Others" },
    ],
  },
  {
    label: "Price",
    name: "price",
    componentType: "input",
    type: "number",
    placeholder: "Enter product price",
  },
  {
    label: "Offer Price",
    name: "OfferPrice",
    componentType: "input",
    type: "number",
    placeholder: "Enter offer price (optional)",
  },
  {
    label: "Total Stock",
    name: "totalStock",
    componentType: "input",
    type: "number",
    placeholder: "Enter total stock",
  },
];

export const shoppingViewHeaderMenuItems = [
  {
    id: "home",
    label: "Home",
    path: "/",
  },
  {
    id: "products",
    label: "All Products",
    path: "/shop/listing",
  },
  {
    id: "soundbox",
    label: "Sound-Box",
    path: "/shop/listing",
  },
  {
    id: "headphone",
    label: "Headphone",
    path: "/shop/listing",
  },
  {
    id: "smartwatch",
    label: "Smartwatch",
    path: "/shop/listing",
  },
  {
    id: "keyboard",
    label: "KeyBoards",
    path: "/shop/listing",
  },
  {
    id: "accessories",
    label: "Accessories",
    path: "/shop/listing",
  },
  {
    id: "search",
    label: "Search",
    path: "/shop/search",
  },
];

export const categoryOptionsMap = {
  soundbox: "Sound-Box",
  headphone: "HeadPhone",
  smartwatch: "smartwatch",
  keyboard: "Keyborad",
  accessories: "Accessories",
};

export const brandOptionsMap = {
  kbroad: "Kbroad",
  oraimo: "Oraimo",
  logitech: "Logitech",
  apple: "Apple",
  xiaomi: "Xiaomi",
  others: "Others",
};

export const filterOptions = {
  category: [
    { id: "soundbox", label: "Sound-Box" },
    { id: "headphone", label: "Head-Phone" },
    { id: "Keyboard", label: "Keyboard" },
    { id: "smartwatch", label: "Smartwatch" },
    { id: "accessories", label: "Accessories" },
  ],
  brand: [
    { id: "kbroad", label: "Kbroad" },
    { id: "oraimo", label: "Oraimo" },
    { id: "logitech", label: "Logitech" },
    { id: "apple", label: "Apple" },
    { id: "xiaomi", label: "Xiaomi" },
    { id: "others", label: "Others" },
  ],
};

export const sortOptions = [
  { id: "price-lowtohigh", label: "Price: Low to High" },
  { id: "price-hightolow", label: "Price: High to Low" },
  { id: "title-atoz", label: "Title: A to Z" },
  { id: "title-ztoa", label: "Title: Z to A" },
];

export const addressFormControls = [
  {
    label: "Address",
    name: "address",
    componentType: "input",
    type: "text",
    placeholder: "Enter your address",
  },
  {
    label: "City",
    name: "city",
    componentType: "input",
    type: "text",
    placeholder: "Enter your city",
  },
  {
    label: "Pincode",
    name: "pincode",
    componentType: "input",
    type: "text",
    placeholder: "Enter your pincode",
  },
  {
    label: "Phone",
    name: "phone",
    componentType: "input",
    type: "text",
    placeholder: "Enter your phone number",
  },
  {
    label: "Notes",
    name: "notes",
    componentType: "textarea",
    placeholder: "Enter any additional notes",
  },
];
