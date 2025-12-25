# Manual Testing Guide - Blog Application

This guide provides a comprehensive checklist and step-by-step instructions for manually testing all functionality in the blog application.

## Prerequisites

Before testing, ensure:
- ✅ Supabase project is set up and running
- ✅ Database migration has been applied (`blog_posts` table exists)
- ✅ GraphQL is enabled in Supabase
- ✅ Environment variables are configured (`.env.local`)
- ✅ Application is running (`pnpm run dev`)
- ✅ You have at least one test user account

---

## 1. Authentication Testing

### 1.1 Email/Password Sign Up
**Steps:**
1. Navigate to `http://localhost:3000/auth/sign-up`
2. Enter a valid email address
3. Enter a password (minimum 6 characters)
4. Click "Sign Up"
5. Check your email for confirmation link (or check Supabase Inbucket if using local)
6. Click the confirmation link
7. Verify you're redirected to the home page

**Expected Result:** ✅ User account is created and you're logged in

### 1.2 Email/Password Sign In
**Steps:**
1. Navigate to `http://localhost:3000/auth/sign-in`
2. Enter your registered email and password
3. Click "Sign In"
4. Verify you're redirected to `/home`

**Expected Result:** ✅ Successfully logged in and redirected

### 1.3 Google OAuth
**Steps:**
1. Navigate to `http://localhost:3000/auth/sign-in`
2. Click "Sign in with Google" button
3. Complete Google OAuth flow
4. Verify you're redirected back to the application
5. Check that you're logged in

**Expected Result:** ✅ Successfully authenticated via Google OAuth

### 1.4 Email OTP (Passwordless)
**Steps:**
1. Navigate to `http://localhost:3000/auth/sign-in`
2. Look for "Sign in with OTP" or email OTP option
3. Enter your email address
4. Click "Send OTP"
5. Check your email (or Supabase Inbucket) for the OTP code
6. Enter the 6-digit OTP code
7. Click "Verify"
8. Verify you're logged in

**Expected Result:** ✅ Successfully authenticated via email OTP

### 1.5 Sign Out
**Steps:**
1. While logged in, click on your profile dropdown (top right)
2. Click "Sign Out" or "Logout"
3. Verify you're redirected to the sign-in page or homepage
4. Verify you can no longer access protected routes

**Expected Result:** ✅ Successfully logged out

---

## 2. Database & GraphQL Testing

### 2.1 Verify Database Schema
**Steps:**
1. Open Supabase Dashboard → Table Editor
2. Verify `blog_posts` table exists with columns:
   - `id` (UUID)
   - `title` (VARCHAR)
   - `body` (TEXT)
   - `author_id` (UUID)
   - `published_at` (TIMESTAMP)
   - `created_at` (TIMESTAMP)
   - `updated_at` (TIMESTAMP)
3. Verify RLS policies are enabled
4. Check that indexes exist on `published_at`, `author_id`, and `created_at`

**Expected Result:** ✅ Table structure matches migration

### 2.2 Test GraphQL Endpoint
**Steps:**
1. Open Supabase Dashboard → API → GraphQL
2. Try this introspection query:
   ```graphql
   query {
     __schema {
       types {
         name
       }
     }
   }
   ```
3. Verify `blog_posts` appears in the types list
4. Try a simple query:
   ```graphql
   query {
     blog_postsCollection(first: 5) {
       edges {
         node {
           id
           title
         }
       }
     }
   }
   ```

**Expected Result:** ✅ GraphQL queries return data successfully

---

## 3. Homepage Blog Posts List

### 3.1 View Homepage (No Posts)
**Steps:**
1. Navigate to `http://localhost:3000/`
2. Verify the page loads without errors
3. Check that "Blog" header is displayed
4. Verify "No blog posts found" message appears (if no posts exist)

**Expected Result:** ✅ Homepage loads with empty state

### 3.2 View Homepage (With Posts)
**Steps:**
1. Ensure you have at least one published blog post in the database
2. Navigate to `http://localhost:3000/`
3. Verify blog posts are displayed
4. For each post card, verify:
   - Title is displayed
   - Excerpt (first 200 characters) is shown
   - Author name is displayed
   - Published date is formatted correctly
   - Card is clickable

**Expected Result:** ✅ Posts are displayed correctly with all information

