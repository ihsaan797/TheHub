import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { Checklist } from './components/Checklist';
import { Login } from './components/Login';
import { UserManagement } from './components/UserManagement';
import { ShiftManagement } from './components/ShiftManagement';
import { ChecklistManagement } from './components/ChecklistManagement';
import { OccupancyManagement } from './components/OccupancyManagement';
import { Settings } from './components/Settings';
import { ShiftHistory } from './components/ShiftHistory';
import { ShiftData, ShiftType, TaskCategory, Task, User, ShiftAssignment, AppConfig, TaskTemplate, DailyOccupancy } from './types';
import { Menu, Search, Bell, LogOut } from 'lucide-react';

// --- Default Data ---
const INITIAL_USERS: User[] = [
  { id: 'u1', username: 'Ahmed.Ihsaan', name: 'Ahmed Ihsaan', role: 'Front Office Manager', initials: 'AI', color: 'bg-purple-100 text-purple-600', password: 'password123' },
  { id: 'u2', username: 'Michael.Chen', name: 'Michael Chen', role: 'Asst. FOM', initials: 'MC', color: 'bg-blue-100 text-blue-600', password: 'password123' },
  { id: 'u3', username: 'Ahmed.R', name: 'Ahmed R.', role: 'Senior GSA', initials: 'AR', color: 'bg-teal-100 text-teal-600', password: 'password123' },
];

const DEFAULT_SHIFTS = ['Morning', 'Afternoon', 'Night'];

const DEFAULT_CATEGORIES = [
  'Front Desk Operations',
  'Lobby & Ambiance',
  'Guest Relations',
  'Back Office & Reports',
  'Health & Safety'
];

const INITIAL_TASK_TEMPLATES: TaskTemplate[] = [
    // Common
    { id: 'c1', label: 'Read Logbook & Handover', category: 'Front Desk Operations', shiftType: 'ALL' },
    { id: 'c2', label: 'Check Float/Cash', category: 'Front Desk Operations', shiftType: 'ALL' },
    { id: 'c3', label: 'Lobby Cleanliness Check', category: 'Lobby & Ambiance', shiftType: 'ALL' },
    // Morning
    { id: 'm1', label: 'Print Arrivals Report', category: 'Back Office & Reports', shiftType: 'Morning' },
    { id: 'm2', label: 'Check VIP Amenities Setup', category: 'Guest Relations', shiftType: 'Morning' },
    { id: 'm3', label: 'Morning Briefing', category: 'Front Desk Operations', shiftType: 'Morning' },
    { id: 'm4', label: 'Buggy Battery Check', category: 'Health & Safety', shiftType: 'Morning' },
    { id: 'm5', label: 'Confirm Seaplane Transfers', category: 'Back Office & Reports', shiftType: 'Morning' },
    // Afternoon
    { id: 'a1', label: 'Review Departures for Tomorrow', category: 'Back Office & Reports', shiftType: 'Afternoon' },
    { id: 'a2', label: 'Check Room Allocations', category: 'Front Desk Operations', shiftType: 'Afternoon' },
    // Night
    { id: 'n1', label: 'Run Night Audit', category: 'Back Office & Reports', shiftType: 'Night' },
    { id: 'n2', label: 'Print Newspaper Summary', category: 'Guest Relations', shiftType: 'Night' }
];

const getTodayStr = () => new Date().toISOString().split('T')[0];

const INITIAL_ROSTER_ASSIGNMENTS: ShiftAssignment[] = [
    { id: 'r1', date: getTodayStr(), shiftType: 'Morning', userId: 'u1' }, // Ahmed Ihsaan -> Morning
    { id: 'r2', date: getTodayStr(), shiftType: 'Afternoon', userId: 'u2' }, // Michael Chen -> Afternoon
    { id: 'r3', date: getTodayStr(), shiftType: 'Night', userId: 'u3' } // Ahmed R. -> Night
];

// Generate mock occupancy for current week
const generateInitialOccupancy = (): DailyOccupancy[] => {
    const today = new Date();
    const data: DailyOccupancy[] = [];
    for (let i = -7; i < 14; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() + i);
        data.push({
            date: d.toISOString().split('T')[0],
            percentage: 60 + Math.floor(Math.random() * 30),
            notes: i === 0 ? 'Full House expected' : ''
        });
    }
    return data;
};

