import { Link } from 'react-router-dom'
import { posts } from '@/content/posts'

export default function Writing() {
  return (
    <div className="relative z-10 min-h-screen flex flex-col bg-white">
      <main className="flex-1">
        <div className="px-5 sm:px-8 pb-20 animate-fade-up" style={{ paddingTop: '5.75rem' }}>
          <section className="grid md:grid-cols-12 gap-10 md:gap-16 py-16 border-t border-black/10">
            <div className="md:col-span-5">
              <h2 className="text-[11px] font-mono uppercase tracking-[0.25em] text-black/35">
                Writing
              </h2>
            </div>
            <div className="md:col-span-7">
              <ul className="space-y-10">
                {posts.map((post) => (
                  <li key={post.slug}>
                    <Link to={`/writing/${post.slug}`} className="block group">
                      <h3 className="text-[20px] sm:text-[22px] font-medium tracking-tight leading-tight text-black group-hover:text-black/50 transition-colors duration-200">
                        {post.title}
                      </h3>
                      <p className="text-[14px] text-black/55 mt-2 leading-7">{post.excerpt}</p>
                      <p className="text-[12px] font-mono text-black/30 mt-3">
                        {post.date} · {post.readMin} min read
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}
