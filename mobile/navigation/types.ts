import type { NativeStackScreenProps } from "@react-navigation/native-stack";

export type RootStackParamList = {
  Tabs: undefined;
  BenchDetail: { id: number };
};

export type BenchDetailProps = NativeStackScreenProps<RootStackParamList, "BenchDetail">;
