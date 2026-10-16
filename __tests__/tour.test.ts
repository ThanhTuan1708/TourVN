import { describe, expect, it } from '@jest/globals';
import { formatDate, getSeatLabel, groupByCity } from '../utils/tour';
import type { Tour } from '../utils/tour';

const tours: Tour[] = [
  {
    id: '1',
    name: 'Tour Huế',
    city: 'Huế',
    days: 3,
    price: 1500000,
    seats: 4,
    departure: '2026-12-01',
    image: 'https://example.com/hue.jpg',
    isFavorite: false,
  },
  {
    id: '2',
    name: 'Tour sớm Hà Nội',
    city: 'Hà Nội',
    days: 2,
    price: 1200000,
    seats: 3,
    departure: '2026-11-05',
    image: 'https://example.com/ha-noi.jpg',
    isFavorite: true,
  },
  {
    id: '3',
    name: 'Tour muộn Hà Nội',
    city: 'Hà Nội',
    days: 4,
    price: 2300000,
    seats: 0,
    departure: '2026-11-20',
    image: 'https://example.com/ha-noi-2.jpg',
    isFavorite: false,
  },
];

describe('tour utilities', () => {
  it('groups tours by city and sorts cities and departures', () => {
    const sections = groupByCity(tours);

    expect(sections).toHaveLength(2);
    expect(sections.map((section) => section.title)).toEqual(['Hà Nội', 'Huế']);
    expect(sections[0].data.map((tour) => tour.departure)).toEqual([
      '2026-11-05',
      '2026-11-20',
    ]);
  });

  it('formats ISO dates as dd/MM/yyyy', () => {
    expect(formatDate('2026-11-05')).toBe('05/11/2026');
  });

  it('returns the correct seat labels at the boundaries', () => {
    expect(getSeatLabel(0)).toBe('Hết chỗ');
    expect(getSeatLabel(3)).toBe('Chỉ còn 3 chỗ');
    expect(getSeatLabel(4)).toBe('Còn 4 chỗ');
  });
});
