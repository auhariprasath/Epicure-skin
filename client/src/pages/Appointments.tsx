import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, Calendar, Clock, User, Loader2, X, Check } from 'lucide-react';
import { getAppointments, cancelAppointment, confirmAppointment, updateAppointmentStatus } from '@/api/appointments';
import { useToast } from '@/hooks/useToast';
import { useAuth } from '@/contexts/AuthContext';

interface Appointment {
  _id: string;
  doctorId: string;
  doctorName: string;
  patientName?: string;
  patientEmail?: string;
  doctorAvatar: string;
  date: string;
  time: string;
  status: string;
  disease: string;
  confidence: number;
}

export function Appointments() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [canceling, setCanceling] = useState<string | null>(null);
  const [confirming, setConfirming] = useState<string | null>(null);
  const isDoctor = user?.role === 'doctor';

  useEffect(() => {
    const loadAppointments = async () => {
      try {
        setLoading(true);
        const data = await getAppointments();
        setAppointments((data as { appointments: Appointment[] }).appointments);
      } catch (error) {
        toast({
          title: 'Error',
          description: error instanceof Error ? error.message : 'Failed to load appointments',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    loadAppointments();
  }, [toast]);

  const handleCancel = async (appointmentId: string) => {
    try {
      setCanceling(appointmentId);
      await cancelAppointment(appointmentId);
      setAppointments(appointments.map(a => a._id === appointmentId ? { ...a, status: 'cancelled' } : a));
      toast({
        title: 'Success',
        description: 'Appointment cancelled successfully'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to cancel appointment',
        variant: 'destructive'
      });
    } finally {
      setCanceling(null);
    }
  };

  const handleConfirm = async (appointmentId: string) => {
    try {
      setConfirming(appointmentId);
      await confirmAppointment(appointmentId);
      setAppointments(appointments.map(a => a._id === appointmentId ? { ...a, status: 'confirmed' } : a));
      toast({
        title: 'Success',
        description: 'Appointment confirmed successfully'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to confirm appointment',
        variant: 'destructive'
      });
    } finally {
      setConfirming(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const pendingAppointments = appointments.filter(a => a.status === 'pending');
  const confirmedAppointments = appointments.filter(a => a.status === 'confirmed');
  const completedAppointments = appointments.filter(a => a.status === 'completed');

  const AppointmentCard = ({ appointment }: { appointment: Appointment }) => (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <img
                src={appointment.doctorAvatar}
                alt={appointment.doctorName}
                className="h-12 w-12 rounded-full"
              />
              <div>
                <h3 className="font-semibold">{appointment.doctorName}</h3>
                <p className="text-sm text-muted-foreground">{appointment.disease}</p>
              </div>
            </div>
            <Badge className={getStatusColor(appointment.status)}>
              {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>{new Date(appointment.date).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>{appointment.time}</span>
            </div>
          </div>

          {appointment.status === 'pending' && !isDoctor && (
            <Button
              onClick={() => handleCancel(appointment._id)}
              disabled={canceling === appointment._id}
              variant="destructive"
              size="sm"
              className="w-full"
            >
              {canceling === appointment._id ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Canceling...
                </>
              ) : (
                <>
                  <X className="mr-2 h-4 w-4" />
                  Cancel Request
                </>
              )}
            </Button>
          )}

          {appointment.status === 'pending' && isDoctor && (
            <div className="flex gap-2">
              <Button
                onClick={() => handleConfirm(appointment._id)}
                disabled={confirming === appointment._id}
                className="flex-1 bg-green-600 hover:bg-green-700"
                size="sm"
              >
                {confirming === appointment._id ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Confirming...
                  </>
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Confirm
                  </>
                )}
              </Button>
              <Button
                onClick={() => handleCancel(appointment._id)}
                disabled={canceling === appointment._id}
                variant="destructive"
                size="sm"
                className="flex-1"
              >
                {canceling === appointment._id ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Declining...
                  </>
                ) : (
                  <>
                    <X className="mr-2 h-4 w-4" />
                    Decline
                  </>
                )}
              </Button>
            </div>
          )}

          {appointment.status === 'pending' && (
            <div className="text-xs text-muted-foreground bg-yellow-50 p-2 rounded">
              {isDoctor ? `Patient: ${appointment.patientName}` : 'Waiting for doctor to respond...'}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">My Appointments</h1>
        <p className="text-muted-foreground">
          Manage your appointments with dermatologists
        </p>
      </div>

      {appointments.length === 0 ? (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No appointments yet. Connect with a doctor to schedule one.
          </AlertDescription>
        </Alert>
      ) : (
        <Tabs defaultValue="pending" className="space-y-4">
          <TabsList>
            <TabsTrigger value="pending">
              Pending ({pendingAppointments.length})
            </TabsTrigger>
            <TabsTrigger value="confirmed">
              Confirmed ({confirmedAppointments.length})
            </TabsTrigger>
            <TabsTrigger value="completed">
              Completed ({completedAppointments.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            {pendingAppointments.length === 0 ? (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>No pending appointments</AlertDescription>
              </Alert>
            ) : (
              pendingAppointments.map(apt => (
                <AppointmentCard key={apt._id} appointment={apt} />
              ))
            )}
          </TabsContent>

          <TabsContent value="confirmed" className="space-y-4">
            {confirmedAppointments.length === 0 ? (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>No confirmed appointments</AlertDescription>
              </Alert>
            ) : (
              confirmedAppointments.map(apt => (
                <AppointmentCard key={apt._id} appointment={apt} />
              ))
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            {completedAppointments.length === 0 ? (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>No completed appointments</AlertDescription>
              </Alert>
            ) : (
              completedAppointments.map(apt => (
                <AppointmentCard key={apt._id} appointment={apt} />
              ))
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}