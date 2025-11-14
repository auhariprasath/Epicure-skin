import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Users, Calendar, MessageSquare, CheckCircle, AlertCircle, Loader2, Check, X } from 'lucide-react';
import { getDoctorStats, getDoctorAppointments, confirmAppointment, declineAppointment, getDoctorReports } from '@/api/doctorDashboard';
import { useToast } from '@/hooks/useToast';

interface Stats {
  totalPatients: number;
  pendingAppointments: number;
  unreadMessages: number;
  completedAppointments: number;
}

interface Appointment {
  _id: string;
  patientName: string;
  patientAge: number;
  patientGender: string;
  doctorName: string;
  doctorId: string;
  date: string;
  time: string;
  status: string;
  disease: string;
  confidence: number;
  imageUrl: string;
}

interface Report {
  _id: string;
  patientName: string;
  disease: string;
  confidence: number;
  timestamp: string;
  status: string;
  imageUrl: string;
}

export function DoctorDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [stats, setStats] = useState<Stats | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [statsData, appointmentsData, reportsData] = await Promise.all([
          getDoctorStats(),
          getDoctorAppointments(),
          getDoctorReports()
        ]);
        setStats(statsData as Stats);
        setAppointments((appointmentsData as { appointments: Appointment[] }).appointments);
        setReports((reportsData as { reports: Report[] }).reports);
      } catch (error) {
        toast({
          title: 'Error',
          description: error instanceof Error ? error.message : 'Failed to load dashboard',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [toast]);

  const handleConfirmAppointment = async (appointmentId: string) => {
    try {
      setActionLoading(appointmentId);
      await confirmAppointment(appointmentId);
      setAppointments(appointments.map(apt =>
        apt._id === appointmentId ? { ...apt, status: 'confirmed' } : apt
      ));
      toast({
        title: 'Success',
        description: 'Appointment confirmed'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to confirm appointment',
        variant: 'destructive'
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeclineAppointment = async (appointmentId: string) => {
    try {
      setActionLoading(appointmentId);
      await declineAppointment(appointmentId, 'Not available at this time');
      setAppointments(appointments.filter(apt => apt._id !== appointmentId));
      toast({
        title: 'Success',
        description: 'Appointment declined'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to decline appointment',
        variant: 'destructive'
      });
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const pendingAppointments = appointments.filter(a => a.status === 'pending');
  const confirmedAppointments = appointments.filter(a => a.status === 'confirmed');

  return (
    <div className="space-y-6 pb-20">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Doctor Dashboard</h1>
        <p className="text-muted-foreground">
          Manage your appointments and patient reports
        </p>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Patients</p>
                  <p className="text-3xl font-bold">{stats.totalPatients}</p>
                </div>
                <Users className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950 dark:to-orange-950">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending Appointments</p>
                  <p className="text-3xl font-bold">{stats.pendingAppointments}</p>
                </div>
                <Calendar className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Unread Messages</p>
                  <p className="text-3xl font-bold">{stats.unreadMessages}</p>
                </div>
                <MessageSquare className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Completed</p>
                  <p className="text-3xl font-bold">{stats.completedAppointments}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Appointments and Reports */}
      <Tabs defaultValue="appointments" className="space-y-4">
        <TabsList>
          <TabsTrigger value="appointments">
            Appointments ({appointments.length})
          </TabsTrigger>
          <TabsTrigger value="reports">
            Patient Reports ({reports.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="appointments" className="space-y-4">
          {appointments.length === 0 ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>No appointments</AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-4">
              {pendingAppointments.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-lg">Pending Requests</h3>
                  {pendingAppointments.map(apt => (
                    <Card key={apt._id}>
                      <CardContent className="pt-6">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                          <div>
                            <p className="text-sm text-muted-foreground">Doctor</p>
                            <p className="font-semibold">{apt.doctorName}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Patient</p>
                            <p className="font-semibold">{apt.patientName}</p>
                            <p className="text-sm text-muted-foreground">
                              {apt.patientAge} years, {apt.patientGender}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Condition</p>
                            <p className="font-semibold">{apt.disease}</p>
                            <Badge variant="secondary">{apt.confidence}% confidence</Badge>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Preferred Time</p>
                            <p className="font-semibold">{new Date(apt.date).toLocaleDateString()}</p>
                            <p className="text-sm">{apt.time}</p>
                          </div>
                        </div>
                        <img
                          src={apt.imageUrl}
                          alt="Patient"
                          className="w-full h-40 object-cover rounded-lg mb-4"
                        />
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleConfirmAppointment(apt._id)}
                            disabled={actionLoading === apt._id}
                            className="flex-1 bg-green-600 hover:bg-green-700"
                          >
                            {actionLoading === apt._id ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              <Check className="mr-2 h-4 w-4" />
                            )}
                            Confirm
                          </Button>
                          <Button
                            onClick={() => handleDeclineAppointment(apt._id)}
                            disabled={actionLoading === apt._id}
                            variant="destructive"
                            className="flex-1"
                          >
                            {actionLoading === apt._id ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              <X className="mr-2 h-4 w-4" />
                            )}
                            Decline
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {confirmedAppointments.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-lg">Confirmed Appointments</h3>
                  {confirmedAppointments.map(apt => (
                    <Card key={apt._id}>
                      <CardContent className="pt-6">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div>
                            <p className="text-sm text-muted-foreground">Doctor</p>
                            <p className="font-semibold">{apt.doctorName}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Patient</p>
                            <p className="font-semibold">{apt.patientName}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Condition</p>
                            <p className="font-semibold">{apt.disease}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Date & Time</p>
                            <p className="font-semibold">{new Date(apt.date).toLocaleDateString()} at {apt.time}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          {reports.length === 0 ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>No patient reports</AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-4">
              {reports.map(report => (
                <Card key={report._id}>
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Patient</p>
                        <p className="font-semibold">{report.patientName}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Condition</p>
                        <p className="font-semibold">{report.disease}</p>
                        <Badge variant="secondary">{report.confidence}% confidence</Badge>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Date</p>
                        <p className="font-semibold">{new Date(report.timestamp).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Status</p>
                        <Badge variant={report.status === 'reviewed' ? 'default' : 'secondary'}>
                          {report.status}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}