import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  GestureHandlerRootView,
  ScrollView as GestureHandlerScrollView,
} from 'react-native-gesture-handler';
import { ScrollViewMarker } from 'react-native-screens';
import { NavigationContainer } from '@react-navigation/native';
import {
  createNativeStackNavigator,
  type NativeStackScreenProps,
} from '@react-navigation/native-stack';
import { Button } from '@apps/shared';

// iOS 26+, follow-up to #5249. Every Details screen renders a spinner first and
// its scroll view 1 s later, and requests a hidden top scroll edge effect.
//
// Expected: the colored bands stay fully visible behind the navigation bar.
// "No marker": #5249, the top edge keeps the `automatic` effect.
// "Marker + RN ScrollView": as expected.
// "Marker + RNGH ScrollView": the marker does not find the scroll view.

type Variant =
  | 'No marker'
  | 'Marker + RN ScrollView'
  | 'Marker + RNGH ScrollView';

type ParamList = {
  Home: undefined;
  Details: { variant: Variant };
};

const Stack = createNativeStackNavigator<ParamList>();

const VARIANTS: Variant[] = [
  'No marker',
  'Marker + RN ScrollView',
  'Marker + RNGH ScrollView',
];

const COLORS = ['#e63946', '#f4a261', '#2a9d8f', '#457b9d', '#8338ec'];

function Bands() {
  return Array.from({ length: 20 }, (_, index) => (
    <View
      key={index}
      style={[styles.band, { backgroundColor: COLORS[index % COLORS.length] }]}>
      <Text style={styles.bandText}>Band {index + 1}</Text>
    </View>
  ));
}

function HomeScreen({ navigation }: NativeStackScreenProps<ParamList, 'Home'>) {
  return (
    <View style={styles.home}>
      {VARIANTS.map(variant => (
        <Button
          key={variant}
          title={variant}
          onPress={() => navigation.navigate('Details', { variant })}
        />
      ))}
    </View>
  );
}

function DetailsScreen({
  route,
}: NativeStackScreenProps<ParamList, 'Details'>) {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setLoaded(true), 1000);
    return () => clearTimeout(timeout);
  }, []);

  if (!loaded) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  switch (route.params.variant) {
    case 'No marker':
      return (
        <ScrollView contentInsetAdjustmentBehavior="never">
          <Bands />
        </ScrollView>
      );
    case 'Marker + RN ScrollView':
      return (
        <ScrollViewMarker
          style={styles.container}
          scrollEdgeEffects={{ top: 'hidden' }}>
          <ScrollView contentInsetAdjustmentBehavior="never">
            <Bands />
          </ScrollView>
        </ScrollViewMarker>
      );
    case 'Marker + RNGH ScrollView':
      return (
        <ScrollViewMarker
          style={styles.container}
          scrollEdgeEffects={{ top: 'hidden' }}>
          <GestureHandlerScrollView contentInsetAdjustmentBehavior="never">
            <Bands />
          </GestureHandlerScrollView>
        </ScrollViewMarker>
      );
  }
}

export default function TestScrollViewMarkerGestureHandler() {
  return (
    <GestureHandlerRootView style={styles.container}>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen
            name="Details"
            component={DetailsScreen}
            options={({ route }) => ({
              title: route.params.variant,
              headerTransparent: true,
              scrollEdgeEffects: { top: 'hidden' },
            })}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  home: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  band: {
    height: 120,
    justifyContent: 'flex-end',
    padding: 12,
  },
  bandText: {
    color: 'white',
    fontSize: 20,
    fontWeight: '600',
  },
});