### 3.3 Pagination - First Page
**Steps:**
1. Ensure you have more than 5 blog posts
2. Navigate to `http://localhost:3000/`
3. Verify exactly 5 posts are displayed
4. Check pagination controls:
   - "Previous" button should be disabled/hidden
   - "Next" button should be visible
   - Page number shows "Page 1"

**Expected Result:** ✅ First page shows 5 posts, pagination works

### 3.4 Pagination - Next Page
**Steps:**
1. On homepage, click "Next" button
2. Verify URL changes to `/?page=2`
3. Verify different posts are displayed (posts 6-10)
4. Check pagination controls:
   - "Previous" button should be visible
   - "Next" button visibility depends on total posts
   - Page number shows "Page 2"

**Expected Result:** ✅ Second page loads correctly

### 3.5 Pagination - Previous Page
**Steps:**
1. On page 2, click "Previous" button
2. Verify URL changes to `/` or `/?page=1`
3. Verify you're back to the first page
4. Check that posts 1-5 are displayed again

**Expected Result:** ✅ Navigation back to first page works

### 3.6 Pagination - Direct URL
**Steps:**
1. Manually navigate to `http://localhost:3000/?page=2`
2. Verify page 2 loads correctly
3. Try `http://localhost:3000/?page=999` (non-existent page)
4. Verify it handles gracefully (shows empty state or first page)

**Expected Result:** ✅ URL-based pagination works

---

## 4. Post Details Page

### 4.1 View Post Details
**Steps:**
1. On homepage, click on any blog post card
2. Verify URL changes to `/blog/[post-id]`
3. Verify the post details page displays:
   - Full post title
   - Full post body (not truncated)
   - Author name
   - Published date
   - "Back to blog" link/button

**Expected Result:** ✅ Post details page displays all information correctly

### 4.2 Back to Blog Link
**Steps:**
1. On a post details page, click "Back to blog" button
2. Verify you're redirected to homepage (`/`)
3. Verify you're on page 1 (not the page you were on before)

**Expected Result:** ✅ Navigation back to homepage works

### 4.3 Invalid Post ID (404)
**Steps:**
1. Manually navigate to `http://localhost:3000/blog/invalid-id-12345`
2. Verify 404 page is displayed
3. Or verify "Post Not Found" message appears

**Expected Result:** ✅ Invalid post IDs show 404 or error message

### 4.4 Post Metadata (SEO)
**Steps:**
1. View a post details page
2. Right-click → "View Page Source" or use browser dev tools
3. Check `<title>` tag contains the post title
4. Check `<meta name="description">` contains post excerpt

**Expected Result:** ✅ SEO metadata is correctly set

---

## 5. Create Post Page

### 5.1 Access Create Post (Authenticated)
**Steps:**
1. Ensure you're logged in
2. Navigate to `http://localhost:3000/home/blog/create`
3. OR click "Create Post" in the navigation menu
4. Verify the create post form is displayed
5. Verify form has:
   - Title input field
   - Body textarea field
   - "Cancel" button
   - "Create Post" button

**Expected Result:** ✅ Create post page loads for authenticated users

### 5.2 Access Create Post (Unauthenticated)
**Steps:**
1. Sign out if logged in
2. Try to navigate to `http://localhost:3000/home/blog/create`
3. Verify you're redirected to sign-in page
4. OR verify an error message appears

**Expected Result:** ✅ Unauthenticated users cannot access create post page

### 5.3 Form Validation - Empty Fields
**Steps:**
1. Navigate to create post page (while logged in)
2. Leave both fields empty
3. Click "Create Post" button
4. Verify:
   - Button is disabled OR
   - Error messages appear: "Title is required" and "Body must be at least 10 characters"

**Expected Result:** ✅ Form validation prevents submission with empty fields

### 5.4 Form Validation - Title Too Long
**Steps:**
1. On create post page, enter a title longer than 255 characters
2. Try to submit
3. Verify error message: "Title must be 255 characters or less"

**Expected Result:** ✅ Title length validation works

### 5.5 Form Validation - Body Too Short
**Steps:**
1. Enter a valid title
2. Enter body text with less than 10 characters (e.g., "Short")
3. Try to submit
4. Verify error message: "Body must be at least 10 characters"

**Expected Result:** ✅ Body minimum length validation works

### 5.6 Form Validation - Body Too Long
**Steps:**
1. Enter a valid title
2. Enter body text longer than 10,000 characters
3. Try to submit
4. Verify error message: "Body must be 10,000 characters or less"

