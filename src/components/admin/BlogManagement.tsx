import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlusCircle, Edit, Trash2, Eye, Save, X, RefreshCw, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { useRealtimeSubscription } from "@/hooks/useRealtimeSubscription";
import { Skeleton } from "@/components/ui/skeleton";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featured_image_url: string | null;
  author_name: string;
  category_id: string | null;
  published_at: string | null;
  is_published: boolean;
  meta_title: string | null;
  meta_description: string | null;
  view_count: number;
  created_at: string;
  blog_categories: {
    name: string;
    slug: string;
  } | null;
}

interface BlogCategory {
  id: string;
  name: string;
  slug: string;
}

// Fetch functions
const fetchPosts = async (): Promise<BlogPost[]> => {
  const { data, error } = await supabase
    .from('blog_posts')
    .select(`*, blog_categories (name, slug)`)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
};

const fetchCategories = async (): Promise<BlogCategory[]> => {
  const { data, error } = await supabase
    .from('blog_categories')
    .select('*')
    .order('name');
  if (error) throw error;
  return data || [];
};

const BlogManagement = () => {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    featured_image_url: "",
    author_name: "MyRecruita Team",
    category_id: "",
    is_published: false,
    meta_title: "",
    meta_description: "",
    published_at: ""
  });

  // React Query hooks
  const { data: posts = [], isLoading: loadingPosts, isError: errorPosts, refetch: refetchPosts } = useQuery({
    queryKey: queryKeys.blogPosts,
    queryFn: fetchPosts,
  });

  const { data: categories = [] } = useQuery({
    queryKey: queryKeys.blogCategories,
    queryFn: fetchCategories,
  });

  // Real-time subscription
  useRealtimeSubscription({
    table: 'blog_posts',
    queryKeys: [queryKeys.blogPosts],
    showToasts: true,
    toastMessages: {
      insert: (data) => `New blog post: ${data.title}`,
      update: (data) => `Blog post updated: ${data.title}`,
      delete: () => 'Blog post deleted',
    },
  });

  // Create/Update mutation
  const saveMutation = useMutation({
    mutationFn: async (postData: typeof formData & { id?: string }) => {
      const payload = {
        ...postData,
        category_id: postData.category_id || null,
        published_at: postData.is_published ? (postData.published_at || new Date().toISOString()) : null,
        meta_title: postData.meta_title || postData.title,
        meta_description: postData.meta_description || postData.excerpt
      };

      if (postData.id) {
        const { error } = await supabase
          .from('blog_posts')
          .update(payload)
          .eq('id', postData.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('blog_posts')
          .insert([payload]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success(`Blog post ${editingPost ? 'updated' : 'created'} successfully`);
      setDialogOpen(false);
      resetForm();
      queryClient.invalidateQueries({ queryKey: queryKeys.blogPosts });
    },
    onError: (error) => {
      console.error('Error saving post:', error);
      toast.error('Failed to save blog post');
    },
  });

  // Delete mutation with optimistic update
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.blogPosts });
      const previousPosts = queryClient.getQueryData<BlogPost[]>(queryKeys.blogPosts);
      queryClient.setQueryData<BlogPost[]>(queryKeys.blogPosts, (old) =>
        old?.filter((post) => post.id !== id) || []
      );
      return { previousPosts };
    },
    onError: (err, id, context) => {
      queryClient.setQueryData(queryKeys.blogPosts, context?.previousPosts);
      toast.error('Failed to delete blog post');
      console.error('Delete error:', err);
    },
    onSuccess: () => {
      toast.success('Blog post deleted successfully');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.blogPosts });
    },
  });

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    if (field === 'title') {
      setFormData(prev => ({
        ...prev,
        slug: generateSlug(value as string)
      }));
    }
  };

  const handleImageUpload = async (file: File) => {
    try {
      setUploading(true);
      
      const fileExt = file.name.split('.').pop();
      const fileName = `blog-images/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('cv-uploads')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('cv-uploads')
        .getPublicUrl(fileName);

      setFormData(prev => ({
        ...prev,
        featured_image_url: publicUrl
      }));

      toast.success('Featured image uploaded successfully');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.content) {
      toast.error('Title and content are required');
      return;
    }

    saveMutation.mutate({
      ...formData,
      id: editingPost?.id,
    });
  };

  const handleEdit = (post: BlogPost) => {
    setEditingPost(post);
    setFormData({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt || "",
      content: post.content,
      featured_image_url: post.featured_image_url || "",
      author_name: post.author_name,
      category_id: post.category_id || "",
      is_published: post.is_published,
      meta_title: post.meta_title || "",
      meta_description: post.meta_description || "",
      published_at: post.published_at ? format(new Date(post.published_at), "yyyy-MM-dd'T'HH:mm") : ""
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this blog post?')) return;
    deleteMutation.mutate(id);
  };

  const resetForm = () => {
    setFormData({
      title: "",
      slug: "",
      excerpt: "",
      content: "",
      featured_image_url: "",
      author_name: "MyRecruita Team",
      category_id: "",
      is_published: false,
      meta_title: "",
      meta_description: "",
      published_at: ""
    });
    setEditingPost(null);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    resetForm();
  };

  if (errorPosts) {
    return (
      <Card className="border-destructive/20 bg-destructive/5">
        <CardContent className="p-8 text-center">
          <AlertTriangle className="w-8 h-8 text-destructive mx-auto mb-3" />
          <p className="text-destructive font-medium mb-2">Failed to load blog posts</p>
          <Button onClick={() => refetchPosts()} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Blog Management</h2>
        <div className="flex gap-2">
          <Button onClick={() => refetchPosts()} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <PlusCircle className="mr-2 h-4 w-4" />
                New Post
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingPost ? 'Edit Blog Post' : 'Create New Blog Post'}</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      placeholder="Enter blog post title..."
                    />
                  </div>

                  <div>
                    <Label htmlFor="slug">Slug</Label>
                    <Input
                      id="slug"
                      value={formData.slug}
                      onChange={(e) => handleInputChange('slug', e.target.value)}
                      placeholder="url-friendly-slug"
                    />
                  </div>

                  <div>
                    <Label htmlFor="excerpt">Excerpt</Label>
                    <Textarea
                      id="excerpt"
                      value={formData.excerpt}
                      onChange={(e) => handleInputChange('excerpt', e.target.value)}
                      placeholder="Brief description..."
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="author">Author</Label>
                    <Input
                      id="author"
                      value={formData.author_name}
                      onChange={(e) => handleInputChange('author_name', e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select value={formData.category_id} onValueChange={(value) => handleInputChange('category_id', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">No category</SelectItem>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="featured-image">Featured Image</Label>
                    <div className="space-y-2">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleImageUpload(file);
                        }}
                        disabled={uploading}
                      />
                      {formData.featured_image_url && (
                        <img 
                          src={formData.featured_image_url} 
                          alt="Featured" 
                          className="w-full h-32 object-cover rounded"
                        />
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={formData.is_published}
                      onCheckedChange={(checked) => handleInputChange('is_published', checked)}
                    />
                    <Label>Published</Label>
                  </div>

                  {formData.is_published && (
                    <div>
                      <Label htmlFor="published_at">Publish Date</Label>
                      <Input
                        id="published_at"
                        type="datetime-local"
                        value={formData.published_at}
                        onChange={(e) => handleInputChange('published_at', e.target.value)}
                      />
                    </div>
                  )}
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="content">Content *</Label>
                    <Textarea
                      id="content"
                      value={formData.content}
                      onChange={(e) => handleInputChange('content', e.target.value)}
                      placeholder="Write your blog post content here..."
                      rows={15}
                      className="font-mono"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Supports basic formatting: # Heading, ## Subheading, - List items, &gt; Blockquote
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="meta_title">SEO Title</Label>
                    <Input
                      id="meta_title"
                      value={formData.meta_title}
                      onChange={(e) => handleInputChange('meta_title', e.target.value)}
                      placeholder="SEO optimized title..."
                    />
                  </div>

                  <div>
                    <Label htmlFor="meta_description">SEO Description</Label>
                    <Textarea
                      id="meta_description"
                      value={formData.meta_description}
                      onChange={(e) => handleInputChange('meta_description', e.target.value)}
                      placeholder="SEO meta description..."
                      rows={3}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={handleDialogClose}>
                  <X className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
                <Button onClick={handleSubmit} disabled={uploading || saveMutation.isPending}>
                  <Save className="mr-2 h-4 w-4" />
                  {saveMutation.isPending ? 'Saving...' : (editingPost ? 'Update' : 'Create')} Post
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Blog Posts</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingPosts ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-full" />
                </div>
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Views</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {posts.map((post) => (
                  <TableRow key={post.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{post.title}</div>
                        <div className="text-sm text-muted-foreground">/{post.slug}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {post.blog_categories ? (
                        <Badge variant="outline">{post.blog_categories.name}</Badge>
                      ) : (
                        <span className="text-muted-foreground">Uncategorized</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={post.is_published ? "default" : "secondary"}>
                        {post.is_published ? "Published" : "Draft"}
                      </Badge>
                    </TableCell>
                    <TableCell>{post.view_count}</TableCell>
                    <TableCell>
                      {format(new Date(post.created_at), "MMM dd, yyyy")}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => window.open(`/blog/${post.slug}`, '_blank')}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(post)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(post.id)}
                          disabled={deleteMutation.isPending}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {posts.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No blog posts yet. Create your first post!
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BlogManagement;
