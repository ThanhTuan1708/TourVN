import React from 'react';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { fireEvent, render } from '@testing-library/react-native';
import TourItem from '../components/TourItem';
import type { Tour } from '../utils/tour';

const tour: Tour = {
  id: 'tour-1',
  name: 'Đà Lạt mộng mơ',
  city: 'Đà Lạt',
  days: 3,
  price: 3590000,
  seats: 2,
  departure: '2026-11-05',
  image: 'https://example.com/da-lat.jpg',
  isFavorite: false,
};

describe('TourItem', () => {
  const onPress = jest.fn();
  const onToggleFavorite = jest.fn();

  beforeEach(() => {
    onPress.mockClear();
    onToggleFavorite.mockClear();
  });

  it('hides the city in compact mode and shows it in regular mode', async () => {
    const compactItem = await render(
      <TourItem
        tour={tour}
        compact
        onPress={onPress}
        onToggleFavorite={onToggleFavorite}
      />
    );
    expect(compactItem.queryByText('Đà Lạt')).toBeNull();
    await compactItem.unmount();

    const regularItem = await render(
      <TourItem
        tour={tour}
        onPress={onPress}
        onToggleFavorite={onToggleFavorite}
      />
    );
    expect(regularItem.getByText('Đà Lạt')).toBeTruthy();
  });

  it('toggles a favorite without pressing the tour card', async () => {
    const { getByTestId } = await render(
      <TourItem
        tour={tour}
        onPress={onPress}
        onToggleFavorite={onToggleFavorite}
      />
    );

    await fireEvent.press(getByTestId('fav-btn'));

    expect(onToggleFavorite).toHaveBeenCalledTimes(1);
    expect(onToggleFavorite).toHaveBeenCalledWith('tour-1', true);
    expect(onPress).not.toHaveBeenCalled();
  });

  it('pressing the tour calls onPress with the full tour object', async () => {
    const { getByText } = await render(
      <TourItem
        tour={tour}
        onPress={onPress}
        onToggleFavorite={onToggleFavorite}
      />
    );

    await fireEvent.press(getByText(tour.name));

    expect(onPress).toHaveBeenCalledWith(tour);
  });
});
