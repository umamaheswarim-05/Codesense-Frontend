import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import EditorPage from "./pages/EditorPage";
import StudentDashboard from "./pages/StudentDashboard";
import EducatorDashboard from "./pages/EducatorDashboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/editor" element={<EditorPage />} />
        <Route path="/dashboard" element={<StudentDashboard />} />
        <Route path="/educator" element={<EducatorDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;