import { useMemo, useRef } from 'react';
import { ArrowRight, Calendar, Clock } from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Link } from 'react-router-dom';

import { APP_ROUTES } from '@/lib/siteRoutes';
import type { BlogPostContent, HomePageContent } from '@/types/content';

gsap.registerPlugin(ScrollTrigger);

interface BlogProps {
  content: HomePageContent;
  posts: BlogPostContent[];
}

const Blog = ({ content, posts }: BlogProps) => {
  const sectionRef = useRef<HTMLDivElement>(null);

  const sortedPosts = useMemo(() => {
    return [...posts].sort((a, b) => a.order - b.order);
  }, [posts]);

  const featuredPost = useMemo(() => {
    return sortedPosts.find((post) => post.featured) ?? sortedPosts[0];
  }, [sortedPosts]);

  const secondaryPosts = useMemo(() => {
    return featuredPost ? sortedPosts.filter((post) => post.seedKey !== featuredPost.seedKey) : [];
  }, [featuredPost, sortedPosts]);

  if (!featuredPost) {
    return null;
  }

  return (
    <section ref={sectionRef} id="blog" className="py-20 section-padding">
      <div className="mb-12">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-[2px] bg-[#d4a853]" />
          <span className="text-[#d4a853] text-sm tracking-[0.2em] uppercase font-medium">{content.blogLabel}</span>
        </div>
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white">
            {content.blogTitle} <span className="text-[#d4a853]">{content.blogTitleHighlight}</span>
          </h2>
          <Link to={APP_ROUTES.blog} className="inline-flex items-center gap-2 text-[#d4a853] hover:text-white transition-colors duration-300 group">
            <span className="text-sm font-medium">{content.blogViewAllLabel}</span>
            <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 stagger-container">
        <div className="lg:row-span-2 stagger-item group">
          <article className="relative h-full bg-[#1a1a1a] rounded-2xl overflow-hidden hover-lift">
            <div className="relative h-64 lg:h-80 overflow-hidden">
              <img src={featuredPost.image} alt={featuredPost.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" loading="lazy" decoding="async" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent" />
              <span className="absolute top-4 left-4 px-3 py-1 bg-[#d4a853] text-[#0a0a0a] text-xs font-bold rounded-full">{featuredPost.category}</span>
            </div>

            <div className="p-6">
              <div className="flex items-center gap-4 mb-4 text-[#888888] text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{featuredPost.dateLabel}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>{featuredPost.readTime}</span>
                </div>
              </div>

              <h3 className="text-xl lg:text-2xl font-bold text-white mb-3 group-hover:text-[#d4a853] transition-colors duration-300">
                {featuredPost.title}
              </h3>

              <p className="text-[#888888] leading-relaxed mb-6">{featuredPost.excerpt}</p>

              <Link to={APP_ROUTES.blog} className="inline-flex items-center gap-2 text-[#d4a853] font-medium group/link">
                <span>{content.blogReadMoreLabel}</span>
                <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover/link:translate-x-1" />
              </Link>
            </div>
          </article>
        </div>

        {secondaryPosts.map((post, index) => (
          <div key={post.seedKey} className="stagger-item group" style={{ animationDelay: `${(index + 1) * 100}ms` }}>
            <article className="flex flex-col sm:flex-row gap-4 bg-[#1a1a1a] rounded-2xl overflow-hidden hover-lift">
              <div className="relative sm:w-48 h-48 sm:h-auto overflow-hidden flex-shrink-0">
                <img src={post.image} alt={post.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" loading="lazy" decoding="async" />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#0a0a0a]/50 sm:bg-gradient-to-t" />
                <span className="absolute top-3 left-3 px-2 py-1 bg-[#d4a853]/90 text-[#0a0a0a] text-xs font-bold rounded-full">{post.category}</span>
              </div>

              <div className="flex-1 p-4 sm:py-4 sm:pr-4">
                <div className="flex items-center gap-3 mb-3 text-[#888888] text-xs">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>{post.dateLabel}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{post.readTime}</span>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-[#d4a853] transition-colors duration-300 line-clamp-2">{post.title}</h3>

                <p className="text-[#888888] text-sm leading-relaxed mb-4 line-clamp-2">{post.excerpt}</p>

                <Link to={APP_ROUTES.blog} className="inline-flex items-center gap-1 text-[#d4a853] text-sm font-medium group/link">
                  <span>{content.blogReadMoreLabel}</span>
                  <ArrowRight className="w-3 h-3 transition-transform duration-300 group-hover/link:translate-x-1" />
                </Link>
              </div>
            </article>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Blog;

