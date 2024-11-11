import React, { useEffect } from 'react';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { configureStore, createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { View, Text, Button, FlatList, Image, StyleSheet, TouchableOpacity } from 'react-native';


const MOCK_API_URL = 'https://6703916dab8a8f892730abc4.mockapi.io/Bike';


const fetchBikes = createAsyncThunk('bikes/fetchBikes', async () => {
  const response = await axios.get(MOCK_API_URL);
  return response.data;
});


const bikeSlice = createSlice({
  name: 'bikes',
  initialState: {
    bikes: [],
    cart: [],
    status: 'idle',
    error: null,
  },
  reducers: {
    addToCart: (state, action) => {
      state.cart.push(action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBikes.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchBikes.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.bikes = action.payload;
      })
      .addCase(fetchBikes.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  },
});

const { addToCart } = bikeSlice.actions;
const store = configureStore({ reducer: { bikes: bikeSlice.reducer } });


const Stack = createStackNavigator();

const IntroScreen = ({ navigation }) => (
  <View style={styles.container1}>
    <Image source={require('./assets/bike_1.png')}/>
    <Text style={styles.title1}>POWER BIKE SHOP</Text>
    <Text style={styles.description1}>A premium online store for sportier and stylish choice</Text>
    <Button title="Get Started" onPress={() => navigation.navigate('BikeList')} />
  </View>
);

const BikeListScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { bikes, status, error } = useSelector((state) => state.bikes);

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchBikes());
    }
  }, [status, dispatch]);

  if (status === 'loading') return <Text>Loading...</Text>;
  if (status === 'failed') return <Text>Error: {error}</Text>;

  const renderItem = ({ item }) => (
    <TouchableOpacity style={{
      flex:1, justifyContent:'space-around', marginHorizontal:5,marginVertical:5
    }} onPress={() => navigation.navigate('BikeDetail', { bikeId: item.id })}>
       <View style={styles.bikeCard}>
      <Image source={require('./assets/bike_1.png')} style={styles.image} />
     
      <Text style={styles.name}>{item.name}</Text>
      <Text>${item.price}</Text>
    </View>
    </TouchableOpacity>
   
  );

  return (
    <FlatList
      data={bikes}
      renderItem={renderItem}
      numColumns={2}
      keyExtractor={(item) => item.id.toString()}
    />
  );
};

const BikeDetailScreen = ({ route }) => {
  const dispatch = useDispatch();
  const { bikeId } = route.params;
  const bike = useSelector((state) => state.bikes.bikes.find((b) => b.id === bikeId));

  if (!bike) return <Text>Bike not found</Text>;

  return (
    <View style={styles.container}>
     <Image source={{uri:bike.image}} style={styles.imageLarge} />
     <Image source={{uri:".https://khoihoang.sirv.com/Img/bike_1.png"}} style={styles.imageLarge} />
      <Text style={styles.name}>{bike.name}</Text>
      <Text style={styles.description}>{bike.description}</Text>
      <Text>
        <Text style={styles.originalPrice}>${bike.price}</Text> 
      </Text>
      <Button title="Add to Cart" onPress={() => dispatch(addToCart(bike))} />
    </View>
  );
};

const AppNavigator = () => (
  <NavigationContainer>
    <Stack.Navigator initialRouteName="Intro">
      <Stack.Screen name="Intro" component={IntroScreen} options={{ headerShown: false }} />
      <Stack.Screen name="BikeList" component={BikeListScreen} options={{ title: "Bike List" }} />
      <Stack.Screen name="BikeDetail" component={BikeDetailScreen} options={{ title: "Bike Details" }} />
    </Stack.Navigator>
  </NavigationContainer>
);

const App = () => (
  <Provider store={store}>
    <AppNavigator />
  </Provider>
);

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10, backgroundColor: '#f5f5f5' },
  header: { fontSize: 20, fontWeight: 'bold', textAlign: 'center', color: '#d10000', marginBottom: 10 },
  filterContainer: { flexDirection: 'row', justifyContent: 'center', marginBottom: 10 },
  filterButton: {
    borderColor: '#ccc',
    borderWidth: 1,
    paddingVertical: 5,
    paddingHorizontal: 15,
    borderRadius: 20,
    marginHorizontal: 5,
  },
  activeFilter: { backgroundColor: '#f0c0c0', borderColor: '#d10000' },
  filterText: { color: '#333' },
  activeFilterText: { color: '#d10000', fontWeight: 'bold' },
  cardWrapper: {
    flex: 1,
    marginVertical: 10, 
  },
  bikeCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'white',  
    padding: 10,
    alignItems: 'center',
    position: 'relative',
  },
  heartIcon: {
    position: 'absolute',
    top: 8,
    right: 8,
    fontSize: 18,
    zIndex: 1,
  },
  image: {
    width: '75%',
    height: 120,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  name: { fontSize: 16, fontWeight: 'bold', textAlign: 'center', marginBottom: 5 },
  price: { fontSize: 14, color: '#666' },
  container1: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title1: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  description1: { fontSize: 16, textAlign: 'center', marginVertical: 20 },
  originalPrice:{fontSize:15, fontWeight:'bold'}
});

export default App;
