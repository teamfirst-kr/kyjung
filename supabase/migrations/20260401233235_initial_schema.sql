-- ============================================================
-- 빵맵(BreadMap) Supabase 전체 DB 스키마
-- Supabase Dashboard > SQL Editor 에서 전체 복사 후 Run 실행
-- ============================================================

create extension if not exists "uuid-ossp";

-- ============================================================
-- 1. PROFILES — 회원 프로필 (auth.users 연동)
-- ============================================================
create table if not exists public.profiles (
  id            uuid        primary key references auth.users(id) on delete cascade,
  email         text        not null,
  name          text        not null default '',
  role          text        not null default 'consumer'
                check (role in ('consumer', 'seller', 'admin')),
  avatar_url    text,
  bakery_id     uuid,
  provider      text        check (provider in ('kakao', 'google', 'naver', 'email')),
  created_at    timestamptz not null default now()
);

-- 신규 가입 시 profiles 자동 생성
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, email, name, provider)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data->>'name', new.email, ''),
    coalesce(new.raw_user_meta_data->>'provider', 'email')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- 2. BAKERIES — 빵집 목록
-- ============================================================
create table if not exists public.bakeries (
  id               uuid          primary key default gen_random_uuid(),
  name             text          not null,
  type             text          not null default 'independent'
                   check (type in ('franchise', 'independent')),
  is_premium       boolean       not null default false,
  is_registered    boolean       not null default false,
  address          text          not null default '',
  lat              double precision,
  lng              double precision,
  phone            text          default '',
  open_time        text          default '08:00',
  close_time       text          default '20:00',
  closed_days      text[]        default '{}',
  rating           numeric(3,2)  default 0,
  review_count     integer       default 0,
  image_url        text          default '',
  description      text          default '',
  tags             text[]        default '{}',
  baking_schedule  jsonb         default '[]',
  owner_id         uuid          references public.profiles(id) on delete set null,
  created_at       timestamptz   not null default now(),
  updated_at       timestamptz   not null default now()
);

-- profiles.bakery_id → bakeries FK (테이블 생성 후 추가)
alter table public.profiles
  add constraint fk_profiles_bakery
  foreign key (bakery_id) references public.bakeries(id) on delete set null
  not valid;

-- ============================================================
-- 3. MENUS — 빵집 메뉴
-- ============================================================
create table if not exists public.menus (
  id           uuid        primary key default gen_random_uuid(),
  bakery_id    uuid        not null references public.bakeries(id) on delete cascade,
  category     text        not null default '기타',
  name         text        not null,
  description  text        default '',
  price        integer     not null default 0,
  emoji        text        default '🍞',
  is_popular   boolean     default false,
  is_available boolean     default true,
  sort_order   integer     default 0,
  created_at   timestamptz not null default now()
);

-- ============================================================
-- 4. BAKERY_REGISTRATIONS — 입점 신청
-- ============================================================
create table if not exists public.bakery_registrations (
  id              uuid        primary key default gen_random_uuid(),
  applicant_id    uuid        references public.profiles(id) on delete set null,
  name            text        not null,
  address         text        not null,
  phone           text        default '',
  owner_name      text        not null,
  business_number text        not null,
  category        text        default '',
  description     text        default '',
  open_time       text        default '',
  close_time      text        default '',
  closed_days     text[]      default '{}',
  facilities      text[]      default '{}',
  specialty_tags  text[]      default '{}',
  price_range     text        default '',
  photo_urls      text[]      default '{}',
  status          text        not null default 'pending'
                  check (status in ('pending', 'approved', 'rejected')),
  admin_memo      text        default '',
  created_at      timestamptz not null default now(),
  reviewed_at     timestamptz
);

