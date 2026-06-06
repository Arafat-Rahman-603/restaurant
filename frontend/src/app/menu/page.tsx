'use client';
import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import FoodCard from '@/components/menu/FoodCard';
import { FoodCardSkeleton } from '@/components/ui/Skeleton';
import { Food, Category } from '@/types';
import api from '@/lib/axios';
import { useDebounce } from '@/hooks/useDebounce';

const SORT_OPTIONS = [
  { value: 'createdAt_desc', label: 'Newest First' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'ratings_desc', label: 'Top Rated' },
];

function MenuContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [foods, setFoods] = useState<Food[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [sort, setSort] = useState('createdAt_desc');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const debouncedSearch = useDebounce(search, 400);

  useEffect(() => {
    api.get('/categories').then(res => setCategories(res.data.data)).catch(() => {});
  }, []);

  const fetchFoods = useCallback(async () => {
    setLoading(true);
    try {
      const [sortBy, order] = sort.split('_');
      const params = new URLSearchParams();
      if (debouncedSearch) params.set('search', debouncedSearch);
      if (selectedCategory) params.set('category', selectedCategory);
      params.set('sortBy', sortBy);
      params.set('order', order);
      params.set('page', page.toString());
      params.set('limit', '12');

      const res = await api.get(`/foods?${params.toString()}`);
      setFoods(res.data.data);
      setTotalPages(res.data.pagination?.pages || 1);
    } catch {
      setFoods([]);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, selectedCategory, sort, page]);

  useEffect(() => { fetchFoods(); }, [fetchFoods]);

  const clearFilters = () => {
    setSearch('');
    setSelectedCategory('');
    setSort('createdAt_desc');
    setPage(1);
  };

  const hasFilters = search || selectedCategory || sort !== 'createdAt_desc';

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-20">
        {/* Header */}
        <div className="bg-dark-100 border-b border-dark-400 py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <span className="text-primary-500 text-sm font-semibold uppercase tracking-wider mb-2 block">🍽️ Our Menu</span>
              <h1 className="text-4xl font-black text-white mb-2">Browse Our Menu</h1>
              <p className="text-gray-400">Find your favorite dishes from our premium selection.</p>
            </motion.div>

            {/* Search + Filters Bar */}
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  placeholder="Search for burgers, chicken, combos..."
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-dark-DEFAULT border border-dark-400 text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors"
                />
              </div>
              <select
                value={sort}
                onChange={(e) => { setSort(e.target.value); setPage(1); }}
                className="px-4 py-3.5 rounded-xl bg-dark-DEFAULT border border-dark-400 text-white focus:outline-none focus:border-primary-500 transition-colors"
              >
                {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              {hasFilters && (
                <button onClick={clearFilters} className="flex items-center gap-2 px-4 py-3.5 rounded-xl bg-dark-DEFAULT border border-dark-400 text-gray-400 hover:text-white hover:border-primary-500/50 transition-all">
                  <X className="w-4 h-4" /> Clear
                </button>
              )}
            </div>

            {/* Category Tabs */}
            <div className="flex gap-2 mt-4 overflow-x-auto pb-2 scrollbar-none">
              <button
                onClick={() => { setSelectedCategory(''); setPage(1); }}
                className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${!selectedCategory ? 'bg-primary-500 text-white' : 'bg-dark-DEFAULT border border-dark-400 text-gray-400 hover:border-primary-500/50'}`}
              >
                All
              </button>
              {categories.map((cat) => (
                <button
                  key={cat._id}
                  onClick={() => { setSelectedCategory(cat.slug); setPage(1); }}
                  className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${selectedCategory === cat.slug ? 'bg-primary-500 text-white' : 'bg-dark-DEFAULT border border-dark-400 text-gray-400 hover:border-primary-500/50'}`}
                >
                  {cat.icon} {cat.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Foods Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array(8).fill(0).map((_, i) => <FoodCardSkeleton key={i} />)}
            </div>
          ) : foods.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-6xl mb-4">🍽️</p>
              <h3 className="text-white text-xl font-bold mb-2">No items found</h3>
              <p className="text-gray-400 mb-6">Try adjusting your search or filters.</p>
              <button onClick={clearFilters} className="btn-primary px-6 py-3 rounded-xl font-semibold">
                Clear Filters
              </button>
            </div>
          ) : (
            <>
              <p className="text-gray-400 text-sm mb-6">{foods.length} items found</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {foods.map((food, i) => <FoodCard key={food._id} food={food} index={i} />)}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-12">
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setPage(i + 1)}
                      className={`w-10 h-10 rounded-xl font-semibold text-sm transition-all ${page === i + 1 ? 'bg-primary-500 text-white' : 'bg-dark-50 border border-dark-400 text-gray-400 hover:border-primary-500/50'}`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}

export default function MenuPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-dark-DEFAULT text-white flex items-center justify-center flex-col gap-4">
        <div className="w-12 h-12 rounded-full border-4 border-primary-500 border-t-transparent animate-spin"></div>
        <p className="text-gray-400 font-semibold animate-pulse">Loading Takeout Menu...</p>
      </div>
    }>
      <MenuContent />
    </Suspense>
  );
}
