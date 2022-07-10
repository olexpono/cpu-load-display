const currentTime = ref(new Date());
setInterval(() => {
  currentTime.value = new Date();
}, 5000)

export const useCurrentSecond = () => {
  return currentTime;
}