import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { User, ArrowLeft, Share2, Facebook, Twitter, Linkedin, Copy, ArrowRight, Sparkles, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSEO } from "@/hooks/useSEO";
import { supabase } from "@/integrations/supabase/client";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featured_image_url: string | null;
  author_name: string;
  meta_title: string | null;
  meta_description: string | null;
  blog_categories: {
    name: string;
    slug: string;
  } | null;
}

interface RelatedPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  featured_image_url: string | null;
  blog_categories: {
    name: string;
    slug: string;
  } | null;
}

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [post, setPost] = useState<BlogPost | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<RelatedPost[]>([]);
  const [loading, setLoading] = useState(true);

  // Set default SEO
  useSEO({
    title: post?.meta_title || post?.title || "Blog Post | MyRecruita",
    description: post?.meta_description || post?.excerpt || "Read the latest career advice and industry insights from MyRecruita",
    canonical: `${window.location.origin}/blog/${slug}`
  });

  const fetchPost = async () => {
    if (!slug) return;

    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('blog_posts')
        .select(`
          id,
          title,
          slug,
          excerpt,
          content,
          featured_image_url,
          author_name,
          meta_title,
          meta_description,
          blog_categories (
            name,
            slug
          )
        `)
        .eq('slug', slug)
        .eq('is_published', true)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // Post not found
          navigate('/blog');
          return;
        }
        throw error;
      }

      setPost(data);

      // Fetch related posts
      if (data.blog_categories) {
        const { data: categoryData } = await supabase
          .from('blog_categories')
          .select('id')
          .eq('slug', data.blog_categories.slug)
          .single();
        
        if (categoryData) {
            const { data: relatedData } = await supabase
            .from('blog_posts')
            .select(`
              id,
              title,
              slug,
              excerpt,
              featured_image_url,
              blog_categories (
                name,
                slug
              )
            `)
            .eq('is_published', true)
            .eq('category_id', categoryData.id)
            .neq('id', data.id)
            .order('created_at', { ascending: false })
            .limit(3);

          if (relatedData) {
            setRelatedPosts(relatedData);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching post:', error);
      toast({
        title: "Error",
        description: "Failed to load blog post",
        variant: "destructive",
      });
      navigate('/blog');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPost();
  }, [slug]);

  const handleShare = async (platform: string) => {
    const url = window.location.href;
    const title = post?.title || '';
    
    const shareUrls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`
    };

    if (platform === 'copy') {
      try {
        await navigator.clipboard.writeText(url);
        toast({
          title: "Link copied!",
          description: "The blog post link has been copied to your clipboard.",
        });
      } catch (error) {
        toast({
          title: "Failed to copy",
          description: "Please try copying the link manually.",
          variant: "destructive",
        });
      }
    } else {
      window.open(shareUrls[platform as keyof typeof shareUrls], '_blank', 'width=600,height=400');
    }
  };

  const formatContent = (content: string) => {
    // Enhanced content formatting with modern webpage styling
    return content
      .split('\n\n')
      .map((paragraph, index) => {
        // Handle headings with modern styling
        if (paragraph.startsWith('## ')) {
          return (
            <div key={index} className="mt-16 mb-8 first:mt-0">
              <div className="relative">
                <div className="absolute -left-6 top-0 bottom-0 w-1 bg-gradient-to-b from-primary to-accent rounded-full opacity-60"></div>
                <h2 className="text-4xl md:text-5xl font-bold text-foreground leading-tight pl-8">
                  {paragraph.slice(3)}
                </h2>
              </div>
            </div>
          );
        }
        if (paragraph.startsWith('### ')) {
          return (
            <div key={index} className="mt-12 mb-6">
              <h3 className="text-2xl md:text-3xl font-bold text-foreground bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                {paragraph.slice(4)}
              </h3>
            </div>
          );
        }
        
        // Handle blockquotes with modern card styling
        if (paragraph.startsWith('> ')) {
          return (
            <div key={index} className="my-12">
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-accent/20 rounded-2xl blur opacity-75"></div>
                <blockquote className="relative bg-card/90 backdrop-blur-sm border-l-4 border-accent p-8 rounded-2xl shadow-lg">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-accent/20 rounded-full flex items-center justify-center">
                      <span className="text-accent font-bold text-sm">💡</span>
                    </div>
                    <p className="text-lg md:text-xl text-foreground font-semibold italic leading-relaxed mb-0">
                      {paragraph.slice(2)}
                    </p>
                  </div>
                </blockquote>
              </div>
            </div>
          );
        }
        
        // Handle bullet lists with modern styling
        if (paragraph.includes('\n- ')) {
          const items = paragraph.split('\n').filter(item => item.startsWith('- '));
          return (
            <div key={index} className="my-8">
              <div className="bg-card/50 backdrop-blur-sm rounded-2xl p-6 border border-border/30">
                <ul className="space-y-4">
                  {items.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-start group">
                      <div className="flex-shrink-0 w-6 h-6 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center mt-1 mr-4 group-hover:scale-110 transition-transform">
                        <span className="w-2 h-2 bg-white rounded-full"></span>
                      </div>
                      <span className="text-base md:text-lg leading-7 text-muted-foreground group-hover:text-foreground transition-colors">
                        {item.slice(2)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        }
        
        // Handle single bullet points
        if (paragraph.startsWith('- ')) {
          return (
            <div key={index} className="flex items-start my-6 group">
              <div className="flex-shrink-0 w-6 h-6 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center mt-1 mr-4 group-hover:scale-110 transition-transform">
                <span className="w-2 h-2 bg-white rounded-full"></span>
              </div>
              <p className="text-base md:text-lg leading-7 mb-0 text-muted-foreground group-hover:text-foreground transition-colors">
                {paragraph.slice(2)}
              </p>
            </div>
          );
        }
        
        // Handle bold sections as feature cards
        if (paragraph.startsWith('**') && paragraph.endsWith('**') && paragraph.indexOf('**', 2) === paragraph.length - 2) {
          return (
            <div key={index} className="my-10">
              <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-2xl p-6 border border-primary/20">
                <h4 className="text-xl md:text-2xl font-bold text-foreground flex items-center">
                  <span className="w-2 h-2 bg-accent rounded-full mr-3"></span>
                  {paragraph.slice(2, -2)}
                </h4>
              </div>
            </div>
          );
        }
        
        // Handle regular paragraphs with enhanced styling
        const formatInlineText = (text: string) => {
          // Handle bold text with accent styling
          text = text.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-foreground bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">$1</strong>');
          
          return { __html: text };
        };
        
        // Regular paragraphs with modern styling
        if (paragraph.trim()) {
          return (
            <div key={index} className="my-6">
              <p 
                className="text-base md:text-lg leading-8 text-muted-foreground hover:text-foreground transition-colors max-w-none"
                dangerouslySetInnerHTML={formatInlineText(paragraph)}
              />
            </div>
          );
        }
        
        return null;
      })
      .filter(Boolean);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded mb-4"></div>
            <div className="h-64 bg-muted rounded mb-8"></div>
            <div className="space-y-4">
              <div className="h-4 bg-muted rounded"></div>
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-accent/5 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23f0f0f0%22 fill-opacity=%220.05%22%3E%3Ccircle cx=%2230%22 cy=%2230%22 r=%221%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30"></div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Bar */}
        <nav className="flex items-center justify-between mb-12 bg-card/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-border/50">
          <Button asChild variant="ghost" size="lg" className="hover:bg-accent/10 transition-all duration-300">
            <Link to="/blog">
              <ArrowLeft className="mr-3 h-5 w-5" />
              Back to Insights
            </Link>
          </Button>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={() => handleShare('copy')} className="hover:bg-accent/10">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>
        </nav>

        {/* Hero Section */}
        <div className="mb-16">
          {post.featured_image_url && (
            <div className="mb-12 relative overflow-hidden rounded-3xl shadow-2xl group">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 z-10"></div>
              <img
                src={post.featured_image_url}
                alt={post.title}
                className="w-full h-80 md:h-[32rem] object-cover transform group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent z-20"></div>
              
              {/* Floating Category Badge */}
              <div className="absolute top-6 left-6 z-30">
                {post.blog_categories && (
                  <Badge className="bg-white/20 backdrop-blur-sm text-white border-white/30 text-sm px-4 py-2 font-medium">
                    {post.blog_categories.name}
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Article Header */}
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex items-center justify-center gap-4 mb-8">
              <div className="flex items-center gap-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                <Sparkles className="h-5 w-5 text-accent" />
                <span className="text-sm font-semibold">Expert Strategic Guide</span>
              </div>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-black text-foreground mb-8 leading-tight tracking-tight bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
              {post.title}
            </h1>
            
            <div className="flex flex-wrap items-center justify-center gap-8 text-muted-foreground mb-12">
              <div className="flex items-center bg-card/90 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg border border-border/50">
                <User className="h-5 w-5 mr-3 text-primary" />
                <span className="font-semibold text-foreground">{post.author_name}</span>
              </div>
              <div className="flex items-center bg-card/90 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg border border-border/50">
                <Clock className="h-5 w-5 mr-3 text-primary" />
                <span className="font-semibold text-foreground">Strategic Deep Dive</span>
              </div>
            </div>

            {post.excerpt && (
              <div className="relative max-w-3xl mx-auto">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary to-accent rounded-3xl blur opacity-25"></div>
                <div className="relative bg-card/95 backdrop-blur-sm p-10 rounded-3xl border border-border/50 shadow-2xl">
                  <div className="absolute top-4 left-4 text-6xl text-primary/20 font-serif">&quot;</div>
                  <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed font-medium italic pt-6">
                    {post.excerpt}
                  </p>
                  <div className="absolute bottom-4 right-4 text-6xl text-primary/20 font-serif rotate-180">&quot;</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Article Content */}
        <div className="max-w-4xl mx-auto mb-16">
          <div className="bg-card/30 backdrop-blur-sm rounded-3xl p-8 md:p-12 border border-border/30 shadow-xl">
            <article className="prose prose-xl prose-slate max-w-none prose-headings:text-foreground prose-p:text-muted-foreground prose-p:leading-8 prose-strong:text-foreground">
              {formatContent(post.content)}
            </article>
          </div>
        </div>

        {/* Call to Action Section */}
        <div className="max-w-4xl mx-auto mb-16">
          <Card className="border-0 shadow-2xl bg-gradient-to-br from-primary via-primary to-accent text-white overflow-hidden relative">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMiIgZmlsbD0iI2ZmZmZmZjEwIi8+Cjwvc3ZnPgo=')] opacity-20"></div>
            <CardContent className="p-12 text-center relative">
              <div className="mb-6">
                <Sparkles className="h-12 w-12 mx-auto text-white/80" />
              </div>
              <h3 className="text-3xl md:text-4xl font-bold mb-6">Transform Your Hiring Strategy</h3>
              <p className="text-xl mb-8 opacity-95 max-w-3xl mx-auto leading-relaxed">
                Ready to implement these insights? Partner with MyRecruita to access industry-leading talent and cutting-edge recruitment strategies.
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <Button asChild size="lg" className="bg-white text-primary hover:bg-white/95 text-lg px-8 py-4 h-auto">
                  <Link to="/contact">Start Your Journey</Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white/10 text-lg px-8 py-4 h-auto">
                  <Link to="/employers">Explore Services</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Share Buttons */}
        <div className="max-w-4xl mx-auto mb-16">
          <Card className="border-0 shadow-xl bg-card/50 backdrop-blur-sm">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold mb-6 flex items-center">
                <Share2 className="h-6 w-6 mr-3 text-accent" />
                Share This Insight
              </h3>
              <div className="flex flex-wrap gap-4">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => handleShare('facebook')}
                  className="flex items-center hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600"
                >
                  <Facebook className="h-5 w-5 mr-3" />
                  Facebook
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => handleShare('twitter')}
                  className="flex items-center hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600"
                >
                  <Twitter className="h-5 w-5 mr-3" />
                  Twitter
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => handleShare('linkedin')}
                  className="flex items-center hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600"
                >
                  <Linkedin className="h-5 w-5 mr-3" />
                  LinkedIn
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => handleShare('copy')}
                  className="flex items-center hover:bg-accent/10 hover:border-accent hover:text-accent"
                >
                  <Copy className="h-5 w-5 mr-3" />
                  Copy Link
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <div className="max-w-6xl mx-auto mb-16">
            <div className="text-center mb-12">
              <h3 className="text-3xl md:text-4xl font-bold mb-4">Continue Learning</h3>
              <p className="text-xl text-muted-foreground">Explore more expert insights and industry knowledge</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {relatedPosts.map((relatedPost) => (
                <Card key={relatedPost.id} className="border-0 shadow-xl hover:shadow-2xl transition-all duration-500 group overflow-hidden">
                  {relatedPost.featured_image_url && (
                    <div className="aspect-video overflow-hidden">
                      <img
                        src={relatedPost.featured_image_url}
                        alt={relatedPost.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                    </div>
                  )}
                  <CardHeader className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      {relatedPost.blog_categories && (
                        <Badge variant="secondary" className="text-xs font-medium">
                          {relatedPost.blog_categories.name}
                        </Badge>
                      )}
                      <div className="w-1 h-1 bg-accent rounded-full"></div>
                      <span className="text-xs text-accent font-medium">Related</span>
                    </div>
                    <CardTitle className="text-xl leading-tight mb-3">
                      <Link to={`/blog/${relatedPost.slug}`} className="hover:text-accent transition-colors">
                        {relatedPost.title}
                      </Link>
                    </CardTitle>
                    <p className="text-muted-foreground mb-4 line-clamp-3 leading-relaxed">
                      {relatedPost.excerpt}
                    </p>
                    <Button asChild variant="ghost" className="p-0 h-auto font-medium text-accent hover:bg-transparent">
                      <Link to={`/blog/${relatedPost.slug}`}>
                        Explore More
                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </Button>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Final CTA Section */}
        <div className="max-w-4xl mx-auto">
          <Card className="border-0 shadow-2xl bg-gradient-to-r from-accent to-primary text-white overflow-hidden relative">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMiIgZmlsbD0iI2ZmZmZmZjEwIi8+Cjwvc3ZnPgo=')] opacity-20"></div>
            <CardContent className="p-12 text-center relative">
              <h3 className="text-3xl md:text-4xl font-bold mb-6">Ready to Accelerate Your Success?</h3>
              <p className="text-xl mb-8 opacity-95 max-w-3xl mx-auto leading-relaxed">
                Whether you're seeking your next career opportunity or looking to hire exceptional talent, we're here to help you succeed.
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <Button asChild size="lg" className="bg-white text-primary hover:bg-white/95 text-lg px-8 py-4 h-auto">
                  <Link to="/submit-cv">Find Opportunities</Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white/10 text-lg px-8 py-4 h-auto">
                  <Link to="/employers">Hire Top Talent</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BlogPost;