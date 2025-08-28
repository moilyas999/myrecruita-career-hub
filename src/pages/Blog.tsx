import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Search, User, ArrowRight, BookOpen, TrendingUp, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSEO } from "@/hooks/useSEO";
import { supabase } from "@/integrations/supabase/client";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  featured_image_url: string | null;
  author_name: string;
  blog_categories: {
    name: string;
    slug: string;
  } | null;
}

interface SidebarPost {
  id: string;
  title: string;
  slug: string;
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
          blog_categories (
            name,
            slug
          )
        `, { count: 'exact' })
        .eq('is_published', true)
        .order('created_at', { ascending: false });

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
          blog_categories (name, slug)
        `)
        .eq('is_published', true)
        .order('created_at', { ascending: false })
        .limit(5);

      if (recentData) {
        setRecentPosts(recentData);
      }

      // Fetch featured posts
      const { data: featuredData } = await supabase
        .from('blog_posts')
        .select(`
          id,
          title,
          slug,
          blog_categories (name, slug)
        `)
        .eq('is_published', true)
        .order('created_at', { ascending: false })
        .limit(5);

      if (featuredData) {
        setPopularPosts(featuredData);
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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-accent/10 text-accent px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Sparkles className="h-4 w-4" />
            Expert Insights & Industry Knowledge
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
            Recruitment <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Insights</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Discover expert guidance, market trends, and strategic insights to accelerate your career or transform your hiring process.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-12">
          <Card className="border-0 shadow-xl bg-card/50 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                  <Input
                    placeholder="Search insights and articles..."
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-12 h-12 text-base border-0 bg-background/80 focus:bg-background"
                  />
                </div>
                <Select value={selectedCategory} onValueChange={handleCategoryFilter}>
                  <SelectTrigger className="md:w-56 h-12 border-0 bg-background/80">
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
            </CardContent>
          </Card>
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
                <div className="grid gap-8 mb-12">
                  {posts.map((post) => (
                    <Card key={post.id} className="border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 bg-card/80 backdrop-blur-sm group overflow-hidden">
                      <div className="md:flex">
                        {post.featured_image_url && (
                          <div className="md:w-2/5 overflow-hidden">
                            <img
                              src={post.featured_image_url}
                              alt={post.title}
                              className="w-full h-64 md:h-full object-cover group-hover:scale-105 transition-transform duration-700"
                            />
                          </div>
                        )}
                        <div className={`${post.featured_image_url ? 'md:w-3/5' : 'w-full'} p-8`}>
                          <div className="flex items-center gap-3 mb-4">
                            {post.blog_categories && (
                              <Badge variant="secondary" className="px-3 py-1 text-xs font-medium">
                                {post.blog_categories.name}
                              </Badge>
                            )}
                            <div className="flex items-center text-sm text-muted-foreground">
                              <User className="h-4 w-4 mr-2" />
                              {post.author_name}
                            </div>
                          </div>
                          
                          <CardTitle className="mb-4 text-2xl leading-tight group-hover:text-accent transition-colors duration-300">
                            <Link to={`/blog/${post.slug}`} className="block">
                              {post.title}
                            </Link>
                          </CardTitle>
                          
                          <p className="text-muted-foreground mb-6 line-clamp-3 text-base leading-relaxed">
                            {post.excerpt}
                          </p>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-accent rounded-full"></div>
                              <span className="text-sm text-accent font-medium">Expert Insight</span>
                            </div>
                            
                            <Button asChild variant="ghost" size="lg" className="text-base font-medium group-hover:bg-accent/10 group-hover:text-accent">
                              <Link to={`/blog/${post.slug}`}>
                                Explore
                                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
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
          <div className="space-y-8">
            {/* Categories */}
            <Card className="border-0 shadow-xl bg-card/50 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-bold flex items-center">
                  <div className="w-2 h-2 bg-accent rounded-full mr-3"></div>
                  Explore Topics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant={!selectedCategory ? "default" : "ghost"}
                  size="lg"
                  onClick={() => handleCategoryFilter('all')}
                  className="w-full justify-start text-base h-12"
                >
                  All Insights
                </Button>
                {categories.map((category) => (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.slug ? "default" : "ghost"}
                    size="lg"
                    onClick={() => handleCategoryFilter(category.slug)}
                    className="w-full justify-start text-base h-12"
                  >
                    {category.name}
                  </Button>
                ))}
              </CardContent>
            </Card>

            {/* Recent Posts */}
            <Card className="border-0 shadow-xl bg-card/50 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-bold flex items-center">
                  <Sparkles className="h-5 w-5 mr-2 text-accent" />
                  Latest Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {recentPosts.map((post) => (
                  <div key={post.id} className="group">
                    <Link 
                      to={`/blog/${post.slug}`}
                      className="block space-y-2"
                    >
                      <h4 className="font-semibold text-base line-clamp-2 group-hover:text-accent transition-colors leading-tight">
                        {post.title}
                      </h4>
                      <div className="flex items-center gap-2">
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

            {/* Featured Posts */}
            <Card className="border-0 shadow-xl bg-gradient-to-br from-primary/5 to-accent/5">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-bold flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-primary" />
                  Featured Reads
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {popularPosts.map((post) => (
                  <div key={post.id} className="group">
                     <Link 
                      to={`/blog/${post.slug}`}
                      className="block space-y-2"
                    >
                      <h4 className="font-semibold text-base line-clamp-2 group-hover:text-primary transition-colors leading-tight">
                        {post.title}
                      </h4>
                      <div className="flex items-center gap-2">
                        {post.blog_categories && (
                          <Badge variant="outline" className="text-xs border-primary/20 text-primary">
                            {post.blog_categories.name}
                          </Badge>
                        )}
                        <div className="w-1 h-1 bg-primary/40 rounded-full"></div>
                        <span className="text-xs text-primary/60 font-medium">Must Read</span>
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