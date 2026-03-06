# Admin panel – manage everything

At **http://127.0.0.1:8080/admin** (or your deployed `/admin` URL), admins can manage the whole site. Design matches the rest of the website (same cards, tables, buttons).

## Sidebar sections (full manage: add, edit, delete where applicable)

| Section | What you can do |
|--------|------------------|
| **Dashboard** | Counts (mentors, bookings, questions) and quick links to all sections. |
| **Mentors** | Add / edit / delete mentor profiles, view public profile. |
| **Bookings** | Add / edit / delete session bookings (date, time, mentor, learner email, status, price, meeting link). |
| **Learners** | Edit profiles and switch roles between **learner** and **mentor** only. “Mentor” column shows who has a mentor profile (from DB). |
| **Questions** | **This is the line that connects admin with questions.** Add / edit / delete questions; change status (submitted, answered, closed). Link to Mentor Q&A to answer. Learners ask from mentor profile or Learner → My Questions; mentors answer in Mentor dashboard → Questions. To receive questions as admin, add an “Admin” mentor profile and share its Ask question link. |
| **Payments** | Session bookings: change status. Product purchases: change status, delete record. |
| **Subscriptions** | View push notification subscriptions; remove a subscription to revoke push for that device. |

## Permissions

- Only users with the **admin** role can open `/admin`. Others are redirected.
- The migration `20260222100002_admin_select_policies.sql` gives admins read access to `bookings`, `mentor_questions`, `product_purchases`, `push_subscriptions`, and `profiles` so the admin panel can load data.

## Creating an admin

See [CREATE_ADMIN_ACCOUNT.md](./CREATE_ADMIN_ACCOUNT.md) for how to set a user as admin (e.g. via `user_roles` and the SQL script).