**Expected Result:** ✅ Body maximum length validation works

### 5.7 Create Post - Success
**Steps:**
1. Fill in the form with valid data:
   - Title: "Test Blog Post"
   - Body: "This is a test blog post with enough content to pass validation."
2. Click "Create Post"
3. Verify:
   - Loading state shows ("Creating..." on button)
   - Success toast notification appears
   - You're redirected to the new post's detail page
   - The new post displays correctly

**Expected Result:** ✅ Post is created and you're redirected to view it

### 5.8 Create Post - Verify in Database
**Steps:**
1. After creating a post, open Supabase Dashboard → Table Editor → `blog_posts`
2. Find the newly created post
3. Verify:
   - `title` matches what you entered
   - `body` matches what you entered
   - `author_id` matches your user ID
   - `published_at` is set (not null)
   - `created_at` and `updated_at` are set

**Expected Result:** ✅ Post is correctly saved in database

### 5.9 Create Post - Verify on Homepage
**Steps:**
1. After creating a post, navigate to homepage
2. Verify the new post appears in the list
3. Verify it appears at the top (most recent first)
4. Click on it to verify it opens correctly

**Expected Result:** ✅ New post appears on homepage immediately

### 5.10 Cancel Button
**Steps:**
1. On create post page, enter some text in the form
2. Click "Cancel" button
3. Verify you're navigated back (browser back or previous page)

**Expected Result:** ✅ Cancel button works correctly

---

## 6. Navigation Testing

### 6.1 Marketing Site Navigation
**Steps:**
1. Navigate to homepage (while logged out or logged in)
2. Check the header navigation
3. Verify "Blog" link is visible
4. Click "Blog" link
5. Verify it navigates to homepage (`/`)

**Expected Result:** ✅ Blog link in marketing navigation works

### 6.2 Authenticated Navigation
**Steps:**
1. Log in to the application
2. Navigate to `/home`
3. Check the sidebar or navigation menu
4. Verify "Create Post" link is visible
5. Click "Create Post"
6. Verify it navigates to `/home/blog/create`

**Expected Result:** ✅ Create Post link in authenticated navigation works

### 6.3 Profile Dropdown
**Steps:**
1. While logged in, click on your profile/avatar in the header
2. Verify dropdown menu appears with:
   - Your name/email
   - Profile settings link
   - Sign out option
   - Theme toggle (if enabled)
3. Click "Sign Out"
4. Verify you're logged out

**Expected Result:** ✅ Profile dropdown works correctly

---

## 7. Error Handling Testing

### 7.1 Network Error Simulation
**Steps:**
1. Open browser DevTools → Network tab
2. Set network throttling to "Offline"
3. Try to navigate to homepage
4. Verify error is handled gracefully (empty state or error message)
5. Set network back to "Online"
6. Refresh page
7. Verify posts load correctly

**Expected Result:** ✅ Network errors are handled gracefully

### 7.2 Invalid GraphQL Query
**Steps:**
1. Temporarily break a GraphQL query (in code)
2. Navigate to homepage
3. Verify error is caught and handled
4. Verify page doesn't crash
5. Restore the query

**Expected Result:** ✅ GraphQL errors don't crash the application

### 7.3 Empty State
**Steps:**
1. Ensure no blog posts exist in database (or use a filter)
2. Navigate to homepage
3. Verify "No blog posts found" message is displayed
4. Verify page doesn't show errors

**Expected Result:** ✅ Empty state is displayed correctly

### 7.4 Loading States
**Steps:**
1. Navigate to homepage
2. While page is loading, verify loading skeleton appears
3. After loading, verify skeleton is replaced with content

**Expected Result:** ✅ Loading states are displayed

### 7.5 Form Error Handling
**Steps:**
1. On create post page, try to submit with invalid data
2. Verify error messages appear inline
3. Fix the errors
4. Verify error messages disappear
5. Submit successfully

**Expected Result:** ✅ Form errors are displayed and cleared correctly

---

## 8. ISR (Incremental Static Regeneration) Testing

### 8.1 Verify Revalidation
**Steps:**
1. Create a new blog post
2. Note the current time
3. Navigate to homepage
4. Wait 60+ seconds
5. Create another new post
6. Refresh homepage
7. Verify the new post appears (may take up to 60 seconds due to ISR)

