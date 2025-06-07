import React, { useReducer, useEffect, useState } from 'react';
import {
  View, Text, TextInput, Button,
  ScrollView, Modal, StyleSheet
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

const Stack = createStackNavigator();

const initialState = {
  timers: [],
  history: [],
};

function reducer(state, action) {
  switch (action.type) {
    case 'ADD_TIMER':
      return { ...state, timers: [...state.timers, action.payload] };
    case 'UPDATE_TIMER':
      return {
        ...state,
        timers: state.timers.map(timer =>
          timer.id === action.payload.id ? { ...timer, ...action.payload } : timer
        ),
      };
    case 'RESET_TIMERS':
      return {
        ...state,
        timers: state.timers.map(timer =>
          timer.category === action.payload.category
            ? { ...timer, remaining: timer.duration, status: 'Paused' }
            : timer
        ),
      };
    case 'SET_TIMERS':
      return { ...state, timers: action.payload };
    case 'ADD_HISTORY':
      return { ...state, history: [...state.history, action.payload] };
    case 'SET_HISTORY':
      return { ...state, history: action.payload };
    default:
      return state;
  }
}

function HomeScreen({ navigation }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [modalVisible, setModalVisible] = useState(false);
  const [completedTimerName, setCompletedTimerName] = useState('');

  useEffect(() => {
    (async () => {
      const savedTimers = await AsyncStorage.getItem('timers');
      const savedHistory = await AsyncStorage.getItem('history');
      if (savedTimers) dispatch({ type: 'SET_TIMERS', payload: JSON.parse(savedTimers) });
      if (savedHistory) dispatch({ type: 'SET_HISTORY', payload: JSON.parse(savedHistory) });
    })();
  }, []);

  useEffect(() => {
    AsyncStorage.setItem('timers', JSON.stringify(state.timers));
    AsyncStorage.setItem('history', JSON.stringify(state.history));
  }, [state.timers, state.history]);

  useEffect(() => {
    const interval = setInterval(() => {
      state.timers.forEach(timer => {
        if (timer.status === 'Running' && timer.remaining > 0) {
          const newRemaining = timer.remaining - 1;
          dispatch({ type: 'UPDATE_TIMER', payload: { ...timer, remaining: newRemaining } });
          if (newRemaining === 0) {
            setCompletedTimerName(timer.name);
            setModalVisible(true);
            dispatch({ type: 'ADD_HISTORY', payload: { name: timer.name, time: new Date().toISOString() } });
            dispatch({ type: 'UPDATE_TIMER', payload: { ...timer, status: 'Completed' } });
          }
        }
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [state.timers]);

  const grouped = state.timers.reduce((acc, timer) => {
    acc[timer.category] = acc[timer.category] || [];
    acc[timer.category].push(timer);
    return acc;
  }, {});

  return (
    <ScrollView style={styles.container}>
      <Button title="Add Timer" onPress={() => navigation.navigate('AddTimer', { dispatch })} />
      <Button title="View History" onPress={() => navigation.navigate('History', { history: state.history })} />
      {Object.keys(grouped).map(category => (
        <View key={category} style={styles.categoryBlock}>
          <Text style={styles.categoryTitle}>{category}</Text>
          <Button title="Start All" onPress={() =>
            grouped[category].forEach(timer => dispatch({ type: 'UPDATE_TIMER', payload: { ...timer, status: 'Running' } }))
          } />
          <Button title="Pause All" onPress={() =>
            grouped[category].forEach(timer => dispatch({ type: 'UPDATE_TIMER', payload: { ...timer, status: 'Paused' } }))
          } />
          <Button title="Reset All" onPress={() =>
            dispatch({ type: 'RESET_TIMERS', payload: { category } })
          } />
          {grouped[category].map(timer => (
            <View key={timer.id} style={styles.timerBox}>
              <Text>{timer.name}</Text>
              <Text>{timer.remaining}s ({timer.status})</Text>
              <View style={{ height: 5, width: '100%', backgroundColor: '#eee' }}>
                <View style={{
                  height: 5,
                  width: `${(timer.remaining / timer.duration) * 100}%`,
                  backgroundColor: 'blue'
                }} />
              </View>
              <Button title="Start" onPress={() =>
                dispatch({ type: 'UPDATE_TIMER', payload: { ...timer, status: 'Running' } })
              } />
              <Button title="Pause" onPress={() =>
                dispatch({ type: 'UPDATE_TIMER', payload: { ...timer, status: 'Paused' } })
              } />
              <Button title="Reset" onPress={() =>
                dispatch({ type: 'UPDATE_TIMER', payload: { ...timer, remaining: timer.duration, status: 'Paused' } })
              } />
            </View>
          ))}
        </View>
      ))}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalContent}>
          <Text>🎉 Timer \"{completedTimerName}\" Completed!</Text>
          <Button title="Close" onPress={() => setModalVisible(false)} />
        </View>
      </Modal>
    </ScrollView>
  );
}

function AddTimerScreen({ route, navigation }) {
  const { dispatch } = route.params;
  const [name, setName] = useState('');
  const [duration, setDuration] = useState('');
  const [category, setCategory] = useState('');

  const addTimer = () => {
    const newTimer = {
      id: Date.now().toString(),
      name,
      duration: parseInt(duration),
      remaining: parseInt(duration),
      category,
      status: 'Paused',
    };
    dispatch({ type: 'ADD_TIMER', payload: newTimer });
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <TextInput placeholder="Name" value={name} onChangeText={setName} style={styles.input} />
      <TextInput placeholder="Duration (sec)" value={duration} onChangeText={setDuration} style={styles.input} keyboardType="numeric" />
      <TextInput placeholder="Category" value={category} onChangeText={setCategory} style={styles.input} />
      <Button title="Save Timer" onPress={addTimer} />
    </View>
  );
}

function HistoryScreen({ route }) {
  const { history } = route.params;
  return (
    <ScrollView style={styles.container}>
      {history.map((item, index) => (
        <Text key={index}>{item.name} - {new Date(item.time).toLocaleString()}</Text>
      ))}
    </ScrollView>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="AddTimer" component={AddTimerScreen} />
        <Stack.Screen name="History" component={HistoryScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  categoryBlock: {
    marginVertical: 10,
    backgroundColor: '#f2f2f2',
    padding: 10,
    borderRadius: 8,
  },
  categoryTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 5,
  },
  timerBox: {
    marginVertical: 5,
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 5,
    borderColor: '#ddd',
    borderWidth: 1,
  },
  input: {
    borderBottomWidth: 1,
    marginBottom: 10,
    padding: 8,
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    margin: 40,
    borderRadius: 10,
    alignItems: 'center',
  },
});
