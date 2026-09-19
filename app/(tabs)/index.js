import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  FlatList,
  SafeAreaView,
} from "react-native";
import { db } from "../../firebase";
import { ref, onValue, push } from "firebase/database";
import { Audio } from "expo-av";
import * as Linking from "expo-linking";
import * as Location from "expo-location";

export default function App() {
  const [tab, setTab] = useState("alert");

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#0f172a" }}>
      {tab === "alert" && <AlertScreen />}
      {tab === "history" && <HistoryScreen />}
      {tab === "settings" && <SettingsScreen />}

      <View style={{ flexDirection: "row", height: 65, backgroundColor: "#111827" }}>
        <NavButton label="Alert" active={tab==="alert"} onPress={() => setTab("alert")} />
        <NavButton label="History" active={tab==="history"} onPress={() => setTab("history")} />
        <NavButton label="Settings" active={tab==="settings"} onPress={() => setTab("settings")} />
      </View>
    </SafeAreaView>
  );
}

function NavButton({ label, active, onPress }) {
  return (
    <TouchableOpacity style={{ flex: 1, justifyContent: "center", alignItems: "center" }} onPress={onPress}>
      <Text style={{ color: active ? "#ef4444" : "#9ca3af", fontWeight: "bold" }}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

// ================= ALERT SCREEN =================
function AlertScreen() {
  const [detected, setDetected] = useState(false);
  const [flash, setFlash] = useState(false);
  const [location, setLocation] = useState("");
  const [connected, setConnected] = useState(true);

  const intervalRef = useRef(null);
  const soundRef = useRef(null);
  const timeoutRef = useRef(null);
  const connectionTimer = useRef(null);
  const whatsappSentRef = useRef(false);

  useEffect(() => {
    const alertRef = ref(db, "alert");

    const unsubscribe = onValue(alertRef, async (snapshot) => {
      setConnected(true);

      if (connectionTimer.current) clearTimeout(connectionTimer.current);
      connectionTimer.current = setTimeout(() => setConnected(false), 8000);

      const value = snapshot.val();

      if (value === "leopard") {
        await triggerAlert();
      } else {
        whatsappSentRef.current = false;
        await resetAlert();
      }
    });

    return () => unsubscribe();
  }, []);

  const getLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return "";

      const loc = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = loc.coords;

      const url = `https://maps.google.com/?q=${latitude},${longitude}`;
      setLocation(url);
      return url;
    } catch {
      return "";
    }
  };

  const sendWhatsApp = async (locUrl) => {
    const phone = "919307450023"; // change number
    const message = `🚨 Leopard Detected!\n${locUrl}`;

    const url = `whatsapp://send?phone=${phone}&text=${encodeURIComponent(message)}`;

    try {
      await Linking.openURL(url);
    } catch {
      alert("WhatsApp not installed");
    }
  };

  const triggerAlert = async () => {
    setDetected(true);

    push(ref(db, "history"), {
      time: new Date().toLocaleString(),
      type: "Leopard Detected",
    });

    // FLASH SCREEN
    if (!intervalRef.current) {
      intervalRef.current = setInterval(() => {
        setFlash((prev) => !prev);
      }, 500);
    }

    // SIREN LOOP
    if (!soundRef.current) {
      const { sound } = await Audio.Sound.createAsync(
        require("../../assets/siren.mp3"),
        { isLooping: true, shouldPlay: true }
      );
      soundRef.current = sound;
    }

    // 🔥 WHATSAPP INSTANT TRIGGER
    if (!whatsappSentRef.current) {
      whatsappSentRef.current = true;

      const locUrl = await getLocation(); // get location first
      await sendWhatsApp(locUrl);         // then open WhatsApp instantly
    }

    // AUTO RESET AFTER 10 SEC
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      resetAlert();
    }, 10000);
  };

  const resetAlert = async () => {
    setDetected(false);

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (soundRef.current) {
      try {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
      } catch {}
      soundRef.current = null;
    }
  };

  return (
    <View style={{ flex: 1, padding: 20 }}>
      
      {/* HEADER */}
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <Text style={{ color: "white", fontSize: 22, fontWeight: "bold" }}>
          Leopard Monitor
        </Text>

        <Text style={{ color: connected ? "#22c55e" : "#ef4444" }}>
          {connected ? "● Online" : "● Offline"}
        </Text>
      </View>

      {/* ALERT CARD */}
      <View
        style={{
          marginTop: 20,
          padding: 25,
          borderRadius: 20,
          backgroundColor: detected
            ? flash
              ? "#ef4444"
              : "#7f1d1d"
            : "#064e3b",
        }}
      >
        <Text style={{ color: "white", fontSize: 22, fontWeight: "bold" }}>
          {detected ? "🚨 LEOPARD DETECTED" : "SYSTEM SAFE"}
        </Text>

        <Text style={{ color: "#d1d5db", marginTop: 8 }}>
          AI Monitoring Active
        </Text>
      </View>

      {/* LOCATION */}
      {location !== "" && (
        <View style={{ marginTop: 20, backgroundColor: "#1f2937", padding: 15, borderRadius: 10 }}>
          <Text style={{ color: "#9ca3af" }}>📍 Current Location</Text>

          <TouchableOpacity onPress={() => Linking.openURL(location)}>
            <Text style={{ color: "#3b82f6", marginTop: 5 }}>
              Open in Maps
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

// ================= HISTORY =================
function HistoryScreen() {
  const [data, setData] = useState([]);

  useEffect(() => {
    const historyRef = ref(db, "history");

    onValue(historyRef, (snapshot) => {
      const val = snapshot.val();
      if (val) {
        setData(Object.values(val).reverse());
      }
    });
  }, []);

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ color: "white", fontSize: 22 }}>
        Detection History
      </Text>

      <FlatList
        data={data}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={{ backgroundColor: "#1f2937", padding: 15, marginVertical: 5, borderRadius: 10 }}>
            <Text style={{ color: "white" }}>{item.type}</Text>
            <Text style={{ color: "#9ca3af" }}>{item.time}</Text>
          </View>
        )}
      />
    </View>
  );
}

// ================= SETTINGS =================
function SettingsScreen() {
  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ color: "white", fontSize: 22 }}>
        Settings
      </Text>

      <View style={{ marginTop: 20, backgroundColor: "#1f2937", padding: 15, borderRadius: 10 }}>
        <Text style={{ color: "#9ca3af" }}>Emergency Number</Text>
        <TextInput
          placeholder="+91 9307450023"
          placeholderTextColor="#6b7280"
          style={{
            color: "white",
            borderWidth: 1,
            borderColor: "#374151",
            padding: 10,
            marginTop: 10,
            borderRadius: 5,
          }}
        />
      </View>

      <Text style={{ marginTop: 20, color: "#22c55e" }}>
        Edge Node Status: ONLINE
      </Text>
    </View>
  );
}