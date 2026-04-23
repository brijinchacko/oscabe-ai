import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Clock,
  User,
  Linkedin,
  Twitter,
  Mail,
  Link2,
} from "lucide-react";
import {
  getBlogBySlug,
  getRelatedPosts,
  getAllSlugs,
  type BlogCategory,
} from "@/lib/blog-data";

const CATEGORY_COLOURS: Record<BlogCategory, string> = {
  Automation: "border-[#4540DB]/40 bg-[#4540DB]/10 text-[#4540DB]",
  AI: "border-[#00D4FF]/40 bg-[#00D4FF]/10 text-[#00D4FF]",
  Careers: "border-[#22C55E]/40 bg-[#22C55E]/10 text-[#22C55E]",
  Industry: "border-[#8B5CF6]/40 bg-[#8B5CF6]/10 text-[#8B5CF6]",
};

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/* ---------- Static params for build-time generation ---------- */

export async function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

/* ---------- Dynamic metadata ---------- */

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogBySlug(slug);
  if (!post) return { title: "Blog Post Not Found" };

  const url = `https://oscabe.com/blog/${post.slug}`;
  return {
    title: post.metaTitle,
    description: post.metaDescription,
    keywords: post.keywords,
    authors: [{ name: post.author }],
    openGraph: {
      title: post.metaTitle,
      description: post.metaDescription,
      url,
      type: "article",
      publishedTime: post.date,
      authors: [post.author],
      siteName: "OSCABE",
      locale: "en_GB",
      images: [
        {
          url: post.image,
          width: 1200,
          height: 630,
          alt: post.imageAlt,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: post.metaTitle,
      description: post.metaDescription,
      images: [post.image],
    },
    alternates: {
      canonical: url,
    },
  };
}

/* ---------- Markdown-like content renderer ---------- */

function renderContent(content: string) {
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let currentParagraph: string[] = [];
  let inTable = false;
  let tableRows: string[][] = [];
  let tableHeaders: string[] = [];

  function flushParagraph() {
    if (currentParagraph.length > 0) {
      const text = currentParagraph.join(" ").trim();
      if (text) {
        elements.push(
          <p
            key={`p-${elements.length}`}
            className="text-base leading-relaxed text-gray-300"
          >
            {renderInlineMarkdown(text)}
          </p>
        );
      }
      currentParagraph = [];
    }
  }

  function flushTable() {
    if (tableHeaders.length > 0 && tableRows.length > 0) {
      elements.push(
        <div
          key={`table-${elements.length}`}
          className="overflow-x-auto rounded-xl border border-white/[0.08]"
        >
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.08] bg-white/[0.03]">
                {tableHeaders.map((header, i) => (
                  <th
                    key={i}
                    className="px-4 py-3 text-left font-semibold text-gray-200"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tableRows.map((row, ri) => (
                <tr
                  key={ri}
                  className="border-b border-white/[0.04] last:border-0"
                >
                  {row.map((cell, ci) => (
                    <td key={ci} className="px-4 py-3 text-gray-400">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }
    inTable = false;
    tableRows = [];
    tableHeaders = [];
  }

  function renderInlineMarkdown(text: string): React.ReactNode[] {
    const nodes: React.ReactNode[] = [];
    // Process bold, links, and inline code
    const regex =
      /\*\*(.+?)\*\*|\[(.+?)\]\((.+?)\)|`(.+?)`/g;
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(text)) !== null) {
      // Text before the match
      if (match.index > lastIndex) {
        nodes.push(text.slice(lastIndex, match.index));
      }
      if (match[1]) {
        // Bold
        nodes.push(
          <strong key={`b-${match.index}`} className="font-semibold text-white">
            {match[1]}
          </strong>
        );
      } else if (match[2] && match[3]) {
        // Link
        nodes.push(
          <Link
            key={`a-${match.index}`}
            href={match[3]}
            className="font-medium text-[#00D4FF] underline decoration-[#00D4FF]/30 underline-offset-2 transition-colors hover:text-white hover:decoration-white/40"
          >
            {match[2]}
          </Link>
        );
      } else if (match[4]) {
        // Inline code
        nodes.push(
          <code
            key={`c-${match.index}`}
            className="rounded bg-white/[0.06] px-1.5 py-0.5 font-mono text-[13px] text-[#00D4FF]"
          >
            {match[4]}
          </code>
        );
      }
      lastIndex = match.index + match[0].length;
    }
    if (lastIndex < text.length) {
      nodes.push(text.slice(lastIndex));
    }
    return nodes;
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Table row
    if (line.startsWith("|") && line.endsWith("|")) {
      flushParagraph();
      const cells = line
        .split("|")
        .slice(1, -1)
        .map((c) => c.trim());
      // Check if separator row
      if (cells.every((c) => /^[-:]+$/.test(c))) {
        continue;
      }
      if (!inTable) {
        inTable = true;
        tableHeaders = cells;
      } else {
        tableRows.push(cells);
      }
      continue;
    } else if (inTable) {
      flushTable();
    }

    // Heading ##
    if (line.startsWith("### ")) {
      flushParagraph();
      elements.push(
        <h3
          key={`h3-${elements.length}`}
          className="mt-8 mb-3 text-lg font-bold text-white"
        >
          {line.slice(4)}
        </h3>
      );
      continue;
    }
    if (line.startsWith("## ")) {
      flushParagraph();
      elements.push(
        <h2
          key={`h2-${elements.length}`}
          className="mt-10 mb-4 text-xl font-bold text-white sm:text-2xl"
        >
          {line.slice(3)}
        </h2>
      );
      continue;
    }

    // Unordered list item
    if (line.startsWith("- ")) {
      flushParagraph();
      elements.push(
        <li
          key={`li-${elements.length}`}
          className="ml-5 list-disc text-base leading-relaxed text-gray-300 marker:text-[#4540DB]"
        >
          {renderInlineMarkdown(line.slice(2))}
        </li>
      );
      continue;
    }

    // Empty line
    if (line.trim() === "") {
      flushParagraph();
      continue;
    }

    // Regular text
    currentParagraph.push(line);
  }

  flushParagraph();
  if (inTable) flushTable();

  return elements;
}

/* ---------- Page component ---------- */

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = getBlogBySlug(slug);

  if (!post) {
    notFound();
  }

  const relatedPosts = getRelatedPosts(post.relatedSlugs);
  const shareUrl = `https://oscabe.com/blog/${post.slug}`;
  const shareText = encodeURIComponent(post.title);

  // JSON-LD structured data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.metaDescription,
    image: post.image,
    datePublished: post.date,
    author: {
      "@type": "Person",
      name: post.author,
      jobTitle: post.authorTitle,
    },
    publisher: {
      "@type": "Organization",
      name: "OSCABE",
      url: "https://oscabe.com",
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": shareUrl,
    },
    keywords: post.keywords.join(", "),
  };

  return (
    <div className="bg-[#010118]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero image */}
      <div className="relative h-64 w-full sm:h-80 lg:h-96">
        <Image
          src={post.image}
          alt={post.imageAlt}
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#010118]/40 via-[#010118]/60 to-[#010118]" />
      </div>

      {/* Article */}
      <article className="relative mx-auto max-w-3xl px-4 pb-20 sm:px-6 lg:px-8">
        {/* Back link */}
        <Link
          href="/blog"
          className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-gray-400 transition-colors hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Blog
        </Link>

        {/* Category + meta */}
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <span
            className={`rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-wider ${CATEGORY_COLOURS[post.category]}`}
          >
            {post.category}
          </span>
          <span className="flex items-center gap-1.5 text-xs text-gray-500">
            <Calendar className="h-3.5 w-3.5" />
            {formatDate(post.date)}
          </span>
          <span className="flex items-center gap-1.5 text-xs text-gray-500">
            <Clock className="h-3.5 w-3.5" />
            {post.readTime}
          </span>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold leading-tight tracking-tight text-white sm:text-3xl lg:text-4xl">
          {post.title}
        </h1>

        {/* Author */}
        <div className="mt-6 flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#4540DB]/20">
            <User className="h-5 w-5 text-[#4540DB]" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">{post.author}</p>
            <p className="text-xs text-gray-500">{post.authorTitle}</p>
          </div>
        </div>

        {/* Share buttons */}
        <div className="mt-6 flex items-center gap-3">
          <span className="text-xs font-medium uppercase tracking-wider text-gray-500">
            Share
          </span>
          <a
            href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Share on LinkedIn"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.03] text-gray-400 transition-all hover:border-[#0077B5]/40 hover:bg-[#0077B5]/10 hover:text-[#0077B5]"
          >
            <Linkedin className="h-4 w-4" />
          </a>
          <a
            href={`https://twitter.com/intent/tweet?text=${shareText}&url=${encodeURIComponent(shareUrl)}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Share on X (Twitter)"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.03] text-gray-400 transition-all hover:border-white/20 hover:bg-white/10 hover:text-white"
          >
            <Twitter className="h-4 w-4" />
          </a>
          <a
            href={`mailto:?subject=${shareText}&body=${encodeURIComponent(shareUrl)}`}
            aria-label="Share via email"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.03] text-gray-400 transition-all hover:border-[#00D4FF]/40 hover:bg-[#00D4FF]/10 hover:text-[#00D4FF]"
          >
            <Mail className="h-4 w-4" />
          </a>
          <button
            type="button"
            aria-label="Copy link"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.03] text-gray-400 transition-all hover:border-[#8B5CF6]/40 hover:bg-[#8B5CF6]/10 hover:text-[#8B5CF6]"
            onClick={undefined}
          >
            <Link2 className="h-4 w-4" />
          </button>
        </div>

        {/* Divider */}
        <div
          className="my-8 h-[1px]"
          style={{
            background:
              "linear-gradient(90deg, transparent, #4540DB, transparent)",
          }}
        />

        {/* Content */}
        <div className="space-y-4">{renderContent(post.content)}</div>

        {/* Divider */}
        <div
          className="my-10 h-[1px]"
          style={{
            background:
              "linear-gradient(90deg, transparent, #00D4FF, transparent)",
          }}
        />

        {/* CTA */}
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-8 text-center backdrop-blur-sm">
          <h2 className="text-xl font-bold text-white sm:text-2xl">
            Ready to take the next step?
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm text-gray-400">
            Whether you are hiring or looking for your next role, OSCABE
            connects the best automation and AI talent with leading UK employers.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link
              href={post.ctaHref}
              className="inline-flex items-center gap-2 rounded-xl bg-[#4540DB] px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#4540DB]/25 transition-all hover:bg-[#4540DB]/90 hover:scale-105"
            >
              {post.ctaText}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-7 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/10"
            >
              Contact Us
            </Link>
          </div>
        </div>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-xl font-bold text-white">Related Articles</h2>
            <div className="mt-6 grid gap-6 sm:grid-cols-3">
              {relatedPosts.map((related) => (
                <Link
                  key={related.slug}
                  href={`/blog/${related.slug}`}
                  className="group flex flex-col overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.02] transition-all hover:border-white/[0.15] hover:bg-white/[0.04]"
                >
                  <div className="relative h-32 w-full overflow-hidden">
                    <Image
                      src={related.image}
                      alt={related.imageAlt}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 640px) 100vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#010118]/60 to-transparent" />
                  </div>
                  <div className="p-4">
                    <span
                      className={`rounded-full border px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider ${CATEGORY_COLOURS[related.category]}`}
                    >
                      {related.category}
                    </span>
                    <h3 className="mt-2 text-sm font-semibold leading-tight text-white transition-colors group-hover:text-[#00D4FF]">
                      {related.title}
                    </h3>
                    <span className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-[#4540DB]">
                      Read more
                      <ArrowRight className="h-3 w-3" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </article>
    </div>
  );
}
