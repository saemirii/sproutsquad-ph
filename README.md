<p align="center">
  <img src="Your paragraph text (7).png" alt="SproutSquad - Plant, grow, and manage your student business." width="100%">
</p>

## 🌱 Inspiration

Ever thought of a great business idea but didn’t know where to start? This is the problem many students face in the Philippines, where entrepreneurship opens the door to income, survival, and self-empowerment—yet remains locked behind limited market access, operational challenges, and gaps in business knowledge. 

As two students tasked to run a business from start to finish as part of our high school curriculum, we experienced all the challenges that come with starting a business venture. We built from scratch—running marketing campaigns on social media, creating order forms, curating aesthetic websites, coordinating payments and deliveries, and tracking sales in complex spreadsheets. 

It was during this lengthy process that we noticed a gap in existing infrastructure and educational support provided to students nurturing an entrepreneurial spark. We thought: *if only there was a platform to guide us through this end-to-end process.*

So we did what any frustrated entrepreneur would do—we built it.

## 🌿 What It Does

An all-in-one marketplace for students to plant, grow, and sustain their own businesses, SproutSquad supports aspiring entrepreneurs through the end-to-end process of starting one’s very own business venture. 

From tracking orders to managing finances, this educational e-commerce app streamlines messy, separate business functions into an interactive, beginner-friendly platform. It offers three core features:

### 🌱 1. **Marketplace**

SproutSquad is home to an online marketplace where buyers and sellers meet. Eliminating the need for a separate website or order form, it gives startups visibility through the app’s catalog of registered shops and product listings. Customers can view student sellers’ social media pages and ratings and place orders as they would in any other e-commerce platform. Shops that are rapidly growing or are nominated by the community will earn a special feature in the SproutUp! showcase.

### 🪴 2. **Shop **

SproutSquad’s Shop dashboard translates numbers into readable, actionable metrics and automates the manual processes every budding entrepreneur runs into. By tracking sales and inventory and evaluating a shop’s business health score from financial metrics, it saves student sellers time and energy to focus on growing their startup instead of handling administrative work. Here, shop owners can collaborate with business partners, track incoming orders and expenses, and customize their shop profile for customers to see in the marketplace.

### 🌻 3. **SproutAcademy**

Perhaps the app’s most distinguishing feature versus other e-commerce apps, SproutAcademy is an interactive, gamified platform that teaches students how to grow their own businesses from scratch. Backed by credible sources, including the Philippine Department of Education (DepEd) curriculum, key lessons are delivered across eight modules featuring daily quests, short lessons, and real-world business simulations. With these educational resources, young entrepreneurs can learn the basics of business, from ideation and marketing to finance and funding.

## 🌳 How We Built It

We wanted SproutSquad to feel like one connected platform, rather than another collection of separate tools, so we built it using React, TypeScript, Vite, and Tailwind CSS, with Supabase handling our database, authentication, security, and real-time features. We then used Capacitor 8 to bring the web app to iOS, letting us use native Apple technologies such as StoreKit, while keeping most of our codebase shared. 

For the SproutSquad subscription system, we integrated RevenueCat through two SDKs: `@revenuecat/purchases-capacitor` for native iOS purchases and `@revenuecat/purchases-js` for Web Billing. Rather than hardcoding subscription plans into the app, we connected both our monthly Sprout+ and yearly Bloom+ plans to a single `sproutsquad_membership` entitlement. This lets the app check whether a user has an active membership, so all six premium tools—inventory tracking, pre-orders, coupons, bundles, order exports, and scheduled product drops—unlock the same way on either plan. Meanwhile, RevenueCat handles the actual purchase, renewal, and cancellation process.

We also wanted our subscription system to work reliably beyond the paywall itself. Thus, we connected RevenueCat to our Express/Netlify backend and Supabase through a secure webhook that processes subscription events and keeps our in-app subscription status and notifications updated. We use the user’s Supabase ID as their RevenueCat User ID so their subscription follows their account, while signing out resets the RevenueCat session to prevent another user from inheriting access. We also implemented live entitlement updates, Restore Purchases, subscription status tracking, and a server-side 30-day promotional entitlement for Shipaton judges, granted through RevenueCat's V2 API.

## 🌱 Challenges We Ran Into

### 🌿 1. **Condensing Multiple Features into One Cohesive App**

Since SproutSquad brings together a marketplace, seller management tools, an educational platform, and a discovery system, we had to be intentional about how we structured the experience. It had to feel like one cohesive app, not several unrelated features stitched together.

### 🌻 2. **Grounding Sprout Academy in Real Business Principles**

We had to ensure that the Sprout Academy curriculum had a real educational foundation backed by credible sources, balancing relevant learning with gamification. We curated lessons, simulations, and quizzes around practical business concepts while keeping the experience fun and engaging. 

### 🪴 3. **Making SproutSquad Work Across iOS, Web, and Supabase**

We also had to figure out how to make RevenueCat’s SDK fit naturally into our existing architecture, accounting for different purchasing systems across web and native iOS while keeping subscription access consistent. Testing the full purchase-to-entitlement flow helped us catch issues that weren’t visible during development.

### 🌱 4. **Deciding Which Features to Build, Simplify, or Remove**

As the project grew, we struggled to manage the app’s scope. We initially explored an AI business assistant that users could consult for business advice and guidance, but set it aside for now because it didn’t align with our current resources, funding, and direction we wanted to take. That decision pushed us to focus on features that deliver real value to student entrepreneurs instead, such as SproutUp!, which features student businesses based on their performance and potential. 

## 🌼 What We Learned

When it comes to educational content, we learned that building something fun and something educational are far from the same thing. Doing one doesn’t necessarily mean you’ve done the other. Early on, we relied on credible content based on the DepEd curriculum to design accurate, comprehensive, and understandable lessons, only to realize that accuracy doesn’t make learning worthwhile on its own. In building SproutAcademy, we had to treat gamification as not just a decoration but rather a core part of its design.

From a product design standpoint, the project taught us to make compromises between technical accuracy and usability. We started out wanting to faithfully represent each shop’s profit margins and expenses based on fundamental accounting principles, but eventually ran into the risk of overcomplicating the numbers and confusing student sellers—the exact opposite of what we set out to do. We learned that sometimes making a useful product means sacrificing 100% completeness for clarity.

Finally, integrating an online marketplace, a discovery system, seller tools, and a learning platform into one app taught us the skill of scope discipline. We pivoted from our idea of building an AI business assistant because it didn’t fit our current direction or resources. That decision freed us to focus on features like SproutUp! that deliver real value to entrepreneurs, and made the product better for it.

## 🌱 What’s Next

Our next step is to publish the app to the App Store so it can be used widely by aspiring student entrepreneurs beyond just the two of us. From there, we want to keep expanding SproutAcademy simulations and content (perhaps outside the Philippines), enhance the SproutUp! showcase as a real-time discovery engine for student startups, and explore partnerships with schools to help Filipino students going through the same Business Enterprise Simulation project we did. In the future, we may revisit our idea of an AI business assistant once SproutSquad gains the traction and resources to sustain it the way we want it to.
