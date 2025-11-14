import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Star, Loader2, Calendar } from 'lucide-react';
import { getDoctorById, requestAppointment } from '@/api/doctors';
import { ToastAction } from '@/components/ui/toast';
import { getReports } from '@/api/reports';
import { useToast } from '@/hooks/useToast';

const appointmentSchema = z.object({
  reportId: z.string().min(1, 'Please select a report'),
  message: z.string().optional(),
  preferredDate: z.string().optional(),
  preferredTime: z.string().optional()
});

type AppointmentFormData = z.infer<typeof appointmentSchema>;

interface Doctor {
  _id: string;
  name: string;
  specialization: string;
  bio: string;
  qualifications: string[];
  responseTime: string;
  isAvailable: boolean;
  avatar: string;
  rating: number;
  reviewCount: number;
  experience: number;
}

interface Report {
  _id: string;
  disease: string;
  confidence: number;
  timestamp: string;
}

export function DoctorProfile() {
  const { doctorId } = useParams<{ doctorId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [open, setOpen] = useState(false);

  const form = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentSchema)
  });

  useEffect(() => {
    const loadData = async () => {
      if (!doctorId) return;
      try {
        setLoading(true);
        const [doctorData, reportsData] = await Promise.all([
          getDoctorById(doctorId),
          getReports()
        ]);
        setDoctor(doctorData as Doctor);
        setReports((reportsData as { reports: Report[] }).reports);
      } catch (error) {
        toast({
          title: 'Error',
          description: error instanceof Error ? error.message : 'Failed to load data',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [doctorId, toast]);

  const onSubmit = async (data: AppointmentFormData) => {
    if (!doctor) return;
    try {
      setSubmitting(true);
      await requestAppointment({
        doctorId: doctor._id,
        reportId: data.reportId,
        message: data.message,
        preferredDate: data.preferredDate,
        preferredTime: data.preferredTime
      });

      toast({
        title: 'Success',
        description: 'Appointment request sent successfully'
      });

      setOpen(false);
      form.reset();
      navigate('/appointments');
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Failed to request appointment';
      // If server asks user to complete patient profile, show a toast with an action to navigate to profile
      if (typeof msg === 'string' && msg.toLowerCase().includes('patient profile')) {
        toast({
          title: 'Complete Profile',
          description: 'Please complete your patient profile before requesting an appointment',
          variant: 'destructive',
          action: (
            <ToastAction asChild>
              <Button onClick={() => navigate('/profile')}>Complete Profile</Button>
            </ToastAction>
          )
        });
        return;
      }

      toast({
        title: 'Error',
        description: msg,
        variant: 'destructive'
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Doctor not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      {/* Doctor Header */}
      <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-6">
            <Avatar className="h-32 w-32">
              <AvatarImage src={doctor.avatar} />
              <AvatarFallback>{doctor.name.charAt(0)}</AvatarFallback>
            </Avatar>

            <div className="flex-1 space-y-4">
              <div>
                <h1 className="text-3xl font-bold">{doctor.name}</h1>
                <p className="text-lg text-muted-foreground">{doctor.specialization}</p>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-5 w-5 ${
                          i < Math.floor(doctor.rating)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="font-semibold">{doctor.rating}</span>
                  <span className="text-sm text-muted-foreground">({doctor.reviewCount} reviews)</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Badge variant={doctor.isAvailable ? 'default' : 'secondary'}>
                  {doctor.isAvailable ? 'Available' : 'Unavailable'}
                </Badge>
                <Badge variant="outline">{doctor.experience} years experience</Badge>
                <Badge variant="outline">Response: {doctor.responseTime}</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bio */}
      <Card>
        <CardHeader>
          <CardTitle>About</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="leading-relaxed">{doctor.bio}</p>
        </CardContent>
      </Card>

      {/* Qualifications */}
      <Card>
        <CardHeader>
          <CardTitle>Qualifications & Credentials</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {doctor.qualifications.map((qual, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <span className="text-blue-500 font-bold mt-1">✓</span>
                <span>{qual}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Request Appointment */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button
            size="lg"
            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
            disabled={!doctor.isAvailable}
          >
            <Calendar className="mr-2 h-5 w-5" />
            {doctor.isAvailable ? 'Request Appointment' : 'Currently Unavailable'}
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Request Appointment</DialogTitle>
            <DialogDescription>
              Send your report and request an appointment with {doctor.name}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="reportId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Select Report</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose a report to share" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {reports.map((report) => (
                          <SelectItem key={report._id} value={report._id}>
                            {report.disease} - {new Date(report.timestamp).toLocaleDateString()}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Message (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Add any additional information or concerns..."
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="preferredDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preferred Date (Optional)</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="preferredTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preferred Time (Optional)</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select time" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="09:00">9:00 AM</SelectItem>
                        <SelectItem value="10:00">10:00 AM</SelectItem>
                        <SelectItem value="11:00">11:00 AM</SelectItem>
                        <SelectItem value="14:00">2:00 PM</SelectItem>
                        <SelectItem value="15:00">3:00 PM</SelectItem>
                        <SelectItem value="16:00">4:00 PM</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    'Send Request'
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}