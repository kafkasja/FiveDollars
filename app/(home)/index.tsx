import { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Animated,
  useRef,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import * as Haptics from "expo-haptics";
import { supabase } from "@/lib/supabase";
import { clearSelectedProfile } from "@/lib/storage";
import type { Profile, Balance, Transaction } from "@/types";

const STEP = 5;

export default function DashboardScreen() {
  const { profileId } = useLocalSearchParams<{ profileId: string }>();

  const [me, setMe] = useState<Profile | null>(null);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [balance, setBalance] = useState<Balance | null>(null);
  const [recentTxs, setRecentTxs] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    loadData();

    const channel = supabase
      .channel("transactions-watch")
      .on("postgres_changes", { event: "*", schema: "public", table: "transactions" }, () => {
        loadBalance();
        loadRecentTransactions();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [profileId]);

  async function loadData() {
    setLoading(true);
    await Promise.all([loadProfiles(), loadBalance(), loadRecentTransactions()]);
    setLoading(false);
  }

  async function loadProfiles() {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: true });
    if (!data) return;
    setProfiles(data);
    setMe(data.find((p) => p.id === profileId) ?? null);
  }

  async function loadBalance() {
    const { data: txData } = await supabase.from("transactions").select("*");
    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: true });

    if (!txData || !profileData || profileData.length < 2) {
      setBalance(null);
      return;
    }

    const [profileA, profileB] = profileData;
    let net = 0;
    for (const tx of txData) {
      if (tx.from_profile_id === profileA.id) net += Number(tx.amount);
      if (tx.from_profile_id === profileB.id) net -= Number(tx.amount);
    }

    if (net === 0) {
      setBalance({ debtor: profileA, creditor: profileB, amount: 0 });
    } else if (net > 0) {
      setBalance({ debtor: profileA, creditor: profileB, amount: net });
    } else {
      setBalance({ debtor: profileB, creditor: profileA, amount: Math.abs(net) });
    }
  }

  async function loadRecentTransactions() {
    const { data } = await supabase
      .from("transactions")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(5);
    setRecentTxs(data ?? []);
  }

  async function addPayment(fromProfileId: string, toProfileId: string) {
    setPosting(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const { error } = await supabase.from("transactions").insert({
      from_profile_id: fromProfileId,
      to_profile_id: toProfileId,
      amount: STEP,
    });

    if (error) {
      Alert.alert("Error", "Could not save. Try again.");
      console.error(error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      await Promise.all([loadBalance(), loadRecentTransactions()]);
    }
    setPosting(false);
  }

  async function handleSwitchProfile() {
    Alert.alert("Switch Profile", "Go back to the profile picker?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Switch",
        style: "destructive",
        onPress: async () => {
          await clearSelectedProfile();
          router.replace("/");
        },
      },
    ]);
  }

  if (loading || !me) {
    return (
      <View style={{ flex: 1, backgroundColor: "#0f0f13", alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  const others = profiles.filter((p) => p.id !== me.id);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "#0f0f13" }}
      contentContainerStyle={{ paddingBottom: 60 }}
    >
      {/* ── Header ── */}
      <View style={{ paddingHorizontal: 24, paddingTop: 60, paddingBottom: 24 }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <View style={{
              width: 52, height: 52, borderRadius: 16,
              backgroundColor: me.color,
              alignItems: "center", justifyContent: "center",
              shadowColor: me.color, shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.5, shadowRadius: 10, elevation: 6,
            }}>
              <Text style={{ fontSize: 26 }}>{me.emoji}</Text>
            </View>
            <View>
              <Text style={{ color: "#6b7280", fontSize: 12 }}>Logged in as</Text>
              <Text style={{ color: "#fff", fontSize: 20, fontWeight: "700" }}>{me.name}</Text>
            </View>
          </View>
          <TouchableOpacity onPress={handleSwitchProfile} style={{ padding: 8 }}>
            <Text style={{ color: "#4b5563", fontSize: 14 }}>Switch</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Balance card ── */}
      <BalanceCard balance={balance} />

      {/* ── Payment buttons ── */}
      <View style={{ paddingHorizontal: 24, marginTop: 32 }}>
        <Text style={{ color: "#4b5563", fontSize: 11, letterSpacing: 2, textTransform: "uppercase", marginBottom: 16 }}>
          Add ${STEP}
        </Text>
        {others.map((other) => (
          <PaymentRow
            key={other.id}
            me={me}
            other={other}
            disabled={posting}
            onPress={addPayment}
          />
        ))}
      </View>

      {/* ── Recent transactions ── */}
      {recentTxs.length > 0 && (
        <RecentTransactions transactions={recentTxs} profiles={profiles} />
      )}
    </ScrollView>
  );
}

// ─── Balance Card ─────────────────────────────────────────────────────────────

