import { ScrollView, Text, View, TouchableOpacity, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useAuth } from "@/hooks/use-auth";
import { trpc } from "@/lib/trpc";

export default function HomeScreen() {
  const router = useRouter();
  const { user, isAuthenticated, loading } = useAuth();
  const { data: profile } = trpc.users.getProfile.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  if (loading) {
    return (
      <ScreenContainer className="items-center justify-center">
        <ActivityIndicator size="large" color="#0a7ea4" />
      </ScreenContainer>
    );
  }

  if (!isAuthenticated) {
    return (
      <ScreenContainer className="justify-center gap-6">
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="flex-1">
          <View className="flex-1 items-center justify-center gap-8 px-6">
            {/* Logo/Title */}
            <View className="items-center gap-2">
              <Text className="text-5xl font-bold text-primary">ClipShift</Text>
              <Text className="text-lg text-muted text-center">
                Fast Video Editing & Videography Marketplace
              </Text>
            </View>

            {/* Features */}
            <View className="w-full gap-4">
              <FeatureCard
                icon="🎬"
                title="Upload Videos"
                description="Get professional editing in 6-24 hours"
              />
              <FeatureCard
                icon="📸"
                title="Book Videographers"
                description="Find and hire local video professionals"
              />
              <FeatureCard
                icon="⚡"
                title="Fast Delivery"
                description="Same-day editing and shoot + edit bundles"
              />
            </View>

            {/* Auth Buttons */}
            <View className="w-full gap-3">
              <TouchableOpacity
                className="bg-primary rounded-lg py-4 px-6 items-center"
                onPress={() => router.push("/(tabs)")}
              >
                <Text className="text-background font-semibold text-lg">Sign In</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="border-2 border-primary rounded-lg py-4 px-6 items-center"
                onPress={() => router.push("/(tabs)")}
              >
                <Text className="text-primary font-semibold text-lg">Create Account</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </ScreenContainer>
    );
  }

  // Authenticated user - show role-specific dashboard
  const userType = profile?.userType || "client";

  return (
    <ScreenContainer className="gap-4">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        {/* Welcome Header */}
        <View className="mb-6">
          <Text className="text-3xl font-bold text-foreground">
            Welcome, {profile?.name || "User"}!
          </Text>
          <Text className="text-muted mt-2">
            {userType === "client" && "Ready to get your videos edited?"}
            {userType === "editor" && "Check out available editing jobs"}
            {userType === "videographer" && "Find your next booking"}
          </Text>
        </View>

        {/* Role-Specific Dashboard */}
        {userType === "client" && <ClientDashboard />}
        {userType === "editor" && <EditorDashboard />}
        {userType === "videographer" && <VideographerDashboard />}
      </ScrollView>
    </ScreenContainer>
  );
}

function ClientDashboard() {
  const router = useRouter();

  return (
    <View className="gap-6">
      {/* Quick Actions */}
      <View className="gap-3">
        <Text className="text-lg font-semibold text-foreground">Quick Actions</Text>
        <TouchableOpacity
          className="bg-primary rounded-lg p-4 flex-row items-center justify-between"
          onPress={() => router.push("/(tabs)")}
        >
          <View>
            <Text className="text-background font-semibold">Upload Video</Text>
            <Text className="text-background text-sm opacity-80">Get it edited fast</Text>
          </View>
          <Text className="text-2xl">📹</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="bg-primary rounded-lg p-4 flex-row items-center justify-between"
          onPress={() => router.push("/(tabs)")}
        >
          <View>
            <Text className="text-background font-semibold">Book Videographer</Text>
            <Text className="text-background text-sm opacity-80">Find local professionals</Text>
          </View>
          <Text className="text-2xl">📸</Text>
        </TouchableOpacity>
      </View>

      {/* Recent Orders */}
      <View className="gap-3">
        <View className="flex-row items-center justify-between">
          <Text className="text-lg font-semibold text-foreground">Recent Orders</Text>
          <TouchableOpacity onPress={() => router.push("/(tabs)")}>
            <Text className="text-primary font-semibold">View All</Text>
          </TouchableOpacity>
        </View>
        <View className="bg-surface rounded-lg p-4 items-center justify-center py-8">
          <Text className="text-muted">No orders yet</Text>
          <Text className="text-sm text-muted mt-1">Upload your first video to get started</Text>
        </View>
      </View>

      {/* Stats */}
      <View className="flex-row gap-3">
        <StatCard title="Total Orders" value="0" />
        <StatCard title="Total Spent" value="₹0" />
      </View>
    </View>
  );
}

