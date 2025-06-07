# ⏱ TimerApp - React Native Timer Manager

## 🎯 Objective
A React Native app to create, manage, and interact with multiple customizable timers grouped by category. It meets all assignment requirements including timer creation, history logging, progress tracking, and bulk actions.

---

## ✅ Core Features

1. **Add Timer**
   - Inputs: Name, Duration (in seconds), Category
   - Saved locally using AsyncStorage

2. **Grouped Timer List**
   - Timers displayed under collapsible category sections
   - Each timer shows Name, Time Left, and Status (Running/Paused/Completed)

3. **Timer Management**
   - Controls for each timer: Start, Pause, Reset
   - Marked as Completed when countdown reaches 0

4. **Progress Visualization**
   - Progress bar representing remaining time

5. **Bulk Actions**
   - Start All / Pause All / Reset All for a category

6. **User Feedback**
   - Modal congratulating when a timer completes

---

## 🔁 Enhanced Functionality

1. **Timer History**
   - Completed timers are logged with Name + Timestamp
   - Shown in separate **History** screen

---

## ⚙ Technical Details

- **State Management:** `useReducer`
- **Navigation:** React Navigation (Home, AddTimer, History)
- **Storage:** AsyncStorage
- **Timing Logic:** `setInterval` + `useEffect`
- **UI:** Responsive layout with React Native’s `StyleSheet`

---

## 🧪 Assumptions

- No backend — everything stored on device
- Alerts are modal popups (no push notifications)
- Minimal third-party libraries used as instructed

---

## 🚀 How to Run

1. Download or clone the repo
2. Install dependencies:
   ```bash
   npm install
