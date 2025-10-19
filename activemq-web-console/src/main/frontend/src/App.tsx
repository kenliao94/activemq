import { useMemo } from 'react'
import { CssBaseline, ThemeProvider } from '@mui/material'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { theme, darkTheme } from './styles/theme'
import { AppLayout } from './components/layout'
import { useUIStore } from './stores/uiStore'
import { Dashboard } from './pages/Dashboard'
import { DashboardPlaceholder } from './pages/DashboardPlaceholder'
import { QueueList, QueueDetail } from './pages/Queues'
import { QueueGraph } from './pages/Queues/QueueGraph'
import { TopicList, TopicDetail } from './pages/Topics'
import { TopicGraph } from './pages/Topics/TopicGraph'
import { MessageBrowser, MessageDetail, SendMessage } from './pages/Messages'
import { ConnectionList, ConnectionDetail } from './pages/Connections'

function App() {
  // Use basename only in production (when served from /modern path)
  const basename = import.meta.env.PROD ? '/modern' : '/'
  
  const themeMode = useUIStore((state) => state.theme)
  
  // Determine which theme to use based on user preference
  const currentTheme = useMemo(() => {
    if (themeMode === 'dark') {
      return darkTheme
    } else if (themeMode === 'light') {
      return theme
    } else {
      // System preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      return prefersDark ? darkTheme : theme
    }
  }, [themeMode])
  
  return (
    <ThemeProvider theme={currentTheme}>
      <CssBaseline />
      <BrowserRouter basename={basename}>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/" element={<AppLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="queues" element={<QueueList />} />
            <Route path="queues/:name" element={<QueueDetail />} />
            <Route path="queues/:name/graph" element={<QueueGraph />} />
            <Route path="topics" element={<TopicList />} />
            <Route path="topics/:name" element={<TopicDetail />} />
            <Route path="topics/:name/graph" element={<TopicGraph />} />
            <Route path="messages" element={<MessageBrowser />} />
            <Route path="messages/:queueName/:messageId" element={<MessageDetail />} />
            <Route path="messages/send" element={<SendMessage />} />
            <Route path="connections" element={<ConnectionList />} />
            <Route path="connections/:id" element={<ConnectionDetail />} />
            <Route path="settings" element={<DashboardPlaceholder />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App
