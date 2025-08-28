import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Calendar, User, BookOpen, ArrowLeft, Share2, Facebook, Twitter, Linkedin, Copy, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSEO } from "@/hooks/useSEO";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featured_image_url: string | null;
  author_name: string;
  published_at: string;
  view_count: number;
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
  published_at: string;
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
          published_at,
          view_count,
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

      // Increment view count
      await supabase
        .from('blog_posts')
        .update({ view_count: data.view_count + 1 })
        .eq('id', data.id);

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
              published_at,
              blog_categories (
                name,
                slug
              )
            `)
            .eq('is_published', true)
            .eq('category_id', categoryData.id)
            .neq('id', data.id)
            .order('published_at', { ascending: false })
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
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Button asChild variant="ghost" className="mb-6">
          <Link to="/blog">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Blog
          </Link>
        </Button>

        {/* Featured Image */}
        {post.featured_image_url && (
          <div className="mb-8">
            <img
              src={post.featured_image_url}
              alt={post.title}
              className="w-full h-64 md:h-96 object-cover rounded-lg shadow-lg"
            />
          </div>
        )}

        {/* Article Header */}
        <div className="max-w-4xl mx-auto mb-12">
          {post.blog_categories && (
            <Badge variant="secondary" className="mb-4 text-sm px-3 py-1">
              {post.blog_categories.name}
            </Badge>
          )}
          
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6 leading-tight">
            {post.title}
          </h1>
          
          <div className="flex flex-wrap items-center gap-6 text-muted-foreground mb-8 pb-8 border-b border-border">
            <div className="flex items-center">
              <User className="h-5 w-5 mr-2" />
              <span className="font-medium">{post.author_name}</span>
            </div>
            <div className="flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              <span>{format(new Date(post.published_at), 'MMMM dd, yyyy')}</span>
            </div>
            <div className="flex items-center">
              <BookOpen className="h-5 w-5 mr-2" />
              <span>{post.view_count} reads</span>
            </div>
            <div className="flex items-center bg-accent/10 px-3 py-1 rounded-full">
              <span className="text-sm font-medium text-accent">8 min read</span>
            </div>
          </div>

          {post.excerpt && (
            <div className="bg-muted/30 p-6 rounded-lg border-l-4 border-accent">
              <p className="text-lg text-muted-foreground leading-relaxed italic">
                {post.excerpt}
              </p>
            </div>
          )}
        </div>

        <Separator className="mb-8" />

        {/* Article Content */}
        <div className="max-w-4xl mx-auto">
          <article className="prose prose-lg prose-slate max-w-none">
            {formatContent(post.content)}
          </article>
        </div>

        <Separator className="my-12" />

        {/* Call to Action Section */}
        <div className="max-w-3xl mx-auto mb-12">
          <Card className="bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-2xl border-0">
            <CardContent className="p-8 text-center">
              <h3 className="text-2xl font-bold mb-4">Hire Smarter, Faster</h3>
              <p className="text-lg mb-6 opacity-95 max-w-2xl mx-auto">
                Partner with MyRecruita to access ready-to-hire talent and stay ahead of recruitment trends.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" variant="secondary" className="bg-white text-primary hover:bg-white/90">
                  <Link to="/contact">Talk to a Specialist</Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                  <Link to="/employers">View Our Services</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <Separator className="mb-8" />

        {/* Share Buttons */}
        <div className="mb-12">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Share2 className="h-5 w-5 mr-2" />
            Share this article
          </h3>
          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleShare('facebook')}
              className="flex items-center"
            >
              <Facebook className="h-4 w-4 mr-2" />
              Facebook
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleShare('twitter')}
              className="flex items-center"
            >
              <Twitter className="h-4 w-4 mr-2" />
              Twitter
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleShare('linkedin')}
              className="flex items-center"
            >
              <Linkedin className="h-4 w-4 mr-2" />
              LinkedIn
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleShare('copy')}
              className="flex items-center"
            >
              <Copy className="h-4 w-4 mr-2" />
              Copy Link
            </Button>
          </div>
        </div>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <div className="mb-12">
            <h3 className="text-2xl font-bold mb-6">Related Posts</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedPosts.map((relatedPost) => (
                <Card key={relatedPost.id} className="shadow-card hover:shadow-card-lg transition-all duration-300">
                  {relatedPost.featured_image_url && (
                    <div className="aspect-video overflow-hidden rounded-t-lg">
                      <img
                        src={relatedPost.featured_image_url}
                        alt={relatedPost.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2 mb-2">
                      {relatedPost.blog_categories && (
                        <Badge variant="outline" className="text-xs">
                          {relatedPost.blog_categories.name}
                        </Badge>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(relatedPost.published_at), 'MMM dd, yyyy')}
                      </span>
                    </div>
                    <CardTitle className="text-lg leading-tight">
                      <Link to={`/blog/${relatedPost.slug}`} className="hover:text-accent transition-colors">
                        {relatedPost.title}
                      </Link>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {relatedPost.excerpt}
                    </p>
                    <Button asChild variant="ghost" size="sm" className="p-0 h-auto">
                      <Link to={`/blog/${relatedPost.slug}`}>
                        Read More
                        <ArrowRight className="ml-2 h-3 w-3" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* CTA Section */}
        <Card className="bg-primary text-primary-foreground">
          <CardContent className="p-8 text-center">
            <h3 className="text-2xl font-bold mb-4">Ready to Take the Next Step?</h3>
            <p className="text-lg mb-6 opacity-90">
              Let our expert recruiters help you find your dream job or the perfect candidate.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" variant="secondary">
                <Link to="/submit-cv">Submit Your CV</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
                <Link to="/employers">Hire Talent</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BlogPost;