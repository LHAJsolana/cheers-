import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { useState } from "react";
import { Image, Pressable, ScrollView, Switch, Text, View, type ImageSourcePropType } from "react-native";
import { Button, Card, ErrorText, Field, Label, Muted, Screen, Title } from "@/components/ui";
import { endpoints } from "@/lib/api";
import { colors } from "@/lib/theme";

const drinkTypes = ["BEER", "WINE", "WHISKY", "VODKA", "GIN", "RUM", "TEQUILA", "COCKTAIL", "OTHER"];

const drinkTemplates = [
  {
    label: "Beer",
    drinkType: "BEER",
    drinkName: "Beer",
    volumeMl: "330",
    abv: "5",
    image: require("../../assets/drinks/beer.jpg") as ImageSourcePropType,
  },
  {
    label: "Wine",
    drinkType: "WINE",
    drinkName: "Wine",
    volumeMl: "150",
    abv: "13",
    image: require("../../assets/drinks/wine.jpg") as ImageSourcePropType,
  },
  {
    label: "Vodka soda",
    drinkType: "VODKA",
    drinkName: "Vodka Soda",
    volumeMl: "250",
    abv: "8",
    image: require("../../assets/drinks/vodka-soda.jpg") as ImageSourcePropType,
  },
  {
    label: "Mojito",
    drinkType: "COCKTAIL",
    drinkName: "Mojito",
    volumeMl: "220",
    abv: "12",
    image: require("../../assets/drinks/mojito.jpg") as ImageSourcePropType,
  },
  {
    label: "Whisky",
    drinkType: "WHISKY",
    drinkName: "Whisky",
    volumeMl: "50",
    abv: "40",
    image: require("../../assets/drinks/whisky.jpg") as ImageSourcePropType,
  },
  {
    label: "Tequila shot",
    drinkType: "TEQUILA",
    drinkName: "Tequila Shot",
    volumeMl: "45",
    abv: "40",
    image: require("../../assets/drinks/tequila-shot.jpg") as ImageSourcePropType,
  },
];

export default function LogScreen() {
  const [drinkType, setDrinkType] = useState("BEER");
  const [drinkName, setDrinkName] = useState("");
  const [volumeMl, setVolumeMl] = useState("330");
  const [abv, setAbv] = useState("5");
  const [price, setPrice] = useState("0");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");
  const [drinkPhotoUrl, setDrinkPhotoUrl] = useState("");
  const [placePhotoUrl, setPlacePhotoUrl] = useState("");
  const [checkIn, setCheckIn] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function applyTemplate(template: (typeof drinkTemplates)[number]) {
    setDrinkType(template.drinkType);
    setDrinkName(template.drinkName);
    setVolumeMl(template.volumeMl);
    setAbv(template.abv);
    setError("");
  }

  async function submit() {
    if (!drinkName.trim()) {
      setError("Name the drink first. The app needs gossip.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await endpoints.logDrink({
        drinkType,
        drinkName,
        volumeMl,
        abv,
        price,
        location,
        notes,
        drinkPhotoUrl,
        placePhotoUrl,
        loggedAt: new Date().toISOString(),
        visibility: "FRIENDS",
        checkIn,
      });
      router.push("/(tabs)/home");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not log drink.");
    } finally {
      setLoading(false);
    }
  }

  async function choosePhoto(target: "drink" | "place", source: "camera" | "library") {
    setError("");
    const permission = source === "camera"
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setError("Photo permission is needed first.");
      return;
    }

    const result = source === "camera"
      ? await ImagePicker.launchCameraAsync(photoOptions)
      : await ImagePicker.launchImageLibraryAsync(photoOptions);
    if (result.canceled) return;

    const asset = result.assets[0];
    const dataUrl = asset.base64 ? `data:${asset.mimeType ?? "image/jpeg"};base64,${asset.base64}` : asset.uri;
    if (dataUrl.length > 800_000) {
      setError("That photo is doing too much. Try a smaller one.");
      return;
    }

    if (target === "drink") setDrinkPhotoUrl(dataUrl);
    else setPlacePhotoUrl(dataUrl);
  }

  return (
    <Screen>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ gap: 14, paddingBottom: 24 }}>
        <Title>Log drink</Title>
        <Card>
          <Label>Quick templates</Label>
          <Muted>Tap a card, adjust price or place, save.</Muted>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingRight: 4 }}>
            {drinkTemplates.map((template) => (
              <TemplateCard
                key={template.label}
                active={drinkName === template.drinkName && drinkType === template.drinkType}
                template={template}
                onPress={() => applyTemplate(template)}
              />
            ))}
          </ScrollView>
        </Card>
        <Card>
          <Label>Drink type</Label>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {drinkTypes.map((type) => <Pill key={type} active={drinkType === type} label={type.toLowerCase()} onPress={() => setDrinkType(type)} />)}
          </View>
          <Field value={drinkName} onChangeText={setDrinkName} placeholder="Mojito, lager, house wine..." />
          <Field value={volumeMl} onChangeText={setVolumeMl} keyboardType="numeric" placeholder="Volume ml" />
          <Field value={abv} onChangeText={setAbv} keyboardType="numeric" placeholder="ABV %" />
          <Field value={price} onChangeText={setPrice} keyboardType="numeric" placeholder="Price" />
          <Field value={location} onChangeText={setLocation} placeholder="Location/bar" />
          <PhotoBox title="Drink photo" uri={drinkPhotoUrl} onCamera={() => choosePhoto("drink", "camera")} onLibrary={() => choosePhoto("drink", "library")} />
          <PhotoBox title="Place photo" uri={placePhotoUrl} onCamera={() => choosePhoto("place", "camera")} onLibrary={() => choosePhoto("place", "library")} />
          <Field value={notes} onChangeText={setNotes} placeholder="Notes" />
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <Text style={{ color: colors.text, fontWeight: "800" }}>Check in here</Text>
            <Switch value={checkIn} onValueChange={setCheckIn} thumbColor={checkIn ? colors.neon : colors.muted} />
          </View>
          <ErrorText message={error} />
          <Button title="Log drink" loading={loading} onPress={submit} />
        </Card>
      </ScrollView>
    </Screen>
  );
}

