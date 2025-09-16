import { patientsInrRecordsTable } from "@/db/schema";
import { useState } from "react";
import { Dimensions, View } from "react-native";
import { LineChart } from "react-native-chart-kit";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { Button } from "./button";
import { Text } from "./text";

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
      <View className="flex-1 gap-2 justify-center items-center p-4">
        <Text className="text-muted-foreground font-outfitSemibold text-lg">
          Aucun enregistrement disponible
        </Text>
      </View>
    );
  }

  const sortedRecords = [...records].sort(
    (a, b) =>
      new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime()
  );

  const filteredRecords = sortedRecords.filter((r) => {
    const date = new Date(r.recorded_at);
    if (fromDate && date < fromDate) return false;
    if (toDate && date > toDate) return false;
    return true;
  });

  const total = filteredRecords.length;
  if (!total) {
    return (
      <View className="flex-1 gap-2 justify-center items-center p-4">
        <Text className="text-muted-foreground text-center font-outfitSemibold text-lg">
          Aucun enregistrement trouvé dans cette période
        </Text>
        <Button
          onPress={() => {
            setToDate(null);
            setFromDate(null);
          }}
        >
          <Text className="font-outfitSemibold">Réinitialiser le filtre</Text>
        </Button>
      </View>
    );
  }

  // ----------------------
  // Dynamic X axis labels (time-based)
  // ----------------------
  const startDate = fromDate ?? new Date(filteredRecords[0].recorded_at);
  const endDate =
    toDate ?? new Date(filteredRecords[filteredRecords.length - 1].recorded_at);
  const totalDays = Math.max(
    1,
    Math.round(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    )
  );

  const maxLabels = 6;
  const stepDays = Math.ceil(totalDays / (maxLabels - 1));

  const labelDates: Date[] = [];
  for (let i = 0; i < maxLabels; i++) {
    labelDates.push(
      new Date(startDate.getTime() + i * stepDays * 24 * 60 * 60 * 1000)
    );
  }

  // const labels = labelDates.map((d) =>
  //   d.toLocaleDateString("fr-FR", {
  //     month: "2-digit",
  //     day: "2-digit",
  //   }),
  // );

  const labels = filteredRecords.map((r) =>
    new Date(r.recorded_at).toLocaleDateString("fr-FR", {
      month: "2-digit",
      day: "2-digit",
    })
  );

  const data = filteredRecords.map((r) => r.value);
  // Match data to nearest label date
  // const data: number[] = [];
  // for (let i = 0; i < labelDates.length; i++) {
  //   const closest = filteredRecords.reduce((prev, curr) => {
  //     const diffPrev = Math.abs(
  //       new Date(prev.recorded_at).getTime() - labelDates[i].getTime(),
  //     );
  //     const diffCurr = Math.abs(
  //       new Date(curr.recorded_at).getTime() - labelDates[i].getTime(),
  //     );
  //     return diffCurr < diffPrev ? curr : prev;
  //   });
  //   data.push(closest.value);
  // }

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
  let totalDaysForTTR = 0;

  for (let i = 1; i < filteredRecords.length; i++) {
    const prev = filteredRecords[i - 1];
    const curr = filteredRecords[i];

    const prevDate = new Date(prev.recorded_at).getTime();
    const currDate = new Date(curr.recorded_at).getTime();
    const intervalDays = (currDate - prevDate) / (1000 * 60 * 60 * 24);

    if (intervalDays <= 0) continue;
    totalDaysForTTR += intervalDays;

    const prevVal = prev.value;
    const currVal = curr.value;

    if (
      prevVal >= minA &&
      prevVal <= maxB &&
      currVal >= minA &&
      currVal <= maxB
    ) {
      daysInRange += intervalDays;
    } else if (
      (prevVal < minA && currVal > maxB) ||
      (prevVal > maxB && currVal < minA)
    ) {
      daysInRange +=
        intervalDays * ((maxB - minA) / Math.abs(currVal - prevVal));
    } else if (
      (prevVal < minA && currVal >= minA && currVal <= maxB) ||
      (currVal < minA && prevVal >= minA && prevVal <= maxB)
    ) {
      const frac =
        (minA - Math.min(prevVal, currVal)) / Math.abs(currVal - prevVal);
      daysInRange += intervalDays * (1 - frac);
    } else if (
      (prevVal > maxB && currVal >= minA && currVal <= maxB) ||
      (currVal > maxB && prevVal >= minA && prevVal <= maxB)
    ) {
      const frac =
        (Math.max(prevVal, currVal) - maxB) / Math.abs(currVal - prevVal);
      daysInRange += intervalDays * (1 - frac);
    }
  }

  const ttr = totalDaysForTTR > 0 ? daysInRange / totalDaysForTTR : 0;

  return (
    <View className="bg-background pb-4">
      <View className="w-screen  ">
        <View className="">
          {/* Date Range Pickers */}

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
          <View className="bg-white flex items-center  rounded-xl px-2  mb-4">
            <Text className="text-lg font-outfitSemibold mb-2 text-gray-700">
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
                    data: Array(labels.length).fill(minA),
                    color: () => "#ef4444",
                    strokeWidth: 2,
                  },
                  {
                    data: Array(labels.length).fill(maxB),
                    color: () => "#ef4444",
                    strokeWidth: 2,
                  },
                ],
                legend: ["Enregistrements du patient"],
              }}
              width={Dimensions.get("window").width - 40}
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
              style={{ borderRadius: 16 }}
            />
          </View>

          <View className="flex-row justify-center gap-x-2  mb-4">
            <Button
              className="mr-2 bg-primary active:bg-primary/50 "
              onPress={() => setShowPicker({ visible: true, mode: "from" })}
            >
              <Text className="text-white font-outfitRegular">
                De: {fromDate ? fromDate.toLocaleDateString() : "Début"}
              </Text>
            </Button>
            <Button
              className="ml-2 bg-primary active:bg-primary/50 "
              onPress={() => setShowPicker({ visible: true, mode: "to" })}
            >
              <Text className="text-white font-outfitRegular">
                À: {toDate ? toDate.toLocaleDateString() : "Fin"}
              </Text>
            </Button>
          </View>
          {/* Stats Card */}
          <View className="bg-white rounded-xl mx-2 p-2 ">
            <Text className="text-lg font-outfitSemibold mb-3 text-gray-700">
              Statistiques
            </Text>
            <View className="flex-row justify-between  mb-2">
              <Text className="text-muted-foreground font-outfitSemibold ">
                Total des enregistrements :
              </Text>
              <Text className="font-outfitRegular text-gray-800">{total}</Text>
            </View>
            <View className="flex-row justify-between mb-2 ">
              <Text className="text-muted-foreground font-outfitSemibold ">
                Jours approximatifs dans la plage :
              </Text>
              <Text className="font-outfitRegular text-gray-800">
                {daysInRange.toFixed(2)}
              </Text>
            </View>
            <View className="flex-row justify-between ">
              <Text className="text-primary font-outfitSemibold ">
                TTR ({Math.floor(totalDaysForTTR)} jours) :
              </Text>
              <Text className="font-outfitSemibold text-primary ">
                {(ttr * 100).toFixed(1)}%
              </Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};
