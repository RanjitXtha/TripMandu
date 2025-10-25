

interface PlanFormDestination {
  id: number;
  order: number;
  date?: Date;
 }
export const mapOrderToId = (
  destinations: any[],
  orderData: number[]
): PlanFormDestination[] => {
   console.log("Orde", orderData)
  return orderData
    .filter((index) => index >= 0 && index < destinations.length)
    .map((destIndex, idx) => ({
      id: destinations[destIndex].id,
      order: idx + 1,
      date: new Date(),
    }));
};