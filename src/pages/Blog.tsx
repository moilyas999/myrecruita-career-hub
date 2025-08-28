import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Search, Calendar, User, ArrowRight, BookOpen, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSEO } from "@/hooks/useSEO";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  featured_image_url: string | null;
  author_name: string;
  published_at: string;
  view_count: number;
  blog_categories: {
    name: string;
    slug: string;
  } | null;
}

interface SidebarPost {
  id: string;
  title: string;
  slug: string;
  published_at: string;
  view_count?: number;
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

const POSTS_PER_PAGE = 10;

const Blog = () => {
  console.log("Blog component loading...");
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  
  useSEO({
    title: "Career & Industry Blog | MyRecruita Insights",
    description: "Stay updated with career advice, industry insights, interview tips, and recruitment trends. Expert guidance for your professional journey.",
    canonical: `${window.location.origin}/blog`
  });

  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [recentPosts, setRecentPosts] = useState<SidebarPost[]>([]);
  const [popularPosts, setPopularPosts] = useState<SidebarPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPosts, setTotalPosts] = useState(0);
  
  const searchQuery = searchParams.get('search') || '';
  const selectedCategory = searchParams.get('category') || '';
  const currentPage = parseInt(searchParams.get('page') || '1');

  const fetchPosts = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('blog_posts')
        .select(`
          id,
          title,
          slug,
          excerpt,
          featured_image_url,
          author_name,
          published_at,
          view_count,
          blog_categories (
            name,
            slug
          )
        `, { count: 'exact' })
        .eq('is_published', true)
        .order('published_at', { ascending: false });

