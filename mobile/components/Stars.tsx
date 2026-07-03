import { Pressable, Text, View } from "react-native";

interface StarsProps {
  value: number;
  onSelect?: (v: number) => void;
  size?: number;
}

export function Stars({ value, onSelect, size = 18 }: StarsProps) {
  return (
    <View style={{ flexDirection: "row", gap: 2 }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Pressable
          key={star}
          disabled={!onSelect}
          onPress={() => onSelect?.(star)}
          hitSlop={6}
          accessibilityRole={onSelect ? "button" : undefined}
          accessibilityLabel={onSelect ? `${star} stelle` : undefined}
        >
          <Text style={{ fontSize: size, color: star <= value ? "#EAB308" : "#D6D3D1" }}>
            ★
          </Text>
        </Pressable>
      ))}
    </View>
  );
}
