import React from "react";
import { useQuery } from "@tanstack/react-query";
import { getAllMaladies } from "@/lib/api/maladies.api";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from "react-native";
import {
  User,
  Calendar,
  Bell,
  Settings,
  Clock,
  Users,
  Thermometer,
} from "lucide-react-native";
import { getAllPatients } from "@/lib/api/patients.api";

const getCurrentGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Bonjour";
  if (hour < 18) return "Bon après-midi";
  return "Bonsoir";
};

const getCurrentDate = () => {
  const today = new Date();
  return today.toLocaleDateString("fr-FR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};
const DoctorGreetingScreen = () => {
  const { data: patientsData } = useQuery({
    queryKey: ["all-patients"],
    queryFn: getAllPatients,
  });
  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
      <ScrollView className="flex-1 bg-slate-50">
        {/* Header */}
        <View className="flex-row justify-between items-center pt-14 pb-6 px-6 bg-white">
          <View className="flex-row items-center">
            <View className="w-14 h-14 bg-blue-100 rounded-full items-center justify-center">
              <User size={28} color="#3B82F6" />
            </View>
            <View className="ml-4">
              <Text className="text-xl font-bold text-gray-900">
                Dr. Abdelmoumni
              </Text>
              <Text className="text-sm text-gray-600">Médecin généraliste</Text>
            </View>
          </View>
        </View>

        {/* Greeting Section */}
        <View className="px-6 py-8 bg-white mb-4">
          <Text className="text-3xl font-bold text-gray-900 mb-2">
            {getCurrentGreeting()}, Docteur ! 👋
          </Text>
          <Text className="text-base text-gray-700 mb-1 capitalize">
            {getCurrentDate()}
          </Text>
          <Text className="text-sm text-gray-500">
            Prêt pour une nouvelle journée de soins ?
          </Text>
        </View>

        {/* Stats Cards */}
        <View className="px-6 mb-6">
          <View className="flex-row space-x-4">
            <View className="flex-1 bg-white rounded-2xl p-6 shadow-sm">
              <View className="flex-row items-center justify-between mb-3">
                <Text className="text-sm font-semibold text-gray-600">
                  Aujourd'hui
                </Text>
                <View className="w-10 h-10 bg-emerald-100 rounded-full items-center justify-center">
                  <Calendar size={20} color="#10B981" />
                </View>
              </View>
              <Text className="text-3xl font-bold text-gray-900 mb-1">
                {patientsData?.length}
              </Text>
              <Text className="text-xs text-gray-500">Patients</Text>
            </View>

            <View className="flex-1 bg-white rounded-2xl p-6 shadow-sm">
              <View className="flex-row items-center justify-between mb-3">
                <Text className="text-sm font-semibold text-gray-600">
                  En attente
                </Text>
                <View className="w-10 h-10 bg-amber-100 rounded-full items-center justify-center">
                  <Clock size={20} color="#F59E0B" />
                </View>
              </View>
              <Text className="text-3xl font-bold text-gray-900 mb-1">3</Text>
              <Text className="text-xs text-gray-500">Patients</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View className="px-6">
          <Text className="text-xl font-bold text-gray-900 mb-5">
            Actions rapides
          </Text>

          <View className="gap-y-3">
            <TouchableOpacity
              className="bg-white rounded-2xl p-5 flex-row items-center shadow-sm border border-gray-100"
              activeOpacity={0.7}
            >
              <View className="w-14 h-14 bg-indigo-100 rounded-2xl items-center justify-center mr-4">
                <Users size={28} color="#6366F1" />
              </View>
              <View className="flex-1">
                <Text className="text-lg font-semibold text-gray-900 mb-1">
                  Liste des patients
                </Text>
                <Text className="text-sm text-gray-500">
                  Consulter tous les dossiers patients
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              className="bg-white rounded-2xl p-5 flex-row items-center shadow-sm border border-gray-100"
              activeOpacity={0.7}
            >
              <View className="w-14 h-14 bg-red-100 rounded-2xl items-center justify-center mr-4">
                <Thermometer size={28} color="#f56565" />
              </View>
              <View className="flex-1">
                <Text className="text-lg font-semibold text-gray-900 mb-1">
                  Liste des maladies
                </Text>
                <Text className="text-sm text-gray-500">
                  Consulter tous les maladies
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Bottom spacing for scroll */}
        <View className="h-8" />
      </ScrollView>
    </>
  );
};

export default DoctorGreetingScreen;
