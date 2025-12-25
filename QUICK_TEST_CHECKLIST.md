# Quick Testing Checklist

A condensed checklist for rapid testing of the blog application.

## Pre-Testing Setup
- [ ] Supabase project is running
- [ ] Database migration applied (`blog_posts` table exists)
- [ ] GraphQL enabled in Supabase
- [ ] Application running (`pnpm run dev`)
- [ ] At least 2 test user accounts created

---

## Core Functionality (Must Test)

### Authentication
- [ ] Email/password sign up works
- [ ] Email/password sign in works
- [ ] Google OAuth works
- [ ] Email OTP works
- [ ] Sign out works

### Blog Posts
- [ ] Homepage displays blog posts (or empty state)
- [ ] Post cards show: title, excerpt, author, date
- [ ] Clicking post opens details page
- [ ] Post details show: full title, full body, author, date
- [ ] "Back to blog" link works

### Pagination
- [ ] First page shows 5 posts
- [ ] "Next" button works
- [ ] "Previous" button works
- [ ] URL pagination works (`/?page=2`)

### Create Post
- [ ] Create post page requires authentication
- [ ] Form validation works (empty, too short, too long)
- [ ] Post creation succeeds
- [ ] Redirect to new post after creation
- [ ] New post appears on homepage

### Navigation
- [ ] "Blog" link in header works
- [ ] "Create Post" link in authenticated nav works
- [ ] Profile dropdown works
- [ ] All navigation links functional

---

## Error Handling (Should Test)

- [ ] Empty state displays correctly
- [ ] Invalid post ID shows 404
- [ ] Network errors handled gracefully
- [ ] Form errors display inline
- [ ] Loading states appear

---

## Edge Cases (Nice to Test)

- [ ] Very long titles (255 chars) work
- [ ] Very long bodies (10,000 chars) work
- [ ] Special characters in posts work
- [ ] Line breaks preserved in body
- [ ] Multiple authors display correctly
- [ ] Rapid post creation works

---

## Quick Test Script

1. **Sign up/Login** → Verify authentication works
2. **View Homepage** → Verify posts display (or empty state)
3. **Create Post** → Fill form, submit, verify success
4. **View New Post** → Click on post, verify details
5. **Test Pagination** → Navigate between pages
6. **Test Validation** → Try invalid form data
7. **Test Navigation** → Click all links
8. **Sign Out** → Verify logout works

**Time Estimate:** 15-20 minutes for core functionality

---

## Critical Path Test (5 minutes)

1. Login → Create Post → View Post → View Homepage → Logout

If this works, core functionality is operational!