function EditorDashboard() {
  const router = useRouter();

  return (
    <View className="gap-6">
      {/* Stats */}
      <View className="flex-row gap-3">
        <StatCard title="Available Jobs" value="0" />
        <StatCard title="This Month" value="₹0" />
      </View>

      {/* Available Jobs */}
      <View className="gap-3">
        <View className="flex-row items-center justify-between">
          <Text className="text-lg font-semibold text-foreground">Available Jobs</Text>
          <TouchableOpacity onPress={() => router.push("/(tabs)")}>
            <Text className="text-primary font-semibold">Browse All</Text>
          </TouchableOpacity>
        </View>
        <View className="bg-surface rounded-lg p-4 items-center justify-center py-8">
          <Text className="text-muted">No available jobs right now</Text>
          <Text className="text-sm text-muted mt-1">Check back soon for new opportunities</Text>
        </View>
      </View>

      {/* Quick Links */}
      <View className="gap-3">
        <Text className="text-lg font-semibold text-foreground">Quick Links</Text>
        <TouchableOpacity
          className="bg-surface rounded-lg p-4 flex-row items-center justify-between"
          onPress={() => router.push("/(tabs)")}
        >
          <Text className="text-foreground font-semibold">View Earnings</Text>
          <Text>💰</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="bg-surface rounded-lg p-4 flex-row items-center justify-between"
          onPress={() => router.push("/(tabs)")}
        >
          <Text className="text-foreground font-semibold">Update Portfolio</Text>
          <Text>🎨</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function VideographerDashboard() {
  const router = useRouter();

  return (
    <View className="gap-6">
      {/* Stats */}
      <View className="flex-row gap-3">
        <StatCard title="Pending Bookings" value="0" />
        <StatCard title="This Month" value="₹0" />
      </View>

      {/* Available Bookings */}
      <View className="gap-3">
        <View className="flex-row items-center justify-between">
          <Text className="text-lg font-semibold text-foreground">Available Bookings</Text>
          <TouchableOpacity onPress={() => router.push("/(tabs)")}>
            <Text className="text-primary font-semibold">Browse All</Text>
          </TouchableOpacity>
        </View>
        <View className="bg-surface rounded-lg p-4 items-center justify-center py-8">
          <Text className="text-muted">No bookings available</Text>
          <Text className="text-sm text-muted mt-1">Set your availability to get bookings</Text>
        </View>
      </View>

      {/* Quick Links */}
      <View className="gap-3">
        <Text className="text-lg font-semibold text-foreground">Quick Links</Text>
        <TouchableOpacity
          className="bg-surface rounded-lg p-4 flex-row items-center justify-between"
          onPress={() => router.push("/(tabs)")}
        >
          <Text className="text-foreground font-semibold">Set Availability</Text>
          <Text>📅</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="bg-surface rounded-lg p-4 flex-row items-center justify-between"
          onPress={() => router.push("/(tabs)")}
        >
          <Text className="text-foreground font-semibold">View Earnings</Text>
          <Text>💰</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function FeatureCard({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <View className="bg-surface rounded-lg p-4 gap-2">
      <View className="flex-row items-center gap-3">
        <Text className="text-3xl">{icon}</Text>
        <Text className="text-lg font-semibold text-foreground flex-1">{title}</Text>
      </View>
      <Text className="text-sm text-muted ml-12">{description}</Text>
    </View>
  );
}

function StatCard({ title, value }: { title: string; value: string }) {
  return (
    <View className="flex-1 bg-surface rounded-lg p-4 items-center justify-center">
      <Text className="text-sm text-muted mb-1">{title}</Text>
      <Text className="text-2xl font-bold text-primary">{value}</Text>
    </View>
  );
}