export const App: React.FC = () => {
    // App State
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [currentView, setCurrentView] = useState('dashboard');
    const [users, setUsers] = useState<User[]>(INITIAL_USERS);
    const [appConfig, setAppConfig] = useState<AppConfig>({
        appName: 'Nova Maldives | Front Office',
        logoUrl: '',
        supportMessage: 'Contact IT for support.'
    });

    // Operational Data State
    const [shiftTypes, setShiftTypes] = useState<string[]>(DEFAULT_SHIFTS);
    const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES);
    const [templates, setTemplates] = useState<TaskTemplate[]>(INITIAL_TASK_TEMPLATES);
    const [rosterAssignments, setRosterAssignments] = useState<ShiftAssignment[]>(INITIAL_ROSTER_ASSIGNMENTS);
    const [occupancyData, setOccupancyData] = useState<DailyOccupancy[]>(generateInitialOccupancy());

    // Current Shift State
    const [currentShift, setCurrentShift] = useState<ShiftData>({
        id: 's1',
        type: 'Morning',
        date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
        tasks: [],
        status: 'active',
        agentName: '',
        occupancy: 75,
        notes: ''
    });

    // Initialize shift tasks when user logs in
    useEffect(() => {
        if (currentUser) {
             const todayYMD = getTodayStr();
             // Find assignment for today
             const userAssignment = rosterAssignments.find(a => a.userId === currentUser.id && a.date === todayYMD);
             // Default to Morning if no assignment found, otherwise use assigned shift
             const targetShiftType = userAssignment ? userAssignment.shiftType : 'Morning';
             
             // Get Occupancy
             const todayOcc = occupancyData.find(d => d.date === todayYMD)?.percentage || 75;

             const shiftTasks = templates
                .filter(t => t.shiftType === 'ALL' || t.shiftType === targetShiftType)
                .map(t => ({
                    id: `t-${Date.now()}-${t.id}`,
                    label: t.label,
                    category: t.category,
                    isCompleted: false
                }));
             
             setCurrentShift(prev => {
                 // Determine if we need to reset tasks (if type changed or no tasks exist)
                 const typeChanged = prev.type !== targetShiftType;
                 const hasTasks = prev.tasks.length > 0;
                 
                 return {
                     ...prev,
                     type: targetShiftType,
                     agentName: currentUser.name,
                     occupancy: todayOcc,
                     // If type changed or no tasks, use new tasks. Otherwise keep existing progress
                     tasks: (hasTasks && !typeChanged) ? prev.tasks : shiftTasks
                 };
             });
        }
    }, [currentUser?.id, templates, rosterAssignments, occupancyData]);

    const handleLogin = (user: User) => {
        setCurrentUser(user);
    };

    const handleLogout = () => {
        setCurrentUser(null);
        setCurrentView('dashboard');
    };

    const startNewShift = (type: ShiftType, assignee?: User) => {
        const todayYMD = getTodayStr();
        const todayOcc = occupancyData.find(d => d.date === todayYMD)?.percentage || 75;

        const newTasks = templates
            .filter(t => t.shiftType === 'ALL' || t.shiftType === type)
            .map(t => ({
                id: `t-${Date.now()}-${t.id}`,
                label: t.label,
                category: t.category,
                isCompleted: false
            }));

        setCurrentShift({
            id: `s-${Date.now()}`,
            type: type,
            date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
            tasks: newTasks,
            status: 'active',
            agentName: assignee ? assignee.name : (currentUser?.name || ''),
            occupancy: todayOcc,
            notes: ''
        });
    };

    const toggleTask = (taskId: string) => {
        setCurrentShift(prev => ({
            ...prev,
            tasks: prev.tasks.map(t => t.id === taskId ? { ...t, isCompleted: !t.isCompleted } : t)
        }));
    };

    const updateNotes = (notes: string) => {
        setCurrentShift(prev => ({ ...prev, notes }));
    };

    // User Management Handlers
    const addUser = (user: Omit<User, 'id'>) => {
        setUsers([...users, { ...user, id: Date.now().toString() }]);
    };
    const editUser = (user: User) => {
        setUsers(users.map(u => u.id === user.id ? user : u));
    };
    const deleteUser = (id: string) => {
        setUsers(users.filter(u => u.id !== id));
    };

    if (!currentUser) {
        return <Login users={users} onLogin={handleLogin} appConfig={appConfig} />;
    }

    const renderContent = () => {
        switch(currentView) {
            case 'dashboard':
                return <Dashboard 
                    currentShift={currentShift} 
                    startNewShift={startNewShift} 
                    openChecklist={() => setCurrentView('checklist')} 
                    users={users}
                    currentUser={currentUser}
                    availableShifts={shiftTypes}
                    occupancyData={occupancyData}
                />;
            case 'checklist':
                return <Checklist 
                    shift={currentShift} 
                    onToggleTask={toggleTask}
                    onUpdateNotes={updateNotes}
                    onEndShift={() => alert('Shift Ended')}
                />;
            case 'shift-management':
                return <ShiftManagement 
                    users={users}
                    currentShift={currentShift}
                    onAssignShift={() => {}}
                    initialAssignments={rosterAssignments}
                    onSaveRoster={setRosterAssignments}
                    availableShifts={shiftTypes}
                />;
            case 'occupancy':
                return <OccupancyManagement 
                    occupancyData={occupancyData}
                    onUpdateOccupancy={setOccupancyData}
                />;
            case 'checklist-management':
                 return <ChecklistManagement 
                    templates={templates}
                    availableShifts={shiftTypes}
                    availableCategories={categories}
                    onAddTemplate={(t) => setTemplates([...templates, { ...t, id: Date.now().toString() }])}
                    onDeleteTemplate={(id) => setTemplates(templates.filter(t => t.id !== id))}
                    onAddShift={(s) => setShiftTypes([...shiftTypes, s])}
                    onDeleteShift={(s) => setShiftTypes(shiftTypes.filter(st => st !== s))}
                    onAddCategory={(c) => setCategories([...categories, c])}
                    onDeleteCategory={(c) => setCategories(categories.filter(cat => cat !== c))}
                 />;
            case 'users':
                return <UserManagement 
                    users={users}
                    onAddUser={addUser}
                    onEditUser={editUser}
                    onDeleteUser={deleteUser}
                />;
             case 'admin':
                return <AdminDashboard />;
             case 'history':
                return <ShiftHistory />;
             case 'settings':
                return <Settings userRole={currentUser.role} config={appConfig} onSave={setAppConfig} />;
            default:
                return <Dashboard 
                    currentShift={currentShift} 
                    startNewShift={startNewShift} 
                    openChecklist={() => setCurrentView('checklist')}
                    users={users}
                    currentUser={currentUser}
                    availableShifts={shiftTypes}
                    occupancyData={occupancyData}
                />;
        }
    };

    return (
        <div className="flex bg-gray-50 min-h-screen font-sans text-gray-900">
             <Sidebar currentView={currentView} setCurrentView={setCurrentView} userRole={currentUser.role} appConfig={appConfig} />
             
             <div className="flex-1 md:ml-64 transition-all duration-300">
                 {/* Top Header */}
                 <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-20">
                     <div className="md:hidden">
                         <Menu />
                     </div>
                     <div className="flex items-center gap-4 ml-auto">
                         <button className="p-2 text-gray-400 hover:text-nova-teal transition-colors relative">
                             <Bell size={20} />
                             <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                         </button>
                         <div className="h-8 w-px bg-gray-100 mx-2"></div>
                         <div className="flex items-center gap-3">
                             <div className="text-right hidden sm:block">
                                 <p className="text-sm font-bold text-gray-800">{currentUser.name}</p>
                                 <p className="text-xs text-gray-500">{currentUser.role}</p>
                             </div>
                             <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shadow-sm ${currentUser.color}`}>
                                 {currentUser.initials}
                             </div>
                             <button onClick={handleLogout} className="p-2 text-gray-400 hover:text-red-500 transition-colors ml-2" title="Logout">
                                 <LogOut size={20} />
                             </button>
                         </div>
                     </div>
                 </div>

                 <div className="p-6">
                     {renderContent()}
                 </div>
             </div>
        </div>
    );
};