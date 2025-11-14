import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Loader2, ArrowLeft } from 'lucide-react';
import { createForumTopic } from '@/api/forum';
import { useToast } from '@/hooks/useToast';
import { useAuth } from '@/contexts/AuthContext';

const topicSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  category: z.string().min(1, 'Please select a category'),
  content: z.string().min(20, 'Content must be at least 20 characters')
});

type TopicFormData = z.infer<typeof topicSchema>;

const CATEGORIES = [
  'General Discussion',
  'Skin Condition Tips',
  'Treatment Experiences',
  'Prevention & Care'
];

export function ForumCreate() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const isDoctor = user?.role === 'doctor';
  const baseUrl = isDoctor ? '/doctor' : '';
  const [loading, setLoading] = useState(false);

  const form = useForm<TopicFormData>({
    resolver: zodResolver(topicSchema)
  });

  const onSubmit = async (data: TopicFormData) => {
    try {
      setLoading(true);
      await createForumTopic(data);

      toast({
        title: 'Success',
        description: 'Topic created successfully'
      });

      navigate(`${baseUrl}/forum`);
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create topic',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-20">
      <Button
        onClick={() => navigate(`${baseUrl}/forum`)}
        variant="outline"
        size="sm"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Forum
      </Button>

      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Create New Topic</h1>
        <p className="text-muted-foreground">
          Share your question or experience with the community
        </p>
      </div>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Please be respectful and follow community guidelines when posting.
        </AlertDescription>
      </Alert>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Topic Title</FormLabel>
                <FormControl>
                  <Input
                    placeholder="What's your question or topic?"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Make it clear and descriptive so others can find it easily
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {CATEGORIES.map(cat => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  Choose the most relevant category for your topic
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Content</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Describe your question or share your experience in detail..."
                    {...field}
                    rows={8}
                  />
                </FormControl>
                <FormDescription>
                  Provide as much detail as possible to help others understand your topic
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(`${baseUrl}/forum`)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Topic'
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}