      // Apply search filter
      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,excerpt.ilike.%${searchQuery}%,content.ilike.%${searchQuery}%`);
      }

      // Apply category filter
      if (selectedCategory) {
        const { data: categoryData } = await supabase
          .from('blog_categories')
          .select('id')
          .eq('slug', selectedCategory)
          .single();
        
        if (categoryData) {
          query = query.eq('category_id', categoryData.id);
        }
      }

      // Apply pagination
      const from = (currentPage - 1) * POSTS_PER_PAGE;
      const to = from + POSTS_PER_PAGE - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) throw error;

      setPosts(data || []);
      setTotalPosts(count || 0);
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast({
        title: "Error",
        description: "Failed to load blog posts",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchSidebarData = async () => {
    try {
      // Fetch categories
      const { data: categoriesData } = await supabase
        .from('blog_categories')
        .select('id, name, slug')
        .order('name');

      if (categoriesData) {
        setCategories(categoriesData);
      }

      // Fetch recent posts
      const { data: recentData } = await supabase
        .from('blog_posts')
        .select(`
          id,
          title,
          slug,
          published_at,
          blog_categories (name, slug)
        `)
        .eq('is_published', true)
        .order('published_at', { ascending: false })
        .limit(5);

      if (recentData) {
        setRecentPosts(recentData);
      }

      // Fetch popular posts
      const { data: popularData } = await supabase
        .from('blog_posts')
        .select(`
          id,
          title,
          slug,
          view_count,
          published_at,
          blog_categories (name, slug)
        `)
        .eq('is_published', true)
        .order('view_count', { ascending: false })
        .limit(5);

      if (popularData) {
        setPopularPosts(popularData);
      }
    } catch (error) {
      console.error('Error fetching sidebar data:', error);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [searchQuery, selectedCategory, currentPage]);

  useEffect(() => {
    fetchSidebarData();
  }, []);

  const handleSearch = (value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set('search', value);
    } else {
      params.delete('search');
    }
    params.delete('page');
    setSearchParams(params);
  };

  const handleCategoryFilter = (category: string) => {
    const params = new URLSearchParams(searchParams);
    if (category && category !== 'all') {
      params.set('category', category);
    } else {
      params.delete('category');
    }
    params.delete('page');
    setSearchParams(params);
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', page.toString());
    setSearchParams(params);
  };

  const totalPages = Math.ceil(totalPosts / POSTS_PER_PAGE);

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">Career & Industry Blog</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Stay updated with the latest career advice, industry insights, and recruitment trends
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search blog posts..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedCategory} onValueChange={handleCategoryFilter}>
              <SelectTrigger className="md:w-48">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.slug}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="grid gap-6">
                {[...Array(3)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <div className="md:flex">
                      <div className="md:w-1/3">
                        <div className="h-48 bg-muted rounded-lg"></div>
                      </div>
                      <div className="md:w-2/3 p-6">
                        <div className="h-4 bg-muted rounded mb-2"></div>
                        <div className="h-6 bg-muted rounded mb-4"></div>
                        <div className="h-16 bg-muted rounded mb-4"></div>
                        <div className="flex gap-2">
                          <div className="h-6 w-20 bg-muted rounded"></div>
                          <div className="h-6 w-24 bg-muted rounded"></div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : posts.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No posts found</h3>
                  <p className="text-muted-foreground">
                    {searchQuery || selectedCategory 
                      ? "Try adjusting your search criteria" 
                      : "Check back soon for new content"}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="grid gap-6 mb-8">
                  {posts.map((post) => (
                    <Card key={post.id} className="shadow-card hover:shadow-card-lg transition-all duration-300">
                      <div className="md:flex">
                        {post.featured_image_url && (
                          <div className="md:w-1/3">
                            <img
                              src={post.featured_image_url}
                              alt={post.title}
                              className="w-full h-48 md:h-full object-cover rounded-t-lg md:rounded-l-lg md:rounded-t-none"
                            />
                          </div>
                        )}
                        <div className={`${post.featured_image_url ? 'md:w-2/3' : 'w-full'} p-6`}>
                          <div className="flex items-center gap-2 mb-3">
                            {post.blog_categories && (
                              <Badge variant="secondary">{post.blog_categories.name}</Badge>
                            )}
                            <div className="flex items-center text-sm text-muted-foreground">
                              <Calendar className="h-4 w-4 mr-1" />
                              {format(new Date(post.published_at), 'MMM dd, yyyy')}
                            </div>
                          </div>
                          
                          <CardTitle className="mb-3 hover:text-accent transition-colors">
                            <Link to={`/blog/${post.slug}`}>
                              {post.title}
                            </Link>
                          </CardTitle>
                          
                          <p className="text-muted-foreground mb-4 line-clamp-3">
                            {post.excerpt}
                          </p>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center">
                                <User className="h-4 w-4 mr-1" />
                                {post.author_name}
                              </div>
                              <div className="flex items-center">
                                <BookOpen className="h-4 w-4 mr-1" />
                                {post.view_count} reads
                              </div>
                            </div>
                            
                            <Button asChild variant="ghost" size="sm">
                              <Link to={`/blog/${post.slug}`}>
                                Read More
                                <ArrowRight className="ml-2 h-4 w-4" />
                              </Link>
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <Pagination>
                    <PaginationContent>
                      {currentPage > 1 && (
                        <PaginationItem>
                          <PaginationPrevious 
                            onClick={() => handlePageChange(currentPage - 1)}
                            className="cursor-pointer"
                          />
                        </PaginationItem>
                      )}
                      
                      {[...Array(totalPages)].map((_, i) => {
                        const page = i + 1;
                        if (
                          page === 1 ||
                          page === totalPages ||
                          (page >= currentPage - 1 && page <= currentPage + 1)
                        ) {
                          return (
                            <PaginationItem key={page}>
                              <PaginationLink
                                onClick={() => handlePageChange(page)}
                                isActive={currentPage === page}
                                className="cursor-pointer"
                              >
                                {page}
                              </PaginationLink>
                            </PaginationItem>
                          );
                        }
                        return null;
                      })}
                      
                      {currentPage < totalPages && (
                        <PaginationItem>
                          <PaginationNext 
                            onClick={() => handlePageChange(currentPage + 1)}
                            className="cursor-pointer"
                          />
                        </PaginationItem>
                      )}
                    </PaginationContent>
                  </Pagination>
                )}
              </>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Categories */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Categories</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant={!selectedCategory ? "default" : "ghost"}
                  size="sm"
                  onClick={() => handleCategoryFilter('all')}
                  className="w-full justify-start"
                >
                  All Posts
                </Button>
                {categories.map((category) => (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.slug ? "default" : "ghost"}
                    size="sm"
                    onClick={() => handleCategoryFilter(category.slug)}
                    className="w-full justify-start"
                  >
                    {category.name}
                  </Button>
                ))}
              </CardContent>
            </Card>

            {/* Recent Posts */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Posts</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentPosts.map((post) => (
                  <div key={post.id} className="border-b border-border last:border-0 pb-4 last:pb-0">
                    <Link 
                      to={`/blog/${post.slug}`}
                      className="block hover:text-accent transition-colors"
                    >
                      <h4 className="font-medium mb-1 line-clamp-2">{post.title}</h4>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(post.published_at), 'MMM dd')}
                        {post.blog_categories && (
                          <Badge variant="outline" className="text-xs">
                            {post.blog_categories.name}
                          </Badge>
                        )}
                      </div>
                    </Link>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Popular Posts */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Popular Posts
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {popularPosts.map((post) => (
                  <div key={post.id} className="border-b border-border last:border-0 pb-4 last:pb-0">
                    <Link 
                      to={`/blog/${post.slug}`}
                      className="block hover:text-accent transition-colors"
                    >
                      <h4 className="font-medium mb-1 line-clamp-2">{post.title}</h4>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <BookOpen className="h-3 w-3" />
                        {post.view_count} reads
                        {post.blog_categories && (
                          <Badge variant="outline" className="text-xs">
                            {post.blog_categories.name}
                          </Badge>
                        )}
                      </div>
                    </Link>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Blog;