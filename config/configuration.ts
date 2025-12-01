export default () => ({
  backendUrl: process.env.NEXT_PUBLIC_BACKEND_URL,
  in_house_lab_id: process.env.NEXT_PUBLIC_IN_HOUSE_LAB_ID as string,
});
