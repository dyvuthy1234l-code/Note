import { Navigate, Route, Routes } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import AppLayout from './layouts/AppLayout.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'

const AddNote = lazy(() => import('./pages/AddNote.jsx'))
const Dashboard = lazy(() => import('./pages/Dashboard.jsx'))
const ErrorLogs = lazy(() => import('./pages/ErrorLogs.jsx'))
const Home = lazy(() => import('./pages/Home.jsx'))
const InternshipJournal = lazy(() => import('./pages/InternshipJournal.jsx'))
const NoteDetail = lazy(() => import('./pages/NoteDetail.jsx'))
const Notes = lazy(() => import('./pages/Notes.jsx'))
const Settings = lazy(() => import('./pages/Settings.jsx'))

function PageLoader() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {[0, 1, 2].map((item) => (
        <div key={item} className="glass-card h-44 animate-pulse rounded-3xl" />
      ))}
    </div>
  )
}

export default function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/notes" element={<Notes />} />
          <Route path="/notes/new" element={<AddNote />} />
          <Route path="/notes/:id" element={<NoteDetail />} />
          <Route path="/notes/:id/edit" element={<AddNote />} />
          <Route path="/internship" element={<InternshipJournal />} />
          <Route path="/errors" element={<ErrorLogs />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </Suspense>
  )
}
