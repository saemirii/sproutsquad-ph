-- Replaces the 8-category taxonomy (several of which mashed two different
-- ideas into one "X & Y" label) with 7 general, single-concept categories:
-- Art & Creative, Fashion & Accessories, Food & Drinks, Lifestyle & Gifts,
-- Digital & Tech, Beauty & Self-Care, Education & Services.
--
-- This also fixes real mis-categorization already live in the data (e.g.
-- "Cornelia Cookies" tagged Crochet & Crafts despite being a cookie shop,
-- "Fuwari Friends" tagged Bakes & Treats despite selling crochet plush
-- toys) — a blanket old-category-name rename would have carried those
-- mistakes forward, so each business/product below is reassigned based on
-- what it actually is, not just its old label.
--
-- category is plain `text` on both tables (no CHECK constraint), so this is
-- a data migration, not a schema change.

-- Businesses (by id, so this is safe to re-run — a name match isn't needed)
update public.businesses set category = 'Food & Drinks' where id = 'biz-1788500006228'; -- Cornelia Cookies
update public.businesses set category = 'Food & Drinks' where id = 'biz-1788500381276'; -- Drinks by Soréli
update public.businesses set category = 'Art & Creative' where id = 'biz-1788496110001'; -- Fuwari Friends (crochet plush toys)
update public.businesses set category = 'Fashion & Accessories' where id = 'biz-1788583602746'; -- Totely (bags)
update public.businesses set category = 'Food & Drinks' where id = 'biz-1788582054070'; -- ThatCookie
update public.businesses set category = 'Fashion & Accessories' where id = 'biz-1788831088256'; -- Versíque

-- Products (Fuwari Friends' plushies are food-themed by name only — Santa
-- Paws, Pudding Bear, etc. are all crochet toys, not food)
update public.products set category = 'Fashion & Accessories' where name = 'Multi-wear top 1';
update public.products set category = 'Art & Creative' where name in ('S''mores Cat', 'Strawbunny Cake', 'Fourwari Pastry Box', 'Pudding Bear', 'Santa Paws');
update public.products set category = 'Fashion & Accessories' where name = 'Everly';
update public.products set category = 'Food & Drinks' where name in ('Moonbeam', 'Rosy', 'Macha Cookie Dream');

-- Fallback for any other row still on an old category name (covers rows
-- added after this migration was written, so this stays safe to re-run)
update public.businesses set category = 'Food & Drinks' where category = 'Bakes & Treats';
update public.businesses set category = 'Fashion & Accessories' where category = 'Thrift & Fashion';
update public.businesses set category = 'Art & Creative' where category in ('Crochet & Crafts', 'Art & Prints');
update public.businesses set category = 'Lifestyle & Gifts' where category in ('Stickers & Stationery', 'Eco & Planters');
update public.businesses set category = 'Digital & Tech' where category = 'Tech & Accessories';
update public.businesses set category = 'Education & Services' where category = 'School Supplies';

update public.products set category = 'Food & Drinks' where category = 'Bakes & Treats';
update public.products set category = 'Fashion & Accessories' where category = 'Thrift & Fashion';
update public.products set category = 'Art & Creative' where category in ('Crochet & Crafts', 'Art & Prints');
update public.products set category = 'Lifestyle & Gifts' where category in ('Stickers & Stationery', 'Eco & Planters');
update public.products set category = 'Digital & Tech' where category = 'Tech & Accessories';
update public.products set category = 'Education & Services' where category = 'School Supplies';

alter table public.businesses alter column category set default 'Lifestyle & Gifts';
alter table public.products alter column category set default 'Lifestyle & Gifts';
