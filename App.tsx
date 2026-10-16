import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  SectionList,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import TourItem from './components/TourItem';
import { formatDate, groupByCity } from './utils/tour';
import type { Tour } from './utils/tour';

const API_URL = 'https://6ac9d13f3115bcc95820035e.mockapi.io/tours';
const STUDENT_NAME = 'NguyenThanhTuan';
const STUDENT_ID = '23636711';

function formatPrice(price: number) {
  return `${new Intl.NumberFormat('vi-VN').format(price)} ₫`;
}

function isTour(value: unknown): value is Tour {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const tour = value as Record<string, unknown>;
  return (
    typeof tour.id === 'string' &&
    typeof tour.name === 'string' &&
    typeof tour.city === 'string' &&
    typeof tour.days === 'number' &&
    Number.isFinite(tour.days) &&
    typeof tour.price === 'number' &&
    Number.isFinite(tour.price) &&
    typeof tour.seats === 'number' &&
    Number.isFinite(tour.seats) &&
    typeof tour.departure === 'string' &&
    /^\d{4}-\d{2}-\d{2}$/.test(tour.departure) &&
    typeof tour.image === 'string' &&
    typeof tour.isFavorite === 'boolean'
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <TourScreen />
    </SafeAreaProvider>
  );
}

function TourScreen() {
  const [tours, setTours] = useState<Tour[]>([]);
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const pendingFavoriteUpdates = useRef(new Set<string>());

  const fetchTours = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setLoadError(null);

    try {
      const response = await fetch(`${API_URL}?page=1&limit=12`);
      if (!response.ok) {
        throw new Error(`Máy chủ trả về mã lỗi ${response.status}.`);
      }

      const data: unknown = await response.json();
      if (!Array.isArray(data) || !data.every(isTour)) {
        throw new Error('Dữ liệu tour từ máy chủ không hợp lệ.');
      }
      setTours(data);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Đã xảy ra lỗi không xác định.';
      setLoadError(message);
      Alert.alert('Không thể tải tour', message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void fetchTours();
  }, [fetchTours]);

  const filteredTours = useMemo(() => {
    const query = searchText.trim().toLocaleLowerCase();
    if (!query) {
      return tours;
    }
    return tours.filter((tour) => tour.name.toLocaleLowerCase().includes(query));
  }, [searchText, tours]);

  const sections = useMemo(() => groupByCity(filteredTours), [filteredTours]);
  const favoriteTours = useMemo(
    () => tours.filter((tour) => tour.isFavorite),
    [tours]
  );

  const handlePressTour = useCallback((tour: Tour) => {
    Alert.alert(
      tour.name,
      `Ngày khởi hành: ${formatDate(tour.departure)}\nSố ngày: ${tour.days} ngày\nGiá: ${formatPrice(tour.price)}`
    );
  }, []);

  const handleToggleFavorite = useCallback(
    async (id: string, next: boolean) => {
      if (pendingFavoriteUpdates.current.has(id)) {
        return;
      }

      const previousTour = tours.find((tour) => tour.id === id);
      if (!previousTour) {
        return;
      }

      pendingFavoriteUpdates.current.add(id);
      setTours((previousTours) =>
        previousTours.map((tour) =>
          tour.id === id ? { ...tour, isFavorite: next } : tour
        )
      );

      try {
        const response = await fetch(`${API_URL}/${encodeURIComponent(id)}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isFavorite: next }),
        });
        if (!response.ok) {
          throw new Error(`Máy chủ trả về mã lỗi ${response.status}.`);
        }
      } catch (error) {
        setTours((previousTours) =>
          previousTours.map((tour) =>
            tour.id === id
              ? { ...tour, isFavorite: previousTour.isFavorite }
              : tour
          )
        );
        const message =
          error instanceof Error ? error.message : 'Đã xảy ra lỗi không xác định.';
        Alert.alert('Không thể cập nhật yêu thích', message);
      } finally {
        pendingFavoriteUpdates.current.delete(id);
      }
    },
    [tours]
  );

  const renderTour = useCallback(
    ({ item }: { item: Tour }) => (
      <TourItem
        tour={item}
        onPress={handlePressTour}
        onToggleFavorite={handleToggleFavorite}
      />
    ),
    [handlePressTour, handleToggleFavorite]
  );

  const renderSectionHeader = useCallback(
    ({ section }: { section: { title: string; data: Tour[] } }) => (
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          {section.title} · {section.data.length} tour
        </Text>
      </View>
    ),
    []
  );

  const renderFavoritesHeader = useCallback(
    () => (
      <View style={styles.favoritesSection}>
        <Text style={styles.favoritesTitle}>
          Tour yêu thích ({favoriteTours.length})
        </Text>
        {favoriteTours.length === 0 ? (
          <Text style={styles.emptyFavorites}>Chưa có tour yêu thích</Text>
        ) : (
          <FlatList
            horizontal
            data={favoriteTours}
            keyExtractor={(tour) => tour.id}
            renderItem={({ item }) => (
              <TourItem
                tour={item}
                compact
                onPress={handlePressTour}
                onToggleFavorite={handleToggleFavorite}
              />
            )}
            ItemSeparatorComponent={() => <View style={styles.favoriteSeparator} />}
            showsHorizontalScrollIndicator={false}
          />
        )}
      </View>
    ),
    [favoriteTours, handlePressTour, handleToggleFavorite]
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#173b55" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Tour Việt</Text>
        <Text style={styles.studentInfo}>
          {STUDENT_ID} – {STUDENT_NAME}
        </Text>
        <TextInput
          value={searchText}
          onChangeText={setSearchText}
          placeholder="Tìm tour theo tên..."
          placeholderTextColor="#718096"
          style={styles.searchInput}
          accessibilityLabel="Tìm tour theo tên"
          returnKeyType="search"
        />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1f6f78" />
          <Text style={styles.loadingText}>Đang tải danh sách tour...</Text>
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          renderItem={renderTour}
          renderSectionHeader={renderSectionHeader}
          ListHeaderComponent={renderFavoritesHeader}
          ListEmptyComponent={
            <Text style={styles.emptyList}>
              {loadError ?? 'Không tìm thấy tour phù hợp'}
            </Text>
          }
          stickySectionHeadersEnabled
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => void fetchTours(true)}
              colors={['#1f6f78']}
              tintColor="#1f6f78"
            />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f4f7f7',
  },
  header: {
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 16,
    backgroundColor: '#173b55',
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 25,
    fontWeight: '800',
  },
  studentInfo: {
    marginTop: 4,
    marginBottom: 14,
    color: '#d7e7ed',
    fontSize: 13,
  },
  searchInput: {
    height: 44,
    borderRadius: 12,
    paddingHorizontal: 14,
    backgroundColor: '#ffffff',
    color: '#172b3a',
    fontSize: 15,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#536775',
    fontSize: 15,
  },
  listContent: {
    flexGrow: 1,
    paddingBottom: 24,
  },
  favoritesSection: {
    paddingTop: 18,
    paddingBottom: 16,
    backgroundColor: '#f4f7f7',
  },
  favoritesTitle: {
    marginHorizontal: 16,
    marginBottom: 12,
    color: '#173b55',
    fontSize: 19,
    fontWeight: '700',
  },
  emptyFavorites: {
    marginHorizontal: 16,
    color: '#6b7d86',
  },
  favoriteSeparator: {
    width: 12,
  },
  sectionHeader: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#e4eeee',
  },
  sectionTitle: {
    color: '#234c59',
    fontSize: 16,
    fontWeight: '700',
  },
  emptyList: {
    padding: 24,
    color: '#667781',
    textAlign: 'center',
    fontSize: 15,
  },
});
