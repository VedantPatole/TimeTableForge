import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  GraduationCap,
  BookOpen,
  Users,
  Clock,
  MapPin,
  ArrowRight,
  User,
  Mail,
  Building2
} from 'lucide-react';
import axios from 'axios';

interface StudentData {
  department: {
    id: string;
    name: string;
    code: string;
  };
  division: {
    id: string;
    name: string;
    capacity: number;
  };
  student: {
    id: string;
    rollNumber: string;
    year: number;
  };
}

interface WeeklySchedule {
  total_classes_per_week: number;
  subjects: Array<{
    subject: {
      name: string;
      code: string;
      type: string;
    };
    total_classes: number;
  }>;
  daily_distribution: {
    monday: number;
    tuesday: number;
    wednesday: number;
    thursday: number;
    friday: number;
    saturday: number;
    sunday: number;
  };
}

export default function Dashboard() {
  const { user } = useAuth();
  const [studentData, setStudentData] = useState<StudentData | null>(null);
  const [schedule, setSchedule] = useState<WeeklySchedule | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user?.role === 'student') {
      fetchStudentData();
      fetchSchedule();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchStudentData = async () => {
    try {
      const response = await axios.get('/api/my-department');
      if (response.data.success) {
        setStudentData(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch student data:', error);
      setError('Failed to load student information');
    }
  };

  const fetchSchedule = async () => {
    try {
      const response = await axios.get('/api/timetable/my-schedule');
      if (response.data.success) {
        setSchedule(response.data.data.summary);
      }
    } catch (error) {
      console.error('Failed to fetch schedule:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNavigateToTimetable = () => {
    window.location.href = '/timetables';
  };

  const handleNavigateToSubjects = () => {
    window.location.href = '/subjects';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (user?.role !== 'student') {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <GraduationCap className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <h2 className="text-xl font-semibold mb-2">Welcome, {user?.name}</h2>
                <p className="text-gray-600 mb-4">
                  You are logged in as a {user?.role}. 
                  This dashboard is currently optimized for students.
                </p>
                <Button onClick={handleNavigateToTimetable}>
                  Go to Timetables
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Student Dashboard</h1>
          <p className="text-gray-600">
            Welcome back! Here's your academic overview and quick access to your timetable.
          </p>
        </div>

        {error && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="pt-4">
              <p className="text-red-600">{error}</p>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Student Info Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="w-5 h-5" />
                <span>Student Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4 text-gray-500" />
                <span className="font-medium">{user.name}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">{user.email}</span>
              </div>
              {studentData && (
                <>
                  <div className="flex items-center space-x-2">
                    <GraduationCap className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">Roll: {studentData.student.rollNumber}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">Year: {studentData.student.year}</span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Department Info Card */}
          {studentData && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Building2 className="w-5 h-5" />
                  <span>Department & Division</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="font-medium">{studentData.department.name}</p>
                  <p className="text-sm text-gray-600">Code: {studentData.department.code}</p>
                </div>
                <div>
                  <p className="font-medium">{studentData.division.name}</p>
                  <p className="text-sm text-gray-600">
                    Capacity: {studentData.division.capacity} students
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Weekly Schedule Summary */}
          {schedule && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="w-5 h-5" />
                  <span>This Week</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {schedule.total_classes_per_week}
                  </div>
                  <p className="text-sm text-gray-600">Total Classes</p>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold">
                    {schedule.subjects.length}
                  </div>
                  <p className="text-sm text-gray-600">Subjects</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg mb-2">View Timetable</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Check your complete weekly schedule and class timings
                  </p>
                  <Button onClick={handleNavigateToTimetable} className="w-full sm:w-auto">
                    View Timetable <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
                <Calendar className="w-12 h-12 text-blue-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg mb-2">Browse Subjects</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Explore your subjects and course details
                  </p>
                  <Button onClick={handleNavigateToSubjects} variant="outline" className="w-full sm:w-auto">
                    Browse Subjects <BookOpen className="w-4 h-4 ml-2" />
                  </Button>
                </div>
                <BookOpen className="w-12 h-12 text-green-600 opacity-20" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Subjects Overview */}
        {schedule && schedule.subjects.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Your Subjects</CardTitle>
              <CardDescription>
                Overview of subjects you're enrolled in this semester
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {schedule.subjects.map((item, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{item.subject.name}</h4>
                      <Badge variant="secondary">
                        {item.subject.type}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      Code: {item.subject.code}
                    </p>
                    <p className="text-sm">
                      {item.total_classes} classes/week
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}