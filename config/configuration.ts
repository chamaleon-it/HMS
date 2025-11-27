export default () => ({
  backendUrl: process.env.NEXT_PUBLIC_BACKEND_URL,
  in_house_lab_id: process.env.IN_HOUSE_LAB_ID ?? "6916a972d135664464b853b9"
});
