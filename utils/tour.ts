import type { Tour } from '../components/TourItem';

export type { Tour } from '../components/TourItem';

export interface TourSection {
  title: string;
  data: Tour[];
}

export function groupByCity(tours: Tour[]): TourSection[] {
  const groupedTours = new Map<string, Tour[]>();

  tours.forEach((tour) => {
    const cityTours = groupedTours.get(tour.city) ?? [];
    cityTours.push(tour);
    groupedTours.set(tour.city, cityTours);
  });

  return Array.from(groupedTours.entries())
    .sort(([cityA], [cityB]) => cityA.localeCompare(cityB, 'vi'))
    .map(([title, data]) => ({
      title,
      data: [...data].sort((tourA, tourB) =>
        tourA.departure.localeCompare(tourB.departure)
      ),
    }));
}

export function formatDate(date: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  if (!match) {
    return date;
  }
  return `${match[3]}/${match[2]}/${match[1]}`;
}

export function getSeatLabel(seats: number): string {
  if (seats <= 0) {
    return 'Hết chỗ';
  }
  if (seats <= 3) {
    return `Chỉ còn ${seats} chỗ`;
  }
  return `Còn ${seats} chỗ`;
}
