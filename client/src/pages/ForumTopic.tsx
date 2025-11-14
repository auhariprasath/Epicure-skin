import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, ThumbsUp, Loader2, ArrowLeft } from 'lucide-react';
import { getForumTopic, replyToTopic } from '@/api/forum';
import { useToast } from '@/hooks/useToast';
import { useAuth } from '@/contexts/AuthContext';

interface Reply {
  _id: string;
  author: string;
  authorAvatar: string;
  content: string;
  createdAt: string;
  likeCount: number;
}

interface TopicData {
  _id: string;
  title: string;
  category: string;
  author: string;
  authorAvatar: string;
  content: string;
  createdAt: string;
  likeCount: number;
  isSolved: boolean;
  replies: Reply[];
}

export function ForumTopic() {
  const { topicId } = useParams<{ topicId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const isDoctor = user?.role === 'doctor';
  const baseUrl = isDoctor ? '/doctor' : '';
  const [topic, setTopic] = useState<TopicData | null>(null);
  const [loading, setLoading] = useState(true);
  const [replying, setReplying] = useState(false);
  const [replyText, setReplyText] = useState('');

  useEffect(() => {
    const loadTopic = async () => {
      if (!topicId) return;
      try {
        setLoading(true);
        const data = await getForumTopic(topicId);
        setTopic(data as TopicData);
      } catch (error) {
        toast({
          title: 'Error',
          description: error instanceof Error ? error.message : 'Failed to load topic',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    loadTopic();
  }, [topicId, toast]);

  const handleReply = async () => {
    if (!replyText.trim() || !topic) return;

    try {
      setReplying(true);
      await replyToTopic(topic._id, replyText);

      setTopic({
        ...topic,
        replies: [
          ...topic.replies,
          {
            _id: 'reply_' + Date.now(),
            author: 'You',
            authorAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
            content: replyText,
            createdAt: new Date().toISOString(),
            likeCount: 0
          }
        ]
      });

      setReplyText('');
      toast({
        title: 'Success',
        description: 'Reply posted successfully'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to post reply',
        variant: 'destructive'
      });
    } finally {
      setReplying(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Topic not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      <Button
        onClick={() => navigate(`${baseUrl}/forum`)}
        variant="outline"
        size="sm"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Forum
      </Button>

      {/* Topic Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">{topic.title}</h1>
              <div className="flex items-center gap-3 mb-4">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={topic.authorAvatar} />
                  <AvatarFallback>{topic.author.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{topic.author}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(topic.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
            {topic.isSolved && (
              <Badge className="bg-green-100 text-green-800">Solved</Badge>
            )}
          </div>

          <div className="flex items-center gap-2 mb-4">
            <Badge variant="secondary">{topic.category}</Badge>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <ThumbsUp className="h-4 w-4" />
              <span>{topic.likeCount} likes</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="leading-relaxed text-base">{topic.content}</p>
        </CardContent>
      </Card>

      {/* Replies */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Replies ({topic.replies.length})</h2>

        {topic.replies.length === 0 ? (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              No replies yet. Be the first to respond!
            </AlertDescription>
          </Alert>
        ) : (
          topic.replies.map((reply) => (
            <Card key={reply._id}>
              <CardContent className="pt-6">
                <div className="flex gap-4">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={reply.authorAvatar} />
                    <AvatarFallback>{reply.author.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-semibold">{reply.author}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(reply.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <ThumbsUp className="h-4 w-4" />
                        <span>{reply.likeCount}</span>
                      </div>
                    </div>
                    <p className="leading-relaxed">{reply.content}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Reply Form */}
      <Card>
        <CardHeader>
          <CardTitle>Post a Reply</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Share your thoughts or experience..."
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            rows={5}
          />
          <div className="flex gap-3">
            <Button
              onClick={() => navigate(`${baseUrl}/forum`)}
              variant="outline"
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleReply}
              disabled={replying || !replyText.trim()}
              className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
            >
              {replying ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Posting...
                </>
              ) : (
                'Post Reply'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}