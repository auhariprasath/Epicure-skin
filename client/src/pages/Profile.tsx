import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/useToast';
import { upsertPatientProfile, getPatientProfile } from '@/api/patient';
import { useAuth } from '@/contexts/AuthContext';

const profileSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  age: z.string().optional(),
  gender: z.string().optional(),
});

type ProfileForm = z.infer<typeof profileSchema>;

export function Profile() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  const form = useForm<ProfileForm>({ resolver: zodResolver(profileSchema) });

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      try {
        const data = await getPatientProfile();
        form.setValue('name', data.name || '');
        if (data.age !== undefined && data.age !== null) form.setValue('age', String(data.age));
        if (data.gender) form.setValue('gender', data.gender);
      } catch (err: any) {
        // If profile not found, leave fields empty and allow user to create one
        if (err?.message && !err.message.toLowerCase().includes('profile not found')) {
          // show a toast for unexpected errors
          toast({ variant: 'destructive', title: 'Error', description: err.message || 'Failed to load profile' });
        }
      }
    };

    load();
  }, [user]);

  const onSubmit = async (data: ProfileForm) => {
    try {
      await upsertPatientProfile({ name: data.name, age: data.age ? Number(data.age) : undefined, gender: data.gender, mail_id: user?.email });
      toast({ title: 'Success', description: 'Profile updated' });
      navigate('/appointments');
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error?.message });
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-20">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Profile</h1>
        <p className="text-muted-foreground">Provide your contact details so doctors can reach you for appointments</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField control={form.control} name="name" render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="age" render={({ field }) => (
            <FormItem>
              <FormLabel>Age</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="gender" render={({ field }) => (
            <FormItem>
              <FormLabel>Gender</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <div className="flex gap-4">
            <Button type="submit" className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600">Save Profile</Button>
            <Button variant="outline" onClick={() => navigate(-1)} className="flex-1">Cancel</Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

export default Profile;
