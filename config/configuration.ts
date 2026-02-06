export default () => ({
  backendUrl: process.env.NEXT_PUBLIC_BACKEND_URL,
  in_house_lab_id: process.env.NEXT_PUBLIC_IN_HOUSE_LAB_ID as string,
});


// export default () => ({
//   backendUrl: "http://localhost:3001", 
//   in_house_lab_id: "68e4e8c7534364541c8deeb2"
// });