**Expected Result:** ✅ ISR revalidates pages every 60 seconds

### 8.2 Static Generation
**Steps:**
1. Build the application: `pnpm run build`
2. Check the build output
3. Verify first 10 posts are statically generated
4. Start the production server: `pnpm run start`
5. Navigate to a pre-rendered post
6. Verify it loads quickly (from static cache)

**Expected Result:** ✅ Posts are statically generated at build time

---

## 9. Author Information Testing

### 9.1 Verify Author Display
**Steps:**
1. Create a post while logged in as User A
2. View the post on homepage
3. Verify author name matches User A's account name
4. View the post details page
5. Verify author name is displayed correctly

**Expected Result:** ✅ Author information is correctly displayed

### 9.2 Multiple Authors
**Steps:**
1. Create a post as User A
2. Sign out and sign in as User B
3. Create another post
4. View homepage
5. Verify both posts show correct author names

**Expected Result:** ✅ Author information is correct for all posts

---

## 10. Edge Cases Testing

### 10.1 Very Long Post Title
**Steps:**
1. Try to create a post with title exactly 255 characters
2. Verify it's accepted
3. Try 256 characters
4. Verify it's rejected

**Expected Result:** ✅ Title length limit is enforced

### 10.2 Very Long Post Body
**Steps:**
1. Create a post with body exactly 10,000 characters
2. Verify it's accepted
3. Try 10,001 characters
4. Verify it's rejected

**Expected Result:** ✅ Body length limit is enforced

### 10.3 Special Characters in Post
**Steps:**
1. Create a post with special characters:
   - Title: "Test & <Special> Characters"
   - Body: "Line 1\nLine 2\nLine 3"
2. Verify post is created successfully
3. View the post
4. Verify special characters are displayed correctly
5. Verify line breaks are preserved

**Expected Result:** ✅ Special characters and formatting are handled correctly

### 10.4 Rapid Post Creation
**Steps:**
1. Create a post
2. Immediately create another post
3. Verify both posts are created
4. Verify both appear on homepage
5. Verify no duplicate posts

**Expected Result:** ✅ Rapid submissions are handled correctly

### 10.5 Browser Back/Forward
**Steps:**
1. Navigate to homepage
2. Click on a post
3. Click browser back button
4. Verify you return to homepage
5. Click browser forward button
6. Verify you return to the post

**Expected Result:** ✅ Browser navigation works correctly

---

## 11. Responsive Design Testing

### 11.1 Mobile View
**Steps:**
1. Open browser DevTools
2. Set device to mobile (e.g., iPhone 12)
3. Navigate through all pages:
   - Homepage
   - Post details
   - Create post
4. Verify:
   - Text is readable
   - Buttons are clickable
   - Navigation menu works
   - Forms are usable

**Expected Result:** ✅ Application is usable on mobile devices

### 11.2 Tablet View
**Steps:**
1. Set device to tablet (e.g., iPad)
2. Navigate through all pages
3. Verify layout adapts correctly

**Expected Result:** ✅ Application works on tablets

### 11.3 Desktop View
**Steps:**
1. Use full desktop view
2. Navigate through all pages
3. Verify layout is optimal

**Expected Result:** ✅ Application works on desktop

---

## 12. Performance Testing

### 12.1 Page Load Speed
**Steps:**
1. Open browser DevTools → Network tab
2. Clear cache
3. Navigate to homepage
4. Check load time
5. Verify it loads in reasonable time (< 2 seconds)

**Expected Result:** ✅ Pages load quickly

### 12.2 GraphQL Query Performance
**Steps:**
1. Create 20+ blog posts
2. Navigate to homepage
3. Check Network tab for GraphQL requests
4. Verify queries complete quickly
5. Verify only necessary data is fetched

**Expected Result:** ✅ GraphQL queries are efficient

---

## 13. Security Testing

### 13.1 RLS Policy - Public Read
**Steps:**
1. While logged out, try to view homepage
2. Verify published posts are visible
3. Try to access a post directly via URL
4. Verify you can view it

**Expected Result:** ✅ Public can read published posts

### 13.2 RLS Policy - Create Post
**Steps:**
1. While logged out, try to create a post via direct API call
2. Verify it's rejected (if possible to test)
3. While logged in, create a post
4. Verify it's created with your `author_id`

**Expected Result:** ✅ Only authenticated users can create posts