const photoOptions = {
  mediaTypes: ImagePicker.MediaTypeOptions.Images,
  allowsEditing: true,
  aspect: [4, 3] as [number, number],
  quality: 0.35,
  base64: true,
};

function PhotoBox({ title, uri, onCamera, onLibrary }: { title: string; uri: string; onCamera: () => void; onLibrary: () => void }) {
  return (
    <View style={{ gap: 8 }}>
      <Label>{title}</Label>
      {uri ? <Image source={{ uri }} style={{ width: "100%", height: 180, borderRadius: 16 }} /> : null}
      <View style={{ flexDirection: "row", gap: 10 }}>
        <Button title="Camera" onPress={onCamera} />
        <Button title="Gallery" secondary onPress={onLibrary} />
      </View>
    </View>
  );
}

function TemplateCard({ active, template, onPress }: { active: boolean; template: (typeof drinkTemplates)[number]; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        width: 156,
        borderColor: active ? colors.neon : "rgba(255,255,255,0.12)",
        borderRadius: 18,
        borderWidth: active ? 2 : 1,
        backgroundColor: active ? "rgba(124,255,107,0.14)" : "rgba(255,255,255,0.07)",
        overflow: "hidden",
        transform: [{ scale: pressed ? 0.98 : 1 }],
      })}
    >
      <Image source={template.image} style={{ height: 104, width: "100%" }} resizeMode="cover" />
      <View style={{ gap: 3, padding: 10 }}>
        <Text numberOfLines={1} style={{ color: colors.text, fontSize: 15, fontWeight: "900" }}>{template.label}</Text>
        <Text numberOfLines={1} style={{ color: active ? colors.neon : colors.muted, fontSize: 12, fontWeight: "800" }}>
          {template.volumeMl} ml / {template.abv}% ABV
        </Text>
        <Text numberOfLines={1} style={{ color: colors.muted, fontSize: 12, fontWeight: "800" }}>
          ~{estimateCalories(template.drinkType, template.volumeMl, template.abv)} kcal
        </Text>
      </View>
    </Pressable>
  );
}

function estimateCalories(drinkType: string, volumeMlValue: string, abvValue: string) {
  const volumeMl = Number(volumeMlValue);
  const abv = Number(abvValue);
  const alcoholGrams = volumeMl * (abv / 100) * 0.789;
  const alcoholCalories = alcoholGrams * 7;
  const multiplier: Record<string, number> = {
    BEER: 1.55,
    WINE: 1.15,
    WHISKY: 1.05,
    VODKA: 1.05,
    GIN: 1.05,
    RUM: 1.15,
    TEQUILA: 1.05,
    COCKTAIL: 1.75,
    OTHER: 1.25,
  };

  return Math.round(alcoholCalories * (multiplier[drinkType] ?? multiplier.OTHER));
}

function Pill({ active, label, onPress }: { active: boolean; label: string; onPress: () => void }) {
  return <Text onPress={onPress} style={{ color: active ? colors.ink : colors.text, backgroundColor: active ? colors.neon : "rgba(255,255,255,0.1)", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, fontWeight: "900", textTransform: "capitalize" }}>{label}</Text>;
}
