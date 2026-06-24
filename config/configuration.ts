export default () => ({
  backendUrl: process.env.NEXT_PUBLIC_BACKEND_URL,
  in_house_lab_id: process.env.NEXT_PUBLIC_IN_HOUSE_LAB_ID as string,
  hospitalName: process.env.NEXT_PUBLIC_HOSPITAL_NAME,
  hospitalAddress: process.env.NEXT_PUBLIC_HOSPITAL_ADDRESS,
  hospitalPhone: process.env.NEXT_PUBLIC_HOSPITAL_PHONE,
  hospitalEmail: process.env.NEXT_PUBLIC_HOSPITAL_EMAIL,
  digiPin: process.env.NEXT_PUBLIC_DIGI_PIN,
  logo: process.env.NEXT_PUBLIC_LOGO || "/logo.png",
  gstIn: process.env.NEXT_PUBLIC_GSTIN
});


// export default () => ({
//   backendUrl: "http://localhost:3001",
//   in_house_lab_id: "68e4e8c7534364541c8deeb2"
// });