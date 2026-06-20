import { Header } from "./components/Header";
import { MainDashboard } from "./components/MainDashboard";
import "./App.css";

function App() {
  return (
    <div className="w-screen h-screen flex flex-col bg-slate-950 overflow-hidden text-slate-100">
      {/* Application Header */}
      <Header />

      {/* Main Dashboard Split Workspace */}
      <MainDashboard />
    </div>
  );
}

export default App;
