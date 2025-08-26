import { useState } from "react";
import { Dimensions, View, ScrollView } from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { LineChart } from "react-native-chart-kit";
import { patientsInrRecordsTable } from "@/db/schema";
import { Text } from "./text";
import { Button } from "./button";

interface Props {
  records: (typeof patientsInrRecordsTable.$inferInsert)[];
  unit: string;
  minA: number;
  maxB: number;
}

export const ChartRecords = ({ unit, records, minA, maxB }: Props) => {
  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);
  const [showPicker, setShowPicker] = useState<{
    visible: boolean;
    mode: "from" | "to";
  }>({ visible: false, mode: "from" });

  if (!records?.length) {
    return (
      <View className="flex-1 justify-center items-center p-4">
        <Text className="text-gray-500 text-lg">
          Aucun enregistrement disponible
        </Text>
      </View>
    );
  }

  const sortedRecords = [...records].sort(
    (a, b) =>
      new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime(),
  );

  const filteredRecords = sortedRecords.filter((r) => {
    const date = new Date(r.recorded_at);
    if (fromDate && date < fromDate) return false;
    if (toDate && date > toDate) return false;
    return true;
  });

  const total = filteredRecords.length;
  const data = filteredRecords.map((r) => r.value);

  const maxLabels = 6;
  const step = total <= maxLabels ? 1 : Math.ceil(total / maxLabels);
  const labels = filteredRecords.map((r, i) =>
    i % step === 0
      ? new Date(r.recorded_at).toLocaleDateString("fr-FR", {
          month: "short",
          day: "numeric",
        })
      : "",
  );

  const min = Math.min(...data, minA);
  const max = Math.max(...data, maxB);
  const range = max - min || 1;
  let yStep;
  if (range <= 5) yStep = 0.5;
  else if (range <= 10) yStep = 1;
  else yStep = Math.ceil(range / 5);

  const exceededCount = data.filter((v) => v < minA || v > maxB).length;
  const inRangeCount = total - exceededCount;

  // ----------------------
  // Rosendaal-style TTR calculation
  // ----------------------
  let daysInRange = 0;
  let totalDays = 0;

  for (let i = 1; i < filteredRecords.length; i++) {
    const prev = filteredRecords[i - 1];
    const curr = filteredRecords[i];

    const prevDate = new Date(prev.recorded_at).getTime();
    const currDate = new Date(curr.recorded_at).getTime();
    const intervalDays = (currDate - prevDate) / (1000 * 60 * 60 * 24);

    if (intervalDays <= 0) continue;
    totalDays += intervalDays;

    const prevVal = prev.value;
    const currVal = curr.value;

    // Case 1: Both INRs in range
    if (
      prevVal >= minA &&
      prevVal <= maxB &&
      currVal >= minA &&
      currVal <= maxB
    ) {
      daysInRange += intervalDays;
    }
    // Case 2: Cross both bounds (below minA to above maxB or vice versa)
    else if (
      (prevVal < minA && currVal > maxB) ||
      (prevVal > maxB && currVal < minA)
    ) {
      daysInRange +=
        intervalDays * ((maxB - minA) / Math.abs(currVal - prevVal));
    }
    // Case 3: One inside, one below min
    else if (
      (prevVal < minA && currVal >= minA && currVal <= maxB) ||
      (currVal < minA && prevVal >= minA && prevVal <= maxB)
    ) {
      const frac =
        (minA - Math.min(prevVal, currVal)) / Math.abs(currVal - prevVal);
      daysInRange += intervalDays * (1 - frac);
    }
    // Case 4: One inside, one above max
    else if (
      (prevVal > maxB && currVal >= minA && currVal <= maxB) ||
      (currVal > maxB && prevVal >= minA && prevVal <= maxB)
    ) {
      const frac =
        (Math.max(prevVal, currVal) - maxB) / Math.abs(currVal - prevVal);
      daysInRange += intervalDays * (1 - frac);
    }
    // Case 5: Entirely outside → contributes nothing
  }

  const ttr = totalDays > 0 ? daysInRange / totalDays : 0;

  return (
    <View className="w-screen ">
      <ScrollView className=" bg-gray-50">
        {/* Date Range Pickers */}
        <View className="flex-row justify-center gap-x-2  mb-4">
          <Button
            className="mr-2 "
            onPress={() => setShowPicker({ visible: true, mode: "from" })}
          >
            <Text className="text-white font-medium">
              De: {fromDate ? fromDate.toLocaleDateString() : "Début"}
            </Text>
          </Button>
          <Button
            className="ml-2 "
            onPress={() => setShowPicker({ visible: true, mode: "to" })}
          >
            <Text className="text-white font-medium">
              À: {toDate ? toDate.toLocaleDateString() : "Fin"}
            </Text>
          </Button>
        </View>

        <DateTimePickerModal
          isVisible={showPicker.visible}
          mode="date"
          onConfirm={(date) => {
            if (showPicker.mode === "from") setFromDate(date);
            else setToDate(date);
            setShowPicker({ visible: false, mode: showPicker.mode });
          }}
          onCancel={() =>
            setShowPicker({ visible: false, mode: showPicker.mode })
          }
        />

        {/* Chart Card */}
        <View className="bg-white rounded-xl px-2 shadow mb-4">
          <Text className="text-lg font-semibold mb-2 text-gray-700">
            Enregistrements INR
          </Text>
          <LineChart
            data={{
              labels,
              datasets: [
                {
                  data,
                  color: () => "#4ade80",
                  strokeWidth: 2,
                  withDots: true,
                },
                {
                  data: Array(total).fill(minA),
                  color: () => "#ef4444",
                  strokeWidth: 2,
                },
                {
                  data: Array(total).fill(maxB),
                  color: () => "#ef4444",
                  strokeWidth: 2,
                },
              ],
              legend: ["Enregistrements du patient"],
            }}
            width={Dimensions.get("window").width - 48}
            height={240}
            fromZero={false}
            yAxisSuffix={" " + unit}
            yAxisInterval={yStep}
            chartConfig={{
              backgroundGradientFrom: "#f3f4f6",
              backgroundGradientTo: "#e5e7eb",
              decimalPlaces: yStep < 1 ? 1 : 0,
              color: (opacity = 1) => `rgba(34, 34, 34, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(55, 65, 81, ${opacity})`,
              style: { borderRadius: 16 },
            }}
            bezier
            style={{ borderRadius: 16 }}
          />
        </View>

        {/* Stats Card */}
        <View className="bg-white rounded-xl mx-2 p-2 ">
          <Text className="text-lg font-semibold mb-3 text-gray-700">
            Statistiques
          </Text>
          <View className="flex-row justify-between  mb-2">
            <Text className="text-gray-600">Total des enregistrements :</Text>
            <Text className="font-medium text-gray-800">{total}</Text>
          </View>
          <View className="flex-row justify-between mb-2 ">
            <Text className="text-gray-600">
              Jours approximatifs dans la plage :
            </Text>
            <Text className="font-medium text-gray-800">
              {Math.round(daysInRange)}
            </Text>
          </View>
          <View className="flex-row justify-between ">
            <Text className="text-gray-600">TTR :</Text>
            <Text className="font-medium text-gray-800">
              {(ttr * 100).toFixed(1)}%
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};
