-- Products table
create table products (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  description text,
  price numeric(10,2) not null,
  images text[] not null,
  category text not null,
  sizes text[],
  colors text[],
  view_count integer default 0,
  purchase_count integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- User activity tracking
create table user_activity (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid not null,
  product_id uuid not null references products(id),
  last_viewed timestamp with time zone default timezone('utc'::text, now()) not null,
  view_count integer default 1,
  unique(user_id, product_id)
);

-- Create indexes for better performance
create index idx_user_activity_user_id on user_activity(user_id);
create index idx_user_activity_product_id on user_activity(product_id);
create index idx_products_category on products(category);
create index idx_products_popularity on products(view_count desc);