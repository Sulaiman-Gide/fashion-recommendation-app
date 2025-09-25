import { supabase } from "./supabase";

export const getRecommendedProducts = async (userId: string, limit = 6) => {
  try {
    // 1. Get user's most viewed categories from user_activity
    const { data: userActivity } = await supabase
      .from("user_activity")
      .select("product_id")
      .eq("user_id", userId)
      .order("view_count", { ascending: false })
      .limit(10);

    if (!userActivity?.length) {
      // 3. If no activity, show trending products (by view_count)
      return getPopularProducts(limit);
    }

    // Get categories of viewed products
    const productIds = userActivity.map((item) => item.product_id);
    const { data: products } = await supabase
      .from("products")
      .select("id, category")
      .in("id", productIds);

    // Count category frequency
    const categoryCount: Record<string, number> = {};
    products?.forEach((p) => {
      categoryCount[p.category] = (categoryCount[p.category] || 0) + 1;
    });
    // Sort categories by frequency
    const sortedCategories = Object.keys(categoryCount).sort(
      (a, b) => categoryCount[b] - categoryCount[a]
    );

    // 2. Recommend products from those categories, sorted by popularity
    const { data: recommended } = await supabase
      .from("products")
      .select("*")
      .in("category", sortedCategories)
      .not("id", "in", productIds)
      .order("view_count", { ascending: false })
      .limit(limit);

    return recommended || [];
  } catch (error) {
    console.error("Error getting recommendations:", error);
    return getPopularProducts(limit);
  }
};

const getPopularProducts = async (limit: number) => {
  const { data } = await supabase
    .from("products")
    .select("*")
    .order("view_count", { ascending: false })
    .limit(limit);
  return data || [];
};
