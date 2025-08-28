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
    // Enhanced content formatting with proper styling
    return content
      .split('\n\n')
      .map((paragraph, index) => {
        // Handle headings
        if (paragraph.startsWith('## ')) {
          return (
            <h2 key={index} className="text-3xl font-bold text-foreground mt-12 mb-6 first:mt-0">
              {paragraph.slice(3)}
            </h2>
          );
        }
        if (paragraph.startsWith('### ')) {
          return (
            <h3 key={index} className="text-2xl font-semibold text-foreground mt-10 mb-4">
              {paragraph.slice(4)}
            </h3>
          );
        }
        
        // Handle blockquotes
        if (paragraph.startsWith('> ')) {
          return (
            <blockquote key={index} className="border-l-4 border-accent bg-accent/5 pl-6 py-4 my-8 italic text-lg text-muted-foreground rounded-r-lg">
              <p className="mb-0">{paragraph.slice(2)}</p>
            </blockquote>
          );
        }
        
        // Handle bullet lists
        if (paragraph.includes('\n- ')) {
          const items = paragraph.split('\n').filter(item => item.startsWith('- '));
          return (
            <ul key={index} className="list-none space-y-3 my-6 pl-0">
              {items.map((item, itemIndex) => (
                <li key={itemIndex} className="flex items-start">
                  <span className="flex-shrink-0 w-2 h-2 bg-accent rounded-full mt-3 mr-4"></span>
                  <span className="text-base leading-7">{item.slice(2)}</span>
                </li>
              ))}
            </ul>
          );
        }
        
        // Handle single bullet points
        if (paragraph.startsWith('- ')) {
          return (
            <div key={index} className="flex items-start my-4">
              <span className="flex-shrink-0 w-2 h-2 bg-accent rounded-full mt-3 mr-4"></span>
              <p className="text-base leading-7 mb-0">{paragraph.slice(2)}</p>
            </div>
          );
        }
        
        // Handle bold sections that are standalone (like policy framework headers)
        if (paragraph.startsWith('**') && paragraph.endsWith('**') && paragraph.indexOf('**', 2) === paragraph.length - 2) {
          return (
            <h4 key={index} className="text-xl font-semibold text-foreground mt-8 mb-4">
              {paragraph.slice(2, -2)}
            </h4>
          );
        }
        
        // Handle regular paragraphs with inline formatting
        const formatInlineText = (text: string) => {
          // Handle bold text
          text = text.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-foreground">$1</strong>');
          
          return { __html: text };
        };
        
        // Regular paragraphs
        if (paragraph.trim()) {
          return (
            <p 
              key={index} 
              className="text-base leading-8 mb-6 text-muted-foreground max-w-none"
              dangerouslySetInnerHTML={formatInlineText(paragraph)}
            />
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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Button asChild variant="ghost" size="lg" className="mb-8 hover:bg-accent/10">
          <Link to="/blog">
            <ArrowLeft className="mr-3 h-5 w-5" />
            Back to Insights
          </Link>
        </Button>

        {/* Featured Image */}
        {post.featured_image_url && (
          <div className="mb-12 relative overflow-hidden rounded-2xl shadow-2xl">
            <img
              src={post.featured_image_url}
              alt={post.title}
              className="w-full h-72 md:h-[28rem] object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
          </div>
        )}

        {/* Article Header */}
        <div className="max-w-4xl mx-auto mb-16">
          <div className="flex items-center gap-4 mb-8">
            {post.blog_categories && (
              <Badge variant="secondary" className="text-sm px-4 py-2 font-medium">
                {post.blog_categories.name}
              </Badge>
            )}
            <div className="flex items-center gap-2 text-accent">
              <Sparkles className="h-4 w-4" />
              <span className="text-sm font-medium">Expert Insight</span>
            </div>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-8 leading-tight">
            {post.title}
          </h1>
          
          <div className="flex flex-wrap items-center gap-6 text-muted-foreground mb-10 pb-8 border-b border-border/50">
            <div className="flex items-center bg-card/80 px-4 py-2 rounded-full backdrop-blur-sm">
              <User className="h-5 w-5 mr-3 text-accent" />
              <span className="font-medium text-foreground">{post.author_name}</span>
            </div>
            <div className="flex items-center bg-card/80 px-4 py-2 rounded-full backdrop-blur-sm">
              <Clock className="h-5 w-5 mr-3 text-accent" />
              <span className="font-medium text-foreground">8 min read</span>
            </div>
          </div>

          {post.excerpt && (
            <div className="relative">
              <div className="absolute -left-4 top-0 bottom-0 w-1 bg-gradient-to-b from-primary to-accent rounded-full"></div>
              <div className="bg-gradient-to-r from-accent/5 to-primary/5 p-8 rounded-2xl border border-border/50">
                <p className="text-xl text-muted-foreground leading-relaxed italic font-medium">
                  {post.excerpt}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Article Content */}
        <div className="max-w-4xl mx-auto mb-16">
          <article className="prose prose-xl prose-slate max-w-none prose-headings:text-foreground prose-p:text-muted-foreground prose-p:leading-8 prose-strong:text-foreground">
            {formatContent(post.content)}
          </article>
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