-- ============================================================
-- 5. ORDERS — 주문
-- ============================================================
create table if not exists public.orders (
  id           uuid        primary key default gen_random_uuid(),
  user_id      uuid        not null references public.profiles(id) on delete cascade,
  bakery_id    uuid        not null references public.bakeries(id) on delete cascade,
  items        jsonb       not null default '[]',
  subtotal     integer     not null default 0,
  commission   integer     not null default 0,
  total        integer     not null default 0,
  status       text        not null default 'pending'
               check (status in ('pending', 'confirmed', 'ready', 'completed', 'cancelled')),
  pickup_time  text,
  memo         text        default '',
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- ============================================================
-- 6. PAYMENTS — 결제 기록
-- ============================================================
create table if not exists public.payments (
  id                  uuid        primary key default gen_random_uuid(),
  order_id            uuid        not null references public.orders(id) on delete cascade,
  user_id             uuid        not null references public.profiles(id) on delete cascade,
  portone_payment_id  text        unique,
  amount              integer     not null,
  status              text        not null default 'pending'
                      check (status in ('pending', 'paid', 'cancelled', 'failed')),
  pay_method          text        default '',
  easy_pay_provider   text        default '',
  is_demo             boolean     default false,
  paid_at             timestamptz,
  created_at          timestamptz not null default now()
);

-- ============================================================
-- 7. SETTLEMENTS — 판매자 정산
-- ============================================================
create table if not exists public.settlements (
  id           uuid        primary key default gen_random_uuid(),
  bakery_id    uuid        not null references public.bakeries(id) on delete cascade,
  order_id     uuid        not null references public.orders(id) on delete cascade,
  gross_amount integer     not null,
  commission   integer     not null,
  net_amount   integer     not null,
  status       text        not null default 'pending'
               check (status in ('pending', 'paid')),
  settled_at   timestamptz,
  created_at   timestamptz not null default now()
);

-- ============================================================
-- 8. REVIEWS — 리뷰
-- ============================================================
create table if not exists public.reviews (
  id          uuid        primary key default gen_random_uuid(),
  bakery_id   uuid        not null references public.bakeries(id) on delete cascade,
  user_id     uuid        not null references public.profiles(id) on delete cascade,
  rating      integer     not null check (rating between 1 and 5),
  content     text        not null,
  helpful     integer     default 0,
  created_at  timestamptz not null default now(),
  unique (bakery_id, user_id)
);

-- 리뷰 등록 시 bakeries.rating & review_count 자동 갱신
create or replace function public.update_bakery_rating()
returns trigger language plpgsql as $$
declare
  target_bakery_id uuid;
begin
  target_bakery_id := coalesce(new.bakery_id, old.bakery_id);
  update public.bakeries
  set
    rating       = (select round(avg(rating)::numeric, 2) from public.reviews where bakery_id = target_bakery_id),
    review_count = (select count(*) from public.reviews where bakery_id = target_bakery_id),
    updated_at   = now()
  where id = target_bakery_id;
  return coalesce(new, old);
end;
$$;

drop trigger if exists trg_update_bakery_rating on public.reviews;
create trigger trg_update_bakery_rating
  after insert or update or delete on public.reviews
  for each row execute procedure public.update_bakery_rating();

-- ============================================================
-- 9. SAVED_BAKERIES — 즐겨찾기
-- ============================================================
create table if not exists public.saved_bakeries (
  id          uuid        primary key default gen_random_uuid(),
  user_id     uuid        not null references public.profiles(id) on delete cascade,
  bakery_id   uuid        not null references public.bakeries(id) on delete cascade,
  memo        text        default '',
  created_at  timestamptz not null default now(),
  unique (user_id, bakery_id)
);

-- ============================================================
-- 10. COMMUNITY_POSTS — 커뮤니티 게시글
-- ============================================================
create table if not exists public.community_posts (
  id            uuid        primary key default gen_random_uuid(),
  user_id       uuid        not null references public.profiles(id) on delete cascade,
  author_name   text        not null default '',
  author_avatar text        default '',
  category      text        not null
                check (category in ('맛집추천', '빵레시피', '자유수다', '빵질문', '인증샷')),
  title         text        not null,
  content       text        not null,
  image_urls    text[]      default '{}',
  likes         integer     default 0,
  comment_count integer     default 0,
  created_at    timestamptz not null default now()
);

-- ============================================================
-- 11. POST_LIKES — 게시글 좋아요
-- ============================================================
create table if not exists public.post_likes (
  id         uuid        primary key default gen_random_uuid(),
  post_id    uuid        not null references public.community_posts(id) on delete cascade,
  user_id    uuid        not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (post_id, user_id)
);

create or replace function public.increment_post_likes(post_id uuid)
returns void language sql as $$
  update public.community_posts set likes = likes + 1 where id = post_id;
$$;

create or replace function public.decrement_post_likes(post_id uuid)
returns void language sql as $$
  update public.community_posts set likes = greatest(likes - 1, 0) where id = post_id;
$$;

-- ============================================================
-- 12. ADS — 광고 캠페인
-- ============================================================
create table if not exists public.ads (
  id           uuid        primary key default gen_random_uuid(),
  bakery_id    uuid        references public.bakeries(id) on delete cascade,
  type         text        not null
               check (type in ('top', 'sidebar', 'product', 'popup', 'bottom')),
  title        text        not null,
  description  text        default '',
  image_url    text        default '',
  link_url     text        default '',
  plan         text        not null check (plan in ('7days', '30days')),
  cost         integer     not null default 0,
  impressions  integer     default 0,
  clicks       integer     default 0,
  is_active    boolean     default true,
  start_date   date        not null default current_date,
  end_date     date        not null,
  created_at   timestamptz not null default now()
);

-- ============================================================
-- 인덱스
-- ============================================================
create index if not exists idx_bakeries_location   on public.bakeries (lat, lng);
create index if not exists idx_bakeries_registered on public.bakeries (is_registered);
create index if not exists idx_orders_user         on public.orders (user_id);
create index if not exists idx_orders_bakery       on public.orders (bakery_id);
create index if not exists idx_orders_status       on public.orders (status);
create index if not exists idx_reviews_bakery      on public.reviews (bakery_id);
create index if not exists idx_posts_category      on public.community_posts (category);
create index if not exists idx_posts_created       on public.community_posts (created_at desc);
create index if not exists idx_ads_active          on public.ads (is_active, end_date);
create index if not exists idx_saved_user          on public.saved_bakeries (user_id);

-- ============================================================
-- RLS (Row Level Security)
-- ============================================================
alter table public.profiles             enable row level security;
alter table public.bakeries             enable row level security;
alter table public.menus                enable row level security;
alter table public.bakery_registrations enable row level security;
alter table public.orders               enable row level security;
alter table public.payments             enable row level security;
alter table public.settlements          enable row level security;
alter table public.reviews              enable row level security;
alter table public.saved_bakeries       enable row level security;
alter table public.community_posts      enable row level security;
alter table public.post_likes           enable row level security;
alter table public.ads                  enable row level security;

-- profiles
create policy "프로필 본인 조회/수정" on public.profiles
  for all using (auth.uid() = id);

-- bakeries
create policy "빵집 전체 읽기" on public.bakeries
  for select using (true);
create policy "빵집 owner 수정" on public.bakeries
  for update using (auth.uid() = owner_id);

-- menus
create policy "메뉴 전체 읽기" on public.menus
  for select using (true);
create policy "메뉴 owner 관리" on public.menus
  for all using (
    exists (select 1 from public.bakeries where id = menus.bakery_id and owner_id = auth.uid())
  );

-- bakery_registrations
create policy "입점신청 본인 조회" on public.bakery_registrations
  for select using (applicant_id = auth.uid());
create policy "입점신청 생성" on public.bakery_registrations
  for insert with check (applicant_id = auth.uid());

-- orders
create policy "주문 조회 (소비자+판매자)" on public.orders
  for select using (
    user_id = auth.uid() or
    exists (select 1 from public.bakeries where id = orders.bakery_id and owner_id = auth.uid())
  );
create policy "주문 생성" on public.orders
  for insert with check (user_id = auth.uid());
create policy "주문 상태 변경 (판매자)" on public.orders
  for update using (
    exists (select 1 from public.bakeries where id = orders.bakery_id and owner_id = auth.uid())
  );

-- payments
create policy "결제 본인 조회" on public.payments
  for select using (user_id = auth.uid());
create policy "결제 생성" on public.payments
  for insert with check (user_id = auth.uid());

-- settlements
create policy "정산 owner 조회" on public.settlements
  for select using (
    exists (select 1 from public.bakeries where id = settlements.bakery_id and owner_id = auth.uid())
  );

-- reviews
create policy "리뷰 전체 읽기" on public.reviews
  for select using (true);
create policy "리뷰 본인 작성" on public.reviews
  for insert with check (user_id = auth.uid());
create policy "리뷰 본인 수정" on public.reviews
  for update using (user_id = auth.uid());

-- saved_bakeries
create policy "즐겨찾기 본인" on public.saved_bakeries
  for all using (user_id = auth.uid());

-- community_posts
create policy "게시글 전체 읽기" on public.community_posts
  for select using (true);
create policy "게시글 본인 작성" on public.community_posts
  for insert with check (user_id = auth.uid());
create policy "게시글 본인 수정" on public.community_posts
  for update using (user_id = auth.uid());

-- post_likes
create policy "좋아요 본인" on public.post_likes
  for all using (user_id = auth.uid());

-- ads
create policy "광고 전체 읽기" on public.ads
  for select using (true);
create policy "광고 owner 관리" on public.ads
  for all using (
    exists (select 1 from public.bakeries where id = ads.bakery_id and owner_id = auth.uid())
  );
