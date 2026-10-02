import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './components/AuthProvider'
import { MainLayout } from './layouts/MainLayout'
import { ProtectedRoute } from './components/ProtectedRoute'
import { Home } from './pages/Home'
import { Login } from './pages/Login'
import { Register } from './pages/Register'
import { Subjects } from './pages/Subjects'
import { SubjectDetails } from './pages/SubjectDetails'
import { Resources } from './pages/Resources'
import { Assignments } from './pages/Assignments'
import { AssignmentDetails } from './pages/AssignmentDetails'
import { Timetable } from './pages/Timetable'
import { Discussions } from './pages/Discussions'
import { DiscussionDetails } from './pages/DiscussionDetails'
import { Announcements } from './pages/Announcements'
import { AnnouncementDetails } from './pages/AnnouncementDetails'
import { AdminDashboard } from './pages/AdminDashboard'
import { AdminStudents } from './pages/AdminStudents'
import { Notifications } from './pages/Notifications'
import { NotFound } from './pages/NotFound'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Home />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/subjects"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Subjects />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/subjects/:id"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <SubjectDetails />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/resources"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Resources />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route path="/assignments" element={<ProtectedRoute><MainLayout><Assignments /></MainLayout></ProtectedRoute>} />
          <Route path="/assignments/:id" element={<ProtectedRoute><MainLayout><AssignmentDetails /></MainLayout></ProtectedRoute>} />
          <Route path="/timetable" element={<ProtectedRoute><MainLayout><Timetable /></MainLayout></ProtectedRoute>} />
          <Route path="/discussions" element={<ProtectedRoute><MainLayout><Discussions /></MainLayout></ProtectedRoute>} />
          <Route path="/discussions/:id" element={<ProtectedRoute><MainLayout><DiscussionDetails /></MainLayout></ProtectedRoute>} />
          <Route path="/announcements" element={<ProtectedRoute><MainLayout><Announcements /></MainLayout></ProtectedRoute>} />
          <Route path="/announcements/:id" element={<ProtectedRoute><MainLayout><AnnouncementDetails /></MainLayout></ProtectedRoute>} />
          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Notifications />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute requireAdmin>
                <MainLayout>
                  <AdminDashboard />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/students"
            element={
              <ProtectedRoute requireAdmin>
                <MainLayout>
                  <AdminStudents />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="*"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <NotFound />
                </MainLayout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App