### 13.3 RLS Policy - Update/Delete
**Steps:**
1. Create a post as User A
2. Sign out and sign in as User B
3. Try to update User A's post (if update functionality exists)
4. Verify it's rejected
5. Try to delete User A's post (if delete functionality exists)
6. Verify it's rejected

**Expected Result:** ✅ Users can only modify their own posts

---

## 14. Integration Testing

### 14.1 Complete User Flow
**Steps:**
1. Sign up as a new user
2. Sign in
3. Navigate to homepage
4. View existing posts
5. Create a new post
6. Verify it appears on homepage
7. Click on your new post
8. Verify it displays correctly
9. Navigate back to homepage
10. Sign out

**Expected Result:** ✅ Complete user flow works end-to-end

### 14.2 Multiple Users Flow
**Steps:**
1. User A: Create a post
2. User B: Sign in and view homepage
3. Verify User A's post is visible
4. User B: Create a post
5. User A: View homepage
6. Verify both posts are visible with correct authors

**Expected Result:** ✅ Multiple users can interact correctly

---

## 15. Browser Compatibility Testing

### 15.1 Chrome
**Steps:**
1. Test all functionality in Chrome
2. Verify everything works

**Expected Result:** ✅ Works in Chrome

### 15.2 Firefox
**Steps:**
1. Test all functionality in Firefox
2. Verify everything works

**Expected Result:** ✅ Works in Firefox

### 15.3 Safari
**Steps:**
1. Test all functionality in Safari
2. Verify everything works

**Expected Result:** ✅ Works in Safari

### 15.4 Edge
**Steps:**
1. Test all functionality in Edge
2. Verify everything works

**Expected Result:** ✅ Works in Edge

---

## Quick Testing Checklist

Use this quick checklist for rapid testing:

- [ ] Sign up with email/password
- [ ] Sign in with email/password
- [ ] Sign in with Google OAuth
- [ ] Sign in with Email OTP
- [ ] View homepage (empty state)
- [ ] Create a blog post
- [ ] View homepage (with posts)
- [ ] Click on a post to view details
- [ ] Navigate back to homepage
- [ ] Test pagination (Next/Previous)
- [ ] Test form validation (empty fields, too long, too short)
- [ ] Create post successfully
- [ ] Verify post appears on homepage
- [ ] Test "Back to blog" link
- [ ] Test invalid post ID (404)
- [ ] Test navigation links
- [ ] Test profile dropdown
- [ ] Test sign out
- [ ] Test as unauthenticated user (cannot create posts)
- [ ] Test responsive design (mobile/tablet/desktop)
- [ ] Test error handling (network errors, empty states)

---

## Common Issues & Troubleshooting

### Issue: Posts not appearing on homepage
**Check:**
- Verify posts have `published_at` set (not null)
- Check RLS policies allow public read
- Verify GraphQL query is working in Supabase dashboard
- Check browser console for errors

### Issue: Cannot create post
**Check:**
- Verify you're logged in
- Check RLS policies allow authenticated insert
- Verify `author_id` matches your user ID
- Check browser console for errors
- Verify form validation passes

### Issue: Author name not showing
**Check:**
- Verify `accounts` table has matching user record
- Check that `author_id` in `blog_posts` matches `id` in `accounts`
- Verify the `enrichBlogPostsWithAuthors` function is working

### Issue: GraphQL errors
**Check:**
- Verify GraphQL is enabled in Supabase
- Check GraphQL endpoint URL is correct
- Verify environment variables are set
- Test query directly in Supabase GraphQL explorer

### Issue: Pagination not working
**Check:**
- Verify you have more than 5 posts
- Check URL parameters are being read correctly
- Verify pagination logic in `getBlogPostsServer`

---

## Testing Notes

- **Test Data**: Create at least 10-15 test posts to properly test pagination
- **Multiple Users**: Test with at least 2 different user accounts
- **Edge Cases**: Test with very long text, special characters, empty states
- **Error Scenarios**: Test with network offline, invalid data, etc.
- **Performance**: Monitor page load times and GraphQL query performance

---

## Success Criteria

All tests should pass with:
- ✅ No console errors
- ✅ No TypeScript errors
- ✅ All features work as expected
- ✅ Error handling is graceful
- ✅ User experience is smooth
- ✅ Performance is acceptable

---

**Last Updated:** [Current Date]
**Status:** Ready for Testing

