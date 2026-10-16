import React from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { formatDate, getSeatLabel } from '../utils/tour';

export interface Tour {
  id: string;
  name: string;
  city: string;
  days: number;
  price: number;
  seats: number;
  departure: string;
  image: string;
  isFavorite: boolean;
}

export interface TourItemProps {
  tour: Tour;
  compact?: boolean;
  onPress: (tour: Tour) => void;
  onToggleFavorite: (id: string, next: boolean) => void;
}

function formatPrice(price: number) {
  return `${new Intl.NumberFormat('vi-VN').format(price)} ₫`;
}

function TourItem({
  tour,
  compact = false,
  onPress,
  onToggleFavorite,
}: TourItemProps) {
  const seatLabel = getSeatLabel(tour.seats);

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => onPress(tour)}
      style={[styles.card, compact ? styles.compactCard : styles.regularCard]}
      accessibilityRole="button"
    >
      <View
        style={[
          styles.imageContainer,
          compact ? styles.compactImageContainer : styles.regularImageContainer,
        ]}
      >
        <Image
          source={{ uri: tour.image }}
          style={[styles.image, compact ? styles.compactImage : styles.regularImage]}
          resizeMode="cover"
          accessibilityLabel={tour.name}
        />
        <TouchableOpacity
          testID="fav-btn"
          accessibilityRole="button"
          accessibilityLabel={
            tour.isFavorite ? 'Bỏ tour khỏi yêu thích' : 'Thêm tour vào yêu thích'
          }
          onPress={(event) => {
            event.stopPropagation();
            onToggleFavorite(tour.id, !tour.isFavorite);
          }}
          style={[styles.favoriteButton, compact && styles.compactFavoriteButton]}
          hitSlop={8}
        >
          <Text style={styles.favoriteIcon}>{tour.isFavorite ? '♥' : '♡'}</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.info, compact && styles.compactInfo]}>
        <Text style={[styles.name, compact && styles.compactName]} numberOfLines={1}>
          {tour.name}
        </Text>
        <Text style={styles.price}>{formatPrice(tour.price)}</Text>
        {!compact && (
          <>
            <Text style={styles.city}>{tour.city}</Text>
            <Text style={styles.details}>
              📅 {formatDate(tour.departure)} · {tour.days} ngày
            </Text>
            <Text
              style={[styles.seats, tour.seats <= 3 && styles.lowSeats]}
              numberOfLines={1}
            >
              {seatLabel}
            </Text>
          </>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
    borderRadius: 14,
    backgroundColor: '#ffffff',
    elevation: 2,
    shadowColor: '#173b55',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  regularCard: {
    flexDirection: 'row',
    minHeight: 110,
    marginHorizontal: 12,
    marginBottom: 12,
  },
  compactCard: {
    width: 160,
  },
  imageContainer: {
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#dce7e9',
  },
  regularImageContainer: {
    width: 90,
    height: 90,
    alignSelf: 'center',
    marginLeft: 10,
    borderRadius: 10,
  },
  compactImageContainer: {
    width: '100%',
    aspectRatio: 4 / 3,
  },
  image: {
    backgroundColor: '#dce7e9',
  },
  regularImage: {
    width: 90,
    height: 90,
  },
  compactImage: {
    width: '100%',
    height: '100%',
  },
  favoriteButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    minWidth: 34,
    minHeight: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.94)',
  },
  compactFavoriteButton: {
    top: 8,
    right: 8,
  },
  favoriteIcon: {
    color: '#d84c5c',
    fontSize: 23,
    fontWeight: '700',
    lineHeight: 26,
  },
  info: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  compactInfo: {
    paddingHorizontal: 10,
    paddingVertical: 9,
  },
  name: {
    color: '#1c3544',
    fontSize: 15,
    fontWeight: '700',
  },
  compactName: {
    fontSize: 14,
  },
  price: {
    marginTop: 4,
    color: '#1f6f78',
    fontSize: 14,
    fontWeight: '700',
  },
  city: {
    marginTop: 4,
    color: '#536975',
    fontSize: 13,
  },
  details: {
    marginTop: 3,
    color: '#536975',
    fontSize: 12,
  },
  seats: {
    marginTop: 4,
    color: '#3b5964',
    fontSize: 12,
    fontWeight: '600',
  },
  lowSeats: {
    color: '#d32f2f',
  },
});

export default React.memo(TourItem);
