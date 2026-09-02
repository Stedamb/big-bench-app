import { ActivityIndicator, Platform, StyleSheet, Text, View } from "react-native";
import MapView from "react-native-map-clustering";
import { Marker, UrlTile } from "react-native-maps";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { BenchPin } from "../components/BenchPin";
import { useBenches } from "../lib/useBenches";
import { colors } from "../lib/theme";
import type { RootStackParamList } from "../navigation/types";

// Rough bounding region covering the Italian bench dataset. Dynamic
// FitBounds-equivalent viewport fitting is roadmap phase 1.
const INITIAL_REGION = {
  latitude: 44.5,
  longitude: 10.5,
  latitudeDelta: 6,
  longitudeDelta: 6,
};

// CARTO basemaps require an API key as of 2026 (free tier: 5M tiles/month);
// unauthenticated tiles render with an "API KEY REQUIRED" watermark.
const CARTO_TILE_URL = (() => {
  const key = process.env.EXPO_PUBLIC_CARTO_API_KEY;
  const base = "https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png";
  return key ? `${base}?key=${key}` : base;
})();

export default function MapScreen() {
  const { data: benches = [], isLoading, error } = useBenches();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.statusText}>Caricamento panchine…</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>
          Errore di caricamento: {error instanceof Error ? error.message : String(error)}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={INITIAL_REGION}
        clusterColor={colors.primary}
        clusterTextColor="#ffffff"
        radius={50}
        // "none" (Android-only value) drops the Google base map so only the
        // UrlTile layer renders; on iOS, shouldReplaceMapContent handles it.
        mapType={Platform.OS === "android" ? ("none" as never) : "standard"}
        rotateEnabled={false}
      >
        {/* Same CARTO raster tiles the web app uses (BenchMap.tsx LightTileLayer).
            mapType="none" + UrlTile bypasses Google's tile backend entirely, so
            the map works in Expo Go on Android, which ships no Google Maps API
            key since SDK 53. A store build should switch to native tiles with a
            real API key (roadmap phase 1). */}
        <UrlTile
          urlTemplate={CARTO_TILE_URL}
          maximumZ={19}
          shouldReplaceMapContent
        />
        {benches.map((bench) => (
          <Marker
            key={bench.id}
            coordinate={{ latitude: bench.lat, longitude: bench.lng }}
            title={bench.name}
            description={bench.location}
            tracksViewChanges={false}
            onCalloutPress={() => navigation.navigate("BenchDetail", { id: bench.id })}
          >
            <BenchPin colors={bench.colors} />
          </Marker>
        ))}
      </MapView>
      <View style={styles.countBadge}>
        <Text style={styles.countText}>{benches.length} panchine</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 8 },
  statusText: { color: colors.mutedText },
  errorText: { color: colors.danger, paddingHorizontal: 24, textAlign: "center" },
  countBadge: {
    position: "absolute",
    top: 56,
    alignSelf: "center",
    backgroundColor: "rgba(0,0,0,0.75)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  countText: { color: "white", fontWeight: "600" },
});