function BalanceCard({ balance }: { balance: Balance | null }) {
  const settled = !balance || balance.amount === 0;

  return (
    <View style={{
      marginHorizontal: 24, borderRadius: 24, padding: 24,
      backgroundColor: "#16161e",
      borderWidth: 1, borderColor: "#ffffff10",
    }}>
      <Text style={{ color: "#4b5563", fontSize: 11, letterSpacing: 2, textTransform: "uppercase", marginBottom: 16 }}>
        Current balance
      </Text>

      {settled ? (
        <View style={{ alignItems: "center", paddingVertical: 12 }}>
          <Text style={{ fontSize: 40 }}>✅</Text>
          <Text style={{ color: "#fff", fontSize: 22, fontWeight: "700", marginTop: 8 }}>All settled!</Text>
          <Text style={{ color: "#4b5563", fontSize: 14, marginTop: 4 }}>No one owes anyone anything</Text>
        </View>
      ) : (
        <View style={{ alignItems: "center" }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
            <Text style={{ fontSize: 30 }}>{balance!.debtor.emoji}</Text>
            <Text style={{ color: "#fff", fontSize: 18, fontWeight: "600" }}>{balance!.debtor.name}</Text>
            <Text style={{ color: "#6b7280", fontSize: 16 }}>owes</Text>
            <Text style={{ color: "#fff", fontSize: 18, fontWeight: "600" }}>{balance!.creditor.name}</Text>
            <Text style={{ fontSize: 30 }}>{balance!.creditor.emoji}</Text>
          </View>
          <Text style={{ fontSize: 64, fontWeight: "800", color: "#f0a500", marginTop: 8, letterSpacing: -1 }}>
            ${balance!.amount.toFixed(0)}
          </Text>
        </View>
      )}
    </View>
  );
}

// ─── Payment Row ──────────────────────────────────────────────────────────────

function PaymentRow({
  me, other, disabled,
  onPress,
}: {
  me: Profile;
  other: Profile;
  disabled: boolean;
  onPress: (fromId: string, toId: string) => void;
}) {
  return (
    <View style={{ marginBottom: 12 }}>
      <View style={{ flexDirection: "row", gap: 10 }}>
        <TouchableOpacity
          disabled={disabled}
          onPress={() => onPress(me.id, other.id)}
          style={{
            flex: 1, borderRadius: 18, paddingVertical: 18,
            alignItems: "center", backgroundColor: "#16161e",
            borderWidth: 1, borderColor: "#ffffff0d",
            opacity: disabled ? 0.5 : 1,
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "600", fontSize: 15 }}>
            I owe {other.name} ${STEP}
          </Text>
          <Text style={{ color: "#4b5563", fontSize: 12, marginTop: 3 }}>
            {me.emoji} → {other.emoji}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          disabled={disabled}
          onPress={() => onPress(other.id, me.id)}
          style={{
            flex: 1, borderRadius: 18, paddingVertical: 18,
            alignItems: "center", backgroundColor: "#16161e",
            borderWidth: 1, borderColor: "#ffffff0d",
            opacity: disabled ? 0.5 : 1,
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "600", fontSize: 15 }}>
            {other.name} owes me ${STEP}
          </Text>
          <Text style={{ color: "#4b5563", fontSize: 12, marginTop: 3 }}>
            {other.emoji} → {me.emoji}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Recent Transactions ──────────────────────────────────────────────────────

function RecentTransactions({
  transactions,
  profiles,
}: {
  transactions: Transaction[];
  profiles: Profile[];
}) {
  function getProfile(id: string) {
    return profiles.find((p) => p.id === id);
  }

  function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  }

  return (
    <View style={{ paddingHorizontal: 24, marginTop: 32 }}>
      <Text style={{ color: "#4b5563", fontSize: 11, letterSpacing: 2, textTransform: "uppercase", marginBottom: 16 }}>
        Recent
      </Text>
      {transactions.map((tx) => {
        const from = getProfile(tx.from_profile_id);
        const to = getProfile(tx.to_profile_id);
        if (!from || !to) return null;
        return (
          <View
            key={tx.id}
            style={{
              flexDirection: "row", alignItems: "center",
              justifyContent: "space-between",
              paddingVertical: 12,
              borderBottomWidth: 1, borderBottomColor: "#ffffff08",
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
              <Text style={{ fontSize: 20 }}>{from.emoji}</Text>
              <Text style={{ color: "#6b7280", fontSize: 14 }}>→</Text>
              <Text style={{ fontSize: 20 }}>{to.emoji}</Text>
              <View>
                <Text style={{ color: "#d1d5db", fontSize: 14 }}>
                  {from.name} → {to.name}
                </Text>
                <Text style={{ color: "#4b5563", fontSize: 12 }}>{timeAgo(tx.created_at)}</Text>
              </View>
            </View>
            <Text style={{ color: "#f0a500", fontWeight: "700", fontSize: 16 }}>
              +${Number(tx.amount).toFixed(0)}
            </Text>
          </View>
        );
      })}
    </View>
  );
}
