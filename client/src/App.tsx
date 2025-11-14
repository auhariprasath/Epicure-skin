import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { ThemeProvider } from "./components/ui/theme-provider"
import { Toaster } from "./components/ui/toaster"
import { AuthProvider } from "./contexts/AuthContext"
import { Login } from "./pages/Login"
import { Register } from "./pages/Register"
import { ProtectedRoute } from "./components/ProtectedRoute"
import { Layout } from "./components/Layout"
import { BlankPage } from "./pages/BlankPage"
import ErrorBoundary from "./components/ErrorBoundary"
import { PatientDashboard } from "./pages/PatientDashboard"
import { Prediction } from "./pages/Prediction"
import { PredictionResults } from "./pages/PredictionResults"
import { Reports } from "./pages/Reports"
import { Doctors } from "./pages/Doctors"
import { DoctorProfile } from "./pages/DoctorProfile"
import { Appointments } from "./pages/Appointments"
import { Messages } from "./pages/Messages"
import { Forum } from "./pages/Forum"
import { ForumTopic } from "./pages/ForumTopic"
import { ForumCreate } from "./pages/ForumCreate"
import { DoctorDashboard } from "./pages/DoctorDashboard"
import { Profile } from "./pages/Profile"

function App() {
  return (
  <ErrorBoundary>
    <AuthProvider>
      <ThemeProvider defaultTheme="light" storageKey="ui-theme">
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Default redirect to login if not authenticated */}
            
            {/* Patient Routes */}
            <Route path="/" element={<ProtectedRoute requiredRole="patient"> <Layout /> </ProtectedRoute>}>
            <Route index element={<PatientDashboard />} />
            <Route path="prediction" element={<Prediction />} />
            <Route path="prediction-results/:id" element={<PredictionResults />} />
            <Route path="reports" element={<Reports />} />
            <Route path="doctors" element={<Doctors />} />
            <Route path="doctor/:doctorId" element={<DoctorProfile />} />
            <Route path="profile" element={<Profile />} />
            <Route path="appointments" element={<Appointments />} />
            <Route path="messages" element={<Messages />} />
          </Route>
          
          {/* Doctor Routes */}
          <Route path="/doctor" element={<ProtectedRoute requiredRole="doctor"> <Layout /> </ProtectedRoute>}>
            <Route path="dashboard" element={<DoctorDashboard />} />
            <Route path="appointments" element={<Appointments />} />
            <Route path="forum" element={<Forum />} />
            <Route path="forum/topic/:topicId" element={<ForumTopic />} />
            <Route path="forum/create" element={<ForumCreate />} />
          </Route>
          
          {/* Legacy route for doctor-dashboard */}
          <Route path="/doctor-dashboard" element={<ProtectedRoute requiredRole="doctor"> <Layout /> <DoctorDashboard /> </ProtectedRoute>} />
          
          <Route path="*" element={<BlankPage />} />
        </Routes>
      </Router>
      <Toaster />
    </ThemeProvider>
  </AuthProvider>
  </ErrorBoundary>
  )
}

export default App