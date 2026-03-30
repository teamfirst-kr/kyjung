-- ================================================
-- 빵맵 Supabase 데이터베이스 스키마
-- Supabase SQL Editor에서 순서대로 실행하세요
-- ================================================

-- 1. 사용자 프로필 테이블
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  name TEXT,
  role TEXT DEFAULT 'consumer' CHECK (role IN ('consumer', 'seller', 'admin')),
  avatar_url TEXT,
  bakery_id TEXT,
  provider TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 신규 유저 가입 시 자동으로 프로필 생성
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, name, avatar_url, provider)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', '이름 없음'),
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.raw_app_meta_data->>'provider'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE handle_new_user();

-- ================================================
-- 2. 빵집 테이블
-- ================================================
CREATE TABLE IF NOT EXISTS bakeries (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT DEFAULT 'independent' CHECK (type IN ('franchise', 'independent')),
  is_premium BOOLEAN DEFAULT false,
  is_registered BOOLEAN DEFAULT false,
  address TEXT,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  phone TEXT,
  open_time TEXT DEFAULT '08:00',
  close_time TEXT DEFAULT '21:00',
  rating DECIMAL(3,1) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  image_url TEXT,
  description TEXT,
  baking_schedule JSONB DEFAULT '[]',
  tags TEXT[] DEFAULT '{}',
  owner_id UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================
-- 3. 입점 신청 테이블
-- ================================================
CREATE TABLE IF NOT EXISTS bakery_registrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  owner_name TEXT,
  business_number TEXT,
  category TEXT,
  description TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reject_reason TEXT,
  applicant_id UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ
);

-- ================================================
-- 4. 메뉴 테이블
-- ================================================
CREATE TABLE IF NOT EXISTS menus (
  id TEXT PRIMARY KEY,
  bakery_id TEXT REFERENCES bakeries(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price INTEGER NOT NULL,
  description TEXT,
  category TEXT,
  image_emoji TEXT DEFAULT '🍞',
  image_url TEXT,
  is_popular BOOLEAN DEFAULT false,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================
-- 5. 주문 테이블
-- ================================================
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  bakery_id TEXT REFERENCES bakeries(id),
  items JSONB NOT NULL DEFAULT '[]',
  subtotal INTEGER NOT NULL,
  total INTEGER NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'ready', 'completed', 'cancelled')),
  pickup_time TEXT,
  memo TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================
-- 6. 리뷰 테이블
-- ================================================
CREATE TABLE IF NOT EXISTS reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  bakery_id TEXT REFERENCES bakeries(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id),
  user_name TEXT,
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  content TEXT,
  helpful INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================
-- 7. 커뮤니티 게시글 테이블
-- ================================================
CREATE TABLE IF NOT EXISTS community_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  author_name TEXT,
  author_avatar TEXT DEFAULT '🧑',
  category TEXT CHECK (category IN ('맛집추천', '빵레시피', '자유수다', '빵질문', '인증샷')),
  title TEXT NOT NULL,
  content TEXT,
  image_urls TEXT[] DEFAULT '{}',
  likes INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 게시글 좋아요 테이블
CREATE TABLE IF NOT EXISTS post_likes (
  post_id UUID REFERENCES community_posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id),
  PRIMARY KEY (post_id, user_id)
);

-- 좋아요 RPC 함수
CREATE OR REPLACE FUNCTION increment_post_likes(post_id UUID)
RETURNS void AS $$
  UPDATE community_posts SET likes = likes + 1 WHERE id = post_id;
$$ LANGUAGE sql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION decrement_post_likes(post_id UUID)
RETURNS void AS $$
  UPDATE community_posts SET likes = GREATEST(likes - 1, 0) WHERE id = post_id;
$$ LANGUAGE sql SECURITY DEFINER;

-- ================================================
-- 8. 광고 테이블
-- ================================================
CREATE TABLE IF NOT EXISTS ads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  link_url TEXT,
  type TEXT CHECK (type IN ('top', 'sidebar', 'product', 'popup', 'bottom')),
  advertiser TEXT,
  cost INTEGER DEFAULT 0,
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  frequency TEXT DEFAULT 'always',
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================
-- 9. Row Level Security (RLS) 설정
-- ================================================

-- profiles: 본인만 수정 가능, 모두 조회 가능
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "프로필 모두 조회" ON profiles FOR SELECT USING (true);
CREATE POLICY "프로필 본인 수정" ON profiles FOR UPDATE USING (auth.uid() = id);

-- bakeries: 모두 조회 가능, 관리자/판매자만 수정
ALTER TABLE bakeries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "빵집 모두 조회" ON bakeries FOR SELECT USING (true);
CREATE POLICY "빵집 소유자 수정" ON bakeries FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "빵집 소유자 삽입" ON bakeries FOR INSERT WITH CHECK (auth.uid() = owner_id);

-- menus: 모두 조회, 소유자만 수정
ALTER TABLE menus ENABLE ROW LEVEL SECURITY;
CREATE POLICY "메뉴 모두 조회" ON menus FOR SELECT USING (true);

-- orders: 본인 주문만 조회
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "주문 본인 조회" ON orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "주문 생성" ON orders FOR INSERT WITH CHECK (auth.uid() = user_id);

-- reviews: 모두 조회, 로그인 유저만 작성
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "리뷰 모두 조회" ON reviews FOR SELECT USING (true);
CREATE POLICY "리뷰 로그인 작성" ON reviews FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- community_posts: 모두 조회, 로그인 유저만 작성
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "게시글 모두 조회" ON community_posts FOR SELECT USING (true);
CREATE POLICY "게시글 로그인 작성" ON community_posts FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- post_likes
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "좋아요 모두 조회" ON post_likes FOR SELECT USING (true);
CREATE POLICY "좋아요 로그인" ON post_likes FOR ALL USING (auth.uid() = user_id);

-- ads: 모두 조회
ALTER TABLE ads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "광고 모두 조회" ON ads FOR SELECT USING (true);

-- ================================================
-- 10. 초기 샘플 데이터 삽입
-- ================================================
INSERT INTO bakeries (id, name, type, is_premium, is_registered, address, lat, lng, phone, rating, review_count, description, tags)
VALUES
  ('b1', '성심당 서울팝업', 'independent', true, true, '서울 용산구 한강대로 23길 55', 37.5296, 126.9642, '02-1234-5678', 4.9, 892, '대전 성심당의 서울 팝업스토어', ARRAY['튀김소보로', '판타롱부추빵', '케이크']),
  ('b2', '밀도', 'independent', true, true, '서울 종로구 북촌로 45', 37.5814, 126.9786, '02-2345-6789', 4.8, 342, '북촌 최고의 식사빵 전문점', ARRAY['바게트', '캉파뉴', '치아바타']),
  ('b3', '런던베이글뮤지엄', 'independent', false, true, '서울 종로구 북촌로 46', 37.5803, 126.9812, '02-3456-7890', 4.6, 1203, '줄서서 먹는 베이글 맛집', ARRAY['베이글', '크림치즈', '에브리띵']),
  ('b4', '태극당', 'independent', false, false, '서울 중구 동호로 24길 7', 37.5591, 127.0054, '02-4567-8901', 4.6, 567, '1946년 개업, 서울 최고령 제과점', ARRAY['모나카', '케이크', '생크림빵']),
  ('b5', '파리바게뜨 강남역점', 'franchise', false, true, '서울 강남구 강남대로 396', 37.4980, 127.0280, '02-5678-9012', 4.1, 234, '강남역 1번 출구 앞', ARRAY['식빵', '크로와상', '케이크'])
ON CONFLICT (id) DO NOTHING;
