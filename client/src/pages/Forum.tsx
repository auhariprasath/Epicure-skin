import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Search, Plus, MessageCircle, ThumbsUp, Loader2 } from 'lucide-react';
import { getForumTopics } from '@/api/forum';
import { useToast } from '@/hooks/useToast';
import { useAuth } from '@/contexts/AuthContext';

interface Topic {
  _id: string;
  title: string;
  category: string;
  author: string;
  authorAvatar: string;
  createdAt: string;
  replyCount: number;
  likeCount: number;
  isSolved: boolean;
}

const CATEGORIES = [
  'General Discussion',
  'Skin Condition Tips',
  'Treatment Experiences',
  'Prevention & Care'
];

export function Forum() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const isDoctor = user?.role === 'doctor';
  const baseUrl = isDoctor ? '/doctor' : '';
  const [topics, setTopics] = useState<Topic[]>([]);
  const [filteredTopics, setFilteredTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('latest');

  useEffect(() => {
    const loadTopics = async () => {
      try {
        setLoading(true);
        const data = await getForumTopics();
        setTopics((data as { topics: Topic[] }).topics);
      } catch (error) {
        toast({
          title: 'Error',
          description: error instanceof Error ? error.message : 'Failed to load topics',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    loadTopics();
  }, [toast]);

  useEffect(() => {
    let filtered = topics.filter(topic =>
      topic.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(topic => topic.category === selectedCategory);
    }

    if (sortBy === 'latest') {
      filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (sortBy === 'popular') {
      filtered.sort((a, b) => b.likeCount - a.likeCount);
    } else if (sortBy === 'replies') {
      filtered.sort((a, b) => b.replyCount - a.replyCount);
    }

    setFilteredTopics(filtered);
  }, [searchTerm, selectedCategory, sortBy, topics]);

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Community Forum</h1>
          <p className="text-muted-foreground">
            Share experiences, ask questions, and learn from others
          </p>
        </div>
        <Button
          onClick={() => navigate(`${baseUrl}/forum/create`)}
          className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
        >
          <Plus className="mr-2 h-4 w-4" />
          New Topic
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search topics..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <p className="text-sm font-semibold mb-2">Category</p>
            <div className="flex flex-wrap gap-2">
              <Badge
                variant={selectedCategory === 'all' ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => setSelectedCategory('all')}
              >
                All
              </Badge>
              {CATEGORIES.map(cat => (
                <Badge
                  key={cat}
                  variant={selectedCategory === cat ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold mb-2">Sort By</p>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border rounded-lg bg-background"
            >
              <option value="latest">Latest</option>
              <option value="popular">Most Popular</option>
              <option value="replies">Most Replies</option>
            </select>
          </div>
        </div>
      </div>

      {/* Topics List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : filteredTopics.length === 0 ? (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No topics found. Be the first to create one!
          </AlertDescription>
        </Alert>
      ) : (
        <div className="space-y-4">
          {filteredTopics.map((topic) => (
            <Card
              key={topic._id}
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => navigate(`${baseUrl}/forum/topic/${topic._id}`)}
            >
              <CardContent className="pt-6">
                <div className="flex gap-4">
                  <img
                    src={topic.authorAvatar}
                    alt={topic.author}
                    className="h-12 w-12 rounded-full"
                  />
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-lg font-semibold hover:text-blue-600">
                          {topic.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          by {topic.author} • {new Date(topic.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      {topic.isSolved && (
                        <Badge className="bg-green-100 text-green-800">Solved</Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <Badge variant="secondary">{topic.category}</Badge>
                      <div className="flex items-center gap-1">
                        <MessageCircle className="h-4 w-4" />
                        <span>{topic.replyCount} replies</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <ThumbsUp className="h-4 w-4" />
                        <span>{topic.likeCount} likes</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}