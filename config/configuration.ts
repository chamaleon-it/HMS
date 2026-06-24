export default () => ({
  backendUrl: process.env.NEXT_PUBLIC_BACKEND_URL,
  hospitalName: process.env.NEXT_PUBLIC_HOSPITAL_NAME,
  hospitalAddress: process.env.NEXT_PUBLIC_HOSPITAL_ADDRESS,
  hospitalPhone: process.env.NEXT_PUBLIC_HOSPITAL_PHONE,
  hospitalEmail: process.env.NEXT_PUBLIC_HOSPITAL_EMAIL,
  digiPin: process.env.NEXT_PUBLIC_DIGI_PIN,
  logo: process.env.NEXT_PUBLIC_LOGO || "/logo.png",
  gstIn: process.env.NEXT_PUBLIC_GSTIN
});
