// Root app — composes routing + state + shell + routed views.

function Router() {
  const { route } = useRoute();
  const tab = route.tab;
  if (tab === 'dashboard') return <Dashboard />;
  if (tab === 'assets')    return <Assets />;
  if (tab === 'planner')   return <Planner />;
  if (tab === 'captions')  return <Captions />;
  if (tab === 'export')    return <ExportScreen />;
  if (tab === 'settings')  return <SettingsScreen />;
  return <Dashboard />;
}

function App() {
  return (
    <StateProvider>
      <RouteProvider>
        <Shell>
          <Router />
        </Shell>
      </RouteProvider>
    </StateProvider>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
